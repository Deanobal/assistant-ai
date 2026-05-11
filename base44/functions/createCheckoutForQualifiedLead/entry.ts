import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@18.4.0';

const PLANS = {
  Starter: { setupFee: 1500, monthlyFee: 497 },
  Growth: { setupFee: 3000, monthlyFee: 1500 },
};

function maskHeader(value) {
  return value ? '[present-redacted]' : '[missing]';
}

function getSafeHeaders(req) {
  return {
    content_type: req.headers.get('content-type') || '',
    user_agent: req.headers.get('user-agent') || '',
    x_webhook_secret: maskHeader(req.headers.get('x-webhook-secret')),
  };
}

function verifyWebhookSecret(req, payload = {}) {
  const receivedSecret = req.headers.get('x-webhook-secret') || payload.x_webhook_secret || payload.webhook_secret || '';
  const expectedSecret = Deno.env.get('VAPI_WEBHOOK_SECRET') || '';
  return {
    secret_received: !!receivedSecret,
    secret_configured: !!expectedSecret,
    secret_valid: !!receivedSecret && !!expectedSecret && receivedSecret === expectedSecret,
  };
}

function jsonToolResponse(body) {
  console.log('Final response:', JSON.stringify(body));
  return Response.json(body, {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function validationError(field) {
  return jsonToolResponse({ success: false, error: `Missing required field: ${field}` });
}

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

function requiredSecret(name) {
  const value = clean(Deno.env.toObject()[name]);
  if (!value) throw new Error(`Missing ${name}`);
  return value;
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

function buildLineItems(planName, stripeMode) {
  const setupPriceName = priceEnvName(stripeMode, planName, 'setup');
  const monthlyPriceName = priceEnvName(stripeMode, planName, 'monthly');
  const setupPrice = requiredSecret(setupPriceName);
  const monthlyPrice = requiredSecret(monthlyPriceName);

  return {
    lineItems: [
      { price: setupPrice, quantity: 1 },
      { price: monthlyPrice, quantity: 1 },
    ],
    mode: 'subscription',
    subscriptionConfigured: true,
    setupOnlyReason: null,
    priceMapping: {
      setup_price_secret: setupPriceName,
      monthly_price_secret: monthlyPriceName,
    },
  };
}

Deno.serve(async (req) => {
  let payload = {};
  try {
    console.log('Incoming request headers:', JSON.stringify(getSafeHeaders(req)));
    payload = await req.json();
    console.log('Incoming request body:', JSON.stringify(payload));

    const authResult = verifyWebhookSecret(req, payload);
    console.log('Webhook auth result:', JSON.stringify(authResult));

    if (payload.debug === true) {
      return jsonToolResponse({
        success: true,
        message: 'Vapi endpoint reachable',
        secret_received: authResult.secret_received,
        secret_valid: authResult.secret_valid,
      });
    }

    if (!authResult.secret_valid) {
      return jsonToolResponse({ success: false, error: 'Invalid webhook secret' });
    }

    const base44 = createClientFromRequest(req);
    const stripeMode = getStripeMode();
    const stripe = getStripeClient(stripeMode);

    if (!payload.lead_id) return validationError('lead_id');
    if (!payload.buyer_confirmed_intent) return validationError('buyer_confirmed_intent');

    const selectedPlan = getPlan(payload.selected_plan);
    if (!selectedPlan) return validationError('selected_plan');

    const leadMatches = await base44.asServiceRole.entities.Lead.filter({ id: payload.lead_id }, '-updated_date', 1);
    const lead = leadMatches[0];
    if (!lead) {
      return jsonToolResponse({ success: false, error: 'Lead not found' });
    }

    const email = clean(payload.email) || lead.email;
    const fullName = clean(payload.full_name) || lead.full_name;
    const businessName = clean(payload.business_name) || lead.business_name;
    if (!email) return validationError('email');
    if (!fullName) return validationError('full_name');

    const { lineItems, mode, subscriptionConfigured, setupOnlyReason, priceMapping } = buildLineItems(selectedPlan, stripeMode);
    console.log('Stripe checkout plan mapping:', JSON.stringify({ selectedPlan, stripeMode, priceMapping }));
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
      setup_price_secret: priceMapping.setup_price_secret,
      monthly_price_secret: priceMapping.monthly_price_secret,
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
    await base44.asServiceRole.entities.Lead.update(lead.id, {
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

    return jsonToolResponse({
      success: true,
      checkout_url: session.url,
      lead_id: lead.id,
      selected_plan: selectedPlan,
      next_step: 'Tell the caller the secure checkout link is ready.',
    });
  } catch (error) {
    console.log('Server failure:', error?.message || String(error));
    return jsonToolResponse({ success: false, error: error?.message || 'Unknown server error' });
  }
});