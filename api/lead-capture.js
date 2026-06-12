function clean(value) {
  return String(value || '').trim();
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

function getSupabaseConfig() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server configuration missing');
  return { url, key };
}

async function supabaseRequest(path, options = {}) {
  const { url, key } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: options.prefer || 'return=representation',
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.message || text || response.statusText);
  return data;
}

function uniqueById(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

async function findExistingLeads(email, mobileNumber) {
  const matches = [];
  if (email) {
    const byEmail = await supabaseRequest(`/leads?email=ilike.${encodeURIComponent(email)}&order=updated_at.desc&limit=10`, { method: 'GET' });
    matches.push(...(Array.isArray(byEmail) ? byEmail : []));
  }
  if (mobileNumber) {
    const byMobile = await supabaseRequest(`/leads?mobile_number=eq.${encodeURIComponent(mobileNumber)}&order=updated_at.desc&limit=10`, { method: 'GET' });
    matches.push(...(Array.isArray(byMobile) ? byMobile : []));
  }
  return uniqueById(matches);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const form = body.form || body;
    const options = body.options || {};
    const now = new Date().toISOString();
    const sourcePage = clean(options.sourcePageOverride || form.source_page || req.headers.referer || '/');
    const email = clean(form.email).toLowerCase();
    const mobileNumber = clean(form.mobile_number);

    if (!clean(form.full_name) || (!email && !mobileNumber)) {
      return res.status(400).json({ error: 'Full name and either email or mobile number are required' });
    }

    const basePayload = {
      full_name: clean(form.full_name),
      business_name: clean(form.business_name),
      email,
      mobile_number: mobileNumber,
      industry: clean(form.industry),
      website: clean(form.website),
      enquiry_type: clean(options.enquiryTypeOverride || form.enquiry_type || 'other'),
      monthly_enquiry_volume: clean(form.monthly_enquiry_volume),
      source_page: sourcePage,
      message: clean(form.message),
      assigned_owner: clean(form.assigned_owner),
      lead_score: buildLeadScore(form.monthly_enquiry_volume),
      last_activity_at: now,
      booking_intent: Boolean(options.bookingIntent),
      booking_source: clean(options.bookingSource),
      preferred_meeting_date: clean(form.preferred_meeting_date) || null,
      preferred_meeting_time: clean(form.preferred_meeting_time),
      booking_status: options.bookingIntent ? 'requested' : null,
      service_needed: clean(form.enquiry_type || options.enquiryTypeOverride || form.message),
      lead_source: clean(form.lead_source || 'website'),
      payment_status: clean(form.payment_status || 'not_started')
    };

    const appendedNote = buildEnquiryLog({
      timestamp: now,
      sourcePage,
      enquiryType: basePayload.enquiry_type,
      bookingSource: basePayload.booking_source,
      preferredDate: basePayload.preferred_meeting_date,
      preferredTime: basePayload.preferred_meeting_time,
      message: basePayload.message,
    });

    const matches = await findExistingLeads(email, mobileNumber);
    if (matches.length > 0) {
      const existing = matches[0];
      const notes = existing.notes ? `${existing.notes}\n\n${appendedNote}` : appendedNote;
      const data = await supabaseRequest(`/leads?id=eq.${encodeURIComponent(existing.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          ...basePayload,
          created_at: existing.created_at || now,
          status: clean(options.matchedLeadStatus || existing.status || options.createStatus || 'New Lead'),
          next_action: clean(options.nextActionText || existing.next_action),
          notes,
          updated_at: now
        })
      });
      return res.status(200).json({ success: true, lead: Array.isArray(data) ? data[0] : data, action: 'updated' });
    }

    const data = await supabaseRequest('/leads', {
      method: 'POST',
      body: JSON.stringify({
        ...basePayload,
        created_at: now,
        updated_at: now,
        status: clean(options.createStatus || 'New Lead'),
        next_action: clean(options.nextActionText),
        notes: appendedNote,
      })
    });

    return res.status(200).json({ success: true, lead: Array.isArray(data) ? data[0] : data, action: 'created' });
  } catch (error) {
    return res.status(500).json({ error: 'Lead capture failed', details: error.message });
  }
}
