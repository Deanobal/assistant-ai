import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@18.4.0';

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY'), {
  apiVersion: '2025-02-24.acacia',
});

const PLAN_CONFIG = {
  starter: { name: 'Starter', setupFee: 1500, monthlyFee: 497 },
  growth: { name: 'Growth', setupFee: 3000, monthlyFee: 1500 },
  enterprise: { name: 'Enterprise', setupFee: 7500, monthlyFee: 3000 },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const normalizedPlanKey = (payload.planKey || payload.plan || '').toLowerCase();
    const plan = PLAN_CONFIG[normalizedPlanKey];

    if (!plan) {
      return Response.json({ error: 'Unsupported plan' }, { status: 400 });
    }

    if (!payload.clientId || !payload.fullName || !payload.email || !payload.origin) {
      return Response.json({ error: 'clientId, fullName, email, and origin are required' }, { status: 400 });
    }

    const client = await base44.asServiceRole.entities.Client.get(payload.clientId);
    if (!client) {
      return Response.json({ error: 'Client not found' }, { status: 404 });
    }

    const billingMatches = await base44.asServiceRole.entities.BillingStatus.filter({ client_id: client.id }, '-updated_date', 1);
    const existingBilling = billingMatches[0] || null;

    let stripeCustomerId = existingBilling?.stripe_customer_id || null;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        name: payload.fullName,
        email: payload.email,
        phone: payload.mobile || undefined,
        metadata: {
          clientId: client.id,
          planKey: normalizedPlanKey,
          planName: plan.name,
          source: 'public_get_started',
        },
      });
      stripeCustomerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      success_url: `${new URL('/GetStartedNow', req.url).origin}/GetStartedNow?plan=${payload.planKey || 'starter'}&checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${new URL('/GetStartedNow', req.url).origin}/GetStartedNow?plan=${payload.planKey || 'starter'}&checkout=cancelled`,
      metadata: {
        clientId: client.id,
        planKey: normalizedPlanKey,
        planName: plan.name,
        origin: payload.origin,
        source: 'public_get_started',
      },
      subscription_data: {
        metadata: {
          clientId: client.id,
          planKey: normalizedPlanKey,
          planName: plan.name,
          origin: payload.origin,
          source: 'public_get_started',
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

    const billingPayload = existingBilling
      ? {
          ...existingBilling,
          plan: plan.name,
          setup_fee: plan.setupFee,
          monthly_fee: plan.monthlyFee,
          billing_status: 'awaiting_payment',
          payment_method: stripeCustomerId,
          invoice_reference: session.id,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: existingBilling.stripe_subscription_id || null,
          stripe_checkout_session_id: session.id,
          admin_override: false,
          notes: 'Stripe checkout created from public get started flow.',
        }
      : {
          client_id: client.id,
          plan: plan.name,
          setup_fee: plan.setupFee,
          monthly_fee: plan.monthlyFee,
          billing_status: 'awaiting_payment',
          payment_method: stripeCustomerId,
          invoice_reference: session.id,
          renewal_date: null,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: null,
          stripe_checkout_session_id: session.id,
          admin_override: false,
          notes: 'Stripe checkout created from public get started flow.',
        };

    if (existingBilling?.id) {
      await base44.asServiceRole.entities.BillingStatus.update(existingBilling.id, billingPayload);
    } else {
      await base44.asServiceRole.entities.BillingStatus.create(billingPayload);
    }

    await base44.asServiceRole.entities.Client.update(client.id, {
      ...client,
      plan: plan.name,
      website: payload.website || client.website || '',
      last_activity: `Stripe checkout created for ${plan.name}.`,
      next_action: 'Complete Stripe checkout to unlock onboarding.',
      workflow_phase: 'Payment',
      status: client.status === 'Live' ? client.status : 'Awaiting Payment',
    });

    return Response.json({
      success: true,
      session_id: session.id,
      checkout_url: session.url,
      title: 'Continue to Secure Checkout',
      message: `Your ${plan.name} billing is ready. Complete payment to start onboarding.`,
      actionLabel: 'Open Secure Checkout',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});