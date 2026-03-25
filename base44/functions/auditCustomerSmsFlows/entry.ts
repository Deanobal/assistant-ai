import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sanitizeKeyPart(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'unknown';
}

function getFirstValue(values) {
  for (const value of values) {
    if (value) {
      return value;
    }
  }

  return '';
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

function summarizeLog(log) {
  if (!log) {
    return null;
  }

  return {
    id: log.id,
    event_type: log.event_type,
    recipient_role: log.recipient_role,
    recipient: log.recipient_email,
    channel: log.channel,
    delivery_status: log.delivery_status,
    unique_key: log.metadata?.unique_key || null,
    sms_kind: log.metadata?.sms_kind || null,
    provider_message_id: log.metadata?.sms_provider_message_id || null,
    provider_response: log.metadata?.sms_provider_response || null,
  };
}

async function listAllLogs(base44, leadId) {
  const logs = await base44.asServiceRole.entities.NotificationLog.filter({ entity_id: leadId }, '-created_date', 50);
  return logs.map(summarizeLog);
}

async function listClientSmsLogs(base44, leadId) {
  const logs = await base44.asServiceRole.entities.NotificationLog.filter({ entity_id: leadId, channel: 'sms' }, '-created_date', 50);
  return logs
    .filter((log) => log.recipient_role === 'client')
    .map(summarizeLog);
}

async function waitForCustomerSms(base44, leadId, eventType, smsKind) {
  for (let index = 0; index < 20; index += 1) {
    const logs = await base44.asServiceRole.entities.NotificationLog.filter({
      entity_id: leadId,
      channel: 'sms',
    }, '-created_date', 20);

    const match = logs.find((log) => (
      log.event_type === eventType
      && log.recipient_role === 'client'
      && log.metadata?.sms_kind === smsKind
    ));
    if (match) {
      return match;
    }

    await sleep(1500);
  }

  const logs = await base44.asServiceRole.entities.NotificationLog.filter({
    entity_id: leadId,
    channel: 'sms',
  }, '-created_date', 20);

  return logs.find((log) => (
    log.event_type === eventType
    && log.recipient_role === 'client'
    && log.metadata?.sms_kind === smsKind
  )) || null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const stamp = String(Date.now());
    const createdAt = new Date().toISOString();
    const lead = await base44.asServiceRole.entities.Lead.create({
      created_at: createdAt,
      last_activity_at: createdAt,
      full_name: `Customer SMS Audit ${stamp}`,
      business_name: `Audit Flow ${stamp}`,
      email: `customer-sms-audit-${stamp}@example.com`,
      mobile_number: '+61420222793',
      industry: 'trades',
      enquiry_type: 'strategy_call',
      monthly_enquiry_volume: '21_100',
      source_page: '/BookStrategyCall',
      message: 'Customer SMS automation audit.',
      status: 'New Lead',
      booking_intent: true,
      booking_source: 'customer_sms_audit',
    });

    const requestLog = await waitForCustomerSms(base44, lead.id, 'strategy_call_requested', 'customer_strategy_call_request');

    const failureUpdatedLead = await base44.asServiceRole.entities.Lead.update(lead.id, {
      ...lead,
      last_activity_at: new Date().toISOString(),
      booking_error: `audit-booking-error-${stamp}`,
    });

    const fallbackLog = await waitForCustomerSms(base44, lead.id, 'booking_request_failed', 'customer_strategy_call_fallback');

    const confirmedAt = new Date(Date.now() + 3600000);
    const confirmedDate = confirmedAt.toISOString().slice(0, 10);
    const confirmedTime = confirmedAt.toISOString().slice(11, 16);
    const confirmedLead = await base44.asServiceRole.entities.Lead.update(lead.id, {
      ...failureUpdatedLead,
      last_activity_at: new Date().toISOString(),
      status: 'Strategy Call Booked',
      booking_status: 'confirmed',
      booking_provider: 'googlecalendar',
      booking_reference: `audit-customer-booking-${stamp}`,
      confirmed_meeting_date: confirmedDate,
      confirmed_meeting_time: confirmedTime,
    });

    const confirmedLog = await waitForCustomerSms(base44, lead.id, 'booking_confirmed', 'customer_booking_confirmation');

    return Response.json({
      success: true,
      lead_id: lead.id,
      keys: {
        request: buildCustomerStrategyRequestSmsKey(lead),
        fallback: buildCustomerBookingFallbackSmsKey({ ...failureUpdatedLead, id: lead.id }, `Customer SMS Audit ${stamp} has a strategy call booking issue: audit-booking-error-${stamp}`),
        confirmed: buildCustomerBookingSmsKey({ ...confirmedLead, id: lead.id }),
      },
      flows: {
        request: summarizeLog(requestLog),
        fallback: summarizeLog(fallbackLog),
        confirmed: summarizeLog(confirmedLog),
      },
      client_sms_logs: await listClientSmsLogs(base44, lead.id),
      all_logs: await listAllLogs(base44, lead.id),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});