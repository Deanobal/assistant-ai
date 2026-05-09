import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@18.4.0';

function clean(value) {
  return String(value || '').trim();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const sessionId = clean(payload.session_id);
    if (!sessionId) return Response.json({ error: 'session_id is required' }, { status: 400 });
    if (!sessionId.startsWith('cs_test_')) return Response.json({ error: 'Only cs_test sessions can be expired by this helper' }, { status: 400 });

    const secret = clean(Deno.env.get('STRIPE_TEST_SECRET_KEY'));
    if (!secret || secret.startsWith('sk_live_')) return Response.json({ error: 'Valid STRIPE_TEST_SECRET_KEY is required' }, { status: 400 });

    const stripe = new Stripe(secret, { apiVersion: '2025-02-24.acacia' });
    const session = await stripe.checkout.sessions.expire(sessionId);
    const leadMatches = await base44.asServiceRole.entities.Lead.filter({ checkout_session_id: sessionId }, '-updated_date', 1);
    const lead = leadMatches[0] || null;
    if (lead) {
      await base44.asServiceRole.entities.Lead.update(lead.id, {
        ...lead,
        payment_status: 'cancelled',
        last_activity_at: new Date().toISOString(),
        next_action: 'Follow up after cancelled checkout',
      });
    }

    return Response.json({ success: true, session_id: session.id, status: session.status, lead_id: lead?.id || null });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});