import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const allowedAiModes = ['ai_active', 'human_required', 'escalated', 'closed'];
const allowedCategories = ['sales', 'onboarding', 'support', 'urgent', 'general'];
const allowedUrgencyLevels = ['low', 'normal', 'high', 'urgent'];

const explicitHumanKeywords = [
  'human',
  'real person',
  'someone from your team',
  'speak to someone',
  'talk to someone',
  'team member',
  'jump in',
  'someone jump in'
];

const pricingKeywords = ['pricing', 'price', 'cost', 'quote'];
const readyToBookKeywords = ['ready to book', 'ready to start', 'book now', 'get started now', 'sign me up', 'start now'];
const callMeKeywords = ['call me', 'call me back', 'give me a call', 'ring me'];
const urgentHelpKeywords = ['urgent help', 'need urgent help', 'help asap', 'asap', 'urgent', 'right now'];
const frustrationKeywords = ['frustrated', 'annoyed', 'upset', 'this is ridiculous', 'still not working', 'unhappy'];
const humanInterventionKeywords = [
  'billing issue',
  'billing problem',
  'invoice issue',
  'payment failed',
  'cannot access',
  'cant access',
  'locked out',
  'portal not working',
  'my account',
  'need someone to do it',
  'please handle this for me'
];
const aiFailureKeywords = [
  'that did not help',
  'that didnt help',
  'did not help',
  'didnt help',
  'still did not help',
  'still didnt help',
  'not helpful',
  'still need help',
  'you did not answer',
  'you didnt answer',
  'that does not answer',
  'that doesnt answer',
  'can i speak to someone instead',
  'this is going nowhere'
];

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

  if (cleaned) {
    return cleaned;
  }

  const summarySource = String(latestMessage || '').replace(/\s+/g, ' ').trim().slice(0, 120);
  return `${visitorName || 'Visitor'} needs help with ${summarySource || 'their enquiry'} and is waiting for a reply.`;
}

