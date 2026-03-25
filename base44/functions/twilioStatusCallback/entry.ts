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

function mapTwilioSmsDeliveryStatus(status) {
  const normalized = String(status || '').trim().toLowerCase();

  if (!normalized) {
    return null;
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

  return null;
}

async function parsePayload(req) {
  const contentType = String(req.headers.get('content-type') || '').toLowerCase();

  if (contentType.includes('application/json')) {
    return await req.json();
  }

  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    return Object.fromEntries(formData.entries());
  }

  const text = await req.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return Object.fromEntries(new URLSearchParams(text).entries());
  }
}

async function findNotificationLog(base44, messageSid) {
  const directMatches = await base44.asServiceRole.entities.NotificationLog.filter({
    channel: 'sms',
    provider_message_id: messageSid,
  }, '-created_date', 10);

  if (directMatches.length > 0) {
    return directMatches[0];
  }

  const recentSmsLogs = await base44.asServiceRole.entities.NotificationLog.filter({
    channel: 'sms',
  }, '-created_date', 200);

  return recentSmsLogs.find((log) => (
    log.provider_message_id === messageSid
    || log.metadata?.sms_provider_message_id === messageSid
  )) || null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await parsePayload(req);
    const messageSid = normalizeValue(payload.MessageSid || payload.SmsSid || payload.provider_message_id);
    const rawStatus = normalizeValue(payload.MessageStatus || payload.SmsStatus || payload.message_status || payload.status);
    const mappedStatus = mapTwilioSmsDeliveryStatus(rawStatus);
    const errorCode = normalizeValue(payload.ErrorCode || payload.error_code);
    const errorMessage = normalizeValue(payload.ErrorMessage || payload.error_message);

    if (!messageSid) {
      return Response.json({ error: 'MessageSid is required' }, { status: 400 });
    }

    const record = await findNotificationLog(base44, messageSid);
    if (!record) {
      return Response.json({
        success: false,
        found: false,
        provider_message_id: messageSid,
        provider_status: rawStatus,
      }, { status: 404 });
    }

    const callbackAt = new Date().toISOString();
    const nextDeliveryStatus = mappedStatus || record.delivery_status;
    const deliveredAt = nextDeliveryStatus === 'delivered'
      ? (record.delivered_at || callbackAt)
      : record.delivered_at || null;
    const failedAt = ['failed', 'undelivered'].includes(nextDeliveryStatus)
      ? (record.failed_at || callbackAt)
      : record.failed_at || null;

    const updatedRecord = await base44.asServiceRole.entities.NotificationLog.update(record.id, {
      ...record,
      provider_message_id: messageSid,
      provider_status: rawStatus || record.provider_status || null,
      delivery_status: nextDeliveryStatus,
      provider_error_code: errorCode,
      provider_error_message: errorMessage,
      delivered_at: deliveredAt,
      failed_at: failedAt,
      metadata: {
        ...(record.metadata || {}),
        sms_delivery_status: nextDeliveryStatus,
        sms_provider_message_id: messageSid,
        sms_provider_status: rawStatus || null,
        sms_provider_error_code: errorCode,
        sms_provider_error_message: errorMessage,
        sms_last_callback_at: callbackAt,
        sms_delivered_at: deliveredAt,
        sms_failed_at: failedAt,
      },
    });

    return Response.json({
      success: true,
      found: true,
      log_id: updatedRecord.id,
      recipient_role: updatedRecord.recipient_role,
      event_type: updatedRecord.event_type,
      provider_message_id: updatedRecord.provider_message_id,
      provider_status: updatedRecord.provider_status,
      delivery_status: updatedRecord.delivery_status,
      provider_error_code: updatedRecord.provider_error_code,
      provider_error_message: updatedRecord.provider_error_message,
      delivered_at: updatedRecord.delivered_at,
      failed_at: updatedRecord.failed_at,
    });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
});