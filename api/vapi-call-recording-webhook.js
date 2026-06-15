function getConfig() {
  const url = String(process.env.VITE_SUPABASE_URL || '').trim().replace(/\/$/, '');
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !key) throw new Error('Server database configuration missing');
  return { url, key };
}

function getHeader(req, name) {
  const target = String(name || '').toLowerCase();
  const headers = req.headers || {};
  return String(headers[target] || headers[name] || '').trim();
}

function getBearerToken(req) {
  const authorization = getHeader(req, 'authorization');
  if (!authorization) return '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return String(match ? match[1] : authorization).trim();
}

function getExpectedSecret() {
  return String(process.env.VAPI_WEBHOOK_SECRET || process.env.VAPI_CALL_WEBHOOK_SECRET || '').trim();
}

function isAuthorised(req) {
  const expected = getExpectedSecret();
  if (!expected) return true;
  const candidates = [
    getHeader(req, 'x-webhook-secret'),
    getHeader(req, 'x-vapi-webhook-secret'),
    getHeader(req, 'x-vapi-secret'),
    getHeader(req, 'x-assistantai-webhook-secret'),
    getBearerToken(req),
  ].filter(Boolean);
  return candidates.some((candidate) => candidate === expected);
}

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

function firstValue(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== '') return value;
  }
  return null;
}

function normalisePhone(phone) {
  return String(phone || '').replace(/[\s()\-.]/g, '').trim();
}

function secondsBetween(start, end) {
  if (!start || !end) return null;
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) return null;
  return Math.round((endMs - startMs) / 1000);
}

function getNestedMetadata(body, message, call) {
  return {
    ...(body.metadata || {}),
    ...(body.customer?.metadata || {}),
    ...(message.metadata || {}),
    ...(message.customer?.metadata || {}),
    ...(call?.metadata || {}),
    ...(call?.customer?.metadata || {}),
  };
}

async function resolveClient(url, key, payload) {
  const explicitClientId = String(payload.client_id || '').trim();
  if (explicitClientId) {
    const clients = await supabaseRequest(url, key, 'clients', `id=eq.${encodeURIComponent(explicitClientId)}&limit=1`);
    if (clients[0]) return clients[0];
  }

  const email = String(payload.email || '').trim().toLowerCase();
  if (email) {
    const clients = await supabaseRequest(url, key, 'clients', `email=ilike.${encodeURIComponent(email)}&limit=1`);
    if (clients[0]) return clients[0];
  }

  const phone = normalisePhone(payload.phone);
  if (phone) {
    try {
      const clientsByPhone = await supabaseRequest(url, key, 'clients', `phone=eq.${encodeURIComponent(phone)}&limit=1`);
      if (clientsByPhone[0]) return clientsByPhone[0];
    } catch (_error) {
      // Some older schemas may not have phone indexed/aligned yet.
    }

    try {
      const clientsByMobile = await supabaseRequest(url, key, 'clients', `mobile_number=eq.${encodeURIComponent(phone)}&limit=1`);
      if (clientsByMobile[0]) return clientsByMobile[0];
    } catch (_error) {
      // Some older schemas may not have mobile_number.
    }
  }

  return null;
}

