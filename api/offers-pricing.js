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

function mapOffer(body) {
  const offer_name = String(body.offer_name || body.name || '').trim();
  const slug = slugify(body.slug || offer_name);
  if (!offer_name || !slug) throw new Error('offer_name and slug are required');
  const inclusions = Array.isArray(body.inclusions)
    ? body.inclusions
    : String(body.inclusions || '').split('\n').map((x) => x.trim()).filter(Boolean);
  return {
    offer_name,
    slug,
    headline: body.headline || '',
    description: body.description || '',
    setup_fee: Number(body.setup_fee || 0),
    monthly_fee: Number(body.monthly_fee || 0),
    currency: body.currency || 'AUD',
    billing_cycle: body.billing_cycle || 'monthly',
    inclusions,
    cta_label: body.cta_label || 'Get Started',
    cta_url: body.cta_url || '/GetStartedNow',
    stripe_price_key: body.stripe_price_key || '',
    sort_order: Number(body.sort_order || 0),
    status: body.status === 'active' ? 'active' : 'draft',
    updated_at: new Date().toISOString()
  };
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const includeDrafts = req.query?.includeDrafts === 'true';
      let query = '/offers_pricing?select=*';
      if (!includeDrafts) query += '&status=eq.active';
      query += '&order=sort_order.asc,created_at.asc';
      const offers = await supabaseRequest(query, { method: 'GET' });
      return res.status(200).json({ success: true, offers });
    }
    if (req.method === 'POST') {
      const data = await supabaseRequest('/offers_pricing', { method: 'POST', body: JSON.stringify(mapOffer(parseBody(req))) });
      return res.status(200).json({ success: true, offer: Array.isArray(data) ? data[0] : data });
    }
    if (req.method === 'PATCH') {
      const body = parseBody(req);
      const id = String(body.id || '').trim();
      if (!id) return res.status(400).json({ error: 'Offer id is required' });
      const data = await supabaseRequest(`/offers_pricing?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(mapOffer(body)) });
      return res.status(200).json({ success: true, offer: Array.isArray(data) ? data[0] : data });
    }
    if (req.method === 'DELETE') {
      const id = String(req.query?.id || '').trim();
      if (!id) return res.status(400).json({ error: 'Offer id is required' });
      await supabaseRequest(`/offers_pricing?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', prefer: 'return=minimal' });
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: 'Offers pricing API failed', details: error.message });
  }
}
