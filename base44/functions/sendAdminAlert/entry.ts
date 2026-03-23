import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

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

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizePhone(value) {
  return String(value || '').trim().replace(/\s+/g, '');
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

function buildEmailBody(title, message, metadata, normalizedEventType, priority) {
  return [
    title,
    '',
    message,
    '',
    `Event type: ${normalizedEventType}`,
    `Priority: ${priority}`,
    `Full name: ${metadata.full_name || ''}`,
    `Business name: ${metadata.business_name || ''}`,
    `Email: ${metadata.email || ''}`,
    `Mobile number: ${metadata.mobile_number || ''}`,
    `Enquiry type: ${metadata.enquiry_type || metadata.enquiry_category || ''}`,
    `Industry: ${metadata.industry || ''}`,
    `Source page: ${metadata.source_page || ''}`,
    `Preferred meeting: ${formatMeetingDateTime(metadata.preferred_meeting_date, metadata.preferred_meeting_time)}`,
    `Confirmed meeting: ${formatMeetingDateTime(metadata.confirmed_meeting_date, metadata.confirmed_meeting_time)}`,
    `Booking provider: ${metadata.booking_provider || ''}`,
    `Booking reference: ${metadata.booking_reference || ''}`,
    `Message preview: ${metadata.message_preview || ''}`,
    `Admin link: ${metadata.admin_link || ''}`,
  ].join('\n');
}

function getProviderMessageId(data) {
  return data?.sid || data?.id || data?.messageId || data?.message_id || null;
}

function buildChannelMetadata(baseMetadata, channel, diagnostics) {
  return {
    ...baseMetadata,
    [`${channel}_attempted`]: !!diagnostics.attempted,
    [`${channel}_sent`]: !!diagnostics.sent,
    [`${channel}_error`]: diagnostics.error || null,
    [`${channel}_provider_message_id`]: diagnostics.providerMessageId || null,
    [`${channel}_provider_response`]: diagnostics.providerResponse || null,
    [`${channel}_actual_recipient`]: diagnostics.actualRecipient || null,
    [`${channel}_configured_recipient`]: diagnostics.configuredRecipient || null,
    [`${channel}_delivery_path`]: diagnostics.deliveryPath || null,
    [`${channel}_fallback_reason`]: diagnostics.fallbackReason || null,
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

async function resolveEmailRecipient(base44, configuredEmail) {
  const normalizedConfiguredEmail = normalizeEmail(configuredEmail);
  const users = await base44.asServiceRole.entities.User.list('-created_date', 100);
  const adminEmails = [];

  for (const user of users) {
    if (user?.role !== 'admin') {
      continue;
    }

    const email = normalizeEmail(user.email);
    if (email && !adminEmails.includes(email)) {
      adminEmails.push(email);
    }
  }

  if (normalizedConfiguredEmail && adminEmails.includes(normalizedConfiguredEmail)) {
    return {
      configuredRecipient: normalizedConfiguredEmail,
      actualRecipient: normalizedConfiguredEmail,
      deliveryPath: 'configured_admin_email',
      fallbackReason: null,
    };
  }

  if (adminEmails.length > 0) {
    return {
      configuredRecipient: normalizedConfiguredEmail || null,
      actualRecipient: adminEmails[0],
      deliveryPath: normalizedConfiguredEmail ? 'admin_user_fallback' : 'admin_user_default',
      fallbackReason: normalizedConfiguredEmail
        ? 'Configured admin email is not a registered app user, so Base44 Email cannot deliver to it.'
        : 'No configured admin email found, so a registered admin user email is being used.',
    };
  }

  return {
    configuredRecipient: normalizedConfiguredEmail || null,
    actualRecipient: null,
    deliveryPath: 'unavailable',
    fallbackReason: normalizedConfiguredEmail
      ? 'Configured admin email is not a registered app user, and there are no admin user emails available for Base44 Email.'
      : 'No admin email is configured and no admin user email is available for Base44 Email.',
  };
}

async function sendTwilioSms(message, to) {
  const accountSid = normalizeEmail(Deno.env.get('TWILIO_ACCOUNT_SID')).toUpperCase();
  const authToken = String(Deno.env.get('TWILIO_AUTH_TOKEN') || '').trim();
  const fromNumber = normalizePhone(Deno.env.get('TWILIO_FROM_NUMBER'));
  const destination = normalizePhone(to);

  if (!accountSid || !authToken || !fromNumber || !destination) {
    return {
      status: 'not_configured',
      details: 'Twilio credentials, from number, or destination number are missing.',
      providerMessageId: null,
      providerResponse: null,
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
    };
  }

  return {
    status: 'sent',
    details: parsed?.status || 'Twilio SMS sent.',
    providerMessageId: getProviderMessageId(parsed),
    providerResponse: parsed || resultText || null,
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
    const emailRecipient = await resolveEmailRecipient(base44, configuredAdminEmail);
    const triggeredAt = new Date().toISOString();
    const subject = priority === 'high' || priority === 'urgent' ? `[High Priority] ${title}` : title;
    const textMessage = (smsMessage || `${title}: ${message}`).slice(0, 160);
    const alertMetadata = buildAlertMetadata(metadata, normalizedEventType, uniqueKey, priority);

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
      error: null,
      providerMessageId: null,
      providerResponse: null,
      actualRecipient: emailRecipient.actualRecipient,
      configuredRecipient: emailRecipient.configuredRecipient,
      deliveryPath: emailRecipient.deliveryPath,
      fallbackReason: emailRecipient.fallbackReason,
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
      provider_name: 'Base44 Email',
      provider_message: buildProviderMessage(uniqueKey),
      title,
      message,
      triggered_at: triggeredAt,
      actor_email: actorEmail,
      metadata: buildChannelMetadata(alertMetadata, 'email', emailDiagnostics),
    }, uniqueKey);

    if (emailResult.isDuplicate) {
      results.email = { status: 'duplicate_skipped', attempted: false, sent: false, recipient: emailRecipient.actualRecipient || null, error: null };
    } else if (!emailRecipient.actualRecipient) {
      emailDiagnostics.error = emailRecipient.fallbackReason || 'No valid admin email recipient available.';
      await updateLog(base44, emailResult.record, {
        delivery_status: 'not_configured',
        provider_message: buildProviderMessage(uniqueKey, emailDiagnostics.error),
        metadata: buildChannelMetadata(alertMetadata, 'email', emailDiagnostics),
      });
      results.email = {
        status: 'not_configured',
        attempted: false,
        sent: false,
        recipient: null,
        error: emailDiagnostics.error,
      };
    } else {
      emailDiagnostics.attempted = true;

      try {
        const emailResponse = await base44.asServiceRole.integrations.Core.SendEmail({
          to: emailRecipient.actualRecipient,
          subject,
          body: buildEmailBody(title, message, alertMetadata, normalizedEventType, priority),
        });
        emailDiagnostics.sent = true;
        emailDiagnostics.providerMessageId = getProviderMessageId(emailResponse);
        emailDiagnostics.providerResponse = emailResponse || 'Email sent via Base44 Email';
        await updateLog(base44, emailResult.record, {
          delivery_status: 'sent',
          provider_message: buildProviderMessage(uniqueKey, {
            status: 'sent',
            provider_message_id: emailDiagnostics.providerMessageId,
            provider_response: emailDiagnostics.providerResponse,
          }),
          metadata: buildChannelMetadata(alertMetadata, 'email', emailDiagnostics),
        });
        results.email = {
          status: 'sent',
          attempted: true,
          sent: true,
          recipient: emailRecipient.actualRecipient,
          error: null,
          provider_message_id: emailDiagnostics.providerMessageId,
        };
      } catch (error) {
        emailDiagnostics.error = getErrorMessage(error);
        await updateLog(base44, emailResult.record, {
          delivery_status: 'failed',
          provider_message: buildProviderMessage(uniqueKey, {
            status: 'failed',
            error: emailDiagnostics.error,
          }),
          metadata: buildChannelMetadata(alertMetadata, 'email', emailDiagnostics),
        });
        results.email = {
          status: 'failed',
          attempted: true,
          sent: false,
          recipient: emailRecipient.actualRecipient,
          error: emailDiagnostics.error,
          fallback_reason: emailRecipient.fallbackReason,
        };
      }
    }

    const smsDiagnostics = {
      attempted: false,
      sent: false,
      error: null,
      providerMessageId: null,
      providerResponse: null,
      actualRecipient: configuredAdminPhone || null,
      configuredRecipient: configuredAdminPhone || null,
      deliveryPath: configuredAdminPhone ? 'configured_admin_phone' : 'unavailable',
      fallbackReason: configuredAdminPhone ? null : 'No admin phone is configured.',
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
      title,
      message: textMessage,
      triggered_at: triggeredAt,
      actor_email: actorEmail,
      metadata: buildChannelMetadata(alertMetadata, 'sms', smsDiagnostics),
    }, uniqueKey);

    if (smsResultLog.isDuplicate) {
      results.sms = { status: 'duplicate_skipped', attempted: false, sent: false, recipient: configuredAdminPhone || null, error: null };
    } else if (!configuredAdminPhone) {
      smsDiagnostics.error = smsDiagnostics.fallbackReason;
      await updateLog(base44, smsResultLog.record, {
        delivery_status: 'not_configured',
        provider_message: buildProviderMessage(uniqueKey, smsDiagnostics.error),
        metadata: buildChannelMetadata(alertMetadata, 'sms', smsDiagnostics),
      });
      results.sms = {
        status: 'not_configured',
        attempted: false,
        sent: false,
        recipient: null,
        error: smsDiagnostics.error,
      };
    } else {
      smsDiagnostics.attempted = true;
      const smsResult = await sendTwilioSms(textMessage, configuredAdminPhone);
      smsDiagnostics.sent = smsResult.status === 'sent';
      smsDiagnostics.error = smsResult.status === 'sent' ? null : smsResult.details;
      smsDiagnostics.providerMessageId = smsResult.providerMessageId || null;
      smsDiagnostics.providerResponse = smsResult.providerResponse || null;
      await updateLog(base44, smsResultLog.record, {
        delivery_status: smsResult.status === 'sent' ? 'sent' : smsResult.status === 'not_configured' ? 'not_configured' : 'failed',
        provider_message: buildProviderMessage(uniqueKey, {
          status: smsResult.status,
          error: smsDiagnostics.error,
          provider_message_id: smsDiagnostics.providerMessageId,
          provider_response: smsDiagnostics.providerResponse,
        }),
        metadata: buildChannelMetadata(alertMetadata, 'sms', smsDiagnostics),
      });
      results.sms = {
        status: smsResult.status,
        attempted: true,
        sent: smsDiagnostics.sent,
        recipient: configuredAdminPhone,
        error: smsDiagnostics.error,
        provider_message_id: smsDiagnostics.providerMessageId,
      };
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