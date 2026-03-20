import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

function overlaps(slotStart, slotEnd, busyStart, busyEnd) {
  return busyStart < slotEnd && busyEnd > slotStart;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    const slotMinutes = Math.min(Math.max(Number(payload.slotMinutes) || 60, 15), 120);
    const daysAhead = Math.min(Math.max(Number(payload.daysAhead) || 10, 1), 14);
    const timezone = 'UTC';

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');

    const now = new Date();
    const timeMaxDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    const busyResponse = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timeMin: now.toISOString(),
        timeMax: timeMaxDate.toISOString(),
        timeZone: timezone,
        items: [{ id: 'primary' }],
      }),
    });

    if (!busyResponse.ok) {
      const details = await busyResponse.text();
      return Response.json({ error: details || 'Unable to fetch calendar availability' }, { status: 500 });
    }

    const busyData = await busyResponse.json();
    const busyWindows = busyData.calendars?.primary?.busy || [];
    const slots = [];

    for (let dayOffset = 0; dayOffset < daysAhead; dayOffset += 1) {
      const dayStart = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + dayOffset,
        9,
        0,
        0,
        0,
      ));

      const dayOfWeek = dayStart.getUTCDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        continue;
      }

      for (let minutes = 0; minutes <= (8 * 60) - slotMinutes; minutes += slotMinutes) {
        const slotStart = new Date(dayStart.getTime() + minutes * 60 * 1000);
        const slotEnd = new Date(slotStart.getTime() + slotMinutes * 60 * 1000);

        if (slotStart <= now) {
          continue;
        }

        const isBusy = busyWindows.some((window) => overlaps(
          slotStart,
          slotEnd,
          new Date(window.start),
          new Date(window.end),
        ));

        if (!isBusy) {
          slots.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
          });
        }
      }
    }

    return Response.json({
      is_live: true,
      provider: 'Google Calendar',
      timezone,
      slot_minutes: slotMinutes,
      working_hours: 'Mon-Fri 09:00-17:00 UTC',
      slots: slots.slice(0, 20),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});