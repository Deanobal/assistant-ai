import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PLAN_PRICING = {
  Starter: { setup_fee: 1500, monthly_fee: 497 },
  Growth: { setup_fee: 3000, monthly_fee: 1500 },
  Enterprise: { setup_fee: 7500, monthly_fee: 3000 },
};

const TASK_LIBRARY = [
  { task_name: 'confirm setup payment received', task_phase: 'Payment', plan_scope: 'Starter', required: true },
  { task_name: 'collect business details', task_phase: 'Kickoff', plan_scope: 'Starter', required: true },
  { task_name: 'collect service list and service areas', task_phase: 'Asset Collection', plan_scope: 'Starter', required: true },
  { task_name: 'collect hours, escalation rules, and FAQs', task_phase: 'Asset Collection', plan_scope: 'Starter', required: true },
  { task_name: 'build AI receptionist call flow', task_phase: 'Build', plan_scope: 'Starter', required: true },
  { task_name: 'test lead capture scenarios', task_phase: 'Testing', plan_scope: 'Starter', required: true },
  { task_name: 'client approval and go live', task_phase: 'Go Live', plan_scope: 'Starter', required: true },
  { task_name: 'CRM access received', task_phase: 'Integrations', plan_scope: 'Growth', required: true },
  { task_name: 'calendar booking rules confirmed', task_phase: 'Workflow Mapping', plan_scope: 'Growth', required: true },
  { task_name: 'SMS/email follow-up configured', task_phase: 'Integrations', plan_scope: 'Growth', required: true },
  { task_name: 'portal reporting visibility enabled', task_phase: 'Go Live', plan_scope: 'Growth', required: true },
  { task_name: 'enterprise workflow discovery', task_phase: 'Kickoff', plan_scope: 'Enterprise', required: true },
  { task_name: 'advanced integration scope confirmed', task_phase: 'Integrations', plan_scope: 'Enterprise', required: true },
  { task_name: 'security and routing review completed', task_phase: 'Approval', plan_scope: 'Enterprise', required: true },
];

const PLAN_ORDER = { Starter: 1, Growth: 2, Enterprise: 3 };

function clean(value) {
  return String(value || '').trim();
}

function normalizePlan(value) {
  const plan = clean(value);
  return PLAN_PRICING[plan] ? plan : 'Starter';
}

function tasksForPlan(plan) {
  return TASK_LIBRARY.filter((task) => PLAN_ORDER[task.plan_scope] <= PLAN_ORDER[plan]);
}

function integrationRecords(clientId, plan) {
  const records = [
    { client_id: clientId, integration_type: 'crm', integration_name: 'GoHighLevel', connection_status: plan === 'Starter' ? 'planned' : 'pending', last_sync: null, notes: '' },
    { client_id: clientId, integration_type: 'calendar', integration_name: 'Google Calendar', connection_status: plan === 'Starter' ? 'planned' : 'pending', last_sync: null, notes: '' },
    { client_id: clientId, integration_type: 'sms', integration_name: 'Twilio', connection_status: 'planned', last_sync: null, notes: '' },
    { client_id: clientId, integration_type: 'payments', integration_name: 'Stripe', connection_status: 'connected', last_sync: new Date().toISOString(), notes: 'Payment confirmed by Stripe.' },
  ];
  if (plan === 'Enterprise') records.push({ client_id: clientId, integration_type: 'optional', integration_name: 'Custom enterprise integrations', connection_status: 'planned', last_sync: null, notes: '' });
  return records;
}

