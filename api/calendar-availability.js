import { ASSISTANTAI_SALES_CALENDAR_ID, TIMEZONE, getLocalDateParts, googleCalendarFetch, zonedDateTimeToUtc } from './_google-calendar.js';

function overlaps(slotStart, slotEnd, busyStart, busyEnd) {
  return slotStart < busyEnd && slotEnd > busyStart;
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.method === 'POST'
      ? (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {})
      : req.query || {};

    const slotMinutes = Math.min(Math.max(Number(body.slotMinutes) || 60, 15), 120);
    const daysAhead = Math.min(Math.max(Number(body.daysAhead) || 10, 1), 14);
    const calendarId = String(body.calendarId || ASSISTANTAI_SALES_CALENDAR_ID).trim();
    const now = new Date();
    const timeMaxDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    const busyData = await googleCalendarFetch('/freeBusy', {
      method: 'POST',
      body: JSON.stringify({
        timeMin: now.toISOString(),
        timeMax: timeMaxDate.toISOString(),
        timeZone: TIMEZONE,
        items: [{ id: calendarId }]
      })
    });

    const busyWindows = busyData.calendars?.[calendarId]?.busy || [];
    const slots = [];

    for (let dayOffset = 0; dayOffset < daysAhead; dayOffset += 1) {
      const localDate = getLocalDateParts(now, dayOffset, TIMEZONE);
      if (localDate.weekday === 'Sat' || localDate.weekday === 'Sun') continue;

      for (let hour = 9; hour < 17; hour += 1) {
        const slotStart = zonedDateTimeToUtc(localDate.year, localDate.month, localDate.day, hour, 0, TIMEZONE);
        const slotEnd = new Date(slotStart.getTime() + slotMinutes * 60 * 1000);
        if (slotStart <= now) continue;

        const isBusy = busyWindows.some((window) => overlaps(slotStart, slotEnd, new Date(window.start), new Date(window.end)));
        if (!isBusy) {
          slots.push({ start: slotStart.toISOString(), end: slotEnd.toISOString(), calendar_id: calendarId });
        }
      }
    }

    return res.status(200).json({
      success: true,
      is_live: true,
      provider: 'Google Calendar',
      calendar_id: calendarId,
      calendar_email: ASSISTANTAI_SALES_CALENDAR_ID,
      timezone: TIMEZONE,
      slot_minutes: slotMinutes,
      working_hours: 'Mon-Fri 09:00-17:00 Australia/Melbourne',
      slots: slots.slice(0, 20)
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Calendar availability failed', details: error.message });
  }
}
