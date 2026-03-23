import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

async function createLog(base44, payload) {
  const existing = await base44.asServiceRole.entities.NotificationLog.filter({
    entity_id: payload.entity_id,
    event_type: payload.event_type,
    recipient_email: payload.recipient_email,
    channel: payload.channel,
    provider_message: payload.provider_message,
  }, '-created_date', 1);

  if (existing.length > 0) {
    return null;
  }

  return base44.asServiceRole.entities.NotificationLog.create(payload);
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

    const adminEmail = Deno.env.get('ADMIN_NOTIFICATION_EMAIL');
    const adminPhone = Deno.env.get('ADMIN_NOTIFICATION_PHONE');
    const triggeredAt = new Date().toISOString();
    const subject = priority === 'high' || priority === 'urgent' ? `[High Priority] ${title}` : title;
    const textMessage = smsMessage || `${title}: ${message}`.slice(0, 160);

    const results = { in_app: null, email: null, sms: null };

    const inAppLog = await createLog(base44, {
      event_type: eventType,
      entity_name: entityName,
      entity_id: entityId,
      client_account_id: clientAccountId,
      recipient_role: 'admin',
      recipient_email: adminEmail || null,
      channel: 'in_app',
      delivery_status: 'stored',
      provider_name: 'AssistantAI Alerts',
      provider_message: `event_key:${uniqueKey}`,
      title,
      message,
      triggered_at: triggeredAt,
      actor_email: actorEmail,
      metadata: {
        ...metadata,
        priority,
      },
    });
    results.in_app = inAppLog ? 'stored' : 'duplicate_skipped';

    if (adminEmail) {
      const emailLog = await createLog(base44, {
        event_type: eventType,
        entity_name: entityName,
        entity_id: entityId,
        client_account_id: clientAccountId,
        recipient_role: 'admin',
        recipient_email: adminEmail,
        channel: 'email',
        delivery_status: 'queued',
        provider_name: 'Base44 Email',
        provider_message: `event_key:${uniqueKey}`,
        title,
        message,
        triggered_at: triggeredAt,
        actor_email: actorEmail,
        metadata: {
          ...metadata,
          priority,
        },
      });

      if (emailLog) {
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: adminEmail,
            subject,
            body: [
              message,
              '',
              `Full name: ${metadata.full_name || ''}`,
              `Business name: ${metadata.business_name || ''}`,
              `Phone: ${metadata.mobile_number || ''}`,
              `Enquiry type: ${metadata.enquiry_type || metadata.enquiry_category || ''}`,
              `Message preview: ${metadata.message_preview || ''}`,
              `Source page: ${metadata.source_page || ''}`,
              `Direct link: ${metadata.admin_link || ''}`,
            ].join('\n'),
          });
          await base44.asServiceRole.entities.NotificationLog.update(emailLog.id, {
            ...emailLog,
            delivery_status: 'sent',
            provider_message: `event_key:${uniqueKey}`,
          });
          results.email = 'sent';
        } catch (error) {
          await base44.asServiceRole.entities.NotificationLog.update(emailLog.id, {
            ...emailLog,
            delivery_status: 'failed',
            provider_message: error.message,
          });
          results.email = 'failed';
        }
      } else {
        results.email = 'duplicate_skipped';
      }
    } else {
      results.email = 'not_configured';
    }

    const smsLog = await createLog(base44, {
      event_type: eventType,
      entity_name: entityName,
      entity_id: entityId,
      client_account_id: clientAccountId,
      recipient_role: 'admin',
      recipient_email: adminPhone || null,
      channel: 'sms',
      delivery_status: adminPhone ? 'queued' : 'not_configured',
      provider_name: 'Twilio',
      provider_message: `event_key:${uniqueKey}`,
      title,
      message: textMessage,
      triggered_at: triggeredAt,
      actor_email: actorEmail,
      metadata: {
        ...metadata,
        priority,
      },
    });

    if (smsLog && adminPhone) {
      const smsResult = await sendTwilioSms(textMessage, adminPhone);
      await base44.asServiceRole.entities.NotificationLog.update(smsLog.id, {
        ...smsLog,
        delivery_status: smsResult.status === 'sent' ? 'sent' : smsResult.status === 'not_configured' ? 'not_configured' : 'failed',
        provider_message: smsResult.details,
      });
      results.sms = smsResult.status;
    } else if (!adminPhone) {
      results.sms = 'not_configured';
    } else {
      results.sms = 'duplicate_skipped';
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});