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

function mapAsset(body) {
  const title = String(body.title || '').trim();
  const asset_url = String(body.asset_url || '').trim();
  if (!title || !asset_url) throw new Error('title and asset_url are required');
  return {
    title,
    asset_url,
    asset_type: body.asset_type || 'image',
    alt_text: body.alt_text || '',
    folder: body.folder || 'general',
    tags: Array.isArray(body.tags) ? body.tags : String(body.tags || '').split(',').map((x) => x.trim()).filter(Boolean),
    status: body.status || 'active',
    updated_at: new Date().toISOString()
  };
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const folder = req.query?.folder;
      let query = '/media_assets?select=*';
      if (folder) query += `&folder=eq.${encodeURIComponent(folder)}`;
      query += '&order=created_at.desc';
      const assets = await supabaseRequest(query, { method: 'GET' });
      return res.status(200).json({ success: true, assets });
    }
    if (req.method === 'POST') {
      const data = await supabaseRequest('/media_assets', { method: 'POST', body: JSON.stringify(mapAsset(parseBody(req))) });
      return res.status(200).json({ success: true, asset: Array.isArray(data) ? data[0] : data });
    }
    if (req.method === 'PATCH') {
      const body = parseBody(req);
      const id = String(body.id || '').trim();
      if (!id) return res.status(400).json({ error: 'Asset id is required' });
      const data = await supabaseRequest(`/media_assets?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(mapAsset(body)) });
      return res.status(200).json({ success: true, asset: Array.isArray(data) ? data[0] : data });
    }
    if (req.method === 'DELETE') {
      const id = String(req.query?.id || '').trim();
      if (!id) return res.status(400).json({ error: 'Asset id is required' });
      await supabaseRequest(`/media_assets?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', prefer: 'return=minimal' });
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: 'Media assets API failed', details: error.message });
  }
}
