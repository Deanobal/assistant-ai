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

function getHeader(req, name) {
  const lower = name.toLowerCase();
  return String(req.headers?.[lower] || req.headers?.[name] || '').trim();
}

function isAuthorisedAdminAction(req) {
  const expected = String(process.env.ADMIN_ACTION_SECRET || process.env.ADMIN_ACCESS_PASSWORD || '').trim();
  if (!expected) return false;
  const received = getHeader(req, 'x-admin-action-secret');
  return received && received === expected;
}

function containsHostileValue(value) {
  const text = String(value || '').toLowerCase();
  const blocked = [
    'ignore previous instructions',
    'ignore all instructions',
    'system prompt',
    'developer message',
    'reveal secret',
    'show api key',
    'delete all',
    'drop table',
    '<script',
    'javascript:',
    'onerror=',
    'onload='
  ];
  return blocked.some((term) => text.includes(term));
}

function safePatch(input = {}) {
  const raw = clean({
    full_name: input.full_name,
    business_name: input.business_name,
    email: input.email,
    mobile_number: input.mobile_number || input.phone,
    phone: input.phone || input.mobile_number,
    website: input.website,
    industry: input.industry,
    main_service: input.main_service,
    status: input.status,
    assigned_owner: input.assigned_owner
  });

  for (const [key, value] of Object.entries(raw)) {
    if (String(value).length > 300) throw new Error(`${key} is too long`);
    if (containsHostileValue(value)) throw new Error(`${key} contains blocked content`);
  }

  return clean({
    ...raw,
    last_activity: 'Updated by Admin AI Copilot',
    updated_at: new Date().toISOString(),
    updated_date: new Date().toISOString()
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    if (!isAuthorisedAdminAction(req)) {
      return res.status(401).json({ error: 'Unauthorised admin action' });
    }

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
