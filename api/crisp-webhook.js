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

    return res.status(200).json({
      success: true,
      received: Boolean(message),
      reply: 'Thanks. I can help with AssistantAI services. Please share your name, business, phone number, and what you need help with.',
      lead_captured: false,
      human_handoff_required: false
    });
  } catch (error) {
    return res.status(500).json({ error: 'Crisp webhook failed', details: error.message });
  }
}
