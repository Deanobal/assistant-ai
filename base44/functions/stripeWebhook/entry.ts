import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@18.4.0';

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY'), {
  apiVersion: '2025-02-24.acacia',
});

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
  { task_name: '30-day executive review booked', task_phase: 'Optimisation', plan_scope: 'Enterprise', required: true }
];

const PLAN_ORDER = { Starter: 1, Growth: 2, Enterprise: 3 };

function getTasksForPlan(plan) {
  return TASK_LIBRARY.filter((task) => PLAN_ORDER[task.plan_scope] <= PLAN_ORDER[plan]);
}

function getDefaultIntegrationRecords(clientId, plan) {
  const base = [
    { client_id: clientId, integration_type: 'CRM', integration_name: 'GoHighLevel', connection_status: 'planned', last_sync: null, notes: '' },
    { client_id: clientId, integration_type: 'Calendar', integration_name: 'Google Calendar', connection_status: 'planned', last_sync: null, notes: '' },
    { client_id: clientId, integration_type: 'SMS', integration_name: 'Twilio', connection_status: 'planned', last_sync: null, notes: '' },
    { client_id: clientId, integration_type: 'Payments', integration_name: 'Stripe', connection_status: 'connected', last_sync: new Date().toISOString(), notes: 'Managed by Stripe billing flow.' },
  ];
  if (plan !== 'Starter') base.push({ client_id: clientId, integration_type: 'Optional', integration_name: 'Zapier', connection_status: 'planned', last_sync: null, notes: '' });
  if (plan === 'Enterprise') base.push({ client_id: clientId, integration_type: 'Optional', integration_name: 'Slack', connection_status: 'planned', last_sync: null, notes: '' });
  return base;
}

function mapSubscriptionStatus(status) {
  if (status === 'active' || status === 'trialing') return 'active';
  if (status === 'past_due' || status === 'unpaid') return 'past_due';
  if (status === 'canceled' || status === 'incomplete_expired') return 'cancelled';
  return 'awaiting_payment';
}

