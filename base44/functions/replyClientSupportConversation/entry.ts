import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

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
    const user = await base44.auth.me();
    const { conversationId, message, sourcePage, runtimeDataEnv } = await req.json();

    if (runtimeDataEnv === 'dev') {
      return Response.json({ error: 'Client support messaging is disabled in preview test mode so test actions do not write into production data.' }, { status: 409 });
    }

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.client_account_id) {
      return Response.json({ error: 'Client account not linked' }, { status: 403 });
    }

    if (!conversationId || !message) {
      return Response.json({ error: 'conversationId and message are required' }, { status: 400 });
    }

    const conversations = await base44.asServiceRole.entities.SupportConversation.filter({ id: conversationId }, '-updated_at', 1);
    const conversation = conversations[0] || null;

    if (!conversation) {
      return Response.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conversation.linked_client_account_id !== user.client_account_id) {
      return Response.json({ error: 'Conversation access denied' }, { status: 403 });
    }

    const now = new Date().toISOString();
    const reply = await base44.asServiceRole.entities.SupportMessage.create({
      conversation_id: conversation.id,
      sender_type: 'client',
      sender_user_id: user.id,
      sender_name: user.full_name || user.email,
      sender_email: user.email,
      message_body: message,
      attachment_url: null,
      created_at: now,
      is_internal_note: false,
    });

    const visibleMessages = await base44.asServiceRole.entities.SupportMessage.filter({ conversation_id: conversation.id }, 'created_at', 50);
    const priorMessages = visibleMessages.filter((item) => !item.is_internal_note);

    let aiResult = null;
    let aiMessage = null;

    if (conversation.ai_mode === 'ai_active') {
      const aiResponse = await base44.asServiceRole.functions.invoke('supportAiAssistant', {
        visitorName: user.full_name || user.email,
        visitorEmail: user.email,
        visitorPhone: conversation.visitor_phone || '',
        subject: conversation.subject,
        latestMessage: message,
        sourcePage: sourcePage || conversation.source_page || '/ClientPortal',
        priorMessages,
      });
      aiResult = aiResponse?.data || aiResponse;

      if (aiResult?.response) {
        aiMessage = await base44.asServiceRole.entities.SupportMessage.create({
          conversation_id: conversation.id,
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
      status: aiResult ? mapStatusFromAiMode(aiResult.ai_mode) : ['resolved', 'closed'].includes(conversation.status) ? 'open' : 'waiting_on_admin',
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
      title: 'New client reply in support conversation',
      message: `${user.full_name || user.email} sent a new unread reply from the client portal.`,
      triggered_at: now,
      actor_email: user.email,
      metadata: {
        conversation_id: conversation.id,
        source_page: sourcePage || conversation.source_page || '/ClientPortal',
        linked_lead_id: conversation.linked_lead_id || null,
        enquiry_category: aiResult?.enquiry_category || conversation.enquiry_category || null,
        urgency_level: aiResult?.urgency_level || conversation.urgency_level || null,
        issue_category: aiResult?.issue_category || null,
        steps_taken: aiResult?.steps_taken || null,
        recommended_next_action: aiResult?.recommended_next_action || null,
      },
    });

    if (['human_required', 'escalated'].includes(aiResult?.ai_mode || conversation.ai_mode)) {
      await base44.asServiceRole.functions.invoke('sendAdminAlert', {
        eventType: 'support_conversation_reply',
        entityName: 'SupportConversation',
        entityId: conversation.id,
        clientAccountId: conversation.linked_client_account_id || null,
        title: ['urgent', 'high'].includes(aiResult?.urgency_level || conversation.urgency_level) ? 'Client portal reply needs reply' : 'Client portal support needs review',
        message: aiResult?.ai_summary || message.slice(0, 180),
        actorEmail: user.email,
        uniqueKey: `client_portal_reply:${conversation.id}:${now}`,
        priority: ['urgent', 'high'].includes(aiResult?.urgency_level || conversation.urgency_level) ? 'high' : 'normal',
        smsMessage: aiResult?.ai_summary || message.slice(0, 180),
        metadata: {
          conversation_id: conversation.id,
          admin_link: `/ActionInbox?view=needs_reply_now&conversationId=${conversation.id}&focusReply=1`,
          full_name: user.full_name || user.email,
          business_name: '',
          email: user.email,
          mobile_number: conversation.visitor_phone || '',
          enquiry_category: aiResult?.enquiry_category || conversation.enquiry_category,
          urgency_level: aiResult?.urgency_level || conversation.urgency_level,
          issue_category: aiResult?.issue_category || null,
          message_preview: message.slice(0, 180),
          intent_summary: aiResult?.ai_summary || message.slice(0, 180),
          steps_taken: aiResult?.steps_taken || null,
          recommended_next_action: aiResult?.recommended_next_action || null,
          wait_label: 'Just now',
          channel_label: 'Client Portal',
          cta_label: 'Reply Now',
          source_page: sourcePage || conversation.source_page || '/ClientPortal',
        },
      });
    }

    return Response.json({ message: reply, aiMessage, conversation: nextConversation });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});