function detectKeywordCategory(text) {
  const onboardingKeywords = [
    'already paid',
    'paid and need help',
    'need help with setup',
    'setup help',
    'setup question',
    'onboarding question',
    'onboarding help',
    'i just signed up',
    'just signed up',
    'where is the intake form',
    'where is my intake form',
    'intake form help',
    'intake form',
    'intake',
    'how do i start setup',
    'what happens next',
    'change my business details',
    'business details',
    'connect my tools',
    'connect my tool',
    'tool connection',
    'go live',
    'go-live',
    'implementation'
  ];

  const salesKeywords = [
    'pricing',
    'price',
    'i want pricing',
    'book a demo',
    'demo',
    'get started',
    'booking automation',
    'ai receptionist',
    'crm automation',
    'call handling',
    'lead capture'
  ];

  const supportKeywords = [
    'portal issue',
    'portal not working',
    'non-urgent bug',
    'question about current service',
    'current service',
    'support question',
    'bug',
    'portal help'
  ];

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

function detectOnboardingNeed(text) {
  if (includesAny(text, ['where is the intake form', 'where is my intake form', 'intake form help', 'intake form'])) return 'onboarding_intake';
  if (includesAny(text, ['connect my tools', 'connect my tool', 'tool connection', 'integrations', 'connect tools'])) return 'tool_connection';
  if (includesAny(text, ['change my business details', 'business details', 'update my details'])) return 'business_details';
  if (includesAny(text, ['what happens next', 'just signed up', 'i just signed up', 'how do i start setup'])) return 'next_step';
  return 'general_onboarding';
}

function buildForcedRouting(text, priorMessages = []) {
  const keywordCategory = detectKeywordCategory(text);
  const hasHighIntent = includesAny(text, [...pricingKeywords, ...readyToBookKeywords, ...callMeKeywords]);
  const hasUrgentHelp = includesAny(text, urgentHelpKeywords);
  const hasFrustration = includesAny(text, frustrationKeywords);
  const requiresHumanIntervention = includesAny(text, humanInterventionKeywords);

  if (includesAny(text, explicitHumanKeywords)) {
    return {
      classification_source: 'deterministic_human_request',
      ai_mode: 'human_required',
      enquiry_category: keywordCategory === 'general' ? 'support' : keywordCategory,
      urgency_level: 'high',
      ai_handover_reason: 'Visitor explicitly requested a human response.',
    };
  }

  if (hasUrgentHelp) {
    return {
      classification_source: 'deterministic_urgent_help',
      ai_mode: 'escalated',
      enquiry_category: 'urgent',
      urgency_level: 'urgent',
      ai_handover_reason: 'Visitor needs urgent help and should be handled by a human immediately.',
    };
  }

  if (hasHighIntent) {
    return {
      classification_source: 'deterministic_high_intent',
      ai_mode: 'human_required',
      enquiry_category: 'sales',
      urgency_level: 'high',
      ai_handover_reason: 'Visitor shows clear buying intent and needs a fast human follow-up.',
    };
  }

  if (hasAiFailedAfterMultipleReplies(text, priorMessages)) {
    return {
      classification_source: 'deterministic_ai_failed',
      ai_mode: 'human_required',
      enquiry_category: keywordCategory === 'general' ? 'support' : keywordCategory,
      urgency_level: 'high',
      ai_handover_reason: 'AI has already replied multiple times and the visitor still needs human help.',
    };
  }

  if (hasFrustration) {
    return {
      classification_source: 'deterministic_frustration',
      ai_mode: 'human_required',
      enquiry_category: keywordCategory === 'general' ? 'support' : keywordCategory,
      urgency_level: 'high',
      ai_handover_reason: 'Visitor sounds unhappy and needs a human follow-up.',
    };
  }

  if (requiresHumanIntervention) {
    return {
      classification_source: 'deterministic_human_intervention',
      ai_mode: 'human_required',
      enquiry_category: keywordCategory === 'general' ? 'support' : keywordCategory,
      urgency_level: keywordCategory === 'onboarding' ? 'normal' : 'high',
      ai_handover_reason: 'This issue likely needs a human to review or action directly.',
    };
  }

  if (keywordCategory === 'onboarding') {
    return {
      classification_source: 'deterministic_onboarding',
      ai_mode: 'ai_active',
      enquiry_category: 'onboarding',
      urgency_level: 'normal',
      ai_handover_reason: null,
    };
  }

  if (keywordCategory === 'sales') {
    return {
      classification_source: 'deterministic_sales',
      ai_mode: 'ai_active',
      enquiry_category: 'sales',
      urgency_level: 'normal',
      ai_handover_reason: null,
    };
  }

  if (keywordCategory === 'support') {
    return {
      classification_source: 'deterministic_support',
      ai_mode: 'ai_active',
      enquiry_category: 'support',
      urgency_level: 'normal',
      ai_handover_reason: null,
    };
  }

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

    if (salesUseCase === 'missed_calls') {
      return `${greeting} I’m AssistantAI Assistant. AssistantAI can answer calls, capture lead details, and automate follow-up so missed enquiries do not just disappear. If that is your main problem, Starter is often the best fit. What type of business are you in, and how often are missed calls happening?`;
    }

    if (salesUseCase === 'booking_automation') {
      return `${greeting} I’m AssistantAI Assistant. AssistantAI can support a cleaner booking flow with lead capture, calendar handling, and follow-up automation. Growth is usually the best fit for that type of workflow. Is your main priority more bookings, less admin, or better follow-up?`;
    }

    if (salesUseCase === 'pricing') {
      return `${greeting} I’m AssistantAI Assistant. Broadly, Starter is for businesses starting with AI call handling and lead capture, Growth is for booking automation, CRM sync, and follow-up, and Enterprise is for more complex workflows or teams. If you already know you want Starter or Growth, the best next step is Get Started Now. If the workflow is more custom, Book Free Strategy Call is the better fit.`;
    }

    if (salesUseCase === 'direct_start') {
      return `${greeting} I’m AssistantAI Assistant. If you are ready to move now, Starter or Growth can go through the Get Started Now path, while more complex or custom setups are better suited to a Book Free Strategy Call first. What business are you in, and what do you want the system to handle first?`;
    }

    if (salesUseCase === 'complex_custom') {
      return `${greeting} I’m AssistantAI Assistant. This sounds more custom, so the best next step is usually Book Free Strategy Call. That gives the team room to map the workflow properly and recommend the right scope. What is the main workflow or outcome you want solved first?`;
    }

    return `${greeting} I’m AssistantAI Assistant. It sounds like you’re exploring whether AssistantAI is the right fit. I can help narrow down the likely use case and best next step without overcomplicating it. What type of business are you in, what is the main problem, and how urgent is it for you to solve?`;
  }

  if (enquiryCategory === 'onboarding') {
    const onboardingNeed = detectOnboardingNeed(rawText || '');

    if (onboardingNeed === 'onboarding_intake') {
      return `${greeting} I’m AssistantAI Assistant. This sounds like an onboarding intake question. The right next step is the onboarding intake stage so the team can collect the details needed for setup. If you have not received it yet, our team can follow up with you directly. Have you already been sent the intake form?`;
    }

    if (onboardingNeed === 'tool_connection') {
      return `${greeting} I’m AssistantAI Assistant. Tool connection questions usually sit in onboarding rather than urgent support. The best next step is to confirm which tools you want connected and where you are in setup, then the team can guide the onboarding step properly. Which tools are you trying to connect first?`;
    }

    if (onboardingNeed === 'business_details') {
      return `${greeting} I’m AssistantAI Assistant. Updating business details is usually part of the onboarding process rather than an urgent support issue. The best next step is to note what needs changing so the team can update the setup correctly. Which business details do you need changed?`;
    }

    if (onboardingNeed === 'next_step') {
      return `${greeting} I’m AssistantAI Assistant. This sounds like a new onboarding question. The usual next step is completing the onboarding intake and then moving into setup with team follow-up where needed. Are you looking for the intake step, setup guidance, or an update on what happens next?`;
    }

    return `${greeting} I’m AssistantAI Assistant. I can help with onboarding guidance. To point you in the right direction, what stage are you at right now — intake, setup, tool connection, or go-live?`;
  }

  return `${greeting} I’m AssistantAI Assistant. I can help qualify your enquiry and guide you to the right next step. Could you share a little more about what you need help with so I can route this correctly?`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { visitorName, visitorEmail, visitorPhone, subject, latestMessage, sourcePage, priorMessages = [] } = await req.json();

    if (!latestMessage) {
      return Response.json({ error: 'latestMessage is required' }, { status: 400 });
    }

    const transcript = Array.isArray(priorMessages)
      ? priorMessages
          .slice(-6)
          .map((item) => `${item.sender_type || 'unknown'}: ${item.message_body || ''}`)
          .join('\n')
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

Examples:
- "I want to know your pricing" = sales
- "I want to get started" = sales
- "I paid and need help with setup" = onboarding
- "I just signed up" = onboarding
- "Where is the intake form" = onboarding
- "How do I start setup" = onboarding
- "My portal is not working" = support unless there is clear urgency or outage language
- "This is urgent, something is broken" = urgent
- "Can you tell me what you do?" = general

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

AI mode rules:
- ai_active = default for general questions, early-stage chats, low-intent chats, onboarding guidance, and normal qualification
- human_required = only when the visitor explicitly asks for a human, asks about pricing, says they are ready to book/start, asks to be called, or the AI has already failed after multiple replies
- escalated = only for urgent help that needs immediate human follow-up
- closed = only if the conversation is clearly complete

Urgency rules:
- urgent = outage, broken system, blocked payment, time-sensitive operational issue
- high = clear human request or materially important issue
- normal = standard enquiry
- low = light information request

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

    return Response.json({
      ai_mode,
      enquiry_category,
      urgency_level,
      ai_summary,
      ai_handover_reason,
      likely_use_case,
      likely_plan_fit,
      response,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});