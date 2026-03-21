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
    enquiry_type: data.enquiry_type || '',
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
      priority: data.booking_intent ? 'high' : 'normal',
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
    const eventDefs = buildEventPayload(entityName, eventType, data, oldData);

    if (eventDefs.length === 0) {
      return Response.json({ ignored: true, reason: 'No notification events matched' });
    }

    const results = [];

    for (const def of eventDefs) {
      const metadata = buildLeadMetadata(data, eventType, def.unique_key);
      const smsType = data.enquiry_type || def.event_type;
      const smsMessage = `${def.priority === 'high' ? 'High priority: ' : ''}New lead: ${data.full_name || data.business_name || 'Unknown'} - ${data.mobile_number || 'No phone'} - ${smsType}`.slice(0, 160);

      const response = await base44.asServiceRole.functions.invoke('sendAdminAlert', {
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
        smsMessage,
      });

      results.push(response.data || response);
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});