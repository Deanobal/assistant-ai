function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body || '{}'); } catch (_error) { return {}; }
  }
  return req.body;
}

function getSupabaseConfig() {
  const rawUrl = process.env.VITE_SUPABASE_URL;
  const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = String(rawUrl || '').trim().replace(/\/$/, '');
  const key = String(rawKey || '').trim();
  if (!url || !key) throw new Error('Supabase server configuration missing');
  let parsed;
  try {
    parsed = new URL(url);
  } catch