import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const allowedAiModes = ['ai_active', 'human_required', 'escalated', 'closed'];
const allowedCategories = ['sales', 'onboarding', 'support', 'urgent', 'general'];
const allowedUrgencyLevels = ['low', 'normal', 'high', 'urgent'];
const confidenceLevels = ['low', 'medium', 'high'];
const allowedStages = ['discovery', 'qualification', 'knowledge_answer', 'closing_mode', 'handoff_waiting', 'waiting_on_customer', 'closed'];
const allowedIntents = ['pricing_question', 'package_question', 'business_fit', 'integration_capability', 'high_buying_intent', 'callback_request', 'booking_request', 'billing_issue', 'urgent_support', 'human_request', 'support_request', 'unknown_out_of_knowledge'];
const featureStatusLabels = ['fully live', 'partially implemented', 'UI present but not connected', 'planned / future'];

const humanKeywords = ['human', 'real person', 'someone from your team', 'speak to someone', 'talk to someone', 'agent', 'team member', 'person please'];
const urgentKeywords = ['urgent', 'asap', 'immediately', 'right now', 'critical', 'down', 'outage', 'system is down', 'website is down', 'cannot take bookings'];
const supportKeywords = ['portal', 'login', 'support', 'error', 'issue', 'bug', 'not working', 'broken', 'can’t access', 'cant access', 'locked out'];
const billingKeywords = ['billing', 'invoice', 'payment', 'refund', 'charged twice', 'charge', 'card issue', 'account issue', 'subscription'];
const pricingKeywords = ['pricing', 'price', 'cost', 'how much', 'monthly', 'setup fee', 'quote'];
const packageKeywords = ['which plan', 'which package', 'starter', 'growth', 'enterprise', 'best plan', 'best package', 'plan fit', 'package fit'];
const callbackKeywords = ['call me', 'call me back', 'give me a call', 'ring me', 'callback'];
const bookingKeywords = ['book a call', 'book my call', 'book strategy call', 'book a demo', 'schedule a call', 'book me in', 'schedule me in'];
const buyingIntentKeywords = ['i want it', "let's do it", 'lets do it', 'ready to start', 'sign me up', 'we want to move ahead', 'move forward', 'ready to go'];
const businessFitKeywords = ['good fit', 'right fit', 'fit for', 'would this work', 'suitable for', 'for my business', 'for our business', 'we are a', 'i run a', 'i run an'];
const integrationKeywords = ['integration', 'integrations', 'connect', 'connected', 'hubspot', 'salesforce', 'zapier', 'twilio', 'outlook', 'google calendar', 'gohighlevel', 'go high level', 'crm', 'calendar'];
const unsupportedKeywords = ['payroll', 'bookkeeping', 'inventory', 'recruitment', 'cold calling', 'ad management', 'social media management', 'warehouse', 'pos system'];
const completionKeywords = ['thanks', 'thank you', 'all good', 'that helps', 'got it', 'perfect'];

