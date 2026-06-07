import crypto from 'crypto';

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (_error) { return {}; }
  }
  return req.body;
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded) return forwarded.split(',')[0].trim();
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || '';
}

function hashIp(ip) {
  const salt = process.env.ANALYTICS_IP_HASH_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || 'assistantai';
  return crypto.createHash('sha256').update(`${salt}:${ip || 'unknown'}`).digest('hex');
}

function detectDevice(userAgent = '') {
  const ua = String(userAgent).toLowerCase();
  if (/ipad|tablet/.test(ua)) return 'tablet';
  if (/mobile|iphone|android/.test(ua)) return 'mobile';
  return 'desktop';
}

function detectBrowser(userAgent = '') {
  const ua = String(userAgent);
  if (/Edg\//.test(ua)) return 'Edge';
  if (/OPR\//.test(ua) || /Opera/.test(ua)) return 'Opera';
  if (/Chrome\//.test(ua)) return 'Chrome';
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return 'Safari';
  if (/Firefox\//.test(ua)) return 'Firefox';
  return 'Unknown';
}

function detectOs(userAgent = '') {
  const ua = String(userAgent).toLowerCase();
  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('mac os')) return 'macOS';
  if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('linux')) return 'Linux';
  return 'Unknown';
}

function safeString(value, max = 500) {
  return String(value || '').slice(0, max);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return res.status(500).json({ error: 'Analytics database configuration missing' });

    const body = parseBody(req);
    const userAgent = safeString(req.headers['user-agent'], 1000);
    const ip = getClientIp(req);
    const pagePath = safeString(body.page_path || body.path || '/', 500);
    const eventType = safeString(body.event_type || 'page_view', 80);

    const payload = {
      session_id: safeString(body.session_id, 120) || crypto.randomUUID(),
      visitor_id: safeString(body.visitor_id, 120) || null,
      event_type: eventType,
      page_path: pagePath,
      page_title: safeString(body.page_title || body.title, 300) || null,
      referrer: safeString(body.referrer, 800) || null,
      utm_source: safeString(body.utm_source, 120) || null,
      utm_medium: safeString(body.utm_medium, 120) || null,
      utm_campaign: safeString(body.utm_campaign, 160) || null,
      device_type: safeString(body.device_type || detectDevice(userAgent), 40),
      browser: safeString(body.browser || detectBrowser(userAgent), 80),
      os: safeString(body.os || detectOs(userAgent), 80),
      country: safeString(req.headers['x-vercel-ip-country'], 80) || null,
      region: safeString(req.headers['x-vercel-ip-country-region'], 120) || null,
      city: safeString(req.headers['x-vercel-ip-city'], 120) || null,
      ip_hash: hashIp(ip),
      user_agent: userAgent,
      metadata: {
        ...(body.metadata || {}),
        screen: body.screen || null,
        timezone: body.timezone || null,
        language: body.language || null,
      }
    };

    const response = await fetch(`${url}/rest/v1/site_events`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const details = await response.text();
      return res.status(500).json({ error: 'Analytics event insert failed', details });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Analytics tracking failed', details: error.message });
  }
}
