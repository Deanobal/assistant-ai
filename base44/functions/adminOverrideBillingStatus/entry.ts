import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { clientId, billingStatus } = await req.json();
    if (!clientId || !billingStatus) {
      return Response.json({ error: 'clientId and billingStatus are required' }, { status: 400 });
    }

    const client = await base44.asServiceRole.entities.Client.get(clientId);
    const billingMatches = await base44.asServiceRole.entities.BillingStatus.filter({ client_id: clientId }, '-updated_date', 1);
    const billing = billingMatches[0] || null;
    if (!billing) {
      return Response.json({ error: 'Billing record not found' }, { status: 404 });
    }

    await base44.asServiceRole.entities.BillingStatus.update(billing.id, {
      ...billing,
      billing_status: billingStatus,
      admin_override: true,
      notes: `Admin override applied: ${billingStatus}`,
    });

    await base44.asServiceRole.entities.Client.update(client.id, {
      ...client,
      last_activity: `Billing manually set to ${billingStatus}`,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});