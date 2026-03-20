import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import Stripe from 'npm:stripe@18.4.0';

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY'), {
  apiVersion: '2025-02-24.acacia',
});

const PLAN_CONFIG = {
  starter: { name: 'Starter', setupFee: 1500, monthlyFee: 497 },
  growth: { name: 'Growth', setupFee: 3000, monthlyFee: 1500 },
};

function mapSubscriptionStatus(status) {
  if (status === 'active' || status === 'trialing') return 'active';
  if (status === 'past_due' || status === 'unpaid') return 'past_due';
  if (status === 'canceled' || status === 'incomplete_expired') return 'cancelled';
  return 'pending';
}

function unixToIsoDate(seconds) {
  if (!seconds) return null;
  return new Date(seconds * 1000).toISOString();
}

function buildIntakeUrl(origin, onboardingId) {
  if (!origin || !onboardingId) return null;
  return `${origin}/OnboardingIntake?id=${onboardingId}`;
}

function appendNote(existing, note) {
  return existing ? `${existing}\n\n${note}` : note;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

    const findLead = async ({ leadId, email }) => {
      if (leadId) {
        const matches = await base44.asServiceRole.entities.Lead.filter({ id: leadId }, '-updated_date', 1);
        if (matches[0]) return matches[0];
      }
      if (!email) return null;
      const matches = await base44.asServiceRole.entities.Lead.filter({ email }, '-updated_date', 1);
      return matches[0] || null;
    };

    const upsertClient = async ({ clientId, lead, email, fullName, businessName, phone, industry, planName, monthlyFee, renewalDate }) => {
      const byId = clientId ? await base44.asServiceRole.entities.ClientAccount.filter({ id: clientId }, '-updated_date', 1) : [];
      const byLead = lead?.id ? await base44.asServiceRole.entities.ClientAccount.filter({ lead_id: lead.id }, '-updated_date', 1) : [];
      const byEmail = email ? await base44.asServiceRole.entities.ClientAccount.filter({ email }, '-updated_date', 1) : [];
      const existingClient = byId[0] || byLead[0] || byEmail[0] || null;

      const payload = {
        business_name: businessName || fullName,
        contact_name: fullName,
        email,
        phone: phone || '',
        industry: industry || existingClient?.industry || 'other',
        plan_name: planName || existingClient?.plan_name || '',
        status: 'Onboarding',
        monthly_fee: monthlyFee ?? existingClient?.monthly_fee ?? 0,
        setup_fee_status: 'paid',
        billing_status: 'active',
        last_activity: 'Stripe payment confirmed',
        requires_follow_up: true,
        lead_id: lead?.id || existingClient?.lead_id || null,
        renewal_date: renewalDate ? renewalDate.slice(0, 10) : existingClient?.renewal_date || undefined,
      };

      if (existingClient) {
        const nextClient = {
          ...existingClient,
          ...payload,
        };
        if (!nextClient.renewal_date) delete nextClient.renewal_date;
        return base44.asServiceRole.entities.ClientAccount.update(existingClient.id, nextClient);
      }

      return base44.asServiceRole.entities.ClientAccount.create({
        business_name: payload.business_name,
        contact_name: payload.contact_name,
        email: payload.email,
        phone: payload.phone,
        website: '',
        address: '',
        industry: payload.industry,
        timezone: 'Australia/Sydney',
        plan_name: payload.plan_name,
        status: payload.status,
        monthly_fee: payload.monthly_fee,
        setup_fee_status: payload.setup_fee_status,
        billing_status: payload.billing_status,
        ...(payload.renewal_date ? { renewal_date: payload.renewal_date } : {}),
        included_calls: 0,
        used_calls: 0,
        extra_call_packs: 0,
        overage_usage: 0,
        premium_support_add_on: false,
        monthly_revenue: payload.monthly_fee,
        total_calls_month: 0,
        leads_captured: 0,
        appointments_booked: 0,
        last_activity: payload.last_activity,
        portal_access: true,
        notification_setting: 'standard',
        client_permissions: ['Overview', 'Calls', 'Analytics', 'Billing', 'Integrations', 'Support'],
        payment_method_label: '',
        requires_follow_up: payload.requires_follow_up,
        active_services: [planName ? `${planName} Plan` : 'AssistantAI'],
        lead_id: payload.lead_id,
        services: [],
        notes_entries: [],
        integrations: [],
        recent_calls: [],
        invoices: [],
        analytics: {
          lead_conversion: 0,
          average_call_duration: '',
          peak_call_times: '',
          follow_up_metrics: '',
          trend: [],
          categories: [],
        },
        is_archived: false,
      });
    };

    const upsertLead = async ({ lead, clientId, email, fullName, businessName, phone, industry, planName }) => {
      const note = `[${new Date().toISOString()}] Stripe payment confirmed for ${planName}.`;
      if (lead) {
        return base44.asServiceRole.entities.Lead.update(lead.id, {
          ...lead,
          full_name: lead.full_name || fullName,
          business_name: lead.business_name || businessName || fullName,
          email: lead.email || email,
          mobile_number: lead.mobile_number || phone || '',
          industry: lead.industry || industry || 'other',
          client_account_id: clientId,
          status: 'Onboarding',
          next_action: 'Payment received. Review onboarding and send client intake steps.',
          notes: appendNote(lead.notes, note),
          last_activity_at: new Date().toISOString(),
        });
      }

      return base44.asServiceRole.entities.Lead.create({
        full_name: fullName,
        business_name: businessName || fullName,
        email,
        mobile_number: phone || '',
        industry: industry || 'other',
        enquiry_type: 'other',
        monthly_enquiry_volume: '',
        source_page: '/GetStartedNow',
        message: `${planName} paid via Stripe checkout.`,
        created_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
        status: 'Onboarding',
        next_action: 'Payment received. Review onboarding and send client intake steps.',
        notes: note,
        client_account_id: clientId,
        booking_intent: false,
        booking_source: 'stripe_checkout',
      });
    };

    const upsertOnboarding = async ({ lead, client, email, fullName, phone, industry, planName }) => {
      const byClient = await base44.asServiceRole.entities.Onboarding.filter({ client_account_id: client.id }, '-updated_date', 1);
      const byLead = lead?.id ? await base44.asServiceRole.entities.Onboarding.filter({ lead_id: lead.id }, '-updated_date', 1) : [];
      const byEmail = email ? await base44.asServiceRole.entities.Onboarding.filter({ email }, '-updated_date', 1) : [];
      const existingOnboarding = byClient[0] || byLead[0] || byEmail[0] || null;
      const note = `[${new Date().toISOString()}] Stripe payment confirmed. Onboarding moved to Payment Received.`;

      const payload = {
        client_name: client.business_name,
        contact_name: fullName,
        email,
        mobile: phone || '',
        industry: industry || 'other',
        plan: planName,
        payment_status: 'paid',
        intake_form_status: existingOnboarding?.intake_form_status || 'not_sent',
        assets_received: existingOnboarding?.assets_received || false,
        workflow_mapped: existingOnboarding?.workflow_mapped || false,
        ai_agent_built: existingOnboarding?.ai_agent_built || false,
        integrations_connected: existingOnboarding?.integrations_connected || false,
        testing_status: existingOnboarding?.testing_status || 'not_started',
        go_live_status: existingOnboarding?.go_live_status || 'not_ready',
        onboarding_stage: 'Payment Received',
        lead_id: lead?.id || existingOnboarding?.lead_id || null,
        client_account_id: client.id,
        onboarding_notes: appendNote(existingOnboarding?.onboarding_notes, note),
      };

      if (existingOnboarding) {
        return base44.asServiceRole.entities.Onboarding.update(existingOnboarding.id, {
          ...existingOnboarding,
          ...payload,
        });
      }

      return base44.asServiceRole.entities.Onboarding.create(payload);
    };

    const upsertBilling = async ({ clientId, customerId, sessionId, subscriptionId, invoiceId, planName, setupFeeAmount, monthlyFeeAmount, nextPaymentDate }) => {
      const bySession = sessionId ? await base44.asServiceRole.entities.BillingRecord.filter({ stripe_checkout_session_id: sessionId }, '-updated_date', 1) : [];
      const byCustomer = customerId ? await base44.asServiceRole.entities.BillingRecord.filter({ stripe_customer_id: customerId }, '-updated_date', 1) : [];
      const byClient = clientId ? await base44.asServiceRole.entities.BillingRecord.filter({ client_id: clientId }, '-updated_date', 1) : [];
      const billing = bySession[0] || byCustomer[0] || byClient[0] || null;

      const payload = {
        client_id: clientId,
        plan_name: planName,
        setup_fee_amount: setupFeeAmount,
        monthly_fee_amount: monthlyFeeAmount,
        billing_status: 'active',
        payment_method_status: 'valid',
        invoice_reference: invoiceId || sessionId,
        stripe_customer_id: customerId || null,
        stripe_checkout_session_id: sessionId || billing?.stripe_checkout_session_id || null,
        stripe_subscription_id: subscriptionId || billing?.stripe_subscription_id || null,
        last_payment_date: new Date().toISOString(),
        next_payment_date: nextPaymentDate || billing?.next_payment_date || null,
      };

      if (billing) {
        return base44.asServiceRole.entities.BillingRecord.update(billing.id, {
          ...billing,
          ...payload,
        });
      }

      return base44.asServiceRole.entities.BillingRecord.create(payload);
    };

    const sendOnboardingEmail = async ({ email, fullName, planName, intakeUrl }) => {
      if (!email || !intakeUrl) return;
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: `Payment received — your ${planName} onboarding has started`,
        body: `Hi ${fullName},\n\nWe have received your payment for the ${planName} plan and your AssistantAI onboarding has now started.\n\nNext step: complete your onboarding intake form here:\n${intakeUrl}\n\nOnce submitted, our team will review your details and usually begin the onboarding handoff within one business day.\n\nAssistantAI`,
      });
    };

    const createAdminTask = async ({ clientId, onboardingId, email, planName, intakeUrl }) => {
      await base44.asServiceRole.entities.NotificationLog.create({
        event_type: 'onboarding_created',
        entity_name: 'Onboarding',
        entity_id: onboardingId,
        client_account_id: clientId,
        recipient_role: 'admin',
        recipient_email: null,
        channel: 'in_app',
        delivery_status: 'stored',
        provider_name: 'Stripe',
        provider_message: 'Payment confirmed. Admin onboarding review required.',
        title: 'New paid onboarding requires review',
        message: `${planName} payment confirmed for ${email}. Review onboarding and intake readiness.${intakeUrl ? ` Intake form: ${intakeUrl}` : ''}`,
        triggered_at: new Date().toISOString(),
        actor_email: email || null,
        metadata: {
          client_id: clientId,
          onboarding_id: onboardingId,
          intake_url: intakeUrl,
        },
      });
    };

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id || null;
      const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id || null;
      const subscription = subscriptionId ? await stripe.subscriptions.retrieve(subscriptionId) : null;
      const metadata = session.metadata || {};
      const email = session.customer_details?.email || session.customer_email || '';
      const fullName = session.customer_details?.name || metadata.contactName || 'Client';
      const phone = session.customer_details?.phone || '';
      const planKey = (metadata.planKey || '').toLowerCase();
      const plan = PLAN_CONFIG[planKey] || {
        name: metadata.planName || 'AssistantAI',
        setupFee: 0,
        monthlyFee: 0,
      };
      const renewalDate = unixToIsoDate(subscription?.current_period_end);
      const lead = await findLead({ leadId: metadata.leadId, email });
      const client = await upsertClient({
        clientId: metadata.clientAccountId || null,
        lead,
        email,
        fullName,
        businessName: lead?.business_name || fullName,
        phone,
        industry: lead?.industry || 'other',
        planName: metadata.planName || plan.name,
        monthlyFee: plan.monthlyFee,
        renewalDate,
      });
      const confirmedLead = await upsertLead({
        lead,
        clientId: client.id,
        email,
        fullName,
        businessName: lead?.business_name || fullName,
        phone,
        industry: lead?.industry || 'other',
        planName: metadata.planName || plan.name,
      });
      const onboarding = await upsertOnboarding({
        lead: confirmedLead,
        client,
        email,
        fullName,
        phone,
        industry: confirmedLead?.industry || 'other',
        planName: metadata.planName || plan.name,
      });
      const intakeUrl = buildIntakeUrl(metadata.origin, onboarding.id);

      await upsertBilling({
        clientId: client.id,
        customerId,
        sessionId: session.id,
        subscriptionId,
        invoiceId: session.id,
        planName: metadata.planName || plan.name,
        setupFeeAmount: plan.setupFee,
        monthlyFeeAmount: plan.monthlyFee,
        nextPaymentDate: renewalDate,
      });

      await base44.asServiceRole.entities.ClientAccount.update(client.id, {
        ...client,
        requires_follow_up: false,
        last_activity: 'Stripe payment confirmed and onboarding started',
      });

      await sendOnboardingEmail({
        email,
        fullName,
        planName: metadata.planName || plan.name,
        intakeUrl,
      });

      await createAdminTask({
        clientId: client.id,
        onboardingId: onboarding.id,
        email,
        planName: metadata.planName || plan.name,
        intakeUrl,
      });
    }

    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id || null;
      const billingMatches = customerId
        ? await base44.asServiceRole.entities.BillingRecord.filter({ stripe_customer_id: customerId }, '-updated_date', 1)
        : [];
      const billing = billingMatches[0] || null;
      if (billing) {
        await base44.asServiceRole.entities.BillingRecord.update(billing.id, {
          ...billing,
          billing_status: mapSubscriptionStatus(subscription.status),
          payment_method_status: subscription.default_payment_method ? 'valid' : billing.payment_method_status,
          stripe_subscription_id: subscription.id,
          next_payment_date: unixToIsoDate(subscription.current_period_end) || billing.next_payment_date,
          plan_name: subscription.metadata?.planName || billing.plan_name,
        });
      }
    }

    if (event.type === 'invoice.paid' || event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id || null;
      const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id || null;
      const subscription = subscriptionId ? await stripe.subscriptions.retrieve(subscriptionId) : null;
      const customerMatches = customerId
        ? await base44.asServiceRole.entities.BillingRecord.filter({ stripe_customer_id: customerId }, '-updated_date', 1)
        : [];
      const billing = customerMatches[0] || null;
      if (billing) {
        await base44.asServiceRole.entities.BillingRecord.update(billing.id, {
          ...billing,
          billing_status: event.type === 'invoice.paid' ? 'active' : 'past_due',
          payment_method_status: event.type === 'invoice.paid' ? 'valid' : 'failed',
          invoice_reference: invoice.number || invoice.id,
          stripe_subscription_id: subscriptionId || billing.stripe_subscription_id,
          last_payment_date: event.type === 'invoice.paid' ? new Date().toISOString() : billing.last_payment_date,
          next_payment_date: unixToIsoDate(subscription?.current_period_end) || billing.next_payment_date,
          plan_name: subscription?.metadata?.planName || billing.plan_name,
        });
      }
    }

    return Response.json({ received: true, event_type: event.type });
  } catch (error) {
    console.error('Stripe webhook failed', error);
    return Response.json({ error: error.message }, { status: 400 });
  }
});