import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { userId, clientAccountId } = await req.json();

    if (!userId) {
      return Response.json({ error: 'userId is required' }, { status: 400 });
    }

    const targetUsers = await base44.asServiceRole.entities.User.filter({ id: userId }, '-created_date', 1);
    const targetUser = targetUsers[0];

    if (!targetUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    if (clientAccountId) {
      const clients = await base44.asServiceRole.entities.ClientAccount.filter({ id: clientAccountId }, '-updated_date', 1);
      if (!clients[0]) {
        return Response.json({ error: 'Client account not found' }, { status: 404 });
      }
    }

    const updated = await base44.asServiceRole.entities.User.update(userId, {
      ...targetUser,
      client_account_id: clientAccountId || null,
    });

    return Response.json({ success: true, user: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});