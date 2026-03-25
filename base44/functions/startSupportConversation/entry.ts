import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const allowedAiModes = ['ai_active', 'human_required', 'escalated', 'closed'];
const allowedCategories = ['sales', 'onboarding', 'support', 'urgent', 'general'];
const allowedUrgencyLevels = ['low', 'normal', 'high', 'urgent'];
const explicitHumanKeywords = ['human', 'real person', 'someone from your team', 'speak to someone', 'talk to someone', 'team member', 'jump in', 'someone jump in'];
const pricingKeywords = ['pricing', 'price', 'cost', 'quote'];
const readyToBookKeywords = ['ready to book', 'ready to start', 'book now', 'get started now', 'sign me up', 'start now'];
const callMeKeywords = ['call me', 'call me back', 'give me a call', 'ring me'];
const urgentHelpKeywords = ['urgent help', 'need urgent help', 'help asap', 'asap', 'urgent', 'right now'];
const frustrationKeywords = ['frustrated', 'annoyed', 'upset', 'this is ridiculous', 'still not working', 'unhappy'];
const humanInterventionKeywords = ['billing issue', 'billing problem', 'invoice issue', 'payment failed', 'cannot access', 'cant access', 'locked out', 'portal not working', 'my account', 'need someone to do it', 'please handle this for me'];
const aiFailureKeywords = ['that did not help', 'that didnt help', 'did not help', 'didnt help', 'still did not help', 'still didnt help', 'not helpful', 'still need help', 'you did not answer', 'you didnt answer', 'that does not answer', 'that doesnt answer', 'can i speak to someone instead', 'this is going nowhere'];

function buildSubject(sourcePage, name) {
  const pageLabel = (sourcePage || '/').replace('/', '') || 'home';
  return `Website message from ${name} (${pageLabel})`;
}

