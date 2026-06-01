function clean(value) {
  const text = String(value || '').trim();
  return text || null;
}

function normalisePhone(phone) {
  return String(phone || '').replace(/\s+/g, '').trim() || null;
}

function planFromValue(value) {
  const plan = String(value || '').toLowerCase();
  if (plan.includes('enterprise')) return 'Enterprise';
  if (plan.includes('growth')) return 'Growth';
  if (plan.includes('starter')) return 'Starter';
  return 'Starter';
}

async function supabaseRequest({ url, key, path, method = 'GET', body }) {
  const response = await fetch(`${url}/rest/v1${path}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (_error) { data = text; }

  if (!response.ok) {
    throw new Error(data?.message || data?.error || text || response.statusText);
  }

  return data;
}

async function findExistingClient({ url, key, email, phone }) {
  if (email) {
    const rows = await supabaseRequest({ url, key, path: `/clients?email=eq.${encodeURIComponent(email)}&limit=1` }).catch(() => []);
    if (Array.isArray(rows) && rows[0]) return rows[0];
  }
  if (phone) {
    const rows = await supabaseRequest({ url, key, path: `/clients?mobile_number=eq.${encodeURIComponent(phone)}&limit=1` }).catch(() => []);
    if (Array.isArray(rows) && rows[0]) return rows[0];
  }
  return null;
}

async function createOrUpdateClient({ url, key, record, body }) {
  const now = new Date().toISOString();
  const fullName = clean(body.full_name || body.name || record.corrected_name || record.captured_name);
  const email = clean(body.email || record.corrected_email || record.captured_email);
  const phone = normalisePhone(body.phone || body.mobile_number || record.corrected_phone || record.caller_phone);
  const businessName = clean(body.business_name || body.company || record.corrected_business_name || record.captured_business_name || fullName || 'Secure Setup Client');
  const plan = planFromValue(body.selected_plan || body.plan || record.corrected_plan || record.captured_plan);

  const clientPayload = {
    full_name: fullName || '',
    business_name: businessName,
    email: email || '',
    mobile_number: phone || '',
    phone: phone || '',
    industry: clean(body.industry) || 'other',
    website: clean(body.website) || '',
    plan,
    source_page: 'secure_setup_form',
    status: 'Awaiting Payment',
    lifecycle_state: 'pre_live',
    workflow_phase: 'Payment',
    assigned_owner: 'Onboarding',
    progress_percentage: 0,
    next_action: 'Review secure setup submission and confirm setup payment',
    blockers: ['Unpaid billing', 'Missing integrations'],
    go_live_ready: false,
    onboarding_archived: false,
    last_activity: 'Client created from secure setup form',
    created_at: now,
    updated_at: now,
    created_date: now,
    updated_date: now
  };

  const existing = await findExistingClient({ url, key, email, phone });
  if (existing?.id) {
    const updatedRows = await supabaseRequest({
      url,
      key,
      path: `/clients?id=eq.${encodeURIComponent(existing.id)}`,
      method: 'PATCH',
      body: {
        ...clientPayload,
        created_at: existing.created_at || clientPayload.created_at,
        created_date: existing.created_date || clientPayload.created_date,
        last_activity: 'Client updated from secure setup form',
      }
    });
    return Array.isArray(updatedRows) ? updatedRows[0] : updatedRows;
  }

  const createdRows = await supabaseRequest({ url, key, path: '/clients', method: 'POST', body: clientPayload });
  return Array.isArray(createdRows) ? createdRows[0] : createdRows;
}

async function optionalInsert({ url, key, path, body }) {
  try {
    return await supabaseRequest({ url, key, path, method: 'POST', body });
  } catch (error) {
    return { skipped: true, error: error.message };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const url = String(process.env.VITE_SUPABASE_URL || '').trim().replace(/\/$/, '');
    const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

    if (!url || !key) {
      return res.status(500).json({ error: 'Server database configuration missing' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const token = clean(body.token);

    if (!token) {
      return res.status(400).json({ error: 'Secure setup token is required' });
    }

    const updatePayload = {
      status: 'submitted',
      corrected_name: clean(body.full_name || body.name),
      corrected_email: clean(body.email),
      corrected_phone: normalisePhone(body.phone || body.mobile_number),
      corrected_business_name: clean(body.business_name || body.company),
      corrected_plan: clean(body.selected_plan || body.plan),
      corrected_notes: clean(body.notes || body.additional_notes),
      submitted_payload: body,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const data = await supabaseRequest({
      url,
      key,
      path: `/secure_setup_requests?token=eq.${encodeURIComponent(token)}&status=neq.submitted`,
      method: 'PATCH',
      body: updatePayload
    });

    const record = Array.isArray(data) ? data[0] : data;

    if (!record) {
      return res.status(404).json({ error: 'Secure setup link is invalid, expired, or already submitted' });
    }

    let client = null;
    let intakeResult = null;
    try {
      client = await createOrUpdateClient({ url, key, record, body });
      if (client?.id) {
        intakeResult = await optionalInsert({
          url,
          key,
          path: '/intake_forms',
          body: {
            client_id: client.id,
            contact_name: client.full_name || '',
            business_name: client.business_name || '',
            email: client.email || '',
            phone: client.phone || client.mobile_number || '',
            mobile_number: client.mobile_number || client.phone || '',
            website: client.website || '',
            industry: client.industry || 'other',
            approval_status: 'draft',
            business_description: clean(body.notes || record.corrected_notes || record.captured_notes) || '',
            services_offered: '',
            service_areas: '',
            business_hours: '',
            emergency_rules: '',
            faq_list: '',
            pricing_guidance: '',
            escalation_contact: client.mobile_number || client.phone || client.email || '',
            is_archived: false,
            last_updated: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        });
      }
    } catch (clientError) {
      return res.status(200).json({ success: true, record, onboarding_created: false, onboarding_error: clientError.message });
    }

    return res.status(200).json({
      success: true,
      record,
      onboarding_created: Boolean(client?.id),
      client_id: client?.id || null,
      client,
      intake_warning: intakeResult?.skipped ? intakeResult.error : null
    });
  } catch (error) {
    return res.status(500).json({ error: 'Secure setup submission failed', details: error.message });
  }
}
