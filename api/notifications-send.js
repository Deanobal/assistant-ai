async function logNotification({ url, key, payload }) {
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
    throw new Error(JSON.stringify(data || { error: 'Notification log creation failed' }));
  }

  return Array.isArray(data) ? data[0] : data;
}

function normalisePhone(phone) {
  return String(phone || '').replace(/\s+/g, '').trim();
}

async function sendMessageMediaSms({ to, message }) {
  const apiKey = process.env.MESSAGEMEDIA_API_KEY;
  const apiSecret = process.env.MESSAGEMEDIA_API_SECRET;
  const sender = process.env.MESSAGEMEDIA_SENDER_ID || 'AssistantAI';

  if (!apiKey || !apiSecret || !to) {
    return { status: 'not_configured' };
  }

  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
  const response = await fetch('https://api.messagemedia.com/v1/messages', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      messages: [
        {
          content: message,
          destination_number: normalisePhone(to),
          source_number: sender
        }
      ]
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      status: 'failed',
      provider: 'messagemedia',
      error: data?.message || data?.error || JSON.stringify(data)
    };
  }

  return {
    status: 'sent',
    provider: 'messagemedia',
    provider_response: data,
    provider_message_id: data?.messages?.[0]?.message_id || data?.message_id || null
  };
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
    const eventType = String(body.eventType || body.event_type || '').trim();
    const entityName = String(body.entityName || body.entity_name || '').trim();
    const entityId = String(body.entityId || body.entity_id || '').trim();
    const title = String(body.title || '').trim();
    const message = String(body.message || '').trim();

    if (!eventType || !entityName || !entityId || !title || !message) {
      return res.status(400).json({ error: 'eventType, entityName, entityId, title and message are required' });
    }

    const recipientPhone = body.recipient_phone || process.env.ADMIN_NOTIFICATION_PHONE || null;
    const requestedChannel = body.channel || 'in_app';
    const shouldSendSms = requestedChannel === 'sms' || body.send_sms === true;
    const smsResult = shouldSendSms
      ? await sendMessageMediaSms({ to: recipientPhone, message: `${title}: ${message}` })
      : { status: 'not_requested' };

    const payload = {
      event_type: eventType,
      entity_name: entityName,
      entity_id: entityId,
      client_id: body.client_id || null,
      lead_id: body.lead_id || null,
      recipient_role: body.recipient_role || 'admin',
      recipient_email: body.recipient_email || process.env.ADMIN_NOTIFICATION_EMAIL || null,
      recipient_phone: recipientPhone,
      channel: shouldSendSms ? 'sms' : requestedChannel,
      delivery_status: smsResult.status === 'sent' ? 'sent' : 'stored',
      provider_name: smsResult.provider || 'supabase_notification_log',
      provider_message: smsResult.error || null,
      provider_message_id: smsResult.provider_message_id || null,
      provider_status: smsResult.status || null,
      provider_error_message: smsResult.error || null,
      title,
      message,
      actor_email: body.actor_email || null,
      metadata: {
        ...(body.metadata || {}),
        sms_provider: shouldSendSms ? 'messagemedia' : null,
        sms_result: smsResult.status,
        sms_provider_response: smsResult.provider_response || null
      }
    };

    const notification = await logNotification({ url, key, payload });

    return res.status(200).json({
      success: true,
      notification,
      providers: {
        in_app: 'stored',
        email: process.env.RESEND_API_KEY ? 'not_implemented_yet' : 'not_configured',
        sms: smsResult.status,
        sms_provider: 'messagemedia',
        push: 'not_configured'
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Notification send failed', details: error.message });
  }
}
