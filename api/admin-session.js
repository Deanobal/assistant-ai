import { isAdminRequest } from './_native-auth.js';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 'private, no-store');
  return res.status(isAdminRequest(req) ? 200 : 401).json({
    success: isAdminRequest(req),
    authenticated: isAdminRequest(req),
  });
}
