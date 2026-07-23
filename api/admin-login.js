import crypto from 'node:crypto';
import { createAdminSessionCookie } from './_native-auth.js';

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ''));
  const b = Buffer.from(String(right || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }
  const password = String(body.password || '');
  const adminPassword = process.env.ADMIN_ACCESS_PASSWORD;

  if (!password) return res.status(400).json({ error: 'Password is required' });
  if (!adminPassword) return res.status(500).json({ error: 'Admin password not configured' });
  if (!safeEqual(password, adminPassword)) return res.status(401).json({ error: 'Invalid password' });

  try {
    res.setHeader('Set-Cookie', createAdminSessionCookie());
    res.setHeader('Cache-Control', 'private, no-store');
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Admin session configuration error:', error.message);
    return res.status(503).json({ error: 'Admin session is not configured' });
  }
}
