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

function buildLeadScore(helpType) {
  if (['enterprise_custom', 'pricing'].includes(helpType)) return 70;
  if (['missed_calls', 'ai_receptionist', 'bookings', 'crm_followup'].includes(helpType)) return 50;
  return 30;
}

function mapHelpToEnquiryType(helpType) {
  if (helpType === 'bookings') return 'booking_automation';
  if (helpType === 'crm_followup') return 'integrations';
  if (helpType === 'missed_calls' || helpType === 'ai_receptionist') return 'call_handling';
  return 'contact_request';
}

function buildEnquiryLog({ timestamp, helpType, message }) {
  return `[${timestamp}] Contact • ${helpType || 'general'}\n${message || 'No message provided.'}`;
}

async function notifyAdmin(base44, lead, payload, reqUrl) {
  try {
    const result = await base44.asServiceRole.functions.invoke('sendAdminAlert', {
      eventType: 'new_lead_created',
      entityName: 'Lead',
      entityId: lead.id,
      title: `New contact request: ${payload.business_name || payload.full_name}`,
      message: payload.message || 'New contact form enquiry received.',
      uniqueKey: `contact_request_${lead.id}_${Date.now()}`,
      priority: 'normal',
      metadata: {
        full_name: payload.full_name,
        business_name: payload.business_name,
        mobile_number: payload.mobile_number,
        enquiry_category: payload.help_type || 'general',
        message_preview: payload.message,
        admin_link: `/LeadDetail?id=${lead.id}`,
        source_page: 'Contact',
      },
    });
    return result?.data || null;
  } catch (error) {
    return { skipped: true, error: error.message };
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const now = new Date().toISOString();

    const fullName = clean(payload.full_name);
    const email = normalizeEmail(payload.email);
    const mobileNumber = normalizePhone(payload.mobile_number);
    const helpType = clean(payload.help_type || payload.enquiry_type || 'other');
    const message = clean(payload.message);

    if (!fullName) return Response.json({ error: 'Full name is required.' }, { status: 400 });
    if (!email) return Response.json({ error: 'Email is required.' }, { status: 400 });
    if (!message) return Response.json({ error: 'Message is required.' }, { status: 400 });

    const byEmail = await base44.asServiceRole.entities.Lead.filter({ email }, '-updated_date', 1);
    const existing = byEmail[0] || null;
    const appendedNote = buildEnquiryLog({ timestamp: now, helpType, message });
    const notes = existing?.notes ? `${existing.notes}\n\n${appendedNote}` : appendedNote;

    const leadPayload = {
      ...(existing || {}),
      created_at: existing?.created_at || now,
      last_activity_at: now,
      full_name: fullName,
      business_name: clean(payload.business_name),
      email,
      mobile_number: mobileNumber,
      industry: existing?.industry || 'other',
      website: existing?.website || '',
      service_needed: helpType,
      urgency: existing?.urgency || 'normal',
      enquiry_type: mapHelpToEnquiryType(helpType),
      monthly_enquiry_volume: existing?.monthly_enquiry_volume || '',
      lead_source: 'Contact form',
      source_page: 'Contact',
      message,
      status: 'New Lead',
      payment_status: existing?.payment_status || 'not_started',
      lead_score: buildLeadScore(helpType),
      assigned_owner: existing?.assigned_owner || '',
      notes,
      next_action: 'Contact this lead shortly from the Contact page enquiry.',
    };

    const lead = existing
      ? await base44.asServiceRole.entities.Lead.update(existing.id, leadPayload)
      : await base44.asServiceRole.entities.Lead.create(leadPayload);

    const notification = await notifyAdmin(base44, lead, { ...payload, full_name: fullName, email, mobile_number: mobileNumber, help_type: helpType, message }, req.url);

    return Response.json({ success: true, lead, notification });
  } catch (error) {
    return Response.json({ error: error.message || 'Unable to send your message.' }, { status: 500 });
  }
});