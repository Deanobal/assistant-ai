import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

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
      subject,
      latestMessage: message,
      sourcePage: sourcePage || '/ClientPortal',
      priorMessages: [],
    });
    const aiResult = aiResponse?.data || aiResponse;

    const conversation = await base44.asServiceRole.entities.SupportConversation.create({
      created_at: now,
      updated_at: now,
      status: 'waiting_on_admin',
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
      priority: aiResult.urgency_level === 'urgent' ? 'urgent' : aiResult.urgency_level === 'high' ? 'high' : aiResult.urgency_level === 'low' ? 'low' : 'normal',
      ai_mode: aiResult.ai_mode === 'escalated' ? 'escalated' : 'human_required',
      enquiry_category: aiResult.enquiry_category,
      urgency_level: aiResult.urgency_level,
      ai_summary: aiResult.ai_summary,
      ai_last_response_at: null,
      ai_handover_reason: aiResult.ai_mode === 'escalated'
        ? aiResult.ai_handover_reason || 'Urgent client portal issue detected.'
        : 'Client portal conversations are reviewed by a human team member.',
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
      },
    });

    return Response.json({ conversation, messages: [firstMessage] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});