const structuredKnowledge = {
  pricing_question: {
    approved_answer: 'Starter is $497/month + $1,500 setup. Growth is $1,500/month + $3,000 setup. Enterprise starts from $3,000/month + $7,500 setup.',
    feature_status: 'fully live',
    supported_use_case: 'Use this when the visitor wants the commercial pricing breakdown.',
    limitations: 'Once pricing has already been shown in-thread, do not repeat the full pricing again. Move to package fit or next step instead.',
    next_step_cta: 'Use /Pricing to compare or /BookStrategyCall if you want the right package mapped fast.',
    approved_links: ['/Pricing', '/BookStrategyCall', '/GetStartedNow?plan=starter', '/GetStartedNow?plan=growth'],
    escalation_threshold: 'Escalate when the visitor asks for a callback, booking, or custom scope.'
  },
  package_question: {
    approved_answer: 'Starter usually fits AI receptionist, lead capture, and call handling. Growth is stronger for booking automation, CRM sync, and follow-up. Enterprise is for multi-team or custom workflow requirements.',
    feature_status: 'fully live',
    supported_use_case: 'Use this when the visitor is choosing between Starter, Growth, and Enterprise.',
    limitations: 'Do not imply custom workflow scope is fully mapped from chat alone.',
    next_step_cta: 'If the fit is clear, move them to /GetStartedNow or /BookStrategyCall.',
    approved_links: ['/Pricing', '/GetStartedNow?plan=starter', '/GetStartedNow?plan=growth', '/BookStrategyCall'],
    escalation_threshold: 'Escalate when package choice depends on custom workflow design.'
  },
  business_fit: {
    approved_answer: 'AssistantAI is strongest for commercial service businesses that want more captured enquiries, less admin, and faster follow-up.',
    feature_status: 'partially implemented',
    supported_use_case: 'Best fit conversations are around lead capture, call handling, booking automation, and follow-up workflows.',
    limitations: 'Do not imply every workflow is plug-and-play. Fit still depends on setup, integrations, and workflow scope.',
    next_step_cta: 'Ask the business type and first workflow they want improved, then move to /BookStrategyCall if the fit is strong.',
    approved_links: ['/Services', '/Pricing', '/BookStrategyCall'],
    escalation_threshold: 'Escalate when the visitor wants custom scoping or a live callback.'
  },
  integration_capability: {
    approved_answer: 'Google Calendar is live for strategy-call availability and booking. Other integrations are supported in the product surface, but supported is not the same as confirmed connected.',
    feature_status: 'partially implemented',
    supported_use_case: 'Use this for capability questions about calendars, CRMs, messaging tools, and supported integrations.',
    limitations: 'Do not imply a tool is already connected just because an integration card exists. Do not imply every integration workflow is live end to end.',
    next_step_cta: 'Use /Integrations for capability context or /BookStrategyCall when the integration question is part of a buying decision.',
    approved_links: ['/Integrations', '/BookStrategyCall', '/ClientPortal'],
    escalation_threshold: 'Escalate when the visitor needs manual setup, sync investigation, or account-specific confirmation.'
  },
  high_buying_intent: {
    approved_answer: 'When the buyer is clearly ready, stop selling and move to execution fast.',
    feature_status: 'partially implemented',
    supported_use_case: 'Use this when the visitor is ready to move ahead now.',
    limitations: 'Do not loop back into pricing once pricing has already been shown.',
    next_step_cta: 'Capture contact details or move straight to callback / booking.',
    approved_links: ['/BookStrategyCall', '/GetStartedNow?plan=starter', '/GetStartedNow?plan=growth'],
    escalation_threshold: 'Escalate immediately as a high-value lead.'
  },
  callback_request: {
    approved_answer: 'A callback request should move straight into contact capture and fast human follow-up.',
    feature_status: 'partially implemented',
    supported_use_case: 'Use this when the visitor wants a human callback.',
    limitations: 'Do not promise a specific callback time until the team confirms it.',
    next_step_cta: 'Capture the best phone number and preferred time, then escalate.',
    approved_links: ['/BookStrategyCall'],
    escalation_threshold: 'Escalate immediately once callback intent is clear.'
  },
  booking_request: {
    approved_answer: 'A booking request should move to confirmed scheduling or a manual handoff if live confirmation is not complete yet.',
    feature_status: 'partially implemented',
    supported_use_case: 'Use this when the visitor wants to book a strategy call or demo.',
    limitations: 'Do not imply the booking is confirmed unless a real slot is verified and the event is created.',
    next_step_cta: 'Move them to /BookStrategyCall or capture fallback contact details for manual scheduling.',
    approved_links: ['/BookStrategyCall'],
    escalation_threshold: 'Escalate when manual scheduling support is needed.'
  },
  support_request: {
    approved_answer: 'Non-urgent support issues should stay in one thread, gather the exact affected area, and keep the conversation moving without a restart.',
    feature_status: 'partially implemented',
    supported_use_case: 'Use this for portal, login, bug, or access issues that are not urgent outages.',
    limitations: 'Do not guess about hidden account state or claim a fix without more detail.',
    next_step_cta: 'Ask for the affected page or feature and any error text, then keep helping or escalate if needed.',
    approved_links: ['/ClientLogin', '/ClientPortal', '/Contact'],
    escalation_threshold: 'Escalate when the issue becomes urgent, account-specific, or stays unclear after a short clarification.'
  },
  billing_issue: {
    approved_answer: 'Billing and account-specific billing review need human handling.',
    feature_status: 'partially implemented',
    supported_use_case: 'Use this for payment, charge, invoice, refund, or account billing issues.',
    limitations: 'Do not guess about account-specific billing state from chat.',
    next_step_cta: 'Keep the thread open, preserve the context, and escalate to the team.',
    approved_links: ['/ClientPortal', '/Pricing'],
    escalation_threshold: 'Escalate immediately.'
  },
  urgent_support: {
    approved_answer: 'Urgent or outage-related issues should be escalated immediately with the thread context preserved.',
    feature_status: 'partially implemented',
    supported_use_case: 'Use this for urgent production-impacting issues.',
    limitations: 'Do not claim the issue is resolved from chat alone.',
    next_step_cta: 'Escalate immediately and keep the conversation in the same thread.',
    approved_links: ['/ClientPortal', '/Contact'],
    escalation_threshold: 'Escalate immediately.'
  },
  human_request: {
    approved_answer: 'If the visitor asks for a human, keep the thread intact and hand it off without friction.',
    feature_status: 'partially implemented',
    supported_use_case: 'Use this when the visitor explicitly asks for a person.',
    limitations: 'Do not force more AI loops once a direct human request is made.',
    next_step_cta: 'Escalate and confirm the team has the context already.',
    approved_links: ['/Contact', '/ClientPortal'],
    escalation_threshold: 'Escalate immediately.'
  },
  unknown_out_of_knowledge: {
    approved_answer: 'That capability is outside the approved commercial knowledge layer, so the safe move is to avoid guessing and hand it to the team.',
    feature_status: 'planned / future',
    supported_use_case: 'Use this when the visitor asks about a capability outside the approved AssistantAI scope.',
    limitations: 'Do not invent or imply a capability that is not approved in the current knowledge layer.',
    next_step_cta: 'Keep the thread intact and escalate instead of looping.',
    approved_links: ['/Services', '/Contact'],
    escalation_threshold: 'Escalate when the question cannot be answered from approved knowledge.'
  }
};

