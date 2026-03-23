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

function buildEventKey(uniqueKey) {
  return `event_key:${uniqueKey}`;
}

function buildProviderMessage(uniqueKey, details) {
  return details ? `${buildEventKey(uniqueKey)}\n${details}` : buildEventKey(uniqueKey);
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

async function sendTwilioSms(message, to) {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const fromNumber = Deno.env.get('TWILIO_FROM_NUMBER');

  if (!accountSid || !authToken || !fromNumber || !to) {
    return { status: 'not_configured', details: 'Twilio or admin phone not configured.' };
  }

  const body = new URLSearchParams({
    From: fromNumber,
    To: to,
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
  if (!response.ok) {
    return { status: 'failed', details: resultText || 'Twilio SMS send failed.' };
  }

  return { status: 'sent', details: resultText || 'Twilio SMS sent.' };
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

    const adminEmail = Deno.env.get('ADMIN_NOTIFICATION_EMAIL');
    const adminPhone = Deno.env.get('ADMIN_NOTIFICATION_PHONE');
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
      recipient_email: adminEmail || null,
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

    const emailResult = await createLog(base44, {
      event_type: normalizedEventType,
      entity_name: entityName,
      entity_id: entityId,
      client_account_id: clientAccountId,
      recipient_role: 'admin',
      recipient_email: adminEmail || null,
      channel: 'email',
      delivery_status: adminEmail ? 'queued' : 'not_configured',
      provider_name: 'Base44 Email',
      provider_message: buildProviderMessage(uniqueKey),
      title,
      message,
      triggered_at: triggeredAt,
      actor_email: actorEmail,
      metadata: alertMetadata,
    }, uniqueKey);

    if (emailResult.isDuplicate) {
      results.email = 'duplicate_skipped';
    } else if (!adminEmail) {
      results.email = 'not_configured';
    } else {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: adminEmail,
          subject,
          body: buildEmailBody(title, message, alertMetadata, normalizedEventType, priority),
        });
        await base44.asServiceRole.entities.NotificationLog.update(emailResult.record.id, {
          ...emailResult.record,
          delivery_status: 'sent',
          provider_message: buildProviderMessage(uniqueKey, 'Email sent via Base44 Email'),
          metadata: alertMetadata,
        });
        results.email = 'sent';
      } catch (error) {
        await base44.asServiceRole.entities.NotificationLog.update(emailResult.record.id, {
          ...emailResult.record,
          delivery_status: 'failed',
          provider_message: buildProviderMessage(uniqueKey, getErrorMessage(error)),
          metadata: alertMetadata,
        });
        results.email = 'failed';
      }
    }

    const smsResultLog = await createLog(base44, {
      event_type: normalizedEventType,
      entity_name: entityName,
      entity_id: entityId,
      client_account_id: clientAccountId,
      recipient_role: 'admin',
      recipient_email: adminPhone || null,
      channel: 'sms',
      delivery_status: adminPhone ? 'queued' : 'not_configured',
      provider_name: 'Twilio',
      provider_message: buildProviderMessage(uniqueKey),
      title,
      message: textMessage,
      triggered_at: triggeredAt,
      actor_email: actorEmail,
      metadata: alertMetadata,
    }, uniqueKey);

    if (smsResultLog.isDuplicate) {
      results.sms = 'duplicate_skipped';
    } else if (!adminPhone) {
      results.sms = 'not_configured';
    } else {
      const smsResult = await sendTwilioSms(textMessage, adminPhone);
      await base44.asServiceRole.entities.NotificationLog.update(smsResultLog.record.id, {
        ...smsResultLog.record,
        delivery_status: smsResult.status === 'sent' ? 'sent' : smsResult.status === 'not_configured' ? 'not_configured' : 'failed',
        provider_message: buildProviderMessage(uniqueKey, smsResult.details),
        metadata: alertMetadata,
      });
      results.sms = smsResult.status;
    }

    const duplicate = results.in_app === 'duplicate_skipped' && results.email === 'duplicate_skipped' && results.sms === 'duplicate_skipped';

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