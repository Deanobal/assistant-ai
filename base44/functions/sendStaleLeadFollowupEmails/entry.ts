import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const FOLLOWUP_MARKER = '[Automated 24h follow-up email sent]';

function readSecretValue(name) {
  const raw = String(Deno.env.get(name) || '').trim();
  const prefix = `${name}=`;
  return raw.startsWith(prefix) ? raw.slice(prefix.length).trim() : raw;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function buildEmail(lead) {
  const name = lead.full_name || 'there';
  return {
    subject: 'Following up on your AssistantAI enquiry',
    text: `Hi ${name},\n\nJust following up on your enquiry with AssistantAI. If you still need help capturing missed calls, booking more jobs, or setting up AI follow-up, reply to this email and our team will help with the next step.\n\nThanks,\nAssistantAI`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;"><p>Hi ${name},</p><p>Just following up on your enquiry with AssistantAI.</p><p>If you still need help capturing missed calls, booking more jobs, or setting up AI follow-up, reply to this email and our team will help with the next step.</p><p>Thanks,<br/>AssistantAI</p></div>`,
  };
}

async function sendEmail(to, email) {
  const apiKey = readSecretValue('RESEND_API_KEY');
  const fromEmail = readSecretValue('RESEND_FROM_EMAIL');

  if (!apiKey || !fromEmail || !isValidEmail(to)) {
    return { sent: false, status: 'not_configured' };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: fromEmail, to: [to], subject: email.subject, text: email.text, html: email.html }),
  });

  return { sent: response.ok, status: response.ok ? 'sent' : 'failed' };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req).asServiceRole;
    const leads = await base44.entities.Lead.filter({ status: 'New Lead' }, '-created_date', 200);
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const results = [];

    for (const lead of leads) {
      const createdAt = new Date(lead.created_at || lead.created_date || lead.updated_date || Date.now()).getTime();
      const notes = String(lead.notes || '');

      if (createdAt > cutoff || notes.includes(FOLLOWUP_MARKER)) {
        continue;
      }

      const emailResult = await sendEmail(lead.email, buildEmail(lead));
      if (emailResult.sent) {
        const timestamp = new Date().toISOString();
        await base44.entities.Lead.update(lead.id, {
          ...lead,
          notes: `${notes}${notes ? '\n\n' : ''}${FOLLOWUP_MARKER} ${timestamp}`,
          last_activity_at: timestamp,
        });
      }

      results.push({ lead_id: lead.id, email: lead.email || null, status: emailResult.status });
    }

    return Response.json({ checked: leads.length, processed: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});