function normalizeText(value) {
  return String(value || '').toLowerCase().trim();
}

function includesAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function ensureAllowed(value, allowedValues, fallback) {
  return allowedValues.includes(value) ? value : fallback;
}

function countAssistantReplies(priorMessages = []) {
  return Array.isArray(priorMessages)
    ? priorMessages.filter((item) => item?.sender_type === 'system').length
    : 0;
}

function wasPricingShown(priorMessages = []) {
  return Array.isArray(priorMessages) && priorMessages.some((item) => item?.sender_type === 'system' && /\$497\/month|\$1,500\/month|\$3,000\/month|\/pricing/i.test(String(item?.message_body || '')));
}

function extractPhoneNumber(value) {
  const matches = String(value || '').match(/(?:\+?\d[\d\s()\-]{7,}\d)/g) || [];
  for (const match of matches) {
    const normalized = match.replace(/[^\d+]/g, '');
    const digitsOnly = normalized.replace(/\D/g, '');
    if (digitsOnly.length >= 8 && digitsOnly.length <= 15) return normalized;
  }
  return null;
}

function getCapturedPhone(context) {
  if (String(context.visitorPhone || '').trim()) return String(context.visitorPhone || '').trim();
  const fromLatest = extractPhoneNumber(context.latestMessage);
  if (fromLatest) return fromLatest;
  const priorMessages = Array.isArray(context.priorMessages) ? [...context.priorMessages].reverse() : [];
  for (const item of priorMessages) {
    const found = extractPhoneNumber(item?.message_body || '');
    if (found) return found;
  }
  return null;
}

function detectPreferredContactTime(value) {
  const text = String(value || '').toLowerCase();
  if (/\b(call now|right now|asap|immediately|now please)\b/.test(text)) return 'immediate';
  const match = text.match(/\b(today|tomorrow|this morning|this afternoon|tonight|morning|afternoon|evening|at\s+\d{1,2}(?::\d{2})?\s?(?:am|pm)?|after\s+\d{1,2}(?::\d{2})?\s?(?:am|pm)?|\d{1,2}(?::\d{2})?\s?(?:am|pm))\b/);
  return match ? match[0] : null;
}

