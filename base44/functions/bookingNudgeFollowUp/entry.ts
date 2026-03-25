import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const HIGH_INTENT_TAGS = new Set(['yes', 'call_me', 'preferred_time', 'tomorrow', 'urgent_interest']);
const BOOKING_RELATED_SMS_KINDS = new Set(['customer_strategy_call_request', 'customer_strategy_call_fallback']);
const DEFAULT_WINDOW_MINUTES = 30;
const DEFAULT_LOOKBACK_LIMIT = 80;
const REMINDER_DEDUPE_HOURS = 6;

function getErrorMessage(error) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'Unknown error';
}

function hasHighIntentTag(tag) {
  return HIGH_INTENT_TAGS.has(String(tag || ''));
}

function getHighIntentTags(log) {
  return (log?.metadata?.reply_intent_tags || []).filter((tag) => hasHighIntentTag(tag));
}

function isBookingConfirmed(lead) {
  return !!lead && (
    lead.status === 'Strategy Call Booked'
    || lead.booking_status === 'confirmed'
    || !!lead.booking_reference
    || (!!lead.confirmed_meeting_date && !!lead.confirmed_meeting_time)
  );
}

function isBookingRelatedLead(lead, log) {
  return !!lead && (
    !!lead.booking_intent
    || lead.enquiry_type === 'strategy_call'
    || BOOKING_RELATED_SMS_KINDS.has(log?.metadata?.matched_outbound_sms_kind)
  );
}

function buildBookingNudgeNextAction(tags) {
  if (tags.includes('call_me') && tags.includes('preferred_time')) {
    return 'Booking nudge: call this lead at their requested time and confirm the strategy call slot.';
  }

  if (tags.includes('call_me')) {
    return 'Booking nudge: call this lead and try to confirm the strategy call slot.';
  }

  if (tags.includes('preferred_time') || tags.includes('tomorrow')) {
    return 'Booking nudge: follow up on the requested time and confirm the strategy call slot.';
  }

  if (tags.includes('urgent_interest')) {
    return 'Booking nudge: prioritise fast follow-up and try to confirm the strategy call slot.';
  }

  return 'Booking nudge: follow up quickly and confirm whether the lead wants a strategy call slot.';
}

async function getLead(base44, leadId) {
  const leads = await base44.asServiceRole.entities.Lead.filter({ id: leadId }, '-updated_date', 1);
  return leads[0] || null;
}

async function hasRecentBookingConfirmedState(base44, leadId, receivedAt) {
  const recentBookingLogs = await base44.asServiceRole.entities.NotificationLog.filter({
    entity_id: leadId,
    event_type: 'booking_confirmed',
  }, '-created_date', 10);
  const windowStart = new Date(receivedAt).getTime() - (1000 * 60 * 60 * 48);

  return recentBookingLogs.some((log) => new Date(log.triggered_at || log.created_date).getTime() >= windowStart);
}

async function hasRecentReminder(base44, leadId, inboundLogId, nowIso) {
  const reminders = await base44.asServiceRole.entities.NotificationLog.filter({
    entity_id: leadId,
    event_type: 'customer_sms_reply_received',
    channel: 'in_app',
    recipient_role: 'admin',
  }, '-created_date', 20);
  const windowStart = new Date(nowIso).getTime() - (1000 * 60 * 60 * REMINDER_DEDUPE_HOURS);

  return reminders.some((log) => {
    const reminderTime = new Date(log.triggered_at || log.created_date).getTime();
    return reminderTime >= windowStart
      && log.metadata?.alert_category === 'booking_nudge_reminder'
      && log.metadata?.inbound_sms_log_id === inboundLogId;
  });
}

