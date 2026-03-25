import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const EVENT_TYPE_ALIASES = {
  booking_failed: 'booking_request_failed',
};

const SUPPORTED_EVENT_TYPES = new Set([
  'new_lead_created',
  'strategy_call_requested',
  'booking_confirmed',
  'booking_request_failed',
  'lead_marked_won',
  'onboarding_created',
  'onboarding_intake_submitted',
  'billing_status_changed',
  'integration_status_changed',
  'note_added',
  'support_conversation_created',
  'support_conversation_reply',
  'customer_sms_reply_received',
  'booking_nudge_escalated',
]);

function getErrorMessage(error) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'Unknown error';
}

function normalizeEventType(eventType) {
  return EVENT_TYPE_ALIASES[eventType] || eventType;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
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

function buildAlertMetadata(metadata, normalizedEventType, uniqueKey, priority) {
  return {
    ...(metadata || {}),
    entity_event_type: normalizedEventType,
    unique_key: uniqueKey,
    priority,
  };
}

function formatMeetingDateTime(date, time) {
  if (!date && !time) {
    return '';
  }

  return [date || '', time || ''].filter(Boolean).join(' ');
}

function formatPhoneForDisplay(value) {
  const phone = String(value || '').trim();

  if (!phone) {
    return '';
  }

  if (phone.startsWith('+61') && phone.length === 12) {
    return `0${phone.slice(3, 4)} ${phone.slice(4, 8)} ${phone.slice(8)}`;
  }

  return phone;
}

function buildAdminUrl(path) {
  const trimmedPath = String(path || '').trim();

  if (!trimmedPath) {
    return '';
  }

  const appId = String(Deno.env.get('BASE44_APP_ID') || '').trim();
  if (!appId) {
    return trimmedPath;
  }

  return `https://app.base44.com/apps/${appId}${trimmedPath.startsWith('/') ? trimmedPath : `/${trimmedPath}`}`;
}

function buildFunctionUrl(requestUrl, functionName) {
  const url = new URL(requestUrl);
  url.pathname = url.pathname.replace(/\/[^/]+$/, `/${functionName}`);
  url.search = '';
  url.hash = '';
  return url.toString();
}

function buildEmailBody(title, message, metadata, normalizedEventType, priority) {
  const enquiryType = metadata.enquiry_type || metadata.enquiry_category || '';
  const leadName = metadata.full_name || metadata.business_name || 'New lead';
  const businessName = metadata.business_name || '';
  const leadPhone = formatPhoneForDisplay(metadata.mobile_number);
  const adminUrl = buildAdminUrl(metadata.admin_link);
  const phoneHref = metadata.mobile_number ? `tel:${String(metadata.mobile_number).replace(/\s+/g, '')}` : '';
  const priorityLabel = priority === 'high' || priority === 'urgent' ? 'HIGH PRIORITY' : 'Standard priority';
  const confirmedMeeting = formatMeetingDateTime(metadata.confirmed_meeting_date, metadata.confirmed_meeting_time);
  const preferredMeeting = formatMeetingDateTime(metadata.preferred_meeting_date, metadata.preferred_meeting_time);

  return {
    text: [
      `${priorityLabel} — ${title}`,
      message,
      '',
      `Lead: ${leadName}`,
      businessName ? `Business: ${businessName}` : null,
      enquiryType ? `Enquiry: ${enquiryType}` : null,
      leadPhone ? `Call now: ${leadPhone}` : null,
      metadata.email ? `Email: ${metadata.email}` : null,
      confirmedMeeting ? `Confirmed: ${confirmedMeeting}` : null,
      !confirmedMeeting && preferredMeeting ? `Preferred: ${preferredMeeting}` : null,
      adminUrl ? `Open lead: ${adminUrl}` : null,
      `Event: ${normalizedEventType}`,
    ].filter(Boolean).join('\n'),
    html: [
      '<div style="font-family:Arial,sans-serif;line-height:1.45;color:#0f172a;padding:12px 0;">',
      `<div style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${priority === 'high' || priority === 'urgent' ? '#b91c1c' : '#475569'};margin-bottom:8px;">${priorityLabel}</div>`,
      `<div style="font-size:18px;font-weight:700;margin-bottom:8px;">${title}</div>`,
      `<div style="font-size:14px;color:#334155;margin-bottom:14px;">${message}</div>`,
      '<div style="border:1px solid #e2e8f0;border-radius:12px;padding:14px;background:#f8fafc;">',
      `<div style="font-size:16px;font-weight:700;margin-bottom:8px;">${leadName}</div>`,
      enquiryType ? `<div style="font-size:14px;margin-bottom:6px;"><strong>Enquiry:</strong> ${enquiryType}</div>` : '',
      businessName ? `<div style="font-size:14px;margin-bottom:6px;"><strong>Business:</strong> ${businessName}</div>` : '',
      metadata.email ? `<div style="font-size:14px;margin-bottom:6px;"><strong>Email:</strong> <a href="mailto:${metadata.email}" style="color:#2563eb;text-decoration:none;">${metadata.email}</a></div>` : '',
      leadPhone ? `<div style="font-size:14px;margin-bottom:6px;"><strong>Call:</strong> <a href="${phoneHref}" style="color:#2563eb;text-decoration:none;font-weight:700;">${leadPhone}</a></div>` : '',
      confirmedMeeting ? `<div style="font-size:14px;margin-bottom:6px;"><strong>Confirmed:</strong> ${confirmedMeeting}</div>` : '',
      !confirmedMeeting && preferredMeeting ? `<div style="font-size:14px;margin-bottom:6px;"><strong>Preferred:</strong> ${preferredMeeting}</div>` : '',
      '</div>',
      adminUrl ? `<div style="margin-top:14px;"><a href="${adminUrl}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:10px;font-size:14px;font-weight:700;">Open Lead in Admin</a></div>` : '',
      '</div>',
    ].join(''),
  };
}

function buildSmsAlertMessage(title, message, metadata, priority) {
  const leadName = metadata?.full_name || metadata?.business_name || 'Lead';
  const enquiryType = metadata?.enquiry_type || metadata?.enquiry_category || 'general';
  const priorityPrefix = priority === 'high' || priority === 'urgent' ? 'HIGH' : 'ALERT';
  const fallbackMessage = String(message || title || '').trim();
  const base = `${priorityPrefix}: ${enquiryType} | ${leadName}`;
  const body = fallbackMessage && !fallbackMessage.toLowerCase().includes(String(enquiryType).toLowerCase())
    ? `${base} | ${fallbackMessage}`
    : base;

  return body.slice(0, 160);
}

function getProviderMessageId(data) {
  return data?.sid || data?.id || data?.messageId || data?.message_id || null;
}

function buildChannelMetadata(baseMetadata, channel, diagnostics) {
  return {
    ...baseMetadata,
    [`${channel}_attempted`]: !!diagnostics.attempted,
    [`${channel}_sent`]: !!diagnostics.sent,
    [`${channel}_delivery_status`]: diagnostics.deliveryStatus || null,
    [`${channel}_sent_definition`]: channel === 'sms'
      ? 'Twilio accepted/send state only until callback confirms final delivery'
      : 'provider acceptance only',
    [`${channel}_error`]: diagnostics.error || null,
    [`${channel}_provider_message_id`]: diagnostics.providerMessageId || null,
    [`${channel}_provider_response`]: diagnostics.providerResponse || null,
    [`${channel}_actual_recipient`]: diagnostics.actualRecipient || null,
    [`${channel}_configured_recipient`]: diagnostics.configuredRecipient || null,
    [`${channel}_delivery_path`]: diagnostics.deliveryPath || null,
    [`${channel}_fallback_reason`]: diagnostics.fallbackReason || null,
    [`${channel}_from_address`]: diagnostics.fromAddress || null,
    [`${channel}_from_number_used`]: diagnostics.fromNumberUsed || diagnostics.fromAddress || null,
    [`${channel}_config_source`]: diagnostics.configSource || null,
    [`${channel}_provider_status`]: diagnostics.providerStatus || null,
    [`${channel}_provider_error_code`]: diagnostics.providerErrorCode || null,
    [`${channel}_status_callback_url`]: diagnostics.statusCallbackUrl || null,
  };
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

async function findExistingLog(base44, payload, uniqueKey) {
  const existing = await base44.asServiceRole.entities.NotificationLog.filter({
    entity_id: payload.entity_id,
    event_type: payload.event_type,
    recipient_email: payload.recipient_email,
    channel: payload.channel,
  }, '-created_date', 20);

  return existing.find((item) => {
    const providerMessage = typeof item.provider_message === 'string' ? item.provider_message : '';
    const metadataUniqueKey = item.metadata?.unique_key;
    return providerMessage.includes(buildEventKey(uniqueKey)) || metadataUniqueKey === uniqueKey;
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

function resolveEmailRecipient(configuredEmail) {
  const normalizedConfiguredEmail = normalizeEmail(configuredEmail);

  if (!normalizedConfiguredEmail) {
    return {
      configuredRecipient: null,
      actualRecipient: null,
      deliveryPath: 'unavailable',
      fallbackReason: 'ADMIN_NOTIFICATION_EMAIL is missing.',
    };
  }

  if (!isValidEmail(normalizedConfiguredEmail)) {
    return {
      configuredRecipient: normalizedConfiguredEmail,
      actualRecipient: null,
      deliveryPath: 'invalid_configured_email',
      fallbackReason: 'ADMIN_NOTIFICATION_EMAIL is not a valid email address.',
    };
  }

  return {
    configuredRecipient: normalizedConfiguredEmail,
    actualRecipient: normalizedConfiguredEmail,
    deliveryPath: 'configured_admin_email',
    fallbackReason: null,
  };
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
      fromEmail,
    };
  }

  return {
    status: 'provider_accepted',
    details: 'Email accepted by Resend.',
    providerMessageId: parsed?.id || null,
    providerResponse: parsed || resultText || null,
    fromEmail,
  };
}

async function sendTwilioSms(message, to, statusCallbackUrl) {
  const accountSid = String(readSecretValue('TWILIO_ACCOUNT_SID') || '').trim();
  const authToken = String(readSecretValue('TWILIO_AUTH_TOKEN') || '').trim();
  const fromNumber = normalizePhone(readSecretValue('TWILIO_FROM_NUMBER'));
  const destination = normalizePhone(to);
  const configSource = fromNumber ? 'env' : 'missing';

  if (!accountSid || !authToken || !fromNumber || !destination) {
    return {
      status: 'not_configured',
      details: 'Twilio credentials, from number, or destination number are missing.',
      providerMessageId: null,
      providerResponse: null,
      providerStatus: null,
      providerErrorCode: null,
      fromNumberUsed: fromNumber || null,
      configSource,
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

  const mismatchError = parsed?.message && /from/i.test(String(parsed.message))
    ? `Twilio rejected sender ${fromNumber}: ${parsed.message}`
    : null;

  if (!response.ok) {
    return {
      status: 'failed',
      details: mismatchError || parsed?.message || resultText || 'Twilio SMS send failed.',
      providerMessageId: getProviderMessageId(parsed),
      providerResponse: parsed || resultText || null,
      providerStatus: parsed?.status || null,
      providerErrorCode: parsed?.error_code ? String(parsed.error_code) : null,
      fromNumberUsed: fromNumber,
      configSource,
    };
  }

  return {
    status: mapTwilioSmsDeliveryStatus(parsed?.status),
    details: parsed?.status || 'Twilio SMS accepted by Twilio.',
    providerStatus: parsed?.status || null,
    providerMessageId: getProviderMessageId(parsed),
    providerResponse: parsed || resultText || null,
    providerErrorCode: parsed?.error_code ? String(parsed.error_code) : null,
    fromNumberUsed: parsed?.from || fromNumber,
    configSource,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const {
      eventType,
      entityName,
      entityId,
      clientAccountId = null,
      title,
      message,
      actorEmail = null,
      metadata = {},
      uniqueKey,
      priority = 'normal',
      smsMessage,
    } = payload;

    if (!eventType || !entityName || !entityId || !title || !message || !uniqueKey) {
      return Response.json({ error: 'eventType, entityName, entityId, title, message, and uniqueKey are required' }, { status: 400 });
    }

    const normalizedEventType = normalizeEventType(eventType);
    if (!SUPPORTED_EVENT_TYPES.has(normalizedEventType)) {
      return Response.json({ error: `Unsupported eventType: ${eventType}` }, { status: 400 });
    }

    const configuredAdminEmail = normalizeEmail(Deno.env.get('ADMIN_NOTIFICATION_EMAIL'));
    const configuredAdminPhone = normalizePhone(Deno.env.get('ADMIN_NOTIFICATION_PHONE'));
    const resendFromEmail = readSecretValue('RESEND_FROM_EMAIL');
    const emailRecipient = resolveEmailRecipient(configuredAdminEmail);
    const triggeredAt = new Date().toISOString();
    const subject = priority === 'high' || priority === 'urgent' ? `[High Priority] ${title}` : title;
    const alertMetadata = buildAlertMetadata(metadata, normalizedEventType, uniqueKey, priority);
    const emailBody = buildEmailBody(title, message, alertMetadata, normalizedEventType, priority);
    const textMessage = buildSmsAlertMessage(title, smsMessage || message, alertMetadata, priority);
    const smsStatusCallbackUrl = buildFunctionUrl(req.url, 'twilioStatusCallback');

    const results = { in_app: null, email: null, sms: null };

    const inAppResult = await createLog(base44, {
      event_type: normalizedEventType,
      entity_name: entityName,
      entity_id: entityId,
      client_account_id: clientAccountId,
      recipient_role: 'admin',
      recipient_email: emailRecipient.actualRecipient || configuredAdminEmail || null,
      channel: 'in_app',
      delivery_status: 'stored',
      provider_name: 'AssistantAI Alerts',
      provider_message: buildProviderMessage(uniqueKey),
      title,
      message,
      triggered_at: triggeredAt,
      actor_email: actorEmail,
      metadata: alertMetadata,
    }, uniqueKey);
    results.in_app = inAppResult.isDuplicate ? 'duplicate_skipped' : 'stored';

    const emailDiagnostics = {
      attempted: false,
      sent: false,
      deliveryStatus: null,
      error: null,
      providerMessageId: null,
      providerResponse: null,
      actualRecipient: emailRecipient.actualRecipient,
      configuredRecipient: emailRecipient.configuredRecipient,
      deliveryPath: emailRecipient.deliveryPath,
      fallbackReason: emailRecipient.fallbackReason,
      fromAddress: resendFromEmail || null,
      providerStatus: null,
      providerErrorCode: null,
      statusCallbackUrl: null,
    };

    const emailResult = await createLog(base44, {
      event_type: normalizedEventType,
      entity_name: entityName,
      entity_id: entityId,
      client_account_id: clientAccountId,
      recipient_role: 'admin',
      recipient_email: emailRecipient.actualRecipient || configuredAdminEmail || null,
      channel: 'email',
      delivery_status: emailRecipient.actualRecipient ? 'queued' : 'not_configured',
      provider_name: 'Resend',
      provider_message: buildProviderMessage(uniqueKey),
      title,
      message,
      triggered_at: triggeredAt,
      actor_email: actorEmail,
      metadata: buildChannelMetadata(alertMetadata, 'email', emailDiagnostics),
    }, uniqueKey);

    if (emailResult.isDuplicate) {
      results.email = {
        status: 'duplicate_skipped',
        delivery_status: 'duplicate_skipped',
        attempted: false,
        sent: false,
        sent_definition: 'provider acceptance only',
        provider_accepted: false,
        delivered: false,
        recipient: emailRecipient.actualRecipient || null,
        error: null,
        provider: 'resend',
        from_address: resendFromEmail || null,
      };
    } else if (!emailRecipient.actualRecipient) {
      emailDiagnostics.deliveryStatus = 'not_configured';
      emailDiagnostics.error = emailRecipient.fallbackReason || 'No valid admin email recipient available.';
      await updateLog(base44, emailResult.record, {
        delivery_status: 'not_configured',
        provider_message: buildProviderMessage(uniqueKey, emailDiagnostics.error),
        metadata: buildChannelMetadata(alertMetadata, 'email', emailDiagnostics),
      });
      results.email = {
        status: 'not_configured',
        delivery_status: 'not_configured',
        attempted: false,
        sent: false,
        sent_definition: 'provider acceptance only',
        provider_accepted: false,
        delivered: false,
        recipient: null,
        error: emailDiagnostics.error,
        provider: 'resend',
        from_address: resendFromEmail || null,
      };
    } else {
      emailDiagnostics.attempted = true;

      try {
        const resendResult = await sendResendEmail(
          emailRecipient.actualRecipient,
          subject,
          emailBody,
        );
        emailDiagnostics.deliveryStatus = resendResult.status;
        emailDiagnostics.sent = isProviderAcceptanceStatus(resendResult.status);
        emailDiagnostics.error = resendResult.status === 'failed' ? resendResult.details : null;
        emailDiagnostics.providerMessageId = resendResult.providerMessageId || null;
        emailDiagnostics.providerResponse = resendResult.providerResponse || null;
        emailDiagnostics.fromAddress = resendResult.fromEmail || emailDiagnostics.fromAddress || null;
        await updateLog(base44, emailResult.record, {
          delivery_status: resendResult.status,
          provider_message: buildProviderMessage(uniqueKey, {
            status: resendResult.status,
            delivery_status: resendResult.status,
            error: emailDiagnostics.error,
            provider_message_id: emailDiagnostics.providerMessageId,
            provider_response: emailDiagnostics.providerResponse,
            from_address: emailDiagnostics.fromAddress,
          }),
          metadata: buildChannelMetadata(alertMetadata, 'email', emailDiagnostics),
        });
        results.email = {
          status: resendResult.status,
          delivery_status: resendResult.status,
          attempted: true,
          sent: emailDiagnostics.sent,
          sent_definition: 'provider acceptance only',
          provider_accepted: resendResult.status === 'provider_accepted' || resendResult.status === 'queued' || resendResult.status === 'delivered',
          delivered: resendResult.status === 'delivered',
          recipient: emailRecipient.actualRecipient,
          error: emailDiagnostics.error,
          provider_message_id: emailDiagnostics.providerMessageId,
          provider: 'resend',
          from_address: emailDiagnostics.fromAddress,
        };
      } catch (error) {
        emailDiagnostics.deliveryStatus = 'failed';
        emailDiagnostics.error = getErrorMessage(error);
        await updateLog(base44, emailResult.record, {
          delivery_status: 'failed',
          provider_message: buildProviderMessage(uniqueKey, {
            status: 'failed',
            delivery_status: 'failed',
            error: emailDiagnostics.error,
            from_address: emailDiagnostics.fromAddress,
          }),
          metadata: buildChannelMetadata(alertMetadata, 'email', emailDiagnostics),
        });
        results.email = {
          status: 'failed',
          delivery_status: 'failed',
          attempted: true,
          sent: false,
          sent_definition: 'provider acceptance only',
          provider_accepted: false,
          delivered: false,
          recipient: emailRecipient.actualRecipient,
          error: emailDiagnostics.error,
          fallback_reason: emailRecipient.fallbackReason,
          provider: 'resend',
          from_address: emailDiagnostics.fromAddress,
        };
      }
    }

    const twilioFromNumber = normalizePhone(readSecretValue('TWILIO_FROM_NUMBER'));
    const smsDiagnostics = {
      attempted: false,
      sent: false,
      deliveryStatus: null,
      error: null,
      providerMessageId: null,
      providerResponse: null,
      actualRecipient: configuredAdminPhone || null,
      configuredRecipient: configuredAdminPhone || null,
      deliveryPath: configuredAdminPhone ? 'configured_admin_phone' : 'unavailable',
      fallbackReason: configuredAdminPhone ? null : 'No admin phone is configured.',
      fromAddress: twilioFromNumber || null,
      fromNumberUsed: twilioFromNumber || null,
      configSource: twilioFromNumber ? 'env' : 'missing',
      providerStatus: null,
      providerErrorCode: null,
      statusCallbackUrl: smsStatusCallbackUrl,
    };

    const smsResultLog = await createLog(base44, {
      event_type: normalizedEventType,
      entity_name: entityName,
      entity_id: entityId,
      client_account_id: clientAccountId,
      recipient_role: 'admin',
      recipient_email: configuredAdminPhone || null,
      channel: 'sms',
      delivery_status: configuredAdminPhone ? 'queued' : 'not_configured',
      provider_name: 'Twilio',
      provider_message: buildProviderMessage(uniqueKey),
      provider_message_id: null,
      provider_status: null,
      provider_error_code: null,
      provider_error_message: null,
      title,
      message: textMessage,
      triggered_at: triggeredAt,
      delivered_at: null,
      failed_at: null,
      actor_email: actorEmail,
      metadata: buildChannelMetadata(alertMetadata, 'sms', smsDiagnostics),
    }, uniqueKey);

    if (smsResultLog.isDuplicate) {
      results.sms = {
        status: 'duplicate_skipped',
        delivery_status: 'duplicate_skipped',
        attempted: false,
        sent: false,
        sent_definition: 'Twilio accepted/send state only until callback confirms final delivery',
        provider_accepted: false,
        delivered: false,
        recipient: configuredAdminPhone || null,
        error: null,
      };
    } else if (!configuredAdminPhone) {
      smsDiagnostics.deliveryStatus = 'not_configured';
      smsDiagnostics.error = smsDiagnostics.fallbackReason;
      await updateLog(base44, smsResultLog.record, {
        delivery_status: 'not_configured',
        provider_error_message: smsDiagnostics.error,
        provider_message: buildProviderMessage(uniqueKey, smsDiagnostics.error),
        metadata: buildChannelMetadata(alertMetadata, 'sms', smsDiagnostics),
      });
      results.sms = {
        status: 'not_configured',
        delivery_status: 'not_configured',
        attempted: false,
        sent: false,
        sent_definition: 'Twilio accepted/send state only until callback confirms final delivery',
        provider_accepted: false,
        delivered: false,
        recipient: null,
        error: smsDiagnostics.error,
        provider_response: null,
        from_number_used: smsDiagnostics.fromNumberUsed,
        config_source: smsDiagnostics.configSource,
      };
    } else {
      smsDiagnostics.attempted = true;

      try {
        const smsResult = await sendTwilioSms(textMessage, configuredAdminPhone, smsStatusCallbackUrl);
        const smsDeliveryStatus = smsResult.status;
        const statusTimestamp = new Date().toISOString();

        smsDiagnostics.deliveryStatus = smsDeliveryStatus;
        smsDiagnostics.sent = isSmsProviderAcceptanceStatus(smsDeliveryStatus);
        smsDiagnostics.error = ['failed', 'undelivered'].includes(smsDeliveryStatus) ? smsResult.details : null;
        smsDiagnostics.providerMessageId = smsResult.providerMessageId || null;
        smsDiagnostics.providerResponse = smsResult.providerResponse || null;
        smsDiagnostics.fromAddress = smsResult.fromNumberUsed || smsDiagnostics.fromAddress || null;
        smsDiagnostics.fromNumberUsed = smsResult.fromNumberUsed || smsDiagnostics.fromNumberUsed || null;
        smsDiagnostics.configSource = smsResult.configSource || smsDiagnostics.configSource || null;
        smsDiagnostics.providerStatus = smsResult.providerStatus || null;
        smsDiagnostics.providerErrorCode = smsResult.providerErrorCode || null;
        await updateLog(base44, smsResultLog.record, {
          delivery_status: smsDeliveryStatus,
          provider_message_id: smsDiagnostics.providerMessageId,
          provider_status: smsDiagnostics.providerStatus,
          provider_error_code: smsDiagnostics.providerErrorCode,
          provider_error_message: smsDiagnostics.error,
          delivered_at: smsDeliveryStatus === 'delivered' ? statusTimestamp : null,
          failed_at: ['failed', 'undelivered'].includes(smsDeliveryStatus) ? statusTimestamp : null,
          provider_message: buildProviderMessage(uniqueKey, {
            status: smsResult.status,
            delivery_status: smsDeliveryStatus,
            provider_status: smsResult.providerStatus || null,
            error_code: smsDiagnostics.providerErrorCode,
            error: smsDiagnostics.error,
            provider_message_id: smsDiagnostics.providerMessageId,
            provider_response: smsDiagnostics.providerResponse,
            from_number_used: smsDiagnostics.fromNumberUsed,
            config_source: smsDiagnostics.configSource,
            status_callback_url: smsStatusCallbackUrl,
          }),
          metadata: buildChannelMetadata(alertMetadata, 'sms', smsDiagnostics),
        });
        results.sms = {
          status: smsResult.status,
          delivery_status: smsDeliveryStatus,
          attempted: true,
          sent: smsDiagnostics.sent,
          sent_definition: 'Twilio accepted/send state only until callback confirms final delivery',
          provider_accepted: ['queued', 'sent', 'delivered'].includes(smsDeliveryStatus),
          delivered: smsDeliveryStatus === 'delivered',
          recipient: configuredAdminPhone,
          error: smsDiagnostics.error,
          provider_message_id: smsDiagnostics.providerMessageId,
          provider_response: smsDiagnostics.providerResponse,
          provider_status: smsDiagnostics.providerStatus,
          from_number_used: smsDiagnostics.fromNumberUsed,
          config_source: smsDiagnostics.configSource,
          status_callback_url: smsStatusCallbackUrl,
        };
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        const failedAt = new Date().toISOString();
        smsDiagnostics.deliveryStatus = 'failed';
        smsDiagnostics.error = errorMessage;
        await updateLog(base44, smsResultLog.record, {
          delivery_status: 'failed',
          provider_error_message: errorMessage,
          failed_at: failedAt,
          provider_message: buildProviderMessage(uniqueKey, {
            status: 'failed',
            delivery_status: 'failed',
            error: smsDiagnostics.error,
            from_number_used: smsDiagnostics.fromNumberUsed,
            config_source: smsDiagnostics.configSource,
            status_callback_url: smsStatusCallbackUrl,
          }),
          metadata: buildChannelMetadata(alertMetadata, 'sms', smsDiagnostics),
        });
        results.sms = {
          status: 'failed',
          delivery_status: 'failed',
          attempted: true,
          sent: false,
          sent_definition: 'Twilio accepted/send state only until callback confirms final delivery',
          provider_accepted: false,
          delivered: false,
          recipient: configuredAdminPhone,
          error: smsDiagnostics.error,
          provider_message_id: null,
          provider_response: null,
          from_number_used: smsDiagnostics.fromNumberUsed,
          config_source: smsDiagnostics.configSource,
          status_callback_url: smsStatusCallbackUrl,
        };
      }
    }

    const duplicate = results.in_app === 'duplicate_skipped'
      && results.email?.status === 'duplicate_skipped'
      && results.sms?.status === 'duplicate_skipped';

    return Response.json({
      success: true,
      duplicate,
      event_type: normalizedEventType,
      results,
    });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
});