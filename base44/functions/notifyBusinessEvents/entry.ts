import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

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

function getLeadLabel(data) {
  return data?.business_name || data?.full_name || 'A lead';
}

function isLeadEntity(entityName) {
  return entityName === 'Lead';
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

function getConfirmationReference(data) {
  return getFirstValue([
    data?.booking_reference,
    data?.confirmed_meeting_date && data?.confirmed_meeting_time
      ? `${data.confirmed_meeting_date}_${data.confirmed_meeting_time}`
      : '',
    data?.confirmed_meeting_date,
    getRequestTimestamp(data),
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

function buildLeadMetadata(data, eventType, uniqueKey) {
  return {
    entity_event_type: eventType,
    unique_key: uniqueKey,
    admin_link: `/LeadDetail?id=${data.id}`,
    full_name: data.full_name || '',
    business_name: data.business_name || '',
    email: data.email || '',
    mobile_number: data.mobile_number || '',
    enquiry_type: data.enquiry_type || '',
    industry: data.industry || '',
    source_page: data.source_page || '',
    booking_intent: !!data.booking_intent,
    preferred_meeting_date: data.preferred_meeting_date || '',
    preferred_meeting_time: data.preferred_meeting_time || '',
    confirmed_meeting_date: data.confirmed_meeting_date || '',
    confirmed_meeting_time: data.confirmed_meeting_time || '',
    booking_provider: data.booking_provider || '',
    booking_reference: data.booking_reference || '',
    message_preview: (data.message || '').slice(0, 180),
  };
}

function buildSmsMessage(def, data) {
  const leadName = data.full_name || data.business_name || 'Lead';
  const enquiryType = data.enquiry_type || 'general';
  const eventLabel = def.event_type === 'booking_confirmed'
    ? 'booking confirmed'
    : def.event_type === 'booking_request_failed'
      ? 'booking failed'
      : def.event_type === 'strategy_call_requested'
        ? 'strategy call'
        : 'new lead';

  return `${def.priority === 'high' ? 'HIGH' : 'ALERT'}: ${enquiryType} | ${leadName} | ${eventLabel}`.slice(0, 160);
}

function normalizePhone(value) {
  return String(value || '').trim().replace(/\s+/g, '');
}

function readSecretValue(name) {
  const raw = String(Deno.env.get(name) || '').trim();
  const prefix = `${name}=`;
  return raw.startsWith(prefix) ? raw.slice(prefix.length).trim() : raw;
}

function buildProviderEventKey(uniqueKey) {
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
  return text ? `${buildProviderEventKey(uniqueKey)}\n${text}` : buildProviderEventKey(uniqueKey);
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

function buildCustomerStrategyRequestSmsKey(data) {
  return `customer_strategy_call_requested:${data.id}:${sanitizeKeyPart(getRequestTimestamp(data))}`;
}

function buildCustomerBookingFallbackSmsKey(data, errorValue) {
  return `customer_booking_request_failed:${data.id}:${sanitizeKeyPart(getRequestTimestamp(data))}:${sanitizeKeyPart(errorValue || 'no-error')}`;
}

function buildCustomerBookingSmsKey(data) {
  if (data?.booking_reference) {
    return `customer_booking_confirmed:${data.id}:${sanitizeKeyPart(data.booking_reference)}`;
  }

  return `customer_booking_confirmed:${data.id}:${sanitizeKeyPart(data?.confirmed_meeting_date || 'unknown-date')}:${sanitizeKeyPart(data?.confirmed_meeting_time || 'unknown-time')}`;
}

function getCustomerSmsConfig(eventType, data, errorMessage) {
  if (eventType === 'strategy_call_requested') {
    return {
      title: 'Strategy call request acknowledgement',
      message: 'Thanks for your strategy call request — we’ve received it and will contact you shortly to confirm a suitable time. - AssistantAI',
      smsKind: 'customer_strategy_call_request',
      uniqueKey: buildCustomerStrategyRequestSmsKey(data),
    };
  }

  if (eventType === 'booking_request_failed') {
    return {
      title: 'Strategy call request received',
      message: 'Thanks — we’ve received your request. Our team will contact you shortly to confirm a suitable time. - AssistantAI',
      smsKind: 'customer_strategy_call_fallback',
      uniqueKey: buildCustomerBookingFallbackSmsKey(data, errorMessage),
    };
  }

  return {
    title: 'Strategy call confirmed',
    message: buildBookingConfirmationMessage(data.confirmed_meeting_date, data.confirmed_meeting_time, data.booking_provider, data.booking_reference),
    smsKind: 'customer_booking_confirmation',
    uniqueKey: buildCustomerBookingSmsKey(data),
  };
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

async function sendCustomerEventSms(base44, eventType, data, actorEmail, errorMessage = '') {
  const destination = normalizePhone(data.mobile_number || '');
  const config = getCustomerSmsConfig(eventType, data, errorMessage);

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
      && (providerMessage.includes(buildProviderEventKey(config.uniqueKey)) || metadataUniqueKey === config.uniqueKey);
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

function buildEventPayload(entityName, eventType, data, oldData) {
  if (!isLeadEntity(entityName) || !data?.id) {
    return [];
  }

  const events = [];
  const leadLabel = getLeadLabel(data);
  const strategyCallLead = isStrategyCallLead(data);
  const bookingConfirmed = isBookingConfirmed(data);

  if (eventType === 'create') {
    events.push({
      event_type: 'new_lead_created',
      logical_event_type: 'new_lead_created',
      title: 'New lead created',
      message: `${leadLabel} was captured from ${data.source_page || 'an unknown source'}.`,
      unique_key: `new_lead_created:${data.id}:${getFirstValue([data.created_at, data.created_date, data.updated_date, 'created'])}`,
      priority: strategyCallLead ? 'high' : 'normal',
    });

    if (strategyCallLead && !bookingConfirmed) {
      events.push({
        event_type: 'strategy_call_requested',
        logical_event_type: 'strategy_call_requested',
        title: 'New strategy call request',
        message: `${data.full_name || leadLabel} requested a strategy call from ${data.source_page || 'the website'}.`,
        unique_key: `strategy_call_requested:${data.id}:${getRequestTimestamp(data)}`,
        priority: 'high',
      });
    }
  }

  if (eventType === 'update') {
    const oldWasStrategyCall = isStrategyCallLead(oldData);
    const lastActivityChanged = !!data.last_activity_at && data.last_activity_at !== (oldData?.last_activity_at || '');
    const newlyRequestedStrategyCall = strategyCallLead && !bookingConfirmed && !oldWasStrategyCall;
    const repeatStrategyCallRequest = strategyCallLead && !bookingConfirmed && oldWasStrategyCall && lastActivityChanged;

    if (newlyRequestedStrategyCall || repeatStrategyCallRequest) {
      events.push({
        event_type: 'strategy_call_requested',
        logical_event_type: 'strategy_call_requested',
        title: newlyRequestedStrategyCall ? 'New strategy call request' : 'Repeated strategy call request',
        message: newlyRequestedStrategyCall
          ? `${data.full_name || leadLabel} requested a strategy call from ${data.source_page || 'the website'}.`
          : `${data.full_name || leadLabel} submitted another strategy call request.`,
        unique_key: `strategy_call_requested:${data.id}:${getRequestTimestamp(data)}`,
        priority: 'high',
      });
    }

    const bookingJustConfirmed = strategyCallLead && bookingConfirmed && !isBookingConfirmed(oldData);

    if (bookingJustConfirmed) {
      events.push({
        event_type: 'booking_confirmed',
        logical_event_type: 'booking_confirmed',
        title: 'Strategy call booking confirmed',
        message: `${data.full_name || leadLabel} has a confirmed strategy call${data.confirmed_meeting_date ? ` on ${data.confirmed_meeting_date}` : ''}.`,
        unique_key: `booking_confirmed:${data.id}:${getConfirmationReference(data)}`,
        priority: 'high',
      });
    }

    const failure = strategyCallLead && !bookingConfirmed ? getNewFailure(data, oldData) : null;

    if (failure) {
      events.push({
        event_type: 'booking_request_failed',
        logical_event_type: 'booking_failed',
        title: 'Strategy call booking failed',
        message: `${data.full_name || leadLabel} has a strategy call booking issue: ${failure.value}`,
        unique_key: `booking_request_failed:${data.id}:${failure.field}:${sanitizeKeyPart(failure.value)}:${getRequestTimestamp(data)}`,
        priority: 'high',
      });
    }
  }

  return events;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const entityName = payload?.event?.entity_name;
    const eventType = payload?.event?.type;
    const data = payload?.data;
    const oldData = payload?.old_data;

    if (!entityName || !eventType || !data?.id) {
      return Response.json({ success: true, ignored: true, reason: 'Missing event payload' });
    }

    const user = await base44.auth.me().catch(() => null);
    const actorEmail = user?.email || null;
    const eventDefs = buildEventPayload(entityName, eventType, data, oldData);

    if (eventDefs.length === 0) {
      return Response.json({ success: true, ignored: true, reason: 'No notification events matched' });
    }

    const results = [];

    for (const def of eventDefs) {
      const metadata = buildLeadMetadata(data, def.logical_event_type || def.event_type, def.unique_key);
      const adminResponse = await base44.functions.invoke('sendAdminAlert', {
        eventType: def.event_type,
        entityName,
        entityId: data.id,
        clientAccountId: data.client_account_id || null,
        title: def.title,
        message: def.message,
        actorEmail,
        metadata,
        uniqueKey: def.unique_key,
        priority: def.priority,
        smsMessage: buildSmsMessage(def, data),
      });

      const resultEntry = {
        event_type: def.logical_event_type || def.event_type,
        admin_alert: adminResponse && typeof adminResponse === 'object' && 'data' in adminResponse ? adminResponse.data : adminResponse,
      };

      if (def.event_type === 'strategy_call_requested') {
        resultEntry.customer_request_sms = await sendCustomerEventSms(base44, 'strategy_call_requested', data, actorEmail);
      }

      if (def.event_type === 'booking_request_failed') {
        resultEntry.customer_fallback_sms = await sendCustomerEventSms(base44, 'booking_request_failed', data, actorEmail, def.message);
      }

      if (def.event_type === 'booking_confirmed') {
        resultEntry.customer_confirmation_sms = await sendCustomerEventSms(base44, 'booking_confirmed', data, actorEmail);
      }

      results.push(resultEntry);
    }

    return Response.json({
      success: true,
      triggered_events: eventDefs.map((def) => def.logical_event_type || def.event_type),
      results,
    });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
});