function detectBusinessType(text) {
  if (includesAny(text, ['trade', 'trades', 'plumber', 'plumbing', 'electrician', 'electrical', 'builder', 'hvac', 'locksmith'])) return 'trades';
  if (includesAny(text, ['real estate', 'property manager', 'agency', 'realtor'])) return 'real_estate';
  if (includesAny(text, ['dental', 'dentist'])) return 'dental_clinic';
  if (includesAny(text, ['medical', 'clinic', 'gp', 'doctor'])) return 'medical_clinic';
  if (includesAny(text, ['law', 'lawyer', 'legal', 'solicitor'])) return 'law_firm';
  if (includesAny(text, ['mechanic', 'auto', 'automotive', 'car service'])) return 'automotive';
  if (includesAny(text, ['restaurant', 'cafe', 'hospitality', 'venue', 'hotel'])) return 'hospitality';
  if (includesAny(text, ['accounting', 'consulting', 'agency', 'professional services'])) return 'professional_services';
  return null;
}

function isCapabilityQuestion(text) {
  return /^\s*(can|does|do|is|are|will|would)\b/.test(text) || text.includes('?');
}

function isVagueQuestion(text) {
  return includesAny(text, ['help', 'can you help', 'need help', 'how does this help']) && !includesAny(text, [...pricingKeywords, ...packageKeywords, ...integrationKeywords, ...billingKeywords, ...urgentKeywords, ...callbackKeywords, ...bookingKeywords, ...buyingIntentKeywords]);
}

function detectDetectedIntents(context) {
  const latest = normalizeText(context.latestMessage);
  const combined = normalizeText(context.combinedText);
  const detected = [];

  if (includesAny(combined, urgentKeywords)) detected.push('urgent_support');
  if (includesAny(combined, billingKeywords)) detected.push('billing_issue');
  if (includesAny(combined, humanKeywords)) detected.push('human_request');
  if (includesAny(combined, supportKeywords)) detected.push('support_request');
  if (includesAny(combined, callbackKeywords)) detected.push('callback_request');
  if (includesAny(combined, bookingKeywords)) detected.push('booking_request');
  if (includesAny(combined, buyingIntentKeywords)) detected.push('high_buying_intent');
  if (includesAny(latest, pricingKeywords)) detected.push('pricing_question');
  if (includesAny(latest, packageKeywords)) detected.push('package_question');
  if (includesAny(combined, businessFitKeywords) || !!detectBusinessType(combined) || isVagueQuestion(latest)) detected.push('business_fit');
  if (includesAny(combined, integrationKeywords)) detected.push('integration_capability');

  const knownSignals = detected.length > 0;
  if (!knownSignals && (includesAny(combined, unsupportedKeywords) || (isCapabilityQuestion(latest) && !includesAny(combined, [...pricingKeywords, ...packageKeywords, ...businessFitKeywords, ...integrationKeywords, ...billingKeywords, ...urgentKeywords, ...callbackKeywords, ...bookingKeywords, ...buyingIntentKeywords])))) {
    detected.push('unknown_out_of_knowledge');
  }

  if (!detected.length) detected.push('business_fit');

  const priority = ['urgent_support', 'billing_issue', 'human_request', 'callback_request', 'booking_request', 'high_buying_intent', 'pricing_question', 'package_question', 'integration_capability', 'support_request', 'unknown_out_of_knowledge', 'business_fit'];
  return unique(priority.filter((intent) => detected.includes(intent)));
}

function detectEnquiryCategory(primaryIntent) {
  if (['pricing_question', 'package_question', 'business_fit', 'high_buying_intent', 'callback_request', 'booking_request'].includes(primaryIntent)) return 'sales';
  if (primaryIntent === 'urgent_support') return 'urgent';
  if (['billing_issue', 'human_request', 'integration_capability', 'support_request'].includes(primaryIntent)) return 'support';
  return 'general';
}

