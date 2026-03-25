import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function getErrorMessage(error) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'Unknown error';
}

function isValidObjectId(value) {
  return /^[a-f\d]{24}$/i.test(String(value || ''));
}

async function getNotificationLog(base44, id) {
  const records = await base44.asServiceRole.entities.NotificationLog.filter({ id }, '-created_date', 1);
  return records[0] || null;
}

async function getLead(base44, id) {
  const leads = await base44.asServiceRole.entities.Lead.filter({ id }, '-updated_date', 1);
  return leads[0] || null;
}

function hasHighIntentTag(tag) {
  return ['yes', 'call_me', 'preferred_time', 'tomorrow', 'urgent_interest'].includes(String(tag || ''));
}

function isHighIntentReply(tags) {
  return Array.isArray(tags) && tags.some((tag) => hasHighIntentTag(tag));
}

function buildHighIntentNextAction(tags) {
  if (tags.includes('call_me') && tags.includes('preferred_time')) {
    return 'Call lead back at the requested time from inbound SMS';
  }

  if (tags.includes('call_me')) {
    return 'Call lead back from high-intent SMS reply';
  }

  if (tags.includes('preferred_time') || tags.includes('tomorrow')) {
    return 'Follow up on requested booking time from inbound SMS';
  }

  if (tags.includes('urgent_interest')) {
    return 'Prioritise lead for fast booking follow-up';
  }

  return 'Follow up on high-intent SMS reply';
}

function isBookingConfirmed(lead) {
  return !!lead && (
    lead.status === 'Strategy Call Booked'
    || lead.booking_status === 'confirmed'
    || !!lead.booking_reference
    || (!!lead.confirmed_meeting_date && !!lead.confirmed_meeting_time)
  );
}

