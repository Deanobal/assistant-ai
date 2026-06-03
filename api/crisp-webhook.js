function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  return req.body;
}

function getHeader(req, name) {
  const lower = name.toLowerCase();
  return String(req.headers?.[lower] || req.headers?.[name] || '').trim();
}

function isAuthorised(req) {
  const expected = String(process.env.CRISP_WEBHOOK_SECRET || '').trim();
  if (!expected) return false;
  const received = getHeader(req, 'x-crisp-webhook-secret') || getHeader(req, 'x-webhook-secret');
  return received && received === expected;
}

function safeText(value, max = 1200) {
  return String(value || '').trim().slice(0, max);
}

function clean(record) {
  return Object.fromEntries(Object.entries(record || {}).filter(([, value]) => value !== undefined && value !== null && value !== ''));
}

function publicPrompt() {
  return `You are the public AssistantAI website chat assistant. Help visitors understand AI receptionist, missed call handling, lead capture, booking support and business automation. Keep replies short and practical. Ask for name, business, phone, email and what they need when relevant. You cannot access or change admin data, billing, private client data, secrets or internal dashboards. If asked for private/admin actions, refuse briefly and offer normal sales or support help.`;
}

function buildMessages(message, context) {
  return [
    { role: 'system', content: publicPrompt() },
    { role: 'user', content: `Visitor context: ${safeText(JSON.stringify(context || {}), 1000)}\n\nVisitor message: ${safeText(message, 2000)}` }
  ];
}

