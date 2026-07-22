import crypto from 'node:crypto';

const COOKIE_NAME = 'assistantai_admin_session';
const MAX_AGE_SECONDS = 60 * 60 * 12;

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_ACCESS_PASSWORD;
  if (value) return value;
  if (process.env.NODE_ENV !== 'production') return 'assistantai-local-dev-secret';
  throw new Error('Admin session secret is not configured');
}

function sign(value) {
  return crypto.createHmac('sha256', secret()).update(value).