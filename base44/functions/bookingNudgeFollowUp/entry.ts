import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const HIGH_INTENT_TAGS = new Set(['yes', 'call_me', 'preferred_time', 'tomorrow', 'urgent_interest']);
const BOOKING_RELATED_SMS_KINDS = new Set(['customer_strategy_call_request', 'customer_strategy_call_fallback']);
const DEFAULT_WINDOW_MINUTES = 30;
const DEFAULT_LOOKBACK_LIMIT = 80;
const REMINDER_DEDUPE_HOURS = 6;
const ESCALATION_DEDUPE_HOURS = 12;

function getErrorMessage(error) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'Unknown error';
}

function hasHighIntentTag(tag) {
  return HIGH_INTENT_TAGS.has(String(tag || ''));
}

function getHighIntentTags(log) {
  return (log?.metadata?.reply_intent_tags || []).filter((tag) => hasHighIntentTag(tag));
}

function isBookingConfirmed(lead) {
  return !!lead && (
    lead.status === 'Strategy Call Booked'
    || lead.booking_status === 'confirmed'
    || !!lead.booking_reference
    || (!!lead.confirmed_meeting_date && !!lead.confirmed_meeting_time)
  );
}

function isBookingRelatedLead(lead, log) {
  return !!lead && (
    !!lead.booking_intent
    || lead.enquiry_type === 'strategy_call'
    || BOOKING_RELATED_SMS_KINDS.has(log?.metadata?.matched_outbound_sms_kind)
  );
}

function buildBookingNudgeNextAction(tags) {
  if (tags.includes('call_me') && tags.includes('preferred_time')) {
    return 'Booking nudge: call this lead at their requested time and confirm the strategy call slot.';
  }

  if (tags.includes('call_me')) {
    return 'Booking nudge: call this lead and try to confirm the strategy call slot.';
  }

  if (tags.includes('preferred_time') || tags.includes('tomorrow')) {
    return 'Booking nudge: follow up on the requested time and confirm the strategy call slot.';
  }

  if (tags.includes('urgent_interest')) {
    return 'Booking nudge: prioritise fast follow-up and try to confirm the strategy call slot.';
  }

  return 'Booking nudge: follow up quickly and confirm whether the lead wants a strategy call slot.';
}

function buildNudgeCycleKey(leadId, inboundLogId) {
  return `booking_nudge:${leadId}:${inboundLogId}`;
}

