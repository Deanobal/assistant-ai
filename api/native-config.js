import { requireAdmin } from './_native-auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  if (body.action !== 'getOneSignalConfig') {
    return res.status(400).json({ success: false, error: 'Unsupported config action' });
  }

  const appId = process.env.VITE_ONESIGNAL_APP_ID || process.env.ONESIGNAL_APP_ID;
  return res.status(200).json({
    success: true,
    data: appId ? {
      configured: true,
      appId,
      serviceWorkerPath: '/OneSignalSDKWorker.js',
      serviceWorkerUpdaterPath: '/OneSignalSDKUpdaterWorker.js',
      serviceWorkerScope: '/',
    } : { configured: false },
  });
}
