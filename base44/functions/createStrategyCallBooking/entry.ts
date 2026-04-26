import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

async function notifyAdmins(base44, lead, details) {
  const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' }, '-created_date', 100);
  const triggeredAt = new Date().toISOString();
  const leadId = lead?.id || details.leadId;
  const baseMetadata = {
    admin_link: leadId ? `/LeadDetail?id=${leadId}` : null,
    full_name: lead?.full_name || details.fullName || '',
    business_name: lead?.business_name || details.businessName || '',
    email: lead?.email || details.email || '',
    mobile_number: lead?.mobile_number || '',
    industry: lead?.industry || '',
    message_preview: (lead?.message || details.message || '').slice(0, 180),
    source_page: lead?.source_page || '/BookStrategyCall',
    booking_intent: true,
    preferred_meeting_date: lead?.preferred_meeting_date || '',
    preferred_meeting_time: lead?.preferred_meeting_time || '',
    confirmed_meeting_date: details.confirmedDate || '',
    confirmed_meeting_time: details.confirmedTime || '',
    booking_provider: details.bookingProvider || '',
    booking_reference: details.bookingReference || '',
  };

  for (const admin of admins) {
    const existing = await base44.asServiceRole.entities.NotificationLog.filter({
      entity_id: leadId,
      event_type: details.eventType,
      recipient_email: admin.email || null,
      channel: 'in_app',
      provider_message: `event_key:${details.uniqueKey}`,
    }, '-created_date', 1);

    if (existing.length > 0) {
      continue;
    }

    await base44.asServiceRole.entities.NotificationLog.create({
      event_type: details.eventType,
      entity_name: 'Lead',
      entity_id: leadId,
      client_account_id: lead?.client_account_id || null,
      recipient_role: 'admin',
      recipient_email: admin.email || null,
      channel: 'in_app',
      delivery_status: 'stored',
      provider_name: 'StrategyCallCalendar',
      provider_message: `event_key:${details.uniqueKey}`,
      title: details.title,
      message: details.message,
      triggered_at: triggeredAt,
      actor_email: lead?.email || details.email || null,
      metadata: {
        ...baseMetadata,
        priority: details.priority,
      },
    });

    if (admin.email) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: admin.email,
        subject: details.priority === 'high' ? `[High Priority] ${details.title}` : details.title,
        body: [
          details.message,
          '',
          `Full name: ${baseMetadata.full_name}`,
          `Business name: ${baseMetadata.business_name}`,
          `Email: ${baseMetadata.email}`,
          `Mobile: ${baseMetadata.mobile_number}`,
          `Industry: ${baseMetadata.industry}`,
          `Message preview: ${baseMetadata.message_preview || 'No message provided'}`,
          `Source page: ${baseMetadata.source_page}`,
          `Preferred time: ${[baseMetadata.preferred_meeting_date, baseMetadata.preferred_meeting_time].filter(Boolean).join(' ') || 'Not provided'}`,
          `Confirmed time: ${[baseMetadata.confirmed_meeting_date, baseMetadata.confirmed_meeting_time].filter(Boolean).join(' ') || 'Not confirmed yet'}`,
          `Admin link: ${baseMetadata.admin_link || 'Unavailable'}`,
        ].join('\n'),
      });
    }
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const {
      leadId,
      fullName,
      businessName,
      email,
      message,
      slotStart,
      slotEnd,
      timezone = 'UTC',
    } = payload;

    if (!leadId || !fullName || !email || !slotStart || !slotEnd) {
      return Response.json({ error: 'leadId, fullName, email, slotStart, and slotEnd are required' }, { status: 400 });
    }

    const leadMatches = await base44.asServiceRole.entities.Lead.filter({ id: leadId }, '-updated_date', 1);
    const lead = leadMatches[0] || null;
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');

    const busyResponse = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timeMin: slotStart,
        timeMax: slotEnd,
        timeZone: timezone,
        items: [{ id: 'primary' }],
      }),
    });

    if (!busyResponse.ok) {
      await notifyAdmins(base44, lead, {
        leadId,
        fullName,
        businessName,
        email,
        message,
        eventType: 'booking_request_failed',
        uniqueKey: `booking_request_failed:${leadId}:${slotStart}`,
        title: 'Strategy call booking request failed',
        message: 'A strategy call booking request could not be verified against Google Calendar availability.',
        priority: 'high',
      });
      const details = await busyResponse.text();
      return Response.json({ error: details || 'Unable to verify calendar availability' }, { status: 500 });
    }

    const busyData = await busyResponse.json();
    const busyWindows = busyData.calendars?.primary?.busy || [];
    if (busyWindows.length > 0) {
      await notifyAdmins(base44, lead, {
        leadId,
        fullName,
        businessName,
        email,
        message,
        eventType: 'booking_request_failed',
        uniqueKey: `booking_request_failed:${leadId}:${slotStart}`,
        title: 'Strategy call slot could not be completed',
        message: 'A strategy call request was submitted, but the selected slot was no longer available.',
        priority: 'high',
      });
      return Response.json({ error: 'That slot is no longer available. Please choose another time.' }, { status: 409 });
    }

    const eventResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: `AssistantAI Strategy Call — ${fullName}`,
        description: [
          businessName ? `Business: ${businessName}` : '',
          email ? `Email: ${email}` : '',
          message ? `Notes: ${message}` : '',
          `Lead ID: ${leadId}`,
        ].filter(Boolean).join('\n'),
        start: {
          dateTime: slotStart,
          timeZone: timezone,
        },
        end: {
          dateTime: slotEnd,
          timeZone: timezone,
        },
        attendees: [{ email }],
        reminders: {
          useDefault: true,
        },
        extendedProperties: {
          private: {
            leadId,
          },
        },
      }),
    });

    if (!eventResponse.ok) {
      await notifyAdmins(base44, lead, {
        leadId,
        fullName,
        businessName,
        email,
        message,
        eventType: 'booking_request_failed',
        uniqueKey: `booking_request_failed:${leadId}:${slotStart}`,
        title: 'Strategy call booking could not be created',
        message: 'A strategy call request was captured, but the Google Calendar booking could not be completed.',
        priority: 'high',
      });
      const details = await eventResponse.text();
      return Response.json({ error: details || 'Unable to create calendar event' }, { status: 500 });
    }

    const event = await eventResponse.json();
    const now = new Date().toISOString();
    const bookingNote = `[${now}] Strategy call booked via Google Calendar\nStart: ${slotStart}\nEnd: ${slotEnd}\nEvent ID: ${event.id}${event.htmlLink ? `\nEvent Link: ${event.htmlLink}` : ''}`;

    if (lead) {
      await base44.asServiceRole.entities.Lead.update(lead.id, {
        ...lead,
        status: 'Strategy Call Booked',
        booking_source: lead.booking_source || 'strategy_call_page',
        preferred_meeting_date: lead.preferred_meeting_date || slotStart.split('T')[0],
        preferred_meeting_time: lead.preferred_meeting_time || slotStart.slice(11, 16),
        confirmed_meeting_date: slotStart.split('T')[0],
        confirmed_meeting_time: slotStart.slice(11, 16),
        booking_status: 'confirmed',
        booking_provider: 'googlecalendar',
        booking_reference: event.id,
        last_activity_at: now,
        next_action: 'Prepare for booked strategy call.',
        notes: lead.notes ? `${lead.notes}\n\n${bookingNote}` : bookingNote,
      });
    }

    return Response.json({
      success: true,
      provider: 'Google Calendar',
      event_id: event.id,
      event_link: event.htmlLink || null,
      booking_status: 'confirmed',
      confirmed_start: slotStart,
      confirmed_end: slotEnd,
      title: 'Strategy Call Confirmed',
      message: 'Your strategy call is confirmed and has been added to Google Calendar.',
      actionLabel: event.htmlLink ? 'Open Calendar Event' : null,
      checkout_url: event.htmlLink || null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});