function isBookingRelatedLead(lead, unmatchedLog) {
  return !!lead && (
    !!lead.booking_intent
    || lead.enquiry_type === 'strategy_call'
    || ['customer_strategy_call_request', 'customer_strategy_call_fallback'].includes(
      unmatchedLog?.metadata?.matched_outbound_sms_kind || unmatchedLog?.metadata?.sms_kind || ''
    )
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

function buildBookingNudgeNote(existingNotes, timestamp, body, tags) {
  const noteLine = `[Booking nudge ${timestamp}] Latest customer intent: "${body}"${tags.length ? ` | tags: ${tags.join(', ')}` : ''} | Booking is not confirmed yet — internal follow-up prompt only.`;
  return existingNotes ? `${existingNotes}\n${noteLine}` : noteLine;
}

function buildLeadNote(existingNotes, timestamp, body, tags) {
  const noteLine = `[High-intent inbound SMS ${timestamp}] ${body}${tags.length ? ` | tags: ${tags.join(', ')}` : ''}`;
  return existingNotes ? `${existingNotes}\n${noteLine}` : noteLine;
}

async function hasRecentBookingConfirmedState(base44, leadId, receivedAt) {
  const recentBookingLogs = await base44.asServiceRole.entities.NotificationLog.filter({
    entity_id: leadId,
    event_type: 'booking_confirmed',
  }, '-created_date', 10);
  const windowStart = new Date(receivedAt).getTime() - (1000 * 60 * 60 * 48);

  return recentBookingLogs.some((log) => new Date(log.triggered_at || log.created_date).getTime() >= windowStart);
}

async function isBookingNudgeEligible(base44, lead, unmatchedLog, receivedAt) {
  if (!lead || !isBookingRelatedLead(lead, unmatchedLog) || isBookingConfirmed(lead)) {
    return false;
  }

  return !(await hasRecentBookingConfirmedState(base44, lead.id, receivedAt));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const payload = await req.json();
    const action = String(payload?.action || 'match').trim();
    const unmatchedLogId = String(payload?.unmatchedLogId || '').trim();
    const leadId = String(payload?.leadId || '').trim();

    if (!isValidObjectId(unmatchedLogId)) {
      return Response.json({ error: 'A valid unmatchedLogId is required' }, { status: 400 });
    }

    if (action === 'match' && !isValidObjectId(leadId)) {
      return Response.json({ error: 'A valid leadId is required for manual matching' }, { status: 400 });
    }

    if (!['match', 'review_no_match'].includes(action)) {
      return Response.json({ error: 'Unsupported action' }, { status: 400 });
    }

    const unmatchedLog = await getNotificationLog(base44, unmatchedLogId);
    if (!unmatchedLog) {
      return Response.json({ error: 'Unmatched SMS record not found' }, { status: 404 });
    }

    if (unmatchedLog.event_type !== 'customer_sms_reply_unmatched' || unmatchedLog.channel !== 'sms' || unmatchedLog.sender_role !== 'client') {
      return Response.json({ error: 'Only unmatched inbound customer SMS records can be manually matched' }, { status: 400 });
    }

    if (action === 'review_no_match') {
      if (unmatchedLog.metadata?.manual_match_copy_log_id) {
        return Response.json({ error: 'This SMS was already manually matched to a lead' }, { status: 400 });
      }

      if (unmatchedLog.metadata?.resolution_status === 'reviewed_no_match') {
        return Response.json({
          success: true,
          duplicate: true,
          unmatched_log_id: unmatchedLog.id,
          resolution_status: 'reviewed_no_match',
        });
      }

      const reviewedAt = new Date().toISOString();
      await base44.asServiceRole.entities.NotificationLog.update(unmatchedLog.id, {
        ...unmatchedLog,
        match_status: unmatchedLog.match_status || 'unmatched',
        actor_email: user.email || null,
        metadata: {
          ...(unmatchedLog.metadata || {}),
          resolution_status: 'reviewed_no_match',
          no_match_reviewed_at: reviewedAt,
          no_match_reviewed_by: user.email || null,
        },
      });

      return Response.json({
        success: true,
        duplicate: false,
        unmatched_log_id: unmatchedLog.id,
        resolution_status: 'reviewed_no_match',
        reviewed_at: reviewedAt,
        reviewed_by: user.email || null,
      });
    }

    const lead = await getLead(base44, leadId);
    if (!lead) {
      return Response.json({ error: 'Lead not found' }, { status: 404 });
    }

    const existingCopyId = unmatchedLog.metadata?.manual_match_copy_log_id;
    if (existingCopyId && isValidObjectId(existingCopyId)) {
      return Response.json({
        success: true,
        duplicate: true,
        unmatched_log_id: unmatchedLog.id,
        matched_log_id: existingCopyId,
        lead_id: unmatchedLog.metadata?.resolved_lead_id || lead.id,
      });
    }

    const matchedAt = new Date().toISOString();
    const matchedLog = await base44.asServiceRole.entities.NotificationLog.create({
      event_type: 'customer_sms_reply_received',
      entity_name: 'Lead',
      entity_id: lead.id,
      client_account_id: lead.client_account_id || unmatchedLog.client_account_id || null,
      sender_role: unmatchedLog.sender_role || 'client',
      recipient_role: unmatchedLog.recipient_role || 'admin',
      match_status: 'matched',
      recipient_email: unmatchedLog.recipient_email || unmatchedLog.metadata?.receiver_number || null,
      channel: unmatchedLog.channel,
      delivery_status: unmatchedLog.delivery_status || 'stored',
      provider_name: unmatchedLog.provider_name || 'Twilio',
      provider_message: unmatchedLog.provider_message,
      provider_message_id: unmatchedLog.provider_message_id,
      provider_status: unmatchedLog.provider_status || 'received',
      provider_error_code: unmatchedLog.provider_error_code || null,
      provider_error_message: unmatchedLog.provider_error_message || null,
      title: 'Customer SMS reply received',
      message: unmatchedLog.message,
      triggered_at: unmatchedLog.triggered_at || matchedAt,
      delivered_at: unmatchedLog.delivered_at || null,
      failed_at: unmatchedLog.failed_at || null,
      actor_email: user.email || null,
      metadata: {
        ...(unmatchedLog.metadata || {}),
        match_method: 'manual_admin',
        matched_lead_id: lead.id,
        manual_match_source_id: unmatchedLog.id,
        manual_matched_at: matchedAt,
        manual_matched_by: user.email || null,
      },
    });

    await base44.asServiceRole.entities.NotificationLog.update(unmatchedLog.id, {
      ...unmatchedLog,
      match_status: 'matched',
      actor_email: user.email || null,
      metadata: {
        ...(unmatchedLog.metadata || {}),
        original_match_status: unmatchedLog.match_status || null,
        resolution_status: 'manually_matched',
        resolved_lead_id: lead.id,
        resolved_lead_name: lead.business_name || lead.full_name || 'Lead',
        resolved_at: matchedAt,
        resolved_by: user.email || null,
        manual_match_copy_log_id: matchedLog.id,
      },
    });

    const replyTags = Array.isArray(unmatchedLog.metadata?.reply_intent_tags)
      ? unmatchedLog.metadata.reply_intent_tags.filter(hasHighIntentTag)
      : [];

    let bookingNudgeStatus = null;
    let bookingNudgeDueAt = null;

    if (isHighIntentReply(replyTags)) {
      const activityAt = unmatchedLog.triggered_at || matchedAt;
      const bookingNudgeActive = await isBookingNudgeEligible(base44, lead, unmatchedLog, activityAt);
      const nextAction = bookingNudgeActive ? buildBookingNudgeNextAction(replyTags) : buildHighIntentNextAction(replyTags);
      bookingNudgeStatus = bookingNudgeActive ? 'follow_up_needed' : null;
      bookingNudgeDueAt = bookingNudgeActive
        ? new Date(new Date(activityAt).getTime() + (30 * 60 * 1000)).toISOString()
        : null;

      await base44.asServiceRole.entities.Lead.update(lead.id, {
        ...lead,
        last_activity_at: activityAt,
        notes: bookingNudgeActive
          ? buildBookingNudgeNote(lead.notes || '', activityAt, unmatchedLog.message, replyTags)
          : buildLeadNote(lead.notes || '', activityAt, unmatchedLog.message, replyTags),
        next_action: nextAction,
      });
    }

    return Response.json({
      success: true,
      duplicate: false,
      unmatched_log_id: unmatchedLog.id,
      matched_log_id: matchedLog.id,
      lead_id: lead.id,
      lead_name: lead.business_name || lead.full_name || 'Lead',
      booking_nudge_status: bookingNudgeStatus,
      booking_nudge_due_at: bookingNudgeDueAt,
    });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
});