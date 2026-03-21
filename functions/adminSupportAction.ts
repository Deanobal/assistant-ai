import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const { conversationId, messageBody, isInternalNote = false } = await req.json();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    if (!conversationId || !messageBody) {
      return Response.json({ error: 'conversationId and messageBody are required' }, { status: 400 });
    }

    const conversations = await base44.asServiceRole.entities.SupportConversation.filter({ id: conversationId }, '-updated_at', 1);
    const conversation = conversations[0] || null;

    if (!conversation) {
      return Response.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const supportMessage = await base44.asServiceRole.entities.SupportMessage.create({
      conversation_id: conversation.id,
      sender_type: 'admin',
      sender_user_id: user.id,
      sender_name: user.full_name || user.email || 'AssistantAI Admin',
      sender_email: user.email,
      message_body: messageBody,
      attachment_url: null,
      created_at: now,
      is_internal_note: isInternalNote,
    });

    const updatedConversation = await base44.asServiceRole.entities.SupportConversation.update(conversation.id, {
      ...conversation,
      updated_at: now,
      status: isInternalNote ? conversation.status : 'waiting_on_customer',
      unread_for_admin: false,
      unread_for_client: isInternalNote ? conversation.unread_for_client : true,
      last_message_at: isInternalNote ? conversation.last_message_at : now,
      last_message_preview: isInternalNote ? conversation.last_message_preview : messageBody.slice(0, 180),
    });

    return Response.json({ conversation: updatedConversation, message: supportMessage });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});