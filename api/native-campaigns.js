import { requireAdmin } from './_native-auth.js';

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

async function createCampaign(payload) {
  const now = new Date().toISOString();
  const campaign = first(await db('campaigns', {
    method: 'POST',
    body: [{
      name: payload.name,
      type: payload.type,
      template: payload.template,
      segment: payload.segment,
      subject: payload.subject,
      body: payload.body,
      cta_text: payload.ctaText || payload.cta_text || '',
      cta_url: payload.ctaUrl || payload.cta_url || '',
      scheduled_date: payload.scheduledDate || payload.scheduled_date || null,
      status: 'draft',
      total_sent: 0,
      open_rate: 0,
      click_rate: 0,
      reply_rate: 0,
      created_at: now,
      updated_at: now,
    }],
  }));
  return { campaign };
}

async function sendCampaign(payload) {
  const campaign = first(await db('campaigns', { query: `id=eq.${encode(payload.campaignId)}&limit=1` }));
  if (!campaign) throw new Error('Campaign not found');
  const updated = first(await db('campaigns', {
    method: 'PATCH',
    query: `id=eq.${encode(campaign.id)}`,
    body: {
      status: 'sent',
      total_sent: campaign.total_sent || 0,
      updated_at: new Date().toISOString(),
    },
  }));
  return { campaign: updated };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    let data;
    if (body.action === 'createCampaign') data = await createCampaign(body);
    else if (body.action === 'sendCampaign') data = await sendCampaign(body);
    else return res.status(400).json({ success: false, error: 'Unsupported campaign action' });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Native campaign action failed', details: error.message });
  }
}
