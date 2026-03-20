import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const { conversationId } = await req.json();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.client_account_id) {
      return Response.json({ error: 'Client account not linked' }, { status: 403 });
    }

    if (!conversationId) {
      return Response.json({ error: 'conversationId is required' }, { status: 400 });
    }

    const conversations = await base44.asServiceRole.entities.SupportConversation.filter({ id: conversationId }, '-updated_at', 1);
    const conversation = conversations[0] || null;

    if (!conversation) {
      return Response.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conversation.linked_client_account_id !== user.client_account_id) {
      return Response.json({ error: 'Conversation access denied' }, { status: 403 });
    }

    const messages = await base44.asServiceRole.entities.SupportMessage.filter({ conversation_id: conversationId }, 'created_at', 200);

    if (conversation.unread_for_client) {
      await base44.asServiceRole.entities.SupportConversation.update(conversation.id, {
        ...conversation,
        unread_for_client: false,
      });
    }

    return Response.json({
      conversation: {
        ...conversation,
        unread_for_client: false,
      },
      messages: messages.filter((message) => !message.is_internal_note),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});