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

function buildEmailHtml({ title, message, metadata }) {
  const rows = Object.entries(metadata || {})
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .slice(0, 12)
    .map(([key, value]) => `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#64748b;">${escapeHtml(key)}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#0f172a;">${escapeHtml(typeof value === 'object' ? JSON.stringify(value) : String(value))}</td></tr>`)
    .join('');

  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:0 auto;background:#ffffff;color:#0f172a;">
      <div style="padding:24px;border-bottom:1px solid #e5e7eb;">
        <p style="margin:0 0 8px;color:#0891b2;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">AssistantAI Notification</p>
        <h1 style="margin:0;font-size:24px;line-height:1.25;">${escapeHtml(title)}</h1>
      </div>
      <div style="padding:24px;">
        <p style="font-size:16px;line-height:1.7;margin:0 0 20px;white-space:pre-wrap;">${escapeHtml(message)}</p>
        ${rows ? `<table style="border-collapse:collapse;width:100%;font-size:14px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">${rows}</table>` : ''}
      </div>
      <div style="padding:16px 24px;border-top:1px solid #e5e7eb;color:#64748b;font-size:12px;">
        Sent by AssistantAI system notifications.
      </div>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function sendResendEmail({ to, subject, message, metadata }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from || !to) {
    return { status: 'not_configured' };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text: `${subject}\n\n${message}`,
      html: buildEmailHtml({ title: subject, message, metadata })
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      status: 'failed',
      provider: 'resend',
      error: data?.message || data?.error || JSON.stringify(data),
      provider_response: data
    };
  }

  return {
    status: 'sent',
    provider: 'resend',
    provider_response: data,
    provider_message_id: data?.id || null
  };
}

async function sendTwilioSms({ to, message }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !from || !to) {
    return { status: 'not_configured' };
  }

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  const params = new URLSearchParams();
  params.append('To', normalisePhone(to));
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
    provider_response: data,
    provider_message_id: data?.sid || null
  };
}

function shouldSendEmail({ requestedChannel, body }) {
  return requestedChannel === 'email' || requestedChannel === 'all' || body.send_email === true;
}

function shouldSendSms({ requestedChannel, body }) {
  return requestedChannel === 'sms' || requestedChannel === 'all' || body.send_sms === true;
}

function deriveDeliveryStatus({ emailResult, smsResult, emailRequested, smsRequested }) {
  if (emailResult.status === 'failed' || smsResult.status === 'failed') return 'failed';
  if ((emailRequested && emailResult.status === 'sent') || (smsRequested && smsResult.status === 'sent')) return 'sent';
  if ((emailRequested && emailResult.status === 'not_configured') || (smsRequested && smsResult.status === 'not_configured')) return 'stored_provider_not_configured';
  return 'stored';
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

    const requestedChannel = String(body.channel || 'in_app').toLowerCase();
    const recipientEmail = body.recipient_email || process.env.ADMIN_NOTIFICATION_EMAIL || null;
    const recipientPhone = body.recipient_phone || process.env.ADMIN_NOTIFICATION_PHONE || null;
    const metadata = body.metadata || {};
    const emailRequested = shouldSendEmail({ requestedChannel, body });
    const smsRequested = shouldSendSms({ requestedChannel, body });

    const emailResult = emailRequested
      ? await sendResendEmail({ to: recipientEmail, subject: title, message, metadata })
      : { status: 'not_requested' };

    const smsResult = smsRequested
      ? await sendTwilioSms({ to: recipientPhone, message: `${title}: ${message}` })
      : { status: 'not_requested' };

    const deliveryStatus = deriveDeliveryStatus({ emailResult, smsResult, emailRequested, smsRequested });
    const providerErrors = [emailResult.error, smsResult.error].filter(Boolean).join(' | ') || null;
    const activeProvider = emailResult.provider || smsResult.provider || 'supabase_notification_log';
    const activeProviderId = emailResult.provider_message_id || smsResult.provider_message_id || null;

    const payload = {
      event_type: eventType,
      entity_name: entityName,
      entity_id: entityId,
      client_id: body.client_id || null,
      lead_id: body.lead_id || null,
      recipient_role: body.recipient_role || 'admin',
      recipient_email: recipientEmail,
      recipient_phone: recipientPhone,
      channel: requestedChannel,
      delivery_status: deliveryStatus,
      provider_name: activeProvider,
      provider_message: providerErrors,
      provider_message_id: activeProviderId,
      provider_status: deliveryStatus,
      provider_error_message: providerErrors,
      title,
      message,
      actor_email: body.actor_email || null,
      metadata: {
        ...metadata,
        email_requested: emailRequested,
        email_provider: emailRequested ? 'resend' : null,
        email_result: emailResult.status,
        email_provider_response: emailResult.provider_response || null,
        sms_requested: smsRequested,
        sms_provider: smsRequested ? 'twilio' : null,
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
        email: emailResult.status,
        email_provider: 'resend',
        sms: smsResult.status,
        sms_provider: 'twilio',
        push: 'not_configured'
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Notification send failed', details: error.message });
  }
}
