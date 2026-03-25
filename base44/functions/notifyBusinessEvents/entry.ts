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
        const customerResponse = await base44.asServiceRole.functions.invoke('sendCustomerStrategyCallSms', {
          eventType: 'strategy_call_requested',
          leadId: data.id,
          clientAccountId: data.client_account_id || null,
          fullName: data.full_name || data.business_name || '',
          mobileNumber: data.mobile_number || '',
          actorEmail,
          uniqueKey: buildCustomerStrategyRequestSmsKey(data),
        });

        resultEntry.customer_request_sms = customerResponse && typeof customerResponse === 'object' && 'data' in customerResponse ? customerResponse.data : customerResponse;
      }

      if (def.event_type === 'booking_request_failed') {
        const customerResponse = await base44.asServiceRole.functions.invoke('sendCustomerStrategyCallSms', {
          eventType: 'booking_request_failed',
          leadId: data.id,
          clientAccountId: data.client_account_id || null,
          fullName: data.full_name || data.business_name || '',
          mobileNumber: data.mobile_number || '',
          actorEmail,
          uniqueKey: buildCustomerBookingFallbackSmsKey(data, def.message),
        });

        resultEntry.customer_fallback_sms = customerResponse && typeof customerResponse === 'object' && 'data' in customerResponse ? customerResponse.data : customerResponse;
      }

      if (def.event_type === 'booking_confirmed') {
        const customerResponse = await base44.asServiceRole.functions.invoke('sendCustomerBookingConfirmationSms', {
          leadId: data.id,
          clientAccountId: data.client_account_id || null,
          fullName: data.full_name || data.business_name || '',
          mobileNumber: data.mobile_number || '',
          confirmedDate: data.confirmed_meeting_date || '',
          confirmedTime: data.confirmed_meeting_time || '',
          bookingProvider: data.booking_provider || '',
          bookingReference: data.booking_reference || '',
          actorEmail,
          uniqueKey: buildCustomerBookingSmsKey(data),
        });

        resultEntry.customer_confirmation_sms = customerResponse && typeof customerResponse === 'object' && 'data' in customerResponse ? customerResponse.data : customerResponse;
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