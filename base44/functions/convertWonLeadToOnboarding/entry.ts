import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PLAN_PRICING = {
  Starter: { setup_fee: 1500, monthly_fee: 497 },
  Growth: { setup_fee: 3000, monthly_fee: 1500 },
  Enterprise: { setup_fee: 7500, monthly_fee: 3000 },
};

const TASK_LIBRARY = [
  { task_name: 'confirm signed approval', task_phase: 'Lead / Qualification', plan_scope: 'Starter', required: true },
  { task_name: 'confirm setup payment received', task_phase: 'Payment', plan_scope: 'Starter', required: true },
  { task_name: 'collect business description', task_phase: 'Kickoff', plan_scope: 'Starter', required: true },
  { task_name: 'collect services list', task_phase: 'Kickoff', plan_scope: 'Starter', required: true },
  { task_name: 'collect service areas', task_phase: 'Asset Collection', plan_scope: 'Starter', required: true },
  { task_name: 'collect hours', task_phase: 'Asset Collection', plan_scope: 'Starter', required: true },
  { task_name: 'collect emergency rules', task_phase: 'Asset Collection', plan_scope: 'Starter', required: true },
  { task_name: 'collect FAQ list', task_phase: 'Asset Collection', plan_scope: 'Starter', required: true },
  { task_name: 'collect pricing guidance', task_phase: 'Asset Collection', plan_scope: 'Starter', required: true },
  { task_name: 'collect escalation contact', task_phase: 'Asset Collection', plan_scope: 'Starter', required: true },
  { task_name: 'choose channel', task_phase: 'Workflow Mapping', plan_scope: 'Starter', required: true },
  { task_name: 'build basic agent', task_phase: 'Build', plan_scope: 'Starter', required: true },
  { task_name: 'test real scenarios', task_phase: 'Testing', plan_scope: 'Starter', required: true },
  { task_name: 'client approval', task_phase: 'Approval', plan_scope: 'Starter', required: true },
  { task_name: 'go live', task_phase: 'Go Live', plan_scope: 'Starter', required: true },
  { task_name: '7-day review', task_phase: 'Optimisation', plan_scope: 'Starter', required: true },
  { task_name: 'CRM access received', task_phase: 'Integrations', plan_scope: 'Growth', required: true },
  { task_name: 'calendar access received', task_phase: 'Integrations', plan_scope: 'Growth', required: true },
  { task_name: 'SMS platform access received', task_phase: 'Integrations', plan_scope: 'Growth', required: true },
  { task_name: 'email automation requirements confirmed', task_phase: 'Workflow Mapping', plan_scope: 'Growth', required: true },
  { task_name: 'workflow mapping completed', task_phase: 'Workflow Mapping', plan_scope: 'Growth', required: true },
  { task_name: 'CRM sync configured', task_phase: 'Integrations', plan_scope: 'Growth', required: true },
  { task_name: 'calendar logic configured', task_phase: 'Integrations', plan_scope: 'Growth', required: true },
  { task_name: 'SMS follow-up configured', task_phase: 'Integrations', plan_scope: 'Growth', required: true },
  { task_name: 'analytics categories configured', task_phase: 'Build', plan_scope: 'Growth', required: false },
  { task_name: 'portal visibility enabled', task_phase: 'Go Live', plan_scope: 'Growth', required: true },
  { task_name: '14-day optimisation review', task_phase: 'Optimisation', plan_scope: 'Growth', required: true },
  { task_name: 'technical discovery complete', task_phase: 'Kickoff', plan_scope: 'Enterprise', required: true },
  { task_name: 'deployment model decided', task_phase: 'Kickoff', plan_scope: 'Enterprise', required: true },
  { task_name: 'workspace/access model defined', task_phase: 'Kickoff', plan_scope: 'Enterprise', required: true },
  { task_name: 'workflow modules approved', task_phase: 'Workflow Mapping', plan_scope: 'Enterprise', required: true },
  { task_name: 'custom integration scope confirmed', task_phase: 'Integrations', plan_scope: 'Enterprise', required: true },
  { task_name: 'webhook requirements confirmed', task_phase: 'Integrations', plan_scope: 'Enterprise', required: true },
  { task_name: 'monitoring rules defined', task_phase: 'Testing', plan_scope: 'Enterprise', required: true },
  { task_name: 'staged rollout approved', task_phase: 'Approval', plan_scope: 'Enterprise', required: true },
  { task_name: 'security/compliance review complete', task_phase: 'Approval', plan_scope: 'Enterprise', required: true },
  { task_name: 'executive go-live pack delivered', task_phase: 'Go Live', plan_scope: 'Enterprise', required: true },
  { task_name: '30-day executive review booked', task_phase: 'Optimisation', plan_scope: 'Enterprise', required: true },
];

const PLAN_ORDER = { Starter: 1, Growth: 2, Enterprise: 3 };

function getTasksForPlan(plan) {
  return TASK_LIBRARY.filter((task) => PLAN_ORDER[task.plan_scope] <= PLAN_ORDER[plan]);
}