function detectIssueCategory(primaryIntent) {
  const mapping = {
    pricing_question: 'pricing',
    package_question: 'package_fit',
    business_fit: 'business_fit',
    integration_capability: 'integration_capability',
    high_buying_intent: 'high_buying_intent',
    callback_request: 'callback_request',
    booking_request: 'booking_request',
    billing_issue: 'billing',
    urgent_support: 'urgent_support',
    human_request: 'human_request',
    support_request: 'support_request',
    unknown_out_of_knowledge: 'unknown_out_of_knowledge'
  };
  return mapping[primaryIntent] || 'general_enquiry';
}

function detectUrgency(primaryIntent, text) {
  if (primaryIntent === 'urgent_support') return 'urgent';
  if (['callback_request', 'booking_request', 'high_buying_intent', 'human_request'].includes(primaryIntent)) return 'high';
  if (primaryIntent === 'billing_issue') return includesAny(text, ['urgent', 'asap', 'immediately']) ? 'high' : 'normal';
  return 'normal';
}

function detectConfidence(primaryIntent) {
  if (['pricing_question', 'package_question', 'business_fit', 'integration_capability', 'callback_request', 'booking_request', 'high_buying_intent', 'billing_issue', 'urgent_support', 'human_request', 'support_request'].includes(primaryIntent)) return 'high';
  if (primaryIntent === 'unknown_out_of_knowledge') return 'medium';
  return 'medium';
}

function detectSalesIntent(primaryIntent) {
  if (['callback_request', 'booking_request', 'high_buying_intent'].includes(primaryIntent)) return 'high';
  if (['pricing_question', 'package_question', 'business_fit', 'integration_capability'].includes(primaryIntent)) return 'medium';
  return 'low';
}

function getQualificationNeeded(primaryIntent, context, businessType, capturedPhone, preferredContactTime) {
  const needed = [];
  const hasName = String(context.visitorName || '').trim();
  const hasEmail = String(context.visitorEmail || '').trim();

  if (['callback_request', 'booking_request', 'high_buying_intent'].includes(primaryIntent)) {
    if (!capturedPhone) needed.push('phone');
    if (!preferredContactTime) needed.push('preferred time');
    if (!hasName) needed.push('name');
    if (!hasEmail) needed.push('email');
    if (!businessType) needed.push('business type');
    return needed;
  }

  if (['pricing_question', 'package_question', 'business_fit', 'integration_capability'].includes(primaryIntent)) {
    if (!businessType) needed.push('business type');
  }

  return needed;
}

function buildQualificationPrompt(needed) {
  if (!needed.length) return '';
  if (needed.includes('phone') && needed.includes('preferred time')) {
    return 'Send the best phone number and tell me whether you want a call now or your preferred time today.';
  }
  if (needed.includes('business type')) {
    return 'What type of business are you, and what is the first workflow you want improved?';
  }
  if (needed.includes('name') && needed.includes('email')) {
    return 'What name and email should we use?';
  }
  if (needed.includes('phone')) return 'What is the best phone number to reach you on?';
  if (needed.includes('preferred time')) return 'Do you want a call now, or what time suits you best today?';
  return '';
}

function determineStage(primaryIntent, context, qualificationNeeded) {
  const latest = normalizeText(context.latestMessage);
  if (includesAny(latest, completionKeywords)) return 'closed';
  if (['urgent_support', 'billing_issue', 'human_request', 'unknown_out_of_knowledge'].includes(primaryIntent)) return 'handoff_waiting';
  if (['callback_request', 'booking_request', 'high_buying_intent'].includes(primaryIntent)) return 'closing_mode';
  if (isVagueQuestion(latest) && countAssistantReplies(context.priorMessages) === 0) return 'discovery';
  if (qualificationNeeded.length) return 'qualification';
  return 'knowledge_answer';
}

