import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@18.4.0';

function clean(value) {
  return String(value || '').trim();
}

function getRequiredSecret(name) {
  const value = clean(Deno.env.get(name));
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function assertStripeKeyMode(name, value, mode) {
  if (mode === 'live' && !value.startsWith('sk_live_')) throw new Error(`${name} must be a live Stripe key`);
  if (mode === 'test' && !value.startsWith('sk_test_')) throw new Error(`${name} must be a test Stripe key`);
}

function getStripeSecret(mode) {
  const name = mode === 'live' ? 'STRIPE_SECRET_KEY' : 'STRIPE_TEST_SECRET_KEY';
  const secret = getRequiredSecret(name);
  assertStripeKeyMode(name, secret, mode);
  return secret;
}

function getPriceId(mode, plan, type) {
  const prefix = mode === 'live' ? 'STRIPE_' : 'STRIPE_TEST_';
  const suffix = type === 'setup' ? '_SETUP_PRICE_ID' : '_PRICE_ID';
  const name = `${prefix}${plan.toUpperCase()}${suffix}`;
  const value = getRequiredSecret(name);
  return { name, value };
}

async function verifyPrice(stripe, mode, plan, type) {
  const { name, value } = getPriceId(mode, plan, type);
  const price = await stripe.prices.retrieve(value);
  const expectedLiveMode = mode === 'live';
  if (price.livemode !== expectedLiveMode) {
    throw new Error(`${name} belongs to ${price.livemode ? 'live' : 'test'} mode, not ${mode} mode`);
  }
  if (!price.active) throw new Error(`${name} is inactive`);
  if (type === 'monthly' && price.recurring?.interval !== 'month') throw new Error(`${name} is not a monthly recurring price`);
  if (type === 'setup' && price.recurring) throw new Error(`${name} should be a one-time setup price`);
  return {
    secret_name: name,
    price_id: value,
    valid: true,
    livemode: price.livemode,
    active: price.active,
    recurring_interval: price.recurring?.interval || null,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const liveSecret = getStripeSecret('live');
    const testSecret = getStripeSecret('test');
    const stripe = new Stripe(liveSecret, { apiVersion: '2025-02-24.acacia' });
    const account = await stripe.accounts.retrieve();

    const livePrices = await Promise.all([
      verifyPrice(stripe, 'live', 'Starter', 'setup'),
      verifyPrice(stripe, 'live', 'Growth', 'setup'),
      verifyPrice(stripe, 'live', 'Starter', 'monthly'),
      verifyPrice(stripe, 'live', 'Growth', 'monthly'),
    ]);

    return Response.json({
      secret_name_verified: 'STRIPE_SECRET_KEY',
      old_key_removed_from_audit: true,
      loaded_live_key_ends_with_xblj27: liveSecret.endsWith('XBLj27'),
      live_key: {
        valid: true,
        account_id: account.id,
        mode: 'live',
      },
      live_prices: livePrices,
      mode_safety: {
        live_uses_secret: 'STRIPE_SECRET_KEY',
        live_uses_price_prefix: 'STRIPE_',
        test_uses_secret: 'STRIPE_TEST_SECRET_KEY',
        test_uses_price_prefix: 'STRIPE_TEST_',
        live_key_is_live: liveSecret.startsWith('sk_live_'),
        test_key_is_test: testSecret.startsWith('sk_test_'),
        no_stripe_api_key_fallback_in_audit: true,
      },
      live_ready: !liveSecret.endsWith('XBLj27') && livePrices.every((price) => price.valid && price.livemode === true),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});