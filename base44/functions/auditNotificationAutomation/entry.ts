import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function summarizeLogs(logs) {
  return logs.map((log) => ({
    id: log.id,
    event_type: log.event_type,
    channel: log.channel,
    recipient_role: log.recipient_role,
    recipient: log.recipient_email,
    delivery_status: log.delivery_status,
    provider_name: log.provider_name,
    unique_key: log.metadata?.unique_key || null,
    sms_from_number_used: log.metadata?.sms_from_number_used || null,
    sms_config_source: log.metadata?.sms_config_source || null,
    email_from_address: log.metadata?.email_from_address || null,
  }));
}

function buildCounts(logs) {
  const counts = {};

  for (const log of logs) {
    const key = `${log.event_type}:${log.channel}:${log.delivery_status}`;
    counts[key] = (counts[key] || 0) + 1;
  }

  return counts;
}

async function waitForLogCount(base44, entityId, minimumCount) {
  for (let index = 0; index < 8; index += 1) {
    const logs = await base44.asServiceRole.entities.NotificationLog.filter({ entity_id: entityId }, '-created_date', 50);

    if (logs.length >= minimumCount) {
      return logs;
    }

    await sleep(1000);
  }

  return base44.asServiceRole.entities.NotificationLog.filter({ entity_id: entityId }, '-created_date', 50);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const now = new Date();
    const stamp = String(now.getTime());
    const lead = await base44.asServiceRole.entities.Lead.create({
      created_at: now.toISOString(),
      last_activity_at: now.toISOString(),
      full_name: `Notification Audit ${stamp}`,
      business_name: `Audit Business ${stamp}`,
      email: `notification-audit-${stamp}@example.com`,
      mobile_number: '+61420222793',
      industry: 'trades',
      enquiry_type: 'strategy_call',
      monthly_enquiry_volume: '21_100',
      source_page: '/BookStrategyCall',
      message: 'Automation audit trigger.',
      status: 'New Lead',
      booking_intent: true,
      booking_source: 'automation_audit',
    });

    await sleep(3000);
    const createLogs = await waitForLogCount(base44, lead.id, 3);

    const confirmedAt = new Date(Date.now() + 60000);
    const confirmedDate = confirmedAt.toISOString().slice(0, 10);
    const confirmedTime = confirmedAt.toISOString().slice(11, 16);

    await base44.asServiceRole.entities.Lead.update(lead.id, {
      ...lead,
      last_activity_at: new Date().toISOString(),
      status: 'Strategy Call Booked',
      booking_status: 'confirmed',
      booking_provider: 'googlecalendar',
      booking_reference: `audit-booking-${stamp}`,
      confirmed_meeting_date: confirmedDate,
      confirmed_meeting_time: confirmedTime,
    });

    const finalLogs = await waitForLogCount(base44, lead.id, createLogs.length + 4);

    return Response.json({
      success: true,
      lead_id: lead.id,
      create_stage_log_count: createLogs.length,
      final_log_count: finalLogs.length,
      create_stage_counts: buildCounts(createLogs),
      final_counts: buildCounts(finalLogs),
      create_stage_logs: summarizeLogs(createLogs),
      final_logs: summarizeLogs(finalLogs),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});