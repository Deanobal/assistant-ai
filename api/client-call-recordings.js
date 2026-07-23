import { requireAdmin } from './_native-auth.js';

async function supabaseRequest(url, key, table, query, options = {}) {
  const response = await fetch(`${url}/rest/v1/${table}${query ? `?${query}` : ''}`, {
    method: options.method || 'GET',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`${table} request failed: ${data?.message || text || response.statusText}`);
  }
  return Array.isArray(data) ? data : [];
}

function getConfig() {
  const url = String(process.env.VITE_SUPABASE_URL || '').trim().replace(/\/$/, '');
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !key) throw new Error('Server database configuration missing');
  return { url, key };
}

async function resolveClientForPortal(url, key, { email, client_id }) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanClientId = String(client_id || '').trim();

  if (cleanEmail) {
    const clients = await supabaseRequest(url, key, 'clients', `email=ilike.${encodeURIComponent(cleanEmail)}&limit=1`);
    if (clients[0]) return clients[0];
  }

  if (cleanClientId) {
    const clients = await supabaseRequest(url, key, 'clients', `id=eq.${encodeURIComponent(cleanClientId)}&limit=1`);
    if (clients[0]) return clients[0];
  }

  return null;
}

function normaliseCall(record) {
  const durationSeconds = Number(record.duration_seconds || 0) || 0;
  return {
    id: record.id,
    client_id: record.client_id,
    lead_id: record.lead_id || null,
    vapi_call_id: record.vapi_call_id || null,
    assistant_id: record.assistant_id || null,
    caller_name: record.caller_name || 'Unknown caller',
    caller_phone: record.phone_number || '',
    duration_seconds: durationSeconds,
    recording_url: record.recording_url || record.stereo_recording_url || null,
    stereo_recording_url: record.stereo_recording_url || null,
    transcript: record.transcript || '',
    ai_summary: record.summary || 'No summary captured yet.',
    sentiment: record.sentiment || 'neutral',
    outcome_label: record.outcome_label || record.status || 'Completed',
    enquiry_category: record.enquiry_category || null,
    follow_up_required: Boolean(record.follow_up_required),
    status: record.status || 'completed',
    timestamp: record.started_at || record.created_at,
    started_at: record.started_at || null,
    ended_at: record.ended_at || null,
    created_at: record.created_at || null,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      service: 'assistantai-client-call-recordings',
      description: 'POST email/client_id to list portal-safe call recordings for the linked client.'
    });
  }

  try {
    const { url, key } = getConfig();
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const client = await resolveClientForPortal(url, key, body);

    if (!client?.id) {
      return res.status(200).json({ success: true, linked: false, client: null, calls: [] });
    }

    const clientId = encodeURIComponent(client.id);
    const records = await supabaseRequest(
      url,
      key,
      'client_call_recordings',
      `client_id=eq.${clientId}&order=started_at.desc&order=created_at.desc&limit=100`
    );

    return res.status(200).json({
      success: true,
      linked: true,
      client: { id: client.id, business_name: client.business_name, email: client.email },
      calls: records.map(normaliseCall)
    });
  } catch (error) {
    return res.status(500).json({ error: 'Client call recordings lookup failed', details: error.message });
  }
}
