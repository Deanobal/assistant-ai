import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function getErrorMessage(error) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'Unknown error';
}

function normalizeValue(value) {
  const text = String(value || '').trim();
  return text || null;
}

function normalizePhone(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }

  const cleaned = raw.replace(/[^\d+]/g, '');
  const digits = cleaned.replace(/\D/g, '');

  if (cleaned.startsWith('+')) {
    return `+${digits}`;
  }

  if (digits.startsWith('61') && digits.length === 11) {
    return `+${digits}`;
  }

  if (digits.startsWith('0') && digits.length === 10) {
    return `+61${digits.slice(1)}`;
  }

  if (digits.length === 9 && digits.startsWith('4')) {
    return `+61${digits}`;
  }

  return cleaned;
}

function readSecretValue(name) {
  const raw = String(Deno.env.get(name) || '').trim();
  const prefix = `${name}=`;
  return raw.startsWith(prefix) ? raw.slice(prefix.length).trim() : raw;
}

function buildFunctionUrl(requestUrl, functionName) {
  const url = new URL(requestUrl);
  url.pathname = url.pathname.replace(/\/[^/]+$/, `/${functionName}`);
  url.search = '';
  url.hash = '';
  return url.toString();
}

function getProviderMessageId(data) {
  return data?.sid || data?.id || data?.messageId || data?.message_id || null;
}

function mapTwilioSmsDeliveryStatus(status) {
  const normalized = String(status || '').trim().toLowerCase();

  if (!normalized) {
    return 'queued';
  }

  if (['queued', 'accepted', 'scheduled', 'sending'].includes(normalized)) {
    return 'queued';
  }

  if (normalized === 'sent') {
    return 'sent';
  }

  if (['delivered', 'received', 'read'].includes(normalized)) {
    return 'delivered';
  }

  if (normalized === 'undelivered') {
    return 'undelivered';
  }

  if (['failed', 'canceled', 'cancelled'].includes(normalized)) {
    return 'failed';
  }

  return 'queued';
}

function isSmsProviderAcceptanceStatus(status) {
  return ['queued', 'sent', 'delivered'].includes(String(status || '').trim());
}

async function findLead(base44, leadId) {
  if (!/^[a-f\d]{24}$/i.test(String(leadId || ''))) {
    return null;
  }

  const leads = await base44.asServiceRole.entities.Lead.filter({ id: leadId }, '-updated_date', 1);
  return leads[0] || null;
}

