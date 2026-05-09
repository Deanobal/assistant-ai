import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@18.4.0';

function getStripeMode() {
  const mode = clean(Deno.env.get('STRIPE_MODE')).toLowerCase();
  return mode === 'live' ? 'live' : 'test';
}

function getStripeSecret(mode) {
  const secret = mode === 'test'
    ? clean(Deno.env.get('STRIPE_TEST_SECRET_KEY'))
    : clean(Deno.env.get('STRIPE_SECRET_KEY') || Deno.env.get('STRIPE_API_KEY'));
  if (!secret) throw new Error(`Missing Stripe ${mode} secret key`);
  if (mode === 'test' && secret.startsWith('sk_live_')) throw new Error('STRIPE_MODE=test cannot use a live Stripe key');
  if (mode === 'live' && secret.startsWith('sk_test_')) throw new Error('STRIPE_MODE=live cannot use a test Stripe key');
  return secret;
}

function getStripeWebhookSecret(mode) {
  const secret = mode === 'test' ? clean(Deno.env.get('STRIPE_TEST_WEBHOOK_SECRET')) : clean(Deno.env.get('STRIPE_WEBHOOK_SECRET'));
  if (!secret) throw new Error(`Missing Stripe ${mode} webhook secret`);
  return secret;
}

function getStripeClient(mode) {
  return new Stripe(getStripeSecret(mode), { apiVersion: '2025-02-24.acacia' });
}

function clean(value) {
  return String(value || '').trim();
}

function getObjectId(event) {
  const object = event.data?.object || {};
  return object.id || null;
}

function getLeadIdFromEvent(event) {
  const object = event.data?.object || {};
  return clean(object.metadata?.lead_id || object.metadata?.leadId);
}

async function prepareEventLog(base44, event) {
  const existing = await base44.asServiceRole.entities.StripeEventLog.filter({ stripe_event_id: event.id }, '-updated_date', 1);
  const current = existing[0] || null;

  if (current?.processing_status === 'event_processed_successfully') {
    return { logRecord: current, shouldSkip: true };
  }

  const now = new Date().toISOString();
  const payload = {
    ...(current || {}),
    stripe_event_id: event.id,
    event_type: event.type,
    checkout_session_id: event.type === 'checkout.session.completed' || event.type === 'checkout.session.expired' ? getObjectId(event) : current?.checkout_session_id || null,
    lead_id: getLeadIdFromEvent(event) || current?.lead_id || null,
    processing_status: 'event_processing',
    processing_started_at: now,
    processing_completed_at: null,
    business_result: null,
    error_message: null,
    retry_count: current ? Number(current.retry_count || 0) + 1 : 0,
    processed_at: null,
    status: 'processing',
  };

  const logRecord = current
    ? await base44.asServiceRole.entities.StripeEventLog.update(current.id, payload)
    : await base44.asServiceRole.entities.StripeEventLog.create(payload);

  return { logRecord, shouldSkip: false };
}

async function markEventLogSuccess(base44, logRecord, event, result, relatedClientId = null) {
  const now = new Date().toISOString();
  return base44.asServiceRole.entities.StripeEventLog.update(logRecord.id, {
    ...logRecord,
    stripe_event_id: event.id,
    event_type: event.type,
    processing_status: 'event_processed_successfully',
    processing_completed_at: now,
    processed_at: now,
    status: 'processed',
    related_client_id: relatedClientId,
    business_result: result || {},
    error_message: null,
  });
}

async function markEventLogFailed(base44, logRecord, error) {
  if (!logRecord) return null;
  const now = new Date().toISOString();
  return base44.asServiceRole.entities.StripeEventLog.update(logRecord.id, {
    ...logRecord,
    processing_status: 'event_failed',
    processing_completed_at: now,
    processed_at: now,
    status: 'failed',
    error_message: error.message,
  });
}