function buildEscalationBucket(nowIso) {
  return Math.floor(new Date(nowIso).getTime() / (1000 * 60 * 60 * ESCALATION_DEDUPE_HOURS));
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizePhone(value) {
  return String(value || '').trim().replace(/\s+/g, '');
}

function readSecretValue(name) {
  const raw = String(Deno.env.get(name) || '').trim();
  const prefix = `${name}=`;
  return raw.startsWith(prefix) ? raw.slice(prefix.length).trim() : raw;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
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

function isProviderAcceptanceStatus(status) {
  return ['provider_accepted', 'queued', 'delivered'].includes(String(status || '').trim());
}

function isSmsProviderAcceptanceStatus(status) {
  return ['queued', 'sent', 'delivered'].includes(String(status || '').trim());
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

async function getLead(base44, leadId) {
  const leads = await base44.asServiceRole.entities.Lead.filter({ id: leadId }, '-updated_date', 1);
  return leads[0] || null;
}

async function hasRecentBookingConfirmedState(base44, leadId, receivedAt) {
  const recentBookingLogs = await base44.asServiceRole.entities.NotificationLog.filter({
    entity_id: leadId,
    event_type: 'booking_confirmed',
  }, '-created_date', 10);
  const windowStart = new Date(receivedAt).getTime() - (1000 * 60 * 60 * 48);

  return recentBookingLogs.some((log) => new Date(log.triggered_at || log.created_date).getTime() >= windowStart);
}

async function getRecentReminder(base44, leadId, inboundLogId, nowIso) {
  const reminders = await base44.asServiceRole.entities.NotificationLog.filter({
    entity_id: leadId,
    event_type: 'customer_sms_reply_received',
    channel: 'in_app',
    recipient_role: 'admin',
  }, '-created_date', 20);
  const windowStart = new Date(nowIso).getTime() - (1000 * 60 * 60 * REMINDER_DEDUPE_HOURS);

  return reminders.find((log) => {
    const reminderTime = new Date(log.triggered_at || log.created_date).getTime();
    return reminderTime >= windowStart
      && log.metadata?.alert_category === 'booking_nudge_reminder'
      && log.metadata?.inbound_sms_log_id === inboundLogId;
  }) || null;
}

async function hasRecentEscalation(base44, leadId, inboundLogId, nowIso) {
  const escalations = await base44.asServiceRole.entities.NotificationLog.filter({
    entity_id: leadId,
    event_type: 'booking_nudge_escalated',
    recipient_role: 'admin',
  }, '-created_date', 40);
  const windowStart = new Date(nowIso).getTime() - (1000 * 60 * 60 * ESCALATION_DEDUPE_HOURS);

  return escalations.some((log) => {
    const escalationTime = new Date(log.triggered_at || log.created_date).getTime();
    return escalationTime >= windowStart
      && log.metadata?.alert_category === 'booking_nudge_escalation'
      && log.metadata?.inbound_sms_log_id === inboundLogId;
  });
}

function isWorkedByAdmin(lead, expectedTask, receivedAt) {
  const currentTask = String(lead?.next_action || '').trim();
  const updatedAt = lead?.updated_date || lead?.last_activity_at || null;

  if (!updatedAt) {
    return false;
  }

  return currentTask && currentTask !== expectedTask && new Date(updatedAt).getTime() > new Date(receivedAt).getTime();
}

function buildEscalationPayload(lead, log, tags, dueAt, nowIso, expectedTask, latestReminder) {
  const leadName = lead.business_name || lead.full_name || 'Lead';
  const cycleKey = buildNudgeCycleKey(lead.id, log.id);
  const escalationBucket = buildEscalationBucket(nowIso);

  return {
    eventType: 'booking_nudge_escalated',
    entityName: 'Lead',
    entityId: lead.id,
    clientAccountId: lead.client_account_id || null,
    title: 'Overdue booking-nudge follow-up',
    message: `${leadName} is an overdue high-intent lead with no confirmed booking. Internal follow-up prompt only — this is not a confirmed booking.`,
    actorEmail: null,
    uniqueKey: `${cycleKey}:escalation:${escalationBucket}`,
    priority: 'high',
    smsMessage: `${leadName} is an overdue high-intent lead. No confirmed booking. Internal follow-up prompt only.`,
    metadata: {
      alert_category: 'booking_nudge_escalation',
      admin_link: `/LeadDetail?id=${lead.id}`,
      inbound_sms_log_id: log.id,
      inbound_message_at: log.triggered_at || log.created_date,
      booking_nudge_due_at: dueAt.toISOString(),
      escalation_bucket: escalationBucket,
      escalation_repeat_after_hours: ESCALATION_DEDUPE_HOURS,
      high_intent_tags: tags,
      latest_customer_message: log.message,
      expected_next_action: expectedTask,
      latest_reminder_at: latestReminder?.triggered_at || latestReminder?.created_date || null,
      internal_prompt_only: true,
      overdue_high_intent_lead: true,
      not_confirmed_booking: true,
      full_name: lead.full_name || null,
      business_name: lead.business_name || null,
      email: lead.email || null,
      mobile_number: lead.mobile_number || null,
      enquiry_type: lead.enquiry_type || null,
    },
  };
}

function buildEscalationEmailBody(alertPayload) {
  const metadata = alertPayload.metadata || {};
  const adminUrl = metadata.admin_link ? `https://app.base44.com/apps/${String(Deno.env.get('BASE44_APP_ID') || '').trim()}${metadata.admin_link}` : '';
  const latestReminderAt = metadata.latest_reminder_at ? new Date(metadata.latest_reminder_at).toLocaleString('en-AU', { timeZone: 'Australia/Sydney' }) : 'Not previously raised';
  const dueAt = metadata.booking_nudge_due_at ? new Date(metadata.booking_nudge_due_at).toLocaleString('en-AU', { timeZone: 'Australia/Sydney' }) : 'Unknown';
  const tags = (metadata.high_intent_tags || []).join(', ');

  return {
    text: [
      alertPayload.title,
      alertPayload.message,
      '',
      `Lead: ${metadata.business_name || metadata.full_name || 'Lead'}`,
      metadata.mobile_number ? `Phone: ${metadata.mobile_number}` : null,
      metadata.email ? `Email: ${metadata.email}` : null,
      tags ? `Intent tags: ${tags}` : null,
      `Reminder due: ${dueAt}`,
      `Latest reminder: ${latestReminderAt}`,
      `Customer message: ${metadata.latest_customer_message || ''}`,
      'Truthful status: internal follow-up prompt only. Not a confirmed booking.',
      adminUrl ? `Open lead: ${adminUrl}` : null,
    ].filter(Boolean).join('\n'),
    html: [
      '<div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a;">',
      `<h2 style="margin:0 0 12px;">${alertPayload.title}</h2>`,
      `<p style="margin:0 0 12px;">${alertPayload.message}</p>`,
      '<div style="border:1px solid #e2e8f0;border-radius:12px;padding:16px;background:#f8fafc;">',
      `<p style="margin:0 0 8px;"><strong>Lead:</strong> ${metadata.business_name || metadata.full_name || 'Lead'}</p>`,
      metadata.mobile_number ? `<p style="margin:0 0 8px;"><strong>Phone:</strong> ${metadata.mobile_number}</p>` : '',
      metadata.email ? `<p style="margin:0 0 8px;"><strong>Email:</strong> ${metadata.email}</p>` : '',
      tags ? `<p style="margin:0 0 8px;"><strong>Intent tags:</strong> ${tags}</p>` : '',
      `<p style="margin:0 0 8px;"><strong>Reminder due:</strong> ${dueAt}</p>`,
      `<p style="margin:0 0 8px;"><strong>Latest reminder:</strong> ${latestReminderAt}</p>`,
      `<p style="margin:0;"><strong>Customer message:</strong> ${metadata.latest_customer_message || ''}</p>`,
      '</div>',
      '<p style="margin:12px 0 0;font-weight:700;">Internal follow-up prompt only — not a confirmed booking.</p>',
      adminUrl ? `<p style="margin:12px 0 0;"><a href="${adminUrl}" style="color:#2563eb;">Open lead in admin</a></p>` : '',
      '</div>',
    ].join(''),
  };
}

async function findExistingLog(base44, payload, uniqueKey) {
  const existing = await base44.asServiceRole.entities.NotificationLog.filter({
    entity_id: payload.entity_id,
    event_type: payload.event_type,
    recipient_email: payload.recipient_email,
    channel: payload.channel,
  }, '-created_date', 20);

  return existing.find((item) => {
    const providerMessage = typeof item.provider_message === 'string' ? item.provider_message : '';
    return providerMessage.includes(buildEventKey(uniqueKey)) || item.metadata?.unique_key === uniqueKey;
  }) || null;
}

async function createLog(base44, payload, uniqueKey) {
  const existing = await findExistingLog(base44, payload, uniqueKey);
  if (existing) {
    return { record: existing, isDuplicate: true };
  }

  const record = await base44.asServiceRole.entities.NotificationLog.create(payload);
  return { record, isDuplicate: false };
}

async function updateLog(base44, record, updates) {
  return base44.asServiceRole.entities.NotificationLog.update(record.id, {
    ...record,
    ...updates,
  });
}

async function sendResendEmail(to, subject, body) {
  const apiKey = readSecretValue('RESEND_API_KEY');
  const fromEmail = readSecretValue('RESEND_FROM_EMAIL');
  const destination = normalizeEmail(to);

  if (!apiKey || !fromEmail || !destination) {
    return {
      status: 'not_configured',
      details: 'Resend API key, sender email, or destination email are missing.',
      providerMessageId: null,
      providerResponse: null,
      fromEmail: fromEmail || null,
    };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [destination],
      subject,
      text: body.text,
      html: body.html,
    }),
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
      details: parsed?.message || parsed?.error || resultText || 'Resend email send failed.',
      providerMessageId: parsed?.id || null,
      providerResponse: parsed || resultText || null,
      fromEmail: fromEmail || null,
    };
  }

  return {
    status: 'provider_accepted',
    details: 'Email accepted by Resend.',
    providerMessageId: parsed?.id || null,
    providerResponse: parsed || resultText || null,
    fromEmail: fromEmail || null,
  };
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

  const body = new URLSearchParams({ From: fromNumber, To: destination, Body: message });
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
      fromNumberUsed: fromNumber || null,
    };
  }

  return {
    status: mapTwilioSmsDeliveryStatus(parsed?.status),
    details: parsed?.status || 'Twilio SMS accepted.',
    providerMessageId: getProviderMessageId(parsed),
    providerResponse: parsed || resultText || null,
    providerStatus: parsed?.status || null,
    providerErrorCode: parsed?.error_code ? String(parsed.error_code) : null,
    fromNumberUsed: parsed?.from || fromNumber,
  };
}

