import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const STRATEGY_SMS_KINDS = new Set([
  'customer_strategy_call_request',
  'customer_strategy_call_fallback',
  'customer_booking_confirmation',
]);
const BOOKING_RELATED_SMS_KINDS = new Set([
  'customer_strategy_call_request',
  'customer_strategy_call_fallback',
]);
const BOOKING_NUDGE_WINDOW_MINUTES = 30;

function getErrorMessage(error) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'Unknown error';
}

function normalizeValue(value) {
  const text = String(value || '').trim();
  return text || null;
}

function normalizePhone(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }

  const cleaned = raw.replace(/[^\d+]/g, '');
  const digits = cleaned.replace(/\D/g, '');

  if (cleaned.startsWith('+')) {
    return `+${digits}`;
  }

  if (digits.startsWith('61') && digits.length === 11) {
    return `+${digits}`;
  }

  if (digits.startsWith('0') && digits.length === 10) {
    return `+61${digits.slice(1)}`;
  }

  if (digits.length === 9 && digits.startsWith('4')) {
    return `+61${digits}`;
  }

  return cleaned;
}

function encodeBase64(bytes) {
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

async function signTwilioPayload(url, payload) {
  const authToken = String(Deno.env.get('TWILIO_AUTH_TOKEN') || '').trim();
  const secret = authToken.startsWith('TWILIO_AUTH_TOKEN=') ? authToken.slice('TWILIO_AUTH_TOKEN='.length).trim() : authToken;

  if (!secret) {
    return null;
  }

  const sortedKeys = Object.keys(payload).sort();
  const data = sortedKeys.reduce((acc, key) => `${acc}${key}${payload[key] ?? ''}`, url);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data));
  return encodeBase64(new Uint8Array(signature));
}

async function parseRequest(req) {
  const contentType = String(req.headers.get('content-type') || '').toLowerCase();

  if (contentType.includes('application/json')) {
    return { contentType, payload: await req.json() };
  }

  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    return { contentType, payload: Object.fromEntries(formData.entries()) };
  }

  const text = await req.text();
  if (!text) {
    return { contentType, payload: {} };
  }

  try {
    return { contentType, payload: JSON.parse(text) };
  } catch {
    return { contentType, payload: Object.fromEntries(new URLSearchParams(text).entries()) };
  }
}

