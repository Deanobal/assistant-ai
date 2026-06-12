import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ASSISTANTAI_SALES_CALENDAR_ID = 'sales@assistantai.com.au';
const TIMEZONE = 'Australia/Melbourne';

function overlaps(slotStart, slotEnd, busyStart, busyEnd) {
  return slotStart < busyEnd && slotEnd > busyStart;
}

function getTimeZoneOffsetMinutes(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone,
    timeZoneName: 'shortOffset',
    hour: '2-digit',
  }).formatToParts(date);
  const offset = parts.find((part) => part.type === 'timeZoneName')?.value || 'GMT+0';
  const match = offset.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/);
  if (!match) return 0;
  const sign = match[1] === '+' ? 1 : -1;
  const hours = Number(match[2] || 0);
  const minutes = Number(match[3] || 0);
  return sign * ((hours * 60) + minutes);
}

function zonedDateTimeToUtc(year, month, day, hour, minute, timeZone) {
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));
  const offsetMinutes = getTimeZoneOffsetMinutes(utcGuess, timeZone);
  return new Date(utcGuess.getTime() - offsetMinutes * 60 * 1000);
}

function getMelbourneDateParts(date, dayOffset) {
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const year = Number(parts.find((part) => part.type === 'year')?.value);
  const month = Number(parts.find((part) => part.type === 'month')?.value);
  const day = Number(parts.find((part) => part.type === 'day')?.value);
  const localMiddayUtc = zonedDateTimeToUtc(year, month, day, 12, 0, TIMEZONE);
  localMiddayUtc.setUTCDate(localMiddayUtc.getUTCDate() + dayOffset);
  const shiftedParts = new Intl.DateTimeFormat('en-AU', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).formatToParts(localMiddayUtc);
  return {
    year: Number(shiftedParts.find((part) => part.type === 'year')?.value),
    month: Number(shiftedParts.find((part) => part.type === 'month')?.value),
    day: Number(shiftedParts.find((part) => part.type === 'day')?.value),
    weekday: shiftedParts.find((part) => part.type === 'weekday')?.value,
  };
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
      const localDate = getMelbourneDateParts(now, dayOffset);
      if (localDate.weekday === 'Sat' || localDate.weekday === 'Sun') continue;

      for (let hour = 9; hour < 17; hour += 1) {
        const slotStart = zonedDateTimeToUtc(localDate.year, localDate.month, localDate.day, hour, 0, TIMEZONE);
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
