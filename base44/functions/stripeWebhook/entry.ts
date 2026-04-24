import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@18.4.0';

const stripe = new Stripe(Deno.env.get('STRIPE_TEST_SECRET_KEY') || Deno.env.get('STRIPE_API_KEY'), {
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
    { client_id: clientId, integration_type: 'crm', integration_name: 'GoHighLevel', connection_status: 'planned', last_sync: null, notes: '' },
    { client_id: clientId, integration_type: 'calendar', integration_name: 'Google Calendar', connection_status: 'planned', last_sync: null, notes: '' },
    { client_id: clientId, integration_type: 'sms', integration_name: 'Twilio', connection_status: 'planned', last_sync: null, notes: '' },
    { client_id: clientId, integration_type: 'payments', integration_name: 'Stripe', connection_status: 'connected', last_sync: new Date().toISOString(), notes: 'Managed by Stripe billing flow.' },
  ];
  if (plan !== 'Starter') base.push({ client_id: clientId, integration_type: 'optional', integration_name: 'Zapier', connection_status: 'planned', last_sync: null, notes: '' });
  if (plan === 'Enterprise') base.push({ client_id: clientId, integration_type: 'optional', integration_name: 'Slack', connection_status: 'planned', last_sync: null, notes: '' });
  return base;
}

function mapSubscriptionStatus(status) {
  if (status === 'active' || status === 'trialing') return 'active';
  if (status === 'past_due' || status === 'unpaid') return 'payment_failed';
  if (status === 'canceled' || status === 'incomplete_expired') return 'cancelled';
  return 'awaiting_payment';
}

