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
  const title = String(body.title || '').trim();
  if (!title) throw new Error('title is required');
  return {
    item_type: body.item_type || 'testimonial',
    title,
    client_name: body.client_name || '',
    business_name: body.business_name || '',
    industry: body.industry || '',
    quote: body.quote || '',
    result_summary: body.result_summary || '',
    metric_label: body.metric_label || '',
    metric_value: body.metric_value || '',
    image_url: body.image_url || '',
    case_study_url: body.case_study_url || '',
    sort_order: Number(body.sort_order || 0),
    status: body.status === 'active' ? 'active' : 'draft',
    updated_at: new Date().toISOString()
  };
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const includeDrafts = req.query?.includeDrafts === 'true';
      const type = req.query?.item_type;
      let query = '/social_proof_items?select=*';
      if (type) query += `&item_type=eq.${encodeURIComponent(type)}`;
      if (!includeDrafts) query += '&status=eq.active';
      query += '&order=sort_order.asc,created_at.desc';
      const items = await supabaseRequest(query, { method: 'GET' });
      return res.status(200).json({ success: true, items });
    }
    if (req.method === 'POST') {
      const data = await supabaseRequest('/social_proof_items', { method: 'POST', body: JSON.stringify(mapItem(parseBody(req))) });
      return res.status(200).json({ success: true, item: Array.isArray(data) ? data[0] : data });
    }
    if (req.method === 'PATCH') {
      const body = parseBody(req);
      const id = String(body.id || '').trim();
      if (!id) return res.status(400).json({ error: 'Social proof item id is required' });
      const data = await supabaseRequest(`/social_proof_items?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(mapItem(body)) });
      return res.status(200).json({ success: true, item: Array.isArray(data) ? data[0] : data });
    }
    if (req.method === 'DELETE') {
      const id = String(req.query?.id || '').trim();
      if (!id) return res.status(400).json({ error: 'Social proof item id is required' });
      await supabaseRequest(`/social_proof_items?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', prefer: 'return=minimal' });
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: 'Social proof API failed', details: error.message });
  }
}
