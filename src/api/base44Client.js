import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

let _client = null;

function getClient() {
  if (_client) return _client;

  const { appId, token, functionsVersion, appBaseUrl } = appParams;
  const serverUrl =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('server_url') ||
        window.location.origin
      : '';

  _client = createClient({
    appId,
    token,
    functionsVersion,
    serverUrl,
    requiresAuth: false,
    appBaseUrl,
  });

  return _client;
}

// Proxy defers createClient() until the first property access,
// which happens inside components/effects — after React has mounted.
export const base44 = new Proxy(
  {},
  {
    get(_t, prop) {
      return getClient()[prop];
    },
    set(_t, prop, value) {
      getClient()[prop] = value;
      return true;
    },
  }
);