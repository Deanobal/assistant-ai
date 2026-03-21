import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const allowedAiModes = ['ai_active', 'human_required', 'escalated', 'closed'];
const allowedCategories = ['sales', 'onboarding', 'support', 'urgent', 'general'];
const allowedUrgencyLevels = ['low', 'normal', 'high', 'urgent'];

function includesAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function normalizeText(value) {
  return String(value || '').toLowerCase();
}

function detectKeywordCategory(text) {
  const salesKeywords = [
    'pricing',
    'price',
    'book a demo',
    'demo',
    'get started',
    'booking automation',
    'ai receptionist',
    'crm automation',
    'call handling',
    'lead capture'
  ];

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
  if (includesAny(text, ['where is the intake form', 'intake form help', 'intake form'])) return 'onboarding_intake';
  if (includesAny(text, ['connect my tools', 'connect my tool', 'tool connection', 'integrations', 'connect tools'])) return 'tool_connection';
  if (includesAny(text, ['change my business details', 'business details', 'update my details'])) return 'business_details';
  if (includesAny(text, ['what happens next', 'just signed up', 'i just signed up', 'how do i start setup'])) return 'next_step';
  return 'general_onboarding';
}

function buildForcedRouting(text) {
  const urgentKeywords = [
    'urgent',
    'broken',
    'down',
    'outage',
    'critical',
    'system down',
    'service down',
    'offline',
    'system broken',
    'payment problem',
    'payment issue',
    'payment failed',
    'billing issue',
    'charged twice',
    'blocked access',
    'locked out',
    'cant access',
    'cannot access',
    'site is down'
  ];

  const humanKeywords = [
    'human',
    'real person',
    'someone from your team',
    'speak to someone',
    'talk to someone',
    'call me',
    'team member'
  ];

  const pricingKeywords = [
    'custom pricing',
    'enterprise pricing',
    'custom enterprise pricing',
    'discount',
    'quote',
    'proposal',
    'bespoke pricing'
  ];

  const accountSpecificKeywords = [
    'my account',
    'account issue',
    'account-specific',
    'my subscription',
    'my invoice',
    'invoice issue',
    'login issue',
    'login problem'
  ];

  const frustrationKeywords = [
    'frustrated',
    'annoyed',
    'this is ridiculous',
    'not helpful',
    'still not working',
    'again',
    'upset'
  ];

  const keywordCategory = detectKeywordCategory(text);

  if (includesAny(text, urgentKeywords)) {
    return {
      ai_mode: 'escalated',
      enquiry_category: 'urgent',
      urgency_level: 'urgent',
      ai_handover_reason: 'Urgent operational or billing issue detected.',
    };
  }

  if (includesAny(text, humanKeywords)) {
    return {
      ai_mode: 'human_required',
      enquiry_category: keywordCategory === 'general' ? 'support' : keywordCategory,
      urgency_level: 'normal',
      ai_handover_reason: 'Visitor explicitly requested a human response.',
    };
  }

  if (includesAny(text, pricingKeywords)) {
    return {
      ai_mode: 'human_required',
      enquiry_category: 'sales',
      urgency_level: 'normal',
      ai_handover_reason: 'Complex or enterprise pricing enquiry requires human follow-up.',
    };
  }

  if (includesAny(text, accountSpecificKeywords)) {
    return {
      ai_mode: 'human_required',
      enquiry_category: keywordCategory === 'general' ? 'support' : keywordCategory,
      urgency_level: 'high',
      ai_handover_reason: 'Account-specific issue requires human review.',
    };
  }

  if (includesAny(text, frustrationKeywords)) {
    return {
      ai_mode: 'human_required',
      enquiry_category: keywordCategory === 'general' ? 'support' : keywordCategory,
      urgency_level: 'high',
      ai_handover_reason: 'Repeated user frustration detected.',
    };
  }

  if (keywordCategory !== 'general') {
    return {
      ai_mode: 'ai_active',
      enquiry_category: keywordCategory,
      urgency_level: 'normal',
      ai_handover_reason: null,
    };
  }

  return null;
}

function ensureAllowed(value, allowedValues, fallback) {
  return allowedValues.includes(value) ? value : fallback;
}

function buildFallbackResponse({ visitorName, aiMode, enquiryCategory, handoverReason, rawText }) {
  const greeting = visitorName ? `Hi ${visitorName},` : 'Hi,';

  if (aiMode === 'escalated') {
    return `${greeting} I’m AssistantAI Assistant. Thanks — I’m passing this to our team so they can help properly. We’ll get back to you shortly. If useful, please share what changed, what is affected, and when it started.`;
  }

  if (aiMode === 'human_required') {
    return `${greeting} I’m AssistantAI Assistant. Thanks — I’m passing this to our team so they can help properly. We’ll get back to you shortly.${handoverReason ? ` For context, I’ve noted: ${handoverReason.toLowerCase()}.` : ''}`;
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
    const { visitorName, subject, latestMessage, sourcePage, priorMessages = [] } = await req.json();

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
    const forcedRouting = buildForcedRouting(combinedText);

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
- If pricing is complex, custom, enterprise-level, or unclear, route to a human instead of quoting numbers
- If the issue is account-specific, billing-related, urgent, or confidence is low, route to a human
- If the visitor seems frustrated repeatedly, route to a human
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
- ai_active = AI can continue the conversation safely
- human_required = human review needed, requested, account-specific, low-confidence, repeated frustration, or pricing is too complex
- escalated = urgent operational or payment issue
- closed = only if the conversation is clearly complete

Urgency rules:
- urgent = outage, broken system, blocked payment, time-sensitive operational issue
- high = clear human request or materially important issue
- normal = standard enquiry
- low = light information request

Context:
- Visitor name: ${visitorName || 'Unknown'}
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

The ai_summary must be a short admin-ready summary covering:
- who the visitor is
- likely category
- urgency
- what they need
- what the AI already asked or answered

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

    const ai_mode = ensureAllowed(forcedRouting?.ai_mode || result?.ai_mode, allowedAiModes, 'ai_active');
    const enquiry_category = ensureAllowed(forcedRouting?.enquiry_category || result?.enquiry_category, allowedCategories, 'general');
    const urgency_level = ensureAllowed(forcedRouting?.urgency_level || result?.urgency_level, allowedUrgencyLevels, 'normal');
    const ai_handover_reason = forcedRouting?.ai_handover_reason || result?.ai_handover_reason || null;
    const likely_use_case = result?.likely_use_case || (enquiry_category === 'sales' ? detectSalesUseCase(combinedText) : 'n/a');
    const likely_plan_fit = result?.likely_plan_fit || (enquiry_category === 'sales' ? inferSalesPlanFit(combinedText, likely_use_case) : 'n/a');
    const ai_summary = result?.ai_summary || `Visitor: ${visitorName || 'Unknown'}. Category: ${enquiry_category}. Urgency: ${urgency_level}. Likely use case: ${likely_use_case}. Likely plan fit: ${likely_plan_fit}.`;
    const response = result?.response || buildFallbackResponse({ visitorName, aiMode: ai_mode, enquiryCategory: enquiry_category, handoverReason: ai_handover_reason, rawText: combinedText });

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