import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@18.4.0';

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY'), {
  apiVersion: '2025-02-24.acacia',
});

const PLAN_CONFIG = {
  Starter: { key: 'starter', name: 'Starter', setupFee: 1500, monthlyFee: 497 },
  Growth: { key: 'growth', name: 'Growth', setupFee: 3000, monthlyFee: 1500 },
  Enterprise: { key: 'enterprise', name: 'Enterprise', setupFee: 7500, monthlyFee: 3000 },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { clientId, origin } = await req.json();
    if (!clientId || !origin) {
      return Response.json({ error: 'clientId and origin are required' }, { status: 400 });
    }

    const client = await base44.asServiceRole.entities.Client.get(clientId);
    const plan = PLAN_CONFIG[client.plan] || PLAN_CONFIG.Starter;
    const billingMatches = await base44.asServiceRole.entities.BillingStatus.filter({ client_id: clientId }, '-updated_date', 1);
    const billing = billingMatches[0] || null;

    let stripeCustomerId = billing?.stripe_customer_id || null;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        name: client.full_name,
        email: client.email,
        phone: client.mobile_number || undefined,
        metadata: {
          clientId: client.id,
          plan: client.plan,
          source: 'admin_billing_action',
        },
      });
      stripeCustomerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      success_url: `${origin}/GetStartedNow?plan=${plan.key}&checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/GetStartedNow?plan=${plan.key}&checkout=cancelled`,
      metadata: {
        clientId: client.id,
        planKey: plan.key,
        planName: plan.name,
        source: 'admin_billing_action',
        origin,
      },
      subscription_data: {
        metadata: {
          clientId: client.id,
          planKey: plan.key,
          planName: plan.name,
          source: 'admin_billing_action',
          origin,
        },
      },
      line_items: [
        {
          price_data: {
            currency: 'aud',
            unit_amount: plan.setupFee * 100,
            product_data: {
              name: `${plan.name} Setup Fee`,
              description: 'AssistantAI onboarding, implementation, and setup.',
            },
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'aud',
            unit_amount: plan.monthlyFee * 100,
            recurring: { interval: 'month' },
            product_data: {
              name: `${plan.name} Monthly Management`,
              description: 'AssistantAI management, support, and optimisation.',
            },
          },
          quantity: 1,
        },
      ],
    });

    const nextBilling = billing
      ? { ...billing, billing_status: 'awaiting_payment', invoice_reference: session.id, stripe_customer_id: stripeCustomerId, stripe_checkout_session_id: session.id, notes: 'Stripe payment link sent by admin.', admin_override: false }
      : {
          client_id: client.id,
          plan: client.plan,
          setup_fee: plan.setupFee,
          monthly_fee: plan.monthlyFee,
          billing_status: 'awaiting_payment',
          payment_method: stripeCustomerId,
          invoice_reference: session.id,
          renewal_date: null,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: null,
          stripe_checkout_session_id: session.id,
          notes: 'Stripe payment link sent by admin.',
          admin_override: false,
        };

    if (billing?.id) {
      await base44.asServiceRole.entities.BillingStatus.update(billing.id, nextBilling);
    } else {
      await base44.asServiceRole.entities.BillingStatus.create(nextBilling);
    }

    await base44.asServiceRole.entities.Client.update(client.id, {
      ...client,
      last_activity: 'Stripe payment link sent',
    });

    return Response.json({ success: true, checkout_url: session.url, session_id: session.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});