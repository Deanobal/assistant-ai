import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

function appendNote(notes, line) {
  return notes ? `${notes}\n\n${line}` : line;
}

function extractEventId(data) {
  return data?.id || data?.eventId || data?.event_id || data?.resourceId || null;
}

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const base44 = createClientFromRequest(req);
    const state = body?.data?._provider_meta?.['x-goog-resource-state'] || 'updated';

    if (state === 'sync') {
      return Response.json({ status: 'sync_ack' });
    }

    const eventId = extractEventId(body?.data);
    if (!eventId) {
      return Response.json({ success: true, ignored: true, reason: 'No event ID in webhook payload' });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');
    const eventResponse = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    let event = null;
    let isCancelled = false;

    if (eventResponse.status === 404) {
      isCancelled = true;
    } else if (!eventResponse.ok) {
      const details = await eventResponse.text();
      throw new Error(details || 'Unable to fetch Google Calendar event');
    } else {
      event = await eventResponse.json();
      isCancelled = event?.status === 'cancelled';
    }

    const leadMatches = await base44.asServiceRole.entities.Lead.filter({ booking_reference: eventId }, '-updated_date', 20);
    const syncTimestamp = new Date().toISOString();

    for (const lead of leadMatches) {
      const followUpNote = isCancelled
        ? `[${syncTimestamp}] Google Calendar booking was cancelled. Review and follow up with the lead.`
        : `[${syncTimestamp}] Google Calendar booking was updated. Review confirmed strategy call details.`;

      await base44.asServiceRole.entities.Lead.update(lead.id, {
        ...lead,
        status: isCancelled ? 'Follow-Up' : 'Strategy Call Booked',
        booking_status: isCancelled ? 'cancelled' : 'confirmed',
        booking_provider: 'googlecalendar',
        booking_reference: eventId,
        confirmed_meeting_date: !isCancelled && event?.start?.dateTime ? event.start.dateTime.split('T')[0] : lead.confirmed_meeting_date || '',
        confirmed_meeting_time: !isCancelled && event?.start?.dateTime ? event.start.dateTime.slice(11, 16) : lead.confirmed_meeting_time || '',
        last_activity_at: syncTimestamp,
        next_action: isCancelled
          ? 'Follow up after cancelled strategy call booking.'
          : 'Prepare for confirmed strategy call and review any calendar updates.',
        notes: appendNote(lead.notes || '', followUpNote),
      });
    }

    return Response.json({ success: true, processed_leads: leadMatches.length, event_id: eventId, cancelled: isCancelled });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});