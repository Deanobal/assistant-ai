import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ALLOWED_STATUSES = new Set(['Contacted', 'Won']);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leadId, status } = await req.json();

    if (!leadId || !ALLOWED_STATUSES.has(status)) {
      return Response.json({ error: 'Invalid lead update' }, { status: 400 });
    }

    if (!user.client_account_id) {
      return Response.json({ error: 'Client account not linked' }, { status: 403 });
    }

    const matches = await base44.asServiceRole.entities.Lead.filter({ id: leadId, client_account_id: user.client_account_id }, '-created_date', 1);
    const lead = matches[0];

    if (!lead) {
      return Response.json({ error: 'Lead not found' }, { status: 404 });
    }

    const updated = await base44.asServiceRole.entities.Lead.update(lead.id, {
      ...lead,
      status,
      last_activity_at: new Date().toISOString(),
      next_action: status === 'Won' ? 'Converted by client portal' : 'In progress via client portal',
    });

    return Response.json({ lead: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});