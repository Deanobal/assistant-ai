import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { conversationId, email, name, message, sourcePage, runtimeDataEnv } = await req.json();

    if (runtimeDataEnv === 'dev') {
      return Response.json({ error: 'Support messaging is disabled in preview test mode so test actions do not write into production data.' }, { status: 409 });
    }

    if (!conversationId || !email || !message) {
      return Response.json({ error: 'conversationId, email, and message are required' }, { status: 400 });
    }

    const conversations = await base44.asServiceRole.entities.SupportConversation.filter({ id: conversationId }, '-updated_date', 1);
    const conversation = conversations[0] || null;

    if (!conversation) {
      return Response.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if ((conversation.visitor_email || '').toLowerCase() !== String(email).toLowerCase()) {
      return Response.json({ error: 'Conversation access denied' }, { status: 403 });
    }

    const now = new Date().toISOString();
    const reply = await base44.asServiceRole.entities.SupportMessage.create({
      conversation_id: conversationId,
      sender_type: 'visitor',
      sender_user_id: null,
      sender_name: name || conversation.visitor_name || 'Visitor',
      sender_email: email,
      message_body: message,
      attachment_url: null,
      created_at: now,
      is_internal_note: false,
    });

    const visibleMessages = await base44.asServiceRole.entities.SupportMessage.filter({ conversation_id: conversationId }, 'created_at', 50);
    const priorMessages = visibleMessages.filter((item) => !item.is_internal_note);

    let aiResult = null;
    let aiMessage = null;

    if (conversation.ai_mode === 'ai_active') {
      const transcript = priorMessages.slice(-8).map((item) => `${item.sender_type || 'unknown'}: ${item.message_body || ''}`).join('\n');
      const combinedText = [conversation.subject, message, transcript].filter(Boolean).join('\n').toLowerCase();
      const assistantReplies = priorMessages.filter((item) => item?.sender_type === 'system').length;
      const includesAny = (keywords) => keywords.some((keyword) => combinedText.includes(keyword));
      const explicitHumanRequest = includesAny(['human', 'real person', 'someone from your team', 'speak to someone', 'talk to someone', 'please escalate', 'need an agent']);
      const criticalOutage = includesAny(['site is down', 'website is down', 'system is down', 'critical outage', 'outage', 'urgent bug', 'cannot take bookings', 'nothing is working']) || (includesAny(['urgent', 'asap', 'immediately', 'critical']) && includesAny(['bug', 'broken', 'error', 'not working', 'crash']));
      const billingSecurityIssue = includesAny(['billing issue', 'billing problem', 'invoice issue', 'payment failed', 'refund', 'charged twice', 'account issue', 'security issue', 'locked out', 'cannot access', 'cant access', 'login issue']);
      const manualIntegrationHelp = includesAny(['help connect', 'connect my', 'set up integration', 'setup integration', 'integration setup', 'calendar connection', 'crm connection', 'twilio setup']);
      const pricingDecision = includesAny(['quote', 'proposal', 'ready to start', 'ready to book', 'call me', 'call me back', 'sign me up', 'start now']);
      const defaultCategory = includesAny(['pricing', 'price', 'cost', 'quote', 'plan', 'get started', 'strategy call', 'demo']) ? 'sales'
        : includesAny(['onboarding', 'intake', 'go live', 'setup', 'implementation']) ? 'onboarding'
        : criticalOutage ? 'urgent'
        : billingSecurityIssue || manualIntegrationHelp || includesAny(['bug', 'broken', 'error', 'not working', 'portal', 'login', 'support', 'tech help', 'integration']) ? 'support'
        : 'general';
      const issueCategory = includesAny(['pricing', 'price', 'cost', 'plan']) ? 'pricing'
        : includesAny(['strategy call', 'book a call', 'book a demo']) ? 'strategy_call'
        : includesAny(['integration', 'calendar', 'crm', 'twilio', 'hubspot', 'salesforce', 'outlook']) ? 'integration_setup'
        : includesAny(['billing', 'invoice', 'payment', 'card', 'charge']) ? 'billing'
        : includesAny(['login', 'locked out', 'password', 'account']) ? 'account_access'
        : includesAny(['portal', 'dashboard', 'analytics', 'call recordings', 'support tab', 'chat widget']) ? 'client_portal'
        : includesAny(['error', 'broken', 'bug', 'blank page', 'crash', 'not working']) ? 'bug_or_feature_issue'
        : includesAny(['onboarding', 'intake', 'setup', 'go live']) ? 'onboarding'
        : includesAny(['services', 'what do you do', 'voice agent', 'chatbot', 'ai receptionist']) ? 'services'
        : includesAny(['tech help', 'technical help', 'help']) ? 'general_support'
        : 'general_enquiry';
      const isVagueSupport = includesAny(['i need help', 'need help', 'tech help', 'technical help', 'something is wrong', 'having issues', 'problem'])
        && !includesAny(['portal', 'billing', 'integration', 'calendar', 'crm', 'chat', 'widget', 'pricing', 'error', 'code', 'screen', 'page', 'login', 'invoice', 'onboarding'])
        && combinedText.length < 100;
      const forcedRouting = explicitHumanRequest
        ? { ai_mode: 'human_required', enquiry_category: defaultCategory === 'general' ? 'support' : defaultCategory, urgency_level: 'high', ai_handover_reason: 'User explicitly asked for a human.', confidence_level: 'high' }
        : criticalOutage
          ? { ai_mode: 'escalated', enquiry_category: 'urgent', urgency_level: 'urgent', ai_handover_reason: 'This looks business-critical or outage-related.', confidence_level: 'high' }
          : billingSecurityIssue
            ? { ai_mode: 'human_required', enquiry_category: 'support', urgency_level: 'normal', ai_handover_reason: 'Billing, account, or security issues need human review.', confidence_level: 'high' }
            : manualIntegrationHelp
              ? { ai_mode: 'human_required', enquiry_category: 'support', urgency_level: 'normal', ai_handover_reason: 'This integration setup request likely needs manual help from the team.', confidence_level: 'high' }
              : pricingDecision
                ? { ai_mode: 'human_required', enquiry_category: 'sales', urgency_level: 'high', ai_handover_reason: 'The user is ready to move forward and should get a human follow-up.', confidence_level: 'high' }
                : assistantReplies >= 3 && (isVagueSupport || defaultCategory === 'support')
                  ? { ai_mode: 'human_required', enquiry_category: 'support', urgency_level: 'normal', ai_handover_reason: 'The assistant has already asked enough clarifying questions and confidence is still low.', confidence_level: 'low' }
                  : isVagueSupport
                    ? { ai_mode: 'ai_active', enquiry_category: 'support', urgency_level: 'normal', ai_handover_reason: null, confidence_level: assistantReplies >= 2 ? 'low' : 'medium' }
                    : null;

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
- there have already been ${assistantReplies} assistant replies in this thread, and the total clarifying-question budget is 3 before escalation for low-confidence support cases

Knowledge:
- /Services covers AI Voice Agents, AI Receptionists, AI Chatbots, CRM Automation, Appointment Booking Automation, SMS & Email Follow-Up, and Workflow Automation.
- /Pricing includes Starter at $497/month + $1,500 setup, Growth at $1,500/month + $3,000 setup, and Enterprise from $3,000+/month + $7,500+ setup.
- /Integrations includes Google Calendar, Outlook Calendar, HubSpot, Salesforce, GoHighLevel, Pipedrive, Zoho, and Twilio-type workflows.
- /BookStrategyCall is the route for discovery and custom scoping.
- /ClientLogin then /ClientPortal is the private portal.
- The chat widget should answer clearly, collect support context, and only escalate when required.

Conversation context:
- visitor name: ${name || conversation.visitor_name || 'Visitor'}
- visitor email: ${email}
- visitor phone: ${conversation.visitor_phone || 'Not provided'}
- subject: ${conversation.subject}
- source page: ${sourcePage || conversation.source_page || '/'}
- latest message: ${message}
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
- response`,
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
            response: { type: 'string' }
          },
          required: ['ai_mode', 'enquiry_category', 'issue_category', 'urgency_level', 'confidence_level', 'ai_summary', 'steps_taken', 'recommended_next_action', 'response']
        }
      });

      const normalizedAiMode = ['ai_active', 'human_required', 'escalated', 'closed'].includes(result?.ai_mode)
        ? result.ai_mode
        : forcedRouting?.ai_mode || 'ai_active';
      const normalizedCategory = ['sales', 'onboarding', 'support', 'urgent', 'general'].includes(result?.enquiry_category)
        ? result.enquiry_category
        : forcedRouting?.enquiry_category || defaultCategory || 'general';
      const normalizedUrgency = ['low', 'normal', 'high', 'urgent'].includes(String(result?.urgency_level || '').toLowerCase())
        ? String(result.urgency_level).toLowerCase()
        : forcedRouting?.urgency_level || 'normal';
      const normalizedConfidence = ['low', 'medium', 'high'].includes(String(result?.confidence_level || '').toLowerCase())
        ? String(result.confidence_level).toLowerCase()
        : forcedRouting?.confidence_level || 'medium';

      aiResult = {
        ai_mode: normalizedAiMode,
        enquiry_category: normalizedCategory,
        issue_category: result?.issue_category || issueCategory,
        urgency_level: normalizedUrgency,
        confidence_level: normalizedConfidence,
        ai_summary: result?.ai_summary || `Issue category: ${result?.issue_category || issueCategory}. Urgency: ${normalizedUrgency}. Visitor: ${name || conversation.visitor_name || 'Visitor'}. Problem: ${message}. Steps taken: ${result?.steps_taken || 'Assistant reviewed the enquiry and replied.'}. Next action: ${result?.recommended_next_action || 'Continue clarifying or follow the linked page.'}`,
        ai_handover_reason: forcedRouting?.ai_handover_reason || result?.ai_handover_reason || null,
        steps_taken: result?.steps_taken || (assistantReplies > 0 ? `Assistant already asked ${assistantReplies} clarifying question${assistantReplies === 1 ? '' : 's'}.` : 'Assistant reviewed the enquiry and provided a first-line response.'),
        recommended_next_action: result?.recommended_next_action || (normalizedAiMode === 'ai_active' ? 'Continue clarifying or follow the linked page.' : 'Human follow-up required.'),
        response: result?.response,
      };

      if (aiResult?.response) {
        aiMessage = await base44.asServiceRole.entities.SupportMessage.create({
          conversation_id: conversationId,
          sender_type: 'system',
          sender_user_id: null,
          sender_name: 'AssistantAI Assistant',
          sender_email: 'assistant@assistantai.com.au',
          message_body: aiResult.response,
          attachment_url: null,
          created_at: now,
          is_internal_note: false,
        });
      }
    }

    const nextConversation = await base44.asServiceRole.entities.SupportConversation.update(conversation.id, {
      ...conversation,
      updated_at: now,
      status: aiResult ? mapStatusFromAiMode(aiResult.ai_mode) : 'waiting_on_admin',
      source_page: sourcePage || conversation.source_page,
      unread_for_admin: true,
      unread_for_client: false,
      last_message_at: now,
      last_message_preview: message.slice(0, 180),
      priority: aiResult ? mapPriorityFromUrgency(aiResult.urgency_level) : conversation.priority,
      ai_mode: aiResult ? aiResult.ai_mode : conversation.ai_mode,
      enquiry_category: aiResult ? aiResult.enquiry_category : conversation.enquiry_category,
      urgency_level: aiResult ? aiResult.urgency_level : conversation.urgency_level,
      ai_summary: aiResult ? aiResult.ai_summary : conversation.ai_summary,
      ai_last_response_at: aiMessage ? now : conversation.ai_last_response_at,
      ai_handover_reason: aiResult ? aiResult.ai_handover_reason || null : conversation.ai_handover_reason,
    });

    await base44.asServiceRole.entities.NotificationLog.create({
      event_type: 'support_conversation_reply',
      entity_name: 'SupportConversation',
      entity_id: conversation.id,
      client_account_id: conversation.linked_client_account_id || null,
      recipient_role: 'admin',
      recipient_email: null,
      channel: 'in_app',
      delivery_status: 'stored',
      provider_name: 'SupportChat',
      provider_message: 'Stored for internal admin review. No external delivery configured yet.',
      title: 'New visitor reply in support conversation',
      message: `${name || conversation.visitor_name || 'Visitor'} sent a new unread reply.`,
      triggered_at: now,
      actor_email: email,
      metadata: {
        conversation_id: conversation.id,
        source_page: sourcePage || conversation.source_page || '/',
        linked_lead_id: conversation.linked_lead_id || null,
        ai_mode: aiResult?.ai_mode || conversation.ai_mode || null,
        enquiry_category: aiResult?.enquiry_category || conversation.enquiry_category || null,
        urgency_level: aiResult?.urgency_level || conversation.urgency_level || null,
        issue_category: aiResult?.issue_category || null,
        confidence_level: aiResult?.confidence_level || null,
        steps_taken: aiResult?.steps_taken || null,
        recommended_next_action: aiResult?.recommended_next_action || null,
      },
    });

    const handoverMode = aiResult?.ai_mode || conversation.ai_mode;
    const handoverUrgency = aiResult?.urgency_level || conversation.urgency_level;
    const handoverSummary = aiResult?.ai_summary || conversation.ai_summary || message.slice(0, 180);

    if (['human_required', 'escalated'].includes(handoverMode)) {
      await base44.asServiceRole.functions.invoke('sendAdminAlert', {
        eventType: 'support_conversation_reply',
        entityName: 'SupportConversation',
        entityId: conversation.id,
        clientAccountId: conversation.linked_client_account_id || null,
        title: handoverMode === 'escalated' || ['urgent', 'high'].includes(handoverUrgency) || (aiResult?.enquiry_category || conversation.enquiry_category) === 'sales' ? 'High-intent chat needs reply' : 'Chat needs human reply',
        message: handoverSummary,
        actorEmail: email,
        uniqueKey: `chat_handover_reply:${conversation.id}:${handoverMode}:${now}`,
        priority: ['urgent', 'high'].includes(handoverUrgency) ? 'high' : 'normal',
        smsMessage: handoverSummary,
        metadata: {
          conversation_id: conversation.id,
          admin_link: `/ActionInbox?view=needs_reply_now&conversationId=${conversation.id}&focusReply=1`,
          full_name: name || conversation.visitor_name || 'Visitor',
          business_name: '',
          email,
          mobile_number: conversation.visitor_phone || '',
          enquiry_category: aiResult?.enquiry_category || conversation.enquiry_category,
          urgency_level: handoverUrgency,
          issue_category: aiResult?.issue_category || null,
          confidence_level: aiResult?.confidence_level || null,
          message_preview: message.slice(0, 180),
          intent_summary: handoverSummary,
          steps_taken: aiResult?.steps_taken || null,
          wait_label: 'Just now',
          channel_label: 'Chat',
          cta_label: 'Reply Now',
          recommended_action: aiResult?.recommended_next_action || (conversation.visitor_phone ? 'Call lead' : 'Reply now'),
          source_page: sourcePage || conversation.source_page || '/',
          ai_mode: handoverMode,
          ai_handover_reason: aiResult?.ai_handover_reason || conversation.ai_handover_reason || null,
          ai_summary: handoverSummary,
        },
      });
    }

    return Response.json({ message: reply, aiMessage, conversation: nextConversation });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});