import { requireAdmin } from './_native-auth.js';

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body || '{}'); } catch (_error) { return {}; }
  }
  return req.body;
}

function getSupabaseConfig() {
  const rawUrl = process.env.VITE_SUPABASE_URL;
  const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = String(rawUrl || '').trim().replace(/\/$/, '');
  const key = String(rawKey || '').trim();
  if (!url || !key) throw new Error('Supabase server configuration missing');
  let parsed;
  try {
    parsed = new URL(url);
  } catch (_error) {
    throw new Error('VITE_SUPABASE_URL is not a valid URL');
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('VITE_SUPABASE_URL must start with https://');
  return { url, key, host: parsed.host };
}

function getSafeDiagnostics() {
  try {
    const config = getSupabaseConfig();
    return {
      supabase_url_present: true,
      supabase_host: config.host,
      service_role_key_present: Boolean(config.key),
      service_role_key_length: config.key.length,
    };
  } catch (error) {
    return {
      supabase_url_present: Boolean(process.env.VITE_SUPABASE_URL),
      service_role_key_present: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      configuration_error: error.message,
    };
  }
}

function cleanRecord(record) {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined));
}

function explainFetchFailure(error, targetUrl) {
  const cause = error?.cause;
  const parts = [error.message || 'fetch failed'];
  if (cause?.code) parts.push(`cause_code=${cause.code}`);
  if (cause?.errno) parts.push(`errno=${cause.errno}`);
  if (cause?.syscall) parts.push(`syscall=${cause.syscall}`);
  if (cause?.hostname) parts.push(`hostname=${cause.hostname}`);
  if (targetUrl) {
    try { parts.push(`target_host=${new URL(targetUrl).host}`); } catch (_error) {}
  }
  return parts.join(' ');
}

