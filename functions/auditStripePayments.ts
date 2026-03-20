import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import Stripe from 'npm:stripe@18.4.0';

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY'), {
  apiVersion: '2025-02-24.acacia',
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const webhookEndpoints = await stripe.webhookEndpoints.list({ limit: 20 });
    const checkoutEndpoints = webhookEndpoints.data.filter((endpoint) =>
      endpoint.url?.toLowerCase().includes('stripewebhook') || endpoint.enabled_events?.includes('checkout.session.completed')
    );

    const eventTypes = [
      'checkout.session.completed',
      'invoice.paid',
      'invoice.payment_failed',
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
    ];

    const eventLists = await Promise.all(
      eventTypes.map((type) => stripe.events.list({ type, limit: 5 }))
    );

    const recentEvents = eventLists
      .flatMap((result) => result.data)
      .sort((a, b) => b.created - a.created)
      .slice(0, 20)
      .map((event) => ({
        id: event.id,
        type: event.type,
        created: new Date(event.created * 1000).toISOString(),
        pending_webhooks: event.pending_webhooks,
        livemode: event.livemode,
        customer_id: typeof event.data?.object?.customer === 'string'
          ? event.data.object.customer
          : event.data?.object?.customer?.id || null,
        session_id: event.type === 'checkout.session.completed'
          ? event.data?.object?.id || null
          : null,
        subscription_id: typeof event.data?.object?.subscription === 'string'
          ? event.data.object.subscription
          : event.data?.object?.subscription?.id || null,
        metadata: event.data?.object?.metadata || {},
      }));

    const completedCheckout = recentEvents.find((event) => event.type === 'checkout.session.completed') || null;

    const [billingRecords, leads, clients, onboardings, notifications] = await Promise.all([
      base44.asServiceRole.entities.BillingRecord.list('-updated_date', 50),
      base44.asServiceRole.entities.Lead.list('-updated_date', 50),
      base44.asServiceRole.entities.ClientAccount.list('-updated_date', 50),
      base44.asServiceRole.entities.Onboarding.list('-updated_date', 50),
      base44.asServiceRole.entities.NotificationLog.list('-updated_date', 50),
    ]);

    const matchingBilling = completedCheckout
      ? billingRecords.find((record) =>
          record.stripe_checkout_session_id === completedCheckout.session_id ||
          record.stripe_customer_id === completedCheckout.customer_id ||
          record.stripe_subscription_id === completedCheckout.subscription_id
        ) || null
      : null;

    const matchingLead = matchingBilling?.client_id
      ? leads.find((lead) => lead.client_account_id === matchingBilling.client_id) || null
      : completedCheckout?.metadata?.leadId
        ? leads.find((lead) => lead.id === completedCheckout.metadata.leadId) || null
        : null;

    const matchingClient = matchingBilling?.client_id
      ? clients.find((client) => client.id === matchingBilling.client_id) || null
      : completedCheckout?.metadata?.clientAccountId
        ? clients.find((client) => client.id === completedCheckout.metadata.clientAccountId) || null
        : null;

    const matchingOnboarding = matchingClient
      ? onboardings.find((item) => item.client_account_id === matchingClient.id) || null
      : null;

    const matchingNotifications = matchingClient
      ? notifications.filter((item) => item.client_account_id === matchingClient.id).slice(0, 5)
      : [];

    const webhookConfigured = checkoutEndpoints.length > 0;
    const webhookDeliveryInferred = !!(completedCheckout && matchingBilling && matchingOnboarding);

    return Response.json({
      webhook_endpoints: checkoutEndpoints.map((endpoint) => ({
        id: endpoint.id,
        url: endpoint.url,
        status: endpoint.status,
        enabled_events: endpoint.enabled_events,
      })),
      webhook_configured: webhookConfigured,
      recent_events: recentEvents,
      latest_checkout_session_completed: completedCheckout,
      webhook_delivery_inferred: webhookDeliveryInferred,
      records: {
        billing_record: matchingBilling,
        lead: matchingLead,
        client: matchingClient,
        onboarding: matchingOnboarding,
        notification_logs: matchingNotifications,
      },
      manual_setup_remaining: [
        !webhookConfigured ? 'Stripe webhook endpoint still needs to be configured in Stripe.' : null,
        !completedCheckout ? 'No real checkout.session.completed event has been found yet.' : null,
        completedCheckout && !matchingBilling ? 'A completed checkout exists but no matching BillingRecord was found.' : null,
        completedCheckout && matchingBilling && !matchingOnboarding ? 'A completed checkout exists but no linked Onboarding record was found.' : null,
      ].filter(Boolean),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});