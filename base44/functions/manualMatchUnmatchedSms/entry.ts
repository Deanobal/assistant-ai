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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const payload = await req.json();
    const unmatchedLogId = String(payload?.unmatchedLogId || '').trim();
    const leadId = String(payload?.leadId || '').trim();

    if (!isValidObjectId(unmatchedLogId) || !isValidObjectId(leadId)) {
      return Response.json({ error: 'Valid unmatchedLogId and leadId are required' }, { status: 400 });
    }

    const unmatchedLog = await getNotificationLog(base44, unmatchedLogId);
    if (!unmatchedLog) {
      return Response.json({ error: 'Unmatched SMS record not found' }, { status: 404 });
    }

    if (unmatchedLog.event_type !== 'customer_sms_reply_unmatched' || unmatchedLog.channel !== 'sms' || unmatchedLog.sender_role !== 'client') {
      return Response.json({ error: 'Only unmatched inbound customer SMS records can be manually matched' }, { status: 400 });
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

    return Response.json({
      success: true,
      duplicate: false,
      unmatched_log_id: unmatchedLog.id,
      matched_log_id: matchedLog.id,
      lead_id: lead.id,
      lead_name: lead.business_name || lead.full_name || 'Lead',
    });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
});