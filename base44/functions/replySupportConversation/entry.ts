import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function mapPriorityFromUrgency(urgencyLevel) {
  if (urgencyLevel === 'urgent') return 'urgent';
  if (urgencyLevel === 'high') return 'high';
  if (urgencyLevel === 'low') return 'low';
  return 'normal';
}

function mapConversationPriority(aiResult, fallbackPriority) {
  const basePriority = aiResult ? mapPriorityFromUrgency(aiResult.urgency_level) : fallbackPriority;
  if (basePriority === 'urgent') return 'urgent';
  if (aiResult?.high_value_lead || aiResult?.sales_intent_level === 'high') return 'high';
  return basePriority;
}

function mapStatusFromAiMode(aiMode) {
  if (aiMode === 'closed') return 'closed';
  if (aiMode === 'ai_active') return 'waiting_on_customer';
  return 'waiting_on_admin';
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
      const aiResponse = await base44.asServiceRole.functions.invoke('publicSupportAssistant', {
        visitorName: name || conversation.visitor_name || 'Visitor',
        visitorEmail: email,
        visitorPhone: conversation.visitor_phone || '',
        subject: conversation.subject,
        latestMessage: message,
        sourcePage: sourcePage || conversation.source_page || '/',
        priorMessages,
      });
      aiResult = aiResponse?.data || aiResponse;

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
      status: aiResult ? mapStatusFromAiMode(aiResult.ai_mode) : 'waiting_on_customer',
      source_page: sourcePage || conversation.source_page,
      unread_for_admin: true,
      unread_for_client: false,
      last_message_at: now,
      last_message_preview: message.slice(0, 180),
      visitor_phone: aiResult?.captured_phone || conversation.visitor_phone,
      priority: mapConversationPriority(aiResult, conversation.priority),
      ai_mode: aiResult ? aiResult.ai_mode : conversation.ai_mode,
      ai_stage: aiResult ? aiResult.ai_stage || 'knowledge_answer' : 'waiting_on_customer',
      primary_intent: aiResult ? aiResult.primary_intent || null : conversation.primary_intent,
      detected_intents: aiResult ? aiResult.detected_intents || [] : conversation.detected_intents,
      pricing_shown: aiResult ? aiResult.pricing_shown || false : conversation.pricing_shown,
      high_value_lead: aiResult ? aiResult.high_value_lead || false : conversation.high_value_lead,
      enquiry_category: aiResult ? aiResult.enquiry_category : conversation.enquiry_category,
      urgency_level: aiResult ? aiResult.urgency_level : conversation.urgency_level,
      ai_summary: aiResult ? aiResult.ai_summary : conversation.ai_summary,
      ai_last_response_at: aiMessage ? now : conversation.ai_last_response_at,
      ai_handover_reason: aiResult ? aiResult.ai_handover_reason || null : conversation.ai_handover_reason,
      preferred_contact_time: aiResult ? aiResult.preferred_contact_time || null : conversation.preferred_contact_time,
      captured_business_type: aiResult ? aiResult.captured_business_type || null : conversation.captured_business_type,
      qualification_needed: aiResult ? aiResult.qualification_needed || [] : conversation.qualification_needed,
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
        ai_stage: aiResult?.ai_stage || (conversation.ai_mode === 'ai_active' ? conversation.ai_stage || 'knowledge_answer' : 'waiting_on_customer'),
        primary_intent: aiResult?.primary_intent || conversation.primary_intent || null,
        detected_intents: aiResult?.detected_intents || conversation.detected_intents || [],
        enquiry_category: aiResult?.enquiry_category || conversation.enquiry_category || null,
        urgency_level: aiResult?.urgency_level || conversation.urgency_level || null,
        issue_category: aiResult?.issue_category || null,
        confidence_level: aiResult?.confidence_level || null,
        feature_status: aiResult?.feature_status || null,
        steps_taken: aiResult?.steps_taken || null,
        recommended_next_action: aiResult?.recommended_next_action || null,
        sales_intent_level: aiResult?.sales_intent_level || null,
        pricing_shown: aiResult?.pricing_shown || conversation.pricing_shown || false,
        high_value_lead: aiResult?.high_value_lead || false,
        captured_business_type: aiResult?.captured_business_type || null,
        preferred_contact_time: aiResult?.preferred_contact_time || conversation.preferred_contact_time || null,
        qualification_needed: aiResult?.qualification_needed || [],
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
        title: aiResult?.closing_mode ? 'Closing lead needs immediate call' : aiResult?.high_value_lead ? 'High-value lead needs reply' : (handoverMode === 'escalated' || ['urgent', 'high'].includes(handoverUrgency) || (aiResult?.enquiry_category || conversation.enquiry_category) === 'sales' ? 'High-intent chat needs reply' : 'Chat needs human reply'),
        message: handoverSummary,
        actorEmail: email,
        uniqueKey: `chat_handover_reply:${conversation.id}:${handoverMode}:${now}`,
        priority: aiResult?.closing_mode || handoverUrgency === 'urgent' ? 'urgent' : (aiResult?.high_value_lead || handoverUrgency === 'high' ? 'high' : 'normal'),
        smsMessage: handoverSummary,
        metadata: {
          conversation_id: conversation.id,
          admin_link: `/ActionInbox?view=needs_reply_now&conversationId=${conversation.id}&focusReply=1`,
          full_name: name || conversation.visitor_name || 'Visitor',
          business_name: '',
          email,
          mobile_number: aiResult?.captured_phone || conversation.visitor_phone || '',
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
          assigned_admin_id: conversation.assigned_admin_id || null,
          ai_mode: handoverMode,
          ai_stage: aiResult?.ai_stage || conversation.ai_stage || 'handoff_waiting',
          primary_intent: aiResult?.primary_intent || conversation.primary_intent || null,
          detected_intents: aiResult?.detected_intents || conversation.detected_intents || [],
          ai_handover_reason: aiResult?.ai_handover_reason || conversation.ai_handover_reason || null,
          ai_summary: handoverSummary,
          feature_status: aiResult?.feature_status || null,
          sales_intent_level: aiResult?.sales_intent_level || null,
          pricing_shown: aiResult?.pricing_shown || conversation.pricing_shown || false,
          high_value_lead: aiResult?.high_value_lead || false,
          captured_business_type: aiResult?.captured_business_type || null,
          qualification_needed: aiResult?.qualification_needed || [],
          closing_mode: aiResult?.closing_mode || false,
          preferred_contact_time: aiResult?.preferred_contact_time || null,
        },
      });
    }

    return Response.json({ message: reply, aiMessage, conversation: nextConversation });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});