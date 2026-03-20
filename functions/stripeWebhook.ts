import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import Stripe from 'npm:stripe@18.4.0';

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY'), {
  apiVersion: '2025-02-24.acacia',
});

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

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

    const updateClientAndOnboarding = async (clientId, updates, onboardingStage, paymentStatus) => {
      if (!clientId) return;

      const clientMatches = await base44.asServiceRole.entities.ClientAccount.filter({ id: clientId }, '-updated_date', 1);
      const client = clientMatches[0];
      if (client) {
        const nextClient = {
          ...client,
          ...updates,
        };
        if (!nextClient.renewal_date) {
          delete nextClient.renewal_date;
        }
        await base44.asServiceRole.entities.ClientAccount.update(client.id, nextClient);
      }

      const onboardingMatches = await base44.asServiceRole.entities.Onboarding.filter({ client_account_id: clientId }, '-updated_date', 1);
      const onboarding = onboardingMatches[0];
      if (onboarding) {
        await base44.asServiceRole.entities.Onboarding.update(onboarding.id, {
          ...onboarding,
          payment_status: paymentStatus || onboarding.payment_status,
          onboarding_stage: onboardingStage || onboarding.onboarding_stage,
          onboarding_notes: `${onboarding.onboarding_notes || ''}\n[${new Date().toISOString()}] Stripe webhook processed: ${event.type}.`.trim(),
        });
      }
    };

    const updateBilling = async ({ customerId, subscriptionId, sessionId, invoiceId, billingStatus, paymentMethodStatus, lastPaymentDate, nextPaymentDate, planName, clientId }) => {
      const sessionMatches = sessionId
        ? await base44.asServiceRole.entities.BillingRecord.filter({ stripe_checkout_session_id: sessionId }, '-updated_date', 1)
        : [];
      const customerMatches = customerId
        ? await base44.asServiceRole.entities.BillingRecord.filter({ stripe_customer_id: customerId }, '-updated_date', 1)
        : [];
      const subscriptionMatches = subscriptionId
        ? await base44.asServiceRole.entities.BillingRecord.filter({ stripe_subscription_id: subscriptionId }, '-updated_date', 1)
        : [];
      let billing = sessionMatches[0] || subscriptionMatches[0] || customerMatches[0];
      if (!billing && clientId) {
        const clientBillingMatches = await base44.asServiceRole.entities.BillingRecord.filter({ client_id: clientId }, '-updated_date', 1);
        billing = clientBillingMatches[0] || null;
      }
      if (!billing) return null;

      const updated = await base44.asServiceRole.entities.BillingRecord.update(billing.id, {
        ...billing,
        client_id: clientId || billing.client_id,
        billing_status: billingStatus || billing.billing_status,
        payment_method_status: paymentMethodStatus || billing.payment_method_status,
        invoice_reference: invoiceId || billing.invoice_reference,
        stripe_customer_id: customerId || billing.stripe_customer_id,
        stripe_checkout_session_id: sessionId || billing.stripe_checkout_session_id,
        stripe_subscription_id: subscriptionId || billing.stripe_subscription_id,
        last_payment_date: lastPaymentDate || billing.last_payment_date,
        next_payment_date: nextPaymentDate || billing.next_payment_date,
        plan_name: planName || billing.plan_name,
      });
      return updated;
    };

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id || null;
      const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id || null;
      const subscription = subscriptionId ? await stripe.subscriptions.retrieve(subscriptionId) : null;
      const billing = await updateBilling({
        customerId,
        subscriptionId,
        sessionId: session.id,
        clientId: session.metadata?.clientAccountId || null,
        invoiceId: session.id,
        billingStatus: 'active',
        paymentMethodStatus: 'valid',
        lastPaymentDate: new Date().toISOString(),
        nextPaymentDate: unixToIsoDate(subscription?.current_period_end),
        planName: session.metadata?.planName || subscription?.metadata?.planName || null,
      });
      await updateClientAndOnboarding(
        billing?.client_id,
        {
          billing_status: 'active',
          setup_fee_status: 'paid',
          plan_name: session.metadata?.planName || billing?.plan_name,
          renewal_date: unixToIsoDate(subscription?.current_period_end)?.slice(0, 10) || null,
          requires_follow_up: false,
        },
        'Payment Received',
        'paid',
      );
    }

    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const billing = await updateBilling({
        customerId: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id || null,
        subscriptionId: subscription.id,
        billingStatus: mapSubscriptionStatus(subscription.status),
        paymentMethodStatus: subscription.default_payment_method ? 'valid' : 'pending',
        nextPaymentDate: unixToIsoDate(subscription.current_period_end),
        planName: subscription.metadata?.planName || null,
      });
      await updateClientAndOnboarding(
        billing?.client_id,
        {
          billing_status: mapSubscriptionStatus(subscription.status),
          plan_name: subscription.metadata?.planName || billing?.plan_name,
          renewal_date: unixToIsoDate(subscription.current_period_end)?.slice(0, 10) || null,
        },
        mapSubscriptionStatus(subscription.status) === 'cancelled' ? 'Payment Received' : null,
        mapSubscriptionStatus(subscription.status) === 'past_due' ? 'overdue' : null,
      );
    }

    if (event.type === 'invoice.paid' || event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id || null;
      const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id || null;
      const subscription = subscriptionId ? await stripe.subscriptions.retrieve(subscriptionId) : null;
      const billing = await updateBilling({
        customerId,
        subscriptionId,
        invoiceId: invoice.number || invoice.id,
        billingStatus: event.type === 'invoice.paid' ? 'active' : 'past_due',
        paymentMethodStatus: event.type === 'invoice.paid' ? 'valid' : 'failed',
        lastPaymentDate: event.type === 'invoice.paid' ? new Date().toISOString() : null,
        nextPaymentDate: unixToIsoDate(subscription?.current_period_end),
        planName: subscription?.metadata?.planName || null,
      });
      await updateClientAndOnboarding(
        billing?.client_id,
        {
          billing_status: event.type === 'invoice.paid' ? 'active' : 'past_due',
          plan_name: subscription?.metadata?.planName || billing?.plan_name,
          renewal_date: unixToIsoDate(subscription?.current_period_end)?.slice(0, 10) || null,
        },
        null,
        event.type === 'invoice.paid' ? 'paid' : 'overdue',
      );
    }

    return Response.json({ received: true, event_type: event.type });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
});