function formatDate(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(body, signature, Deno.env.get('STRIPE_WEBHOOK_SECRET'));

    const getLeadFromMetadata = async (metadata, customerEmail) => {
      if (metadata?.leadId) {
        const byId = await base44.asServiceRole.entities.Lead.filter({ id: metadata.leadId }, '-updated_date', 1);
        if (byId[0]) return byId[0];
      }
      if (customerEmail) {
        const byEmail = await base44.asServiceRole.entities.Lead.filter({ email: customerEmail }, '-updated_date', 1);
        if (byEmail[0]) return byEmail[0];
      }
      return null;
    };

    const getBillingBySessionOrCustomer = async ({ sessionId, customerId }) => {
      const bySession = sessionId ? await base44.asServiceRole.entities.BillingStatus.filter({ stripe_checkout_session_id: sessionId }, '-updated_date', 1) : [];
      const byCustomer = customerId ? await base44.asServiceRole.entities.BillingStatus.filter({ stripe_customer_id: customerId }, '-updated_date', 1) : [];
      return bySession[0] || byCustomer[0] || null;
    };

    const createClientBundleFromLead = async ({ lead, customerId, subscriptionId, sessionId, renewalDate }) => {
      const plan = lead.plan === 'Growth' || lead.plan === 'Enterprise' ? lead.plan : 'Starter';
      const existingClient = await base44.asServiceRole.entities.Client.filter({ source_lead_id: lead.id }, '-updated_date', 1);
      if (existingClient[0]) {
        return existingClient[0];
      }

      const pricing = PLAN_PRICING[plan];
      const client = await base44.asServiceRole.entities.Client.create({
        full_name: lead.full_name || 'Primary Contact',
        business_name: lead.business_name || lead.full_name || 'New Client',
        email: lead.email || '',
        mobile_number: lead.mobile_number || '',
        industry: lead.industry || 'other',
        website: lead.website || '',
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
        last_activity: 'Stripe payment confirmed',
        blockers: ['Missing intake details', 'Missing integrations'],
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
        website: client.website || '',
        industry: client.industry,
        service_areas: '',
        crm_used_now: '',
        calendar_used_now: '',
        messaging_sms_tool: '',
        payment_billing_method: 'Stripe',
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
        last_updated: new Date().toISOString(),
        is_archived: false,
      });

      await base44.asServiceRole.entities.BillingStatus.create({
        client_id: client.id,
        plan,
        setup_fee: pricing.setup_fee,
        monthly_fee: pricing.monthly_fee,
        billing_status: 'active',
        payment_method: customerId || '',
        invoice_reference: sessionId || '',
        renewal_date: renewalDate,
        stripe_customer_id: customerId || null,
        stripe_subscription_id: subscriptionId || null,
        stripe_checkout_session_id: sessionId || null,
        admin_override: false,
        notes: 'Stripe payment confirmed and billing activated.',
      });

      await base44.asServiceRole.entities.IntegrationStatus.bulkCreate(getDefaultIntegrationRecords(client.id, plan));

      await base44.asServiceRole.entities.ClientNote.create({
        client_id: client.id,
        note_type: 'onboarding_note',
        content: 'Client created from successful Stripe payment and linked to onboarding.',
        created_by: 'system',
        created_at: new Date().toISOString(),
        is_archived: false,
      });

      await base44.asServiceRole.entities.Lead.update(lead.id, {
        ...lead,
        status: 'Onboarding',
        client_account_id: client.id,
        last_activity_at: new Date().toISOString(),
        next_action: 'Complete onboarding intake form',
      });

      return client;
    };

    const updateClientBillingState = async (clientId, billingStatus, subscriptionId, customerId, planName) => {
      const clientMatches = await base44.asServiceRole.entities.Client.filter({ id: clientId }, '-updated_date', 1);
      const client = clientMatches[0] || null;
      if (!client) return;
      await base44.asServiceRole.entities.Client.update(client.id, {
        ...client,
        plan: planName || client.plan,
        last_activity: `Stripe billing updated: ${billingStatus}`,
        blockers: billingStatus === 'active' ? (client.blockers || []).filter((item) => item !== 'Unpaid billing') : Array.from(new Set([...(client.blockers || []), 'Unpaid billing'])),
      });

      const noteMatches = await base44.asServiceRole.entities.ClientNote.filter({ client_id: client.id }, '-updated_date', 1);
      if (!noteMatches[0] || noteMatches[0].content !== `Stripe billing updated: ${billingStatus}`) {
        await base44.asServiceRole.entities.ClientNote.create({
          client_id: client.id,
          note_type: 'onboarding_note',
          content: `Stripe billing updated: ${billingStatus}`,
          created_by: 'system',
          created_at: new Date().toISOString(),
          is_archived: false,
        });
      }
    };

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id || null;
      const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id || null;
      const subscription = subscriptionId ? await stripe.subscriptions.retrieve(subscriptionId) : null;
      const renewalDate = formatDate(subscription?.current_period_end ? subscription.current_period_end * 1000 : null);
      const email = session.customer_details?.email || session.customer_email || '';
      const lead = await getLeadFromMetadata(session.metadata, email);
      if (!lead) {
        return Response.json({ received: true, ignored: true, reason: 'Lead not found' });
      }

      const client = await createClientBundleFromLead({
        lead,
        customerId,
        subscriptionId,
        sessionId: session.id,
        renewalDate,
      });

      await updateClientBillingState(client.id, 'active', subscriptionId, customerId, lead.plan);
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted' || event.type === 'invoice.payment_failed' || event.type === 'invoice.paid') {
      const object = event.data.object;
      const customerId = typeof object.customer === 'string' ? object.customer : object.customer?.id || null;
      const sessionId = object.checkout_session || null;
      const billing = await getBillingBySessionOrCustomer({ sessionId, customerId });
      if (billing) {
        const mappedStatus = event.type === 'invoice.payment_failed'
          ? 'past_due'
          : event.type === 'invoice.paid'
            ? 'active'
            : mapSubscriptionStatus(object.status);

        await base44.asServiceRole.entities.BillingStatus.update(billing.id, {
          ...billing,
          billing_status: mappedStatus,
          stripe_customer_id: customerId || billing.stripe_customer_id,
          stripe_subscription_id: object.id?.startsWith?.('sub_') ? object.id : billing.stripe_subscription_id,
          renewal_date: formatDate(object.current_period_end ? object.current_period_end * 1000 : billing.renewal_date),
          notes: `Stripe webhook received: ${event.type}`,
        });

        await updateClientBillingState(billing.client_id, mappedStatus, billing.stripe_subscription_id, customerId, billing.plan);
      }
    }

    return Response.json({ received: true, event_type: event.type });
  } catch (error) {
    console.error('Stripe webhook failed', error);
    return Response.json({ error: error.message }, { status: 400 });
  }
});