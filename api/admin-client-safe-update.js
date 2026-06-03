function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  return req.body;
}

function getConfig() {
  const url = String(process.env.VITE_SUPABASE_URL || '').trim().replace(/\/$/, '');
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !key) throw new Error('Supabase configuration missing');
  return { url, key };
}

function clean(record) {
  return Object.fromEntries(Object.entries(record || {}).filter(([, value]) => value !== undefined && value !== null && value !== ''));
}

function safePatch(input = {}) {
  const patch = clean({
    full_name: input.full_name,
    business_name: input.business_name,
    email: input.email,
    mobile_number: input.mobile_number || input.phone,
    phone: input.phone || input.mobile_number,
    website: input.website,
    industry: input.industry,
    main_service: input.main_service,
    status: input.status,
    assigned_owner: input.assigned_owner,
    last_activity: 'Updated by Admin AI Copilot',
    updated_at: new Date().toISOString(),
    updated_date: new Date().toISOString()
  });
  return patch;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = parseBody(req);
    const clientId = String(body.client_id || '').trim();
    if (!clientId) return res.status(400).json({ error: 'client_id is required' });

    const patch = safePatch(body.patch || {});
    if (!Object.keys(patch).length) return res.status(400).json({ error: 'No supported fields supplied' });

    const { url, key } = getConfig();
    const response = await fetch(`${url}/rest/v1/clients?id=eq.${encodeURIComponent(clientId)}`, {
      method: 'PATCH',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify(patch)
    });

    const text = await response.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (_error) { data = text; }
    if (!response.ok) return res.status(500).json({ error: 'Client update failed', details: data?.message || data?.error || text });

    return res.status(200).json({ success: true, client: Array.isArray(data) ? data[0] : data, patch });
  } catch (error) {
    return res.status(500).json({ error: 'Client update failed', details: error.message });
  }
}
