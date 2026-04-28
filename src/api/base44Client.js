import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;
const serverUrl =
  typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('server_url') ||
      window.location.origin
    : '';

// Dynamic import keeps @base44/sdk's bundled React out of the initial
// module evaluation graph, preventing a duplicate React instance.
const { createClient } = await import('@base44/sdk');

export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl,
  requiresAuth: false,
  appBaseUrl,
});