async function upsertClient(base44, lead, plan) {
  const existingByLead = await base44.asServiceRole.entities.Client.filter({ source_lead_id: lead.id }, '-updated_date', 1);
  const existingByEmail = !existingByLead[0] && lead.email ? await base44.asServiceRole.entities.Client.filter({ email: lead.email }, '-updated_date', 1) : [];
  const existing = existingByLead[0] || existingByEmail[0] || null;

  const payload = {
    ...(existing || {}),
    full_name: lead.full_name || existing?.full_name || 'Primary Contact',
    business_name: lead.business_name || existing?.business_name || lead.full_name || 'New Client',
    email: lead.email || existing?.email || '',
    mobile_number: lead.mobile_number || existing?.mobile_number || '',
    industry: lead.industry || existing?.industry || 'other',
    website: lead.website || existing?.website || '',
    main_service: lead.service_needed || existing?.main_service || '',
    monthly_enquiry_volume: lead.monthly_enquiry_volume || existing?.monthly_enquiry_volume || '0_20',
    biggest_problem: lead.current_call_handling || lead.conversation_summary || existing?.biggest_problem || '',
    current_missed_call_handling: lead.current_call_handling || existing?.current_missed_call_handling || '',
    ai_first_goal: lead.service_needed || existing?.ai_first_goal || '',
    plan,
    status: 'Onboarding',
    lifecycle_state: 'pre_live',
    progress_percentage: existing?.progress_percentage || 0,
    assigned_owner: lead.assigned_owner || existing?.assigned_owner || '',
    target_go_live_date: existing?.target_go_live_date || null,
    source_lead_id: lead.id,
    last_activity: 'Stripe payment confirmed. Onboarding started automatically.',
    blockers: (existing?.blockers || ['Missing intake details', 'Missing integrations']).filter((item) => item !== 'Unpaid billing'),
    next_action: 'Complete onboarding intake form',
    workflow_phase: 'Kickoff',
    assets_status: existing?.assets_status || 'not_started',
    onboarding_archived: false,
    go_live_ready: false,
    go_live_date: existing?.go_live_date || null,
    shared_files: existing?.shared_files || [],
  };

  return existing ? base44.asServiceRole.entities.Client.update(existing.id, payload) : base44.asServiceRole.entities.Client.create(payload);
}

async function ensureIntakeForm(base44, client, lead) {
  const existing = await base44.asServiceRole.entities.IntakeForm.filter({ client_id: client.id }, '-updated_date', 1);
  if (existing[0]) return existing[0];
  return base44.asServiceRole.entities.IntakeForm.create({
    client_id: client.id,
    business_name: client.business_name,
    contact_name: client.full_name,
    phone: client.mobile_number || lead.mobile_number || '',
    email: client.email,
    website: client.website || '',
    industry: client.industry || 'other',
    service_areas: '',
    crm_used_now: lead.crm_used_now || '',
    calendar_used_now: lead.calendar_used_now || '',
    messaging_sms_tool: lead.wants_sms_followup ? 'SMS follow-up requested' : '',
    payment_billing_method: 'Stripe',
    main_business_phone: '',
    business_hours: '',
    after_hours_rules: '',
    hot_lead_definition: '',
    urgent_job_definition: '',
    escalation_rules: '',
    ai_never_say_rules: '',
    booking_rules: lead.wants_booking ? 'Booking requested during qualification.' : '',
    required_capture_before_handoff: '',
    escalation_contacts: '',
    scripts_assets: '',
    faq_list: '',
    pricing_guidance: '',
    objection_handling: '',
    sensitive_data_limits: '',
    recordings_allowed: false,
    sms_followup_approved: !!lead.wants_sms_followup,
    outbound_calling_approved: false,
    final_approver: '',
    approval_status: 'draft',
    last_updated: new Date().toISOString(),
    is_archived: false,
  });
}

async function ensureBilling(base44, clientId, plan, details) {
  const existing = await base44.asServiceRole.entities.BillingStatus.filter({ client_id: clientId }, '-updated_date', 1);
  const pricing = PLAN_PRICING[plan];
  const billingStatus = details.subscriptionConfigured ? 'active' : 'setup_paid_subscription_pending';
  const payload = {
    ...(existing[0] || {}),
    client_id: clientId,
    plan,
    setup_fee: pricing.setup_fee,
    monthly_fee: pricing.monthly_fee,
    billing_status: billingStatus,
    setup_fee_paid: true,
    subscription_status: details.subscriptionConfigured ? 'active' : 'pending',
    payment_method: details.stripeCustomerId || existing[0]?.payment_method || '',
    invoice_reference: details.checkoutSessionId || existing[0]?.invoice_reference || '',
    renewal_date: details.renewalDate || existing[0]?.renewal_date || null,
    stripe_customer_id: details.stripeCustomerId || existing[0]?.stripe_customer_id || null,
    stripe_subscription_id: details.stripeSubscriptionId || existing[0]?.stripe_subscription_id || null,
    stripe_checkout_session_id: details.checkoutSessionId || existing[0]?.stripe_checkout_session_id || null,
    admin_override: false,
    notes: details.subscriptionConfigured ? 'Stripe payment and subscription confirmed.' : 'Setup fee paid. Subscription setup requires admin follow-up.',
  };
  return existing[0] ? base44.asServiceRole.entities.BillingStatus.update(existing[0].id, payload) : base44.asServiceRole.entities.BillingStatus.create(payload);
}

