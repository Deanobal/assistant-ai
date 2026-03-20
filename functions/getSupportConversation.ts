import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { conversationId, email } = await req.json();

    if (!conversationId || !email) {
      return Response.json({ error: 'conversationId and email are required' }, { status: 400 });
    }

    const conversations = await base44.asServiceRole.entities.SupportConversation.filter({ id: conversationId }, '-updated_date', 1);
    const conversation = conversations[0] || null;

    if (!conversation) {
      return Response.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if ((conversation.visitor_email || '').toLowerCase() !== String(email).toLowerCase()) {
      return Response.json({ error: 'Conversation access denied' }, { status: 403 });
    }

    const messages = await base44.asServiceRole.entities.SupportMessage.filter({ conversation_id: conversationId }, 'created_at', 200);

    return Response.json({ conversation, messages });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});