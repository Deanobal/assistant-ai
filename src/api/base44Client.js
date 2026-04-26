import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;
const serverUrl = typeof window !== 'undefined'
  ? new URLSearchParams(window.location.search).get('server_url') || window.location.origin
  : '';

export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl,
  requiresAuth: false,
  appBaseUrl,
});