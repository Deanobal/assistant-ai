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

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      service: 'assistantai-crisp-webhook',
      secured: Boolean(process.env.CRISP_WEBHOOK_SECRET),
      groq_configured: Boolean(process.env.GROQ_API_KEY || process.env.GROQ_ADMIN_AI_KEY),
      openai_configured: Boolean(process.env.OPENAI_API_KEY)
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

    return res.status(200).json({
      success: true,
      received: Boolean(message),
      reply: ai.reply,
      provider: ai.provider,
      model: ai.model,
      lead_captured: false,
      human_handoff_required: false
    });
  } catch (error) {
    return res.status(500).json({ error: 'Crisp webhook failed', details: error.message });
  }
}