function isWorkedByAdmin(lead, expectedTask, receivedAt) {
  const currentTask = String(lead?.next_action || '').trim();
  const updatedAt = lead?.updated_date || lead?.last_activity_at || null;

  if (!updatedAt) {
    return false;
  }

  return currentTask && currentTask !== expectedTask && new Date(updatedAt).getTime() > new Date(receivedAt).getTime();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    const nowIso = payload?.currentTime || new Date().toISOString();
    const windowMinutes = Math.max(5, Number(payload?.windowMinutes) || DEFAULT_WINDOW_MINUTES);
    const limit = Math.max(1, Math.min(200, Number(payload?.limit) || DEFAULT_LOOKBACK_LIMIT));
    const forceDue = !!payload?.forceDue;
    const leadId = String(payload?.leadId || '').trim();

    const logs = leadId
      ? await base44.asServiceRole.entities.NotificationLog.filter({ entity_id: leadId, event_type: 'customer_sms_reply_received', channel: 'sms', match_status: 'matched' }, '-created_date', limit)
      : await base44.asServiceRole.entities.NotificationLog.filter({ event_type: 'customer_sms_reply_received', channel: 'sms', match_status: 'matched' }, '-created_date', limit);

    const latestPerLead = new Map();
    for (const log of logs) {
      if (!log?.entity_id || latestPerLead.has(log.entity_id)) {
        continue;
      }

      const tags = getHighIntentTags(log);
      if (log.sender_role !== 'client' || tags.length === 0) {
        continue;
      }

      latestPerLead.set(log.entity_id, { log, tags });
    }

    const results = [];

    for (const { log, tags } of latestPerLead.values()) {
      const lead = await getLead(base44, log.entity_id);
      if (!lead) {
        results.push({ lead_id: log.entity_id, status: 'skipped_missing_lead' });
        continue;
      }

      if (!isBookingRelatedLead(lead, log)) {
        results.push({ lead_id: lead.id, status: 'skipped_not_booking_context' });
        continue;
      }

      if (isBookingConfirmed(lead) || await hasRecentBookingConfirmedState(base44, lead.id, log.triggered_at || log.created_date)) {
        results.push({ lead_id: lead.id, status: 'skipped_booking_confirmed' });
        continue;
      }

      const expectedTask = buildBookingNudgeNextAction(tags);
      if (isWorkedByAdmin(lead, expectedTask, log.triggered_at || log.created_date)) {
        results.push({ lead_id: lead.id, status: 'skipped_worked_by_admin' });
        continue;
      }

      const dueAt = new Date(new Date(log.triggered_at || log.created_date).getTime() + (windowMinutes * 60 * 1000));
      if (!forceDue && new Date(nowIso).getTime() < dueAt.getTime()) {
        results.push({ lead_id: lead.id, status: 'skipped_not_due', due_at: dueAt.toISOString() });
        continue;
      }

      if (await hasRecentReminder(base44, lead.id, log.id, nowIso)) {
        results.push({ lead_id: lead.id, status: 'skipped_recent_duplicate', due_at: dueAt.toISOString() });
        continue;
      }

      const leadName = lead.business_name || lead.full_name || 'Lead';
      await base44.asServiceRole.entities.NotificationLog.create({
        event_type: 'customer_sms_reply_received',
        entity_name: 'Lead',
        entity_id: lead.id,
        client_account_id: lead.client_account_id || null,
        recipient_role: 'admin',
        recipient_email: String(Deno.env.get('ADMIN_NOTIFICATION_EMAIL') || '').trim().toLowerCase() || null,
        channel: 'in_app',
        delivery_status: 'stored',
        provider_name: 'AssistantAI Alerts',
        provider_message: `booking_nudge_reminder:${lead.id}:${log.id}`,
        title: 'Booking follow-up reminder needed',
        message: `${leadName} sent a high-intent SMS but no booking is confirmed yet. Internal follow-up prompt only.`,
        triggered_at: nowIso,
        actor_email: null,
        metadata: {
          alert_category: 'booking_nudge_reminder',
          admin_link: `/LeadDetail?id=${lead.id}`,
          inbound_sms_log_id: log.id,
          inbound_message_at: log.triggered_at || log.created_date,
          booking_nudge_due_at: dueAt.toISOString(),
          high_intent_tags: tags,
          latest_customer_message: log.message,
          expected_next_action: expectedTask,
          internal_prompt_only: true,
        },
      });

      results.push({
        lead_id: lead.id,
        status: 'reminder_created',
        due_at: dueAt.toISOString(),
        expected_next_action: expectedTask,
      });
    }

    return Response.json({
      success: true,
      now: nowIso,
      window_minutes: windowMinutes,
      reviewed: results.length,
      reminders_created: results.filter((item) => item.status === 'reminder_created').length,
      duplicate_skips: results.filter((item) => item.status === 'skipped_recent_duplicate').length,
      confirmed_skips: results.filter((item) => item.status === 'skipped_booking_confirmed').length,
      results,
    });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
});