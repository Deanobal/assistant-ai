import { clearAdminSessionCookie } from './_native-auth.js';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  res.setHeader('Set-Cookie', clearAdminSessionCookie());
  res.setHeader('Cache-Control', 'private, no-store');
  return res.status(200).json({ success: true });
}
