import crypto from 'node:crypto';

const COOKIE_NAME = 'assistantai_admin_session';
const MAX_AGE_SECONDS = 60 * 60 * 12;

function sessionSecret() {
  const value = String(process.env.ADMIN_SESSION_SECRET || '').trim();
  if (!value) throw new Error('ADMIN_SESSION_SECRET is not configured');
  return value;
}

function sign(value) {
  return crypto.createHmac('sha256', sessionSecret()).update(value).digest('hex');
}

function secureAttribute() {
  return process.env.NODE_ENV === 'production' ? '; Secure' : '';
}

export function createAdminSessionCookie() {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `admin:${expiresAt}`;
  const token = Buffer.from(`${payload}:${sign(payload)}`).toString('base64url');
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly${secureAttribute()}; SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}`;
}

export function clearAdminSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly${secureAttribute()}; SameSite=Lax; Max-Age=0`;
}

function parseCookie(header = '') {
  return Object.fromEntries(String(header || '').split(';').map((part) => {
    const [key, ...rest] = part.trim().split('=');
    return [key, rest.join('=')];
  }).filter(([key]) => key));
}

function signaturesMatch(received, expected) {
  if (!/^[a-f0-9]{64}$/i.test(received) || !/^[a-f0-9]{64}$/i.test(expected)) return false;
  const left = Buffer.from(received, 'hex');
  const right = Buffer.from(expected, 'hex');
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function isAdminRequest(req) {
  const cookies = parseCookie(req.headers?.cookie || '');
  const token = cookies[COOKIE_NAME];
  if (!token) return false;

  try {
    const raw = Buffer.from(token, 'base64url').toString('utf8');
    const parts = raw.split(':');
    if (parts.length !== 3) return false;
    const [role, expiresAtRaw, tokenSignature] = parts;
    const expiresAt = Number(expiresAtRaw);
    const payload = `${role}:${expiresAtRaw}`;

    if (role !== 'admin' || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false;
    return signaturesMatch(tokenSignature, sign(payload));
  } catch {
    return false;
  }
}

export function requireAdmin(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (isAdminRequest(req)) return true;
  res.status(401).json({ success: false, error: 'Admin authentication required' });
  return false;
}
