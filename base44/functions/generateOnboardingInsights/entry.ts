import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { clientId } = await req.json();
    if (!clientId) {
      return Response.json({ error: 'clientId is required' }, { status: 400 });
    }

    const [client] = await base44.asServiceRole.entities.Client.filter({ id: clientId }, '-updated_date', 1);
    const [intake] = await base44.asServiceRole.entities.IntakeForm.filter({ client_id: clientId }, '-updated_date', 1);
    const tasks = await base44.asServiceRole.entities.OnboardingTask.filter({ client_id: clientId }, '-updated_date', 200);
    const integrations = await base44.asServiceRole.entities.IntegrationStatus.filter({ client_id: clientId }, '-updated_date', 100);
    const [billing] = await base44.asServiceRole.entities.BillingStatus.filter({ client_id: clientId }, '-updated_date', 1);

    if (!client || !intake) {
      return Response.json({ error: 'Client or intake not found' }, { status: 404 });
    }

    const prompt = `You are reviewing an AI receptionist onboarding setup for AssistantAI.
Return practical advice only.

Client:\n${JSON.stringify(client, null, 2)}

Intake:\n${JSON.stringify(intake, null, 2)}

Tasks:\n${JSON.stringify(tasks, null, 2)}

Integrations:\n${JSON.stringify(integrations, null, 2)}

Billing:\n${JSON.stringify(billing || null, null, 2)}

Give:
1. workflow_improvements: short concrete process improvements
2. next_actions: immediate actions in priority order
3. weak_setups: missing, risky, unclear, or weak parts of the current setup
Keep each item short and specific.`;

    const insights = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          workflow_improvements: { type: 'array', items: { type: 'string' } },
          next_actions: { type: 'array', items: { type: 'string' } },
          weak_setups: { type: 'array', items: { type: 'string' } }
        },
        required: ['workflow_improvements', 'next_actions', 'weak_setups']
      }
    });

    return Response.json({ success: true, insights });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});