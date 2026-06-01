import crypto from 'crypto';

function makeToken() {
  return crypto.randomBytes(24).toString('base64url');
}

function normalisePhone(phone) {
  return String(phone || '').replace(/\s+/g, '').trim();
}

function text(value) {
  const clean = String(value || '').trim();
  return clean || null;
}

function getConfig() {
  const url = String(process.env.VITE_SUPABASE_URL || '').trim().replace(/\/$/, '');
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !key) throw new Error('Server database configuration missing');
  return { url, key };
}

function isAuthorised(req) {
  const expected = String(process.env.VAPI_WEBHOOK_SECRET || '').trim();
  if (!expected) return true;
  const received = String(req.headers['x-webhook-secret'] || req.headers['X-Webhook-Secret'] || '').trim();
  return received === expected;
}

async function sendTwilioSms({ to, message }) {
  const accountSid = String(process.env.TWILIO_ACCOUNT_SID || '').trim();
  const authToken = String(process.env.TWILIO_AUTH_TOKEN || '').trim();
  const from = String(process.env.TWILIO_FROM_NUMBER || '').trim();
  const recipient = normalisePhone(to);

  if (!accountSid || !authToken || !from || !recipient) {
    return { status: 'not_configured_or_missing_phone' };
  }

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  const params = new URLSearchParams();
  params.append('To', recipient);
  params.append('From', normalisePhone(from));
  params.append('Body', message);

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      status: 'failed',
      provider: 'twilio',
      error: data?.message || data?.error_message || JSON.stringify(data),
      provider_response: data
    };
  }

  return {
    status: 'sent',
    provider: 'twilio',
    provider_message_id: data?.sid || null,
    provider_response: data
  };
}

function buildNotes(body) {
  const parts = [
    body.notes,
    body.summary,
    body.conversation_summary,
    body.reason ? `Reason: ${body.reason}` : null,
    body.service_needed ? `Service needed: ${body.service_needed}` : null,
    body.buyer_intent ? `Buyer intent: ${body.buyer_intent}` : null,
    body.current_call_handling ? `Current call handling: ${body.current_call_handling}` : null,
    body.monthly_enquiry_volume ? `Monthly enquiry volume: ${body.monthly_enquiry_volume}` : null,
    body.wants_booking !== undefined ? `Wants booking: ${body.wants_booking}` : null,
    body.wants_crm_sync !== undefined ? `Wants CRM sync: ${body.wants_crm_sync}` : null,
    body.wants_sms_followup !== undefined ? `Wants SMS follow-up: ${body.wants_sms_followup}` : null,
    body.wants_email_followup !== undefined ? `Wants email follow-up: ${body.wants_email_followup}` : null,
  ].map(text).filter(Boolean);
  return parts.length ? parts.join('\n') : null;
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      service: 'assistantai-secure-setup-create',
      supabase_url_present: Boolean(process.env.VITE_SUPABASE_URL),
      service_role_key_present: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      twilio_configured: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER),
      webhook_secret_required: Boolean(process.env.VAPI_WEBHOOK_SECRET)
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isAuthorised(req)) {
    return res.status(401).json({ error: 'Unauthorised secure setup tool call' });
  }

  try {
    const { url, key } = getConfig();
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const token = makeToken();
    const baseUrl = (process.env.SITE_URL || 'https://www.assistantai.com.au').replace(/\/$/, '');
    const phone = normalisePhone(body.phone || body.caller_phone || body.mobile_number || body.mobile);
    const setupUrl = `${baseUrl}/secure-setup?t=${encodeURIComponent(token)}`;

    const payload = {
      token,
      source: text(body.source || body.lead_source || body.source_page) || 'vapi',
      caller_phone: phone,
      captured_name: text(body.name || body.full_name),
      captured_email: text(body.email),
      captured_business_name: text(body.business_name || body.businessName || body.company),
      captured_plan: text(body.plan || body.selected_plan || body.likely_plan_fit),
      captured_notes: buildNotes(body),
      call_id: text(body.call_id || body.callId),
      lead_id: text(body.lead_id || body.leadId),
      submitted_payload: body.raw_payload || body,
    };

    const response = await fetch(`${url}/rest/v1/secure_setup_requests`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify(payload)
    });

    const textResponse = await response.text();
    const data = textResponse ? JSON.parse(textResponse) : null;

    if (!response.ok) {
      return res.status(500).json({ error: 'Secure setup request creation failed', details: data });
    }

    const record = Array.isArray(data) ? data[0] : data;
    const smsMessage = `AssistantAI secure setup form: ${setupUrl}`;
    const sms = await sendTwilioSms({ to: phone, message: smsMessage });

    return res.status(200).json({
      success: true,
      token,
      secure_setup_url: setupUrl,
      sms_status: sms.status,
      sms_provider: sms.provider || 'twilio',
      sms_provider_message_id: sms.provider_message_id || null,
      sms_error: sms.error || null,
      record
    });
  } catch (error) {
    return res.status(500).json({ error: 'Secure setup request creation failed', details: error.message });
  }
}
