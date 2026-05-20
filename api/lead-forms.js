function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body || '{}'); } catch (_error) { return {}; }
  }
  return req.body;
}

function keyify(value) {
  return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 80);
}

async function supabaseRequest(path, options = {}) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server configuration missing');
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

function parseFields(value) {
  if (Array.isArray(value)) return value;
  return String(value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [labelRaw, typeRaw, requiredRaw] = line.split('|').map((part) => String(part || '').trim());
      const label = labelRaw || 'Field';
      return {
        key: keyify(label),
        label,
        type: typeRaw || 'text',
        required: requiredRaw === 'required' || requiredRaw === 'true'
      };
    });
}

function mapForm(body) {
  const form_name = String(body.form_name || '').trim();
  const title = String(body.title || form_name || '').trim();
  const form_key = keyify(body.form_key || form_name);
  if (!form_name || !form_key || !title) throw new Error('form_name, form_key and title are required');
  return {
    form_name,
    form_key,
    title,
    description: body.description || '',
    submit_label: body.submit_label || 'Submit',
    success_message: body.success_message || 'Thanks. We will be in touch shortly.',
    route_to: body.route_to || 'lead_dashboard',
    notification_group: body.notification_group || 'sales',
    fields: parseFields(body.fields),
    status: body.status === 'active' ? 'active' : 'draft',
    updated_at: new Date().toISOString()
  };
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const includeDrafts = req.query?.includeDrafts === 'true';
      const key = req.query?.form_key;
      let query = '/lead_forms?select=*';
      if (key) query += `&form_key=eq.${encodeURIComponent(key)}`;
      if (!includeDrafts) query += '&status=eq.active';
      query += '&order=created_at.desc';
      const forms = await supabaseRequest(query, { method: 'GET' });
      return res.status(200).json({ success: true, forms });
    }
    if (req.method === 'POST') {
      const data = await supabaseRequest('/lead_forms', { method: 'POST', body: JSON.stringify(mapForm(parseBody(req))) });
      return res.status(200).json({ success: true, form: Array.isArray(data) ? data[0] : data });
    }
    if (req.method === 'PATCH') {
      const body = parseBody(req);
      const id = String(body.id || '').trim();
      if (!id) return res.status(400).json({ error: 'Lead form id is required' });
      const data = await supabaseRequest(`/lead_forms?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(mapForm(body)) });
      return res.status(200).json({ success: true, form: Array.isArray(data) ? data[0] : data });
    }
    if (req.method === 'DELETE') {
      const id = String(req.query?.id || '').trim();
      if (!id) return res.status(400).json({ error: 'Lead form id is required' });
      await supabaseRequest(`/lead_forms?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', prefer: 'return=minimal' });
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: 'Lead forms API failed', details: error.message });
  }
}
