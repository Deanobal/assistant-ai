import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email } = await req.json();
    if (!email) return Response.json({ error: 'email is required' }, { status: 400 });

    const leads = await base44.asServiceRole.entities.Lead.filter({ email }, '-updated_date', 5);
    const lead = leads[0] || null;
    const client = lead?.id ? (await base44.asServiceRole.entities.Client.filter({ source_lead_id: lead.id }, '-updated_date', 1))[0] || null : null;
    const billing = client?.id ? await base44.asServiceRole.entities.BillingStatus.filter({ client_id: client.id }, '-updated_date', 10) : [];
    const intake = client?.id ? await base44.asServiceRole.entities.IntakeForm.filter({ client_id: client.id }, '-updated_date', 10) : [];
    const integrations = client?.id ? await base44.asServiceRole.entities.IntegrationStatus.filter({ client_id: client.id }, '-updated_date', 50) : [];
    const notes = client?.id ? await base44.asServiceRole.entities.ClientNote.filter({ client_id: client.id }, '-updated_date', 50) : [];
    const tasks = client?.id ? await base44.asServiceRole.entities.OnboardingTask.filter({ client_id: client.id }, '-updated_date', 100) : [];
    const stripeLogs = await base44.asServiceRole.entities.StripeEventLog.list('-created_date', 20);

    return Response.json({
      lead_id: lead?.id || null,
      client_id: client?.id || null,
      lead_status: lead?.status || null,
      payment_status: lead?.payment_status || null,
      checkout_url: lead?.checkout_url || null,
      checkout_session_id: lead?.checkout_session_id || null,
      lead,
      client,
      counts: {
        billing: billing.length,
        intake: intake.length,
        integrations: integrations.length,
        notes: notes.length,
        tasks: tasks.length,
      },
      billing,
      latest_stripe_logs: stripeLogs.slice(0, 5),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});