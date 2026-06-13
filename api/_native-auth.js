import crypto from 'node:crypto';

const COOKIE_NAME = 'assistantai_admin_session';
const MAX_AGE_SECONDS = 60 * 60 * 12;

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_ACCESS_PASSWORD || 'assistantai-local-dev-secret';
}

function sign(value) {
  return crypto.createHmac('sha256', secret()).update(value).digest('hex');
}

export function createAdminSessionCookie() {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `admin:${expiresAt}`;
  const token = Buffer.from(`${payload}:${sign(payload)}`).toString('base64url');
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}`;
}

export function clearAdminSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

function parseCookie(header = '') {
  return Object.fromEntries(String(header || '').split(';').map((part) => {
    const [key, ...rest] = part.trim().split('=');
    return [key, rest.join('=')];
  }).filter(([key]) => key));
}

export function isAdminRequest(req) {
  const cookies = parseCookie(req.headers?.cookie || '');
  const token = cookies[COOKIE_NAME];
  if (!token) return false;

  try {
    const raw = Buffer.from(token, 'base64url').toString('utf8');
    const parts = raw.split(':');
    if (parts.length !== 3) return false;
    const [role, expiresAt, tokenSig] = parts;
    const payload = `${role}:${expiresAt}`;
    if (role !== 'admin') return false;
    if (Number(expiresAt) < Date.now()) return false;
    return crypto.timingSafeEqual(Buffer.from(tokenSig), Buffer.from(sign(payload)));
  } catch {
    return false;
  }
}

export function requireAdmin(req, res) {
  if (isAdminRequest(req)) return true;
  res.status(401).json({ success: false, error: 'Admin authentication required' });
  return false;
}
