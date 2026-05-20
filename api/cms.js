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

function keyify(value) {
  return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 80);
}

function lines(value) {
  if (Array.isArray(value)) return value;
  return String(value || '').split('\n').map((x) => x.trim()).filter(Boolean);
}

const resources = {
  'blog-posts': { table: 'blog_posts', list: 'posts', single: 'post', defaultStatus: 'draft', publicStatus: 'published' },
  'content-blocks': { table: 'site_content_blocks', list: 'blocks', single: 'block' },
  'site-settings': { table: 'site_settings', list: 'settings', single: 'setting' },
  'media-assets': { table: 'media_assets', list: 'assets', single: 'asset' },
  'content-drafts': { table: 'content_drafts', list: 'drafts', single: 'draft' },
  'landing-pages': { table: 'landing_pages', list: 'pages', single: 'page', defaultStatus: 'draft', publicStatus: 'published' },
  'offers-pricing': { table: 'offers_pricing', list: 'offers', single: 'offer', defaultStatus: 'draft', publicStatus: 'active' },
  'social-proof': { table: 'social_proof_items', list: 'items', single: 'item', defaultStatus: 'draft', publicStatus: 'active' },
  'faq-items': { table: 'faq_items', list: 'items', single: 'item', defaultStatus: 'draft', publicStatus: 'active' },
  'navigation-items': { table: 'navigation_items', list: 'items', single: 'item', defaultStatus: 'draft', publicStatus: 'active' },
  'lead-forms': { table: 'lead_forms', list: 'forms', single: 'form', defaultStatus: 'draft', publicStatus: 'active' },
};

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

function generateDraft(body) {
  const type = body.content_type || 'blog';
  const title = body.title || 'AssistantAI Content Draft';
  const audience = body.target_audience || 'Australian service businesses';
  const objective = body.objective || 'generate qualified leads';
  const keywords = Array.isArray(body.keywords) ? body.keywords : String(body.keywords || '').split(',').map((x) => x.trim()).filter(Boolean);
  const keywordLine = keywords.length ? `Target keywords: ${keywords.join(', ')}.` : 'Target keywords: AI receptionist, missed calls, lead capture.';
  if (type === 'ad') return `Headline 1: Stop Missing Calls\nHeadline 2: AI Receptionist For Your Business\nHeadline 3: Capture Leads 24/7\n\nDescription 1: AssistantAI answers calls, qualifies leads and helps convert enquiries while your team works.\nDescription 2: Built for ${audience}. Objective: ${objective}. ${keywordLine}`;
  if (type === 'social') return `Most businesses do not lose leads because their service is bad. They lose them because nobody answers fast enough.\n\nAssistantAI gives ${audience} a 24/7 AI receptionist that answers, qualifies and captures enquiries.\n\n${keywordLine}\n\nCTA: Book a strategy call.`;
  if (type === 'email') return `Subject: Stop losing leads to missed calls\n\nHi,\n\nIf your team misses calls while working, quoting or serving clients, those leads often go straight to competitors.\n\nAssistantAI helps ${audience} answer enquiries 24/7, qualify callers and move them toward the next step.\n\nGoal: ${objective}.\n\n${keywordLine}\n\nWould you like us to map out where AI can save time and recover missed revenue?`;
  return `# ${title}\n\n## Introduction\n${audience} are under pressure to respond faster, reduce admin and convert more enquiries without adding headcount. AssistantAI helps by giving the business a 24/7 AI receptionist and automation layer.\n\n## The Problem\nMissed calls, slow follow-up and manual admin leak revenue. When a prospect cannot get an answer quickly, they usually move to the next provider.\n\n## The Solution\nAssistantAI answers calls, captures details, qualifies the enquiry, supports booking workflows and creates a cleaner handoff for the business.\n\n## Commercial Outcome\nThe objective is to ${objective}. This improves lead capture, speed to response and operational leverage.\n\n## SEO Focus\n${keywordLine}\n\n## CTA\nBook a strategy call with AssistantAI and map the fastest automation wins for your business.`;
}

