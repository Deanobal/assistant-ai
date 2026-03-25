import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const stamp = String(Date.now());
    const now = new Date().toISOString();
    const phone = '+61420222793';
    const lead = await base44.asServiceRole.entities.Lead.create({
      created_at: now,
      last_activity_at: now,
      full_name: `Inbound SMS Audit ${stamp}`,
      business_name: `Inbound SMS Audit ${stamp}`,
      email: `inbound-sms-audit-${stamp}@example.com`,
      mobile_number: phone,
      industry: 'trades',
      enquiry_type: 'strategy_call',
      monthly_enquiry_volume: '21_100',
      source_page: '/BookStrategyCall',
      message: 'Inbound SMS audit lead.',
      status: 'New Lead',
      booking_intent: true,
      booking_source: 'inbound_sms_audit',
    });

    await base44.asServiceRole.entities.NotificationLog.create({
      event_type: 'strategy_call_requested',
      entity_name: 'Lead',
      entity_id: lead.id,
      client_account_id: null,
      sender_role: 'system',
      recipient_role: 'client',
      match_status: 'matched',
      recipient_email: phone,
      channel: 'sms',
      delivery_status: 'queued',
      provider_name: 'Twilio',
      provider_message: 'Seed outbound SMS for inbound audit.',
      provider_message_id: `seed-outbound-${stamp}`,
      provider_status: 'queued',
      provider_error_code: null,
      provider_error_message: null,
      title: 'Strategy call request acknowledgement',
      message: 'Thanks for your strategy call request.',
      triggered_at: now,
      delivered_at: null,
      failed_at: null,
      actor_email: user.email,
      metadata: {
        sms_kind: 'customer_strategy_call_request',
        unique_key: `seed:${stamp}`,
      },
    });

    const matchedResponse = await base44.asServiceRole.functions.invoke('twilioInboundSms', {
      From: phone,
      To: '+12603059865',
      Body: 'YES call me tomorrow at 3pm',
      MessageSid: `audit-match-${stamp}`,
    });

    const unmatchedResponse = await base44.asServiceRole.functions.invoke('twilioInboundSms', {
      From: '+61411111111',
      To: '+12603059865',
      Body: 'Can you call me?',
      MessageSid: `audit-unmatched-${stamp}`,
    });

    const leadTrail = await base44.asServiceRole.entities.NotificationLog.filter({
      entity_id: lead.id,
      channel: 'sms',
    }, '-created_date', 20);

    const unmatchedTrail = await base44.asServiceRole.entities.NotificationLog.filter({
      provider_message_id: `audit-unmatched-${stamp}`,
      channel: 'sms',
    }, '-created_date', 5);

    const refreshedLead = await base44.asServiceRole.entities.Lead.filter({ id: lead.id }, '-updated_date', 1);

    return Response.json({
      success: true,
      lead_id: lead.id,
      matched_reply: matchedResponse.data,
      unmatched_reply: unmatchedResponse.data,
      lead_sms_trail: leadTrail.map((log) => ({
        id: log.id,
        event_type: log.event_type,
        sender_role: log.sender_role || null,
        recipient_role: log.recipient_role,
        match_status: log.match_status || null,
        message: log.message,
        provider_message_id: log.provider_message_id,
      })),
      unmatched_sms_trail: unmatchedTrail.map((log) => ({
        id: log.id,
        event_type: log.event_type,
        match_status: log.match_status || null,
        message: log.message,
        provider_message_id: log.provider_message_id,
      })),
      lead_next_action: refreshedLead[0]?.next_action || null,
      lead_notes: refreshedLead[0]?.notes || null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});