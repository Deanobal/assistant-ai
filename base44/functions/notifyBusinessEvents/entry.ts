import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SUPPORTED_EVENT_TYPES = new Set([
  'onboarding_task_overdue',
  'onboarding_blocker_detected',
  'client_ready_for_go_live',
]);

function getErrorMessage(error) {
  if (error && typeof error === 'object' && 'message' in error) return String(error.message);
  return 'Unknown error';
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
  if (!details) return '';
  if (typeof details === 'string') return details;
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

function buildAlertMetadata(metadata, eventType, uniqueKey, priority) {
  return {
    ...(metadata || {}),
    entity_event_type: eventType,
    unique_key: uniqueKey,
    priority,
  };
}

function formatHumanLabel(value, fallback) {
  const raw = String(value || '').trim();
  if (!raw) return fallback;
  return raw.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildAdminUrl(path) {
  const trimmedPath = String(path || '').trim();
  if (!trimmedPath) return '';
  const appId = String(Deno.env.get('BASE44_APP_ID') || '').trim();
  if (!appId) return trimmedPath;
  return `https://app.base44.com/apps/${appId}${trimmedPath.startsWith('/') ? trimmedPath : `/${trimmedPath}`}`;
}

function buildAlertPresentation(title, message, metadata) {
  const leadName = metadata?.business_name || metadata?.task_name || 'Client';
  const channelLabel = metadata?.channel_label || 'Onboarding';
  const summary = String(metadata?.message_preview || message || title || '').trim();
  const adminUrl = buildAdminUrl(metadata?.admin_link);
  const recommendedAction = formatHumanLabel(metadata?.recommended_action, 'Review client');
  return { leadName, channelLabel, summary, adminUrl, recommendedAction };
}

function buildEmailBody(title, message, metadata) {
  const alert = buildAlertPresentation(title, message, metadata);
  return {
    text: [title, `${alert.leadName} · ${alert.channelLabel}`, alert.summary || message, `Next action: ${alert.recommendedAction}`, alert.adminUrl ? `Open:\n${alert.adminUrl}` : null].filter(Boolean).join('\n'),
    html: ['<div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a;padding:12px 0;">', `<div style="font-size:22px;font-weight:700;margin-bottom:10px;">${title}</div>`, `<div style="font-size:15px;color:#334155;margin-bottom:8px;">${alert.leadName} · ${alert.channelLabel}</div>`, '<div style="border:1px solid #e2e8f0;border-radius:16px;padding:16px;background:#f8fafc;">', `<div style="font-size:15px;font-weight:600;margin-bottom:10px;">${alert.summary || message}</div>`, `<div style="font-size:14px;color:#475569;"><strong>Next action:</strong> ${alert.recommendedAction}</div>`, '</div>', alert.adminUrl ? `<div style="margin-top:14px;"><a href="${alert.adminUrl}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:12px;font-size:14px;font-weight:700;">Open Client</a></div>` : '', '</div>'].join(''),
  };
}

function buildSmsAlertMessage(title, message, metadata) {
  const alert = buildAlertPresentation(title, message, metadata);
  return [title, `${alert.leadName} · ${alert.channelLabel}`, alert.summary || message, `Next: ${alert.recommendedAction}`, alert.adminUrl ? alert.adminUrl : null].filter(Boolean).join('\n').slice(0, 480);
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
  if (!normalized || ['queued', 'accepted', 'scheduled', 'sending'].includes(normalized)) return 'queued';
  if (normalized === 'sent') return 'sent';
  if (['delivered', 'received', 'read'].includes(normalized)) return 'delivered';
  if (normalized === 'undelivered') return 'undelivered';
  if (['failed', 'canceled', 'cancelled'].includes(normalized)) return 'failed';
  return 'queued';
}

async function findExistingLog(base44, payload, uniqueKey) {
  const existing = await base44.entities.NotificationLog.filter({
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
  if (existing) return { record: existing, isDuplicate: true };
  const record = await base44.entities.NotificationLog.create(payload);
  return { record, isDuplicate: false };
}

async function updateLog(base44, record, updates) {
  return base44.entities.NotificationLog.update(record.id, {
    ...record,
    ...updates,
  });
}

function resolveEmailRecipient(configuredEmail) {
  const normalizedConfiguredEmail = normalizeEmail(configuredEmail);
  if (!normalizedConfiguredEmail) {
    return { configuredRecipient: null, actualRecipient: null, deliveryPath: 'unavailable', fallbackReason: 'ADMIN_NOTIFICATION_EMAIL is missing.' };
  }
  return { configuredRecipient: normalizedConfiguredEmail, actualRecipient: normalizedConfiguredEmail, deliveryPath: 'configured_admin_email', fallbackReason: null };
}

async function sendResendEmail(to, subject, body) {
  const apiKey = readSecretValue('RESEND_API_KEY');
  const fromEmail = readSecretValue('RESEND_FROM_EMAIL');
  const destination = normalizeEmail(to);
  if (!apiKey || !fromEmail || !destination) {
    return { status: 'not_configured', details: 'Resend API key, sender email, or destination email are missing.', providerMessageId: null, providerResponse: null, fromEmail: fromEmail || null };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: fromEmail, to: [destination], subject, text: body.text, html: body.html }),
  });

  const resultText = await response.text();
  let parsed = null;
  try { parsed = JSON.parse(resultText); } catch { parsed = null; }
  if (!response.ok) {
    return { status: 'failed', details: parsed?.message || parsed?.error || resultText || 'Resend email send failed.', providerMessageId: parsed?.id || null, providerResponse: parsed || resultText || null, fromEmail };
  }
  return { status: 'provider_accepted', details: 'Email accepted by Resend.', providerMessageId: parsed?.id || null, providerResponse: parsed || resultText || null, fromEmail };
}

async function sendTwilioSms(message, to, statusCallbackUrl) {
  const accountSid = String(readSecretValue('TWILIO_ACCOUNT_SID') || '').trim();
  const authToken = String(readSecretValue('TWILIO_AUTH_TOKEN') || '').trim();
  const fromNumber = normalizePhone(readSecretValue('TWILIO_FROM_NUMBER'));
  const destination = normalizePhone(to);
  const configSource = fromNumber ? 'env' : 'missing';

  if (!accountSid || !authToken || !fromNumber || !destination) {
    return { status: 'not_configured', details: 'Twilio credentials, from number, or destination number are missing.', providerMessageId: null, providerResponse: null, providerStatus: null, providerErrorCode: null, fromNumberUsed: fromNumber || null, configSource };
  }

  const body = new URLSearchParams({ From: fromNumber, To: destination, Body: message });
  if (statusCallbackUrl) body.set('StatusCallback', statusCallbackUrl);
  const auth = btoa(`${accountSid}:${authToken}`);
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const resultText = await response.text();
  let parsed = null;
  try { parsed = JSON.parse(resultText); } catch { parsed = null; }

  if (!response.ok) {
    return { status: 'failed', details: parsed?.message || resultText || 'Twilio SMS send failed.', providerMessageId: getProviderMessageId(parsed), providerResponse: parsed || resultText || null, providerStatus: parsed?.status || null, providerErrorCode: parsed?.error_code ? String(parsed.error_code) : null, fromNumberUsed: fromNumber, configSource };
  }

  return { status: mapTwilioSmsDeliveryStatus(parsed?.status), details: parsed?.status || 'Twilio SMS accepted by Twilio.', providerStatus: parsed?.status || null, providerMessageId: getProviderMessageId(parsed), providerResponse: parsed || resultText || null, providerErrorCode: parsed?.error_code ? String(parsed.error_code) : null, fromNumberUsed: parsed?.from || fromNumber, configSource };
}

function sanitizeKeyPart(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'unknown';
}

function buildClientMetadata(data, eventType, uniqueKey) {
  return {
    entity_event_type: eventType,
    unique_key: uniqueKey,
    admin_link: `/ClientWorkspace?id=${data.id || data.client_id}`,
    business_name: data.business_name || 'Client',
    email: data.email || '',
    mobile_number: data.mobile_number || '',
    task_name: data.task_name || '',
    due_date: data.due_date || '',
    message_preview: String(data.task_name || (Array.isArray(data.blockers) ? data.blockers.join(', ') : '') || data.next_action || '').slice(0, 180),
    channel_label: 'Onboarding',
    recommended_action: eventType === 'onboarding_task_overdue' ? 'Review overdue task' : eventType === 'onboarding_blocker_detected' ? 'Resolve blockers' : 'Prepare go live',
  };
}

function buildEventPayload(entityName, eventType, data, oldData) {
  if (!data?.id) return [];

  if (entityName === 'OnboardingTask' && eventType !== 'delete') {
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Etc/GMT-10',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
    const dueDate = String(data.due_date || '').trim().slice(0, 10);
    const oldDueDate = String(oldData?.due_date || '').trim().slice(0, 10);
    const isOverdue = !!dueDate && dueDate < today && data.completed === false;
    const wasOverdue = !!oldDueDate && oldDueDate < today && oldData?.completed === false;
    if (isOverdue && (!wasOverdue || eventType === 'scheduled_overdue_check')) {
      return [{
        event_type: 'onboarding_task_overdue',
        title: 'Onboarding task overdue',
        message: `${data.task_name} is overdue${dueDate ? ` (due ${dueDate})` : ''}.`,
        unique_key: `onboarding_task_overdue:${data.id}:${dueDate}`,
        priority: 'high',
      }];
    }
  }

  if (entityName === 'Client' && eventType === 'update') {
    const events = [];
    const blockerCount = Array.isArray(data.blockers) ? data.blockers.length : 0;
    const oldBlockerCount = Array.isArray(oldData?.blockers) ? oldData.blockers.length : 0;
    if (blockerCount > 0 && oldBlockerCount === 0) {
      events.push({
        event_type: 'onboarding_blocker_detected',
        title: 'Onboarding blockers detected',
        message: `${data.business_name || 'Client'} now has blockers: ${data.blockers.join(', ')}.`,
        unique_key: `onboarding_blocker_detected:${data.id}:${sanitizeKeyPart(data.blockers.join('-'))}`,
        priority: 'high',
      });
    }
    if (data.go_live_ready && !oldData?.go_live_ready) {
      events.push({
        event_type: 'client_ready_for_go_live',
        title: 'Client ready for go-live',
        message: `${data.business_name || 'Client'} is ready for go-live.`,
        unique_key: `client_ready_for_go_live:${data.id}:${data.updated_at || data.updated_date || 'ready'}`,
        priority: 'high',
      });
    }
    return events;
  }

  return [];
}

async function runAdminAlert(base44, requestUrl, payload) {
  const { eventType, entityName, entityId, clientId = null, title, message, metadata = {}, uniqueKey, priority = 'normal' } = payload;
  if (!eventType || !entityName || !entityId || !title || !message || !uniqueKey) {
    return { error: 'eventType, entityName, entityId, title, message, and uniqueKey are required', status: 400 };
  }
  if (!SUPPORTED_EVENT_TYPES.has(eventType)) {
    return { error: `Unsupported eventType: ${eventType}`, status: 400 };
  }

  const configuredAdminEmail = normalizeEmail(Deno.env.get('ADMIN_NOTIFICATION_EMAIL'));
  const configuredAdminPhone = normalizePhone(Deno.env.get('ADMIN_NOTIFICATION_PHONE'));
  const resendFromEmail = readSecretValue('RESEND_FROM_EMAIL');
  const emailRecipient = resolveEmailRecipient(configuredAdminEmail);
  const triggeredAt = new Date().toISOString();
  const subject = priority === 'high' ? `[High Priority] ${title}` : title;
  const alertMetadata = buildAlertMetadata(metadata, eventType, uniqueKey, priority);
  const emailBody = buildEmailBody(title, message, alertMetadata);
  const textMessage = buildSmsAlertMessage(title, message, alertMetadata);
  const smsStatusCallbackUrl = buildFunctionUrl(requestUrl, 'twilioStatusCallback');
  const results = { in_app: null, email: null, sms: null };

  const inAppResult = await createLog(base44, {
    event_type: eventType,
    entity_name: entityName,
    entity_id: entityId,
    client_account_id: clientId,
    recipient_role: 'admin',
    recipient_email: emailRecipient.actualRecipient || configuredAdminEmail || null,
    channel: 'in_app',
    delivery_status: 'stored',
    provider_name: 'AssistantAI Alerts',
    provider_message: buildProviderMessage(uniqueKey),
    title,
    message,
    triggered_at: triggeredAt,
    actor_email: null,
    metadata: alertMetadata,
  }, uniqueKey);
  results.in_app = inAppResult.isDuplicate ? 'duplicate_skipped' : 'stored';

  const emailDiagnostics = { attempted: false, sent: false, deliveryStatus: null, error: null, providerMessageId: null, providerResponse: null, actualRecipient: emailRecipient.actualRecipient, configuredRecipient: emailRecipient.configuredRecipient, deliveryPath: emailRecipient.deliveryPath, fallbackReason: emailRecipient.fallbackReason, fromAddress: resendFromEmail || null, providerStatus: null, providerErrorCode: null, statusCallbackUrl: null };
  const emailResult = await createLog(base44, {
    event_type: eventType,
    entity_name: entityName,
    entity_id: entityId,
    client_account_id: clientId,
    recipient_role: 'admin',
    recipient_email: emailRecipient.actualRecipient || configuredAdminEmail || null,
    channel: 'email',
    delivery_status: emailRecipient.actualRecipient ? 'queued' : 'not_configured',
    provider_name: 'Resend',
    provider_message: buildProviderMessage(uniqueKey),
    title,
    message,
    triggered_at: triggeredAt,
    actor_email: null,
    metadata: buildChannelMetadata(alertMetadata, 'email', emailDiagnostics),
  }, uniqueKey);

  if (emailResult.isDuplicate) {
    results.email = { status: 'duplicate_skipped', delivery_status: 'duplicate_skipped' };
  } else if (!emailRecipient.actualRecipient) {
    emailDiagnostics.deliveryStatus = 'not_configured';
    emailDiagnostics.error = emailRecipient.fallbackReason || 'No valid admin email recipient available.';
    await updateLog(base44, emailResult.record, { delivery_status: 'not_configured', provider_message: buildProviderMessage(uniqueKey, emailDiagnostics.error), metadata: buildChannelMetadata(alertMetadata, 'email', emailDiagnostics) });
    results.email = { status: 'not_configured', delivery_status: 'not_configured' };
  } else {
    emailDiagnostics.attempted = true;
    const resendResult = await sendResendEmail(emailRecipient.actualRecipient, subject, emailBody);
    emailDiagnostics.deliveryStatus = resendResult.status;
    emailDiagnostics.sent = isProviderAcceptanceStatus(resendResult.status);
    emailDiagnostics.error = resendResult.status === 'failed' ? resendResult.details : null;
    emailDiagnostics.providerMessageId = resendResult.providerMessageId || null;
    emailDiagnostics.providerResponse = resendResult.providerResponse || null;
    emailDiagnostics.fromAddress = resendResult.fromEmail || emailDiagnostics.fromAddress || null;
    await updateLog(base44, emailResult.record, { delivery_status: resendResult.status, provider_message: buildProviderMessage(uniqueKey, { status: resendResult.status, delivery_status: resendResult.status, error: emailDiagnostics.error, provider_message_id: emailDiagnostics.providerMessageId, provider_response: emailDiagnostics.providerResponse, from_address: emailDiagnostics.fromAddress }), metadata: buildChannelMetadata(alertMetadata, 'email', emailDiagnostics) });
    results.email = { status: resendResult.status, delivery_status: resendResult.status };
  }

  const twilioFromNumber = normalizePhone(readSecretValue('TWILIO_FROM_NUMBER'));
  const smsDiagnostics = { attempted: false, sent: false, deliveryStatus: null, error: null, providerMessageId: null, providerResponse: null, actualRecipient: configuredAdminPhone || null, configuredRecipient: configuredAdminPhone || null, deliveryPath: configuredAdminPhone ? 'configured_admin_phone' : 'unavailable', fallbackReason: configuredAdminPhone ? null : 'No admin phone is configured.', fromAddress: twilioFromNumber || null, fromNumberUsed: twilioFromNumber || null, configSource: twilioFromNumber ? 'env' : 'missing', providerStatus: null, providerErrorCode: null, statusCallbackUrl: smsStatusCallbackUrl };
  const smsResultLog = await createLog(base44, {
    event_type: eventType,
    entity_name: entityName,
    entity_id: entityId,
    client_account_id: clientId,
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
    actor_email: null,
    metadata: buildChannelMetadata(alertMetadata, 'sms', smsDiagnostics),
  }, uniqueKey);

  if (smsResultLog.isDuplicate) {
    results.sms = { status: 'duplicate_skipped', delivery_status: 'duplicate_skipped' };
  } else if (!configuredAdminPhone) {
    smsDiagnostics.deliveryStatus = 'not_configured';
    smsDiagnostics.error = smsDiagnostics.fallbackReason;
    await updateLog(base44, smsResultLog.record, { delivery_status: 'not_configured', provider_error_message: smsDiagnostics.error, provider_message: buildProviderMessage(uniqueKey, smsDiagnostics.error), metadata: buildChannelMetadata(alertMetadata, 'sms', smsDiagnostics) });
    results.sms = { status: 'not_configured', delivery_status: 'not_configured' };
  } else {
    smsDiagnostics.attempted = true;
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
    await updateLog(base44, smsResultLog.record, { delivery_status: smsDeliveryStatus, provider_message_id: smsDiagnostics.providerMessageId, provider_status: smsDiagnostics.providerStatus, provider_error_code: smsDiagnostics.providerErrorCode, provider_error_message: smsDiagnostics.error, delivered_at: smsDeliveryStatus === 'delivered' ? statusTimestamp : null, failed_at: ['failed', 'undelivered'].includes(smsDeliveryStatus) ? statusTimestamp : null, provider_message: buildProviderMessage(uniqueKey, { status: smsResult.status, delivery_status: smsDeliveryStatus, provider_status: smsResult.providerStatus || null, error_code: smsDiagnostics.providerErrorCode, error: smsDiagnostics.error, provider_message_id: smsDiagnostics.providerMessageId, provider_response: smsDiagnostics.providerResponse, from_number_used: smsDiagnostics.fromNumberUsed, config_source: smsDiagnostics.configSource, status_callback_url: smsStatusCallbackUrl }), metadata: buildChannelMetadata(alertMetadata, 'sms', smsDiagnostics) });
    results.sms = { status: smsResult.status, delivery_status: smsDeliveryStatus };
  }

  return { success: true, event_type: eventType, results };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req).asServiceRole;
    const payload = await req.json();
    const entityName = payload?.event?.entity_name;
    const eventType = payload?.event?.type;
    const data = payload?.data;
    const oldData = payload?.old_data;

    if (!entityName || !eventType || !data?.id) {
      return Response.json({ success: true, ignored: true, reason: 'Missing event payload' });
    }

    const eventDefs = buildEventPayload(entityName, eventType, data, oldData);
    if (eventDefs.length === 0) {
      return Response.json({ success: true, ignored: true, reason: 'No notification events matched' });
    }

    const results = [];
    for (const def of eventDefs) {
      const metadata = buildClientMetadata(data, def.event_type, def.unique_key);
      const adminResponse = await runAdminAlert(base44, req.url, {
        eventType: def.event_type,
        entityName,
        entityId: data.id,
        clientId: data.client_id || data.id || null,
        title: def.title,
        message: def.message,
        metadata,
        uniqueKey: def.unique_key,
        priority: def.priority,
      });
      results.push({ event_type: def.event_type, admin_alert: adminResponse });
    }

    return Response.json({ success: true, triggered_events: eventDefs.map((def) => def.event_type), results });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
});