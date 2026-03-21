import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

function buildLeadMetadata(data, eventType, uniqueKey) {
  return {
    entity_event_type: eventType,
    unique_key: uniqueKey,
    admin_link: `/LeadDetail?id=${data.id}`,
    full_name: data.full_name || '',
    business_name: data.business_name || '',
    email: data.email || '',
    mobile_number: data.mobile_number || '',
    industry: data.industry || '',
    message_preview: (data.message || '').slice(0, 180),
    source_page: data.source_page || '',
    booking_intent: !!data.booking_intent,
    preferred_meeting_date: data.preferred_meeting_date || '',
    preferred_meeting_time: data.preferred_meeting_time || '',
    confirmed_meeting_date: data.confirmed_meeting_date || '',
    confirmed_meeting_time: data.confirmed_meeting_time || '',
    booking_provider: data.booking_provider || '',
    booking_reference: data.booking_reference || '',
  };
}

function buildEventPayload(entityName, eventType, data, oldData) {
  if (entityName !== 'Lead') {
    return [];
  }

  const events = [];
  const leadLabel = data.business_name || data.full_name || 'A lead';
  const requestKey = `strategy_call_requested:${data.last_activity_at || data.created_at || data.created_date || data.updated_date || ''}`;
  const bookingKey = `booking_confirmed:${data.booking_reference || `${data.confirmed_meeting_date || ''}_${data.confirmed_meeting_time || ''}`}`;

  if (eventType === 'create') {
    events.push({
      event_type: 'new_lead_created',
      title: 'New lead created',
      message: `${leadLabel} was captured from ${data.source_page || 'an unknown source'}.`,
      unique_key: `new_lead_created:${data.created_at || data.created_date || data.id}`,
      priority: 'normal',
    });

    if (data.booking_intent && data.enquiry_type === 'strategy_call' && data.status !== 'Strategy Call Booked') {
      events.push({
        event_type: 'strategy_call_requested',
        title: 'New strategy call request',
        message: `${data.full_name || 'A lead'} requested a strategy call from ${data.source_page || 'the website'}.`,
        unique_key: requestKey,
        priority: 'high',
      });
    }
  }

  if (eventType === 'update') {
    const isNewStrategyCallRequest = data.booking_intent
      && data.enquiry_type === 'strategy_call'
      && data.status !== 'Strategy Call Booked'
      && oldData?.last_activity_at !== data.last_activity_at;

    if (isNewStrategyCallRequest) {
      events.push({
        event_type: 'strategy_call_requested',
        title: 'Updated lead requested a strategy call',
        message: `${data.full_name || leadLabel} submitted another strategy call request.`,
        unique_key: requestKey,
        priority: 'high',
      });
    }

    const bookingJustConfirmed = (oldData?.status !== 'Strategy Call Booked' && data.status === 'Strategy Call Booked')
      || (oldData?.booking_status !== 'confirmed' && data.booking_status === 'confirmed');

    if (bookingJustConfirmed) {
      events.push({
        event_type: 'booking_confirmed',
        title: 'Strategy call booking confirmed',
        message: `${data.full_name || leadLabel} has a confirmed strategy call${data.confirmed_meeting_date ? ` on ${data.confirmed_meeting_date}` : ''}.`,
        unique_key: bookingKey,
        priority: 'high',
      });
    }
  }

  return events;
}

async function createNotificationLog(base44, payload) {
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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const entityName = payload?.event?.entity_name;
    const eventType = payload?.event?.type;
    const data = payload?.data;
    const oldData = payload?.old_data;

    if (!entityName || !eventType || !data?.id) {
      return Response.json({ ignored: true, reason: 'Missing event payload' });
    }

    const user = await base44.auth.me().catch(() => null);
    const actorEmail = user?.email || null;
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' }, '-created_date', 100);
    const eventDefs = buildEventPayload(entityName, eventType, data, oldData);

    if (eventDefs.length === 0) {
      return Response.json({ ignored: true, reason: 'No notification events matched' });
    }

    const created = [];

    for (const def of eventDefs) {
      const metadata = entityName === 'Lead'
        ? buildLeadMetadata(data, eventType, def.unique_key)
        : { entity_event_type: eventType, unique_key: def.unique_key };

      if (admins.length === 0) {
        const storedLog = await createNotificationLog(base44, {
          event_type: def.event_type,
          entity_name: entityName,
          entity_id: data.id,
          client_account_id: data.client_account_id || null,
          recipient_role: 'admin',
          recipient_email: null,
          channel: 'in_app',
          delivery_status: 'stored',
          provider_name: null,
          provider_message: `event_key:${def.unique_key}`,
          title: def.title,
          message: def.message,
          triggered_at: new Date().toISOString(),
          actor_email: actorEmail,
          metadata: {
            ...metadata,
            priority: def.priority,
            intended_channels: ['email', 'sms'],
          },
        });
        if (storedLog) {
          created.push(storedLog.id);
        }
        continue;
      }

      for (const admin of admins) {
        const storedLog = await createNotificationLog(base44, {
          event_type: def.event_type,
          entity_name: entityName,
          entity_id: data.id,
          client_account_id: data.client_account_id || null,
          recipient_role: 'admin',
          recipient_email: admin.email || null,
          channel: 'in_app',
          delivery_status: 'stored',
          provider_name: null,
          provider_message: `event_key:${def.unique_key}`,
          title: def.title,
          message: def.message,
          triggered_at: new Date().toISOString(),
          actor_email: actorEmail,
          metadata: {
            ...metadata,
            priority: def.priority,
            intended_channels: ['email', 'sms'],
          },
        });
        if (storedLog) {
          created.push(storedLog.id);
        }

        if (admin.email) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: admin.email,
            subject: def.priority === 'high' ? `[High Priority] ${def.title}` : def.title,
            body: [
              def.message,
              '',
              `Full name: ${data.full_name || ''}`,
              `Business name: ${data.business_name || ''}`,
              `Email: ${data.email || ''}`,
              `Mobile: ${data.mobile_number || ''}`,
              `Industry: ${data.industry || ''}`,
              `Message preview: ${(data.message || '').slice(0, 180) || 'No message provided'}`,
              `Source page: ${data.source_page || ''}`,
              `Booking intent: ${data.booking_intent ? 'Yes' : 'No'}`,
              `Preferred time: ${[data.preferred_meeting_date, data.preferred_meeting_time].filter(Boolean).join(' ') || 'Not provided'}`,
              `Confirmed time: ${[data.confirmed_meeting_date, data.confirmed_meeting_time].filter(Boolean).join(' ') || 'Not confirmed yet'}`,
              `Admin link: /LeadDetail?id=${data.id}`,
            ].join('\n'),
          });
        }
      }
    }

    return Response.json({ success: true, notification_log_ids: created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});