function normalise(resource, body) {
  const now = new Date().toISOString();
  const b = { ...body };
  delete b.id;

  if (resource === 'blog-posts') {
    b.slug = slugify(b.slug || b.title);
    b.body = Array.isArray(b.body) ? b.body : lines(b.body);
    b.seo_keywords = Array.isArray(b.seo_keywords) ? b.seo_keywords : String(b.seo_keywords || '').split(',').map((x) => x.trim()).filter(Boolean);
    b.status = b.status === 'published' ? 'published' : 'draft';
    b.published_at = b.status === 'published' ? (b.published_at || now) : null;
  }

  if (resource === 'content-drafts') {
    b.keywords = Array.isArray(b.keywords) ? b.keywords : String(b.keywords || '').split(',').map((x) => x.trim()).filter(Boolean);
    b.draft_body = b.draft_body || generateDraft(b);
    b.status = b.status || 'draft';
  }

  if (resource === 'landing-pages') {
    b.slug = slugify(b.slug || b.title);
    b.sections = Array.isArray(b.sections) ? b.sections : lines(b.sections).map((body) => ({ title: '', body }));
    b.status = b.status === 'published' ? 'published' : 'draft';
    b.published_at = b.status === 'published' ? (b.published_at || now) : null;
  }

  if (resource === 'offers-pricing') {
    b.slug = slugify(b.slug || b.offer_name);
    b.inclusions = Array.isArray(b.inclusions) ? b.inclusions : lines(b.inclusions);
    b.setup_fee = Number(b.setup_fee || 0);
    b.monthly_fee = Number(b.monthly_fee || 0);
    b.sort_order = Number(b.sort_order || 0);
    b.status = b.status === 'active' ? 'active' : 'draft';
  }

  if (resource === 'social-proof') {
    b.sort_order = Number(b.sort_order || 0);
    b.status = b.status === 'active' ? 'active' : 'draft';
  }

  if (resource === 'faq-items') {
    b.keywords = Array.isArray(b.keywords) ? b.keywords : String(b.keywords || '').split(',').map((x) => x.trim()).filter(Boolean);
    b.sort_order = Number(b.sort_order || 0);
    b.status = b.status === 'active' ? 'active' : 'draft';
  }

  if (resource === 'navigation-items') {
    b.open_in_new_tab = Boolean(b.open_in_new_tab);
    b.sort_order = Number(b.sort_order || 0);
    b.status = b.status === 'active' ? 'active' : 'draft';
  }

  if (resource === 'lead-forms') {
    b.form_key = keyify(b.form_key || b.form_name);
    b.fields = Array.isArray(b.fields) ? b.fields : lines(b.fields).map((line) => {
      const [labelRaw, typeRaw, requiredRaw] = line.split('|').map((part) => String(part || '').trim());
      const label = labelRaw || 'Field';
      return { key: keyify(label), label, type: typeRaw || 'text', required: requiredRaw === 'required' || requiredRaw === 'true' };
    });
    b.status = b.status === 'active' ? 'active' : 'draft';
  }

  if (resource === 'media-assets') {
    b.tags = Array.isArray(b.tags) ? b.tags : String(b.tags || '').split(',').map((x) => x.trim()).filter(Boolean);
  }

  b.updated_at = now;
  return b;
}

function buildListQuery(resource, config, query) {
  let path = `/${config.table}?select=*`;
  const includeDrafts = query.includeDrafts === 'true';
  const publicStatus = config.publicStatus;
  const filters = ['slug', 'page_key', 'form_key', 'menu_key', 'item_type', 'content_type', 'folder', 'category'];
  for (const key of filters) if (query[key]) path += `&${key}=eq.${encodeURIComponent(query[key])}`;
  if (!includeDrafts && publicStatus) path += `&status=eq.${encodeURIComponent(publicStatus)}`;
  if (['navigation-items', 'faq-items', 'offers-pricing', 'social-proof', 'content-blocks'].includes(resource)) path += '&order=sort_order.asc,created_at.desc';
  else path += '&order=created_at.desc';
  return path;
}

async function handleUpload(req, res) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_MEDIA_BUCKET || 'assistantai-media';
  if (!url || !key) return res.status(500).json({ error: 'Supabase server configuration missing' });
  const body = parseBody(req);
  const base64 = String(body.base64 || '').replace(/^data:[^;]+;base64,/, '');
  const title = String(body.title || body.file_name || 'asset').trim();
  if (!base64 || !title) return res.status(400).json({ error: 'title and base64 are required' });
  const folder = slugify(body.folder || 'general') || 'general';
  const fileName = slugify(String(body.file_name || title).replace(/\.[^.]+$/, '')) || 'asset';
  const ext = String(body.file_name || '').split('.').pop() || 'bin';
  const objectPath = `${folder}/${Date.now()}-${fileName}.${ext}`;
  const uploadResponse = await fetch(`${url}/storage/v1/object/${bucket}/${objectPath}`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': body.content_type || 'application/octet-stream', 'x-upsert': 'true' },
    body: Buffer.from(base64, 'base64')
  });
  const uploadText = await uploadResponse.text();
  if (!uploadResponse.ok) return res.status(500).json({ error: 'Supabase Storage upload failed', details: uploadText });
  const publicUrl = `${url}/storage/v1/object/public/${bucket}/${objectPath}`;
  const data = await supabaseRequest('/media_assets', { method: 'POST', body: JSON.stringify({ title, asset_url: publicUrl, asset_type: String(body.content_type || '').startsWith('image/') ? 'image' : 'file', alt_text: body.alt_text || title, folder, tags: Array.isArray(body.tags) ? body.tags : [], status: 'active', updated_at: new Date().toISOString() }) });
  return res.status(200).json({ success: true, asset: Array.isArray(data) ? data[0] : data, public_url: publicUrl, path: objectPath });
}

export default async function handler(req, res) {
  try {
    const resource = String(req.query?.resource || '').trim();
    if (resource === 'media-upload') return handleUpload(req, res);
    const config = resources[resource];
    if (!config) return res.status(404).json({ error: 'Unknown CMS resource' });

    if (req.method === 'GET') {
      const data = await supabaseRequest(buildListQuery(resource, config, req.query || {}), { method: 'GET' });
      return res.status(200).json({ success: true, [config.list]: data });
    }

    if (req.method === 'POST') {
      const data = await supabaseRequest(`/${config.table}`, { method: 'POST', body: JSON.stringify(normalise(resource, parseBody(req))) });
      return res.status(200).json({ success: true, [config.single]: Array.isArray(data) ? data[0] : data });
    }

    if (req.method === 'PATCH') {
      const body = parseBody(req);
      const id = String(body.id || '').trim();
      if (!id) return res.status(400).json({ error: 'id is required' });
      const data = await supabaseRequest(`/${config.table}?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(normalise(resource, body)) });
      return res.status(200).json({ success: true, [config.single]: Array.isArray(data) ? data[0] : data });
    }

    if (req.method === 'DELETE') {
      const id = String(req.query?.id || '').trim();
      if (!id) return res.status(400).json({ error: 'id is required' });
      await supabaseRequest(`/${config.table}?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', prefer: 'return=minimal' });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: 'CMS API failed', details: error.message });
  }
}
