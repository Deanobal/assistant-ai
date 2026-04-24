import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@18.4.0';

const stripe = new Stripe(Deno.env.get('STRIPE_TEST_SECRET_KEY') || Deno.env.get('STRIPE_API_KEY'), {
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

    const billingMatches = await base44.asServiceRole.entities.BillingStatus.filter({ stripe_checkout_session_id: session.id }, '-updated_date', 1);
    const billing = billingMatches[0] || null;
    const clientMatches = billing?.client_id ? await base44.asServiceRole.entities.Client.filter({ id: billing.client_id }, '-updated_date', 1) : [];
    const client = clientMatches[0] || null;

    return Response.json({
      success: true,
      session_id: session.id,
      payment_status: session.payment_status,
      status: session.status,
      customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id || null,
      subscription_id: typeof session.subscription === 'string' ? session.subscription : session.subscription?.id || null,
      onboarding_started: billing?.billing_status === 'active' && !!client,
      billing_status: billing?.billing_status || 'awaiting_payment',
      plan_name: billing?.plan || session.metadata?.planName || null,
      client_id: client?.id || null,
      workspace_url: client?.id ? `/ClientWorkspace?id=${client.id}` : null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});