function buildKnowledgeReply(primaryIntent, context, businessType, pricingShownAlready) {
  const greeting = context.visitorName ? `Hi ${context.visitorName},` : 'Hi,';
  const knowledge = structuredKnowledge[primaryIntent] || structuredKnowledge.business_fit;

  if (primaryIntent === 'pricing_question') {
    if (pricingShownAlready) {
      return `${greeting} I’ve already shared the pricing in this thread, so I won’t loop the full breakdown again. Best next step is /Pricing to compare the plans, or /BookStrategyCall if you want the right package mapped quickly.`;
    }
    return `${greeting} ${knowledge.approved_answer} Best next step is /Pricing to compare properly, or /BookStrategyCall if you want the right package mapped fast.`;
  }

  if (primaryIntent === 'package_question') {
    return `${greeting} ${knowledge.approved_answer} If you want, tell me your business type and main workflow, and I’ll point you to the strongest fit fast.`;
  }

  if (primaryIntent === 'business_fit') {
    const businessLine = businessType ? `From what you’ve shared, ${businessType.replace(/_/g, ' ')} looks like a strong fit if the goal is more captured enquiries and faster follow-up.` : knowledge.approved_answer;
    return `${greeting} ${businessLine} Best next step is to tell me your business type and the first workflow you want improved, or go straight to /BookStrategyCall if you want it scoped quickly.`;
  }

  if (primaryIntent === 'integration_capability') {
    return `${greeting} ${knowledge.approved_answer} The important distinction is supported is not the same as confirmed connected. If you need account-specific confirmation or manual setup help, I’ll hand that to the team.`;
  }

  if (primaryIntent === 'support_request') {
    return `${greeting} I can help with that in this same thread. Tell me the affected page or feature and any error text you can see, and I’ll keep it moving from there.`;
  }

  return `${greeting} ${knowledge.approved_answer}`;
}

function buildClosingModeResult(context, primaryIntent, businessType, pricingShownAlready, qualificationNeeded) {
  const greeting = context.visitorName ? `Hi ${context.visitorName},` : 'Hi,';
  const capturedPhone = getCapturedPhone(context);
  const preferredContactTime = detectPreferredContactTime(context.latestMessage) || detectPreferredContactTime(context.combinedText);

  let response = `${greeting} great — let’s move this forward now. `;
  if (!capturedPhone) {
    response += 'Send the best phone number for the callback and tell me whether you want a call now or your preferred time today. I’m marking this as urgent so the team can act fast.';
  } else if (!preferredContactTime) {
    response += `I’ve got ${capturedPhone}. Do you want a call now, or what time suits you best today? I’m escalating this now so the team can move quickly.`;
  } else if (preferredContactTime === 'immediate') {
    response += `I’ve got ${capturedPhone} and I’m escalating this now for an immediate callback. If there’s a better number, send it here and we’ll use that instead.`;
  } else {
    response += `I’ve got ${capturedPhone} and ${preferredContactTime} as your preferred time. I’m escalating this now for a callback at that time, and the team will pick it up from here.`;
  }

  if (pricingShownAlready) {
    response = `${greeting} I’ve already shared the pricing, so I’m not going to loop that again. ${response.replace(`${greeting} `, '')}`;
  }

  const recommendedNextAction = !capturedPhone
    ? 'Collect the best callback number and preferred time immediately, then call the lead.'
    : !preferredContactTime
      ? `Use ${capturedPhone} and confirm whether the lead wants an immediate call or a specific time today.`
      : `Call ${capturedPhone} ${preferredContactTime === 'immediate' ? 'immediately' : `at ${preferredContactTime}`}.`;

  return {
    response,
    ai_mode: 'human_required',
    ai_handover_reason: 'High-intent buyer should move straight into execution.',
    recommended_next_action: recommendedNextAction,
    steps_taken: !capturedPhone ? 'Switched from selling to execution and requested callback number plus timing preference.' : !preferredContactTime ? 'Switched from selling to execution and requested callback timing.' : 'Switched from selling to execution and confirmed callback handoff details.',
    captured_phone: capturedPhone,
    preferred_contact_time: preferredContactTime,
    qualification_needed: qualificationNeeded,
    closing_mode: true,
    pricing_shown: pricingShownAlready,
    high_value_lead: true,
    sales_intent_level: 'high',
    captured_business_type: businessType,
    primary_intent: primaryIntent,
    detected_intents: detectDetectedIntents(context),
    ai_stage: 'closing_mode'
  };
}