function uniqueById(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function mapPriorityFromUrgency(urgencyLevel) {
  if (urgencyLevel === 'urgent') return 'urgent';
  if (urgencyLevel === 'high') return 'high';
  if (urgencyLevel === 'low') return 'low';
  return 'normal';
}

function mapStatusFromAiMode(aiMode) {
  if (aiMode === 'closed') return 'closed';
  if (aiMode === 'ai_active') return 'waiting_on_customer';
  return 'waiting_on_admin';
}

function includesAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function normalizeText(value) {
  return String(value || '').toLowerCase();
}

function countAssistantReplies(priorMessages = []) {
  return Array.isArray(priorMessages)
    ? priorMessages.filter((item) => item?.sender_type === 'system').length
    : 0;
}

function hasAiFailedAfterMultipleReplies(text, priorMessages = []) {
  return countAssistantReplies(priorMessages) >= 2 && includesAny(text, aiFailureKeywords);
}

function isConversationClearlyComplete(text) {
  return includesAny(text, ['thanks', 'thank you', 'all good', 'got it', 'perfect']);
}

function sanitizeAdminSummary(value, latestMessage, visitorName) {
  const raw = String(value || '').replace(/\s+/g, ' ').trim();
  const cleaned = raw
    .replace(/\b(category|urgency|general|sales|support|onboarding)\s*:\s*/gi, '')
    .replace(/\bwho the visitor is\b/gi, '')
    .replace(/\bwhat they need\b/gi, '')
    .trim();

  if (cleaned) return cleaned;

  const summarySource = String(latestMessage || '').replace(/\s+/g, ' ').trim().slice(0, 120);
  return `${visitorName || 'Visitor'} needs help with ${summarySource || 'their enquiry'} and is waiting for a reply.`;
}

function detectKeywordCategory(text) {
  const onboardingKeywords = ['already paid', 'paid and need help', 'need help with setup', 'setup help', 'setup question', 'onboarding question', 'onboarding help', 'i just signed up', 'just signed up', 'where is the intake form', 'where is my intake form', 'intake form help', 'intake form', 'intake', 'how do i start setup', 'what happens next', 'change my business details', 'business details', 'connect my tools', 'connect my tool', 'tool connection', 'go live', 'go-live', 'implementation'];
  const salesKeywords = ['pricing', 'price', 'i want pricing', 'book a demo', 'demo', 'get started', 'booking automation', 'ai receptionist', 'crm automation', 'call handling', 'lead capture'];
  const supportKeywords = ['portal issue', 'portal not working', 'non-urgent bug', 'question about current service', 'current service', 'support question', 'bug', 'portal help'];

  if (includesAny(text, onboardingKeywords)) return 'onboarding';
  if (includesAny(text, salesKeywords)) return 'sales';
  if (includesAny(text, supportKeywords)) return 'support';
  return 'general';
}

function detectSalesUseCase(text) {
  if (includesAny(text, ['missed calls', 'missed call', 'lead capture', 'call handling', 'ai receptionist'])) return 'missed_calls';
  if (includesAny(text, ['booking automation', 'bookings', 'calendar', 'appointments', 'scheduling'])) return 'booking_automation';
  if (includesAny(text, ['pricing', 'price', 'cost', 'plan', 'plans'])) return 'pricing';
  if (includesAny(text, ['get started', 'ready to start', 'direct start', 'start now'])) return 'direct_start';
  if (includesAny(text, ['enterprise', 'custom', 'multiple teams', 'multi-site', 'multi site', 'complex workflow', 'custom integration'])) return 'complex_custom';
  return 'general_sales';
}

function inferSalesPlanFit(text, salesUseCase) {
  if (salesUseCase === 'complex_custom' || includesAny(text, ['enterprise', 'multiple teams', 'multi-site', 'multi site', 'custom workflow', 'custom integration'])) return 'Enterprise';
  if (salesUseCase === 'booking_automation' || includesAny(text, ['crm', 'follow-up', 'follow up', 'calendar', 'booking automation'])) return 'Growth';
  if (salesUseCase === 'missed_calls' || salesUseCase === 'direct_start' || includesAny(text, ['ai receptionist', 'lead capture', 'call handling'])) return 'Starter';
  return 'Not clear yet';
}

function buildForcedRouting(text, priorMessages = []) {
  const keywordCategory = detectKeywordCategory(text);
  const hasHighIntent = includesAny(text, [...pricingKeywords, ...readyToBookKeywords, ...callMeKeywords]);
  const hasUrgentHelp = includesAny(text, urgentHelpKeywords);
  const hasFrustration = includesAny(text, frustrationKeywords);
  const requiresHumanIntervention = includesAny(text, humanInterventionKeywords);

  if (includesAny(text, explicitHumanKeywords)) {
    return {
      ai_mode: 'human_required',
      enquiry_category: keywordCategory === 'general' ? 'support' : keywordCategory,
      urgency_level: 'high',
      ai_handover_reason: 'Visitor explicitly requested a human response.',
    };
  }

  if (hasUrgentHelp) {
    return {
      ai_mode: 'escalated',
      enquiry_category: 'urgent',
      urgency_level: 'urgent',
      ai_handover_reason: 'Visitor needs urgent help and should be handled by a human immediately.',
    };
  }

  if (hasHighIntent) {
    return {
      ai_mode: 'human_required',
      enquiry_category: 'sales',
      urgency_level: 'high',
      ai_handover_reason: 'Visitor shows clear buying intent and needs a fast human follow-up.',
    };
  }

  if (hasAiFailedAfterMultipleReplies(text, priorMessages)) {
    return {
      ai_mode: 'human_required',
      enquiry_category: keywordCategory === 'general' ? 'support' : keywordCategory,
      urgency_level: 'high',
      ai_handover_reason: 'AI has already replied multiple times and the visitor still needs human help.',
    };
  }

  if (hasFrustration) {
    return {
      ai_mode: 'human_required',
      enquiry_category: keywordCategory === 'general' ? 'support' : keywordCategory,
      urgency_level: 'high',
      ai_handover_reason: 'Visitor sounds unhappy and needs a human follow-up.',
    };
  }

  if (requiresHumanIntervention) {
    return {
      ai_mode: 'human_required',
      enquiry_category: keywordCategory === 'general' ? 'support' : keywordCategory,
      urgency_level: keywordCategory === 'onboarding' ? 'normal' : 'high',
      ai_handover_reason: 'This issue likely needs a human to review or action directly.',
    };
  }

  if (keywordCategory === 'onboarding') return { ai_mode: 'ai_active', enquiry_category: 'onboarding', urgency_level: 'normal', ai_handover_reason: null };
  if (keywordCategory === 'sales') return { ai_mode: 'ai_active', enquiry_category: 'sales', urgency_level: 'normal', ai_handover_reason: null };
  if (keywordCategory === 'support') return { ai_mode: 'ai_active', enquiry_category: 'support', urgency_level: 'normal', ai_handover_reason: null };

  return null;
}

function ensureAllowed(value, allowedValues, fallback) {
  return allowedValues.includes(value) ? value : fallback;
}

function buildFallbackResponse({ visitorName, visitorEmail, visitorPhone, aiMode, enquiryCategory, handoverReason, rawText }) {
  const greeting = visitorName ? `Hi ${visitorName},` : 'Hi,';

  if (aiMode === 'escalated') {
    return `${greeting} I’m AssistantAI Assistant. I’m passing this to our team now so they can help properly. We’ve already captured the main issue and urgency. ${visitorPhone || visitorEmail ? 'You do not need to repeat yourself.' : 'If useful, reply with your best phone or email so the team can reach you faster.'}`;
  }

  if (aiMode === 'human_required') {
    return `${greeting} I’m AssistantAI Assistant. I’m passing this to our team so they can help properly.${handoverReason ? ` I’ve noted that ${handoverReason.toLowerCase()}.` : ''} ${visitorPhone || visitorEmail ? 'They now have enough context to reply quickly.' : 'If you want a faster follow-up, reply with your best phone or email.'}`;
  }

  if (enquiryCategory === 'sales') {
    const salesUseCase = detectSalesUseCase(rawText || '');

    if (salesUseCase === 'missed_calls') return `${greeting} I’m AssistantAI Assistant. AssistantAI can answer calls, capture lead details, and automate follow-up so missed enquiries do not just disappear. If that is your main problem, Starter is often the best fit. What type of business are you in, and how often are missed calls happening?`;
    if (salesUseCase === 'booking_automation') return `${greeting} I’m AssistantAI Assistant. AssistantAI can support a cleaner booking flow with lead capture, calendar handling, and follow-up automation. Growth is usually the best fit for that type of workflow. Is your main priority more bookings, less admin, or better follow-up?`;
    if (salesUseCase === 'pricing') return `${greeting} I’m AssistantAI Assistant. Broadly, Starter is for businesses starting with AI call handling and lead capture, Growth is for booking automation, CRM sync, and follow-up, and Enterprise is for more complex workflows or teams. If you already know you want Starter or Growth, the best next step is Get Started Now. If the workflow is more custom, Book Free Strategy Call is the better fit.`;
    if (salesUseCase === 'direct_start') return `${greeting} I’m AssistantAI Assistant. If you are ready to move now, Starter or Growth can go through the Get Started Now path, while more complex or custom setups are better suited to a Book Free Strategy Call first. What business are you in, and what do you want the system to handle first?`;
    if (salesUseCase === 'complex_custom') return `${greeting} I’m AssistantAI Assistant. This sounds more custom, so the best next step is usually Book Free Strategy Call. That gives the team room to map the workflow properly and recommend the right scope. What is the main workflow or outcome you want solved first?`;
    return `${greeting} I’m AssistantAI Assistant. It sounds like you’re exploring whether AssistantAI is the right fit. What type of business are you in, what is the main problem, and how urgent is it for you to solve?`;
  }

  if (enquiryCategory === 'onboarding') {
    return `${greeting} I’m AssistantAI Assistant. I can help with onboarding guidance. To point you in the right direction, what stage are you at right now — intake, setup, tool connection, or go-live?`;
  }

  return `${greeting} I’m AssistantAI Assistant. I can help qualify your enquiry and guide you to the right next step. Could you share a little more about what you need help with so I can route this correctly?`;
}

function getErrorMessage(error) {
  if (error && typeof error === 'object' && 'message' in error) return String(error.message);
  return 'Unknown error';
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizePhone(value) {
  return String(value || '').trim().replace(/\s+/g, '');
}

function readSecretValue(name) {
  const raw = String(Deno.env.get(name) || '').trim();
  const prefix = `${name}=`;
  return raw.startsWith(prefix) ? raw.slice(prefix.length).trim() : raw;
}

function buildEventKey(uniqueKey) {
  return `event_key:${uniqueKey}`;
}

function serializeDetails(details) {
  if (!details) return '';
  if (typeof details === 'string') return details;
  try {
    return JSON.stringify(details);
  } catch {
    return String(details);
  }
}

function buildProviderMessage(uniqueKey, details) {
  const text = serializeDetails(details);
  return text ? `${buildEventKey(uniqueKey)}\n${text}` : buildEventKey(uniqueKey);
}

function buildAdminUrl(path) {
  const trimmedPath = String(path || '').trim();
  if (!trimmedPath) return '';
  const appId = String(Deno.env.get('BASE44_APP_ID') || '').trim();
  if (!appId) return trimmedPath;
  return `https://app.base44.com/apps/${appId}${trimmedPath.startsWith('/') ? trimmedPath : `/${trimmedPath}`}`;
}

function formatHumanLabel(value, fallback) {
  const raw = String(value || '').trim();
  if (!raw) return fallback;
  if (raw === 'general') return 'General enquiry';
  return raw.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildAlertPresentation(title, message, metadata, priority) {
  const leadName = metadata?.full_name || metadata?.business_name || 'New contact';
  const channelLabel = metadata?.channel_label || (metadata?.conversation_id ? 'Chat' : 'Lead');
  const waitLabel = metadata?.wait_label || 'Just now';
  const summary = String(metadata?.intent_summary || metadata?.message_preview || message || title || '').trim();
  const adminUrl = buildAdminUrl(metadata?.admin_link);
  const categoryLabel = formatHumanLabel(metadata?.enquiry_category, 'General enquiry');
  const urgencyLabel = formatHumanLabel(metadata?.urgency_level, 'Normal');
  const recommendedAction = formatHumanLabel(metadata?.recommended_action, metadata?.mobile_number ? 'Call lead' : 'Reply now');

  return { leadName, channelLabel, waitLabel, summary, adminUrl, categoryLabel, urgencyLabel, recommendedAction, priorityLabel: priority === 'high' || priority === 'urgent' ? 'High Priority' : 'Needs Review' };
}

function buildEmailBody(title, message, metadata, priority) {
  const alert = buildAlertPresentation(title, message, metadata, priority);
  return {
    text: [title, `${alert.leadName}${alert.channelLabel ? ` · ${alert.channelLabel}` : ''}`, alert.summary || message, `Category: ${alert.categoryLabel}`, `Urgency: ${alert.urgencyLabel}`, `Waiting: ${alert.waitLabel}`, `Next action: ${alert.recommendedAction}`, alert.adminUrl ? `Reply now:\n${alert.adminUrl}` : null].filter(Boolean).join('\n'),
    html: ['<div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a;padding:12px 0;">', `<div style="font-size:22px;font-weight:700;margin-bottom:10px;">${title}</div>`, `<div style="font-size:15px;color:#334155;margin-bottom:8px;">${alert.leadName}${alert.channelLabel ? ` · ${alert.channelLabel}` : ''}</div>`, '<div style="border:1px solid #e2e8f0;border-radius:16px;padding:16px;background:#f8fafc;">', `<div style="font-size:15px;font-weight:600;margin-bottom:10px;">${alert.summary || message}</div>`, `<div style="font-size:14px;color:#475569;margin-bottom:6px;"><strong>Category:</strong> ${alert.categoryLabel}</div>`, `<div style="font-size:14px;color:#475569;margin-bottom:6px;"><strong>Urgency:</strong> ${alert.urgencyLabel}</div>`, `<div style="font-size:14px;color:#475569;margin-bottom:6px;"><strong>Waiting:</strong> ${alert.waitLabel}</div>`, `<div style="font-size:14px;color:#475569;"><strong>Next action:</strong> ${alert.recommendedAction}</div>`, '</div>', alert.adminUrl ? `<div style="margin-top:14px;"><div style="font-size:13px;color:#64748b;margin-bottom:8px;">Reply now</div><a href="${alert.adminUrl}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:12px;font-size:14px;font-weight:700;">Open Conversation</a></div>` : '', '</div>'].join(''),
  };
}

function buildSmsAlertMessage(title, message, metadata, priority) {
  const alert = buildAlertPresentation(title, message, metadata, priority);
  return [title, `${alert.leadName}${alert.channelLabel ? ` · ${alert.channelLabel}` : ''}`, alert.summary || message, `Category: ${alert.categoryLabel}`, `Urgency: ${alert.urgencyLabel}`, `Waiting: ${alert.waitLabel}`, `Next action: ${alert.recommendedAction}`, alert.adminUrl ? `Reply now:\n${alert.adminUrl}` : null].filter(Boolean).join('\n').slice(0, 480);
}

function getProviderMessageId(data) {
  return data?.sid || data?.id || data?.messageId || data?.message_id || null;
}

function mapTwilioSmsDeliveryStatus(status) {
  const normalized = String(status || '').trim().toLowerCase();
  if (!normalized || ['queued', 'accepted', 'scheduled', 'sending'].includes(normalized)) return 'queued';
  if (normalized === 'sent') return 'sent';
  if (['delivered', 'received', 'read'].includes(normalized)) return 'delivered';
  if (normalized === 'undelivered') return 'undelivered';
  if (['failed', 'canceled', 'cancelled'].includes(normalized)) return 'failed';
  return 'queued';
}

async function sendResendEmail(to, subject, body) {
  const apiKey = readSecretValue('RESEND_API_KEY');
  const fromEmail = readSecretValue('RESEND_FROM_EMAIL');
  const destination = normalizeEmail(to);
  if (!apiKey || !fromEmail || !destination) return { status: 'not_configured', details: 'Resend API key, sender email, or destination email are missing.', providerMessageId: null, providerResponse: null, fromEmail: fromEmail || null };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: fromEmail, to: [destination], subject, text: body.text, html: body.html }),
  });

  const resultText = await response.text();
  let parsed = null;
  try { parsed = JSON.parse(resultText); } catch { parsed = null; }
  if (!response.ok) return { status: 'failed', details: parsed?.message || parsed?.error || resultText || 'Resend email send failed.', providerMessageId: parsed?.id || null, providerResponse: parsed || resultText || null, fromEmail };
  return { status: 'provider_accepted', details: 'Email accepted by Resend.', providerMessageId: parsed?.id || null, providerResponse: parsed || resultText || null, fromEmail };
}

