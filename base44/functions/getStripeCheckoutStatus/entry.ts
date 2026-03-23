import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import Stripe from 'npm:stripe@18.4.0';

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY'), {
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

    const billingMatches = await base44.asServiceRole.entities.BillingRecord.filter({ stripe_checkout_session_id: session.id }, '-updated_date', 1);
    const billing = billingMatches[0] || null;
    const onboardingMatches = billing?.client_id
      ? await base44.asServiceRole.entities.Onboarding.filter({ client_account_id: billing.client_id }, '-updated_date', 1)
      : [];
    const onboarding = onboardingMatches[0] || null;

    const paymentConfirmed = billing?.billing_status === 'active' && session.payment_status === 'paid';

    return Response.json({
      success: true,
      session_id: session.id,
      payment_status: session.payment_status,
      status: session.status,
      customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id || null,
      subscription_id: typeof session.subscription === 'string' ? session.subscription : session.subscription?.id || null,
      onboarding_started: !!onboarding && paymentConfirmed,
      billing_status: billing?.billing_status || 'pending',
      plan_name: billing?.plan_name || session.metadata?.planName || null,
      onboarding_id: onboarding?.id || null,
      intake_url: onboarding?.id ? `/OnboardingIntake?id=${onboarding.id}` : null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});