function extractCallPayload(body) {
  const message = body.message || body;
  const call = message.call || body.call || {};
  const artifact = message.artifact || body.artifact || call.artifact || {};
  const analysis = message.analysis || body.analysis || call.analysis || {};
  const customer = message.customer || body.customer || call.customer || {};
  const metadata = getNestedMetadata(body, message, call);

  const startedAt = firstValue(call.startedAt, call.started_at, message.startedAt, body.startedAt, body.started_at, call.createdAt, body.createdAt);
  const endedAt = firstValue(call.endedAt, call.ended_at, message.endedAt, body.endedAt, body.ended_at);
  const duration = firstValue(
    call.durationSeconds,
    call.duration_seconds,
    message.durationSeconds,
    body.durationSeconds,
    body.duration_seconds,
    secondsBetween(startedAt, endedAt)
  );

  return {
    client_id: firstValue(metadata.client_id, metadata.clientId, body.client_id, body.clientId),
    lead_id: firstValue(metadata.lead_id, metadata.leadId, body.lead_id, body.leadId),
    email: firstValue(metadata.email, customer.email, body.email, message.email),
    phone: firstValue(metadata.phone, metadata.mobile_number, customer.number, customer.phoneNumber, call.customer?.number, body.phone, body.caller_phone),
    caller_name: firstValue(metadata.full_name, metadata.name, customer.name, body.full_name, body.name),
    vapi_call_id: firstValue(call.id, message.callId, message.call_id, body.callId, body.call_id, body.id),
    assistant_id: firstValue(call.assistantId, call.assistant_id, message.assistantId, body.assistantId, body.assistant_id),
    started_at: startedAt || null,
    ended_at: endedAt || null,
    duration_seconds: duration ? Number(duration) : null,
    recording_url: firstValue(
      artifact.recordingUrl,
      artifact.recording_url,
      artifact.monoRecordingUrl,
      artifact.mono_recording_url,
      message.recordingUrl,
      body.recordingUrl,
      body.recording_url,
      call.recordingUrl
    ),
    stereo_recording_url: firstValue(
      artifact.stereoRecordingUrl,
      artifact.stereo_recording_url,
      body.stereoRecordingUrl,
      body.stereo_recording_url
    ),
    transcript: firstValue(artifact.transcript, message.transcript, body.transcript, analysis.transcript),
    summary: firstValue(analysis.summary, analysis.callSummary, analysis.call_summary, message.summary, body.summary),
    sentiment: String(firstValue(analysis.sentiment, body.sentiment, 'neutral')).toLowerCase(),
    outcome_label: firstValue(analysis.outcome, analysis.successEvaluation, analysis.success_evaluation, body.outcome_label, body.status, 'Completed'),
    enquiry_category: firstValue(analysis.enquiry_category, analysis.category, metadata.enquiry_category, body.enquiry_category),
    follow_up_required: Boolean(firstValue(analysis.follow_up_required, analysis.followUpRequired, body.follow_up_required, false)),
    status: firstValue(body.status, message.type, 'completed'),
    raw_payload: body,
  };
}

async function upsertCallRecording(url, key, record) {
  const response = await fetch(`${url}/rest/v1/client_call_recordings`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation'
    },
    body: JSON.stringify(record)
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`client_call_recordings upsert failed: ${data?.message || text || response.statusText}`);
  }
  return Array.isArray(data) ? data[0] : data;
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      service: 'assistantai-vapi-call-recording-webhook',
      secured: Boolean(getExpectedSecret()),
      accepted_auth_headers: [
        'x-webhook-secret',
        'x-vapi-webhook-secret',
        'x-vapi-secret',
        'x-assistantai-webhook-secret',
        'Authorization: Bearer <secret>'
      ]
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isAuthorised(req)) {
    return res.status(401).json({ success: false, error: 'Unauthorized Vapi call recording webhook' });
  }

  try {
    const { url, key } = getConfig();
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const extracted = extractCallPayload(body);
    const client = await resolveClient(url, key, extracted);

    if (!client?.id) {
      return res.status(202).json({
        success: true,
        stored: false,
        status: 'unmatched_client',
        message: 'Vapi call received but no matching client was found. Send client_id in Vapi metadata for reliable portal linking.',
        vapi_call_id: extracted.vapi_call_id || null
      });
    }

    const record = {
      client_id: client.id,
      lead_id: extracted.lead_id || null,
      vapi_call_id: extracted.vapi_call_id || `vapi-${Date.now()}`,
      assistant_id: extracted.assistant_id || null,
      phone_number: normalisePhone(extracted.phone),
      caller_name: extracted.caller_name || null,
      started_at: extracted.started_at || null,
      ended_at: extracted.ended_at || null,
      duration_seconds: extracted.duration_seconds || null,
      recording_url: extracted.recording_url || extracted.stereo_recording_url || null,
      stereo_recording_url: extracted.stereo_recording_url || null,
      transcript: extracted.transcript || null,
      summary: extracted.summary || null,
      sentiment: extracted.sentiment || 'neutral',
      outcome_label: extracted.outcome_label || 'Completed',
      enquiry_category: extracted.enquiry_category || null,
      follow_up_required: Boolean(extracted.follow_up_required),
      status: extracted.status || 'completed',
      raw_payload: extracted.raw_payload || body,
      updated_at: new Date().toISOString(),
    };

    const stored = await upsertCallRecording(url, key, record);

    return res.status(200).json({
      success: true,
      stored: true,
      client_id: client.id,
      business_name: client.business_name || null,
      call_recording_id: stored?.id || null,
      vapi_call_id: record.vapi_call_id,
      recording_url_present: Boolean(record.recording_url)
    });
  } catch (error) {
    return res.status(500).json({ error: 'Vapi call recording webhook failed', details: error.message });
  }
}