function detectReplyTags(messageBody) {
  const body = String(messageBody || '').trim();
  const normalized = body.toUpperCase();
  const tags = [];

  if (/\bYES\b/.test(normalized)) {
    tags.push('yes');
  }

  if (/\b(?:CALL\s+ME|PHONE\s+ME|RING\s+ME|GIVE\s+ME\s+A\s+CALL)\b/.test(normalized)) {
    tags.push('call_me');
  }

  if (/\bTOMORROW\b/.test(normalized)) {
    tags.push('tomorrow');
  }

  if (/\b\d{1,2}(?::\d{2})?\s?(?:AM|PM)\b/.test(normalized) || /\b(?:THIS\s+AFTERNOON|AFTERNOON|MORNING|EVENING|TONIGHT)\b/.test(normalized)) {
    tags.push('preferred_time');
  }

  if (/\b(?:URGENT|ASAP|RIGHT\s+AWAY|READY\s+TO\s+(?:BOOK|TALK|SPEAK)|BOOK\s+ME\s+IN|LET'?S\s+BOOK|CAN\s+WE\s+BOOK|KEEN\s+TO\s+BOOK|READY\s+TO\s+GO)\b/.test(normalized)) {
    tags.push('urgent_interest');
  }

  return [...new Set(tags)];
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

function isBookingRelatedLead(lead, outboundLog) {
  return !!lead && (
    !!lead.booking_intent
    || lead.enquiry_type === 'strategy_call'
    || BOOKING_RELATED_SMS_KINDS.has(outboundLog?.metadata?.sms_kind)
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
  const notePrefix = isHighIntentReply(tags) ? 'High-intent inbound SMS' : 'Inbound SMS';
  const noteLine = `[${notePrefix} ${timestamp}] ${body}${tags.length ? ` | tags: ${tags.join(', ')}` : ''}`;
  return existingNotes ? `${existingNotes}\n${noteLine}` : noteLine;
}

async function findLeadById(base44, leadId) {
  if (!/^[a-f\d]{24}$/i.test(String(leadId || ''))) {
    return null;
  }

  const leads = await base44.asServiceRole.entities.Lead.filter({ id: leadId }, '-updated_date', 1);
  return leads[0] || null;
}

async function findLeadMatch(base44, fromNumber) {
  const leads = await base44.asServiceRole.entities.Lead.list('-updated_date', 200);
  const exactCandidates = leads.filter((lead) => normalizePhone(lead.mobile_number) === fromNumber);
  const recentSmsLogs = await base44.asServiceRole.entities.NotificationLog.filter({ channel: 'sms' }, '-created_date', 200);
  const recentCustomerLogs = recentSmsLogs.filter((log) => (
    log.recipient_role === 'client'
    && STRATEGY_SMS_KINDS.has(log.metadata?.sms_kind)
    && normalizePhone(log.recipient_email) === fromNumber
    && log.entity_name === 'Lead'
    && log.entity_id
  ));

  const anchoredLog = recentCustomerLogs[0] || null;

  if (exactCandidates.length === 1) {
    return {
      lead: exactCandidates[0],
      matchStatus: 'matched',
      matchMethod: anchoredLog && anchoredLog.entity_id === exactCandidates[0].id ? 'mobile_number+notification_log' : 'mobile_number',
      outboundLog: anchoredLog && anchoredLog.entity_id === exactCandidates[0].id ? anchoredLog : null,
    };
  }

  if (exactCandidates.length > 1) {
    if (anchoredLog) {
      const anchoredLead = exactCandidates.find((lead) => lead.id === anchoredLog.entity_id);
      if (anchoredLead) {
        return {
          lead: anchoredLead,
          matchStatus: 'matched',
          matchMethod: 'notification_log',
          outboundLog: anchoredLog,
        };
      }
    }

    return {
      lead: null,
      matchStatus: 'uncertain',
      matchMethod: 'multiple_mobile_matches',
      outboundLog: anchoredLog,
    };
  }

  if (anchoredLog) {
    const anchoredLead = await findLeadById(base44, anchoredLog.entity_id);
    if (anchoredLead) {
      return {
        lead: anchoredLead,
        matchStatus: 'matched',
        matchMethod: 'notification_log',
        outboundLog: anchoredLog,
      };
    }
  }

  return {
    lead: null,
    matchStatus: 'unmatched',
    matchMethod: 'no_lead_match',
    outboundLog: null,
  };
}

function getTagSignature(tags) {
  return [...new Set((tags || []).filter(hasHighIntentTag))].sort().join('|') || 'none';
}

function normalizeMessageSignature(messageBody) {
  return String(messageBody || '').trim().toLowerCase().replace(/\s+/g, ' ').replace(/[^a-z0-9 :]/g, '').slice(0, 96);
}

async function hasRecentHighIntentAlert(base44, leadId, messageBody, tags, receivedAt) {
  const recentAlerts = await base44.asServiceRole.entities.NotificationLog.filter({
    entity_id: leadId,
    event_type: 'customer_sms_reply_received',
    channel: 'in_app',
    recipient_role: 'admin',
  }, '-created_date', 20);
  const tagSignature = getTagSignature(tags);
  const messageSignature = normalizeMessageSignature(messageBody);
  const windowStart = new Date(receivedAt).getTime() - (1000 * 60 * 60 * 2);

  return recentAlerts.some((log) => {
    const alertTime = new Date(log.triggered_at || log.created_date).getTime();
    return alertTime >= windowStart
      && log.metadata?.alert_category === 'high_intent_inbound_sms'
      && (
        log.metadata?.high_intent_tag_signature === tagSignature
        || log.metadata?.high_intent_message_signature === messageSignature
      );
  });
}

async function hasRecentBookingConfirmedState(base44, leadId, receivedAt) {
  const recentBookingLogs = await base44.asServiceRole.entities.NotificationLog.filter({
    entity_id: leadId,
    event_type: 'booking_confirmed',
  }, '-created_date', 10);
  const windowStart = new Date(receivedAt).getTime() - (1000 * 60 * 60 * 48);

  return recentBookingLogs.some((log) => new Date(log.triggered_at || log.created_date).getTime() >= windowStart);
}

async function isBookingNudgeEligible(base44, lead, outboundLog, receivedAt) {
  if (!lead || !isBookingRelatedLead(lead, outboundLog) || isBookingConfirmed(lead)) {
    return false;
  }

  return !(await hasRecentBookingConfirmedState(base44, lead.id, receivedAt));
}

async function sendHighIntentAdminAlert(base44, lead, messageBody, tags, receivedAt) {
  if (await hasRecentHighIntentAlert(base44, lead.id, messageBody, tags, receivedAt)) {
    return { status: 'skipped_recent_duplicate' };
  }

  const tagSignature = getTagSignature(tags);
  const messageSignature = normalizeMessageSignature(messageBody);
  const alertResponse = await base44.asServiceRole.functions.invoke('sendAdminAlert', {
    eventType: 'customer_sms_reply_received',
    entityName: 'Lead',
    entityId: lead.id,
    clientAccountId: lead.client_account_id || null,
    title: 'High-intent SMS needs reply',
    message: messageBody,
    actorEmail: null,
    uniqueKey: `high_intent_sms:${lead.id}:${tagSignature}:${Math.floor(new Date(receivedAt).getTime() / (1000 * 60 * 60 * 2))}`,
    priority: 'high',
    smsMessage: messageBody,
    metadata: {
      full_name: lead.full_name || null,
      business_name: lead.business_name || null,
      email: lead.email || null,
      mobile_number: lead.mobile_number || null,
      enquiry_type: lead.enquiry_type || null,
      admin_link: `/LeadDetail?id=${lead.id}`,
      alert_category: 'high_intent_inbound_sms',
      high_intent_tags: tags.filter(hasHighIntentTag),
      high_intent_tag_signature: tagSignature,
      high_intent_message_signature: messageSignature,
      inbound_message_at: receivedAt,
      intent_summary: buildHighIntentNextAction(tags),
      wait_label: 'Just now',
      channel_label: 'SMS',
      cta_label: 'Open Lead',
      message_preview: messageBody,
    },
  });

  return alertResponse?.data || alertResponse || { status: 'sent' };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { contentType, payload } = await parseRequest(req);

    if (!contentType.includes('application/json')) {
      const providedSignature = normalizeValue(req.headers.get('x-twilio-signature'));
      const expectedSignature = await signTwilioPayload(req.url, payload);

      if (!providedSignature || !expectedSignature || providedSignature !== expectedSignature) {
        return Response.json({ error: 'Invalid Twilio signature' }, { status: 403 });
      }
    }

    const fromNumber = normalizePhone(payload.From || payload.from || payload.sender_number);
    const toNumber = normalizePhone(payload.To || payload.to || payload.receiver_number);
    const messageBody = String(payload.Body || payload.body || '').trim();
    const messageSid = normalizeValue(payload.MessageSid || payload.SmsSid || payload.provider_message_id);
    const receivedAt = new Date().toISOString();

    if (!fromNumber || !toNumber || !messageBody || !messageSid) {
      return Response.json({ error: 'From, To, Body, and MessageSid are required' }, { status: 400 });
    }

    const duplicateLogs = await base44.asServiceRole.entities.NotificationLog.filter({
      channel: 'sms',
      provider_message_id: messageSid,
    }, '-created_date', 10);

    if (duplicateLogs.length > 0) {
      const existing = duplicateLogs[0];
      return Response.json({
        success: true,
        duplicate: true,
        log_id: existing.id,
        lead_id: existing.match_status === 'matched' ? existing.entity_id : null,
        match_status: existing.match_status || 'unmatched',
      });
    }

    const replyTags = detectReplyTags(messageBody);
    const match = await findLeadMatch(base44, fromNumber);
    const matchedLead = match.lead;
    const highIntent = isHighIntentReply(replyTags);
    const logEventType = matchedLead ? 'customer_sms_reply_received' : 'customer_sms_reply_unmatched';
    const entityId = matchedLead ? matchedLead.id : `unmatched:${messageSid}`;
    const title = matchedLead ? 'Customer SMS reply received' : 'Unmatched customer SMS reply';

    const record = await base44.asServiceRole.entities.NotificationLog.create({
      event_type: logEventType,
      entity_name: 'Lead',
      entity_id: entityId,
      client_account_id: matchedLead?.client_account_id || null,
      sender_role: 'client',
      recipient_role: 'admin',
      match_status: matchedLead ? 'matched' : match.matchStatus,
      recipient_email: toNumber,
      channel: 'sms',
      delivery_status: 'stored',
      provider_name: 'Twilio',
      provider_message: JSON.stringify({ from: fromNumber, to: toNumber, body: messageBody }),
      provider_message_id: messageSid,
      provider_status: 'received',
      provider_error_code: null,
      provider_error_message: null,
      title,
      message: messageBody,
      triggered_at: receivedAt,
      delivered_at: null,
      failed_at: null,
      actor_email: null,
      metadata: {
        sender_role: 'client',
        recipient_role: 'admin',
        sender_number: fromNumber,
        receiver_number: toNumber,
        inbound_message_sid: messageSid,
        received_at: receivedAt,
        reply_intent_tags: replyTags,
        requires_admin_attention: highIntent,
        match_method: match.matchMethod,
        matched_lead_id: matchedLead?.id || null,
        matched_outbound_log_id: match.outboundLog?.id || null,
        matched_outbound_sms_kind: match.outboundLog?.metadata?.sms_kind || null,
        raw_payload: payload,
      },
    });

    let recommendedNextAction = null;
    let adminAlertStatus = null;
    let bookingNudgeStatus = null;
    let bookingNudgeDueAt = null;

    if (matchedLead) {
      const bookingNudgeActive = highIntent && await isBookingNudgeEligible(base44, matchedLead, match.outboundLog, receivedAt);
      recommendedNextAction = bookingNudgeActive
        ? buildBookingNudgeNextAction(replyTags)
        : highIntent ? buildHighIntentNextAction(replyTags) : (matchedLead.next_action || 'Review inbound SMS reply');
      bookingNudgeStatus = bookingNudgeActive ? 'follow_up_needed' : null;
      bookingNudgeDueAt = bookingNudgeActive
        ? new Date(new Date(receivedAt).getTime() + (BOOKING_NUDGE_WINDOW_MINUTES * 60 * 1000)).toISOString()
        : null;

      await base44.asServiceRole.entities.Lead.update(matchedLead.id, {
        ...matchedLead,
        last_activity_at: receivedAt,
        notes: bookingNudgeActive
          ? buildBookingNudgeNote(matchedLead.notes || '', receivedAt, messageBody, replyTags)
          : buildLeadNote(matchedLead.notes || '', receivedAt, messageBody, replyTags),
        next_action: recommendedNextAction,
      });

      if (highIntent) {
        const adminAlert = await sendHighIntentAdminAlert(base44, matchedLead, messageBody, replyTags, receivedAt);
        adminAlertStatus = adminAlert.status;
      }
    }

    return Response.json({
      success: true,
      duplicate: false,
      log_id: record.id,
      matched: !!matchedLead,
      lead_id: matchedLead?.id || null,
      match_status: matchedLead ? 'matched' : match.matchStatus,
      match_method: match.matchMethod,
      reply_intent_tags: replyTags,
      requires_admin_attention: highIntent,
      recommended_next_action: recommendedNextAction,
      admin_alert_status: adminAlertStatus,
      booking_nudge_status: bookingNudgeStatus,
      booking_nudge_due_at: bookingNudgeDueAt,
    });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
});