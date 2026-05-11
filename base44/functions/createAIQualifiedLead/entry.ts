import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const VALID_PLANS = new Set(['Starter', 'Growth', 'Enterprise']);
const HOT_INTENTS = new Set(['ready_to_proceed', 'urgent_ready']);

function maskHeader(value) {
  return value ? '[present-redacted]' : '[missing]';
}

function getSafeHeaders(req) {
  return {
    content_type: req.headers.get('content-type') || '',
    user_agent: req.headers.get('user-agent') || '',
    x_webhook_secret: maskHeader(req.headers.get('x-webhook-secret')),
  };
}

function verifyWebhookSecret(req, payload = {}) {
  const receivedSecret = req.headers.get('x-webhook-secret') || payload.x_webhook_secret || payload.webhook_secret || '';
  const expectedSecret = Deno.env.get('VAPI_WEBHOOK_SECRET') || '';
  return {
    secret_received: !!receivedSecret,
    secret_configured: !!expectedSecret,
    secret_valid: !!receivedSecret && !!expectedSecret && receivedSecret === expectedSecret,
  };
}

function jsonToolResponse(body) {
  console.log('Final response:', JSON.stringify(body));
  return Response.json(body, {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function validationError(field) {
  return jsonToolResponse({ success: false, error: `Missing required field: ${field}` });
}

function clean(value) {
  return String(value || '').trim();
}

function normalizePhone(value) {
  return clean(value).replace(/\s+/g, '');
}

function normalizePlan(value, fallback = 'Starter') {
  const plan = clean(value);
  return VALID_PLANS.has(plan) ? plan : fallback;
}

function recommendPlan(payload) {
  const volume = clean(payload.monthly_enquiry_volume);
  const multiLocation = /multi|multiple|2\+|several/i.test(clean(payload.service_needed) + ' ' + clean(payload.conversation_summary));
  const enterpriseSignals = multiLocation || volume === '301_plus' || /compliance|security|department|routing|advanced|custom/i.test(clean(payload.conversation_summary));
  if (enterpriseSignals) return 'Enterprise';

  const growthSignals = payload.wants_booking || payload.wants_crm_sync || payload.wants_sms_followup || payload.wants_email_followup || volume === '101_300' || volume === '21_100';
  return growthSignals ? 'Growth' : 'Starter';
}

async function syncGoHighLevel(base44, lead) {
  if (!clean(Deno.env.get('GHL_API_KEY')) || !clean(Deno.env.get('GHL_LOCATION_ID'))) return null;
  try {
    const res = await base44.asServiceRole.functions.invoke('syncGoHighLevelContact', { entityName: 'Lead', recordId: lead.id });
    return res?.data || null;
  } catch {
    return null;
  }
}

async function notifyHighIntent(base44, lead) {
  const isHighIntent = lead.status === 'Hot Lead' || lead.status === 'Enterprise Review Required';
  if (!isHighIntent) return null;
  try {
    const res = await base44.asServiceRole.functions.invoke('sendAdminAlert', {
      event_type: 'new_lead_created',
      entity_name: 'Lead',
      entity_id: lead.id,
      title: `${lead.status}: ${lead.business_name || lead.full_name}`,
      message: `${lead.full_name} is a ${lead.likely_plan_fit} fit and intent is ${lead.buyer_intent || 'unknown'}. ${lead.conversation_summary || ''}`,
      channels: ['in_app', 'email'],
    });
    return res?.data || null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  let payload = {};
  try {
    console.log('Incoming request headers:', JSON.stringify(getSafeHeaders(req)));
    payload = await req.json();
    console.log('Incoming request body:', JSON.stringify(payload));

    const authResult = verifyWebhookSecret(req, payload);
    console.log('Webhook auth result:', JSON.stringify(authResult));

    if (payload.debug === true) {
      return jsonToolResponse({
        success: true,
        message: 'Vapi endpoint reachable',
        secret_received: authResult.secret_received,
        secret_valid: authResult.secret_valid,
      });
    }

    if (!authResult.secret_valid) {
      return jsonToolResponse({ success: false, error: 'Invalid webhook secret' });
    }

    const base44 = createClientFromRequest(req);
    const now = new Date().toISOString();

    const email = clean(payload.email).toLowerCase();
    const phone = normalizePhone(payload.mobile_number);
    if (!clean(payload.full_name)) return validationError('full_name');
    if (!email && !phone) return validationError('email or mobile_number');

    const existingByEmail = email ? await base44.asServiceRole.entities.Lead.filter({ email }, '-updated_date', 1) : [];
    const existingByPhone = !existingByEmail[0] && phone ? await base44.asServiceRole.entities.Lead.filter({ mobile_number: phone }, '-updated_date', 1) : [];
    const existing = existingByEmail[0] || existingByPhone[0] || null;

    const likelyPlan = normalizePlan(payload.likely_plan_fit, recommendPlan(payload));
    const buyerIntent = clean(payload.buyer_intent) || 'researching';
    const qualificationComplete = !!(payload.full_name && (email || phone) && payload.business_name && payload.monthly_enquiry_volume);
    const status = likelyPlan === 'Enterprise' && HOT_INTENTS.has(buyerIntent)
      ? 'Enterprise Review Required'
      : HOT_INTENTS.has(buyerIntent)
        ? 'Hot Lead'
        : qualificationComplete
          ? 'Qualified Lead'
          : 'New Lead';

    const summaryLine = payload.conversation_summary ? `[${now}] AI qualification: ${clean(payload.conversation_summary)}` : '';
    const notes = [existing?.notes, summaryLine].filter(Boolean).join('\n\n');

    const leadPayload = {
      ...(existing || {}),
      created_at: existing?.created_at || now,
      last_activity_at: now,
      full_name: clean(payload.full_name) || existing?.full_name || 'Unknown Prospect',
      business_name: clean(payload.business_name) || existing?.business_name || '',
      email: email || existing?.email || '',
      mobile_number: phone || existing?.mobile_number || '',
      industry: clean(payload.industry) || existing?.industry || 'other',
      website: clean(payload.website) || existing?.website || '',
      service_needed: clean(payload.service_needed),
      urgency: clean(payload.urgency) || 'normal',
      enquiry_type: existing?.enquiry_type || 'call_handling',
      monthly_enquiry_volume: clean(payload.monthly_enquiry_volume) || existing?.monthly_enquiry_volume || '0_20',
      current_call_handling: clean(payload.current_call_handling),
      crm_used_now: clean(payload.crm_used_now),
      calendar_used_now: clean(payload.calendar_used_now),
      wants_booking: !!payload.wants_booking,
      wants_crm_sync: !!payload.wants_crm_sync,
      wants_sms_followup: !!payload.wants_sms_followup,
      wants_email_followup: !!payload.wants_email_followup,
      conversation_summary: clean(payload.conversation_summary),
      likely_plan_fit: likelyPlan,
      selected_plan: normalizePlan(payload.selected_plan, likelyPlan),
      buyer_intent: buyerIntent,
      source_page: clean(payload.source_page) || 'AI receptionist demo',
      lead_source: clean(payload.lead_source) || 'AI receptionist demo',
      message: clean(payload.conversation_summary) || existing?.message || '',
      status,
      payment_status: existing?.payment_status || 'not_started',
      lead_score: status === 'Hot Lead' ? 90 : status === 'Qualified Lead' ? 70 : 40,
      assigned_owner: existing?.assigned_owner || '',
      notes,
      next_action: status === 'Hot Lead' ? 'Offer instant checkout or call' : status === 'Enterprise Review Required' ? 'Urgent enterprise review' : 'Continue qualification',
    };

    const lead = existing
      ? await base44.asServiceRole.entities.Lead.update(existing.id, leadPayload)
      : await base44.asServiceRole.entities.Lead.create(leadPayload);

    await syncGoHighLevel(base44, lead);
    await notifyHighIntent(base44, lead);

    return jsonToolResponse({
      success: true,
      lead_id: lead.id,
      next_step: 'Lead captured.',
    });
  } catch (error) {
    console.log('Server failure:', error?.message || String(error));
    return jsonToolResponse({ success: false, error: error?.message || 'Unknown server error' });
  }
});