async function sendTwilioSms(message, to, statusCallbackUrl) {
  const accountSid = String(readSecretValue('TWILIO_ACCOUNT_SID') || '').trim();
  const authToken = String(readSecretValue('TWILIO_AUTH_TOKEN') || '').trim();
  const fromNumber = normalizePhone(readSecretValue('TWILIO_FROM_NUMBER'));
  const destination = normalizePhone(to);

  if (!accountSid || !authToken || !fromNumber || !destination) {
    return {
      status: 'not_configured',
      details: 'Twilio credentials, from number, or destination number are missing.',
      providerMessageId: null,
      providerResponse: null,
      providerStatus: null,
      providerErrorCode: null,
      fromNumberUsed: fromNumber || null,
    };
  }

  const body = new URLSearchParams({
    From: fromNumber,
    To: destination,
    Body: message,
  });

  if (statusCallbackUrl) {
    body.set('StatusCallback', statusCallbackUrl);
  }

  const auth = btoa(`${accountSid}:${authToken}`);
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const resultText = await response.text();
  let parsed = null;

  try {
    parsed = JSON.parse(resultText);
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    return {
      status: 'failed',
      details: parsed?.message || resultText || 'Twilio SMS send failed.',
      providerMessageId: getProviderMessageId(parsed),
      providerResponse: parsed || resultText || null,
      providerStatus: parsed?.status || null,
      providerErrorCode: parsed?.error_code ? String(parsed.error_code) : null,
      fromNumberUsed: fromNumber,
    };
  }

  return {
    status: mapTwilioSmsDeliveryStatus(parsed?.status),
    details: parsed?.status || 'Twilio SMS accepted by Twilio.',
    providerMessageId: getProviderMessageId(parsed),
    providerResponse: parsed || resultText || null,
    providerStatus: parsed?.status || null,
    providerErrorCode: parsed?.error_code ? String(parsed.error_code) : null,
    fromNumberUsed: parsed?.from || fromNumber,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const payload = await req.json();
    const leadId = normalizeValue(payload.leadId);
    const message = String(payload.message || '').trim();

    if (!leadId || !message) {
      return Response.json({ error: 'leadId and message are required' }, { status: 400 });
    }

    const lead = await findLead(base44, leadId);
    if (!lead) {
      return Response.json({ error: 'Lead not found' }, { status: 404 });
    }

    const destination = normalizePhone(lead.mobile_number);
    if (!destination) {
      return Response.json({ error: 'Lead does not have a valid mobile number' }, { status: 400 });
    }

    const senderNumber = normalizePhone(readSecretValue('TWILIO_FROM_NUMBER'));
    const sentAt = new Date().toISOString();
    const statusCallbackUrl = buildFunctionUrl(req.url, 'twilioStatusCallback');

    const record = await base44.asServiceRole.entities.NotificationLog.create({
      event_type: 'admin_sms_reply',
      entity_name: 'Lead',
      entity_id: lead.id,
      client_account_id: lead.client_account_id || null,
      sender_role: 'admin',
      recipient_role: 'client',
      match_status: 'matched',
      recipient_email: destination,
      channel: 'sms',
      delivery_status: 'queued',
      provider_name: 'Twilio',
      provider_message: JSON.stringify({ from: senderNumber || null, to: destination, body: message }),
      provider_message_id: null,
      provider_status: null,
      provider_error_code: null,
      provider_error_message: null,
      title: 'Admin SMS reply',
      message,
      triggered_at: sentAt,
      delivered_at: null,
      failed_at: null,
      actor_email: user.email || null,
      metadata: {
        sender_role: 'admin',
        recipient_role: 'client',
        sender_number: senderNumber || null,
        receiver_number: destination,
        sent_at: sentAt,
        sms_kind: 'admin_manual_reply',
        sms_attempted: false,
        sms_sent: false,
        sms_delivery_status: 'queued',
        sms_sent_definition: 'Twilio accepted/send state only until callback confirms final delivery',
        sms_provider_message_id: null,
        sms_provider_status: null,
        sms_provider_error_code: null,
        sms_provider_error_message: null,
        sms_status_callback_url: statusCallbackUrl,
        matched_lead_id: lead.id,
        reply_context: 'lead_detail_manual_reply',
        replied_by: user.email || null,
      },
    });

    const smsResult = await sendTwilioSms(message, destination, statusCallbackUrl);
    const deliveryStatus = smsResult.status;
    const providerAccepted = isSmsProviderAcceptanceStatus(deliveryStatus);
    const statusTimestamp = new Date().toISOString();

    const updatedRecord = await base44.asServiceRole.entities.NotificationLog.update(record.id, {
      ...record,
      delivery_status: deliveryStatus,
      provider_message_id: smsResult.providerMessageId,
      provider_status: smsResult.providerStatus,
      provider_error_code: smsResult.providerErrorCode,
      provider_error_message: ['failed', 'undelivered'].includes(deliveryStatus) ? smsResult.details : null,
      delivered_at: deliveryStatus === 'delivered' ? statusTimestamp : null,
      failed_at: ['failed', 'undelivered'].includes(deliveryStatus) ? statusTimestamp : null,
      metadata: {
        ...(record.metadata || {}),
        sender_number: smsResult.fromNumberUsed || senderNumber || null,
        sms_attempted: true,
        sms_sent: providerAccepted,
        sms_delivery_status: deliveryStatus,
        sms_provider_message_id: smsResult.providerMessageId,
        sms_provider_status: smsResult.providerStatus,
        sms_provider_error_code: smsResult.providerErrorCode,
        sms_provider_error_message: ['failed', 'undelivered'].includes(deliveryStatus) ? smsResult.details : null,
        sms_provider_response: smsResult.providerResponse || null,
        sms_from_number_used: smsResult.fromNumberUsed || senderNumber || null,
      },
    });

    return Response.json({
      success: true,
      log_id: updatedRecord.id,
      lead_id: lead.id,
      recipient: destination,
      sender: smsResult.fromNumberUsed || senderNumber || null,
      message,
      provider_message_id: updatedRecord.provider_message_id,
      provider_status: updatedRecord.provider_status,
      delivery_status: updatedRecord.delivery_status,
      sent: providerAccepted,
      sent_definition: 'Twilio accepted/send state only until callback confirms final delivery',
      delivered: updatedRecord.delivery_status === 'delivered',
      delivered_at: updatedRecord.delivered_at,
      failed_at: updatedRecord.failed_at,
      status_callback_url: statusCallbackUrl,
    });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
});