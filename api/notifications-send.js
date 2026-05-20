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
    const eventType = String(body.eventType || body.event_type || '').trim();
    const entityName = String(body.entityName || body.entity_name || '').trim();
    const entityId = String(body.entityId || body.entity_id || '').trim();
    const title = String(body.title || '').trim();
    const message = String(body.message || '').trim();

    if (!eventType || !entityName || !entityId || !title || !message) {
      return res.status(400).json({ error: 'eventType, entityName, entityId, title and message are required' });
    }

    const payload = {
      event_type: eventType,
      entity_name: entityName,
      entity_id: entityId,
      client_id: body.client_id || null,
      recipient_role: body.recipient_role || 'admin',
      recipient_email: body.recipient_email || process.env.ADMIN_NOTIFICATION_EMAIL || null,
      channel: body.channel || 'in_app',
      delivery_status: 'stored',
      provider_name: 'supabase_notification_log',
      title,
      message,
      actor_email: body.actor_email || null,
      metadata: body.metadata || {}
    };

    const response = await fetch(`${url}/rest/v1/notification_logs`, {
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
      return res.status(500).json({ error: 'Notification log creation failed', details: data });
    }

    return res.status(200).json({
      success: true,
      notification: Array.isArray(data) ? data[0] : data,
      providers: {
        in_app: 'stored',
        email: process.env.RESEND_API_KEY ? 'not_implemented_yet' : 'not_configured',
        sms: process.env.TWILIO_ACCOUNT_SID ? 'not_implemented_yet' : 'not_configured',
        push: 'not_configured'
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Notification send failed', details: error.message });
  }
}