async function sendTwilioSms(message, to) {
  const accountSid = String(readSecretValue('TWILIO_ACCOUNT_SID') || '').trim();
  const authToken = String(readSecretValue('TWILIO_AUTH_TOKEN') || '').trim();
  const fromNumber = normalizePhone(readSecretValue('TWILIO_FROM_NUMBER'));
  const destination = normalizePhone(to);
  if (!accountSid || !authToken || !fromNumber || !destination) return { status: 'not_configured', details: 'Twilio credentials, from number, or destination number are missing.', providerMessageId: null, providerResponse: null, providerStatus: null, providerErrorCode: null, fromNumberUsed: fromNumber || null };

  const body = new URLSearchParams({ From: fromNumber, To: destination, Body: message });
  const auth = btoa(`${accountSid}:${authToken}`);
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const resultText = await response.text();
  let parsed = null;
  try { parsed = JSON.parse(resultText); } catch { parsed = null; }
  if (!response.ok) return { status: 'failed', details: parsed?.message || resultText || 'Twilio SMS send failed.', providerMessageId: getProviderMessageId(parsed), providerResponse: parsed || resultText || null, providerStatus: parsed?.status || null, providerErrorCode: parsed?.error_code ? String(parsed.error_code) : null, fromNumberUsed: fromNumber };
  return { status: mapTwilioSmsDeliveryStatus(parsed?.status), details: parsed?.status || 'Twilio SMS accepted by Twilio.', providerStatus: parsed?.status || null, providerMessageId: getProviderMessageId(parsed), providerResponse: parsed || resultText || null, providerErrorCode: parsed?.error_code ? String(parsed.error_code) : null, fromNumberUsed: parsed?.from || fromNumber };
}

