import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

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
      const details = await busyResponse.text();
      return Response.json({ error: details || 'Unable to verify calendar availability' }, { status: 500 });
    }

    const busyData = await busyResponse.json();
    const busyWindows = busyData.calendars?.primary?.busy || [];
    if (busyWindows.length > 0) {
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
      const details = await eventResponse.text();
      return Response.json({ error: details || 'Unable to create calendar event' }, { status: 500 });
    }

    const event = await eventResponse.json();
    const leadMatches = await base44.asServiceRole.entities.Lead.filter({ id: leadId }, '-updated_date', 1);
    const lead = leadMatches[0];
    const bookingNote = `[${new Date().toISOString()}] Google Calendar booking created for ${slotStart}. Event ID: ${event.id}`;

    if (lead) {
      await base44.asServiceRole.entities.Lead.update(lead.id, {
        ...lead,
        status: 'Strategy Call Booked',
        booking_source: 'google_calendar_live',
        preferred_meeting_date: slotStart.split('T')[0],
        preferred_meeting_time: slotStart.slice(11, 16),
        next_action: 'Prepare for booked strategy call.',
        notes: lead.notes ? `${lead.notes}\n\n${bookingNote}` : bookingNote,
      });
    }

    await base44.asServiceRole.entities.StrategyCallBooking.create({
      lead_id: leadId,
      calendar_event_id: event.id,
      full_name: fullName,
      email,
      business_name: businessName || '',
      start_time: slotStart,
      end_time: slotEnd,
      timezone,
      status: 'scheduled',
      meeting_link: event.htmlLink || null,
      last_calendar_sync_at: new Date().toISOString(),
      last_calendar_change: 'created',
      reminder_24h_sent: false,
      reminder_1h_sent: false,
    });

    return Response.json({
      success: true,
      provider: 'Google Calendar',
      event_id: event.id,
      event_link: event.htmlLink || null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});