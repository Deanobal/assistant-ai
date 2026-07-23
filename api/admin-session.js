import { isAdminRequest } from './_native-auth.js';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 'private, no-store');
  const authenticated = isAdminRequest(req);
  return res.status(authenticated ? 200 : 401).json({
    success: authenticated,
    authenticated,
  });
}
