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
      const aiResponse = await base44.asServiceRole.functions.invoke('supportAiAssistant', {
        visitorName: name || conversation.visitor_name || 'Visitor',
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
          message_preview: message.slice(0, 180),
          intent_summary: handoverSummary,
          wait_label: 'Just now',
          channel_label: 'Chat',
          cta_label: 'Reply Now',
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