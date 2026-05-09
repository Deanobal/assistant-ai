import Stripe from 'npm:stripe@18.4.0';

function clean(value) {
  return String(value || '').trim();
}

function getStripeMode() {
  const mode = clean(Deno.env.get('STRIPE_MODE')).toLowerCase();
  return mode === 'live' ? 'live' : 'test';
}

function getStripeSecret(mode) {
  const secret = mode === 'test' ? clean(Deno.env.get('STRIPE_TEST_SECRET_KEY')) : clean(Deno.env.get('STRIPE_SECRET_KEY') || Deno.env.get('STRIPE_API_KEY'));
  if (!secret) throw new Error(`Missing Stripe ${mode} secret key`);
  if (mode === 'test' && secret.startsWith('sk_live_')) throw new Error('STRIPE_MODE=test cannot use a live Stripe key');
  if (mode === 'live' && secret.startsWith('sk_test_')) throw new Error('STRIPE_MODE=live cannot use a test Stripe key');
  return secret;
}

function getWebhookSecret(mode) {
  const secret = mode === 'test' ? clean(Deno.env.get('STRIPE_TEST_WEBHOOK_SECRET')) : clean(Deno.env.get('STRIPE_WEBHOOK_SECRET'));
  if (!secret) throw new Error(`Missing Stripe ${mode} webhook secret`);
  return secret;
}

Deno.serve(async () => {
  try {
    const mode = getStripeMode();
    const stripe = new Stripe(getStripeSecret(mode), { apiVersion: '2025-02-24.acacia' });
    const payload = JSON.stringify({
      id: `evt_${mode}_signature_verification`,
      object: 'event',
      api_version: '2025-02-24.acacia',
      created: Math.floor(Date.now() / 1000),
      livemode: mode === 'live',
      type: 'payment_intent.succeeded',
      data: { object: { id: `pi_${mode}_signature_check`, object: 'payment_intent', metadata: {} } },
    });
    const timestamp = Math.floor(Date.now() / 1000);
    const signedPayload = `${timestamp}.${payload}`;
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(getWebhookSecret(mode)), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
    const signature = Array.from(new Uint8Array(signatureBuffer)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
    const header = `t=${timestamp},v1=${signature}`;
    const event = await stripe.webhooks.constructEventAsync(payload, header, getWebhookSecret(mode));
    return Response.json({ success: true, stripe_mode: mode, event_type: event.type, signature_verified: true });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
});