import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

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

  return cleaned;
}

function readSecretValue(name) {
  const raw = String(Deno.env.get(name) || '').trim();
  const prefix = `${name}=`;
  return raw.startsWith(prefix) ? raw.slice(prefix.length).trim() : raw;
}

function getErrorMessage(error) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'Unknown error';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const stamp = Date.now();
    const phone = normalizePhone(readSecretValue('ADMIN_NOTIFICATION_PHONE'));
    const twilioNumber = normalizePhone(readSecretValue('TWILIO_FROM_NUMBER'));

    if (!phone || !twilioNumber) {
      return Response.json({ error: 'Missing configured test phone numbers' }, { status: 400 });
    }

    const lead = await base44.asServiceRole.entities.Lead.create({
      created_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
      full_name: `Verified SMS Audit ${stamp}`,
      business_name: `Verified SMS Audit ${stamp}`,
      email: `verified-sms-audit-${stamp}@example.com`,
      mobile_number: phone,
      industry: 'trades',
      enquiry_type: 'strategy_call',
      monthly_enquiry_volume: '21_100',
      source_page: '/LeadDetail',
      message: 'Verified SMS reply audit lead.',
      status: 'Contacted',
      booking_intent: true,
      booking_status: 'requested',
      notes: '',
      next_action: 'Awaiting SMS reply test',
    });

    const seedLog = await base44.asServiceRole.entities.NotificationLog.create({
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
      provider_message: 'seed outbound sms for verified reply audit',
      provider_message_id: `seed-verified-${stamp}`,
      provider_status: 'queued',
      provider_error_code: null,
      provider_error_message: null,
      title: 'Seed strategy call SMS',
      message: 'Thanks for your strategy call request.',
      triggered_at: new Date().toISOString(),
      delivered_at: null,
      failed_at: null,
      actor_email: user.email || null,
      metadata: {
        sender_role: 'system',
        recipient_role: 'client',
        sender_number: twilioNumber,
        receiver_number: phone,
        sms_kind: 'customer_strategy_call_request',
      },
    });

    return Response.json({
      success: true,
      lead_id: lead.id,
      phone,
      twilio_number: twilioNumber,
      seed_log_id: seedLog.id,
      inbound_payload: {
        From: phone,
        To: twilioNumber,
        Body: 'Yes please call me this afternoon',
        MessageSid: `verified-inbound-${stamp}`,
      },
    });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
});