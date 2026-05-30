export default function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get password from request body
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const { password } = body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  // Compare to environment variable
  const adminPassword = process.env.ADMIN_ACCESS_PASSWORD;

  if (!adminPassword) {
    return res.status(500).json({ error: 'Admin password not configured' });
  }

  if (password === adminPassword) {
    return res.status(200).json({ success: true });
  }

  // Return 401 for incorrect password
  // Never return the password or env value
  return res.status(401).json({ error: 'Invalid password' });
}
