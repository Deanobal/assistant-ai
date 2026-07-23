import { requireAdmin } from './_native-auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!requireAdmin(req, res)) return;

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const fullName = String(body.full_name || body.name || '').trim();
    const email = String(body.email || '').trim();
    const phone = String(body.mobile_number || body.phone || '').trim();

    if (!fullName || (!email && !phone)) {
      return res.status(400).json({ error: 'Name and either email or phone are required' });
    }

    if (!process.env.GHL_API_KEY || !process.env.GHL_LOCATION_ID) {
      return res.status(200).json({
        success: true,
        synced: false,
        status: 'not_configured',
        message: 'GoHighLevel is not configured. Lead should remain in Supabase.'
      });
    }

    const contactPayload = {
      locationId: process.env.GHL_LOCATION_ID,
      name: fullName,
      email: email || undefined,
      phone: phone || undefined,
      companyName: body.business_name || undefined,
      source: body.lead_source || 'AssistantAI',
      tags: ['AssistantAI', body.selected_plan || body.plan || 'Website Lead'].filter(Boolean),
      customFields: []
    };

    const response = await fetch('https://services.leadconnectorhq.com/contacts/upsert', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GHL_API_KEY}`,
        Version: '2021-07-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contactPayload)
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(502).json({
        success: false,
        synced: false,
        status: 'ghl_error',
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      synced: true,
      status: 'synced',
      contact: data?.contact || data
    });
  } catch (error) {
    return res.status(500).json({ error: 'GoHighLevel sync failed', details: error.message });
  }
}
