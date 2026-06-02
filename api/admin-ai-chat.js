function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  return req.body;
}

function safeText(value, fallback = '') {
  return String(value || fallback).slice(0, 4000);
}

function buildLocalAnswer(message, context = {}, aiError = '') {
  const lower = message.toLowerCase();
  const page = context.page || 'admin';
  const statusLine = aiError ? `\n\nLive AI status: ${aiError}` : '';

  if (lower.includes('fix this page') || lower.includes('help me fix this page')) {
    return {
      reply: `I am looking at ${page}. Live hosted AI is not active, so I am using fallback mode. For this page, check the visible error, then test the page API route in a new browser tab. If this is ClientWorkspace, check /api/client-workspace?id=<client_id> and /api/intake-save. If this is Onboarding, check /api/onboarding-create. If this is secure setup, check /api/secure-setup-create.${statusLine}`,
      actions: [
        { label: 'Open System Readiness', href: '/SystemReadiness' },
        { label: 'Open Onboarding', href: '/Onboarding' }
      ]
    };
  }

  if (lower.includes('intake') || lower.includes('onboarding')) {
    return {
      reply: `Onboarding operator mode for ${page}: create or load the client, complete Intake, save once, check blockers, confirm payment, connect tools, run a test call, then move to go-live. If saving fails, the likely fault is a missing Supabase column or old Base44 write path.${statusLine}`,
      actions: [
        { label: 'Open Onboarding', href: '/Onboarding' },
        { label: 'Open Clients', href: '/ClientManager' }
      ]
    };
  }

  if (lower.includes('lead') || lower.includes('sale') || lower.includes('pipeline')) {
    return {
      reply: `Lead operator mode: sort by newest and overdue, identify hot leads, prepare a fast follow-up, then move qualified leads into onboarding. Focus on speed-to-response and payment intent.${statusLine}`,
      actions: [
        { label: 'Open Leads', href: '/LeadDashboard' },
        { label: 'Open Action Inbox', href: '/ActionInbox' }
      ]
    };
  }

  if (lower.includes('stripe') || lower.includes('payment') || lower.includes('billing')) {
    return {
      reply: `Billing operator mode: check Stripe checkout creation, payment status, webhook delivery, BillingStatus, then onboarding record creation. I will not override billing or alter pricing without explicit confirmation.${statusLine}`,
      actions: [
        { label: 'Open Clients', href: '/ClientManager' },
        { label: 'Open System Readiness', href: '/SystemReadiness' }
      ]
    };
  }

  if (lower.includes('content') || lower.includes('seo') || lower.includes('ad') || lower.includes('campaign')) {
    return {
      reply: `Marketing operator mode: I can draft page copy, rewrite CTAs, prepare campaign ideas, generate SEO outlines, and suggest content blocks. Publishing still needs confirmation.${statusLine}`,
      actions: [
        { label: 'Open Marketing', href: '/admin/marketing/seo-dashboard' },
        { label: 'Open Content Studio', href: '/admin/marketing/content-studio' }
      ]
    };
  }

  if (lower.includes('error') || lower.includes('broken') || lower.includes('not working')) {
    return {
      reply: `Error triage for ${page}: capture the exact red error, browser console error, and failed Network request. Then check whether it is frontend, API, Supabase, Vercel env, Vapi, Stripe, Twilio, Crisp, or old Base44 dependency.${statusLine}`,
      actions: [
        { label: 'Open System Readiness', href: '/SystemReadiness' }
      ]
    };
  }

  return {
    reply: `Admin Copilot fallback mode is active on ${page}. Ask for a concrete page fix, onboarding step, lead follow-up, error diagnosis, or content draft. No hosted AI provider is responding yet.${statusLine}`,
    actions: [
      { label: 'Open Action Inbox', href: '/ActionInbox' },
      { label: 'Open Leads', href: '/LeadDashboard' },
      { label: 'Open Onboarding', href: '/Onboarding' }
    ]
  };
}

function buildSystemPrompt() {
  return `You are AssistantAI Admin Copilot for Con Balatli, owner of AssistantAI. Help operate the admin dashboard: leads, onboarding, support, client setup, content, errors, system readiness and next actions. Be specific, commercial, and action-focused. Do not repeat generic capability text. If the user asks to fix a page, use the current page context and provide concrete checks or fixes. Never claim you performed destructive or high-risk actions.`;
}

function buildMessages(message, context) {
  return [
    { role: 'system', content: buildSystemPrompt() },
    { role: 'user', content: `Admin page/context: ${safeText(JSON.stringify(context || {}))}\n\nAdmin request: ${safeText(message)}` }
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
    body: JSON.stringify({ model, messages, temperature: 0.2, max_tokens: 900 })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${provider}: ${data?.error?.message || data?.message || `request failed with status ${response.status}`}`);
  const reply = data?.choices?.[0]?.message?.content;
  if (!reply) throw new Error(`${provider}: empty response`);
  return { reply, actions: [], mode: provider, model };
}

async function getHostedAIAnswer(message, context) {
  const messages = buildMessages(message, context);
  const errors = [];
  const providers = [
    {
      provider: 'openai',
      key: String(process.env.OPENAI_API_KEY || '').trim(),
      url: 'https://api.openai.com/v1/chat/completions',
      model: String(process.env.ADMIN_AI_MODEL || 'gpt-4o-mini').trim()
    },
    {
      provider: 'groq',
      key: String(process.env.GROQ_ADMIN_AI_KEY || process.env.GROQ_API_KEY || '').trim(),
      url: 'https://api.groq.com/openai/v1/chat/completions',
      model: String(process.env.GROQ_ADMIN_AI_MODEL || 'llama-3.3-70b-versatile').trim()
    }
  ];

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
      service: 'assistantai-admin-ai-chat',
      openai_configured: Boolean(String(process.env.OPENAI_API_KEY || '').trim()),
      groq_configured: Boolean(String(process.env.GROQ_ADMIN_AI_KEY || process.env.GROQ_API_KEY || '').trim()),
      admin_ai_model: process.env.ADMIN_AI_MODEL || 'gpt-4o-mini',
      groq_admin_ai_model: process.env.GROQ_ADMIN_AI_MODEL || 'llama-3.3-70b-versatile'
    });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = parseBody(req);
    const message = safeText(body.message).trim();
    const context = body.context || {};
    if (!message) return res.status(400).json({ error: 'Message is required' });

    try {
      const answer = await getHostedAIAnswer(message, context);
      return res.status(200).json({ success: true, ...answer });
    } catch (error) {
      const fallback = buildLocalAnswer(message, context, error.message || 'Hosted AI request failed');
      return res.status(200).json({ success: true, mode: 'fallback', openai_error: error.message || 'Hosted AI request failed', ...fallback });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Admin AI chat failed', details: error.message });
  }
}
