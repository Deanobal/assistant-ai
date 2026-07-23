import { requireAdmin } from './_native-auth.js';

async function insertRow(url, key, table, payload) {
  const response = await fetch(`${url}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`${table} insert failed: ${data?.message || text || response.statusText}`);
  }
  return Array.isArray(data) ? data[0] : data;
}

function pricingForPlan(planName) {
  const normalised = String(planName || 'Starter').toLowerCase();
  if (normalised === 'growth') return { plan: 'Growth', setup_fee: 3000, monthly_fee: 1500 };
  if (normalised === 'enterprise') return { plan: 'Enterprise', setup_fee: 7500, monthly_fee: 3000 };
  return { plan: 'Starter', setup_fee: 1500, monthly_fee: 497 };
}

function tasksForPlan(planName) {
  const plan = pricingForPlan(planName).plan;
  const starterTasks = [
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
  const growthTasks = [
    ['Collect CRM access', 'Integrations'],
    ['Collect calendar access', 'Integrations'],
    ['Configure SMS follow-up', 'Integrations'],
    ['Map booking workflow', 'Workflow Mapping'],
    ['Configure reporting categories', 'Build']
  ];
  const enterpriseTasks = [
    ['Map multi-location routing', 'Workflow Mapping'],
    ['Security and compliance review', 'Approval'],
    ['Advanced escalation rules', 'Workflow Mapping']
  ];

  const all = plan === 'Enterprise'
    ? [...starterTasks, ...growthTasks, ...enterpriseTasks]
    : plan === 'Growth'
      ? [...starterTasks, ...growthTasks]
      : starterTasks;

  return all.map(([task_name, task_phase]) => ({
    task_name,
    task_phase,
    required: true,
    completed: false,
    blocked: false,
    plan_scope: plan
  }));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!requireAdmin(req, res)) return;

  try {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return res.status(500).json({ error: 'Server database configuration missing' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const fullName = String(body.full_name || '').trim();
    const businessName = String(body.business_name || '').trim();
    const email = String(body.email || '').trim();
    const phone = String(body.mobile_number || body.phone || '').trim();
    const pricing = pricingForPlan(body.plan || body.selected_plan);

    if (!fullName || !businessName || !email) {
      return res.status(400).json({ error: 'Full name, business name and email are required' });
    }

    const lead = await insertRow(url, key, 'leads', {
      full_name: fullName,
      business_name: businessName,
      email,
      mobile_number: phone || null,
      industry: body.industry || null,
      website: body.website || null,
      service_needed: body.service_needed || body.main_service || null,
      enquiry_type: 'manual_onboarding',
      lead_source: body.lead_source || 'manual_onboarding_start',
      source_page: body.source_page || '/admin/onboarding',
      selected_plan: pricing.plan,
      likely_plan_fit: pricing.plan,
      buyer_intent: 'won_client',
      status: 'Won',
      payment_status: body.payment_status || 'manual_or_pending'
    });

    const client = await insertRow(url, key, 'clients', {
      full_name: fullName,
      business_name: businessName,
      email,
      mobile_number: phone || null,
      industry: body.industry || null,
      website: body.website || null,
      main_service: body.main_service || body.service_needed || null,
      monthly_enquiry_volume: body.monthly_enquiry_volume || null,
      biggest_problem: body.biggest_problem || null,
      current_missed_call_handling: body.current_call_handling || null,
      ai_first_goal: body.ai_first_goal || null,
      plan: pricing.plan,
      status: 'Onboarding',
      lifecycle_state: 'pre_live',
      progress_percentage: 0,
      source_lead_id: lead.id,
      workflow_phase: 'Kickoff',
      next_action: 'Collect onboarding intake and assets'
    });

    await insertRow(url, key, 'billing_status', {
      client_id: client.id,
      plan: pricing.plan,
      setup_fee: pricing.setup_fee,
      monthly_fee: pricing.monthly_fee,
      billing_status: body.payment_status === 'paid' ? 'active' : 'awaiting_payment',
      setup_fee_paid: body.payment_status === 'paid'
    });

    await insertRow(url, key, 'intake_forms', {
      client_id: client.id,
      business_name: businessName,
      contact_name: fullName,
      email,
      phone: phone || null,
      website: body.website || null,
      industry: body.industry || null,
      approval_status: 'draft'
    });

    await insertRow(url, key, 'integration_status', {
      client_id: client.id,
      integration_type: 'crm',
      integration_name: 'GoHighLevel',
      connection_status: 'planned',
      notes: 'Created during onboarding start'
    });

    await insertRow(url, key, 'client_notes', {
      client_id: client.id,
      note_type: 'system',
      content: `Onboarding started from ${body.lead_source || 'manual flow'} for ${pricing.plan} plan.`,
      created_by: 'system'
    });

    const tasks = tasksForPlan(pricing.plan);
    for (const task of tasks) {
      await insertRow(url, key, 'onboarding_tasks', { ...task, client_id: client.id });
    }

    return res.status(200).json({ success: true, lead, client, tasks_created: tasks.length });
  } catch (error) {
    return res.status(500).json({ error: 'Onboarding start failed', details: error.message });
  }
}
