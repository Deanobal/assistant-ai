import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ASSISTANTAI_SALES_CALENDAR_ID = 'sales@assistantai.com.au';
const TIMEZONE = 'Australia/Melbourne';

function overlaps(slotStart, slotEnd, busyStart, busyEnd) {
  return busyStart < slotEnd && busyEnd > slotStart;
}

function melbourneDateParts(date, dayOffset, hour, minute = 0) {
  const local = new Date(date.toLocaleString('en-US', { timeZone: TIMEZONE }));
  local.setDate(local.getDate() + dayOffset);
  local.setHours(hour, minute, 0, 0);
  return new Date(local.getTime() - (local.getTimezoneOffset() * 60 * 1000));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    if (req.headers.get('authorization')) {
      await base44.auth.me().catch(() => null);
    }
    const slotMinutes = Math.min(Math.max(Number(payload.slotMinutes) || 60, 15), 120);
    const daysAhead = Math.min(Math.max(Number(payload.daysAhead) || 10, 1), 14);
    const calendarId = payload.calendarId || ASSISTANTAI_SALES_CALENDAR_ID;

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
        timeZone: TIMEZONE,
        items: [{ id: calendarId }],
      }),
    });

    if (!busyResponse.ok) {
      const details = await busyResponse.text();
      return Response.json({ error: details || 'Unable to fetch calendar availability' }, { status: 500 });
    }

    const busyData = await busyResponse.json();
    const busyWindows = busyData.calendars?.[calendarId]?.busy || [];
    const slots = [];

    for (let dayOffset = 0; dayOffset < daysAhead; dayOffset += 1) {
      const candidateDay = new Date(now);
      candidateDay.setDate(now.getDate() + dayOffset);
      const dayOfWeek = new Intl.DateTimeFormat('en-AU', { timeZone: TIMEZONE, weekday: 'short' }).format(candidateDay);
      if (dayOfWeek === 'Sat' || dayOfWeek === 'Sun') continue;

      for (let hour = 9; hour < 17; hour += 1) {
        const slotStart = melbourneDateParts(now, dayOffset, hour, 0);
        const slotEnd = new Date(slotStart.getTime() + slotMinutes * 60 * 1000);

        if (slotStart <= now) continue;

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
            calendar_id: calendarId,
          });
        }
      }
    }

    return Response.json({
      is_live: true,
      provider: 'Google Calendar',
      calendar_id: calendarId,
      calendar_email: ASSISTANTAI_SALES_CALENDAR_ID,
      timezone: TIMEZONE,
      slot_minutes: slotMinutes,
      working_hours: 'Mon-Fri 09:00-17:00 Australia/Melbourne',
      slots: slots.slice(0, 20),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
