import { requireAdmin } from './_native-auth.js';

async function supabaseGet(url, key, table, query) {
  const response = await fetch(`${url}/rest/v1/${table}?${query}`, {
    method: 'GET',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    }
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`${table} lookup failed: ${data?.message || text || response.statusText}`);
  }
  return Array.isArray(data) ? data : [];
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
    const email = String(body.email || body.user_email || '').trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ error: 'Email is required to resolve portal access' });
    }

    const clients = await supabaseGet(url, key, 'clients', `email=ilike.${encodeURIComponent(email)}&limit=1`);
    const client = clients[0] || null;

    if (!client) {
      return res.status(200).json({
        success: true,
        linked: false,
        state: 'provisional',
        message: 'No active client record is linked to this email yet.',
        client: null
      });
    }

    const encodedClientId = encodeURIComponent(client.id);
    const billing = await supabaseGet(url, key, 'billing_status', `client_id=eq.${encodedClientId}&limit=1`);
    const intake = await supabaseGet(url, key, 'intake_forms', `client_id=eq.${encodedClientId}&limit=1`);
    const integrations = await supabaseGet(url, key, 'integration_status', `client_id=eq.${encodedClientId}&order=created_at.asc`);
    const tasks = await supabaseGet(url, key, 'onboarding_tasks', `client_id=eq.${encodedClientId}&order=created_at.asc`);
    const notes = await supabaseGet(url, key, 'client_notes', `client_id=eq.${encodedClientId}&order=created_at.desc&limit=10`);

    return res.status(200).json({
      success: true,
      linked: true,
      state: client.lifecycle_state || 'pre_live',
      client,
      billing: billing[0] || null,
      intake: intake[0] || null,
      integrations,
      tasks,
      notes
    });
  } catch (error) {
    return res.status(500).json({ error: 'Client portal resolve failed', details: error.message });
  }
}
