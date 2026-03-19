import { base44 } from '@/api/base44Client';

function uniqueById(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function buildLeadScore(volume) {
  if (volume === '301_plus') return 90;
  if (volume === '101_300') return 70;
  if (volume === '21_100') return 50;
  return 25;
}

function buildEnquiryLog({ timestamp, sourcePage, enquiryType, bookingSource, preferredDate, preferredTime, message }) {
  const parts = [sourcePage, enquiryType, bookingSource].filter(Boolean);
  const timing = [preferredDate, preferredTime].filter(Boolean).join(' ');
  const header = `[${timestamp}] ${parts.join(' • ')}`;
  return `${header}${timing ? `\nPreferred meeting: ${timing}` : ''}\n${message || 'No message provided.'}`;
}

export async function submitLeadCapture(form, options = {}) {
  const now = new Date().toISOString();
  const sourcePage = window.location.pathname;
  const email = form.email?.trim();
  const mobileNumber = form.mobile_number?.trim();

  const basePayload = {
    full_name: form.full_name?.trim() || '',
    business_name: form.business_name?.trim() || '',
    email,
    mobile_number: mobileNumber || '',
    industry: form.industry || '',
    enquiry_type: form.enquiry_type || 'other',
    monthly_enquiry_volume: form.monthly_enquiry_volume || '',
    source_page: sourcePage,
    message: form.message?.trim() || '',
    assigned_owner: '',
    lead_score: buildLeadScore(form.monthly_enquiry_volume),
    last_activity_at: now,
    booking_intent: options.bookingIntent || false,
    booking_source: options.bookingSource || '',
    preferred_meeting_date: form.preferred_meeting_date || '',
    preferred_meeting_time: form.preferred_meeting_time || '',
  };

  const byEmail = email ? await base44.entities.Lead.filter({ email }, '-updated_date', 10) : [];
  const byMobile = mobileNumber ? await base44.entities.Lead.filter({ mobile_number: mobileNumber }, '-updated_date', 10) : [];
  const matches = uniqueById([...byEmail, ...byMobile]);

  if (matches.length > 0) {
    const existing = matches[0];
    const appendedNote = buildEnquiryLog({
      timestamp: now,
      sourcePage,
      enquiryType: basePayload.enquiry_type,
      bookingSource: basePayload.booking_source,
      preferredDate: basePayload.preferred_meeting_date,
      preferredTime: basePayload.preferred_meeting_time,
      message: basePayload.message,
    });

    const nextNotes = existing.notes ? `${existing.notes}\n\n${appendedNote}` : appendedNote;

    return base44.entities.Lead.update(existing.id, {
      ...existing,
      ...basePayload,
      created_at: existing.created_at || existing.created_date || now,
      status: options.matchedLeadStatus || existing.status || options.createStatus || 'New Lead',
      next_action: options.nextActionText || existing.next_action || '',
      notes: nextNotes,
    });
  }

  return base44.entities.Lead.create({
    ...basePayload,
    created_at: now,
    status: options.createStatus || 'New Lead',
    next_action: options.nextActionText || '',
    notes: buildEnquiryLog({
      timestamp: now,
      sourcePage,
      enquiryType: basePayload.enquiry_type,
      bookingSource: basePayload.booking_source,
      preferredDate: basePayload.preferred_meeting_date,
      preferredTime: basePayload.preferred_meeting_time,
      message: basePayload.message,
    }),
  });
}