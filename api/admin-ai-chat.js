function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  return req.body;
}

function safeText(value, fallback = '') {
  return String(value || fallback).slice(0, 4000);
}

function buildLocalAnswer(message, context = {}) {
  const lower = message.toLowerCase();
  const page = context.page || 'admin';

  if (lower.includes('intake') || lower.includes('onboarding')) {
    return {
      reply: `I can help with onboarding. Current page: ${page}. Best next checks: confirm the client record exists, open the Intake tab, complete missing business details, save once to create the permanent intake record, then review blockers and checklist progress. I can also draft onboarding notes, summarise missing fields, or prepare client setup instructions.`,
      actions: [
        { label: 'Open Onboarding', href: '/Onboarding' },
        { label: 'Open Clients', href: '/ClientManager' }
      ]
    };
  }

  if (lower.includes('lead') || lower.includes('sale') || lower.includes('pipeline')) {
    return {
      reply: `For leads, focus on speed-to-response. Check new leads, follow-up overdue leads, and any leads marked Payment Pending. I can help draft a reply, qualify plan fit, or prepare a next-action summary before you call them.`,
      actions: [
        { label: 'Open Leads', href: '/LeadDashboard' },
        { label: 'Open Action Inbox', href: '/ActionInbox' }
      ]
    };
  }

  if (lower.includes('stripe') || lower.includes('payment') || lower.includes('billing')) {
    return {
      reply: `Billing changes should be handled carefully. I can explain the current flow, draft payment follow-up copy, or help identify what needs checking. I will not change pricing, override billing, or mark payment active without a confirmed admin action.`,
      actions: [
        { label: 'Open Clients', href: '/ClientManager' },
        { label: 'Open System Readiness', href: '/SystemReadiness' }
      ]
    };
  }

  if (lower.includes('content') || lower.includes('seo') || lower.includes('ad') || lower.includes('campaign')) {
    return {
      reply: `For marketing, I can draft page copy, rewrite CTAs, create campaign ideas, generate SEO outlines, and prepare content blocks. Use the Marketing area for publishing and CMS-style edits.`,
      actions: [
        { label: 'Open Marketing', href: '/admin/marketing/seo-dashboard' },
        { label: 'Open Content Studio', href: '/admin/marketing/content-studio' }
      ]
    };
  }

  if (lower.includes('error') || lower.includes('broken') || lower.includes('not working')) {
    return {
      reply: `Send me the exact error text, page URL, and what you clicked before it failed. I will classify whether it is frontend, API, Supabase, Base44 legacy, Vercel env, or integration-related, then give the safest fix path.`,
      actions: [
        { label: 'Open System Readiness', href: '/SystemReadiness' }
      ]
    };
  }

  return {
    reply: `I can help operate the admin system from here. Ask me to summarise a client, draft a reply, plan next actions, explain an error, prepare onboarding steps, improve page copy, or identify what needs attention next. For safety, I can suggest and prepare changes, but high-risk actions like pricing, publishing, billing, deleting, or sending require explicit confirmation.`,
    actions: [
      { label: 'Open Action Inbox', href: '/ActionInbox' },
      { label: 'Open Leads', href: '/LeadDashboard' },
      { label: 'Open Onboarding', href: '/Onboarding' }
    ]
  };
}

async function getOpenAIAnswer(message, context) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const system = `You are AssistantAI Admin Copilot for a premium AI receptionist and automation business. Help the admin operate leads, onboarding, support, billing checks, content and system readiness. Be concise, commercial, and action-focused. You may suggest actions and draft text, but you must not claim you performed irreversible/high-risk actions such as sending messages, publishing, deleting, changing pricing, or overriding billing. Ask for explicit confirmation for those.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: process.env.ADMIN_AI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `Admin page/context: ${safeText(JSON.stringify(context || {}))}\n\nAdmin request: ${safeText(message)}` }
      ],
      temperature: 0.3,
      max_tokens: 700
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || 'OpenAI request failed');
  return { reply: data?.choices?.[0]?.message?.content || 'I could not generate a response.', actions: [] };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = parseBody(req);
    const message = safeText(body.message).trim();
    const context = body.context || {};
    if (!message) return res.status(400).json({ error: 'Message is required' });

    let answer = null;
    try {
      answer = await getOpenAIAnswer(message, context);
    } catch (error) {
      answer = null;
    }

    if (!answer) answer = buildLocalAnswer(message, context);
    return res.status(200).json({ success: true, ...answer });
  } catch (error) {
    return res.status(500).json({ error: 'Admin AI chat failed', details: error.message });
  }
}
