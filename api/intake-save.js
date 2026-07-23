import { requireAdmin } from './_native-auth.js';

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  return req.body;
}

function getConfig() {
  const url = String(process.env.VITE_SUPABASE_URL || '').trim().replace(/\/$/, '');
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !key) throw new Error('Supabase configuration missing');
  return { url, key };
}

function clean(record) {
  return Object.fromEntries(Object.entries(record || {}).filter(([, value]) => value !== undefined));
}

async function supabase(path, method, body) {
  const { url, key } = getConfig();
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
  if (!response.ok) throw new Error(data?.message || data?.error || text || response.statusText);
  return Array.isArray(data) ? data[0] || data : data;
}

function clientPatch(client) {
  const now = new Date().toISOString();
  return clean({
    full_name: client.full_name,
    business_name: client.business_name,
    email: client.email,
    mobile_number: client.mobile_number || client.phone,
    phone: client.phone || client.mobile_number,
    industry: client.industry,
    website: client.website,
    main_service: client.main_service,
    monthly_enquiry_volume: client.monthly_enquiry_volume,
    biggest_problem: client.biggest_problem,
    current_missed_call_handling: client.current_missed_call_handling,
    ai_first_goal: client.ai_first_goal,
    plan: client.plan,
    status: client.status,
    lifecycle_state: client.lifecycle_state,
    assigned_owner: client.assigned_owner,
    progress_percentage: client.progress_percentage,
    next_action: client.next_action,
    workflow_phase: client.workflow_phase,
    blockers: client.blockers,
    go_live_ready: client.go_live_ready,
    onboarding_archived: client.onboarding_archived,
    last_activity: client.last_activity || 'Intake updated',
    updated_at: now,
    updated_date: now
  });
}

function intakePatch(intake, clientId) {
  const now = new Date().toISOString();
  const payload = { ...intake };
  delete payload.id;
  delete payload._temporary;
  return clean({
    ...payload,
    client_id: clientId,
    phone: intake.phone || intake.mobile_number,
    mobile_number: intake.mobile_number || intake.phone,
    approval_status: intake.approval_status || 'draft',
    is_archived: Boolean(intake.is_archived),
    last_updated: now,
    updated_at: now
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;

  try {
    const body = parseBody(req);
    const clientId = String(body.client_id || body.clientId || '').trim();
    if (!clientId) return res.status(400).json({ error: 'client_id is required' });

    const client = body.client || {};
    const intake = body.intake || {};

    const savedClient = await supabase(`/clients?id=eq.${encodeURIComponent(clientId)}`, 'PATCH', clientPatch(client));
    const existingIntake = await supabase(`/intake_forms?client_id=eq.${encodeURIComponent(clientId)}&limit=1`, 'GET').catch(() => null);

    let savedIntake;
    if (existingIntake?.id) {
      savedIntake = await supabase(`/intake_forms?id=eq.${encodeURIComponent(existingIntake.id)}`, 'PATCH', intakePatch(intake, clientId));
    } else {
      savedIntake = await supabase('/intake_forms', 'POST', intakePatch(intake, clientId));
    }

    return res.status(200).json({ success: true, client: savedClient, intake: savedIntake });
  } catch (error) {
    return res.status(500).json({ error: 'Intake save failed', details: error.message });
  }
}