async function supabase(path, options = {}) {
  const { url, key } = getSupabaseConfig();
  const targetUrl = `${url}/rest/v1${path}`;
  let response;
  try {
    response = await fetch(targetUrl, {
      ...options,
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: options.prefer || 'return=representation',
        ...(options.headers || {})
      }
    });
  } catch (error) {
    throw new Error(explainFetchFailure(error, targetUrl));
  }
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (_error) { data = text; }
  if (!response.ok) {
    const message = data?.message || data?.error || text || response.statusText;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function insertIntoCandidates(tableCandidates, record, label) {
  const errors = [];
  for (const table of tableCandidates) {
    try {
      const data = await supabase(`/${table}`, { method: 'POST', body: JSON.stringify(cleanRecord(record)) });
      return { table, record: Array.isArray(data) ? data[0] : data };
    } catch (error) {
      errors.push(`${table}: ${error.message}`);
    }
  }
  throw new Error(`${label} insert failed. ${errors.join(' | ')}`);
}

async function optionalInsert(tableCandidates, record, label) {
  try {
    return await insertIntoCandidates(tableCandidates, record, label);
  } catch (error) {
    return { skipped: true, label, error: error.message };
  }
}

async function optionalBulkInsert(tableCandidates, records, label) {
  if (!records.length) return { skipped: true, label, reason: 'No records' };
  const errors = [];
  for (const table of tableCandidates) {
    try {
      const data = await supabase(`/${table}`, { method: 'POST', body: JSON.stringify(records.map(cleanRecord)) });
      return { table, records: data || [] };
    } catch (error) {
      errors.push(`${table}: ${error.message}`);
    }
  }
  return { skipped: true, label, error: errors.join(' | ') };
}

async function optionalPatch(tableCandidates, id, record, label) {
  if (!id) return { skipped: true, label, reason: 'No id' };
  const errors = [];
  for (const table of tableCandidates) {
    try {
      const data = await supabase(`/${table}?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(cleanRecord(record)) });
      return { table, record: Array.isArray(data) ? data[0] : data };
    } catch (error) {
      errors.push(`${table}: ${error.message}`);
    }
  }
  return { skipped: true, label, error: errors.join(' | ') };
}

function validate(payload) {
  if (!payload.business_name && !payload.full_name) throw new Error('Business name or contact name is required');
  if (!payload.email && !payload.mobile_number && !payload.phone) throw new Error('Email or phone number is required');
}

function normalizePlan(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (raw.includes('enterprise')) return 'Enterprise';
  if (raw.includes('growth')) return 'Growth';
  return 'Starter';
}

function planPricing(plan) {
  if (plan === 'Growth') return { setup_fee: 3000, monthly_fee: 1500 };
  if (plan === 'Enterprise') return { setup_fee: 7500, monthly_fee: 3000 };
  return { setup_fee: 1500, monthly_fee: 497 };
}

function taskTemplates(plan) {
  const starter = [
    { task_name: 'confirm signed approval', task_phase: 'Lead / Qualification', task_type: 'approval', required: true },
    { task_name: 'confirm setup payment received', task_phase: 'Payment', task_type: 'billing', required: true, priority: 'high' },
    { task_name: 'complete business intake', task_phase: 'Kickoff', task_type: 'intake', required: true },
    { task_name: 'collect services, service areas, hours and FAQs', task_phase: 'Asset Collection', task_type: 'intake', required: true },
    { task_name: 'confirm call handling and escalation rules', task_phase: 'Workflow Mapping', task_type: 'setup', required: true },
    { task_name: 'configure voice assistant', task_phase: 'Build', task_type: 'setup', required: true },
    { task_name: 'configure SMS and email notifications', task_phase: 'Integrations', task_type: 'setup', required: true },
    { task_name: 'run test call and secure setup test', task_phase: 'Testing', task_type: 'testing', required: true },
    { task_name: 'client approval', task_phase: 'Approval', task_type: 'approval', required: true },
    { task_name: 'approve go-live handover', task_phase: 'Go Live', task_type: 'launch', required: true },
    { task_name: '7-day review', task_phase: 'Optimisation', task_type: 'review', required: true },
  ];
  const growth = [
    { task_name: 'connect CRM workflow', task_phase: 'Integrations', task_type: 'integration', required: true },
    { task_name: 'configure booking and follow-up workflow', task_phase: 'Workflow Mapping', task_type: 'setup', required: true },
    { task_name: '14-day optimisation review', task_phase: 'Optimisation', task_type: 'review', required: true },
  ];
  const enterprise = [
    { task_name: 'technical discovery complete', task_phase: 'Kickoff', task_type: 'discovery', required: true },
    { task_name: 'configure custom escalation and reporting rules', task_phase: 'Integrations', task_type: 'integration', required: true },
    { task_name: 'security/compliance review complete', task_phase: 'Approval', task_type: 'approval', required: true },
    { task_name: '30-day executive review booked', task_phase: 'Optimisation', task_type: 'review', required: true },
  ];
  if (plan === 'Enterprise') return [...starter, ...growth, ...enterprise];
  if (plan === 'Growth') return [...starter, ...growth];
  return starter;
}

function integrationTemplates(plan) {
  const items = [
    ['Vapi Voice Agent', 'vapi', 'voice_agent'],
    ['Twilio SMS', 'twilio', 'sms'],
    ['Resend Email', 'resend', 'email'],
    ['Stripe Billing', 'stripe', 'billing'],
    ['Website Widget', 'website', 'website']
  ];
  if (plan === 'Growth' || plan === 'Enterprise') items.push(['CRM / GHL', 'ghl', 'crm']);
  return items;
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      service: 'assistantai-onboarding-create',
      diagnostics: getSafeDiagnostics(),
    });
  }
  try {
    const body = parseBody(req);
    validate(body);

    const now = new Date().toISOString();
    const plan = normalizePlan(body.plan || body.selected_plan || body.likely_plan_fit || 'Starter');
    const pricing = planPricing(plan);
    const phone = body.mobile_number || body.phone || '';
    const businessName = body.business_name || body.full_name || 'New Client';
    const contactName = body.full_name || body.contact_name || '';
    const sourceLeadId = body.source_lead_id || body.lead_id || null;

    const clientInsert = await insertIntoCandidates(['clients', 'client'], {
      full_name: contactName,
      business_name: businessName,
      email: body.email || '',
      mobile_number: phone,
      phone,
      industry: body.industry || 'other',
      website: body.website || '',
      plan,
      source_page: body.source || body.source_page || 'manual_sale',
      source_lead_id: sourceLeadId,
      status: 'Awaiting Payment',
      lifecycle_state: 'pre_live',
      workflow_phase: 'Payment',
      assigned_owner: 'Onboarding',
      progress_percentage: 0,
      next_action: 'Complete: confirm setup payment received',
      blockers: ['Missing intake details', 'Unpaid billing', 'Missing integrations'],
      go_live_ready: false,
      onboarding_archived: false,
      last_activity: 'Onboarding created from direct API',
      created_at: now,
      updated_at: now,
      created_date: now,
      updated_date: now
    }, 'Client');

    const client = clientInsert.record;
    const clientId = client.id;

    const intakeResult = await optionalInsert(['intake_forms', 'intakeforms', 'intake_form'], {
      client_id: clientId,
      contact_name: contactName,
      full_name: contactName,
      business_name: businessName,
      email: body.email || '',
      phone,
      mobile_number: phone,
      website: body.website || '',
      industry: body.industry || 'other',
      approval_status: 'draft',
      business_description: '',
      services_offered: '',
      service_areas: '',
      business_hours: '',
      emergency_rules: '',
      faq_list: '',
      pricing_guidance: '',
      escalation_contact: phone || body.email || '',
      is_archived: false,
      last_updated: now,
      created_at: now,
      updated_at: now,
      created_date: now,
      updated_date: now
    }, 'Intake form');

    const tasks = taskTemplates(plan).map((task, index) => ({
      client_id: clientId,
      ...task,
      priority: task.priority || 'normal',
      completed: false,
      due_date: null,
      assigned_to: 'Onboarding',
      notes: '',
      blocked: false,
      is_archived: false,
      sort_order: index + 1,
      created_at: now,
      updated_at: now,
      created_date: now,
      updated_date: now
    }));

    const tasksResult = await optionalBulkInsert(['onboarding_tasks', 'onboardingtasks', 'onboarding_task'], tasks, 'Onboarding tasks');

    const integrations = integrationTemplates(plan).map(([integration_name, provider, integration_type]) => ({
      client_id: clientId,
      integration_name,
      provider,
      integration_type,
      connection_status: 'not_connected',
      last_sync: null,
      notes: '',
      created_at: now,
      updated_at: now,
      created_date: now,
      updated_date: now
    }));

    const integrationsResult = await optionalBulkInsert(['integration_status', 'integration_statuses', 'integrationstatuses'], integrations, 'Integration records');

    const billingResult = await optionalInsert(['billing_status', 'billing_statuses', 'billingstatus'], {
      client_id: clientId,
      plan,
      setup_fee: pricing.setup_fee,
      monthly_fee: pricing.monthly_fee,
      billing_status: 'draft',
      payment_method: '',
      invoice_reference: '',
      renewal_date: null,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      stripe_checkout_session_id: null,
      admin_override: false,
      notes: 'Created from direct onboarding API.',
      created_at: now,
      updated_at: now,
      created_date: now,
      updated_date: now
    }, 'Billing status');

    const noteResult = await optionalInsert(['client_notes', 'clientnotes', 'client_note'], {
      client_id: clientId,
      note_type: 'system',
      content: `Onboarding created from direct onboarding API on ${plan} plan.`,
      created_by: 'admin',
      created_at: now,
      updated_at: now,
      created_date: now,
      updated_date: now,
      is_archived: false
    }, 'Client note');

    const leadResult = sourceLeadId ? await optionalPatch(['leads', 'lead'], sourceLeadId, {
      status: 'Onboarding',
      client_id: clientId,
      client_account_id: clientId,
      updated_at: now,
      updated_date: now,
    }, 'Source lead') : { skipped: true, label: 'Source lead', reason: 'No source lead id' };

    return res.status(200).json({
      success: true,
      client_id: clientId,
      client,
      diagnostics: getSafeDiagnostics(),
      tables: {
        client: clientInsert.table,
        intake: intakeResult.table || null,
        tasks: tasksResult.table || null,
        integrations: integrationsResult.table || null,
        billing: billingResult.table || null,
        note: noteResult.table || null,
        lead: leadResult.table || null
      },
      warnings: [intakeResult, tasksResult, integrationsResult, billingResult, noteResult, leadResult].filter((item) => item.skipped)
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Direct onboarding creation failed',
      details: error.message,
      diagnostics: getSafeDiagnostics()
    });
  }
}
