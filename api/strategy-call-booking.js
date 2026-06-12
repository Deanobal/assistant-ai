import { ASSISTANTAI_SALES_CALENDAR_ID, TIMEZONE, googleCalendarFetch } from './_google-calendar.js';

function clean(value) {
  return String(value || '').trim();
}

function supabaseConfig() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server configuration missing');
  return { url, key };
}

async function supabaseRequest(path, options = {}) {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/rest/v1${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: options.prefer || 'return=representation',
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.message || text || response.statusText);
  return data;
}

async function getLead(leadId) {
  const data = await supabaseRequest(`/leads?id=eq.${encodeURIComponent(leadId)}&limit=1`, { method: 'GET' });
  return Array.isArray(data) ? data[0] || null : null;
}

async function updateLead(leadId, payload) {
  const data = await supabaseRequest(`/leads?id=eq.${encodeURIComponent(leadId)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
  return Array.isArray(data) ? data[0] || null : data;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const leadId = clean(body.leadId || body.lead_id);
    const fullName = clean(body.fullName || body.full_name);
    const businessName = clean(body.businessName || body.business_name);
    const email = clean(body.email).toLowerCase();
    const message = clean(body.message);
    const slotStart = clean(body.slotStart || body.slot_start);
    const slotEnd = clean(body.slotEnd || body.slot_end);
    const timezone = clean(body.timezone || TIMEZONE);
    const calendarId = clean(body.calendarId || body.calendar_id || ASSISTANTAI_SALES_CALENDAR_ID);

    if (!leadId || !fullName || !email || !slotStart || !slotEnd) {
      return res.status(400).json({ error: 'leadId, fullName, email, slotStart, and slotEnd are required' });
    }

    const lead = await getLead(leadId);
    const busyData = await googleCalendarFetch('/freeBusy', {
      method: 'POST',
      body: JSON.stringify({
        timeMin: slotStart,
        timeMax: slotEnd,
        timeZone: timezone,
        items: [{ id: calendarId }]
      })
    });

    const busyWindows = busyData.calendars?.[calendarId]?.busy || [];
    if (busyWindows.length > 0) {
      return res.status(409).json({ error: 'That slot is no longer available. Please choose another time.' });
    }

    const event = await googleCalendarFetch(`/calendars/${encodeURIComponent(calendarId)}/events`, {
      method: 'POST',
      body: JSON.stringify({
        summary: `AssistantAI Strategy Call - ${fullName}`,
        description: [
          businessName ? `Business: ${businessName}` : '',
          email ? `Email: ${email}` : '',
          message ? `Notes: ${message}` : '',
          `Lead ID: ${leadId}`,
          `Calendar: ${calendarId}`
        ].filter(Boolean).join('\n'),
        start: { dateTime: slotStart, timeZone: timezone },
        end: { dateTime: slotEnd, timeZone: timezone },
        attendees: [{ email }],
        reminders: { useDefault: true },
        extendedProperties: { private: { leadId, calendarId } }
      })
    });

    const now = new Date().toISOString();
    const bookingNote = `[${now}] Strategy call booked via Google Calendar\nCalendar: ${calendarId}\nStart: ${slotStart}\nEnd: ${slotEnd}\nEvent ID: ${event.id}${event.htmlLink ? `\nEvent Link: ${event.htmlLink}` : ''}`;
    const updatedLead = await updateLead(leadId, {
      status: 'Strategy Call Booked',
      booking_source: lead?.booking_source || 'strategy_call_page',
      preferred_meeting_date: lead?.preferred_meeting_date || slotStart.split('T')[0],
      preferred_meeting_time: lead?.preferred_meeting_time || slotStart.slice(11, 16),
      confirmed_meeting_date: slotStart.split('T')[0],
      confirmed_meeting_time: slotStart.slice(11, 16),
      booking_status: 'confirmed',
      booking_provider: 'googlecalendar',
      booking_reference: event.id,
      last_activity_at: now,
      next_action: 'Prepare for booked strategy call.',
      notes: lead?.notes ? `${lead.notes}\n\n${bookingNote}` : bookingNote,
      updated_at: now
    });

    return res.status(200).json({
      success: true,
      provider: 'Google Calendar',
      calendar_id: calendarId,
      calendar_email: ASSISTANTAI_SALES_CALENDAR_ID,
      event_id: event.id,
      event_link: event.htmlLink || null,
      booking_status: 'confirmed',
      confirmed_start: slotStart,
      confirmed_end: slotEnd,
      lead: updatedLead,
      title: 'Strategy Call Confirmed',
      message: 'Your strategy call is confirmed and has been added to the AssistantAI sales Google Calendar.',
      actionLabel: event.htmlLink ? 'Open Calendar Event' : null,
      checkout_url: event.htmlLink || null
    });
  } catch (error) {
    return res.status(500).json({ error: 'Strategy call booking failed', details: error.message });
  }
}
