import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@18.4.0';

const stripeSecretKey = Deno.env.get('BASE44_ENV') === 'production'
  ? Deno.env.get('STRIPE_API_KEY')
  : Deno.env.get('STRIPE_TEST_SECRET_KEY');

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-02-24.acacia',
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { sessionId } = await req.json();

    if (!sessionId) {
      return Response.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id || null;
    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id || null;

    let billing = (await base44.asServiceRole.entities.BillingStatus.filter({ stripe_checkout_session_id: session.id }, '-updated_date', 1))[0] || null;

    if (!billing && subscriptionId) {
      billing = (await base44.asServiceRole.entities.BillingStatus.filter({ stripe_subscription_id: subscriptionId }, '-updated_date', 1))[0] || null;
    }

    if (!billing && customerId) {
      billing = (await base44.asServiceRole.entities.BillingStatus.filter({ stripe_customer_id: customerId }, '-updated_date', 1))[0] || null;
    }

    if (!billing) {
      const checkoutLogs = await base44.asServiceRole.entities.StripeEventLog.filter({ related_client_id: session.metadata?.clientId || null }, '-updated_date', 10);
      const eventLog = checkoutLogs.find((item) => item.event_type === 'checkout.session.completed') || null;
      const derivedClientId = eventLog?.related_client_id || session.metadata?.clientId || null;
      if (derivedClientId) {
        billing = (await base44.asServiceRole.entities.BillingStatus.filter({ client_id: derivedClientId }, '-updated_date', 1))[0] || null;
      }
    }

    const clientMatches = billing?.client_id ? await base44.asServiceRole.entities.Client.filter({ id: billing.client_id }, '-updated_date', 1) : [];
    const client = clientMatches[0] || null;
    const onboarding_status = billing?.billing_status === 'active' ? 'active' : client ? 'created' : 'pending';

    return Response.json({
      success: true,
      session_id: session.id,
      payment_status: session.payment_status,
      status: session.status,
      customer_id: customerId,
      subscription_id: subscriptionId,
      onboarding_status,
      onboarding_started: onboarding_status === 'active',
      billing_status: billing?.billing_status || 'awaiting_payment',
      plan_name: billing?.plan || session.metadata?.planName || null,
      client_id: client?.id || null,
      workspace_url: client?.id ? `/ClientWorkspace?id=${client.id}` : null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});