function toDateOnlyFromUnix(seconds) {
  if (!seconds) return null;
  return new Date(seconds * 1000).toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let logRecord = null;

  try {
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_TEST_WEBHOOK_SECRET') || Deno.env.get('STRIPE_WEBHOOK_SECRET')
    );

    console.log('stripeWebhook incoming event', {
      eventType: event.type,
      objectId: event.data?.object?.id || null,
      customer: event.data?.object?.customer || null,
      subscription: event.data?.object?.subscription || null,
      metadata: event.data?.object?.metadata || null,
    });

    const existingLog = await base44.asServiceRole.entities.StripeEventLog.filter({ stripe_event_id: event.id }, '-updated_date', 1);
    if (existingLog[0]) {
      await base44.asServiceRole.entities.StripeEventLog.update(existingLog[0].id, {
        ...existingLog[0],
        status: 'skipped',
        processed_at: new Date().toISOString(),
        error_message: 'Duplicate Stripe event skipped',
      });
      return Response.json({ received: true, skipped: true, event_type: event.type });
    }

    logRecord = await base44.asServiceRole.entities.StripeEventLog.create({
      stripe_event_id: event.id,
      event_type: event.type,
      processed_at: null,
      status: 'processing',
      related_client_id: null,
      error_message: null,
    });

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

    const getClientByMetadata = async (clientId) => {
      if (!clientId) return null;
      const byId = await base44.asServiceRole.entities.Client.filter({ id: clientId }, '-updated_date', 1);
      return byId[0] || null;
    };

    const getClientByIdentity = async ({ sourceLeadId, stripeCustomerId, stripeSubscriptionId, email, phone }) => {
      if (sourceLeadId) {
        const byLead = await base44.asServiceRole.entities.Client.filter({ source_lead_id: sourceLeadId }, '-updated_date', 1);
        if (byLead[0]) return byLead[0];
      }

      if (stripeCustomerId || stripeSubscriptionId) {
        const billingMatches = await base44.asServiceRole.entities.BillingStatus.list('-updated_date', 200);
        const linkedBilling = billingMatches.find((item) => item.stripe_customer_id === stripeCustomerId || item.stripe_subscription_id === stripeSubscriptionId);
        if (linkedBilling?.client_id) {
          const byBillingClient = await base44.asServiceRole.entities.Client.filter({ id: linkedBilling.client_id }, '-updated_date', 1);
          if (byBillingClient[0]) return byBillingClient[0];
        }
      }

      if (email) {
        const byEmail = await base44.asServiceRole.entities.Client.filter({ email }, '-updated_date', 1);
        if (byEmail[0] && (!phone || byEmail[0].mobile_number === phone)) return byEmail[0];
      }

      return null;
    };

    const ensureTasks = async (clientId, plan, assignedOwner) => {
      const existingTasks = await base44.asServiceRole.entities.OnboardingTask.filter({ client_id: clientId }, '-updated_date', 500);
      const existingNames = new Set(existingTasks.map((task) => task.task_name));
      const missingTasks = getTasksForPlan(plan).filter((task) => !existingNames.has(task.task_name));
      if (missingTasks.length) {
        await base44.asServiceRole.entities.OnboardingTask.bulkCreate(missingTasks.map((task) => ({
          client_id: clientId,
          task_name: task.task_name,
          task_phase: task.task_phase,
          required: task.required,
          completed: false,
          blocked: false,
          plan_scope: task.plan_scope,
          due_date: null,
          assigned_to: assignedOwner || '',
          notes: '',
          is_archived: false,
        })));
      }
    };

    const ensureIntakeForm = async (client) => {
      const existing = await base44.asServiceRole.entities.IntakeForm.filter({ client_id: client.id }, '-updated_date', 1);
      if (existing[0]) return existing[0];
      return base44.asServiceRole.entities.IntakeForm.create({
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
    };

    const ensureIntegrations = async (clientId, plan) => {
      const existing = await base44.asServiceRole.entities.IntegrationStatus.filter({ client_id: clientId }, '-updated_date', 100);
      const keys = new Set(existing.map((item) => `${item.integration_type}:${item.integration_name}`));
      const missing = getDefaultIntegrationRecords(clientId, plan).filter((item) => !keys.has(`${item.integration_type}:${item.integration_name}`));
      if (missing.length) {
        await base44.asServiceRole.entities.IntegrationStatus.bulkCreate(missing);
      }
    };

    const ensureClientNote = async (clientId, content) => {
      const existing = await base44.asServiceRole.entities.ClientNote.filter({ client_id: clientId }, '-updated_date', 50);
      const match = existing.find((note) => note.content === content);
      if (match) return match;
      return base44.asServiceRole.entities.ClientNote.create({
        client_id: clientId,
        note_type: 'onboarding_note',
        content,
        created_by: 'system',
        created_at: new Date().toISOString(),
        is_archived: false,
      });
    };

    const ensureBillingStatus = async ({ clientId, plan, stripeCustomerId, stripeSubscriptionId, stripeCheckoutSessionId, invoiceReference, renewalDate, billingStatus, notes, adminOverride = false }) => {
      const existing = await base44.asServiceRole.entities.BillingStatus.filter({ client_id: clientId }, '-updated_date', 1);
      const pricing = PLAN_PRICING[plan] || PLAN_PRICING.Starter;
      const payload = {
        client_id: clientId,
        plan,
        setup_fee: pricing.setup_fee,
        monthly_fee: pricing.monthly_fee,
        billing_status: billingStatus,
        payment_method: stripeCustomerId || existing[0]?.payment_method || '',
        invoice_reference: invoiceReference || existing[0]?.invoice_reference || '',
        renewal_date: renewalDate || existing[0]?.renewal_date || null,
        stripe_customer_id: stripeCustomerId || existing[0]?.stripe_customer_id || null,
        stripe_subscription_id: stripeSubscriptionId || existing[0]?.stripe_subscription_id || null,
        stripe_checkout_session_id: stripeCheckoutSessionId || existing[0]?.stripe_checkout_session_id || null,
        admin_override: adminOverride,
        notes,
      };

      if (existing[0]) {
        return base44.asServiceRole.entities.BillingStatus.update(existing[0].id, { ...existing[0], ...payload });
      }
      return base44.asServiceRole.entities.BillingStatus.create(payload);
    };

    const createAdminNotification = async ({ clientId, title, message, eventType }) => {
      return base44.asServiceRole.entities.NotificationLog.create({
        event_type: eventType,
        entity_name: 'Client',
        entity_id: clientId,
        client_account_id: clientId,
        recipient_role: 'admin',
        recipient_email: null,
        channel: 'in_app',
        delivery_status: 'stored',
        provider_name: 'Stripe',
        provider_message: message,
        title,
        message,
        triggered_at: new Date().toISOString(),
        actor_email: null,
        metadata: {},
      });
    };

    const lockClientOnUnpaid = async (clientId, billingStatus) => {
      const clients = await base44.asServiceRole.entities.Client.filter({ id: clientId }, '-updated_date', 1);
      const client = clients[0];
      if (!client) return null;
      const blockers = Array.from(new Set([...(client.blockers || []), 'Unpaid billing']));
      return base44.asServiceRole.entities.Client.update(client.id, {
        ...client,
        blockers,
        last_activity: `Stripe billing updated: ${billingStatus}`,
      });
    };

    const unlockClientOnPaid = async (clientId) => {
      const clients = await base44.asServiceRole.entities.Client.filter({ id: clientId }, '-updated_date', 1);
      const client = clients[0];
      if (!client) return null;
      return base44.asServiceRole.entities.Client.update(client.id, {
        ...client,
        blockers: (client.blockers || []).filter((item) => item !== 'Unpaid billing'),
        last_activity: 'Stripe billing updated: active',
      });
    };

    const markLogProcessed = async (clientId) => {
      if (!logRecord) return;
      await base44.asServiceRole.entities.StripeEventLog.update(logRecord.id, {
        ...logRecord,
        status: 'processed',
        related_client_id: clientId || null,
        processed_at: new Date().toISOString(),
        error_message: null,
      });
    };

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id || null;
      const stripeSubscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id || null;
      const email = session.customer_details?.email || session.customer_email || '';
      const phone = session.customer_details?.phone || '';
      const metadataClientId = session.metadata?.clientId || null;

      console.log('stripeWebhook checkout.session.completed link check', {
        sessionId: session.id,
        metadataClientId,
        email,
      });

      if (!metadataClientId) {
        const missingClientIdError = 'Stripe checkout session metadata.clientId is missing';
        console.error(missingClientIdError, { sessionId: session.id, metadata: session.metadata || null });
        if (logRecord) {
          await base44.asServiceRole.entities.StripeEventLog.update(logRecord.id, {
            ...logRecord,
            status: 'failed',
            processed_at: new Date().toISOString(),
            error_message: missingClientIdError,
          });
        }
        return Response.json({ received: true, event_type: event.type, error: missingClientIdError });
      }

      let client = await getClientByMetadata(metadataClientId);
      if (!client) {
        const clientMatchError = `Client not found for metadata.clientId ${metadataClientId}`;
        console.error(clientMatchError);
        if (logRecord) {
          await base44.asServiceRole.entities.StripeEventLog.update(logRecord.id, {
            ...logRecord,
            status: 'failed',
            processed_at: new Date().toISOString(),
            error_message: clientMatchError,
          });
        }
        return Response.json({ received: true, event_type: event.type, error: clientMatchError });
      }

      const lead = await getLeadFromMetadata(session.metadata || {}, email);
      const plan = client.plan || session.metadata?.planName || 'Starter';
      const renewalDate = stripeSubscriptionId ? toDateOnlyFromUnix((await stripe.subscriptions.retrieve(stripeSubscriptionId)).current_period_end) : null;

      await ensureTasks(client.id, plan, client.assigned_owner || '');
      await ensureIntakeForm(client);
      await ensureBillingStatus({
        clientId: client.id,
        plan,
        stripeCustomerId,
        stripeSubscriptionId,
        stripeCheckoutSessionId: session.id,
        invoiceReference: session.id,
        renewalDate,
        billingStatus: 'active',
        notes: 'Stripe payment confirmed and billing activated.',
      });
      await ensureIntegrations(client.id, plan);
      await ensureClientNote(client.id, 'Client created from successful Stripe payment and linked to onboarding.');

      if (lead) {
        await base44.asServiceRole.entities.Lead.update(lead.id, {
          ...lead,
          status: 'Onboarding',
          client_account_id: client.id,
          last_activity_at: new Date().toISOString(),
          next_action: 'Complete onboarding intake form',
        });
      }

      await unlockClientOnPaid(client.id);
      await markLogProcessed(client.id);
      return Response.json({ received: true, event_type: event.type, client_id: client.id });
    }

    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const stripeCustomerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id || null;
      const stripeSubscriptionId = subscription.id;
      const billingMatches = await base44.asServiceRole.entities.BillingStatus.list('-updated_date', 200);
      const billing = billingMatches.find((item) => item.stripe_customer_id === stripeCustomerId || item.stripe_subscription_id === stripeSubscriptionId);
      if (billing?.client_id) {
        const status = mapSubscriptionStatus(subscription.status);
        await ensureBillingStatus({
          clientId: billing.client_id,
          plan: billing.plan,
          stripeCustomerId,
          stripeSubscriptionId,
          stripeCheckoutSessionId: billing.stripe_checkout_session_id,
          invoiceReference: billing.invoice_reference,
          renewalDate: toDateOnlyFromUnix(subscription.current_period_end),
          billingStatus: status,
          notes: `Stripe subscription event: ${event.type}`,
        });
        if (status === 'active') {
          await unlockClientOnPaid(billing.client_id);
        } else {
          await lockClientOnUnpaid(billing.client_id, status);
        }
        await markLogProcessed(billing.client_id);
      } else {
        await markLogProcessed(null);
      }
      return Response.json({ received: true, event_type: event.type });
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      const stripeCustomerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id || null;
      const billingMatches = await base44.asServiceRole.entities.BillingStatus.list('-updated_date', 200);
      const billing = billingMatches.find((item) => item.stripe_customer_id === stripeCustomerId);
      if (billing?.client_id) {
        await ensureBillingStatus({
          clientId: billing.client_id,
          plan: billing.plan,
          stripeCustomerId,
          stripeSubscriptionId: billing.stripe_subscription_id,
          stripeCheckoutSessionId: billing.stripe_checkout_session_id,
          invoiceReference: invoice.number || invoice.id,
          renewalDate: billing.renewal_date,
          billingStatus: 'payment_failed',
          notes: 'Stripe invoice payment failed.',
        });
        await lockClientOnUnpaid(billing.client_id, 'payment_failed');
        await createAdminNotification({
          clientId: billing.client_id,
          title: 'Stripe payment failed',
          message: 'A Stripe invoice payment failed and onboarding remains locked.',
          eventType: 'billing_status_changed',
        });
        await ensureClientNote(billing.client_id, 'Stripe payment failed and onboarding remains locked.');
        await markLogProcessed(billing.client_id);
      } else {
        await markLogProcessed(null);
      }
      return Response.json({ received: true, event_type: event.type });
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const stripeCustomerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id || null;
      const stripeSubscriptionId = subscription.id;
      const billingMatches = await base44.asServiceRole.entities.BillingStatus.list('-updated_date', 200);
      const billing = billingMatches.find((item) => item.stripe_customer_id === stripeCustomerId || item.stripe_subscription_id === stripeSubscriptionId);
      if (billing?.client_id) {
        await ensureBillingStatus({
          clientId: billing.client_id,
          plan: billing.plan,
          stripeCustomerId,
          stripeSubscriptionId,
          stripeCheckoutSessionId: billing.stripe_checkout_session_id,
          invoiceReference: billing.invoice_reference,
          renewalDate: billing.renewal_date,
          billingStatus: 'cancelled',
          notes: 'Stripe subscription cancelled or deleted.',
        });
        await lockClientOnUnpaid(billing.client_id, 'cancelled');
        await createAdminNotification({
          clientId: billing.client_id,
          title: 'Stripe subscription cancelled',
          message: 'The Stripe subscription was cancelled and onboarding was flagged for review.',
          eventType: 'billing_status_changed',
        });
        await ensureClientNote(billing.client_id, 'Stripe subscription cancelled and onboarding was flagged for review.');
        await markLogProcessed(billing.client_id);
      } else {
        await markLogProcessed(null);
      }
      return Response.json({ received: true, event_type: event.type });
    }

    await markLogProcessed(null);
    return Response.json({ received: true, event_type: event.type, ignored: true });
  } catch (error) {
    if (logRecord) {
      await base44.asServiceRole.entities.StripeEventLog.update(logRecord.id, {
        ...logRecord,
        status: 'failed',
        processed_at: new Date().toISOString(),
        error_message: error.message,
      });
    }
    console.error('Stripe webhook failed', error);
    return Response.json({ error: error.message }, { status: 400 });
  }
});