function buildHandoffResponse(primaryIntent, context) {
  const greeting = context.visitorName ? `Hi ${context.visitorName},` : 'Hi,';
  if (primaryIntent === 'urgent_support') {
    return `${greeting} this looks urgent, so I’m escalating it to our team now. I’m keeping everything in this same thread, and you won’t need to restart or repeat yourself.`;
  }
  if (primaryIntent === 'billing_issue') {
    return `${greeting} this needs human billing review, so I’m passing it to the team now in this same thread. You won’t need to restart or repeat yourself.`;
  }
  if (primaryIntent === 'human_request') {
    return `${greeting} I’m handing this to a person now in this same thread. The team will see the context already, so you won’t need to restart or repeat yourself.`;
  }
  return `${greeting} I don’t want to guess on that. I’m keeping this in the same thread and passing it to the team with the context already collected.`;
}

function buildDiscoveryResponse(context) {
  const greeting = context.visitorName ? `Hi ${context.visitorName},` : 'Hi,';
  return `${greeting} happy to help. What are you trying to solve right now — lead capture, booking automation, integrations, or a support issue?`;
}

function buildAiSummary(result) {
  return [
    `Stage: ${result.ai_stage}.`,
    `Primary intent: ${result.primary_intent}.`,
    `Detected intents: ${result.detected_intents.join(', ')}.`,
    `Feature status: ${result.feature_status}.`,
    `Urgency: ${result.urgency_level}.`,
    `High-value lead: ${result.high_value_lead ? 'yes' : 'no'}.`,
    result.captured_business_type ? `Business type: ${result.captured_business_type}.` : 'Business type: not yet confirmed.',
    result.captured_phone ? `Phone: ${result.captured_phone}.` : 'Phone: missing.',
    result.preferred_contact_time ? `Preferred time: ${result.preferred_contact_time}.` : 'Preferred time: not yet confirmed.',
    `Problem summary: ${String(result.problem_summary || '').replace(/\s+/g, ' ').trim()}`,
    `Steps taken: ${result.steps_taken}.`,
    `Next action: ${result.recommended_next_action}.`
  ].join(' ').replace(/\s+/g, ' ').trim();
}

