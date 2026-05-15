import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function clean(value) {
  return String(value || '').trim();
}

function normalizeEmail(value) {
  return clean(value).toLowerCase();
}

function normalizePhone(value) {
  return clean(value).replace(/\s+/g, '');
}

function readSecretValue(name) {
  const raw = clean(Deno.env.get(name));
  const prefix = `${name}=`;
  return raw.startsWith(prefix) ? raw.slice(prefix.length).trim() : raw;
}

function getErrorMessage(error) {
  if (error && typeof error === 'object' && 'message' in error) return String(error.message);
  return 'Unknown error';
}

function buildLeadUrl(leadId) {
  const appId = clean(Deno.env.get('BASE44_APP_ID'));
  if (!appId || !leadId) return '';
  return `https://app.base44.com/apps/${appId}/LeadDetail?id=${leadId}`;
}

function buildEmailBody(lead, leadUrl) {
  const businessName = clean(lead.business_name) || clean(lead.full_name) || 'Unknown business';
  const serviceNeeded = clean(lead.service_needed) || clean(lead.message) || 'Not provided';
  const summary = clean(lead.conversation_summary) || 'No conversation summary provided.';
  const plan = clean(lead.selected_plan) || clean(lead.likely_plan_fit) || 'Not selected';

  const text = [
    `Ready to proceed lead: ${businessName}`,
    `Service requirements: ${serviceNeeded}`,
    `Plan fit: ${plan}`,
    `Contact: ${clean(lead.full_name) || 'Unknown'} · ${normalizeEmail(lead.email) || 'No email'} · ${normalizePhone(lead.mobile_number) || 'No phone'}`,
    `Summary: ${summary}`,
    leadUrl ? `Open lead: ${leadUrl}` : null,
  ].filter(Boolean).join('\n');

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a;">
      <h2 style="margin:0 0 12px;font-size:22px;">Ready to proceed lead</h2>
      <div style="border:1px solid #e2e8f0;border-radius:16px;padding:16px;background:#f8fafc;">
        <p style="margin:0 0 8px;"><strong>Business:</strong> ${businessName}</p>
        <p style="margin:0 0 8px;"><strong>Service requirements:</strong> ${serviceNeeded}</p>
        <p style="margin:0 0 8px;"><strong>Plan fit:</strong> ${plan}</p>
        <p style="margin:0 0 8px;"><strong>Contact:</strong> ${clean(lead.full_name) || 'Unknown'} · ${normalizeEmail(lead.email) || 'No email'} · ${normalizePhone(lead.mobile_number) || 'No phone'}</p>
        <p style="margin:0;"><strong>Summary:</strong> ${summary}</p>
      </div>
      ${leadUrl ? `<p style="margin-top:16px;"><a href="${leadUrl}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:12px;font-weight:700;">Open Lead</a></p>` : ''}
    </div>`;

  return { text, html };
}

function buildSmsMessage(lead, leadUrl) {
  const businessName = clean(lead.business_name) || clean(lead.full_name) || 'Unknown business';
  const serviceNeeded = clean(lead.service_needed) || clean(lead.message) || 'Not provided';
  const plan = clean(lead.selected_plan) || clean(lead.likely_plan_fit) || 'Not selected';
  return [`Ready lead: ${businessName}`, `Needs: ${serviceNeeded}`, `Plan: ${plan}`, leadUrl].filter(Boolean).join('\n').slice(0, 480);
}

async function sendEmail(subject, body) {
  const apiKey = readSecretValue('RESEND_API_KEY');
  const fromEmail = readSecretValue('RESEND_FROM_EMAIL');
  const to = normalizeEmail(Deno.env.get('ADMIN_NOTIFICATION_EMAIL'));
  if (!apiKey || !fromEmail || !to) return { status: 'not_configured', error: 'Email notification settings are missing.' };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: fromEmail, to: [to], subject, text: body.text, html: body.html }),
  });
  const text = await response.text();
  let parsed = null;
  try { parsed = JSON.parse(text); } catch { parsed = null; }
  if (!response.ok) return { status: 'failed', error: parsed?.message || parsed?.error || text, providerMessageId: parsed?.id || null, recipient: to };
  return { status: 'provider_accepted', providerMessageId: parsed?.id || null, recipient: to };
}

async function sendSms(message) {
  const accountSid = readSecretValue('TWILIO_ACCOUNT_SID');
  const authToken = readSecretValue('TWILIO_AUTH_TOKEN');
  const from = normalizePhone(readSecretValue('TWILIO_FROM_NUMBER'));
  const to = normalizePhone(Deno.env.get('ADMIN_NOTIFICATION_PHONE'));
  if (!accountSid || !authToken || !from || !to) return { status: 'not_configured', error: 'SMS notification settings are missing.' };

  const body = new URLSearchParams({ From: from, To: to, Body: message });
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: { Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const text = await response.text();
  let parsed = null;
  try { parsed = JSON.parse(text); } catch { parsed = null; }
  if (!response.ok) return { status: 'failed', error: parsed?.message || text, providerMessageId: parsed?.sid || null, recipient: to };
  return { status: parsed?.status || 'queued', providerMessageId: parsed?.sid || null, recipient: to };
}

async function logNotification(base44, lead, channel, result, title, message) {
  await base44.asServiceRole.entities.NotificationLog.create({
    event_type: 'new_lead_created',
    entity_name: 'Lead',
    entity_id: lead.id,
    client_account_id: lead.client_account_id || null,
    recipient_role: 'admin',
    recipient_email: result.recipient || null,
    channel,
    delivery_status: result.status === 'provider_accepted' ? 'provider_accepted' : result.status === 'queued' ? 'queued' : result.status,
    provider_name: channel === 'email' ? 'Resend' : 'Twilio',
    provider_message_id: result.providerMessageId || null,
    provider_error_message: result.error || null,
    title,
    message,
    triggered_at: new Date().toISOString(),
    metadata: {
      alert_type: 'qualified_lead_ready_to_proceed',
      business_name: lead.business_name || '',
      service_needed: lead.service_needed || '',
      buyer_intent: lead.buyer_intent || '',
      selected_plan: lead.selected_plan || lead.likely_plan_fit || '',
    },
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const lead = payload?.data;
    const oldLead = payload?.old_data;
    const eventType = payload?.event?.type;

    if (!lead?.id) return Response.json({ success: true, ignored: true, reason: 'Missing lead payload' });
    if (lead.buyer_intent !== 'ready_to_proceed') return Response.json({ success: true, ignored: true, reason: 'Lead is not ready to proceed' });
    if (eventType === 'update' && oldLead?.buyer_intent === 'ready_to_proceed') return Response.json({ success: true, ignored: true, reason: 'Lead was already ready to proceed' });

    const businessName = clean(lead.business_name) || clean(lead.full_name) || 'Unknown business';
    const serviceNeeded = clean(lead.service_needed) || clean(lead.message) || 'Not provided';
    const leadUrl = buildLeadUrl(lead.id);
    const title = `Ready to proceed lead: ${businessName}`;
    const message = `${businessName} is ready to proceed. Service requirements: ${serviceNeeded}`;

    const emailResult = await sendEmail(title, buildEmailBody(lead, leadUrl));
    const smsResult = await sendSms(buildSmsMessage(lead, leadUrl));

    await logNotification(base44, lead, 'email', emailResult, title, message);
    await logNotification(base44, lead, 'sms', smsResult, title, message);

    return Response.json({ success: true, email: emailResult.status, sms: smsResult.status });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
});