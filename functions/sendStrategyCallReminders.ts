import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

function buildMeetingDateTime(date, time) {
  if (!date || !time) return null;
  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  return `${date}T${normalizedTime}Z`;
}

function appendNote(notes, line) {
  return notes ? `${notes}\n\n${line}` : line;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const leads = await base44.asServiceRole.entities.Lead.list('-updated_date', 500);
    const now = Date.now();
    let sentCount = 0;

    for (const lead of leads) {
      if (!lead?.email || !lead?.booking_intent || lead.status !== 'Strategy Call Booked') {
        continue;
      }

      const startTimeIso = buildMeetingDateTime(lead.preferred_meeting_date, lead.preferred_meeting_time);
      if (!startTimeIso) {
        continue;
      }

      const startTime = new Date(startTimeIso).getTime();
      const hoursUntil = (startTime - now) / (60 * 60 * 1000);
      const reminderKeyBase = `${lead.preferred_meeting_date} ${lead.preferred_meeting_time}`;
      const notes = lead.notes || '';
      let nextNotes = notes;
      let hasUpdates = false;

      if (!notes.includes(`[reminder_24h_sent:${reminderKeyBase}]`) && hoursUntil <= 24 && hoursUntil > 23.5) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: lead.email,
          subject: 'Reminder: your AssistantAI strategy call is tomorrow',
          body: `Hi ${lead.full_name},\n\nThis is a reminder that your AssistantAI strategy call is scheduled for ${startTimeIso} (UTC).\n\nIf anything changes, please reply to this email.\n\nAssistantAI`,
        });
        nextNotes = appendNote(nextNotes, `[reminder_24h_sent:${reminderKeyBase}]`);
        hasUpdates = true;
        sentCount += 1;
      }

      if (!notes.includes(`[reminder_1h_sent:${reminderKeyBase}]`) && hoursUntil <= 1 && hoursUntil > 0.5) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: lead.email,
          subject: 'Reminder: your AssistantAI strategy call starts in 1 hour',
          body: `Hi ${lead.full_name},\n\nYour AssistantAI strategy call starts in about 1 hour at ${startTimeIso} (UTC).\n\nAssistantAI`,
        });
        nextNotes = appendNote(nextNotes, `[reminder_1h_sent:${reminderKeyBase}]`);
        hasUpdates = true;
        sentCount += 1;
      }

      if (hasUpdates) {
        await base44.asServiceRole.entities.Lead.update(lead.id, {
          ...lead,
          notes: nextNotes,
          last_activity_at: new Date().toISOString(),
        });
      }
    }

    return Response.json({ success: true, reminders_sent: sentCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});