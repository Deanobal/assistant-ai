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

function mapConversationPriority(aiResult) {
  const basePriority = mapPriorityFromUrgency(aiResult?.urgency_level);
  if (basePriority === 'urgent') return 'urgent';
  if (aiResult?.high_value_lead || aiResult?.sales_intent_level === 'high') return 'high';
  return basePriority;
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

const featureStatusLabels = ['fully live', 'partially implemented', 'UI present but not connected', 'planned / future'];

const supportKnowledge = [
  {
    category: 'integrations',
    feature_status: 'partially implemented',
    supported_use_case: ['Google Calendar is live for strategy-call availability and booking.', 'Integration cards can show stored connection state.'],
    limitations: ['Do not imply an app is connected just because a card exists.', 'If connection state is unknown, say supported but not confirmed connected.'],
    troubleshooting_steps: ['Clarify whether the user means supported, connected, or needing setup help.'],
    approved_links: ['/Integrations', '/BookStrategyCall', '/ClientPortal'],
    escalation_owner: 'implementation/support',
    escalation_threshold: 'Manual setup, failed sync, or account-specific connection checks.'
  },
  {
    category: 'billing',
    feature_status: 'partially implemented',
    supported_use_case: ['Billing structure, billing records, and Stripe-related architecture exist in the app.'],
    limitations: ['Do not imply end-to-end billing is fully live just because billing UI exists.', 'Do not imply payment flow is fully active for a client unless confirmed.'],
    troubleshooting_steps: ['Clarify whether the user means billing UI, payment status, invoice history, or fully active live billing.'],
    approved_links: ['/Pricing', '/ClientPortal'],
    escalation_owner: 'billing/ops',
    escalation_threshold: 'Payment, refund, invoice, charge, or account-specific billing issue.'
  },
  {
    category: 'booking',
    feature_status: 'partially implemented',
    supported_use_case: ['Strategy calls can use real Google Calendar slots and create real events when booking succeeds.'],
    limitations: ['Do not imply a booking is confirmed unless a real slot is verified and the calendar event is created.', 'If live availability is unavailable, treat it as request mode or pending.'],
    troubleshooting_steps: ['Differentiate between live slot booking and a booking request.'],
    approved_links: ['/BookStrategyCall'],
    escalation_owner: 'sales/onboarding',
    escalation_threshold: 'User cannot complete a booking or needs manual scheduling help.'
  },
  {
    category: 'client_portal',
    feature_status: 'partially implemented',
    supported_use_case: ['Client login and support threads are live.', 'Portal sections for billing, analytics, integrations, and support are present.'],
    limitations: ['Do not imply every portal section is fully self-serve or fully live end to end.'],
    troubleshooting_steps: ['Clarify which portal area is affected and whether the issue is access, visibility, or a missing live workflow.'],
    approved_links: ['/ClientLogin', '/ClientPortal'],
    escalation_owner: 'support',
    escalation_threshold: 'Portal access issue or account-specific portal help is needed.'
  },
  {
    category: 'notifications',
    feature_status: 'partially implemented',
    supported_use_case: ['In-app notification logs exist.', 'Selected admin alerts can send email and SMS.'],
    limitations: ['Do not imply every notification goes to phone in real time.', 'Do not imply all user-facing notifications are fully live.'],
    troubleshooting_steps: ['Clarify which event, audience, and channel the user means.'],
    approved_links: ['/ClientPortal'],
    escalation_owner: 'support/ops',
    escalation_threshold: 'Delivery investigation or request for guaranteed real-time phone alerts.'
  },
  {
    category: 'analytics',
    feature_status: 'partially implemented',
    supported_use_case: ['Analytics can use live Lead and CallRecord data when records exist.'],
    limitations: ['Do not imply analytics are real if the data may be empty, sample, seeded, or mock.'],
    troubleshooting_steps: ['Clarify whether the user means live entity-backed analytics or a demo/sample surface.'],
    approved_links: ['/Platform', '/ClientPortal'],
    escalation_owner: 'support/data',
    escalation_threshold: 'Missing data, mismatched data, or live analytics expectations are not met.'
  },
  {
    category: 'support_workflows',
    feature_status: 'partially implemented',
    supported_use_case: ['Website chat can answer, clarify, and escalate to admins when needed.'],
    limitations: ['Do not imply the AI can inspect private systems or confirm unknown account state.'],
    troubleshooting_steps: ['Clarify the issue, urgency, affected page, and any error text.'],
    approved_links: ['/Contact', '/ClientPortal'],
    escalation_owner: 'support',
    escalation_threshold: 'Urgent issue, billing/account issue, explicit human request, or low confidence.'
  }
];

function buildSupportKnowledgeText() {
  return supportKnowledge.map((entry) => [
    `Category: ${entry.category}`,
    `Feature status: ${entry.feature_status}`,
    `Supported use case: ${entry.supported_use_case.join(' ')}`,
    `Limitations: ${entry.limitations.join(' ')}`,
    `Troubleshooting steps: ${entry.troubleshooting_steps.join(' ')}`,
    `Approved links: ${entry.approved_links.join(', ')}`,
    `Escalation owner: ${entry.escalation_owner}`,
    `Escalation threshold: ${entry.escalation_threshold}`,
  ].join('\n')).join('\n\n');
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
  const aiResponse = await base44.asServiceRole.functions.invoke('publicSupportAssistant', payload);
  return aiResponse?.data || aiResponse;
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
      priority: mapConversationPriority(aiResult),
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
        issue_category: aiResult.issue_category || null,
        confidence_level: aiResult.confidence_level || null,
        steps_taken: aiResult.steps_taken || null,
        recommended_next_action: aiResult.recommended_next_action || null,
        sales_intent_level: aiResult.sales_intent_level || null,
        high_value_lead: aiResult.high_value_lead || false,
        captured_business_type: aiResult.captured_business_type || null,
        qualification_needed: aiResult.qualification_needed || [],
      },
    });

    let alertResults = null;
    if (['human_required', 'escalated'].includes(aiResult.ai_mode)) {
      alertResults = await createPublicAlert(base44, {
        eventType: 'support_conversation_created',
        entityName: 'SupportConversation',
        entityId: conversation.id,
        clientAccountId: conversation.linked_client_account_id || null,
        title: aiResult.high_value_lead ? 'High-value lead needs reply' : (aiResult.ai_mode === 'escalated' || aiResult.enquiry_category === 'sales' ? 'High-intent chat needs reply' : 'Chat needs human reply'),
        message: aiResult.ai_summary || preview,
        actorEmail: email,
        uniqueKey: `chat_handover_create:${conversation.id}:${aiResult.ai_mode}:${now}`,
        priority: aiResult.high_value_lead || ['urgent', 'high'].includes(aiResult.urgency_level) ? 'high' : 'normal',
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
          issue_category: aiResult.issue_category || null,
          confidence_level: aiResult.confidence_level || null,
          message_preview: preview,
          intent_summary: aiResult.ai_summary || preview,
          steps_taken: aiResult.steps_taken || null,
          wait_label: 'Just now',
          channel_label: 'Chat',
          cta_label: 'Reply Now',
          recommended_action: aiResult.recommended_next_action || (mobile ? 'Call lead' : 'Reply now'),
          source_page: sourcePage || '/',
          ai_mode: aiResult.ai_mode,
          ai_handover_reason: aiResult.ai_handover_reason || null,
          ai_summary: aiResult.ai_summary,
          sales_intent_level: aiResult.sales_intent_level || null,
          high_value_lead: aiResult.high_value_lead || false,
          captured_business_type: aiResult.captured_business_type || null,
          qualification_needed: aiResult.qualification_needed || [],
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