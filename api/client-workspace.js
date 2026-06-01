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
  } catch (error) {
    return [];
  }
}

function fallbackIntakeFromClient(client) {
  if (!client) return null;
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

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const id = String(req.query.id || '').trim();
    if (!id) return res.status(400).json({ error: 'Client id is required' });

    const clients = await supabaseGet(`/clients?id=eq.${encodeURIComponent(id)}&limit=1`);
    const client = Array.isArray(clients) ? clients[0] : null;
    if (!client) return res.status(404).json({ error: 'Client not found' });

    const intakeForms = await optionalGet(`/intake_forms?client_id=eq.${encodeURIComponent(id)}&limit=1`);
    const tasks = await optionalGet(`/onboarding_tasks?client_id=eq.${encodeURIComponent(id)}&order=sort_order.asc`);
    const integrations = await optionalGet(`/integration_status?client_id=eq.${encodeURIComponent(id)}`);
    const notes = await optionalGet(`/client_notes?client_id=eq.${encodeURIComponent(id)}&order=created_at.desc`);
    const billingRecords = await optionalGet(`/billing_status?client_id=eq.${encodeURIComponent(id)}&limit=1`);

    return res.status(200).json({
      success: true,
      client,
      intake: intakeForms[0] || fallbackIntakeFromClient(client),
      tasks: Array.isArray(tasks) ? tasks : [],
      integrations: Array.isArray(integrations) ? integrations : [],
      notes: Array.isArray(notes) ? notes : [],
      billing: Array.isArray(billingRecords) ? billingRecords[0] || null : null
    });
  } catch (error) {
    return res.status(500).json({ error: 'Client workspace load failed', details: error.message });
  }
}