async function sendBookingNudgeEscalation(base44, req, alertPayload, nowIso) {
  const metadata = {
    ...(alertPayload.metadata || {}),
    unique_key: alertPayload.uniqueKey,
    priority: alertPayload.priority,
    entity_event_type: alertPayload.eventType,
  };
  const adminEmail = normalizeEmail(Deno.env.get('ADMIN_NOTIFICATION_EMAIL'));
  const adminPhone = normalizePhone(Deno.env.get('ADMIN_NOTIFICATION_PHONE'));
  const emailRecipient = isValidEmail(adminEmail) ? adminEmail : null;
  const smsStatusCallbackUrl = buildFunctionUrl(req.url, 'twilioStatusCallback');
  const emailBody = buildEscalationEmailBody({ ...alertPayload, metadata });
  const results = { in_app: null, email: null, sms: null };

  const inAppResult = await createLog(base44, {
    event_type: alertPayload.eventType,
    entity_name: alertPayload.entityName,
    entity_id: alertPayload.entityId,
    client_account_id: alertPayload.clientAccountId,
    recipient_role: 'admin',
    recipient_email: emailRecipient,
    channel: 'in_app',
    delivery_status: 'stored',
    provider_name: 'AssistantAI Alerts',
    provider_message: buildProviderMessage(alertPayload.uniqueKey),
    title: alertPayload.title,
    message: alertPayload.message,
    triggered_at: nowIso,
    actor_email: alertPayload.actorEmail,
    metadata,
  }, alertPayload.uniqueKey);
  results.in_app = inAppResult.isDuplicate ? 'duplicate_skipped' : 'stored';

  const emailLog = await createLog(base44, {
    event_type: alertPayload.eventType,
    entity_name: alertPayload.entityName,
    entity_id: alertPayload.entityId,
    client_account_id: alertPayload.clientAccountId,
    recipient_role: 'admin',
    recipient_email: emailRecipient,
    channel: 'email',
    delivery_status: emailRecipient ? 'queued' : 'not_configured',
    provider_name: 'Resend',
    provider_message: buildProviderMessage(alertPayload.uniqueKey),
    title: alertPayload.title,
    message: alertPayload.message,
    triggered_at: nowIso,
    actor_email: alertPayload.actorEmail,
    metadata,
  }, alertPayload.uniqueKey);

  if (emailLog.isDuplicate) {
    results.email = { status: 'duplicate_skipped', delivery_status: 'duplicate_skipped', attempted: false, sent: false };
  } else if (!emailRecipient) {
    await updateLog(base44, emailLog.record, {
      delivery_status: 'not_configured',
      provider_message: buildProviderMessage(alertPayload.uniqueKey, 'No valid admin email recipient available.'),
      metadata: { ...metadata, email_attempted: false, email_sent: false, email_delivery_status: 'not_configured' },
    });
    results.email = { status: 'not_configured', delivery_status: 'not_configured', attempted: false, sent: false };
  } else {
    const emailResult = await sendResendEmail(emailRecipient, `[High Priority] ${alertPayload.title}`, emailBody);
    await updateLog(base44, emailLog.record, {
      delivery_status: emailResult.status,
      provider_message: buildProviderMessage(alertPayload.uniqueKey, emailResult.providerResponse || emailResult.details),
      provider_message_id: emailResult.providerMessageId,
      metadata: {
        ...metadata,
        email_attempted: true,
        email_sent: isProviderAcceptanceStatus(emailResult.status),
        email_delivery_status: emailResult.status,
        email_provider_message_id: emailResult.providerMessageId || null,
      },
    });
    results.email = {
      status: emailResult.status,
      delivery_status: emailResult.status,
      attempted: true,
      sent: isProviderAcceptanceStatus(emailResult.status),
      provider_message_id: emailResult.providerMessageId || null,
    };
  }

  const smsLog = await createLog(base44, {
    event_type: alertPayload.eventType,
    entity_name: alertPayload.entityName,
    entity_id: alertPayload.entityId,
    client_account_id: alertPayload.clientAccountId,
    recipient_role: 'admin',
    recipient_email: adminPhone || null,
    channel: 'sms',
    delivery_status: adminPhone ? 'queued' : 'not_configured',
    provider_name: 'Twilio',
    provider_message: buildProviderMessage(alertPayload.uniqueKey),
    title: alertPayload.title,
    message: alertPayload.smsMessage,
    triggered_at: nowIso,
    actor_email: alertPayload.actorEmail,
    metadata,
  }, alertPayload.uniqueKey);

  if (smsLog.isDuplicate) {
    results.sms = { status: 'duplicate_skipped', delivery_status: 'duplicate_skipped', attempted: false, sent: false };
  } else if (!adminPhone) {
    await updateLog(base44, smsLog.record, {
      delivery_status: 'not_configured',
      provider_message: buildProviderMessage(alertPayload.uniqueKey, 'No admin phone is configured.'),
      metadata: { ...metadata, sms_attempted: false, sms_sent: false, sms_delivery_status: 'not_configured' },
    });
    results.sms = { status: 'not_configured', delivery_status: 'not_configured', attempted: false, sent: false };
  } else {
    const smsResult = await sendTwilioSms(alertPayload.smsMessage, adminPhone, smsStatusCallbackUrl);
    await updateLog(base44, smsLog.record, {
      delivery_status: smsResult.status,
      provider_message: buildProviderMessage(alertPayload.uniqueKey, smsResult.providerResponse || smsResult.details),
      provider_message_id: smsResult.providerMessageId,
      provider_status: smsResult.providerStatus,
      provider_error_code: smsResult.providerErrorCode,
      provider_error_message: ['failed', 'undelivered'].includes(smsResult.status) ? smsResult.details : null,
      delivered_at: smsResult.status === 'delivered' ? nowIso : null,
      failed_at: ['failed', 'undelivered'].includes(smsResult.status) ? nowIso : null,
      metadata: {
        ...metadata,
        sms_attempted: true,
        sms_sent: isSmsProviderAcceptanceStatus(smsResult.status),
        sms_delivery_status: smsResult.status,
        sms_provider_message_id: smsResult.providerMessageId || null,
        sms_provider_status: smsResult.providerStatus || null,
        sms_status_callback_url: smsStatusCallbackUrl,
      },
    });
    results.sms = {
      status: smsResult.status,
      delivery_status: smsResult.status,
      attempted: true,
      sent: isSmsProviderAcceptanceStatus(smsResult.status),
      provider_message_id: smsResult.providerMessageId || null,
      provider_status: smsResult.providerStatus || null,
    };
  }

  return {
    duplicate: results.in_app === 'duplicate_skipped' && results.email?.status === 'duplicate_skipped' && results.sms?.status === 'duplicate_skipped',
    results,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    const nowIso = payload?.currentTime || new Date().toISOString();
    const windowMinutes = Math.max(5, Number(payload?.windowMinutes) || DEFAULT_WINDOW_MINUTES);
    const limit = Math.max(1, Math.min(200, Number(payload?.limit) || DEFAULT_LOOKBACK_LIMIT));
    const forceDue = !!payload?.forceDue;
    const leadId = String(payload?.leadId || '').trim();

    const logs = leadId
      ? await base44.asServiceRole.entities.NotificationLog.filter({ entity_id: leadId, event_type: 'customer_sms_reply_received', channel: 'sms', match_status: 'matched' }, '-created_date', limit)
      : await base44.asServiceRole.entities.NotificationLog.filter({ event_type: 'customer_sms_reply_received', channel: 'sms', match_status: 'matched' }, '-created_date', limit);

    const latestPerLead = new Map();
    for (const log of logs) {
      if (!log?.entity_id || latestPerLead.has(log.entity_id)) {
        continue;
      }

      const tags = getHighIntentTags(log);
      if (log.sender_role !== 'client' || tags.length === 0) {
        continue;
      }

      latestPerLead.set(log.entity_id, { log, tags });
    }

    const results = [];

    for (const { log, tags } of latestPerLead.values()) {
      const lead = await getLead(base44, log.entity_id);
      if (!lead) {
        results.push({ lead_id: log.entity_id, status: 'skipped_missing_lead' });
        continue;
      }

      if (!isBookingRelatedLead(lead, log)) {
        results.push({ lead_id: lead.id, status: 'skipped_not_booking_context' });
        continue;
      }

      if (isBookingConfirmed(lead) || await hasRecentBookingConfirmedState(base44, lead.id, log.triggered_at || log.created_date)) {
        results.push({ lead_id: lead.id, status: 'skipped_booking_confirmed' });
        continue;
      }

      const expectedTask = buildBookingNudgeNextAction(tags);
      if (isWorkedByAdmin(lead, expectedTask, log.triggered_at || log.created_date)) {
        results.push({ lead_id: lead.id, status: 'skipped_worked_by_admin' });
        continue;
      }

      const dueAt = new Date(new Date(log.triggered_at || log.created_date).getTime() + (windowMinutes * 60 * 1000));
      if (!forceDue && new Date(nowIso).getTime() < dueAt.getTime()) {
        results.push({ lead_id: lead.id, status: 'skipped_not_due', due_at: dueAt.toISOString() });
        continue;
      }

      const recentReminder = await getRecentReminder(base44, lead.id, log.id, nowIso);
      if (!recentReminder) {
        const leadName = lead.business_name || lead.full_name || 'Lead';
        await base44.asServiceRole.entities.NotificationLog.create({
          event_type: 'customer_sms_reply_received',
          entity_name: 'Lead',
          entity_id: lead.id,
          client_account_id: lead.client_account_id || null,
          recipient_role: 'admin',
          recipient_email: normalizeEmail(Deno.env.get('ADMIN_NOTIFICATION_EMAIL')) || null,
          channel: 'in_app',
          delivery_status: 'stored',
          provider_name: 'AssistantAI Alerts',
          provider_message: `${buildNudgeCycleKey(lead.id, log.id)}:reminder:${Math.floor(new Date(nowIso).getTime() / (1000 * 60 * 60 * REMINDER_DEDUPE_HOURS))}`,
          title: 'Booking follow-up reminder needed',
          message: `${leadName} sent a high-intent SMS but no booking is confirmed yet. Internal follow-up prompt only.`,
          triggered_at: nowIso,
          actor_email: null,
          metadata: {
            alert_category: 'booking_nudge_reminder',
            admin_link: `/LeadDetail?id=${lead.id}`,
            inbound_sms_log_id: log.id,
            inbound_message_at: log.triggered_at || log.created_date,
            booking_nudge_due_at: dueAt.toISOString(),
            high_intent_tags: tags,
            latest_customer_message: log.message,
            expected_next_action: expectedTask,
            internal_prompt_only: true,
            not_confirmed_booking: true,
          },
        });

        results.push({
          lead_id: lead.id,
          status: 'reminder_created',
          due_at: dueAt.toISOString(),
          expected_next_action: expectedTask,
        });
        continue;
      }

      if (await hasRecentEscalation(base44, lead.id, log.id, nowIso)) {
        results.push({
          lead_id: lead.id,
          status: 'skipped_recent_escalation',
          due_at: dueAt.toISOString(),
        });
        continue;
      }

      const escalationData = await sendBookingNudgeEscalation(
        base44,
        req,
        buildEscalationPayload(lead, log, tags, dueAt, nowIso, expectedTask, recentReminder),
        nowIso,
      );

      if (escalationData.duplicate) {
        results.push({
          lead_id: lead.id,
          status: 'skipped_recent_escalation',
          due_at: dueAt.toISOString(),
        });
        continue;
      }

      results.push({
        lead_id: lead.id,
        status: 'escalated',
        due_at: dueAt.toISOString(),
        escalation_time: nowIso,
        channels: escalationData.results,
      });
    }

    return Response.json({
      success: true,
      now: nowIso,
      window_minutes: windowMinutes,
      reviewed: results.length,
      reminders_created: results.filter((item) => item.status === 'reminder_created').length,
      escalations_created: results.filter((item) => item.status === 'escalated').length,
      reminder_duplicate_skips: results.filter((item) => item.status === 'skipped_recent_duplicate').length,
      escalation_duplicate_skips: results.filter((item) => item.status === 'skipped_recent_escalation').length,
      confirmed_skips: results.filter((item) => item.status === 'skipped_booking_confirmed').length,
      results,
    });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
});