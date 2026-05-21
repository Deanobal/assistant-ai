export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const token = String(req.query?.t || '').trim();

    if (!supabaseUrl || !serviceKey) {
      return res.status(500).json({ error: 'Server database configuration missing' });
    }

    if (!token) {
      return res.status(400).json({ error: 'Secure setup token is required' });
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/secure_setup_requests?token=eq.${encodeURIComponent(token)}&limit=1`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json().catch(() => []);

    if (!response.ok) {
      return res.status(500).json({ error: 'Secure setup link could not be loaded' });
    }

    const record = Array.isArray(data) ? data[0] : data;

    if (!record) {
      return res.status(404).json({ error: 'Secure setup link is invalid' });
    }

    if (record.status === 'submitted') {
      return res.status(409).json({ error: 'This secure setup form has already been submitted' });
    }

    return res.status(200).json({
      success: true,
      record: {
        token: record.token,
        status: record.status,
        caller_phone: record.caller_phone,
        captured_name: record.captured_name,
        captured_email: record.captured_email,
        captured_business_name: record.captured_business_name,
        captured_plan: record.captured_plan,
        captured_notes: record.captured_notes,
        corrected_name: record.corrected_name,
        corrected_email: record.corrected_email,
        corrected_phone: record.corrected_phone,
        corrected_business_name: record.corrected_business_name,
        corrected_plan: record.corrected_plan,
        corrected_notes: record.corrected_notes
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Secure setup link could not be loaded', details: error.message });
  }
}
