import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const EVENT_MESSAGES = {
  strategy_call_requested: 'Thanks for your strategy call request — we’ve received it and will contact you shortly to confirm a suitable time. - AssistantAI',
  booking_request_failed: 'Thanks — we’ve received your request. Our team will contact you shortly to confirm a suitable time. - AssistantAI',
};

function getErrorMessage(error) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'Unknown error';
}

function normalizePhone(value) {
  return String(value || '').trim().replace(/\s+/g, '');
}

function readSecretValue(name) {
  const raw = String(Deno.env.get(name) || '').trim();
  const prefix = `${name}=`;
  return raw.startsWith(prefix) ? raw.slice(prefix.length).trim() : raw;
}

function buildEventKey(uniqueKey) {
  return `event_key:${uniqueKey}`;
}

function serializeDetails(details) {
  if (!details) {
    return '';
  }

  if (typeof details === 'string') {
    return details;
  }

  try {
    return JSON.stringify(details);
  } catch {
    return String(details);
  }
}

function buildProviderMessage(uniqueKey, details) {
  const text = serializeDetails(details);
  return text ? `${buildEventKey(uniqueKey)}\n${text}` : buildEventKey(uniqueKey);
}

function getProviderMessageId(data) {
  return data?.sid || data?.id || data?.messageId || data?.message_id || null;
}

function mapTwilioDeliveryStatus(status) {
  const normalized = String(status || '').trim().toLowerCase();

  if (!normalized) {
    return 'provider_accepted';
  }

  if (['queued', 'scheduled', 'sending'].includes(normalized)) {
    return 'queued';
  }

  if (['accepted', 'sent'].includes(normalized)) {
    return 'provider_accepted';
  }

  if (['delivered', 'received', 'read'].includes(normalized)) {
    return 'delivered';
  }

  if (['failed', 'undelivered', 'canceled'].includes(normalized)) {
    return 'failed';
  }

  return 'provider_accepted';
}

function isProviderAcceptanceStatus(status) {
  return ['queued', 'provider_accepted', 'delivered'].includes(String(status || '').trim());
}

function getSmsKind(eventType) {
  return eventType === 'booking_request_failed'
    ? 'customer_strategy_call_fallback'
    : 'customer_strategy_call_request';
}

function getSmsTitle(eventType) {
  return eventType === 'booking_request_failed'
    ? 'Strategy call request received'
    : 'Strategy call request acknowledgement';
}

async function findExistingLog(base44, eventType, entityId, mobileNumber, uniqueKey, smsKind) {
  const existing = await base44.asServiceRole.entities.NotificationLog.filter({
    entity_id: entityId,
    event_type: eventType,
    recipient_email: mobileNumber,
    channel: 'sms',
  }, '-created_date', 20);

  return existing.find((item) => {
    const providerMessage = typeof item.provider_message === 'string' ? item.provider_message : '';
    const metadataUniqueKey = item.metadata?.unique_key;
    return (providerMessage.includes(buildEventKey(uniqueKey)) || metadataUniqueKey === uniqueKey) && item.metadata?.sms_kind === smsKind;
  }) || null;
}

