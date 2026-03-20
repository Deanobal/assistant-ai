import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const { conversationId, message, sourcePage } = await req.json();

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

    const nextStatus = ['resolved', 'closed'].includes(conversation.status) ? 'open' : 'waiting_on_admin';
    await base44.asServiceRole.entities.SupportConversation.update(conversation.id, {
      ...conversation,
      updated_at: now,
      status: nextStatus,
      source_page: sourcePage || conversation.source_page,
      unread_for_admin: true,
      unread_for_client: false,
      last_message_at: now,
      last_message_preview: message.slice(0, 180),
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
      },
    });

    return Response.json({ message: reply });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});