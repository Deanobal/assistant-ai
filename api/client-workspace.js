function getConfig() {
  const url = String(process.env.VITE_SUPABASE_URL || '').trim().replace(/\/$/, '');
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !key) throw new Error('Supabase server configuration missing');
  return { url, key };
}

async function supabaseGet(path) {
  const { url, key } = getConfig();
  const response = await fetch(`${url}/rest/v1${path}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    }
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (_error) { data = text; }
  if (!response.ok) throw new Error(data?.message || data?.error || text || response.statusText);
  return data;
}

async function optionalGet(path) {
  try {
    return await supabaseGet(path);
  } catch (_error) {
    return [];
  }
}

function fallbackIntakeFromClient(client) {
  return {
    client_id: client.id,
    contact_name: client.full_name || '',
    business_name: client.business_name || client.full_name || '',
    email: client.email || '',
    phone: client.mobile_number || client.phone || '',
    mobile_number: client.mobile_number || client.phone || '',
    website: client.website || '',
    industry: client.industry || 'other',
    approval_status: 'draft',
    business_description: '',
    services_offered: '',
    service_areas: '',
    business_hours: '',
    emergency_rules: '',
    faq_list: '',
    pricing_guidance: '',
    escalation_contact: client.mobile_number || client.phone || client.email || '',
    is_archived: false,
    last_updated: new Date().toISOString(),
    _temporary: true
  };
}

function fallbackTasks(client) {
  const plan = client.plan || 'Starter';
  return [
    'Confirm setup payment received',
    'Complete intake details',
    'Collect FAQs and service areas',
    'Configure AI receptionist',
    plan === 'Starter' ? 'Configure lead notifications' : 'Configure CRM, booking and follow-up',
    'Run test call',
    'Approve go-live'
  ].map((task_name, index) => ({
    id: `temp-task-${index + 1}`,
    client_id: client.id,
    task_name,
    task_phase: index === 0 ? 'Payment' : index < 3 ? 'Intake' : index < 5 ? 'Build' : 'Testing',
    required: true,
    completed: false,
    due_date: null,
    assigned_to: client.assigned_owner || 'Onboarding',
    notes: '',
    blocked: index === 0,
    is_archived: false,
    sort_order: index + 1,
    _temporary: true
  }));
}

function fallbackIntegrations(client) {
  const base = ['Vapi Voice Agent', 'Stripe Billing', 'Website Widget', 'Admin Notifications'];
  const extra = client.plan === 'Starter' ? [] : ['CRM', 'Calendar', 'SMS/Email Follow-Up'];
  return [...base, ...extra].map((integration_name, index) => ({
    id: `temp-integration-${index + 1}`,
    client_id: client.id,
    integration_name,
    integration_type: integration_name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
    connection_status: 'not_connected',
    last_sync: null,
    notes: 'Pending setup',
    _temporary: true
  }));
}

function fallbackBilling(client) {
  const plan = client.plan || 'Starter';
  const pricing = plan === 'Growth' ? { setup_fee: 3000, monthly_fee: 1500 } : plan === 'Enterprise' ? { setup_fee: 7500, monthly_fee: 3000 } : { setup_fee: 1500, monthly_fee: 497 };
  return {
    id: 'temp-billing',
    client_id: client.id,
    plan,
    setup_fee: pricing.setup_fee,
    monthly_fee: pricing.monthly_fee,
    billing_status: 'pending',
    notes: 'Temporary billing state from client plan.',
    _temporary: true
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const id = String(req.query.id || '').trim();
    if (!id) return res.status(400).json({ error: 'Client id is required' });

    const clients = await supabaseGet(`/clients?id=eq.${encodeURIComponent(id)}&limit=1`);
    const client = Array.isArray(clients) ? clients[0] : null;
    if (!client) return res.status(404).json({ error: 'Client not found' });

    const intakeForms = await optionalGet(`/intake_forms?client_id=eq.${encodeURIComponent(id)}&limit=1`);
    const taskRows = await optionalGet(`/onboarding_tasks?client_id=eq.${encodeURIComponent(id)}&order=sort_order.asc`);
    const integrationRows = await optionalGet(`/integration_status?client_id=eq.${encodeURIComponent(id)}`);
    const notes = await optionalGet(`/client_notes?client_id=eq.${encodeURIComponent(id)}&order=created_at.desc`);
    const billingRows = await optionalGet(`/billing_status?client_id=eq.${encodeURIComponent(id)}&limit=1`);

    return res.status(200).json({
      success: true,
      client,
      intake: intakeForms[0] || fallbackIntakeFromClient(client),
      tasks: Array.isArray(taskRows) && taskRows.length ? taskRows : fallbackTasks(client),
      integrations: Array.isArray(integrationRows) && integrationRows.length ? integrationRows : fallbackIntegrations(client),
      notes: Array.isArray(notes) ? notes : [],
      billing: Array.isArray(billingRows) && billingRows.length ? billingRows[0] : fallbackBilling(client)
    });
  } catch (error) {
    return res.status(500).json({ error: 'Client workspace load failed', details: error.message });
  }
}
