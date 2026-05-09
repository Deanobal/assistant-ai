import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@18.4.0';

const PLANS = {
  Starter: { setupFee: 1500, monthlyFee: 497 },
  Growth: { setupFee: 3000, monthlyFee: 1500 },
  Enterprise: { setupFee: 7500, monthlyFee: 3000 },
};

function getStripeMode() {
  const mode = clean(Deno.env.get('STRIPE_MODE')).toLowerCase();
  return mode === 'live' ? 'live' : 'test';
}

function getStripeSecret(mode) {
  const secret = mode === 'test'
    ? clean(Deno.env.get('STRIPE_TEST_SECRET_KEY'))
    : clean(Deno.env.get('STRIPE_SECRET_KEY'));

  if (!secret) throw new Error(`Missing Stripe ${mode} secret key`);
  if (mode === 'test' && secret.startsWith('sk_live_')) throw new Error('STRIPE_MODE=test cannot use a live Stripe key');
  if (mode === 'live' && secret.startsWith('sk_test_')) throw new Error('STRIPE_MODE=live cannot use a test Stripe key');
  return secret;
}

function getStripeClient(mode) {
  return new Stripe(getStripeSecret(mode), { apiVersion: '2025-02-24.acacia' });
}

function priceEnvName(mode, planName, type) {
  const prefix = mode === 'test' ? 'STRIPE_TEST_' : 'STRIPE_';
  const suffix = type === 'setup' ? '_SETUP_PRICE_ID' : '_PRICE_ID';
  return `${prefix}${planName.toUpperCase()}${suffix}`;
}

function optionalSecret(name) {
  return clean(Deno.env.toObject()[name]);
}

function clean(value) {
  return String(value || '').trim();
}

function getPlan(value) {
  const plan = clean(value);
  return PLANS[plan] ? plan : null;
}

function absoluteUrl(envName, fallback) {
  const value = clean(Deno.env.get(envName));
  return value || fallback;
}

