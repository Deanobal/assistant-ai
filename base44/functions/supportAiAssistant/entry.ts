import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const allowedAiModes = ['ai_active', 'human_required', 'escalated', 'closed'];
const allowedCategories = ['sales', 'onboarding', 'support', 'urgent', 'general'];
const allowedUrgencyLevels = ['low', 'normal', 'high', 'urgent'];
const confidenceLevels = ['low', 'medium', 'high'];

const explicitHumanKeywords = ['human', 'real person', 'someone from your team', 'speak to someone', 'talk to someone', 'team member', 'please escalate', 'need an agent'];
const criticalOutageKeywords = ['site is down', 'website is down', 'system is down', 'critical outage', 'outage', 'cannot take bookings', 'nothing is working', 'production issue', 'urgent bug'];
const urgentKeywords = ['urgent', 'asap', 'immediately', 'right now', 'critical'];
const billingSecurityKeywords = ['billing issue', 'billing problem', 'invoice issue', 'payment failed', 'refund', 'charged twice', 'account issue', 'security issue', 'security concern', 'locked out', 'cannot access', 'cant access', 'login issue', 'login problem'];
const manualIntegrationKeywords = ['help connect', 'connect my', 'set up integration', 'setup integration', 'integration setup', 'calendar connection', 'crm connection', 'twilio setup'];
const likelyBugKeywords = ['bug', 'broken', 'error', 'not working', 'fails', 'failed', 'crash', 'blank page', 'stuck', 'issue'];
const pricingDecisionKeywords = ['quote', 'proposal', 'ready to start', 'ready to book', 'call me', 'call me back', 'sign me up', 'start now'];
const completionKeywords = ['thanks that helps', 'all good now', 'got it thanks', 'perfect thanks', 'solved'];

const featureStatusLabels = ['fully live', 'partially implemented', 'UI present but not connected', 'planned / future'];

