import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

function buildSubject(sourcePage, name) {
  const pageLabel = (sourcePage || '/').replace('/', '') || 'home';
  return `Website message from ${name} (${pageLabel})`;
}

function uniqueById(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

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
    const { name, email, mobile, message, sourcePage, runtimeDataEnv } = await req.json();

    if (runtimeDataEnv === 'dev') {
      return Response.json({ error: 'Support messaging is disabled in preview test mode so test actions do not write into production data.' }, { status: 409 });
    }

    if (!name || !email || !message) {
      return Response.json({ error: 'name, email, and message are required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const preview = message.slice(0, 180);
    const subject = buildSubject(sourcePage, name);
    const byEmail = email ? await base44.asServiceRole.entities.Lead.filter({ email }, '-updated_date', 10) : [];
    const byMobile = mobile ? await base44.asServiceRole.entities.Lead.filter({ mobile_number: mobile }, '-updated_date', 10) : [];
    const matchedLeads = uniqueById([...byEmail, ...byMobile]);
    const matchedLead = matchedLeads.length === 1 ? matchedLeads[0] : null;
    const aiResponse = await base44.asServiceRole.functions.invoke('supportAiAssistant', {
      visitorName: name,
      visitorEmail: email,
      visitorPhone: mobile || '',
      subject,
      latestMessage: message,
      sourcePage: sourcePage || '/',
      priorMessages: [],
    });
    const aiResult = aiResponse?.data || aiResponse;

    const conversation = await base44.asServiceRole.entities.SupportConversation.create({
      created_at: now,
      updated_at: now,
      status: mapStatusFromAiMode(aiResult.ai_mode),
      source_type: 'public_site',
      source_page: sourcePage || '/',
      visitor_name: name,
      visitor_email: email,
      visitor_phone: mobile || '',
      subject,
      assigned_admin_id: null,
      linked_lead_id: matchedLead?.id || null,
      linked_client_account_id: matchedLead?.client_account_id || null,
      unread_for_admin: true,
      unread_for_client: false,
      last_message_at: now,
      last_message_preview: preview,
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
      sender_type: 'visitor',
      sender_user_id: null,
      sender_name: name,
      sender_email: email,
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
      client_account_id: conversation.linked_client_account_id || null,
      recipient_role: 'admin',
      recipient_email: null,
      channel: 'in_app',
      delivery_status: 'stored',
      provider_name: 'SupportChat',
      provider_message: 'Stored for internal admin review. No external delivery configured yet.',
      title: 'New public support conversation',
      message: `${name} started a new ${aiResult.enquiry_category} conversation from ${sourcePage || '/'}.`,
      triggered_at: now,
      actor_email: email,
      metadata: {
        conversation_id: conversation.id,
        source_page: sourcePage || '/',
        linked_lead_id: conversation.linked_lead_id || null,
        ai_mode: aiResult.ai_mode,
        enquiry_category: aiResult.enquiry_category,
        urgency_level: aiResult.urgency_level,
      },
    });

    if (['human_required', 'escalated'].includes(aiResult.ai_mode)) {
      await base44.asServiceRole.functions.invoke('sendAdminAlert', {
        eventType: 'support_conversation_created',
        entityName: 'SupportConversation',
        entityId: conversation.id,
        clientAccountId: conversation.linked_client_account_id || null,
        title: aiResult.ai_mode === 'escalated' || aiResult.enquiry_category === 'sales' ? 'High-intent chat needs reply' : 'Chat needs human reply',
        message: aiResult.ai_summary || preview,
        actorEmail: email,
        uniqueKey: `chat_handover_create:${conversation.id}:${aiResult.ai_mode}:${now}`,
        priority: ['urgent', 'high'].includes(aiResult.urgency_level) ? 'high' : 'normal',
        smsMessage: aiResult.ai_summary || preview,
        metadata: {
          conversation_id: conversation.id,
          admin_link: `/ActionInbox?view=needs_reply_now&conversationId=${conversation.id}&focusReply=1`,
          full_name: name,
          business_name: matchedLead?.business_name || '',
          email,
          mobile_number: mobile || '',
          enquiry_category: aiResult.enquiry_category,
          urgency_level: aiResult.urgency_level,
          message_preview: preview,
          intent_summary: aiResult.ai_summary || preview,
          wait_label: 'Just now',
          channel_label: 'Chat',
          cta_label: 'Reply Now',
          recommended_action: mobile ? 'Call lead' : 'Reply now',
          source_page: sourcePage || '/',
          ai_mode: aiResult.ai_mode,
          ai_handover_reason: aiResult.ai_handover_reason || null,
          ai_summary: aiResult.ai_summary,
        },
      });
    }

    return Response.json({
      conversation,
      messages: aiMessage ? [firstMessage, aiMessage] : [firstMessage],
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});