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

function generateDraft(body) {
  const type = body.content_type || 'blog';
  const title = body.title || 'AssistantAI Content Draft';
  const audience = body.target_audience || 'Australian service businesses';
  const objective = body.objective || 'generate qualified leads';
  const keywords = Array.isArray(body.keywords) ? body.keywords : String(body.keywords || '').split(',').map((x) => x.trim()).filter(Boolean);
  const keywordLine = keywords.length ? `Target keywords: ${keywords.join(', ')}.` : 'Target keywords: AI receptionist, missed calls, lead capture.';

  if (type === 'ad') {
    return `Headline 1: Stop Missing Calls\nHeadline 2: AI Receptionist For Your Business\nHeadline 3: Capture Leads 24/7\n\nDescription 1: AssistantAI answers calls, qualifies leads and helps convert enquiries while your team works.\nDescription 2: Built for ${audience}. Objective: ${objective}. ${keywordLine}`;
  }

  if (type === 'social') {
    return `Most businesses do not lose leads because their service is bad. They lose them because nobody answers fast enough.\n\nAssistantAI gives ${audience} a 24/7 AI receptionist that answers, qualifies and captures enquiries.\n\n${keywordLine}\n\nCTA: Book a strategy call.`;
  }

  if (type === 'email') {
    return `Subject: Stop losing leads to missed calls\n\nHi,\n\nIf your team misses calls while working, quoting or serving clients, those leads often go straight to competitors.\n\nAssistantAI helps ${audience} answer enquiries 24/7, qualify callers and move them toward the next step.\n\nGoal: ${objective}.\n\n${keywordLine}\n\nWould you like us to map out where AI can save time and recover missed revenue?`;
  }

  return `# ${title}\n\n## Introduction\n${audience} are under pressure to respond faster, reduce admin and convert more enquiries without adding headcount. AssistantAI helps by giving the business a 24/7 AI receptionist and automation layer.\n\n## The Problem\nMissed calls, slow follow-up and manual admin leak revenue. When a prospect cannot get an answer quickly, they usually move to the next provider.\n\n## The Solution\nAssistantAI answers calls, captures details, qualifies the enquiry, supports booking workflows and creates a cleaner handoff for the business.\n\n## Commercial Outcome\nThe objective is to ${objective}. This improves lead capture, speed to response and operational leverage.\n\n## SEO Focus\n${keywordLine}\n\n## CTA\nBook a strategy call with AssistantAI and map the fastest automation wins for your business.`;
}

function mapDraft(body) {
  const keywords = Array.isArray(body.keywords) ? body.keywords : String(body.keywords || '').split(',').map((x) => x.trim()).filter(Boolean);
  const draft_body = body.draft_body || generateDraft({ ...body, keywords });
  return {
    title: body.title || 'AssistantAI Content Draft',
    content_type: body.content_type || 'blog',
    target_audience: body.target_audience || '',
    objective: body.objective || '',
    keywords,
    prompt: body.prompt || '',
    draft_body,
    status: body.status || 'draft',
    channel: body.channel || 'website',
    updated_at: new Date().toISOString()
  };
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const type = req.query?.content_type;
      let query = '/content_drafts?select=*';
      if (type) query += `&content_type=eq.${encodeURIComponent(type)}`;
      query += '&order=created_at.desc';
      const drafts = await supabaseRequest(query, { method: 'GET' });
      return res.status(200).json({ success: true, drafts });
    }
    if (req.method === 'POST') {
      const data = await supabaseRequest('/content_drafts', { method: 'POST', body: JSON.stringify(mapDraft(parseBody(req))) });
      return res.status(200).json({ success: true, draft: Array.isArray(data) ? data[0] : data });
    }
    if (req.method === 'PATCH') {
      const body = parseBody(req);
      const id = String(body.id || '').trim();
      if (!id) return res.status(400).json({ error: 'Draft id is required' });
      const data = await supabaseRequest(`/content_drafts?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(mapDraft(body)) });
      return res.status(200).json({ success: true, draft: Array.isArray(data) ? data[0] : data });
    }
    if (req.method === 'DELETE') {
      const id = String(req.query?.id || '').trim();
      if (!id) return res.status(400).json({ error: 'Draft id is required' });
      await supabaseRequest(`/content_drafts?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', prefer: 'return=minimal' });
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: 'Content drafts API failed', details: error.message });
  }
}
