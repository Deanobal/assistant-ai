import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@18.4.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || Deno.env.get('STRIPE_API_KEY') || Deno.env.get('STRIPE_TEST_SECRET_KEY'), {
  apiVersion: '2025-02-24.acacia',
});

function clean(value) {
  return String(value || '').trim();
}

async function logEvent(base44, event, status, errorMessage = null, relatedClientId = null) {
  const existing = await base44.asServiceRole.entities.StripeEventLog.filter({ stripe_event_id: event.id }, '-updated_date', 1);
  const payload = {
    stripe_event_id: event.id,
    event_type: event.type,
    processed_at: new Date().toISOString(),
    status,
    related_client_id: relatedClientId,
    error_message: errorMessage,
  };
  return existing[0]
    ? base44.asServiceRole.entities.StripeEventLog.update(existing[0].id, { ...existing[0], ...payload })
    : base44.asServiceRole.entities.StripeEventLog.create(payload);
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
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();
    const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || Deno.env.get('STRIPE_TEST_WEBHOOK_SECRET');
    const event = await stripe.webhooks.constructEventAsync(body, signature, secret);

    const duplicate = await base44.asServiceRole.entities.StripeEventLog.filter({ stripe_event_id: event.id }, '-updated_date', 1);
    if (duplicate[0]?.status === 'processed') {
      return Response.json({ received: true, skipped: true });
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

      await logEvent(base44, event, 'processed', null, result?.data?.client_id || null);
      return Response.json({ received: true, event_type: event.type, result: result?.data });
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object;
      const leadId = clean(session.metadata?.lead_id || session.metadata?.leadId);
      await updateLeadPayment(base44, leadId, 'cancelled', 'Follow up after abandoned checkout');
      await notifyFollowUp(base44, leadId, 'Checkout expired', 'A qualified buyer did not complete checkout. Follow up quickly.');
      await logEvent(base44, event, 'processed');
      return Response.json({ received: true, event_type: event.type });
    }

    if (event.type === 'payment_intent.payment_failed' || event.type === 'invoice.payment_failed') {
      const object = event.data.object;
      const leadId = clean(object.metadata?.lead_id || object.metadata?.leadId);
      await updateLeadPayment(base44, leadId, 'failed', 'Follow up after failed payment');
      await notifyFollowUp(base44, leadId, 'Payment failed', 'A qualified buyer payment failed. Follow up and help them complete signup.');
      await logEvent(base44, event, 'processed');
      return Response.json({ received: true, event_type: event.type });
    }

    await logEvent(base44, event, 'skipped');
    return Response.json({ received: true, event_type: event.type, ignored: true });
  } catch (error) {
    console.error('handleStripeWebhook failed', error);
    return Response.json({ error: error.message }, { status: 400 });
  }
});