async function updateLeadPayment(base44, leadId, paymentStatus, nextAction) {
  if (!leadId) return null;
  const matches = await base44.asServiceRole.entities.Lead.filter({ id: leadId }, '-updated_date', 1);
  const lead = matches[0];
  if (!lead) return null;
  return base44.asServiceRole.entities.Lead.update(lead.id, {
    ...lead,
    payment_status: paymentStatus,
    status: paymentStatus === 'paid' ? 'Won' : lead.status,
    last_activity_at: new Date().toISOString(),
    next_action: nextAction,
  });
}

async function notifyFollowUp(base44, leadId, title, message) {
  if (!leadId) return null;
  return base44.asServiceRole.functions.invoke('sendAdminAlert', {
    event_type: 'billing_status_changed',
    entity_name: 'Lead',
    entity_id: leadId,
    title,
    message,
    channels: ['in_app', 'email'],
  });
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  try {
    const stripeMode = getStripeMode();
    const stripe = getStripeClient(stripeMode);
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(body, signature, getStripeWebhookSecret(stripeMode));

    const { logRecord, shouldSkip } = await prepareEventLog(base44, event);
    if (shouldSkip) {
      return Response.json({ received: true, skipped: true, reason: 'already_processed_successfully' });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const metadata = session.metadata || {};
      const leadId = clean(metadata.lead_id || metadata.leadId);
      const subscriptionConfigured = metadata.subscription_configured !== 'false';
      const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id || '';
      let renewalDate = null;

      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        renewalDate = subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString().slice(0, 10) : null;
      }

      const result = await base44.asServiceRole.functions.invoke('startClientOnboardingFromPaidLead', {
        lead_id: leadId,
        plan: metadata.plan,
        checkout_session_id: session.id,
        stripe_customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id || '',
        stripe_subscription_id: subscriptionId,
        renewal_date: renewalDate,
        subscription_configured: subscriptionConfigured,
      });

      await markEventLogSuccess(base44, logRecord, event, result?.data, result?.data?.client_id || null);
      return Response.json({ received: true, event_type: event.type, result: result?.data });
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object;
      const leadId = clean(session.metadata?.lead_id || session.metadata?.leadId);
      await updateLeadPayment(base44, leadId, 'cancelled', 'Follow up after abandoned checkout');
      await notifyFollowUp(base44, leadId, 'Checkout expired', 'A qualified buyer did not complete checkout. Follow up quickly.');
      await markEventLogSuccess(base44, logRecord, event, { cancelled: true });
      return Response.json({ received: true, event_type: event.type });
    }

    if (event.type === 'payment_intent.succeeded' || event.type === 'invoice.payment_succeeded') {
      await markEventLogSuccess(base44, logRecord, event, { acknowledged: true });
      return Response.json({ received: true, event_type: event.type });
    }

    if (event.type === 'payment_intent.payment_failed' || event.type === 'invoice.payment_failed') {
      const object = event.data.object;
      const leadId = clean(object.metadata?.lead_id || object.metadata?.leadId);
      await updateLeadPayment(base44, leadId, 'failed', 'Follow up after failed payment');
      await notifyFollowUp(base44, leadId, 'Payment failed', 'A qualified buyer payment failed. Follow up and help them complete signup.');
      await markEventLogSuccess(base44, logRecord, event, { payment_failed: true });
      return Response.json({ received: true, event_type: event.type });
    }

    await markEventLogSuccess(base44, logRecord, event, { ignored: true });
    return Response.json({ received: true, event_type: event.type, ignored: true });
  } catch (error) {
    console.error('handleStripeWebhook failed', error);
    try {
      const stripeMode = getStripeMode();
      const stripe = getStripeClient(stripeMode);
      const signature = req.headers.get('stripe-signature');
      const body = await req.clone().text();
      const event = await stripe.webhooks.constructEventAsync(body, signature, getStripeWebhookSecret(stripeMode));
      const existing = await base44.asServiceRole.entities.StripeEventLog.filter({ stripe_event_id: event.id }, '-updated_date', 1);
      if (existing[0]) await markEventLogFailed(base44, existing[0], error);
    } catch {
      // Signature or body may already be consumed; return original error.
    }
    return Response.json({ error: error.message }, { status: 400 });
  }
});