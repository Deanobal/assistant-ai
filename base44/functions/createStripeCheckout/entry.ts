import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@18.4.0';

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY'), {
  apiVersion: '2025-02-24.acacia',
});

const PLAN_CONFIG = {
  starter: { name: 'Starter', setupFee: 1500, monthlyFee: 497 },
  growth: { name: 'Growth', setupFee: 3000, monthlyFee: 1500 },
};

function buildClientBase(payload, plan) {
  return {
    business_name: payload.businessName || payload.fullName,
    contact_name: payload.fullName,
    email: payload.email,
    phone: payload.mobile || '',
    industry: payload.industry || 'other',
    plan_name: plan.name,
    status: 'Onboarding',
    monthly_fee: plan.monthlyFee,
    setup_fee_status: 'pending',
    billing_status: 'pending',
    last_activity: 'Stripe checkout started',
    portal_access: false,
    requires_follow_up: true,
    active_services: [],
  };
}

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

    const emailLeadMatches = await base44.asServiceRole.entities.Lead.filter({ email: payload.email }, '-updated_date', 10);
    let lead = emailLeadMatches.find((item) => item.id === payload.leadId) || emailLeadMatches[0] || null;

    if (!lead) {
      lead = await base44.asServiceRole.entities.Lead.create({
        full_name: payload.fullName,
        business_name: payload.businessName || payload.fullName,
        email: payload.email,
        mobile_number: payload.mobile || '',
        industry: payload.industry || 'other',
        enquiry_type: 'other',
        monthly_enquiry_volume: '',
        source_page: '/GetStartedNow',
        message: `${plan.name} direct-start checkout created.`,
        created_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
        status: 'Onboarding',
        next_action: 'Stripe checkout created. Monitor payment and onboarding progress.',
        booking_intent: false,
        booking_source: `direct_start_${payload.planKey}`,
        notes: `[${new Date().toISOString()}] Lead created automatically for Stripe checkout.`,
      });
    }

    const clientMatches = await base44.asServiceRole.entities.ClientAccount.filter({ lead_id: lead.id }, '-updated_date', 1);
    const existingClient = clientMatches[0];
    const clientRecord = existingClient
      ? await base44.asServiceRole.entities.ClientAccount.update(existingClient.id, {
          ...existingClient,
          ...buildClientBase(payload, plan),
          lead_id: lead.id,
        })
      : await base44.asServiceRole.entities.ClientAccount.create({
          ...buildClientBase(payload, plan),
          lead_id: lead.id,
        });


    const billingMatches = await base44.asServiceRole.entities.BillingRecord.filter({ client_id: clientRecord.id }, '-updated_date', 1);
    const existingBilling = billingMatches[0];

    let stripeCustomerId = existingBilling?.stripe_customer_id || null;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        name: payload.fullName,
        email: payload.email,
        phone: payload.mobile || undefined,
        metadata: {
          leadId: lead.id,
          clientAccountId: clientRecord.id,
          planKey: payload.planKey,
          planName: plan.name,
        },
      });
      stripeCustomerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      success_url: `${payload.origin}/GetStartedNow?plan=${payload.planKey}&checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${payload.origin}/GetStartedNow?plan=${payload.planKey}&checkout=cancelled`,
      allow_promotion_codes: false,
      metadata: {
        leadId: lead.id,
        clientAccountId: clientRecord.id,
        planKey: payload.planKey,
        planName: plan.name,
        origin: payload.origin,
      },
      subscription_data: {
        metadata: {
          leadId: lead.id,
          clientAccountId: clientRecord.id,
          planKey: payload.planKey,
          planName: plan.name,
          origin: payload.origin,
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

    const billingBase = {
      client_id: clientRecord.id,
      plan_name: plan.name,
      setup_fee_amount: plan.setupFee,
      monthly_fee_amount: plan.monthlyFee,
      billing_status: 'pending',
      payment_method_status: 'pending',
      invoice_reference: session.id,
      stripe_customer_id: stripeCustomerId,
      stripe_checkout_session_id: session.id,
      stripe_subscription_id: existingBilling?.stripe_subscription_id || null,
      last_payment_date: existingBilling?.last_payment_date || null,
      next_payment_date: existingBilling?.next_payment_date || null,
      ...(existingBilling?.renewal_date ? { renewal_date: existingBilling.renewal_date } : {}),
    };

    const billingStatusMatches = await base44.asServiceRole.entities.BillingStatus.filter({ client_id: clientRecord.id }, '-updated_date', 1);
    const existingBillingStatus = billingStatusMatches[0] || null;
    const billingStatusBase = {
      client_id: clientRecord.id,
      plan: plan.name,
      setup_fee: plan.setupFee,
      monthly_fee: plan.monthlyFee,
      billing_status: 'awaiting_payment',
      payment_method: stripeCustomerId,
      invoice_reference: session.id,
      renewal_date: existingBillingStatus?.renewal_date || null,
      notes: 'Stripe checkout created and waiting for payment confirmation.',
    };

    if (existingBilling) {
      await base44.asServiceRole.entities.BillingRecord.update(existingBilling.id, {
        ...existingBilling,
        ...billingBase,
      });
    } else {
      await base44.asServiceRole.entities.BillingRecord.create(billingBase);
    }

    if (existingBillingStatus) {
      await base44.asServiceRole.entities.BillingStatus.update(existingBillingStatus.id, {
        ...existingBillingStatus,
        ...billingStatusBase,
      });
    } else {
      await base44.asServiceRole.entities.BillingStatus.create(billingStatusBase);
    }

    await base44.asServiceRole.entities.Lead.update(lead.id, {
      ...lead,
      status: 'Onboarding',
      next_action: 'Stripe checkout created. Monitor payment and onboarding progress.',
      notes: lead.notes ? `${lead.notes}\n\n[${new Date().toISOString()}] Stripe checkout created for ${plan.name}.` : `[${new Date().toISOString()}] Stripe checkout created for ${plan.name}.`,
    });

    return Response.json({
      success: true,
      session_id: session.id,
      checkout_url: session.url,
      title: 'Continue to Secure Checkout',
      message: `Your ${plan.name} onboarding start has been saved. Continue to Stripe to pay the setup fee and begin your monthly plan.`,
      actionLabel: 'Open Secure Checkout',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});