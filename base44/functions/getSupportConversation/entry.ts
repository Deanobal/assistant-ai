import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { conversationId, email, runtimeDataEnv } = await req.json();

    if (runtimeDataEnv === 'dev') {
      return Response.json({ error: 'Support messaging is disabled in preview test mode so test actions do not read production support data.' }, { status: 409 });
    }

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

    return Response.json({
      conversation,
      messages: messages.filter((message) => !message.is_internal_note),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});