function getDefaultIntegrationRecords(clientId, plan) {
  const base = [
    { client_id: clientId, integration_type: 'crm', integration_name: 'GoHighLevel', connection_status: 'planned', last_sync: null, notes: '' },
    { client_id: clientId, integration_type: 'calendar', integration_name: 'Google Calendar', connection_status: 'planned', last_sync: null, notes: '' },
    { client_id: clientId, integration_type: 'sms', integration_name: 'Twilio', connection_status: 'planned', last_sync: null, notes: '' },
    { client_id: clientId, integration_type: 'payments', integration_name: 'Stripe', connection_status: 'planned', last_sync: null, notes: '' },
  ];
  if (plan !== 'Starter') base.push({ client_id: clientId, integration_type: 'optional', integration_name: 'Zapier', connection_status: 'planned', last_sync: null, notes: '' });
  if (plan === 'Enterprise') base.push({ client_id: clientId, integration_type: 'optional', integration_name: 'Slack', connection_status: 'planned', last_sync: null, notes: '' });
  return base;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const lead = payload?.data;
    const oldLead = payload?.old_data;

    if (payload?.event?.entity_name !== 'Lead') {
      return Response.json({ ignored: true, reason: 'Not a Lead event' });
    }

    if (!lead || lead.status !== 'Won') {
      return Response.json({ ignored: true, reason: 'Lead is not in Won status' });
    }

    if (oldLead?.status === 'Won' || oldLead?.status === 'Onboarding') {
      return Response.json({ ignored: true, reason: 'Lead was already processed' });
    }

    const existingClientByLead = await base44.asServiceRole.entities.Client.filter({ source_lead_id: lead.id }, '-updated_date', 1);
    const existingClientByEmail = lead.email
      ? await base44.asServiceRole.entities.Client.filter({ email: lead.email }, '-updated_date', 1)
      : [];
    const existingClient = existingClientByLead[0] || existingClientByEmail[0] || null;

    if (existingClient) {
      await base44.asServiceRole.entities.Lead.update(lead.id, {
        ...lead,
        status: 'Onboarding',
        client_account_id: existingClient.id,
        client_account_id_legacy: existingClient.id,
        client_record_id: existingClient.id,
        last_activity_at: new Date().toISOString(),
      });
      return Response.json({ success: true, client_id: existingClient.id, reused: true });
    }

    const now = new Date().toISOString();
    const plan = 'Starter';

    const client = await base44.asServiceRole.entities.Client.create({
      full_name: lead.full_name || 'Primary Contact',
      business_name: lead.business_name || lead.full_name || 'New Client',
      email: lead.email || '',
      mobile_number: lead.mobile_number || '',
      industry: lead.industry || 'other',
      website: '',
      main_service: '',
      monthly_enquiry_volume: lead.monthly_enquiry_volume || '0_20',
      biggest_problem: lead.message || '',
      current_missed_call_handling: '',
      ai_first_goal: '',
      plan,
      status: 'Onboarding',
      lifecycle_state: 'pre_live',
      progress_percentage: 0,
      assigned_owner: lead.assigned_owner || '',
      target_go_live_date: null,
      source_lead_id: lead.id,
      last_activity: 'Converted from won lead',
      blockers: ['Missing intake details', 'Unpaid billing', 'Missing integrations'],
      next_action: 'Complete: confirm signed approval',
      workflow_phase: 'Lead / Qualification',
      assets_status: 'not_started',
      onboarding_archived: false,
      go_live_ready: false,
      go_live_date: null,
      shared_files: [],
    });

    await base44.asServiceRole.entities.OnboardingTask.bulkCreate(getTasksForPlan(plan).map((task) => ({
      client_id: client.id,
      task_name: task.task_name,
      task_phase: task.task_phase,
      required: task.required,
      completed: false,
      blocked: false,
      plan_scope: task.plan_scope,
      due_date: null,
      assigned_to: client.assigned_owner || '',
      notes: '',
      is_archived: false,
    })));

    await base44.asServiceRole.entities.IntakeForm.create({
      client_id: client.id,
      business_name: client.business_name,
      contact_name: client.full_name,
      phone: client.mobile_number,
      email: client.email,
      website: '',
      industry: client.industry,
      service_areas: '',
      crm_used_now: '',
      calendar_used_now: '',
      messaging_sms_tool: '',
      payment_billing_method: '',
      main_business_phone: '',
      business_hours: '',
      after_hours_rules: '',
      hot_lead_definition: '',
      urgent_job_definition: '',
      escalation_rules: '',
      ai_never_say_rules: '',
      booking_rules: '',
      required_capture_before_handoff: '',
      escalation_contacts: '',
      scripts_assets: '',
      faq_list: '',
      pricing_guidance: '',
      objection_handling: '',
      sensitive_data_limits: '',
      recordings_allowed: false,
      sms_followup_approved: false,
      outbound_calling_approved: false,
      final_approver: '',
      approval_status: 'draft',
      last_updated: now,
      is_archived: false,
    });

    await base44.asServiceRole.entities.BillingStatus.create({
      client_id: client.id,
      plan,
      setup_fee: PLAN_PRICING[plan].setup_fee,
      monthly_fee: PLAN_PRICING[plan].monthly_fee,
      billing_status: 'awaiting_payment',
      payment_method: '',
      invoice_reference: '',
      renewal_date: null,
      notes: '',
    });

    await base44.asServiceRole.entities.IntegrationStatus.bulkCreate(getDefaultIntegrationRecords(client.id, plan));

    await base44.asServiceRole.entities.ClientNote.create({
      client_id: client.id,
      note_type: 'onboarding_note',
      content: 'Lead converted to onboarding and linked to client.',
      created_by: 'system',
      created_at: now,
      is_archived: false,
    });

    const conversionNote = `[${now}] Lead converted to onboarding and linked to client ${client.business_name || client.id}.`;
    const nextNotes = lead.notes ? `${lead.notes}\n\n${conversionNote}` : conversionNote;

    await base44.asServiceRole.entities.Lead.update(lead.id, {
      ...lead,
      status: 'Onboarding',
      client_account_id: client.id,
      client_account_id_legacy: client.id,
      client_record_id: client.id,
      last_activity_at: now,
      next_action: 'Send onboarding intake form',
      notes: nextNotes,
    });

    return Response.json({ success: true, client_id: client.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});