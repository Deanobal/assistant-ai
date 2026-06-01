import crypto from 'crypto';

function makeToken() {
  return crypto.randomBytes(24).toString('base64url');
}

function normalisePhone(phone) {
  return String(phone || '').replace(/\s+/g, '').trim();
}

function getConfig() {
  const url = String(process.env.VITE_SUPABASE_URL || '').trim().replace(/\/$/, '');
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !key) throw new Error('Server database configuration missing');
  return { url, key };
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

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      service: 'assistantai-secure-setup-create',
      supabase_url_present: Boolean(process.env.VITE_SUPABASE_URL),
      service_role_key_present: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      twilio_configured: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER)
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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
      source: body.source || 'vapi',
      caller_phone: phone,
      captured_name: body.name || body.full_name || null,
      captured_email: body.email || null,
      captured_business_name: body.business_name || body.company || null,
      captured_plan: body.plan || body.selected_plan || body.likely_plan_fit || null,
      captured_notes: body.notes || body.summary || body.conversation_summary || null,
      call_id: body.call_id || body.callId || null,
      lead_id: body.lead_id || body.leadId || null,
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

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

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
