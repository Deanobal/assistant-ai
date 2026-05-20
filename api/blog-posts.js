function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body || '{}');
    } catch (_error) {
      return {};
    }
  }
  return req.body;
}

function normaliseSlug(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

async function supabaseRequest(path, options = {}) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase server configuration missing');
  }

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
  if (!response.ok) {
    throw new Error(data?.message || text || response.statusText);
  }
  return data;
}

function mapPostPayload(body) {
  const title = String(body.title || '').trim();
  const slug = normaliseSlug(body.slug || title);
  const paragraphs = Array.isArray(body.body)
    ? body.body
    : String(body.body || '')
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);

  if (!title) throw new Error('Title is required');
  if (!slug) throw new Error('Slug is required');

  return {
    title,
    slug,
    meta_description: body.meta_description || body.metaDescription || '',
    excerpt: body.excerpt || '',
    category: body.category || 'AI Strategy',
    featured_image_url: body.featured_image_url || body.featuredImageUrl || null,
    body: paragraphs,
    status: body.status === 'published' ? 'published' : 'draft',
    published_at: body.status === 'published' ? (body.published_at || new Date().toISOString()) : null,
    author_name: body.author_name || 'AssistantAI',
    seo_keywords: Array.isArray(body.seo_keywords)
      ? body.seo_keywords
      : String(body.seo_keywords || '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
    updated_at: new Date().toISOString()
  };
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const includeDrafts = req.query?.includeDrafts === 'true';
      const slug = req.query?.slug;
      let query = '/blog_posts?select=*';
      if (slug) query += `&slug=eq.${encodeURIComponent(slug)}`;
      if (!includeDrafts) query += '&status=eq.published';
      query += '&order=published_at.desc.nullslast,created_at.desc';
      const posts = await supabaseRequest(query, { method: 'GET' });
      return res.status(200).json({ success: true, posts });
    }

    if (req.method === 'POST') {
      const payload = mapPostPayload(parseBody(req));
      const data = await supabaseRequest('/blog_posts', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return res.status(200).json({ success: true, post: Array.isArray(data) ? data[0] : data });
    }

    if (req.method === 'PATCH') {
      const body = parseBody(req);
      const id = String(body.id || '').trim();
      if (!id) return res.status(400).json({ error: 'Post id is required' });
      const payload = mapPostPayload(body);
      const data = await supabaseRequest(`/blog_posts?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
      return res.status(200).json({ success: true, post: Array.isArray(data) ? data[0] : data });
    }

    if (req.method === 'DELETE') {
      const id = String(req.query?.id || '').trim();
      if (!id) return res.status(400).json({ error: 'Post id is required' });
      await supabaseRequest(`/blog_posts?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        prefer: 'return=minimal'
      });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: 'Blog posts API failed', details: error.message });
  }
}
