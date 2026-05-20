import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false
  }
};

function buffer(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function verifyStripeSignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;
  const parts = Object.fromEntries(signatureHeader.split(',').map((part) => {
    const [key, value] = part.split('=');
    return [key, value];
  }));
  const timestamp = parts.t;
  const expected = parts.v1;
  if (!timestamp || !expected) return false;

  const signedPayload = `${timestamp}.${rawBody.toString('utf8')}`;
  const digest = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');

  const a = Buffer.from(digest, 'hex');
  const b = Buffer.from(expected, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function supabaseRequest(path, options = {}) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server configuration missing');

  const response = await fetch(`${url}/rest/v1${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: options.prefer || 'return=representation',
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.message || text || response.statusText);
  return data;
}

async function insertRow(table, payload) {
  const data = await supabaseRequest(`/${table}`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return Array.isArray(data) ? data[0] : data;
}

async function updateRows(table, query, payload) {
  return supabaseRequest(`/${table}?${query}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

async function selectFirst(table, query) {
  const data = await supabaseRequest(`/${table}?${query}&limit=1`, {
    method: 'GET',
    prefer: 'return=representation'
  });
  return Array.isArray(data) ? data[0] : null;
}

function pricingForPlan(planName) {
  const normalised = String(planName || 'Starter').toLowerCase();
  if (normalised === 'growth') return { plan: 'Growth', setup_fee: 3000, monthly_fee: 1500 };
  return { plan: 'Starter', setup_fee: 1500, monthly_fee: 497 };
}

function tasksForPlan(planName) {
  const pricing = pricingForPlan(planName);
  const starter = [
    ['Confirm payment received', 'Payment'],
    ['Collect business details', 'Kickoff'],
    ['Collect services and service areas', 'Asset Collection'],
    ['Collect FAQs and pricing guidance', 'Asset Collection'],
    ['Build basic AI receptionist flow', 'Build'],
    ['Test 10 core call scenarios', 'Testing'],
    ['Client approval', 'Approval'],
    ['Go live', 'Go Live'],
    ['7-day review', 'Optimisation']
  ];
  const growth = [
    ['Collect CRM access', 'Integrations'],
    ['Collect calendar access', 'Integrations'],
    ['Configure SMS follow-up', 'Integrations'],
    ['Map booking workflow', 'Workflow Mapping'],
    ['Configure reporting categories', 'Build']
  ];
  const all = pricing.plan === 'Growth' ? [...starter, ...growth] : starter;
  return all.map(([task_name, task_phase]) => ({
    task_name,
    task_phase,
    required: true,
    completed: false,
    blocked: false,
    plan_scope: pricing.plan
  }));
}

async function createClientStackFromSession(session) {
  const metadata = session.metadata || {};
  const leadId = metadata.lead_id || null;
  const selectedPlan = metadata.selected_plan || 'Starter';
  const pricing = pricingForPlan(selectedPlan);

  let lead = null;
  if (leadId) {
    lead = await selectFirst('leads', `id=eq.${encodeURIComponent(leadId)}`);
  }

  const email = lead?.email || session.customer_details?.email || session.customer_email || metadata.email || null;
  const fullName = lead?.full_name || session.customer_details?.name || metadata.name || 'AssistantAI Client';
  const businessName = lead?.business_name || metadata.business_name || `${fullName}'s Business`;

  let client = email ? await selectFirst('clients', `email=ilike.${encodeURIComponent(email)}`) : null;
  if (!client) {
    client = await insertRow('clients', {
      full_name: fullName,
      business_name: businessName,
      email,
      mobile_number: lead?.mobile_number || null,
      industry: lead?.industry || null,
      website: lead?.website || null,
      main_service: lead?.service_needed || null,
      monthly_enquiry_volume: lead?.monthly_enquiry_volume || null,
      biggest_problem: lead?.current_call_handling || null,
      current_missed_call_handling: lead?.current_call_handling || null,
      ai_first_goal: lead?.service_needed || null,
      plan: pricing.plan,
      status: 'Onboarding',
      lifecycle_state: 'pre_live',
      progress_percentage: 0,
      source_lead_id: lead?.id || null,
      workflow_phase: 'Kickoff',
      next_action: 'Collect onboarding intake and assets'
    });
  }

  await insertRow('billing_status', {
    client_id: client.id,
    plan: pricing.plan,
    setup_fee: pricing.setup_fee,
    monthly_fee: pricing.monthly_fee,
    billing_status: 'active',
    setup_fee_paid: true,
    subscription_status: session.subscription ? 'active' : 'unknown',
    stripe_customer_id: session.customer || null,
    stripe_subscription_id: session.subscription || null,
    stripe_checkout_session_id: session.id,
    notes: 'Created by Stripe webhook checkout.session.completed'
  });

  await insertRow('intake_forms', {
    client_id: client.id,
    business_name: businessName,
    contact_name: fullName,
    email,
    phone: lead?.mobile_number || null,
    website: lead?.website || null,
    industry: lead?.industry || null,
    approval_status: 'draft'
  });

  await insertRow('integration_status', {
    client_id: client.id,
    integration_type: 'crm',
    integration_name: 'GoHighLevel',
    connection_status: 'planned',
    notes: 'Created by Stripe webhook'
  });

  await insertRow('client_notes', {
    client_id: client.id,
    note_type: 'system',
    content: `Payment completed via Stripe Checkout for ${pricing.plan} plan.`,
    created_by: 'stripe_webhook'
  });

  const tasks = tasksForPlan(pricing.plan);
  for (const task of tasks) {
    await insertRow('onboarding_tasks', { ...task, client_id: client.id });
  }

  await insertRow('notification_logs', {
    event_type: 'stripe_checkout_completed',
    entity_name: 'client',
    entity_id: client.id,
    client_id: client.id,
    recipient_role: 'admin',
    recipient_email: process.env.ADMIN_NOTIFICATION_EMAIL || null,
    channel: 'in_app',
    delivery_status: 'stored',
    provider_name: 'stripe_webhook',
    title: `New paid ${pricing.plan} client`,
    message: `${businessName} completed checkout and onboarding records were created.`,
    metadata: { checkout_session_id: session.id, lead_id: lead?.id || null }
  });

  if (lead?.id) {
    await updateRows('leads', `id=eq.${encodeURIComponent(lead.id)}`, {
      status: 'Won',
      payment_status: 'paid',
      client_id: client.id,
      stripe_customer_id: session.customer || null,
      stripe_subscription_id: session.subscription || null,
      payment_confirmed_at: new Date().toISOString()
    });
  }

  return { client, lead, tasks_created: tasks.length };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const rawBody = await buffer(req);
  const signature = req.headers['stripe-signature'];

  if (!verifyStripeSignature(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET)) {
    return res.status(400).json({ error: 'Invalid Stripe signature' });
  }

  const event = JSON.parse(rawBody.toString('utf8'));

  try {
    const existing = await selectFirst('stripe_event_logs', `stripe_event_id=eq.${encodeURIComponent(event.id)}`);
    if (existing) return res.status(200).json({ received: true, duplicate: true });

    const session = event.data?.object || {};
    const eventLog = await insertRow('stripe_event_logs', {
      stripe_event_id: event.id,
      event_type: event.type,
      checkout_session_id: session.id || null,
      lead_id: session.metadata?.lead_id || null,
      processing_status: 'event_received',
      processing_started_at: new Date().toISOString(),
      status: 'processing'
    });

    let result = { ignored: true };
    if (event.type === 'checkout.session.completed') {
      result = await createClientStackFromSession(session);
    }

    await updateRows('stripe_event_logs', `id=eq.${encodeURIComponent(eventLog.id)}`, {
      processing_status: 'completed',
      processing_completed_at: new Date().toISOString(),
      processed_at: new Date().toISOString(),
      status: 'completed',
      related_client_id: result.client?.id || null,
      business_result: result
    });

    return res.status(200).json({ received: true, result });
  } catch (error) {
    try {
      await insertRow('notification_logs', {
        event_type: 'stripe_webhook_error',
        entity_name: 'stripe_event',
        entity_id: event.id || 'unknown',
        recipient_role: 'admin',
        recipient_email: process.env.ADMIN_NOTIFICATION_EMAIL || null,
        channel: 'in_app',
        delivery_status: 'stored',
        provider_name: 'stripe_webhook',
        title: 'Stripe webhook error',
        message: error.message,
        metadata: { event_id: event.id || null, event_type: event.type || null }
      });
    } catch (_notificationError) {}

    return res.status(500).json({ error: 'Stripe webhook processing failed', details: error.message });
  }
}
