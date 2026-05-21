function clean(value) {
  const text = String(value || '').trim();
  return text || null;
}

function normalisePhone(phone) {
  return String(phone || '').replace(/\s+/g, '').trim() || null;
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
    const token = clean(body.token);

    if (!token) {
      return res.status(400).json({ error: 'Secure setup token is required' });
    }

    const updatePayload = {
      status: 'submitted',
      corrected_name: clean(body.full_name || body.name),
      corrected_email: clean(body.email),
      corrected_phone: normalisePhone(body.phone || body.mobile_number),
      corrected_business_name: clean(body.business_name || body.company),
      corrected_plan: clean(body.selected_plan || body.plan),
      corrected_notes: clean(body.notes || body.additional_notes),
      submitted_payload: body,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const response = await fetch(`${url}/rest/v1/secure_setup_requests?token=eq.${encodeURIComponent(token)}&status=neq.submitted`, {
      method: 'PATCH',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify(updatePayload)
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      return res.status(500).json({ error: 'Secure setup submission failed', details: data });
    }

    const record = Array.isArray(data) ? data[0] : data;

    if (!record) {
      return res.status(404).json({ error: 'Secure setup link is invalid, expired, or already submitted' });
    }

    return res.status(200).json({ success: true, record });
  } catch (error) {
    return res.status(500).json({ error: 'Secure setup submission failed', details: error.message });
  }
}
