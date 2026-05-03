import { appParams } from '@/lib/app-params';
import { createClient } from '@base44/sdk';

// ---------------------------------------------------------------------------
// Single client instance — created once, synchronously at module init time.
// Using a static import (not dynamic) ensures Vite deduplicates React correctly
// and prevents the "duplicate React / null hook" crash.
// ---------------------------------------------------------------------------

const serverUrl =
  typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('server_url') ||
      window.location.origin
    : '';

const _client = createClient({
  appId: appParams.appId,
  token: appParams.token,
  functionsVersion: appParams.functionsVersion,
  serverUrl,
  requiresAuth: false,
  appBaseUrl: appParams.appBaseUrl,
});

/** Returns the client (sync). Kept for backwards compatibility. */
export function getBase44Client() {
  return Promise.resolve(_client);
}

// ---------------------------------------------------------------------------
// Async wrapper helpers (kept for backwards compatibility)
// ---------------------------------------------------------------------------

export async function authMe() {
  return _client.auth.me();
}

export async function authLogout(redirectUrl) {
  return _client.auth.logout(redirectUrl);
}

export async function authRedirectToLogin(nextUrl) {
  return _client.auth.redirectToLogin(nextUrl);
}

export async function authIsAuthenticated() {
  return _client.auth.isAuthenticated();
}

export async function invokeFunction(name, payload) {
  return _client.functions.invoke(name, payload);
}

// ---------------------------------------------------------------------------
// Named export — used by most components as: import { base44 } from '@/api/base44Client'
// ---------------------------------------------------------------------------
export const base44 = _client;