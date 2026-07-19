const PLAN_CONFIG = {
  Starter: { key: 'starter', name: 'Starter', setupFee: 1500, monthlyFee: 497 },
  Growth: { key: 'growth', name: 'Growth', setupFee: 3000, monthlyFee: 1500 },
  Enterprise: { key: 'enterprise', name: 'Enterprise', setupFee: 7500, monthlyFee: 3000 },
};

function getConfig() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server configuration missing');
  return { url: String(url).replace(/\/$/, ''), key };
}

function getStripeMode() {
  return String(process.env.STRIPE_MODE || '').trim().toLowerCase() === 'live' ? 'live' : 'test';
}

function getStripeSecret() {
  const mode = getStripeMode();
  const key = mode === 'live' ? process.env.STRIPE_SECRET_KEY : process.env.STRIPE_TEST_SECRET_KEY;
  const secret = String(key || '').trim();
  if (!secret) throw new Error(`Missing Stripe ${mode} secret key`);
  if (mode === 'live' && !secret.startsWith('sk_live_')) throw new Error('STRIPE_MODE=live requires STRIPE_SECRET_KEY to be a live key');
  if (mode === 'test' && !secret.startsWith('sk_test_')) throw new Error('STRIPE_MODE=test requires STRIPE_TEST_SECRET_KEY to be a test key');
  return secret;
}

function headers(key, prefer = 'return=representation') {
  return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: prefer };
}

function encode(value) {
  return encodeURIComponent(String(value ?? ''));
}

function normalizePlan(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (raw.includes('enterprise')) return 'Enterprise';
  if (raw.includes('growth')) return 'Growth';
  return 'Starter';
}

async function db(table, { method = 'GET', query = '', body, prefer } = {}) {
  const { url, key } = getConfig();
  const path = query ? `${table}?${query}` : table;
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: headers(key, prefer),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.message || data?.error || response.statusText || 'Database request failed');
  return data;
}

function first(rows) {
  return Array.isArray(rows) ? rows[0] || null : rows;
}

async function stripeRequest(path, params) {
  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getStripeSecret()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || 'Stripe request failed');
  return data;
}

function appendLineItem(params, index, { name, amount, recurring }) {
  params.append(`line_items[${index}][quantity]`, '1');
  params.append(`line_items[${index}][price_data][currency]`, 'aud');
  params.append(`line_items[${index}][price_data][unit_amount]`, String(amount * 100));
  params.append(`line_items[${index}][price_data][product_data][name]`, name);
  if (recurring) params.append(`line_items[${index}][price_data][recurring][interval]`, 'month');
}

async function createCheckout({ clientId, origin }) {
  if (!clientId || !origin) throw new Error('clientId and origin are required');
  const client = first(await db('clients', { query: `id=eq.${encode(clientId)}&limit=1` }));
  if (!client) throw new Error('Client not found');
  const plan = PLAN_CONFIG[normalizePlan(client.plan)] || PLAN_CONFIG.Starter;
  const billing = first(await db('billing_status', { query: `client_id=eq.${encode(clientId)}&limit=1` }));

  const params = new URLSearchParams();
  params.append('mode', 'subscription');
  params.append('success_url', `${origin}/GetStartedNow?plan=${plan.key}&checkout=success&session_id={CHECKOUT_SESSION_ID}`);
  params.append('cancel_url', `${origin}/GetStartedNow?plan=${plan.key}&checkout=cancelled`);
  if (billing?.stripe_customer_id) params.append('customer', billing.stripe_customer_id);
  else if (client.email) params.append('customer_email', client.email);
  params.append('metadata[clientId]', client.id);
  params.append('metadata[planKey]', plan.key);
  params.append('metadata[planName]', plan.name);
  params.append('metadata[source]', 'admin_billing_action');
  params.append('subscription_data[metadata][clientId]', client.id);
  params.append('subscription_data[metadata][planKey]', plan.key);
  params.append('subscription_data[metadata][planName]', plan.name);
  params.append('subscription_data[metadata][source]', 'admin_billing_action');
  appendLineItem(params, 0, { name: `${plan.name} Setup Fee`, amount: plan.setupFee, recurring: false });
  appendLineItem(params, 1, { name: `${plan.name} Monthly Management`, amount: plan.monthlyFee, recurring: true });

  const session = await stripeRequest('/checkout/sessions', params);
  const now = new Date().toISOString();
  const billingPatch = {
    plan: plan.name,
    setup_fee: plan.setupFee,
    monthly_fee: plan.monthlyFee,
    billing_status: 'awaiting_payment',
    invoice_reference: session.id,
    stripe_checkout_session_id: session.id,
    notes: 'Stripe payment link created by admin.',
    admin_override: false,
    updated_at: now,
  };

  if (billing?.id) await db('billing_status', { method: 'PATCH', query: `id=eq.${encode(billing.id)}`, body: billingPatch });
  else await db('billing_status', { method: 'POST', body: [{ client_id: client.id, payment_method: '', renewal_date: null, stripe_customer_id: null, stripe_subscription_id: null, ...billingPatch, created_at: now }] });

  await db('clients', { method: 'PATCH', query: `id=eq.${encode(client.id)}`, body: { last_activity: 'Stripe payment link created', updated_at: now } });
  return { success: true, checkout_url: session.url, session_id: session.id };
}

async function overrideBilling({ clientId, billingStatus = 'active' }) {
  if (!clientId) throw new Error('clientId is required');
  const client = first(await db('clients', { query: `id=eq.${encode(clientId)}&limit=1` }));
  if (!client) throw new Error('Client not found');
  const plan = PLAN_CONFIG[normalizePlan(client.plan)] || PLAN_CONFIG.Starter;
  const billing = first(await db('billing_status', { query: `client_id=eq.${encode(clientId)}&limit=1` }));
  const now = new Date().toISOString();
  const patch = {
    plan: plan.name,
    setup_fee: plan.setupFee,
    monthly_fee: plan.monthlyFee,
    billing_status: billingStatus,
    admin_override: true,
    notes: 'Billing marked active by admin override.',
    updated_at: now,
  };
  const record = billing?.id
    ? first(await db('billing_status', { method: 'PATCH', query: `id=eq.${encode(billing.id)}`, body: patch }))
    : first(await db('billing_status', { method: 'POST', body: [{ client_id: client.id, payment_method: 'admin_override', invoice_reference: '', renewal_date: null, stripe_customer_id: null, stripe_subscription_id: null, stripe_checkout_session_id: null, created_at: now, ...patch }] }));
  await db('clients', {
    method: 'PATCH',
    query: `id=eq.${encode(client.id)}`,
    body: {
      status: client.status === 'Awaiting Payment' ? 'Onboarding' : client.status,
      workflow_phase: client.workflow_phase === 'Payment' ? 'Kickoff' : client.workflow_phase,
      next_action: client.next_action === 'Complete: confirm setup payment received' ? 'Complete: complete business intake' : client.next_action,
      last_activity: 'Billing marked active by admin override',
      updated_at: now,
    },
  });
  return { success: true, billing: record };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    let data;
    if (body.action === 'adminCreateStripeCheckout') data = await createCheckout(body);
    else if (body.action === 'adminOverrideBillingStatus') data = await overrideBilling(body);
    else return res.status(400).json({ success: false, error: 'Unsupported billing action' });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Native billing action failed', details: error.message });
  }
}
