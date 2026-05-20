function parseArgs(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch (_error) {
    return {};
  }
}

function siteBaseUrl(req) {
  const configured = process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (configured) {
    return configured.startsWith('http') ? configured : `https://${configured}`;
  }
  const host = req?.headers?.['x-forwarded-host'] || req?.headers?.host || 'www.assistantai.com.au';
  const proto = req?.headers?.['x-forwarded-proto'] || 'https';
  return `${proto}://${host}`;
}

async function createLead(args) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Server database configuration missing');
  }

  const fullName = String(args.full_name || args.name || '').trim();
  const email = String(args.email || '').trim();
  const phone = String(args.mobile_number || args.phone || '').trim();

  if (!fullName || (!email && !phone)) {
    throw new Error('Name and either email or phone are required');
  }

  const leadPayload = {
    full_name: fullName,
    business_name: args.business_name || null,
    email: email || null,
    mobile_number: phone || null,
    industry: args.industry || null,
    website: args.website || null,
    service_needed: args.service_needed || args.problem_to_solve || null,
    urgency: args.urgency || 'normal',
    enquiry_type: 'vapi_demo',
    monthly_enquiry_volume: args.monthly_enquiry_volume || null,
    current_call_handling: args.current_call_handling || null,
    crm_used_now: args.crm_used_now || null,
    calendar_used_now: args.calendar_used_now || null,
    wants_booking: Boolean(args.wants_booking),
    wants_crm_sync: Boolean(args.wants_crm_sync),
    wants_sms_followup: Boolean(args.wants_sms_followup),
    wants_email_followup: Boolean(args.wants_email_followup),
    conversation_summary: args.conversation_summary || null,
    likely_plan_fit: args.likely_plan_fit || args.selected_plan || null,
    selected_plan: args.selected_plan || null,
    buyer_intent: args.buyer_intent || 'qualified_by_voice_demo',
    lead_source: args.lead_source || 'Vapi website demo',
    source_page: args.source_page || '/voice-demo',
    message: args.message || args.conversation_summary || null,
    status: args.status || 'Qualified Lead',
    payment_status: 'not_started',
    notes: args.notes || null,
    next_action: args.next_action || 'Review Vapi-qualified lead'
  };

  const response = await fetch(`${url}/rest/v1/leads`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify(leadPayload)
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(data?.message || 'Lead creation failed');
  }
  return Array.isArray(data) ? data[0] : data;
}

async function createCheckout(args, req) {
  const plan = String(args.selected_plan || args.plan || '').trim();
  if (!['Starter', 'Growth'].includes(plan)) {
    return {
      success: false,
      checkout_available: false,
      status: 'review_required',
      next_step: 'Enterprise or custom setups require review. Capture the details and tell the caller the team will follow up.'
    };
  }

  let leadId = String(args.lead_id || '').trim();
  let lead = null;

  if (!leadId) {
    lead = await createLead({
      ...args,
      selected_plan: plan,
      likely_plan_fit: plan,
      buyer_intent: args.buyer_intent || 'ready_to_proceed',
      status: 'Payment Pending'
    });
    leadId = lead.id;
  }

  const checkoutResponse = await fetch(`${siteBaseUrl(req)}/api/stripe-checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lead_id: leadId,
      selected_plan: plan,
      full_name: args.full_name || args.name,
      business_name: args.business_name,
      email: args.email
    })
  });

  const checkout = await checkoutResponse.json();
  if (!checkoutResponse.ok || !checkout.success) {
    throw new Error(checkout?.error || checkout?.message || 'Checkout creation failed');
  }

  return {
    success: true,
    checkout_available: true,
    lead_id: leadId,
    checkout_url: checkout.checkout_url,
    session_id: checkout.session_id,
    selected_plan: checkout.selected_plan,
    next_step: 'Secure checkout link created. Give the caller the link or tell them it has been sent/created, depending on channel capability.'
  };
}

async function handleToolCall(toolCall, req) {
  const name = toolCall?.function?.name || '';
  const args = parseArgs(toolCall?.function?.arguments);

  if (name === 'create_ai_qualified_lead' || name === 'capture_qualified_lead') {
    const lead = await createLead(args);
    return {
      success: true,
      lead_id: lead.id,
      status: lead.status,
      next_step: 'Lead captured. Tell the caller the team has the details and will follow up, or offer checkout if the buyer is ready.'
    };
  }

  if (name === 'create_checkout_for_qualified_lead') {
    return await createCheckout(args, req);
  }

  return {
    success: false,
    status: 'unknown_tool',
    next_step: `Unsupported tool: ${name}`
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const expectedSecret = process.env.VAPI_WEBHOOK_SECRET;
    if (expectedSecret) {
      const providedSecret = req.headers['x-webhook-secret'] || req.query?.vapi_token;
      if (providedSecret !== expectedSecret) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const message = body.message || {};
    const calls = message.toolCallList || body.toolCallList || [];

    if (!Array.isArray(calls) || calls.length === 0) {
      return res.status(200).json({ results: [] });
    }

    const results = [];
    for (const toolCall of calls) {
      try {
        const result = await handleToolCall(toolCall, req);
        results.push({ toolCallId: toolCall.id, result });
      } catch (error) {
        results.push({
          toolCallId: toolCall.id,
          result: {
            success: false,
            error: error.message,
            next_step: 'Tell the caller we captured the enquiry context and a team member will follow up.'
          }
        });
      }
    }

    return res.status(200).json({ results });
  } catch (error) {
    return res.status(500).json({ error: 'Vapi tool-call handler failed', details: error.message });
  }
}