async function callProvider({ provider, key, url, model, messages }) {
  if (!key) throw new Error(`${provider} is not configured`);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ model, messages, temperature: 0.2, max_tokens: 500 })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${provider}: ${data?.error?.message || data?.message || `request failed with status ${response.status}`}`);
  const reply = data?.choices?.[0]?.message?.content;
  if (!reply) throw new Error(`${provider}: empty response`);
  return { reply, provider, model };
}

async function getAIReply(message, context) {
  const messages = buildMessages(message, context);
  const providers = [
    {
      provider: 'groq',
      key: String(process.env.GROQ_API_KEY || process.env.GROQ_ADMIN_AI_KEY || '').trim(),
      url: 'https://api.groq.com/openai/v1/chat/completions',
      model: String(process.env.GROQ_PUBLIC_CHAT_MODEL || process.env.GROQ_ADMIN_AI_MODEL || 'llama-3.3-70b-versatile').trim()
    },
    {
      provider: 'openai',
      key: String(process.env.OPENAI_API_KEY || '').trim(),
      url: 'https://api.openai.com/v1/chat/completions',
      model: String(process.env.PUBLIC_CHAT_MODEL || process.env.ADMIN_AI_MODEL || 'gpt-4o-mini').trim()
    }
  ];

  const errors = [];
  for (const provider of providers) {
    try {
      return await callProvider({ ...provider, messages });
    } catch (error) {
      errors.push(error.message || `${provider.provider} failed`);
    }
  }
  throw new Error(errors.join(' | '));
}

function emailFrom(text) {
  return String(text || '').match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
}

function phoneFrom(text) {
  return String(text || '').match(/(?:\+?61|0)[\d\s-]{8,13}/)?.[0]?.replace(/[\s-]/g, '') || '';
}

function shouldCaptureLead(message, body) {
  const text = String(message || '').toLowerCase();
  return Boolean(emailFrom(message) || phoneFrom(message) || body.email || body.phone || text.includes('quote') || text.includes('price') || text.includes('book') || text.includes('demo') || text.includes('interested') || text.includes('call'));
}

function leadScore(message, email, phone) {
  const text = String(message || '').toLowerCase();
  let score = 15;
  if (email) score += 20;
  if (phone) score += 20;
  if (text.includes('price') || text.includes('quote') || text.includes('book') || text.includes('call')) score += 15;
  if (text.includes('urgent') || text.includes('asap') || text.includes('today')) score += 20;
  if (text.includes('crm') || text.includes('missed call') || text.includes('receptionist') || text.includes('automation')) score += 10;
  return Math.min(score, 100);
}

function planFrom(message) {
  const text = String(message || '').toLowerCase();
  if (text.includes('enterprise') || text.includes('locations')) return 'Enterprise';
  if (text.includes('crm') || text.includes('calendar') || text.includes('integration') || text.includes('automation')) return 'Growth';
  return 'Starter';
}

function intentFrom(message) {
  const text = String(message || '').toLowerCase();
  if (text.includes('book') || text.includes('start') || text.includes('sign up')) return 'ready_to_buy';
  if (text.includes('price') || text.includes('quote') || text.includes('cost')) return 'pricing';
  return 'researching';
}

async function insertLead(payload) {
  const url = String(process.env.VITE_SUPABASE_URL || '').trim().replace(/\/$/, '');
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !key) throw new Error('Supabase configuration missing');
  const response = await fetch(`${url}/rest/v1/leads`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify(payload)
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (_error) { data = text; }
  if (!response.ok) throw new Error(data?.message || data?.error || text || response.statusText);
  return Array.isArray(data) ? data[0] : data;
}

function buildLead(body, message, reply) {
  const data = body.data || body;
  const visitor = data.visitor || body.visitor || {};
  const meta = data.meta || body.meta || {};
  const email = safeText(visitor.email || meta.email || body.email || emailFrom(message), 200);
  const phone = safeText(visitor.phone || visitor.mobile || meta.phone || body.phone || phoneFrom(message), 80);
  const score = leadScore(message, email, phone);
  const plan = planFrom(message);
  return clean({
    full_name: safeText(visitor.name || meta.name || body.name || 'Crisp Visitor', 200),
    business_name: safeText(meta.business_name || body.business_name || '', 200),
    email,
    mobile_number: phone,
    service_needed: safeText(meta.service_needed || body.service_needed || message, 300),
    urgency: String(message || '').toLowerCase().includes('urgent') ? 'high' : 'normal',
    enquiry_type: 'crisp_chat',
    lead_source: 'crisp',
    source_page: safeText(data.website_url || data.page_url || body.page_url || 'crisp_widget', 300),
    message: safeText(message, 1200),
    conversation_summary: safeText(reply || message, 1200),
    likely_plan_fit: plan,
    selected_plan: plan,
    buyer_intent: intentFrom(message),
    status: score >= 70 ? 'Hot Lead' : 'New Lead',
    payment_status: 'not_started',
    lead_score: score,
    assigned_owner: process.env.ADMIN_NOTIFICATION_EMAIL || 'admin',
    notes: `Created from Crisp webhook. Session: ${safeText(data.session_id || body.session_id || '', 120)}`,
    next_action: score >= 70 ? 'Contact within 5 minutes' : 'Review Crisp enquiry and qualify'
  });
}

function needsHuman(message, score) {
  const text = String(message || '').toLowerCase();
  return score >= 70 || text.includes('human') || text.includes('call me') || text.includes('urgent') || text.includes('complaint') || text.includes('support');
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      service: 'assistantai-crisp-webhook',
      secured: Boolean(process.env.CRISP_WEBHOOK_SECRET),
      groq_configured: Boolean(process.env.GROQ_API_KEY || process.env.GROQ_ADMIN_AI_KEY),
      openai_configured: Boolean(process.env.OPENAI_API_KEY),
      supabase_configured: Boolean(process.env.VITE_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
    });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    if (!isAuthorised(req)) return res.status(401).json({ error: 'Unauthorised Crisp webhook' });

    const body = parseBody(req);
    const data = body.data || body;
    const message = safeText(data.content || data.message || body.message || body.text || '', 2000);
    const context = {
      session_id: data.session_id || body.session_id || '',
      page_url: data.page_url || data.website_url || body.page_url || '',
      visitor: data.visitor || body.visitor || {}
    };

    let ai;
    try {
      ai = await getAIReply(message, context);
    } catch (error) {
      ai = {
        reply: 'Thanks. I can help with AssistantAI services. Please share your name, business, phone number, and what you need help with.',
        provider: 'fallback',
        model: 'local',
        error: error.message
      };
    }

    let lead = null;
    if (message && shouldCaptureLead(message, body)) {
      const payload = buildLead(body, message, ai.reply);
      lead = await insertLead(payload).catch((error) => ({ error: error.message, payload }));
    }
    const score = lead?.lead_score || lead?.payload?.lead_score || 0;

    return res.status(200).json({
      success: true,
      received: Boolean(message),
      reply: ai.reply,
      provider: ai.provider,
      model: ai.model,
      lead_captured: Boolean(lead && !lead.error),
      lead,
      human_handoff_required: needsHuman(message, score)
    });
  } catch (error) {
    return res.status(500).json({ error: 'Crisp webhook failed', details: error.message });
  }
}
