import Stripe from 'stripe';

function clean(value) {
  return String(value || '').trim();
}

function getSupabaseConfig() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server configuration missing');
  return { url, key };
}

async function supabaseRequest(path, options = {}) {
  const { url, key } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: options.prefer || 'return=representation',
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.message || text || response.statusText);
  return data;
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.method === 'POST' ? (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}) : req.query || {};
    const sessionId = clean(body.sessionId || body.session_id);
    if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) throw new Error('Stripe server configuration missing');

    const stripe = new Stripe(stripeKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['customer', 'subscription'] });

    const leadId = session.metadata?.lead_id || session.metadata?.leadId || '';
    let lead = null;
    let client = null;

    if (leadId) {
      const leads = await supabaseRequest(`/leads?id=eq.${encodeURIComponent(leadId)}&limit=1`, { method: 'GET' });
      lead = Array.isArray(leads) ? leads[0] || null : null;
      if (lead?.client_id) {
        const clients = await supabaseRequest(`/clients?id=eq.${encodeURIComponent(lead.client_id)}&limit=1`, { method: 'GET' });
        client = Array.isArray(clients) ? clients[0] || null : null;
      }
    }

    const clientId = client?.id || lead?.client_id || '';
    return res.status(200).json({
      success: true,
      session_id: session.id,
      payment_status: session.payment_status,
      status: session.status,
      lead_id: leadId || lead?.id || '',
      client_id: clientId,
      onboarding_status: clientId ? 'ready' : 'pending',
      customer_email: session.customer_details?.email || session.customer_email || lead?.email || '',
      selected_plan: session.metadata?.selected_plan || lead?.selected_plan || ''
    });
  } catch (error) {
    return res.status(500).json({ error: 'Checkout status lookup failed', details: error.message });
  }
}
