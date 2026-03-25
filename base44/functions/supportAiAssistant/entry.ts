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

const siteKnowledge = `
AssistantAI site and product knowledge:
- Services page (/Services): AI Voice Agents, AI Receptionists, AI Chatbots, CRM Automation, Appointment Booking Automation, SMS & Email Follow-Up, Workflow Automation.
- Pricing page (/Pricing): Starter is $497/month + $1,500 setup for AI call handling and lead capture. Growth is $1,500/month + $3,000 setup for voice AI, booking automation, CRM sync, and follow-up. Enterprise is $3,000+/month + $7,500+ setup for advanced workflows, multiple teams, or complex integrations.
- Pricing guidance: plain pricing questions should be answered directly. Use /BookStrategyCall for advisory help. Use /GetStartedNow?plan=starter or /GetStartedNow?plan=growth when the user is ready to move now on those plans.
- Integrations page (/Integrations): common CRM options include GoHighLevel, HubSpot, Salesforce, Pipedrive, Zoho. Calendar options include Google Calendar and Outlook Calendar. SMS options include Twilio, GoHighLevel SMS, and other compatible SMS tools.
- Strategy call page (/BookStrategyCall): users can request or book a free strategy call. This is the correct route for discovery, scoping, or custom integration discussions.
- Client portal (/ClientLogin then /ClientPortal): private login for clients. Portal areas include Overview, Call Recordings, Analytics, Billing, Integrations, and Support.
- Billing in portal: billing records, plan details, renewal timing, payment method status, billing history, and Stripe-ready billing architecture can appear there.
- Support flow: website chat handles sales/support triage and stores a thread. Client portal support keeps secure support history in one thread.
- Chat widget behavior: the AI assistant should answer straightforward questions, ask short follow-up questions when context is missing, keep replies concise, and only hand over urgent, account, security, billing, outage, low-confidence, or explicitly human-requested issues.
- Platform preview (/Platform): public sample preview of client experience across calls, analytics, billing, integrations, and support.
`;

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
${siteKnowledge}

Answering rules:
- if the user asks about services, pricing, integrations, strategy calls, onboarding, billing, client portal, support flow, or chat widget behavior, answer directly from the knowledge above
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