import { requireAdmin } from './_native-auth.js';

const PLAN_PRICING = {
  Starter: { setup_fee: 1500, monthly_fee: 497 },
  Growth: { setup_fee: 3000, monthly_fee: 1500 },
  Enterprise: { setup_fee: 7500, monthly_fee: 3000 },
};

function getConfig() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server configuration missing');
  return { url, key };
}

function headers(key) {
  return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=representation' };
}

function encode(value) {
  return encodeURIComponent(String(value ?? ''));
}

async function db(table, { method = 'GET', query = '', body } = {}) {
  const { url, key } = getConfig();
  const path = query ? `${table}?${query}` : table;
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: headers(key),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.message || data?.error || response.statusText || 'Database request failed');
  return data;
}

function first(rows) {
  return Array.isArray(rows) ? rows[0] || null : rows;
}

function cleanPhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('61') && digits.length === 11) return `+${digits}`;
  if (digits.startsWith('0') && digits.length === 10) return `+61${digits.slice(1)}`;
  if (digits.startsWith('4') && digits.length === 9) return `+61${digits}`;
  if (String(value || '').trim().startsWith('+')) return `+${digits}`;
  return '';
}

function normalizePlan(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (raw.includes('enterprise')) return 'Enterprise';
  if (raw.includes('growth')) return 'Growth';
  return 'Starter';
}

async function notify(req, payload) {
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  const response = await fetch(`${protocol}://${host}/api/notifications-send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: req.headers.cookie || '' },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.details || data.error || 'Notification send failed');
  return data;
}

async function sendLeadSmsReply(req, payload) {
  const lead = first(await db('leads', { query: `id=eq.${encode(payload.leadId)}&limit=1` }));
  if (!lead) throw new Error('Lead not found');
  const phone = cleanPhone(lead.mobile_number);
  if (!phone) throw new Error('Lead does not have a valid mobile number');

  const sent = await notify(req, {
    eventType: 'manual_lead_sms_reply',
    entityName: 'Lead',
    entityId: lead.id,
    lead_id: lead.id,
    client_id: lead.client_id || null,
    channel: 'sms',
    send_sms: true,
    recipient_role: 'lead',
    recipient_phone: phone,
    recipient_email: lead.email || null,
    title: 'AssistantAI SMS reply',
    message: payload.message || '',
    metadata: { lead_id: lead.id, phone },
  });

  return {
    delivery_status: sent.providers?.sms || sent.notification?.delivery_status || 'stored',
    provider_status: sent.notification?.provider_status || sent.providers?.sms || null,
    provider_message_id: sent.notification?.provider_message_id || null,
  };
}

async function convertWonLeadToOnboarding(payload) {
  const lead = payload.data || payload.lead || {};
  if (!lead.id) throw new Error('Lead data is required');

  const currentLead = first(await db('leads', { query: `id=eq.${encode(lead.id)}&limit=1` })) || lead;
  if (currentLead.client_id) {
    const existing = first(await db('clients', { query: `id=eq.${encode(currentLead.client_id)}&limit=1` }));
    if (existing) return { client: existing, alreadyExists: true };
  }

  const plan = normalizePlan(currentLead.selected_plan || currentLead.likely_plan_fit || 'Starter');
  const pricing = PLAN_PRICING[plan] || PLAN_PRICING.Starter;
  const now = new Date().toISOString();

  const client = first(await db('clients', {
    method: 'POST',
    body: [{
      full_name: currentLead.full_name || 'Unknown client',
      business_name: currentLead.business_name || currentLead.full_name || 'New client',
      email: currentLead.email || '',
      mobile_number: currentLead.mobile_number || '',
      industry: currentLead.industry || '',
      website: currentLead.website || '',
      main_service: currentLead.service_needed || currentLead.enquiry_type || '',
      plan,
      status: 'Onboarding',
      lifecycle_state: 'pre_live',
      progress_percentage: 0,
      source_lead_id: currentLead.id,
      last_activity: 'Converted from won lead',
      next_action: 'Complete onboarding intake',
      workflow_phase: 'Onboarding',
      created_at: now,
      updated_at: now,
    }],
  }));

  await db('leads', { method: 'PATCH', query: `id=eq.${encode(currentLead.id)}`, body: { status: 'Onboarding', client_id: client.id, updated_at: now } });
  await db('billing_status', { method: 'POST', body: [{ client_id: client.id, plan, setup_fee: pricing.setup_fee, monthly_fee: pricing.monthly_fee, billing_status: 'awaiting_payment' }] }).catch(() => null);
  await db('client_notes', { method: 'POST', body: [{ client_id: client.id, note_type: 'conversion', content: `Client created from won lead on ${plan} plan.`, created_by: 'native-lead-actions' }] }).catch(() => null);

  return { client };
}

async function manualMatchUnmatchedSms(payload) {
  const log = first(await db('notification_logs', { query: `id=eq.${encode(payload.unmatchedLogId)}&limit=1` }));
  if (!log) throw new Error('SMS log not found');
  const metadata = { ...(log.metadata || {}) };

  if (payload.action === 'match') {
    const lead = first(await db('leads', { query: `id=eq.${encode(payload.leadId)}&limit=1` }));
    if (!lead) throw new Error('Lead not found');
    metadata.resolved_lead_id = lead.id;
    metadata.resolved_lead_name = lead.full_name || lead.business_name || 'Lead';
    metadata.resolved_at = new Date().toISOString();
    metadata.resolved_by = 'admin';
    const updated = first(await db('notification_logs', { method: 'PATCH', query: `id=eq.${encode(log.id)}`, body: { metadata, delivery_status: 'matched' } }));
    return { success: true, log: updated };
  }

  metadata.no_match_reviewed_at = new Date().toISOString();
  metadata.no_match_reviewed_by = 'admin';
  const updated = first(await db('notification_logs', { method: 'PATCH', query: `id=eq.${encode(log.id)}`, body: { metadata, delivery_status: 'reviewed_no_match' } }));
  return { success: true, log: updated };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    let data;
    if (body.action === 'sendLeadSmsReply') data = await sendLeadSmsReply(req, body);
    else if (body.action === 'convertWonLeadToOnboarding') data = await convertWonLeadToOnboarding(body);
    else if (body.action === 'manualMatchUnmatchedSms') data = await manualMatchUnmatchedSms(body);
    else return res.status(400).json({ success: false, error: 'Unsupported lead action' });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Native lead action failed', details: error.message });
  }
}
