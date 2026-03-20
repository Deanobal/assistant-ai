import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);
    const state = body?.data?._provider_meta?.['x-goog-resource-state'];

    if (state === 'sync') {
      return Response.json({ status: 'sync_ack' });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');
    const syncMatches = await base44.asServiceRole.entities.SyncState.filter({ integration_type: 'googlecalendar' }, '-updated_date', 1);
    const syncRecord = syncMatches[0] || null;

    let url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=100';
    if (syncRecord?.sync_token) {
      url += `&syncToken=${encodeURIComponent(syncRecord.sync_token)}`;
    } else {
      url += `&timeMin=${encodeURIComponent(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())}`;
    }

    let response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 410) {
      url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=100'
        + `&timeMin=${encodeURIComponent(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())}`;
      response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }

    if (!response.ok) {
      const details = await response.text();
      throw new Error(details || 'Unable to sync Google Calendar changes');
    }

    const changedEvents = [];
    let pageData = await response.json();
    let newSyncToken = null;

    while (true) {
      changedEvents.push(...(pageData.items || []));
      if (pageData.nextSyncToken) {
        newSyncToken = pageData.nextSyncToken;
      }
      if (!pageData.nextPageToken) {
        break;
      }

      const nextResponse = await fetch(`${url}&pageToken=${pageData.nextPageToken}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!nextResponse.ok) {
        break;
      }

      pageData = await nextResponse.json();
    }

    for (const event of changedEvents) {
      const bookingMatches = await base44.asServiceRole.entities.StrategyCallBooking.filter({ calendar_event_id: event.id }, '-updated_date', 1);
      const booking = bookingMatches[0];

      if (!booking) {
        continue;
      }

      const nextStatus = event.status === 'cancelled' ? 'cancelled' : 'updated';
      const nextStart = event.start?.dateTime || booking.start_time;
      const nextEnd = event.end?.dateTime || booking.end_time;
      const syncTimestamp = new Date().toISOString();

      await base44.asServiceRole.entities.StrategyCallBooking.update(booking.id, {
        ...booking,
        start_time: nextStart,
        end_time: nextEnd,
        status: nextStatus,
        meeting_link: event.htmlLink || booking.meeting_link || null,
        last_calendar_sync_at: syncTimestamp,
        last_calendar_change: state || 'updated',
        reminder_24h_sent: nextStatus === 'updated' ? false : booking.reminder_24h_sent,
        reminder_1h_sent: nextStatus === 'updated' ? false : booking.reminder_1h_sent,
      });

      if (booking.lead_id) {
        const leadMatches = await base44.asServiceRole.entities.Lead.filter({ id: booking.lead_id }, '-updated_date', 1);
        const lead = leadMatches[0];
        if (lead) {
          const followUpNote = `[${syncTimestamp}] Google Calendar event ${nextStatus}. Review booking changes and follow up if needed.`;
          await base44.asServiceRole.entities.Lead.update(lead.id, {
            ...lead,
            status: nextStatus === 'cancelled' ? 'Follow-Up' : lead.status,
            next_action: 'Review updated calendar booking and follow up with the lead.',
            notes: lead.notes ? `${lead.notes}\n\n${followUpNote}` : followUpNote,
          });
        }
      }
    }

    const syncPayload = {
      integration_type: 'googlecalendar',
      sync_token: newSyncToken || syncRecord?.sync_token || null,
      last_sync_at: new Date().toISOString(),
      last_status: 'success',
      last_error: null,
    };

    if (syncRecord) {
      await base44.asServiceRole.entities.SyncState.update(syncRecord.id, {
        ...syncRecord,
        ...syncPayload,
      });
    } else {
      await base44.asServiceRole.entities.SyncState.create(syncPayload);
    }

    return Response.json({ success: true, processed_events: changedEvents.length });
  } catch (error) {
    const base44 = createClientFromRequest(req);
    const syncMatches = await base44.asServiceRole.entities.SyncState.filter({ integration_type: 'googlecalendar' }, '-updated_date', 1);
    const syncRecord = syncMatches[0] || null;
    const errorPayload = {
      integration_type: 'googlecalendar',
      last_sync_at: new Date().toISOString(),
      last_status: 'error',
      last_error: error.message,
      sync_token: syncRecord?.sync_token || null,
    };

    if (syncRecord) {
      await base44.asServiceRole.entities.SyncState.update(syncRecord.id, {
        ...syncRecord,
        ...errorPayload,
      });
    } else {
      await base44.asServiceRole.entities.SyncState.create(errorPayload);
    }

    return Response.json({ error: error.message }, { status: 500 });
  }
});