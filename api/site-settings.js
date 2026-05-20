function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body || '{}'); } catch (_error) { return {}; }
  }
  return req.body;
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

function mapSetting(body) {
  const setting_key = String(body.setting_key || '').trim();
  const setting_label = String(body.setting_label || '').trim();
  if (!setting_key || !setting_label) throw new Error('setting_key and setting_label are required');
  return {
    setting_key,
    setting_label,
    setting_value: body.setting_value || '',
    setting_group: body.setting_group || 'general',
    is_public: Boolean(body.is_public),
    updated_at: new Date().toISOString()
  };
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const group = req.query?.group;
      let query = '/site_settings?select=*';
      if (group) query += `&setting_group=eq.${encodeURIComponent(group)}`;
      query += '&order=setting_group.asc,setting_key.asc';
      const settings = await supabaseRequest(query, { method: 'GET' });
      return res.status(200).json({ success: true, settings });
    }
    if (req.method === 'POST') {
      const payload = mapSetting(parseBody(req));
      const data = await supabaseRequest('/site_settings', { method: 'POST', body: JSON.stringify(payload) });
      return res.status(200).json({ success: true, setting: Array.isArray(data) ? data[0] : data });
    }
    if (req.method === 'PATCH') {
      const body = parseBody(req);
      const id = String(body.id || '').trim();
      if (!id) return res.status(400).json({ error: 'Setting id is required' });
      const payload = mapSetting(body);
      const data = await supabaseRequest(`/site_settings?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) });
      return res.status(200).json({ success: true, setting: Array.isArray(data) ? data[0] : data });
    }
    if (req.method === 'DELETE') {
      const id = String(req.query?.id || '').trim();
      if (!id) return res.status(400).json({ error: 'Setting id is required' });
      await supabaseRequest(`/site_settings?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', prefer: 'return=minimal' });
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: 'Site settings API failed', details: error.message });
  }
}