async function ensureTasks(base44, clientId, plan, assignedOwner) {
  const existing = await base44.asServiceRole.entities.OnboardingTask.filter({ client_id: clientId }, '-updated_date', 300);
  const names = new Set(existing.map((task) => task.task_name));
  const missing = tasksForPlan(plan).filter((task) => !names.has(task.task_name));
  if (!missing.length) return [];
  return base44.asServiceRole.entities.OnboardingTask.bulkCreate(missing.map((task) => ({
    client_id: clientId,
    task_name: task.task_name,
    task_phase: task.task_phase,
    required: task.required,
    completed: task.task_name === 'confirm setup payment received',
    blocked: false,
    plan_scope: task.plan_scope,
    due_date: null,
    assigned_to: assignedOwner || '',
    notes: '',
    is_archived: false,
  })));
}

async function ensureIntegrations(base44, clientId, plan) {
  const existing = await base44.asServiceRole.entities.IntegrationStatus.filter({ client_id: clientId }, '-updated_date', 100);
  const keys = new Set(existing.map((item) => `${item.integration_type}:${item.integration_name}`));
  const missing = integrationRecords(clientId, plan).filter((item) => !keys.has(`${item.integration_type}:${item.integration_name}`));
  if (!missing.length) return [];
  return base44.asServiceRole.entities.IntegrationStatus.bulkCreate(missing);
}

async function notify(base44, client, lead, plan) {
  await base44.asServiceRole.entities.ClientNote.create({
    client_id: client.id,
    note_type: 'onboarding_note',
    content: `Paid AI receptionist buyer converted automatically. Plan: ${plan}. Summary: ${lead.conversation_summary || 'No summary captured.'}`,
    created_by: 'system',
    created_at: new Date().toISOString(),
    is_archived: false,
  });

  await base44.asServiceRole.functions.invoke('sendAdminAlert', {
    event_type: 'lead_marked_won',
    entity_name: 'Client',
    entity_id: client.id,
    title: `Paid signup: ${client.business_name}`,
    message: `${client.business_name} paid for ${plan}. Onboarding records were created automatically.`,
    channels: ['in_app', 'email', 'sms'],
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const leadId = clean(payload.lead_id);
    if (!leadId) return Response.json({ error: 'lead_id is required' }, { status: 400 });

    const leads = await base44.asServiceRole.entities.Lead.filter({ id: leadId }, '-updated_date', 1);
    const lead = leads[0];
    if (!lead) return Response.json({ error: 'Lead not found' }, { status: 404 });

    const plan = normalizePlan(payload.plan || lead.selected_plan || lead.likely_plan_fit);
    const client = await upsertClient(base44, lead, plan);

    await ensureIntakeForm(base44, client, lead);
    await ensureBilling(base44, client.id, plan, {
      stripeCustomerId: clean(payload.stripe_customer_id),
      stripeSubscriptionId: clean(payload.stripe_subscription_id),
      checkoutSessionId: clean(payload.checkout_session_id || lead.checkout_session_id),
      renewalDate: payload.renewal_date || null,
      subscriptionConfigured: payload.subscription_configured !== false,
    });
    await ensureTasks(base44, client.id, plan, client.assigned_owner || '');
    await ensureIntegrations(base44, client.id, plan);

    const now = new Date().toISOString();
    await base44.asServiceRole.entities.Lead.update(lead.id, {
      ...lead,
      status: 'Won',
      payment_status: 'paid',
      selected_plan: plan,
      checkout_session_id: clean(payload.checkout_session_id || lead.checkout_session_id),
      stripe_customer_id: clean(payload.stripe_customer_id) || lead.stripe_customer_id || null,
      stripe_subscription_id: clean(payload.stripe_subscription_id) || lead.stripe_subscription_id || null,
      payment_confirmed_at: now,
      client_account_id: client.id,
      last_activity_at: now,
      next_action: 'Complete onboarding intake form',
      notes: [lead.notes, `[${now}] Stripe payment confirmed. Client onboarding started automatically.`].filter(Boolean).join('\n\n'),
    });

    try {
      await notify(base44, client, lead, plan);
    } catch {
      // Onboarding must not be blocked by notification delivery.
    }

    try {
      await base44.asServiceRole.functions.invoke('syncGoHighLevelContact', { lead_id: lead.id, client_id: client.id, event_type: 'paid_signup' });
    } catch {
      // GoHighLevel sync is optional and should not block onboarding.
    }

    return Response.json({ success: true, client_id: client.id, lead_id: lead.id, plan });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});