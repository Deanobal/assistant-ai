import crypto from 'crypto';

function makeToken() {
  return crypto.randomBytes(24).toString('base64url');
}

function normalisePhone(phone) {
  return String(phone || '').replace(/\s+/g, '').trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      return res.status(500).json({ error: 'Server database configuration missing' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const token = makeToken();
    const baseUrl = (process.env.SITE_URL || 'https://www.assistantai.com.au').replace(/\/$/, '');

    const payload = {
      token,
      source: body.source || 'vapi',
      caller_phone: normalisePhone(body.phone || body.caller_phone || body.mobile_number),
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
    const setupUrl = `${baseUrl}/secure-setup?t=${encodeURIComponent(token)}`;

    return res.status(200).json({
      success: true,
      token,
      secure_setup_url: setupUrl,
      record
    });
  } catch (error) {
    return res.status(500).json({ error: 'Secure setup request creation failed', details: error.message });
  }
}