const supportKnowledge = [
  {
    category: 'services',
    feature_status: 'partially implemented',
    supported_use_case: [
      'The public site clearly presents AI voice, receptionist, chatbot, CRM automation, booking automation, follow-up, and workflow services.',
      'Users can learn about services and move to pricing, strategy call, or direct start routes.'
    ],
    limitations: [
      'Do not imply every advertised service is already deployed end to end for every client.',
      'Some service outcomes depend on onboarding, setup, integrations, and client-specific implementation.'
    ],
    troubleshooting_steps: [
      'Clarify which service the user means.',
      'Clarify whether they want information, setup help, or production support.'
    ],
    approved_links: ['/Services', '/Pricing', '/BookStrategyCall'],
    escalation_owner: 'sales',
    escalation_threshold: 'Escalate when the user wants custom scoping, a quote, or a callback.'
  },
  {
    category: 'pricing',
    feature_status: 'fully live',
    supported_use_case: [
      'Starter, Growth, and Enterprise pricing and routes can be explained directly.',
      'Users can compare on /Pricing or move to /GetStartedNow or /BookStrategyCall depending on fit.'
    ],
    limitations: [
      'Do not promise custom scope, callback timing, or implementation details from pricing alone.'
    ],
    troubleshooting_steps: [
      'Answer the plan question directly.',
      'Point the user to /Pricing or /BookStrategyCall when comparison or scoping is needed.'
    ],
    approved_links: ['/Pricing', '/BookStrategyCall', '/GetStartedNow?plan=starter', '/GetStartedNow?plan=growth'],
    escalation_owner: 'sales',
    escalation_threshold: 'Escalate when the user is ready to buy, asks for a quote, or requests a callback.'
  },
  {
    category: 'integrations',
    feature_status: 'partially implemented',
    supported_use_case: [
      'Google Calendar is live for strategy-call availability checks and calendar event creation.',
      'The portal can store and show integration connection states for clients.'
    ],
    limitations: [
      'Do not imply an app is connected just because an integration card exists.',
      'Do not imply HubSpot, GoHighLevel, Outlook, Twilio, Stripe, or Zapier are live for a given client unless connection state is explicitly confirmed.',
      'Treat supported, configurable, connected, and fully live as different states.'
    ],
    troubleshooting_steps: [
      'Clarify whether the user is asking about capability, active connection state, or manual setup help.',
      'If connection state is unknown, say it is supported or surfaced in the product but not confirmed connected.'
    ],
    approved_links: ['/Integrations', '/BookStrategyCall', '/ClientPortal'],
    escalation_owner: 'implementation/support',
    escalation_threshold: 'Escalate when the user needs manual setup, sync investigation, or asks whether a specific account is already connected.'
  },
  {
    category: 'onboarding',
    feature_status: 'partially implemented',
    supported_use_case: [
      'Onboarding records, intake flows, and tracked onboarding stages exist in the app.',
      'The team can guide users through intake, setup, integrations, testing, and go-live.'
    ],
    limitations: [
      'Do not imply onboarding completes automatically after payment.',
      'Do not imply every onboarding step is fully self-serve.'
    ],
    troubleshooting_steps: [
      'Clarify which stage the user is at.',
      'Clarify whether they need intake, setup, integrations, testing, or go-live help.'
    ],
    approved_links: ['/GetStartedNow', '/BookStrategyCall', '/ClientLogin'],
    escalation_owner: 'onboarding',
    escalation_threshold: 'Escalate when a paid customer needs manual onboarding action or cannot progress to the next stage.'
  },
  {
    category: 'booking',
    feature_status: 'partially implemented',
    supported_use_case: [
      'Strategy calls can use real Google Calendar availability and create real calendar events when slot verification and event creation succeed.',
      'The booking page can fall back to request mode when live availability is unavailable.'
    ],
    limitations: [
      'Do not imply a booking is confirmed unless a real slot is verified and the calendar event is created.',
      'Do not imply all booking automation across the product is fully live just because the strategy-call flow exists.'
    ],
    troubleshooting_steps: [
      'If the user asks whether they can book right now, distinguish between request mode and confirmed live slot booking.',
      'If there is no confirmed slot or event, describe it as request or pending, not confirmed.'
    ],
    approved_links: ['/BookStrategyCall'],
    escalation_owner: 'sales/onboarding',
    escalation_threshold: 'Escalate when a user cannot complete a live booking or needs manual scheduling help.'
  },
  {
    category: 'client_portal',
    feature_status: 'partially implemented',
    supported_use_case: [
      'Client login, portal access, and secure support conversations are live.',
      'Portal areas for overview, analytics, billing, integrations, and support are present.'
    ],
    limitations: [
      'Do not imply every portal section is fully self-serve or fully live end to end.',
      'Some portal sections can show structure, saved state, empty state, or partial workflows.'
    ],
    troubleshooting_steps: [
      'Clarify which portal area is affected.',
      'Distinguish between a visible portal section and a fully live self-service workflow.'
    ],
    approved_links: ['/ClientLogin', '/ClientPortal'],
    escalation_owner: 'support',
    escalation_threshold: 'Escalate when the user cannot access the portal or needs account-specific portal action.'
  },
  {
    category: 'billing',
    feature_status: 'partially implemented',
    supported_use_case: [
      'Billing records, plan details, payment method status, invoice references, and Stripe-related architecture exist in the app.',
      'The portal can show billing structure and stored billing data.'
    ],
    limitations: [
      'Do not imply billing is fully active end to end just because billing UI exists.',
      'Do not imply payment collection, webhook handling, invoices, or payment methods are live for a specific client unless that state is explicitly confirmed.'
    ],
    troubleshooting_steps: [
      'Clarify whether the user means billing visibility, payment status, invoice history, or fully active Stripe workflows.',
      'If state is not confirmed for that client, say the billing surface exists but full live status is not confirmed.'
    ],
    approved_links: ['/Pricing', '/ClientPortal'],
    escalation_owner: 'billing/ops',
    escalation_threshold: 'Escalate when the issue is payment, invoice, charge, refund, or account-specific billing review.'
  },
  {
    category: 'notifications',
    feature_status: 'partially implemented',
    supported_use_case: [
      'In-app notification logs exist.',
      'Selected admin alert flows can send email and SMS using configured providers.'
    ],
    limitations: [
      'Do not imply every notification goes to phone in real time.',
      'Do not imply all user-facing notification paths are fully live across the whole app.'
    ],
    troubleshooting_steps: [
      'Clarify which event, audience, and channel the user means.',
      'If the path is unknown or broad, answer conservatively and describe the current implemented scope only.'
    ],
    approved_links: ['/ClientPortal'],
    escalation_owner: 'support/ops',
    escalation_threshold: 'Escalate when the user needs event-by-event delivery investigation or real-time notification guarantees.'
  },
  {
    category: 'analytics',
    feature_status: 'partially implemented',
    supported_use_case: [
      'Analytics can use live Lead and CallRecord data when those records exist.',
      'The app also has empty states and sample-style analytics views when live data is missing.'
    ],
    limitations: [
      'Do not imply analytics are real if the underlying data may be empty, seeded, or sample/demo only.',
      'Do not imply every client currently has live populated analytics.'
    ],
    troubleshooting_steps: [
      'Clarify whether the user is asking about live entity-backed analytics or demo/sample presentation.',
      'If underlying data is not confirmed, say the analytics surface exists but live data is not confirmed.'
    ],
    approved_links: ['/Platform', '/ClientPortal'],
    escalation_owner: 'support/data',
    escalation_threshold: 'Escalate when the user reports data mismatch, missing records, or expects live analytics that are not showing.'
  },
  {
    category: 'support_workflows',
    feature_status: 'partially implemented',
    supported_use_case: [
      'Website chat and client portal support threads are live and can capture messages, AI responses, and admin handoff.',
      'Urgent, billing, account, outage, and explicit human requests can be escalated.'
    ],
    limitations: [
      'Do not imply the AI can inspect private systems or confirm unknown account state.',
      'Do not imply every support path is fully automated or resolved without human review.'
    ],
    troubleshooting_steps: [
      'Clarify the issue, urgency, affected page, and any error text.',
      'Escalate when policy requires human review or confidence stays low.'
    ],
    approved_links: ['/Contact', '/ClientPortal', '/ClientLogin'],
    escalation_owner: 'support',
    escalation_threshold: 'Escalate for urgent issues, account-specific issues, billing/security issues, manual setup help, or explicit human requests.'
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

function includesAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function normalizeText(value) {
  return String(value || '').toLowerCase().trim();
}

function countAssistantReplies(priorMessages = []) {
  return Array.isArray(priorMessages)
    ? priorMessages.filter((item) => item?.sender_type === 'system').length
    : 0;
}

function ensureAllowed(value, allowedValues, fallback) {
  return allowedValues.includes(value) ? value : fallback;
}

function detectEnquiryCategory(text) {
  if (includesAny(text, ['pricing', 'price', 'cost', 'quote', 'plan', 'get started', 'strategy call', 'demo'])) return 'sales';
  if (includesAny(text, ['onboarding', 'intake', 'go live', 'setup', 'implementation'])) return 'onboarding';
  if (includesAny(text, criticalOutageKeywords) || (includesAny(text, urgentKeywords) && includesAny(text, likelyBugKeywords))) return 'urgent';
  if (includesAny(text, billingSecurityKeywords) || includesAny(text, likelyBugKeywords) || includesAny(text, ['portal', 'login', 'support', 'tech help', 'technical help', 'integration', 'calendar', 'crm', 'twilio'])) return 'support';
  return 'general';
}

function detectIssueCategory(text) {
  if (includesAny(text, ['pricing', 'price', 'cost', 'plan', 'quote'])) return 'pricing';
  if (includesAny(text, ['strategy call', 'book a call', 'book a demo'])) return 'strategy_call';
  if (includesAny(text, ['integration', 'calendar', 'crm', 'twilio', 'hubspot', 'salesforce', 'outlook', 'google calendar'])) return 'integration_setup';
  if (includesAny(text, ['billing', 'invoice', 'payment', 'card', 'charge'])) return 'billing';
  if (includesAny(text, ['login', 'locked out', 'password', 'account'])) return 'account_access';
  if (includesAny(text, ['portal', 'dashboard', 'analytics', 'call recordings', 'support tab'])) return 'client_portal';
  if (includesAny(text, ['error', 'broken', 'bug', 'blank page', 'crash', 'not working'])) return 'bug_or_feature_issue';
  if (includesAny(text, ['onboarding', 'intake', 'setup', 'go live'])) return 'onboarding';
  if (includesAny(text, ['services', 'what do you do', 'voice agent', 'chatbot', 'ai receptionist'])) return 'services';
  if (includesAny(text, ['tech help', 'technical help', 'help'])) return 'general_support';
  return 'general_enquiry';
}

function isVagueSupport(text) {
  const vagueOpeners = ['i need help', 'need help', 'tech help', 'technical help', 'something is wrong', 'having issues', 'it is not working', 'problem'];
  const hasUsefulDetail = includesAny(text, ['portal', 'billing', 'integration', 'calendar', 'crm', 'chat', 'widget', 'pricing', 'error', 'code', 'screen', 'page', 'login', 'invoice', 'onboarding']) || text.length > 100;
  return includesAny(text, vagueOpeners) && !hasUsefulDetail;
}

function buildForcedRouting(text, priorMessages = []) {
  const assistantReplies = countAssistantReplies(priorMessages);
  const enquiryCategory = detectEnquiryCategory(text);
  const issueCategory = detectIssueCategory(text);

  if (includesAny(text, explicitHumanKeywords)) {
    return {
      ai_mode: 'human_required',
      enquiry_category: enquiryCategory === 'general' ? 'support' : enquiryCategory,
      issue_category: issueCategory,
      urgency_level: 'high',
      confidence_level: 'high',
      ai_handover_reason: 'User explicitly asked for a human.',
    };
  }

  if (includesAny(text, criticalOutageKeywords) || (includesAny(text, urgentKeywords) && includesAny(text, likelyBugKeywords))) {
    return {
      ai_mode: 'escalated',
      enquiry_category: 'urgent',
      issue_category: 'critical_bug_or_outage',
      urgency_level: 'urgent',
      confidence_level: 'high',
      ai_handover_reason: 'This looks business-critical or outage-related.',
    };
  }

  if (includesAny(text, billingSecurityKeywords)) {
    return {
      ai_mode: 'human_required',
      enquiry_category: 'support',
      issue_category: issueCategory,
      urgency_level: includesAny(text, urgentKeywords) ? 'high' : 'normal',
      confidence_level: 'high',
      ai_handover_reason: 'Billing, account, or security issues need human review.',
    };
  }

  if (includesAny(text, manualIntegrationKeywords) && includesAny(text, ['help', 'setup', 'connect'])) {
    return {
      ai_mode: 'human_required',
      enquiry_category: 'support',
      issue_category: 'integration_setup',
      urgency_level: 'normal',
      confidence_level: 'high',
      ai_handover_reason: 'This integration setup request likely needs manual help from the team.',
    };
  }

  if (assistantReplies >= 3 && (isVagueSupport(text) || enquiryCategory === 'support')) {
    return {
      ai_mode: 'human_required',
      enquiry_category: 'support',
      issue_category: issueCategory,
      urgency_level: 'normal',
      confidence_level: 'low',
      ai_handover_reason: 'The assistant has already asked enough clarifying questions and confidence is still low.',
    };
  }

  if (includesAny(text, completionKeywords)) {
    return {
      ai_mode: 'closed',
      enquiry_category: enquiryCategory,
      issue_category: issueCategory,
      urgency_level: 'low',
      confidence_level: 'high',
      ai_handover_reason: null,
    };
  }

  if (includesAny(text, pricingDecisionKeywords)) {
    return {
      ai_mode: 'human_required',
      enquiry_category: 'sales',
      issue_category: detectIssueCategory(text),
      urgency_level: 'high',
      confidence_level: 'high',
      ai_handover_reason: 'The user is ready to move forward and should get a human follow-up.',
    };
  }

  if (isVagueSupport(text)) {
    return {
      ai_mode: 'ai_active',
      enquiry_category: 'support',
      issue_category: 'general_support',
      urgency_level: 'normal',
      confidence_level: assistantReplies >= 2 ? 'low' : 'medium',
      ai_handover_reason: null,
    };
  }

  return null;
}

function buildFallbackResponse({ visitorName, aiMode, enquiryCategory, issueCategory, assistantReplies }) {
  const greeting = visitorName ? `Hi ${visitorName},` : 'Hi,';

  if (aiMode === 'escalated') {
    return `${greeting} this looks urgent, so I’m escalating it to our team now. I’ve already flagged the issue and urgency so you do not need to repeat yourself.`;
  }

  if (aiMode === 'human_required') {
    return `${greeting} I’m passing this to our team with the details collected so far so they can help properly.`;
  }

  if (enquiryCategory === 'sales' && issueCategory === 'pricing') {
    return `${greeting} Starter is $497/month + $1,500 setup, Growth is $1,500/month + $3,000 setup, and Enterprise starts from $3,000/month + $7,500 setup. You can compare options on /Pricing or book a strategy call on /BookStrategyCall if you want help choosing.`;
  }

  if (enquiryCategory === 'support' && assistantReplies === 0) {
    return `${greeting} I can help with that. What part is affected, and what are you seeing right now? If there is an error message, paste it here.`;
  }

  return `${greeting} I can help with that. Tell me the affected page or feature and any error text you can see.`;
}

function buildDirectCapabilityResponse(text, visitorName, visitorEmail) {
  const normalized = normalizeText(text);
  const greeting = visitorName ? `Hi ${visitorName}, ` : 'Hi, ';
  const base = {
    ai_mode: 'ai_active',
    urgency_level: 'normal',
    confidence_level: 'high',
    ai_handover_reason: null,
    steps_taken: 'Answered a direct capability-status question using the structured support knowledge.',
  };

  if (normalized.includes('stripe')) {
    return {
      ...base,
      enquiry_category: 'support',
      issue_category: 'billing',
      ai_summary: `Direct capability-status answer for Stripe/billing provided to ${visitorName || visitorEmail || 'visitor'}. Explained that billing is partially implemented and not confirmed fully live end to end for every client.`,
      recommended_next_action: 'Use /Pricing for plan context or /ClientPortal for stored billing visibility.',
      response: `${greeting}Status: partially implemented. Stripe-related billing structure exists in the app, but I cannot honestly describe end-to-end Stripe billing as fully live for every client from this app state alone. The safe claim is that billing visibility and Stripe-related architecture exist, while full live billing status depends on the specific client setup and confirmed payment state.`,
      links: ['/Pricing', '/ClientPortal'],
    };
  }

  if (normalized.includes('strategy call') && normalized.includes('book')) {
    return {
      ...base,
      enquiry_category: 'sales',
      issue_category: 'strategy_call',
      ai_summary: `Direct capability-status answer for strategy-call booking provided to ${visitorName || visitorEmail || 'visitor'}. Explained that booking is partially implemented and only confirmed when a real slot is verified and a calendar event is created.`,
      recommended_next_action: 'Use /BookStrategyCall to see whether a real live slot is available.',
      response: `${greeting}Status: partially implemented. The strategy-call flow can use real Google Calendar availability and create a real calendar event, but I should not imply an instant confirmed booking from this message alone. A booking is only confirmed when a real slot is verified and the calendar event is successfully created on /BookStrategyCall.`,
      links: ['/BookStrategyCall'],
    };
  }

  if (normalized.includes('hubspot')) {
    return {
      ...base,
      enquiry_category: 'support',
      issue_category: 'integration_setup',
      ai_summary: `Direct capability-status answer for HubSpot integration provided to ${visitorName || visitorEmail || 'visitor'}. Explained that HubSpot is supported in the product surface but not confirmed connected for the user's account.`,
      recommended_next_action: 'Use /Integrations for support context or ask for setup help if a human should verify account state.',
      response: `${greeting}Status: partially implemented. HubSpot is shown as supported in the product surface, but that does not mean your account is already connected. The honest answer is supported, not confirmed connected, unless a saved live connection state is explicitly verified for your account.`,
      links: ['/Integrations', '/BookStrategyCall'],
    };
  }

  if (normalized.includes('client portal') && normalized.includes('billing')) {
    return {
      ...base,
      enquiry_category: 'support',
      issue_category: 'billing',
      ai_summary: `Direct capability-status answer for client portal billing provided to ${visitorName || visitorEmail || 'visitor'}. Explained that the portal billing surface is partially implemented and not confirmed end to end for every client.`,
      recommended_next_action: 'Use /ClientPortal for stored billing visibility or escalate billing-specific issues to a human.',
      response: `${greeting}Status: partially implemented. The client portal can show billing structure and stored billing data, but I cannot honestly say it handles billing end to end for every client today. The safe claim is that billing UI and billing records can exist there, while full live payment handling depends on confirmed client billing setup.`,
      links: ['/ClientPortal', '/Pricing'],
    };
  }

  if (normalized.includes('notification') && normalized.includes('phone')) {
    return {
      ...base,
      enquiry_category: 'support',
      issue_category: 'notifications',
      ai_summary: `Direct capability-status answer for phone notifications provided to ${visitorName || visitorEmail || 'visitor'}. Explained that notifications are partially implemented and real-time phone delivery should not be assumed across all flows.`,
      recommended_next_action: 'Clarify the exact event and audience if the user needs a channel-specific answer.',
      response: `${greeting}Status: partially implemented. Some admin alert flows can send SMS, but I should not imply that all notifications go to phone in real time. The safe answer is that phone delivery exists for selected implemented alert paths, not as a blanket real-time guarantee across the whole app.`,
      links: ['/ClientPortal'],
    };
  }

  if (normalized.includes('analytics')) {
    return {
      ...base,
      enquiry_category: 'support',
      issue_category: 'analytics',
      ai_summary: `Direct capability-status answer for analytics provided to ${visitorName || visitorEmail || 'visitor'}. Explained that analytics are partially implemented and can be live when backed by data, but may also be empty or sample-style.`,
      recommended_next_action: 'Use /Platform or /ClientPortal for the analytics surface, but verify whether live records exist before calling it real analytics.',
      response: `${greeting}Status: partially implemented. Analytics can be real when the app has live Lead and CallRecord data behind them, but I should not imply they are always real. In this app, analytics can also appear as empty or sample-style views when live data is missing, so the honest answer is: the analytics surface exists, but real data is not guaranteed in every case.`,
      links: ['/Platform', '/ClientPortal'],
    };
  }

  if (normalized.includes('google calendar')) {
    return {
      ...base,
      enquiry_category: 'support',
      issue_category: 'integration_setup',
      ai_summary: `Direct capability-status answer for Google Calendar provided to ${visitorName || visitorEmail || 'visitor'}. Explained that Google Calendar is live for the strategy-call flow, but current use depends on the live slot and booking path.`,
      recommended_next_action: 'Use /BookStrategyCall to test the live availability flow.',
      response: `${greeting}Status: partially implemented overall, with one live part. Google Calendar is live for strategy-call availability checks and calendar event creation, so that specific flow can be used today. What I should not imply is that every Google Calendar-related workflow is fully live everywhere in the app, or that a booking is confirmed until the live slot and event are actually created.`,
      links: ['/BookStrategyCall', '/Integrations'],
    };
  }

  if (normalized.includes('onboarding') && normalized.includes('payment')) {
    return {
      ...base,
      enquiry_category: 'onboarding',
      issue_category: 'onboarding',
      ai_summary: `Direct capability-status answer for onboarding after payment provided to ${visitorName || visitorEmail || 'visitor'}. Explained that onboarding is partially implemented and not fully automatic after payment.`,
      recommended_next_action: 'Use /GetStartedNow or /BookStrategyCall if the user needs onboarding guidance.',
      response: `${greeting}Status: partially implemented. Onboarding tracking and stages exist, but I should not imply onboarding happens automatically after payment. The safe answer is that payment can move the process forward, but onboarding still involves guided steps, setup work, and human-led implementation.`,
      links: ['/GetStartedNow', '/BookStrategyCall', '/ClientLogin'],
    };
  }

  if (normalized.includes('manage integrations directly')) {
    return {
      ...base,
      enquiry_category: 'support',
      issue_category: 'client_portal',
      ai_summary: `Direct capability-status answer for client-managed integrations provided to ${visitorName || visitorEmail || 'visitor'}. Explained that client integration management is partially implemented and not something that should be described as fully self-serve right now.`,
      recommended_next_action: 'Use /Integrations for capability context and escalate manual setup needs to the team.',
      response: `${greeting}Status: partially implemented. Clients can see integration surfaces and stored statuses, but I cannot honestly describe direct end-to-end self-service integration management as fully live right now. The safe answer is visibility exists, while full client-managed integration control is not confirmed as a complete live workflow.`,
      links: ['/Integrations', '/ClientPortal'],
    };
  }

  if (normalized.includes('production-ready') || normalized.includes('production ready')) {
    return {
      ...base,
      enquiry_category: 'general',
      issue_category: 'production_readiness',
      ai_summary: `Direct capability-status answer for overall production readiness provided to ${visitorName || visitorEmail || 'visitor'}. Explained that the app has mixed readiness: some live flows, many partial flows, and no honest basis to call every feature fully production-ready.`,
      recommended_next_action: 'Discuss the specific feature or workflow the user cares about most.',
      response: `${greeting}Honest answer: no, I would not describe the whole app as fully production-ready across every feature. Status is mixed: some flows are fully live, many are partially implemented, and some surfaces are present without proving full end-to-end production readiness. The safe way to assess readiness here is feature by feature, not as one blanket yes.`,
      links: ['/Services', '/Platform', '/Integrations', '/ClientPortal'],
    };
  }

  return null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { visitorName, visitorEmail, visitorPhone, subject, latestMessage, sourcePage, priorMessages = [] } = await req.json();

    if (!latestMessage) {
      return Response.json({ error: 'latestMessage is required' }, { status: 400 });
    }

    const transcript = Array.isArray(priorMessages)
      ? priorMessages.slice(-8).map((item) => `${item.sender_type || 'unknown'}: ${item.message_body || ''}`).join('\n')
      : '';

    const combinedText = normalizeText([subject, latestMessage, transcript].filter(Boolean).join('\n'));
    const assistantReplies = countAssistantReplies(priorMessages);
    const forcedRouting = buildForcedRouting(combinedText, priorMessages);
    const directCapabilityResponse = buildDirectCapabilityResponse(combinedText, visitorName, visitorEmail);

    if (directCapabilityResponse && !forcedRouting) {
      return Response.json(directCapabilityResponse);
    }

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are AssistantAI Assistant, the first-line AI operator for AssistantAI.

Your role:
- act like a capable front-line operator, not a deflection bot
- acknowledge the issue clearly
- answer straightforward product and site questions directly
- ask only the next most useful clarifying question or questions when support context is missing
- try one useful answer when possible before escalating
- only escalate when the rules below require it

Escalation rules:
- escalate only for urgent or business-critical issues, billing/account/security issues, likely bugs or outages, manual integration setup help, explicit human requests, or genuinely low confidence after clarifying
- do not escalate vague support requests immediately
- for vague support requests, keep the conversation active and collect context first
- there have already been ${assistantReplies} assistant replies in this thread, and the total clarifying-question budget is 3 before escalation for low-confidence support cases

Support context to collect when relevant:
- name
- email
- phone if relevant
- business name if relevant
- issue category
- urgency
- affected page or feature
- screenshot or error text if available

Knowledge you can rely on:
Supported feature status labels: ${featureStatusLabels.join(', ')}

${buildSupportKnowledgeText()}

Answering rules:
- if the user asks about services, pricing, integrations, strategy calls, onboarding, billing, booking, client portal, notifications, analytics, support flow, or chat widget behavior, answer directly from the structured knowledge above
- when discussing integrations, billing, booking, client portal, notifications, or analytics, explicitly use the exact feature status label from the structured knowledge when it helps avoid ambiguity
- feature status labels mean: fully live = working end to end in current app flows; partially implemented = some real parts exist but not full end-to-end coverage; UI present but not connected = visible in product or UI without confirmed live backend connection for this case; planned / future = intended later, not live today
- do not imply a feature is live if it is only shown in UI
- do not imply a booking is confirmed unless a real slot is verified and a real booking event is created
- do not imply billing is fully active just because billing UI, Stripe fields, or Stripe-related architecture exist
- do not imply integrations are connected just because an integration card exists; if connection state is unknown, say supported but not confirmed connected
- do not imply analytics are real if the state may be sample, seeded, mock, or empty
- do not imply phone notifications happen in real time unless the user is asking about the specific implemented admin alert flows
- do not imply the whole product is already production-ready across every feature; answer conservatively and separate live, partial, UI-only, and future states
- separate supported, visible in UI, configured, connected, confirmed, and fully live as different states
- where useful, include the correct route such as /Pricing, /Services, /Integrations, /Platform, /BookStrategyCall, /ClientLogin, /ClientPortal, or /GetStartedNow?plan=starter
- keep replies concise, useful, and commercially credible
- ask at most 2 short questions in a single reply
- never invent unavailable features or guarantees
- never say you are checking systems you cannot actually inspect

Conversation context:
- visitor name: ${visitorName || 'Unknown'}
- visitor email: ${visitorEmail || 'Not provided'}
- visitor phone: ${visitorPhone || 'Not provided'}
- subject: ${subject || 'Not provided'}
- source page: ${sourcePage || '/'}
- latest message: ${latestMessage}
- prior visible messages:\n${transcript || 'None'}
- forced routing guidance: ${forcedRouting ? JSON.stringify(forcedRouting) : 'none'}

Return JSON with:
- ai_mode
- enquiry_category
- issue_category
- urgency_level
- confidence_level
- ai_summary
- ai_handover_reason
- steps_taken
- recommended_next_action
- response
- links

The ai_summary must be concise but structured enough for handover, covering issue category, urgency, user details known, problem summary, steps already taken, and next action.
The response should sound like a confident front-line operator.`,
      response_json_schema: {
        type: 'object',
        properties: {
          ai_mode: { type: 'string' },
          enquiry_category: { type: 'string' },
          issue_category: { type: 'string' },
          urgency_level: { type: 'string' },
          confidence_level: { type: 'string' },
          ai_summary: { type: 'string' },
          ai_handover_reason: { anyOf: [{ type: 'string' }, { type: 'null' }] },
          steps_taken: { type: 'string' },
          recommended_next_action: { type: 'string' },
          response: { type: 'string' },
          links: { type: 'array', items: { type: 'string' } }
        },
        required: ['ai_mode', 'enquiry_category', 'issue_category', 'urgency_level', 'confidence_level', 'ai_summary', 'steps_taken', 'recommended_next_action', 'response', 'links']
      }
    });

    const ai_mode = ensureAllowed(forcedRouting?.ai_mode || result?.ai_mode, allowedAiModes, 'ai_active');
    const enquiry_category = ensureAllowed(forcedRouting?.enquiry_category || detectEnquiryCategory(combinedText) || result?.enquiry_category, allowedCategories, 'general');
    const urgency_level = ensureAllowed(forcedRouting?.urgency_level || result?.urgency_level, allowedUrgencyLevels, ai_mode === 'escalated' ? 'urgent' : 'normal');
    const confidence_level = ensureAllowed(forcedRouting?.confidence_level || result?.confidence_level, confidenceLevels, 'medium');
    const issue_category = forcedRouting?.issue_category || result?.issue_category || detectIssueCategory(combinedText);
    const ai_handover_reason = forcedRouting?.ai_handover_reason || result?.ai_handover_reason || null;
    const response = result?.response || buildFallbackResponse({ visitorName, aiMode: ai_mode, enquiryCategory: enquiry_category, issueCategory: issue_category, assistantReplies });
    const steps_taken = result?.steps_taken || (assistantReplies > 0 ? `Assistant already asked ${assistantReplies} clarifying question${assistantReplies === 1 ? '' : 's'}.` : 'Assistant reviewed the enquiry and provided a first-line response.');
    const recommended_next_action = result?.recommended_next_action || (ai_mode === 'ai_active' ? 'Continue clarifying or follow the linked page.' : 'Human follow-up required.');
    const ai_summary = String(result?.ai_summary || `Issue category: ${issue_category}. Urgency: ${urgency_level}. Visitor: ${visitorName || visitorEmail || 'unknown'}. Problem: ${latestMessage}. Steps taken: ${steps_taken}. Next action: ${recommended_next_action}.`).replace(/\s+/g, ' ').trim();

    return Response.json({
      ai_mode,
      enquiry_category,
      issue_category,
      urgency_level,
      confidence_level,
      ai_summary,
      ai_handover_reason,
      steps_taken,
      recommended_next_action,
      response,
      links: Array.isArray(result?.links) ? result.links : [],
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});