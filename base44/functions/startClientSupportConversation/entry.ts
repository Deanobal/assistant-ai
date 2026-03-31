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
    const { subject, message, sourcePage, runtimeDataEnv } = await req.json();

    if (runtimeDataEnv === 'dev') {
      return Response.json({ error: 'Client support messaging is disabled in preview test mode so test actions do not write into production data.' }, { status: 409 });
    }

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.client_account_id) {
      return Response.json({ error: 'Client account not linked' }, { status: 403 });
    }

    if (!subject || !message) {
      return Response.json({ error: 'subject and message are required' }, { status: 400 });
    }

    const clientMatches = await base44.asServiceRole.entities.ClientAccount.filter({ id: user.client_account_id }, '-updated_date', 1);
    const client = clientMatches[0] || null;
    const now = new Date().toISOString();
    const aiResponse = await base44.asServiceRole.functions.invoke('supportAiAssistant', {
      visitorName: user.full_name || client?.contact_name || user.email,
      visitorEmail: user.email,
      visitorPhone: client?.phone || '',
      subject,
      latestMessage: message,
      sourcePage: sourcePage || '/ClientPortal',
      priorMessages: [],
    });
    const aiResult = aiResponse?.data || aiResponse;

    const conversation = await base44.asServiceRole.entities.SupportConversation.create({
      created_at: now,
      updated_at: now,
      status: mapStatusFromAiMode(aiResult.ai_mode),
      source_type: 'client_portal',
      source_page: sourcePage || '/ClientPortal',
      visitor_name: user.full_name || client?.contact_name || user.email,
      visitor_email: user.email,
      visitor_phone: client?.phone || '',
      subject,
      assigned_admin_id: null,
      linked_lead_id: client?.lead_id || null,
      linked_client_account_id: user.client_account_id,
      unread_for_admin: true,
      unread_for_client: false,
      last_message_at: now,
      last_message_preview: message.slice(0, 180),
      priority: mapPriorityFromUrgency(aiResult.urgency_level),
      ai_mode: aiResult.ai_mode,
      enquiry_category: aiResult.enquiry_category,
      urgency_level: aiResult.urgency_level,
      ai_summary: aiResult.ai_summary,
      ai_last_response_at: aiResult.response ? now : null,
      ai_handover_reason: aiResult.ai_handover_reason || null,
    });

    const firstMessage = await base44.asServiceRole.entities.SupportMessage.create({
      conversation_id: conversation.id,
      sender_type: 'client',
      sender_user_id: user.id,
      sender_name: user.full_name || client?.contact_name || user.email,
      sender_email: user.email,
      message_body: message,
      attachment_url: null,
      created_at: now,
      is_internal_note: false,
    });

    const aiMessage = aiResult.response
      ? await base44.asServiceRole.entities.SupportMessage.create({
          conversation_id: conversation.id,
          sender_type: 'system',
          sender_user_id: null,
          sender_name: 'AssistantAI Assistant',
          sender_email: 'assistant@assistantai.com.au',
          message_body: aiResult.response,
          attachment_url: null,
          created_at: now,
          is_internal_note: false,
        })
      : null;

    await base44.asServiceRole.entities.NotificationLog.create({
      event_type: 'support_conversation_created',
      entity_name: 'SupportConversation',
      entity_id: conversation.id,
      client_account_id: user.client_account_id,
      recipient_role: 'admin',
      recipient_email: null,
      channel: 'in_app',
      delivery_status: 'stored',
      provider_name: 'SupportChat',
      provider_message: 'Stored for internal admin review. No external delivery configured yet.',
      title: 'New client portal support conversation',
      message: `${user.full_name || user.email} started a new ${conversation.enquiry_category} conversation from the client portal.`,
      triggered_at: now,
      actor_email: user.email,
      metadata: {
        conversation_id: conversation.id,
        source_page: sourcePage || '/ClientPortal',
        linked_lead_id: conversation.linked_lead_id || null,
        enquiry_category: conversation.enquiry_category,
        urgency_level: conversation.urgency_level,
        issue_category: aiResult.issue_category || null,
        steps_taken: aiResult.steps_taken || null,
        recommended_next_action: aiResult.recommended_next_action || null,
      },
    });

    if (['human_required', 'escalated'].includes(conversation.ai_mode)) {
      await base44.asServiceRole.functions.invoke('sendAdminAlert', {
        eventType: 'support_conversation_created',
        entityName: 'SupportConversation',
        entityId: conversation.id,
        clientAccountId: user.client_account_id,
        title: ['urgent', 'high'].includes(conversation.urgency_level) ? 'Client portal message needs reply' : 'Client portal support needs review',
        message: aiResult.ai_summary || message.slice(0, 180),
        actorEmail: user.email,
        uniqueKey: `client_portal_create:${conversation.id}:${now}`,
        priority: ['urgent', 'high'].includes(conversation.urgency_level) ? 'high' : 'normal',
        smsMessage: aiResult.ai_summary || message.slice(0, 180),
        metadata: {
          conversation_id: conversation.id,
          admin_link: `/ActionInbox?view=needs_reply_now&conversationId=${conversation.id}&focusReply=1`,
          full_name: user.full_name || client?.contact_name || user.email,
          business_name: client?.business_name || '',
          email: user.email,
          mobile_number: client?.phone || '',
          enquiry_category: conversation.enquiry_category,
          urgency_level: conversation.urgency_level,
          issue_category: aiResult.issue_category || null,
          message_preview: message.slice(0, 180),
          intent_summary: aiResult.ai_summary || message.slice(0, 180),
          steps_taken: aiResult.steps_taken || null,
          recommended_next_action: aiResult.recommended_next_action || null,
          wait_label: 'Just now',
          channel_label: 'Client Portal',
          cta_label: 'Reply Now',
          source_page: sourcePage || '/ClientPortal',
          assigned_admin_id: null,
        },
      });
    }

    return Response.json({ conversation, messages: aiMessage ? [firstMessage, aiMessage] : [firstMessage] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});