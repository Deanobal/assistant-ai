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

function mapBlock(body) {
  const pageKey = String(body.page_key || '').trim();
  const sectionKey = String(body.section_key || '').trim();
  const label = String(body.label || '').trim();
  if (!pageKey || !sectionKey || !label) throw new Error('page_key, section_key and label are required');
  return {
    page_key: pageKey,
    section_key: sectionKey,
    label,
    content_type: body.content_type || 'text',
    value: body.value || '',
    status: body.status || 'active',
    sort_order: Number(body.sort_order || 0),
    updated_at: new Date().toISOString()
  };
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const page = req.query?.page_key;
      let query = '/site_content_blocks?select=*';
      if (page) query += `&page_key=eq.${encodeURIComponent(page)}`;
      query += '&order=page_key.asc,sort_order.asc,section_key.asc';
      const blocks = await supabaseRequest(query, { method: 'GET' });
      return res.status(200).json({ success: true, blocks });
    }

    if (req.method === 'POST') {
      const payload = mapBlock(parseBody(req));
      const data = await supabaseRequest('/site_content_blocks', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return res.status(200).json({ success: true, block: Array.isArray(data) ? data[0] : data });
    }

    if (req.method === 'PATCH') {
      const body = parseBody(req);
      const id = String(body.id || '').trim();
      if (!id) return res.status(400).json({ error: 'Block id is required' });
      const payload = mapBlock(body);
      const data = await supabaseRequest(`/site_content_blocks?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
      return res.status(200).json({ success: true, block: Array.isArray(data) ? data[0] : data });
    }

    if (req.method === 'DELETE') {
      const id = String(req.query?.id || '').trim();
      if (!id) return res.status(400).json({ error: 'Block id is required' });
      await supabaseRequest(`/site_content_blocks?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', prefer: 'return=minimal' });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: 'Content blocks API failed', details: error.message });
  }
}
