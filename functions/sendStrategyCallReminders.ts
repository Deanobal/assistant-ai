import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const bookings = await base44.asServiceRole.entities.StrategyCallBooking.list('-start_time', 200);
    const now = Date.now();
    let sentCount = 0;

    for (const booking of bookings) {
      if (!booking?.email || !['scheduled', 'updated'].includes(booking.status)) {
        continue;
      }

      const startTime = new Date(booking.start_time).getTime();
      const hoursUntil = (startTime - now) / (60 * 60 * 1000);
      const updates = {};

      if (!booking.reminder_24h_sent && hoursUntil <= 24 && hoursUntil > 23.5) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: booking.email,
          subject: 'Reminder: your AssistantAI strategy call is tomorrow',
          body: `Hi ${booking.full_name},\n\nThis is a reminder that your AssistantAI strategy call is scheduled for ${booking.start_time} (UTC).\n\nIf anything changes, please reply to this email.\n\nAssistantAI`,
        });
        updates.reminder_24h_sent = true;
        sentCount += 1;
      }

      if (!booking.reminder_1h_sent && hoursUntil <= 1 && hoursUntil > 0.5) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: booking.email,
          subject: 'Reminder: your AssistantAI strategy call starts in 1 hour',
          body: `Hi ${booking.full_name},\n\nYour AssistantAI strategy call starts in about 1 hour at ${booking.start_time} (UTC).\n\nAssistantAI`,
        });
        updates.reminder_1h_sent = true;
        sentCount += 1;
      }

      if (Object.keys(updates).length > 0) {
        await base44.asServiceRole.entities.StrategyCallBooking.update(booking.id, {
          ...booking,
          ...updates,
        });
      }
    }

    return Response.json({ success: true, reminders_sent: sentCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});