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
    'setup help',
    'setup question',
    'onboarding question',
    'onboarding help',
    'intake form help',
    'intake form',
    'intake',
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
    'discount',
    'quote',
    'proposal',
    'bespoke pricing'
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
      ai_handover_reason: 'Complex pricing enquiry requires human follow-up.',
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

function buildFallbackResponse({ visitorName, aiMode, enquiryCategory, handoverReason }) {
  const greeting = visitorName ? `Hi ${visitorName},` : 'Hi,';

  if (aiMode === 'escalated') {
    return `${greeting} I’m AssistantAI Assistant. I’ve flagged this as urgent and passed it to our human team for review. Please share any key details like what changed, what is affected, and when it started so we can prioritise it properly.`;
  }

  if (aiMode === 'human_required') {
    return `${greeting} I’m AssistantAI Assistant. A human team member needs to review this next${handoverReason ? ` because ${handoverReason.toLowerCase()}` : ''}. Please share any extra context that would help us respond faster.`;
  }

  if (enquiryCategory === 'sales') {
    return `${greeting} I’m AssistantAI Assistant. It sounds like you’re exploring whether AssistantAI is the right fit. The best next step is usually a strategy call. What kind of enquiries, bookings, or follow-up volume are you trying to improve?`;
  }

  if (enquiryCategory === 'onboarding') {
    return `${greeting} I’m AssistantAI Assistant. I can help with onboarding guidance. To point you in the right direction, what stage are you at right now — setup, integrations, intake, or go-live?`;
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
- If pricing is complex, custom, or unclear, route to a human instead of quoting numbers
- For sales leads, encourage a strategy call when appropriate
- For onboarding questions, guide toward onboarding help
- For operational issues, route to support or escalate
- Ask one clarifying question when useful

Classification rules:
- sales = new system interest, pricing interest, bookings automation, lead capture, demos, fit checks
- onboarding = setup, implementation, integrations, intake, go-live, onboarding help
- support = standard support questions that are not urgent
- urgent = broken system, outage, blocked payment issue, urgent operational problem
- general = everything else

Examples:
- "I want to know your pricing" = sales
- "I want to get started" = sales
- "I paid and need help with setup" = onboarding
- "My portal is not working" = support unless there is clear urgency or outage language
- "This is urgent, something is broken" = urgent
- "Can you tell me what you do?" = general

AI mode rules:
- ai_active = AI can continue the conversation safely
- human_required = human review needed, requested, or pricing is too complex
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

The response should be concise, honest, and action-oriented.`,
      response_json_schema: {
        type: 'object',
        properties: {
          ai_mode: { type: 'string' },
          enquiry_category: { type: 'string' },
          urgency_level: { type: 'string' },
          ai_summary: { type: 'string' },
          ai_handover_reason: { anyOf: [{ type: 'string' }, { type: 'null' }] },
          response: { type: 'string' }
        },
        required: ['ai_mode', 'enquiry_category', 'urgency_level', 'ai_summary', 'response']
      }
    });

    const ai_mode = ensureAllowed(forcedRouting?.ai_mode || result?.ai_mode, allowedAiModes, 'ai_active');
    const enquiry_category = ensureAllowed(forcedRouting?.enquiry_category || result?.enquiry_category, allowedCategories, 'general');
    const urgency_level = ensureAllowed(forcedRouting?.urgency_level || result?.urgency_level, allowedUrgencyLevels, 'normal');
    const ai_handover_reason = forcedRouting?.ai_handover_reason || result?.ai_handover_reason || null;
    const ai_summary = result?.ai_summary || `AI classified this conversation as ${enquiry_category} with ${urgency_level} urgency.`;
    const response = result?.response || buildFallbackResponse({ visitorName, aiMode: ai_mode, enquiryCategory: enquiry_category, handoverReason: ai_handover_reason });

    return Response.json({
      ai_mode,
      enquiry_category,
      urgency_level,
      ai_summary,
      ai_handover_reason,
      response,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});