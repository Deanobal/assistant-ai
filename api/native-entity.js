import { requireAdmin } from './_native-auth.js';

const TABLES = {
  Lead: 'leads',
  Client: 'clients',
  BillingStatus: 'billing_status',
  IntakeForm: 'intake_forms',
  IntegrationStatus: 'integration_status',
  ClientNote: 'client_notes',
  OnboardingTask: 'onboarding_tasks',
  NotificationLog: 'notification_logs',
  StripeEventLog: 'stripe_event_logs',
  SupportConversation: 'support_conversations',
  SupportMessage: 'support_messages',
  Campaign: 'campaigns',
};

function getConfig() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server configuration missing');
  return { url, key };
}

function headers(key, prefer = 'return=representation') {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: prefer,
  };
}

function encode(value) {
  return encodeURIComponent(String(value ?? ''));
}

function cleanRecord(record = {}) {
  const blocked = new Set(['created_date', 'updated_date']);
  return Object.fromEntries(Object.entries(record).filter(([key]) => !blocked.has(key) && !key.startsWith('_')));
}

function orderQuery(orderBy) {
  if (!orderBy) return '';
  const raw = String(orderBy);
  const desc = raw.startsWith('-');
  const field = desc ? raw.slice(1) : raw;
  const mapped = field === 'created_date' ? 'created_at' : field === 'updated_date' ? 'updated_at' : field;
  return `order=${encode(mapped)}.${desc ? 'desc' : 'asc'}`;
}

function filterQuery(filter = {}) {
  return Object.entries(filter || {})
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encode(key)}=eq.${encode(value)}`)
    .join('&');
}

async function supabase(table, { method = 'GET', query = '', body, prefer } = {}) {
  const { url, key } = getConfig();
  const path = query ? `${table}?${query}` : table;
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: headers(key, prefer),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(data?.message || data?.error || response.statusText || 'Supabase request failed');
  }
  return data;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;
  res.setHeader('Cache-Control', 'private, no-store');

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const entity = String(body.entity || '').trim();
    const action = String(body.action || '').trim();
    const table = TABLES[entity];

    if (!table) return res.status(400).json({ success: false, error: `Unsupported entity: ${entity}` });

    let result;
    if (action === 'list') {
      const parts = [orderQuery(body.orderBy)].filter(Boolean);
      if (body.limit) parts.push(`limit=${Number(body.limit)}`);
      result = await supabase(table, { query: parts.join('&') });
    } else if (action === 'filter') {
      const parts = [filterQuery(body.filter), orderQuery(body.orderBy)].filter(Boolean);
      if (body.limit) parts.push(`limit=${Number(body.limit)}`);
      result = await supabase(table, { query: parts.join('&') });
    } else if (action === 'get') {
      const rows = await supabase(table, { query: `id=eq.${encode(body.id)}&limit=1` });
      result = rows?.[0] || null;
    } else if (action === 'create') {
      const rows = await supabase(table, { method: 'POST', body: [cleanRecord(body.data || {})] });
      result = rows?.[0] || null;
    } else if (action === 'update') {
      const rows = await supabase(table, { method: 'PATCH', query: `id=eq.${encode(body.id)}`, body: { ...cleanRecord(body.data || {}), updated_at: new Date().toISOString() } });
      result = rows?.[0] || null;
    } else if (action === 'delete') {
      result = await supabase(table, { method: 'DELETE', query: `id=eq.${encode(body.id)}`, prefer: 'return=minimal' });
      result = { success: true };
    } else {
      return res.status(400).json({ success: false, error: `Unsupported action: ${action}` });
    }

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Native entity request failed', details: error.message });
  }
}
