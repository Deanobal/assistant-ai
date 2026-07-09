import crypto from 'crypto';

function base64Url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function signJwt(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function clean(value, fallback = '') {
  return String(value || fallback).trim();
}

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body || '{}');
    } catch (_error) {
      return {};
    }
  }
  return req.body;
}

function getLiveKitUrl() {
  return process.env.LIVEKIT_URL || process.env.VITE_LIVEKIT_URL || '';
}

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const livekitUrl = getLiveKitUrl();

  if (!apiKey || !apiSecret || !livekitUrl) {
    return res.status(503).json({
      success: false,
      provider: 'livekit',
      configured: false,
      message: 'LiveKit is not configured yet. Vapi remains the live production voice provider.'
    });
  }

  const body = req.method === 'POST' ? parseBody(req) : req.query || {};
  const safeIdentity = clean(body.identity || body.visitor_id || `assistantai-web-${Date.now()}`)
    .replace(/[^a-zA-Z0-9._:-]/g, '-')
    .slice(0, 80);
  const roomName = clean(body.room || body.room_name || `assistantai-demo-${Date.now()}`)
    .replace(/[^a-zA-Z0-9._:-]/g, '-')
    .slice(0, 120);
  const name = clean(body.name || 'AssistantAI Web Visitor').slice(0, 120);
  const now = Math.floor(Date.now() / 1000);
  const ttlSeconds = Math.min(Number(body.ttl_seconds || 900), 1800);

  const payload = {
    iss: apiKey,
    sub: safeIdentity,
    name,
    nbf: now - 10,
    exp: now + ttlSeconds,
    video: {
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true
    },
    metadata: JSON.stringify({
      source: 'assistantai_public_voice_demo',
      provider: 'livekit',
      no_downtime_mode: true
    })
  };

  return res.status(200).json({
    success: true,
    provider: 'livekit',
    livekit_url: livekitUrl,
    token: signJwt(payload, apiSecret),
    room: roomName,
    identity: safeIdentity,
    expires_at: new Date((now + ttlSeconds) * 1000).toISOString(),
    next_step: 'Use this token only from the browser LiveKit test client. Vapi remains live until this path passes QA.'
  });
}
