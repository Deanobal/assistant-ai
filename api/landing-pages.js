function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body || '{}'); } catch (_error) { return {}; }
  }
  return req.body;
}

function slugify(value) {
  return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);
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

function mapPage(body) {
  const title = String(body.title || '').trim();
  const headline = String(body.headline || title || '').trim();
  const slug = slugify(body.slug || title);
  if (!title || !headline || !slug) throw new Error('title, headline and slug are required');
  const sections = Array.isArray(body.sections)
    ? body.sections
    : String(body.sections || '').split('\n').map((x) => x.trim()).filter(Boolean).map((text) => ({ title: '', body: text }));
  const status = body.status === 'published' ? 'published' : 'draft';
  return {
    title,
    slug,
    headline,
    subheadline: body.subheadline || '',
    offer: body.offer || '',
    cta_label: body.cta_label || 'Get Started',
    cta_url: body.cta_url || '/GetStartedNow',
    meta_title: body.meta_title || title,
    meta_description: body.meta_description || body.subheadline || '',
    sections,
    status,
    published_at: status === 'published' ? (body.published_at || new Date().toISOString()) : null,
    updated_at: new Date().toISOString()
  };
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const includeDrafts = req.query?.includeDrafts === 'true';
      const slug = req.query?.slug;
      let query = '/landing_pages?select=*';
      if (slug) query += `&slug=eq.${encodeURIComponent(slug)}`;
      if (!includeDrafts) query += '&status=eq.published';
      query += '&order=updated_at.desc';
      const pages = await supabaseRequest(query, { method: 'GET' });
      return res.status(200).json({ success: true, pages });
    }
    if (req.method === 'POST') {
      const data = await supabaseRequest('/landing_pages', { method: 'POST', body: JSON.stringify(mapPage(parseBody(req))) });
      return res.status(200).json({ success: true, page: Array.isArray(data) ? data[0] : data });
    }
    if (req.method === 'PATCH') {
      const body = parseBody(req);
      const id = String(body.id || '').trim();
      if (!id) return res.status(400).json({ error: 'Landing page id is required' });
      const data = await supabaseRequest(`/landing_pages?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(mapPage(body)) });
      return res.status(200).json({ success: true, page: Array.isArray(data) ? data[0] : data });
    }
    if (req.method === 'DELETE') {
      const id = String(req.query?.id || '').trim();
      if (!id) return res.status(400).json({ error: 'Landing page id is required' });
      await supabaseRequest(`/landing_pages?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', prefer: 'return=minimal' });
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: 'Landing pages API failed', details: error.message });
  }
}