function buildLineItems(planName, paymentMode, stripeMode) {
  const plan = PLANS[planName];
  const setupPrice = optionalSecret(priceEnvName(stripeMode, planName, 'setup'));
  const monthlyPrice = optionalSecret(priceEnvName(stripeMode, planName, 'monthly'));
  const wantsSubscription = paymentMode !== 'setup_only';
  const lineItems = [];

  if (setupPrice) {
    lineItems.push({ price: setupPrice, quantity: 1 });
  } else {
    lineItems.push({
      price_data: {
        currency: 'aud',
        unit_amount: plan.setupFee * 100,
        product_data: { name: `${planName} setup fee`, description: 'Done-for-you AssistantAI setup, implementation, support, optimisation, and reporting.' },
      },
      quantity: 1,
    });
  }

  if (wantsSubscription && monthlyPrice) {
    lineItems.push({ price: monthlyPrice, quantity: 1 });
    return { lineItems, mode: 'subscription', subscriptionConfigured: true, setupOnlyReason: null };
  }

  return {
    lineItems,
    mode: 'payment',
    subscriptionConfigured: false,
    setupOnlyReason: wantsSubscription ? 'Monthly subscription price ID missing. Setup Fee Only mode used.' : 'Setup Fee Only mode requested.',
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const stripeMode = getStripeMode();
    const stripe = getStripeClient(stripeMode);

    if (!payload.buyer_confirmed_intent) {
      return Response.json({ error: 'Buyer must confirm they want to proceed before checkout is created' }, { status: 400 });
    }

    const selectedPlan = getPlan(payload.selected_plan);
    if (!selectedPlan) {
      return Response.json({ error: 'Valid selected_plan is required' }, { status: 400 });
    }

    if (selectedPlan === 'Enterprise' && !optionalSecret('STRIPE_ENTERPRISE_SETUP_PRICE_ID')) {
      const leadMatches = await base44.asServiceRole.entities.Lead.filter({ id: payload.lead_id }, '-updated_date', 1);
      const lead = leadMatches[0];
      if (lead) {
        await base44.asServiceRole.entities.Lead.update(lead.id, {
          ...lead,
          selected_plan: 'Enterprise',
          status: 'Enterprise Review Required',
          next_action: 'Urgent admin review before enterprise payment request',
          last_activity_at: new Date().toISOString(),
        });
        await base44.asServiceRole.functions.invoke('sendAdminAlert', {
          event_type: 'new_lead_created',
          entity_name: 'Lead',
          entity_id: lead.id,
          title: 'Enterprise checkout review required',
          message: `${lead.business_name || lead.full_name} wants to proceed with Enterprise. Configure deposit/payment request or contact urgently.`,
          channels: ['in_app', 'email'],
        });
      }
      return Response.json({ enterprise_review_required: true, message: 'Enterprise payment requires admin review before checkout.' });
    }

    const leadMatches = await base44.asServiceRole.entities.Lead.filter({ id: payload.lead_id }, '-updated_date', 1);
    const lead = leadMatches[0];
    if (!lead) {
      return Response.json({ error: 'Lead not found' }, { status: 404 });
    }

    const email = clean(payload.email) || lead.email;
    const fullName = clean(payload.full_name) || lead.full_name;
    const businessName = clean(payload.business_name) || lead.business_name;
    if (!email || !fullName) {
      return Response.json({ error: 'Email and full name are required for checkout' }, { status: 400 });
    }

    const { lineItems, mode, subscriptionConfigured, setupOnlyReason } = buildLineItems(selectedPlan, clean(payload.payment_mode), stripeMode);
    const successUrl = absoluteUrl('STRIPE_SUCCESS_URL', 'https://assistantai.com.au/thank-you?payment=success&session_id={CHECKOUT_SESSION_ID}');
    const cancelUrl = absoluteUrl('STRIPE_CANCEL_URL', 'https://assistantai.com.au/GetStartedNow?payment=cancelled');

    const customer = await stripe.customers.create({
      email,
      name: fullName,
      phone: lead.mobile_number || undefined,
      metadata: { lead_id: lead.id, plan: selectedPlan, business_name: businessName, source: 'AI receptionist demo' },
    });

    const metadata = {
      lead_id: lead.id,
      plan: selectedPlan,
      business_name: businessName || '',
      source: 'AI receptionist demo',
      likely_plan_fit: lead.likely_plan_fit || selectedPlan,
      payment_intent_type: 'new_client_signup',
      subscription_configured: String(subscriptionConfigured),
      stripe_mode: stripeMode,
      setup_only_reason: setupOnlyReason || '',
    };

    const sessionParams = {
      mode,
      customer: customer.id,
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: lineItems,
      metadata,
    };

    if (mode === 'subscription') {
      sessionParams.subscription_data = { metadata };
    } else {
      sessionParams.payment_intent_data = { metadata };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    const now = new Date().toISOString();
    const updatedLead = await base44.asServiceRole.entities.Lead.update(lead.id, {
      ...lead,
      full_name: fullName,
      business_name: businessName,
      email,
      selected_plan: selectedPlan,
      status: 'Payment Pending',
      payment_status: 'pending',
      checkout_url: session.url,
      checkout_session_id: session.id,
      checkout_created_at: now,
      last_activity_at: now,
      next_action: subscriptionConfigured ? 'Complete Stripe checkout' : 'Setup Fee Only mode: complete setup payment; subscription follow-up required',
    });

    try {
      await base44.asServiceRole.functions.invoke('sendAdminAlert', {
        event_type: 'billing_status_changed',
        entity_name: 'Lead',
        entity_id: lead.id,
        title: `${selectedPlan} checkout created`,
        message: `${businessName || fullName} received a Stripe checkout link from the AI receptionist flow.`,
        channels: ['in_app', 'email'],
      });
    } catch {
      // Checkout must not be blocked by notification delivery.
    }

    return Response.json({ success: true, stripe_mode: stripeMode, checkout_url: session.url, session_id: session.id, payment_mode: mode, subscription_configured: subscriptionConfigured, setup_only_reason: setupOnlyReason, lead: updatedLead });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});