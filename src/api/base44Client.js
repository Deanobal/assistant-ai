import { appParams } from '@/lib/app-params';

// Lazy singleton — SDK is NOT imported at module evaluation time.
// This prevents @base44/sdk from bundling its own React instance before
// the app's React has been initialized, which caused:
//   "Cannot read properties of null (reading 'useState')"
let _client = null;

export const getBase44 = () => {
  if (!_client) {
    // Dynamic require keeps the SDK out of the initial module graph
    const { createClient } = require('@base44/sdk');
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
  }
  return _client;
};

// Proxy object so existing `base44.xxx` call-sites keep working without changes.
// Property access is deferred until after React has mounted.
export const base44 = new Proxy(
  {},
  {
    get(_target, prop) {
      return getBase44()[prop];
    },
  }
);