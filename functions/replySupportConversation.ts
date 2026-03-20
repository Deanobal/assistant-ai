import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { conversationId, email, name, message, sourcePage } = await req.json();

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

    return Response.json({ message: reply });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});