async function evaluatePublicConversation(base44, payload) {
  const { visitorName, visitorEmail, visitorPhone, subject, latestMessage, sourcePage, priorMessages = [] } = payload;
  const transcript = Array.isArray(priorMessages)
    ? priorMessages.slice(-6).map((item) => `${item.sender_type || 'unknown'}: ${item.message_body || ''}`).join('\n')
    : '';
  const combinedText = normalizeText([subject, latestMessage, transcript].filter(Boolean).join('\n'));
  const forcedRouting = buildForcedRouting(combinedText, priorMessages);

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are AssistantAI Assistant for AssistantAI, a premium AI receptionist and enquiry automation business.

Your job in support chat:
- respond instantly but honestly
- qualify the enquiry
- guide the visitor to the best next step
- escalate to a human when needed

Rules:
- Never pretend to be human
- Always refer to yourself as "AssistantAI Assistant" or "AI Assistant"
- Keep responses concise, clear, premium, and commercially intelligent
- Never invent features, integrations, testimonials, case studies, pricing, performance claims, or guarantees
- Do not give legal, financial, technical, uptime, or implementation guarantees
- Only escalate when the visitor explicitly asks for a human, shows clear high intent (pricing, quote, ready to book, call me, wants to proceed now, urgent help), the AI has already failed after multiple replies, the visitor sounds unhappy, or the issue clearly needs human intervention
- Do not escalate general questions, early-stage chats, low-intent chats, simple FAQs, or broad browsing questions
- Before handing over, gather or confirm the most useful qualification details you can from the conversation: name, phone/email if possible, short intent summary, category, and urgency
- For pricing questions, keep the answer brief and useful, then hand over only when the visitor clearly wants to move now
- For sales leads, identify the most likely use case, briefly explain the most relevant AssistantAI outcome, and suggest only the best next step
- Ask for business type, main problem, urgency, and likely fit when they are missing
- For direct-start sales intent, suggest Get Started Now when Starter or Growth seems to fit
- For complex or custom intent, suggest Book Free Strategy Call
- For onboarding questions, guide toward the right onboarding next step such as intake, setup guidance, tool connection, or team follow-up
- For operational issues, route to support or escalate
- Ask one clarifying question when useful
- When handing over, do not say you cannot help; say you are passing this to the team so they can help properly

Classification rules:
- sales = new system interest, pricing interest, bookings automation, lead capture, demos, fit checks
- onboarding = setup, implementation, integrations, intake, go-live, onboarding help, signed-up questions, intake form questions, business detail changes, and tool connection questions
- support = standard support questions that are not urgent
- urgent = broken system, outage, blocked payment issue, urgent operational problem
- general = everything else

Sales handling:
- missed calls or lead capture = explain AI call answering, detail capture, and automated follow-up
- booking automation = explain calendar flow, lead capture, and follow-up automation
- pricing = explain Starter, Growth, Enterprise briefly and accurately
- direct-start intent = guide to Get Started Now when Starter or Growth is the likely fit
- complex or custom intent = guide to Book Free Strategy Call

Plan guidance:
- Starter = $497/month + $1,500 setup, best for businesses starting with AI call handling and lead capture
- Growth = $1,500/month + $3,000 setup, best for voice AI, booking automation, CRM sync, and follow-up
- Enterprise = $3,000+/month + $7,500+ setup, best for advanced workflows, multiple teams, or complex integration requirements

Context:
- Visitor name: ${visitorName || 'Unknown'}
- Visitor email: ${visitorEmail || 'Not provided'}
- Visitor phone: ${visitorPhone || 'Not provided'}
- Subject: ${subject || 'Not provided'}
- Source page: ${sourcePage || '/'}
- Latest message: ${latestMessage}
- Prior visible messages:\n${transcript || 'None'}
- Forced routing: ${forcedRouting ? JSON.stringify(forcedRouting) : 'none'}

Return a JSON object with:
- ai_mode
- enquiry_category
- urgency_level
- ai_summary
- ai_handover_reason
- likely_use_case
- likely_plan_fit
- response

The ai_summary must be one plain-English line for an admin alert.
It must say what the visitor wants, what the AI already said or asked, and what should happen next.
Do not use vague labels like "general" or write category-style text such as "Category: sales".

The response should be concise, honest, action-oriented, and suitable for a premium brand.`,
    response_json_schema: {
      type: 'object',
      properties: {
        ai_mode: { type: 'string' },
        enquiry_category: { type: 'string' },
        urgency_level: { type: 'string' },
        ai_summary: { type: 'string' },
        ai_handover_reason: { anyOf: [{ type: 'string' }, { type: 'null' }] },
        likely_use_case: { type: 'string' },
        likely_plan_fit: { type: 'string' },
        response: { type: 'string' }
      },
      required: ['ai_mode', 'enquiry_category', 'urgency_level', 'ai_summary', 'response']
    }
  });

  const forcedAiMode = forcedRouting?.ai_mode || (result?.ai_mode === 'closed' && isConversationClearlyComplete(combinedText) ? 'closed' : 'ai_active');
  const ai_mode = ensureAllowed(forcedAiMode, allowedAiModes, 'ai_active');
  const enquiry_category = ensureAllowed(forcedRouting?.enquiry_category || result?.enquiry_category, allowedCategories, 'general');
  const urgency_level = ensureAllowed(forcedRouting?.urgency_level || result?.urgency_level, allowedUrgencyLevels, ai_mode === 'escalated' ? 'urgent' : ai_mode === 'human_required' ? 'high' : 'normal');
  const ai_handover_reason = forcedRouting?.ai_handover_reason || result?.ai_handover_reason || null;
  const likely_use_case = result?.likely_use_case || (enquiry_category === 'sales' ? detectSalesUseCase(combinedText) : 'n/a');
  const likely_plan_fit = result?.likely_plan_fit || (enquiry_category === 'sales' ? inferSalesPlanFit(combinedText, likely_use_case) : 'n/a');
  const response = result?.response || buildFallbackResponse({ visitorName, visitorEmail, visitorPhone, aiMode: ai_mode, enquiryCategory: enquiry_category, handoverReason: ai_handover_reason, rawText: combinedText });
  const ai_summary = sanitizeAdminSummary(result?.ai_summary, latestMessage, visitorName);

  return { ai_mode, enquiry_category, urgency_level, ai_summary, ai_handover_reason, likely_use_case, likely_plan_fit, response };
}

async function createPublicAlert(base44, payload) {
  const { eventType, entityName, entityId, clientAccountId = null, title, message, actorEmail = null, metadata = {}, uniqueKey, priority = 'normal', smsMessage } = payload;
  const triggeredAt = new Date().toISOString();
  const configuredAdminEmail = normalizeEmail(Deno.env.get('ADMIN_NOTIFICATION_EMAIL'));
  const configuredAdminPhone = normalizePhone(Deno.env.get('ADMIN_NOTIFICATION_PHONE'));
  const emailBody = buildEmailBody(title, message, metadata, priority);
  const textMessage = buildSmsAlertMessage(title, smsMessage || message, metadata, priority);

  const inApp = await base44.asServiceRole.entities.NotificationLog.create({
    event_type: eventType,
    entity_name: entityName,
    entity_id: entityId,
    client_account_id: clientAccountId,
    recipient_role: 'admin',
    recipient_email: configuredAdminEmail || null,
    channel: 'in_app',
    delivery_status: 'stored',
    provider_name: 'AssistantAI Alerts',
    provider_message: buildProviderMessage(uniqueKey),
    title,
    message,
    triggered_at: triggeredAt,
    actor_email: actorEmail,
    metadata,
  });

  let emailResult = { status: 'not_attempted' };
  if (configuredAdminEmail) {
    const sentEmail = await sendResendEmail(configuredAdminEmail, priority === 'high' || priority === 'urgent' ? `[High Priority] ${title}` : title, emailBody);
    await base44.asServiceRole.entities.NotificationLog.create({
      event_type: eventType,
      entity_name: entityName,
      entity_id: entityId,
      client_account_id: clientAccountId,
      recipient_role: 'admin',
      recipient_email: configuredAdminEmail,
      channel: 'email',
      delivery_status: sentEmail.status,
      provider_name: 'Resend',
      provider_message: buildProviderMessage(uniqueKey, { status: sentEmail.status, provider_message_id: sentEmail.providerMessageId, provider_response: sentEmail.providerResponse, error: sentEmail.details }),
      title,
      message,
      triggered_at: triggeredAt,
      actor_email: actorEmail,
      metadata: { ...metadata, email_provider_message_id: sentEmail.providerMessageId || null, email_error: sentEmail.status === 'failed' ? sentEmail.details : null, email_from_address: sentEmail.fromEmail || null },
    });
    emailResult = sentEmail;
  }

  let smsResult = { status: 'not_attempted' };
  if (configuredAdminPhone) {
    const sentSms = await sendTwilioSms(textMessage, configuredAdminPhone);
    await base44.asServiceRole.entities.NotificationLog.create({
      event_type: eventType,
      entity_name: entityName,
      entity_id: entityId,
      client_account_id: clientAccountId,
      recipient_role: 'admin',
      recipient_email: configuredAdminPhone,
      channel: 'sms',
      delivery_status: sentSms.status,
      provider_name: 'Twilio',
      provider_message: buildProviderMessage(uniqueKey, { status: sentSms.status, provider_message_id: sentSms.providerMessageId, provider_status: sentSms.providerStatus, provider_response: sentSms.providerResponse, error: sentSms.details, from_number_used: sentSms.fromNumberUsed }),
      provider_message_id: sentSms.providerMessageId || null,
      provider_status: sentSms.providerStatus || null,
      provider_error_code: sentSms.providerErrorCode || null,
      provider_error_message: ['failed', 'undelivered'].includes(sentSms.status) ? sentSms.details : null,
      title,
      message: textMessage,
      triggered_at: triggeredAt,
      delivered_at: sentSms.status === 'delivered' ? triggeredAt : null,
      failed_at: ['failed', 'undelivered'].includes(sentSms.status) ? triggeredAt : null,
      actor_email: actorEmail,
      metadata: { ...metadata, sms_provider_message_id: sentSms.providerMessageId || null, sms_provider_status: sentSms.providerStatus || null, sms_error: ['failed', 'undelivered'].includes(sentSms.status) ? sentSms.details : null, sms_from_number_used: sentSms.fromNumberUsed || null },
    });
    smsResult = sentSms;
  }

  return { in_app: inApp.id, email: emailResult.status, sms: smsResult.status };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { name, email, mobile, message, sourcePage, runtimeDataEnv } = await req.json();

    if (runtimeDataEnv === 'dev') {
      return Response.json({ error: 'Support messaging is disabled in preview test mode so test actions do not write into production data.' }, { status: 409 });
    }

    if (!name || !email || !message) {
      return Response.json({ error: 'name, email, and message are required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const preview = message.slice(0, 180);
    const subject = buildSubject(sourcePage, name);
    const byEmail = email ? await base44.asServiceRole.entities.Lead.filter({ email }, '-updated_date', 10) : [];
    const byMobile = mobile ? await base44.asServiceRole.entities.Lead.filter({ mobile_number: mobile }, '-updated_date', 10) : [];
    const matchedLeads = uniqueById([...byEmail, ...byMobile]);
    const matchedLead = matchedLeads.length === 1 ? matchedLeads[0] : null;
    const aiResult = await evaluatePublicConversation(base44, {
      visitorName: name,
      visitorEmail: email,
      visitorPhone: mobile || '',
      subject,
      latestMessage: message,
      sourcePage: sourcePage || '/',
      priorMessages: [],
    });

    const conversation = await base44.asServiceRole.entities.SupportConversation.create({
      created_at: now,
      updated_at: now,
      status: mapStatusFromAiMode(aiResult.ai_mode),
      source_type: 'public_site',
      source_page: sourcePage || '/',
      visitor_name: name,
      visitor_email: email,
      visitor_phone: mobile || '',
      subject,
      assigned_admin_id: null,
      linked_lead_id: matchedLead?.id || null,
      linked_client_account_id: matchedLead?.client_account_id || null,
      unread_for_admin: true,
      unread_for_client: false,
      last_message_at: now,
      last_message_preview: preview,
      priority: mapPriorityFromUrgency(aiResult.urgency_level),
      ai_mode: aiResult.ai_mode,
      enquiry_category: aiResult.enquiry_category,
      urgency_level: aiResult.urgency_level,
      ai_summary: aiResult.ai_summary,
      ai_last_response_at: aiResult.response ? now : null,
      ai_handover_reason: aiResult.ai_handover_reason || null,
    });

    const firstMessage = await base44.asServiceRole.entities.SupportMessage.create({
      conversation_id: conversation.id,
      sender_type: 'visitor',
      sender_user_id: null,
      sender_name: name,
      sender_email: email,
      message_body: message,
      attachment_url: null,
      created_at: now,
      is_internal_note: false,
    });

    const aiMessage = aiResult.response
      ? await base44.asServiceRole.entities.SupportMessage.create({
          conversation_id: conversation.id,
          sender_type: 'system',
          sender_user_id: null,
          sender_name: 'AssistantAI Assistant',
          sender_email: 'assistant@assistantai.com.au',
          message_body: aiResult.response,
          attachment_url: null,
          created_at: now,
          is_internal_note: false,
        })
      : null;

    await base44.asServiceRole.entities.NotificationLog.create({
      event_type: 'support_conversation_created',
      entity_name: 'SupportConversation',
      entity_id: conversation.id,
      client_account_id: conversation.linked_client_account_id || null,
      recipient_role: 'admin',
      recipient_email: null,
      channel: 'in_app',
      delivery_status: 'stored',
      provider_name: 'SupportChat',
      provider_message: 'Stored for internal admin review. No external delivery configured yet.',
      title: 'New public support conversation',
      message: `${name} started a new ${aiResult.enquiry_category} conversation from ${sourcePage || '/'}.`,
      triggered_at: now,
      actor_email: email,
      metadata: {
        conversation_id: conversation.id,
        source_page: sourcePage || '/',
        linked_lead_id: conversation.linked_lead_id || null,
        ai_mode: aiResult.ai_mode,
        enquiry_category: aiResult.enquiry_category,
        urgency_level: aiResult.urgency_level,
      },
    });

    let alertResults = null;
    if (['human_required', 'escalated'].includes(aiResult.ai_mode)) {
      alertResults = await createPublicAlert(base44, {
        eventType: 'support_conversation_created',
        entityName: 'SupportConversation',
        entityId: conversation.id,
        clientAccountId: conversation.linked_client_account_id || null,
        title: aiResult.ai_mode === 'escalated' || aiResult.enquiry_category === 'sales' ? 'High-intent chat needs reply' : 'Chat needs human reply',
        message: aiResult.ai_summary || preview,
        actorEmail: email,
        uniqueKey: `chat_handover_create:${conversation.id}:${aiResult.ai_mode}:${now}`,
        priority: ['urgent', 'high'].includes(aiResult.urgency_level) ? 'high' : 'normal',
        smsMessage: aiResult.ai_summary || preview,
        metadata: {
          conversation_id: conversation.id,
          admin_link: `/ActionInbox?view=needs_reply_now&conversationId=${conversation.id}&focusReply=1`,
          full_name: name,
          business_name: matchedLead?.business_name || '',
          email,
          mobile_number: mobile || '',
          enquiry_category: aiResult.enquiry_category,
          urgency_level: aiResult.urgency_level,
          message_preview: preview,
          intent_summary: aiResult.ai_summary || preview,
          wait_label: 'Just now',
          channel_label: 'Chat',
          cta_label: 'Reply Now',
          recommended_action: mobile ? 'Call lead' : 'Reply now',
          source_page: sourcePage || '/',
          ai_mode: aiResult.ai_mode,
          ai_handover_reason: aiResult.ai_handover_reason || null,
          ai_summary: aiResult.ai_summary,
        },
      });
    }

    return Response.json({
      conversation,
      messages: aiMessage ? [firstMessage, aiMessage] : [firstMessage],
      alerts: alertResults,
    });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
});