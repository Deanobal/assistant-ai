import { randomInt } from 'node:crypto';
import Stripe from 'stripe';

export const PLAN_CONFIG = {
  starter: {
    selected_plan: 'Starter',
    setup_price_env: 'STRIPE_STARTER_SETUP_PRICE_ID',
    monthly_price_env: 'STRIPE_STARTER_PRICE_ID'
  },
  growth: {
    selected_plan: 'Growth',
    setup_price_env: 'STRIPE_GROWTH_SETUP_PRICE_ID',
    monthly_price_env: 'STRIPE_GROWTH_PRICE_ID'
  }
};

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body || '{}');
    } catch (_error) {
      return {};
    }
  }
  return req.body;
}

function siteBaseUrl(req) {
  const configured = process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (configured) {
    return configured.startsWith('http') ? configured : `https://${configured}`;
  }
  if (process.env.NODE_ENV === 'production') return 'https://www.assistantai.com.au';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:5173';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  return `${proto}://${host}`;
}

export function integrationIdentifier() {
  const suffix = Array.from({ length: 8 }, () => String.fromCharCode(97 + randomInt(0, 26))).join('');
  return `assistantai_${suffix}`;
}

async function updateLeadPaymentPending({ leadId, selectedPlan, checkoutUrl, sessionId }) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!leadId || !url || !key) return null;

  const response = await fetch(`${url}/rest/v1/leads?id=eq.${encodeURIComponent(leadId)}`, {
    method: 'PATCH',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify({
      selected_plan: selectedPlan,
      likely_plan_fit: selectedPlan,
      checkout_url: checkoutUrl,
      checkout_session_id: sessionId,
      checkout_created_at: new Date().toISOString(),
      status: 'Payment Pending',
      payment_status: 'pending'
    })
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(data?.message || 'Supabase lead payment update failed');
  }
  return Array.isArray(data) ? data[0] : data;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return res.status(500).json({ error: 'Stripe server configuration missing' });
    }

    const body = parseBody(req);
    const planInput = String(body.selected_plan || body.plan || '').trim().toLowerCase();
    const config = PLAN_CONFIG[planInput];

    if (!config) {
      return res.status(400).json({
        success: false,
        checkout_available: false,
        status: 'review_required',
        message: 'Instant checkout is only available for Starter and Growth. Enterprise requires review.'
      });
    }

    const setupPriceId = process.env[config.setup_price_env];
    const monthlyPriceId = process.env[config.monthly_price_env];

    if (!setupPriceId || !monthlyPriceId) {
      return res.status(500).json({ error: 'Stripe price configuration missing' });
    }

    const leadId = String(body.lead_id || '').trim();
    const fullName = String(body.full_name || body.name || '').trim();
    const businessName = String(body.business_name || '').trim();
    const email = String(body.email || '').trim();
    const baseUrl = siteBaseUrl(req);

    const identifier = integrationIdentifier();
    const metadata = {
      selected_plan: config.selected_plan,
      integration_identifier: identifier,
      ...(leadId ? { lead_id: leadId } : {}),
      ...(fullName ? { name: fullName } : {}),
      ...(businessName ? { business_name: businessName } : {}),
      ...(email ? { email } : {}),
    };
    const stripe = new Stripe(stripeKey, { apiVersion: '2026-06-24.dahlia' });
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      success_url: `${baseUrl}/thank-you?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/GetStartedNow?plan=${encodeURIComponent(config.selected_plan.toLowerCase())}&checkout=cancelled`,
      line_items: [
        { price: setupPriceId, quantity: 1 },
        { price: monthlyPriceId, quantity: 1 },
      ],
      metadata,
      subscription_data: { metadata },
      ...(leadId ? { client_reference_id: leadId } : {}),
      ...(email ? { customer_email: email } : {}),
    });

    const updatedLead = await updateLeadPaymentPending({
      leadId,
      selectedPlan: config.selected_plan,
      checkoutUrl: session.url,
      sessionId: session.id
    });

    return res.status(200).json({
      success: true,
      checkout_url: session.url,
      session_id: session.id,
      selected_plan: config.selected_plan,
      lead: updatedLead
    });
  } catch (error) {
    console.error('Stripe checkout route failed:', error.message);
    return res.status(500).json({ error: 'Stripe checkout route failed' });
  }
}
