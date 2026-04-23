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
    const plan = PLAN_CONFIG[(payload.planKey || '').toLowerCase()];

    if (!plan) {
      return Response.json({ error: 'Unsupported plan' }, { status: 400 });
    }

    if (!payload.leadId || !payload.fullName || !payload.email || !payload.origin) {
      return Response.json({ error: 'leadId, fullName, email, and origin are required' }, { status: 400 });
    }

    const leadMatches = await base44.asServiceRole.entities.Lead.filter({ id: payload.leadId }, '-updated_date', 1);
    const lead = leadMatches[0];
    if (!lead) {
      return Response.json({ error: 'Lead not found' }, { status: 404 });
    }

    const clientMatches = await base44.asServiceRole.entities.Client.filter({ source_lead_id: lead.id }, '-updated_date', 1);
    if (clientMatches[0]) {
      return Response.json({ error: 'Client already created for this lead' }, { status: 400 });
    }

    const billingMatches = await base44.asServiceRole.entities.BillingStatus.filter({ invoice_reference: lead.id }, '-updated_date', 1);
    const existingBilling = billingMatches[0] || null;

    let stripeCustomerId = existingBilling?.stripe_customer_id || null;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        name: payload.fullName,
        email: payload.email,
        phone: payload.mobile || undefined,
        metadata: {
          leadId: lead.id,
          planKey: payload.planKey,
          planName: plan.name,
          source: 'public_pricing_flow',
        },
      });
      stripeCustomerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      success_url: `${payload.origin}/GetStartedNow?plan=${payload.planKey}&checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${payload.origin}/GetStartedNow?plan=${payload.planKey}&checkout=cancelled`,
      metadata: {
        leadId: lead.id,
        planKey: payload.planKey,
        planName: plan.name,
        origin: payload.origin,
        source: 'public_pricing_flow',
      },
      subscription_data: {
        metadata: {
          leadId: lead.id,
          planKey: payload.planKey,
          planName: plan.name,
          origin: payload.origin,
          source: 'public_pricing_flow',
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
          notes: 'Stripe checkout created from public pricing flow.',
        }
      : {
          client_id: lead.id,
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
          notes: 'Stripe checkout created from public pricing flow.',
        };

    if (existingBilling?.id) {
      await base44.asServiceRole.entities.BillingStatus.update(existingBilling.id, billingPayload);
    } else {
      await base44.asServiceRole.entities.BillingStatus.create(billingPayload);
    }

    await base44.asServiceRole.entities.Lead.update(lead.id, {
      ...lead,
      status: 'Won',
      notes: lead.notes ? `${lead.notes}\n\n[${new Date().toISOString()}] Stripe checkout created for ${plan.name}.` : `[${new Date().toISOString()}] Stripe checkout created for ${plan.name}.`,
      next_action: 'Complete Stripe checkout to start onboarding.',
      last_activity_at: new Date().toISOString(),
      website: payload.website || lead.website || '',
      plan: plan.name,
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