Deno.serve(async (req) => {
  try {
    createClientFromRequest(req);
    const { visitorName, visitorEmail, visitorPhone, subject, latestMessage, sourcePage, priorMessages = [] } = await req.json();

    if (!latestMessage) {
      return Response.json({ error: 'latestMessage is required' }, { status: 400 });
    }

    const transcript = Array.isArray(priorMessages)
      ? priorMessages.slice(-10).map((item) => `${item.sender_type || 'unknown'}: ${item.message_body || ''}`).join('\n')
      : '';
    const combinedText = normalizeText([subject, latestMessage, transcript].filter(Boolean).join('\n'));
    const detectedIntents = detectDetectedIntents({ latestMessage, combinedText });
    const primaryIntent = detectedIntents[0];
    const enquiryCategory = ensureAllowed(detectEnquiryCategory(primaryIntent), allowedCategories, 'general');
    const urgencyLevel = ensureAllowed(detectUrgency(primaryIntent, combinedText), allowedUrgencyLevels, 'normal');
    const confidenceLevel = ensureAllowed(detectConfidence(primaryIntent), confidenceLevels, 'medium');
    const businessType = detectBusinessType(combinedText);
    const capturedPhone = getCapturedPhone({ visitorPhone, latestMessage, priorMessages });
    const preferredContactTime = detectPreferredContactTime(latestMessage) || detectPreferredContactTime(combinedText);
    const pricingShownAlready = wasPricingShown(priorMessages);
    const qualificationNeeded = getQualificationNeeded(primaryIntent, { visitorName, visitorEmail }, businessType, capturedPhone, preferredContactTime);
    const aiStage = ensureAllowed(determineStage(primaryIntent, { latestMessage, priorMessages }, qualificationNeeded), allowedStages, 'knowledge_answer');
    const salesIntentLevel = detectSalesIntent(primaryIntent);
    const highValueLead = ['pricing_question', 'package_question', 'high_buying_intent', 'callback_request', 'booking_request'].includes(primaryIntent);
    const featureStatus = structuredKnowledge[primaryIntent]?.feature_status || structuredKnowledge.business_fit.feature_status;
    const knowledge = structuredKnowledge[primaryIntent] || structuredKnowledge.business_fit;
    const issueCategory = detectIssueCategory(primaryIntent);
    const links = Array.isArray(knowledge.approved_links) ? knowledge.approved_links : [];
    const problemSummary = latestMessage;

    let response = '';
    let aiMode = 'ai_active';
    let aiHandoverReason = null;
    let stepsTaken = 'Answered deterministically from the structured knowledge and stage system.';
    let recommendedNextAction = knowledge.next_step_cta;
    let closingMode = false;

    if (aiStage === 'closed') {
      aiMode = 'closed';
      response = `${visitorName ? `Hi ${visitorName},` : 'Hi,'} glad that helped. I’ll keep this thread here if you need anything else.`;
      recommendedNextAction = 'No further action needed unless the visitor replies again.';
      stepsTaken = 'Detected a completion signal and closed the conversation cleanly.';
    } else if (aiStage === 'handoff_waiting') {
      aiMode = primaryIntent === 'urgent_support' ? 'escalated' : 'human_required';
      response = buildHandoffResponse(primaryIntent, { visitorName });
      aiHandoverReason = knowledge.escalation_threshold;
      recommendedNextAction = 'Human follow-up required in the same thread.';
      stepsTaken = 'Applied deterministic handoff routing and preserved the thread context for a human reply.';
    } else if (aiStage === 'closing_mode') {
      const closingResult = buildClosingModeResult({ visitorName, visitorEmail, visitorPhone, latestMessage, combinedText, priorMessages }, primaryIntent, businessType, pricingShownAlready, qualificationNeeded);
      aiMode = closingResult.ai_mode;
      response = closingResult.response;
      aiHandoverReason = closingResult.ai_handover_reason;
      recommendedNextAction = closingResult.recommended_next_action;
      stepsTaken = closingResult.steps_taken;
      closingMode = true;
    } else if (aiStage === 'discovery') {
      response = buildDiscoveryResponse({ visitorName });
      recommendedNextAction = 'Wait for the visitor to pick the main use case so the next reply can route deterministically.';
      stepsTaken = 'Moved the conversation into discovery with one short clarifying question.';
    } else if (aiStage === 'qualification') {
      response = `${buildKnowledgeReply(primaryIntent, { visitorName, latestMessage }, businessType, pricingShownAlready)} ${buildQualificationPrompt(qualificationNeeded)}`.trim();
      recommendedNextAction = qualificationNeeded.includes('phone') || qualificationNeeded.includes('preferred time') ? 'Collect callback details, then escalate fast if buying intent stays high.' : 'Collect the missing business context, then answer or route the best next step.';
      stepsTaken = 'Answered the approved knowledge point and collected the minimum missing qualification detail.';
    } else {
      response = buildKnowledgeReply(primaryIntent, { visitorName, latestMessage }, businessType, pricingShownAlready);
      recommendedNextAction = knowledge.next_step_cta;
      stepsTaken = 'Answered the approved knowledge point without free-form looping.';
    }

    const result = {
      ai_mode: ensureAllowed(aiMode, allowedAiModes, 'ai_active'),
      ai_stage: aiStage,
      enquiry_category: enquiryCategory,
      issue_category: issueCategory,
      urgency_level: urgencyLevel,
      confidence_level: confidenceLevel,
      ai_handover_reason: aiHandoverReason,
      steps_taken: stepsTaken,
      recommended_next_action: recommendedNextAction,
      response,
      links,
      primary_intent: primaryIntent,
      detected_intents: detectedIntents,
      feature_status: featureStatus,
      approved_answer: knowledge.approved_answer,
      supported_use_case: knowledge.supported_use_case,
      limitations: knowledge.limitations,
      next_step_cta: knowledge.next_step_cta,
      approved_link: links[0] || null,
      escalation_threshold: knowledge.escalation_threshold,
      sales_intent_level: salesIntentLevel,
      high_value_lead: highValueLead,
      captured_business_type: businessType,
      qualification_needed: qualificationNeeded,
      closing_mode: closingMode,
      captured_phone: capturedPhone,
      preferred_contact_time: preferredContactTime,
      pricing_shown: pricingShownAlready || primaryIntent === 'pricing_question',
      problem_summary: problemSummary,
    };

    result.ai_summary = buildAiSummary(result);

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});