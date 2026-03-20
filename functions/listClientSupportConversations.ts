import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.client_account_id) {
      return Response.json({ error: 'Client account not linked' }, { status: 403 });
    }

    const conversations = await base44.asServiceRole.entities.SupportConversation.filter(
      { linked_client_account_id: user.client_account_id },
      '-updated_at',
      200,
    );

    return Response.json({ conversations });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});