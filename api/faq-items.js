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

function mapItem(body) {
  const question = String(body.question || '').trim();
  const answer = String(body.answer || '').trim();
  if (!question || !answer) throw new Error('question and answer are required');
  const keywords = Array.isArray(body.keywords) ? body.keywords : String(body.keywords || '').split(',').map((x) => x.trim()).filter(Boolean);
  return {
    question,
    answer,
    category: body.category || 'general',
    page_key: body.page_key || 'global',
    keywords,
    sort_order: Number(body.sort_order || 0),
    status: body.status === 'active' ? 'active' : 'draft',
    updated_at: new Date().toISOString()
  };
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const includeDrafts = req.query?.includeDrafts === 'true';
      const page = req.query?.page_key;
      let query = '/faq_items?select=*';
      if (page) query += `&page_key=eq.${encodeURIComponent(page)}`;
      if (!includeDrafts) query += '&status=eq.active';
      query += '&order=sort_order.asc,created_at.desc';
      const items = await supabaseRequest(query, { method: 'GET' });
      return res.status(200).json({ success: true, items });
    }
    if (req.method === 'POST') {
      const data = await supabaseRequest('/faq_items', { method: 'POST', body: JSON.stringify(mapItem(parseBody(req))) });
      return res.status(200).json({ success: true, item: Array.isArray(data) ? data[0] : data });
    }
    if (req.method === 'PATCH') {
      const body = parseBody(req);
      const id = String(body.id || '').trim();
      if (!id) return res.status(400).json({ error: 'FAQ item id is required' });
      const data = await supabaseRequest(`/faq_items?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(mapItem(body)) });
      return res.status(200).json({ success: true, item: Array.isArray(data) ? data[0] : data });
    }
    if (req.method === 'DELETE') {
      const id = String(req.query?.id || '').trim();
      if (!id) return res.status(400).json({ error: 'FAQ item id is required' });
      await supabaseRequest(`/faq_items?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', prefer: 'return=minimal' });
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: 'FAQ API failed', details: error.message });
  }
}
