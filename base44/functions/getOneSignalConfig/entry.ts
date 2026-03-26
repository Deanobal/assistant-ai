import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function readSecretValue(name) {
  const raw = String(Deno.env.get(name) || '').trim();
  const prefix = `${name}=`;
  return raw.startsWith(prefix) ? raw.slice(prefix.length).trim() : raw;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const appId = readSecretValue('ONESIGNAL_APP_ID');
    if (!appId) {
      return Response.json({ error: 'OneSignal is not configured' }, { status: 500 });
    }

    return Response.json({
      appId,
      serviceWorkerPath: '/onesignal/OneSignalSDKWorker.js',
      serviceWorkerUpdaterPath: '/onesignal/OneSignalSDKUpdaterWorker.js',
      serviceWorkerScope: '/onesignal/',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});