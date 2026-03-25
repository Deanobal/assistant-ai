import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const REQUEST_MESSAGE = 'Thanks for your strategy call request — we’ve received it and will contact you shortly to confirm a suitable time. - AssistantAI';
const FALLBACK_MESSAGE = 'Thanks — we’ve received your request. Our team will contact you shortly to confirm a suitable time. - AssistantAI';

function getErrorMessage(error) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'Unknown error';
}

function getFirstValue(values) {
  for (const value of values) {
    if (value) {
      return value;
    }
  }

  return '';
}

function sanitizeKeyPart(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'unknown';
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

function isStrategyCallLead(data) {
  return !!data && !!data.booking_intent && data.enquiry_type === 'strategy_call';
}

function isBookingConfirmed(data) {
  return !!data && (data.status === 'Strategy Call Booked' || data.booking_status === 'confirmed');
}

function getRequestTimestamp(data) {
  return getFirstValue([
    data?.last_activity_at,
    data?.updated_at,
    data?.updated_date,
    data?.created_at,
    data?.created_date,
    'unknown',
  ]);
}

function getNewFailure(data, oldData) {
  if (isBookingConfirmed(data)) {
    return null;
  }

  const fields = ['booking_error', 'last_booking_error', 'error_message'];

  for (const field of fields) {
    const nextValue = data?.[field] ? String(data[field]).trim() : '';
    const previousValue = oldData?.[field] ? String(oldData[field]).trim() : '';

    if (nextValue && nextValue !== previousValue) {
      return { field, value: nextValue };
    }
  }

  return null;
}

function buildBookingConfirmationMessage(confirmedDate, confirmedTime, bookingProvider, bookingReference) {
  const confirmedLabel = [confirmedDate || '', confirmedTime || ''].filter(Boolean).join(' ').trim();
  let message = confirmedLabel
    ? `Your strategy call is confirmed for ${confirmedLabel}. We look forward to speaking with you.`
    : 'Your strategy call is confirmed. We look forward to speaking with you.';

  if (bookingReference) {
    message += ` Ref: ${bookingReference}.`;
  } else if (bookingProvider) {
    message += ` Via ${bookingProvider}.`;
  }

  message += ' - AssistantAI';
  return message.slice(0, 160);
}

function buildSmsEventConfig(eventType, data, errorValue = '') {
  if (eventType === 'strategy_call_requested') {
    return {
      title: 'Strategy call request acknowledgement',
      message: REQUEST_MESSAGE,
      smsKind: 'customer_strategy_call_request',
      uniqueKey: `customer_strategy_call_requested:${data.id}:${sanitizeKeyPart(getRequestTimestamp(data))}`,
    };
  }

  if (eventType === 'booking_request_failed') {
    return {
      title: 'Strategy call request received',
      message: FALLBACK_MESSAGE,
      smsKind: 'customer_strategy_call_fallback',
      uniqueKey: `customer_booking_request_failed:${data.id}:${sanitizeKeyPart(getRequestTimestamp(data))}:${sanitizeKeyPart(errorValue || 'no-error')}`,
    };
  }

  if (data?.booking_reference) {
    return {
      title: 'Strategy call confirmed',
      message: buildBookingConfirmationMessage(data.confirmed_meeting_date, data.confirmed_meeting_time, data.booking_provider, data.booking_reference),
      smsKind: 'customer_booking_confirmation',
      uniqueKey: `customer_booking_confirmed:${data.id}:${sanitizeKeyPart(data.booking_reference)}`,
    };
  }

  return {
    title: 'Strategy call confirmed',
    message: buildBookingConfirmationMessage(data.confirmed_meeting_date, data.confirmed_meeting_time, data.booking_provider, data.booking_reference),
    smsKind: 'customer_booking_confirmation',
    uniqueKey: `customer_booking_confirmed:${data.id}:${sanitizeKeyPart(data?.confirmed_meeting_date || 'unknown-date')}:${sanitizeKeyPart(data?.confirmed_meeting_time || 'unknown-time')}`,
  };
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

async function sendCustomerSms(base44, eventType, data, actorEmail, errorValue = '') {
  const destination = normalizePhone(data.mobile_number || '');
  const config = buildSmsEventConfig(eventType, data, errorValue);

  const existing = await base44.asServiceRole.entities.NotificationLog.filter({
    entity_id: data.id,
    event_type: eventType,
    recipient_email: destination || null,
    channel: 'sms',
  }, '-created_date', 20);

  const duplicate = existing.find((item) => {
    const providerMessage = typeof item.provider_message === 'string' ? item.provider_message : '';
    const metadataUniqueKey = item.metadata?.unique_key;
    return item.recipient_role === 'client'
      && item.metadata?.sms_kind === config.smsKind
      && (providerMessage.includes(buildEventKey(config.uniqueKey)) || metadataUniqueKey === config.uniqueKey);
  });

  if (duplicate) {
    return {
      success: true,
      duplicate: true,
      status: 'duplicate_skipped',
      delivery_status: 'duplicate_skipped',
      sent: false,
      sent_definition: 'provider acceptance only',
      provider_accepted: false,
      delivered: false,
      recipient: destination || null,
    };
  }

  const metadata = {
    unique_key: config.uniqueKey,
    sms_kind: config.smsKind,
    full_name: data.full_name || data.business_name || '',
    sms_message_type: eventType,
  };

  const record = await base44.asServiceRole.entities.NotificationLog.create({
    event_type: eventType,
    entity_name: 'Lead',
    entity_id: data.id,
    client_account_id: data.client_account_id || null,
    recipient_role: 'client',
    recipient_email: destination || null,
    channel: 'sms',
    delivery_status: destination ? 'queued' : 'not_configured',
    provider_name: 'Twilio',
    provider_message: buildProviderMessage(config.uniqueKey),
    title: config.title,
    message: config.message,
    triggered_at: new Date().toISOString(),
    actor_email: actorEmail,
    metadata,
  });

  if (!destination) {
    await base44.asServiceRole.entities.NotificationLog.update(record.id, {
      ...record,
      delivery_status: 'not_configured',
      provider_message: buildProviderMessage(config.uniqueKey, 'No mobile number available for customer strategy call SMS.'),
      metadata: {
        ...metadata,
        sms_attempted: false,
        sms_sent: false,
        sms_delivery_status: 'not_configured',
        sms_sent_definition: 'provider acceptance only',
        sms_error: 'No mobile number available for customer strategy call SMS.',
      },
    });

    return {
      success: true,
      duplicate: false,
      status: 'not_configured',
      delivery_status: 'not_configured',
      sent: false,
      sent_definition: 'provider acceptance only',
      provider_accepted: false,
      delivered: false,
      recipient: null,
    };
  }

  const smsResult = await sendTwilioSms(config.message, destination);
  const deliveryStatus = smsResult.status;
  const providerAccepted = isProviderAcceptanceStatus(deliveryStatus);

  await base44.asServiceRole.entities.NotificationLog.update(record.id, {
    ...record,
    delivery_status: deliveryStatus,
    provider_message: buildProviderMessage(config.uniqueKey, {
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

  return {
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
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const entityName = payload?.event?.entity_name;
    const eventType = payload?.event?.type;
    const data = payload?.data;
    const oldData = payload?.old_data;
    const user = await base44.auth.me().catch(() => null);
    const actorEmail = user?.email || null;

    if (entityName !== 'Lead' || !eventType || !data?.id) {
      return Response.json({ success: true, ignored: true, reason: 'Unsupported event payload' });
    }

    const strategyCallLead = isStrategyCallLead(data);
    const bookingConfirmed = isBookingConfirmed(data);

    if (eventType === 'create' && strategyCallLead && !bookingConfirmed) {
      return Response.json(await sendCustomerSms(base44, 'strategy_call_requested', data, actorEmail));
    }

    if (eventType === 'update') {
      const oldWasStrategyCall = isStrategyCallLead(oldData);
      const lastActivityChanged = !!data.last_activity_at && data.last_activity_at !== (oldData?.last_activity_at || '');
      const newlyRequestedStrategyCall = strategyCallLead && !bookingConfirmed && !oldWasStrategyCall;
      const repeatStrategyCallRequest = strategyCallLead && !bookingConfirmed && oldWasStrategyCall && lastActivityChanged;

      if (newlyRequestedStrategyCall || repeatStrategyCallRequest) {
        return Response.json(await sendCustomerSms(base44, 'strategy_call_requested', data, actorEmail));
      }

      const failure = strategyCallLead && !bookingConfirmed ? getNewFailure(data, oldData) : null;
      if (failure) {
        return Response.json(await sendCustomerSms(base44, 'booking_request_failed', data, actorEmail, failure.value));
      }

      const bookingJustConfirmed = strategyCallLead && bookingConfirmed && !isBookingConfirmed(oldData);
      if (bookingJustConfirmed) {
        return Response.json(await sendCustomerSms(base44, 'booking_confirmed', data, actorEmail));
      }
    }

    return Response.json({ success: true, ignored: true, reason: 'No customer SMS event matched' });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
});