async function sendTwilioSms(message, to) {
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
      fromNumberUsed: fromNumber || null,
    };
  }

  const body = new URLSearchParams({
    From: fromNumber,
    To: destination,
    Body: message,
  });

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
      fromNumberUsed: fromNumber,
    };
  }

  return {
    status: mapTwilioDeliveryStatus(parsed?.status),
    details: parsed?.status || 'Twilio SMS accepted by Twilio.',
    providerMessageId: getProviderMessageId(parsed),
    providerResponse: parsed || resultText || null,
    providerStatus: parsed?.status || null,
    fromNumberUsed: parsed?.from || fromNumber,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const {
      eventType,
      leadId,
      clientAccountId = null,
      fullName = '',
      mobileNumber,
      actorEmail = null,
      uniqueKey,
    } = payload;

    if (!leadId || !uniqueKey || !EVENT_MESSAGES[eventType]) {
      return Response.json({ error: 'eventType, leadId, and uniqueKey are required' }, { status: 400 });
    }

    const destination = normalizePhone(mobileNumber);
    const message = EVENT_MESSAGES[eventType];
    const smsKind = getSmsKind(eventType);
    const existing = await findExistingLog(base44, eventType, leadId, destination || null, uniqueKey, smsKind);

    if (existing) {
      return Response.json({
        success: true,
        duplicate: true,
        status: 'duplicate_skipped',
        delivery_status: 'duplicate_skipped',
        sent: false,
        sent_definition: 'provider acceptance only',
        provider_accepted: false,
        delivered: false,
        recipient: destination || null,
      });
    }

    const metadata = {
      unique_key: uniqueKey,
      sms_kind: smsKind,
      full_name: fullName || '',
      sms_message_type: eventType,
    };

    const record = await base44.asServiceRole.entities.NotificationLog.create({
      event_type: eventType,
      entity_name: 'Lead',
      entity_id: leadId,
      client_account_id: clientAccountId,
      recipient_role: 'client',
      recipient_email: destination || null,
      channel: 'sms',
      delivery_status: destination ? 'queued' : 'not_configured',
      provider_name: 'Twilio',
      provider_message: buildProviderMessage(uniqueKey),
      title: getSmsTitle(eventType),
      message,
      triggered_at: new Date().toISOString(),
      actor_email: actorEmail,
      metadata,
    });

    if (!destination) {
      await base44.asServiceRole.entities.NotificationLog.update(record.id, {
        ...record,
        delivery_status: 'not_configured',
        provider_message: buildProviderMessage(uniqueKey, 'No mobile number available for customer strategy call SMS.'),
        metadata: {
          ...metadata,
          sms_attempted: false,
          sms_sent: false,
          sms_delivery_status: 'not_configured',
          sms_sent_definition: 'provider acceptance only',
          sms_error: 'No mobile number available for customer strategy call SMS.',
        },
      });

      return Response.json({
        success: true,
        duplicate: false,
        status: 'not_configured',
        delivery_status: 'not_configured',
        sent: false,
        sent_definition: 'provider acceptance only',
        provider_accepted: false,
        delivered: false,
        recipient: null,
      });
    }

    try {
      const smsResult = await sendTwilioSms(message, destination);
      const deliveryStatus = smsResult.status;
      const providerAccepted = isProviderAcceptanceStatus(deliveryStatus);

      await base44.asServiceRole.entities.NotificationLog.update(record.id, {
        ...record,
        delivery_status: deliveryStatus,
        provider_message: buildProviderMessage(uniqueKey, {
          status: smsResult.status,
          delivery_status: deliveryStatus,
          provider_status: smsResult.providerStatus,
          error: smsResult.status === 'failed' ? smsResult.details : null,
          provider_message_id: smsResult.providerMessageId,
          provider_response: smsResult.providerResponse,
          from_number_used: smsResult.fromNumberUsed,
        }),
        metadata: {
          ...metadata,
          sms_attempted: true,
          sms_sent: providerAccepted,
          sms_delivery_status: deliveryStatus,
          sms_sent_definition: 'provider acceptance only',
          sms_error: smsResult.status === 'failed' ? smsResult.details : null,
          sms_provider_message_id: smsResult.providerMessageId,
          sms_provider_response: smsResult.providerResponse,
          sms_from_number_used: smsResult.fromNumberUsed,
        },
      });

      return Response.json({
        success: true,
        duplicate: false,
        status: smsResult.status,
        delivery_status: deliveryStatus,
        sent: providerAccepted,
        sent_definition: 'provider acceptance only',
        provider_accepted: providerAccepted,
        delivered: deliveryStatus === 'delivered',
        recipient: destination,
        provider_message_id: smsResult.providerMessageId,
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      await base44.asServiceRole.entities.NotificationLog.update(record.id, {
        ...record,
        delivery_status: 'failed',
        provider_message: buildProviderMessage(uniqueKey, {
          status: 'failed',
          delivery_status: 'failed',
          error: errorMessage,
        }),
        metadata: {
          ...metadata,
          sms_attempted: true,
          sms_sent: false,
          sms_delivery_status: 'failed',
          sms_sent_definition: 'provider acceptance only',
          sms_error: errorMessage,
        },
      });

      return Response.json({
        success: true,
        duplicate: false,
        status: 'failed',
        delivery_status: 'failed',
        sent: false,
        sent_definition: 'provider acceptance only',
        provider_accepted: false,
        delivered: false,
        recipient: destination,
        error: errorMessage,
      });
    }
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
});