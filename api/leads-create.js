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
    const fullName = String(body.full_name || '').trim();
    const email = String(body.email || '').trim();
    const phone = String(body.mobile_number || '').trim();

    if (!fullName || (!email && !phone)) {
      return res.status(400).json({ error: 'Name and either email or phone are required' });
    }

    const leadPayload = {
      full_name: fullName,
      business_name: body.business_name || null,
      email: email || null,
      mobile_number: phone || null,
      industry: body.industry || null,
      website: body.website || null,
      service_needed: body.service_needed || null,
      monthly_enquiry_volume: body.monthly_enquiry_volume || null,
      current_call_handling: body.current_call_handling || null,
      enquiry_type: body.enquiry_type || 'signup',
      lead_source: body.lead_source || 'Get Started signup flow',
      source_page: body.source_page || '/GetStartedNow',
      conversation_summary: body.conversation_summary || null,
      likely_plan_fit: body.likely_plan_fit || body.selected_plan || null,
      selected_plan: body.selected_plan || null,
      buyer_intent: body.buyer_intent || 'ready_to_proceed',
      status: body.status || 'Qualified Lead',
      payment_status: 'not_started'
    };

    const response = await fetch(`${url}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify(leadPayload)
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      return res.status(500).json({ error: 'Lead creation failed', details: data });
    }

    return res.status(200).json({ success: true, lead: Array.isArray(data) ? data[0] : data });
  } catch (error) {
    return res.status(500).json({ error: 'Lead creation failed', details: error.message });
  }
}
