import { appParams } from '@/lib/app-params';

// --- Async client initialisation ---
// @base44/sdk is loaded via dynamic import ONLY, so its bundled React copy
// is never evaluated during the initial module-graph traversal.
// This prevents the "duplicate React instance / null hook" crash.

let _clientPromise = null;

function buildClientPromise() {
  const { appId, token, functionsVersion, appBaseUrl } = appParams;
  const serverUrl =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('server_url') ||
        window.location.origin
      : '';

  return import('@base44/sdk').then(({ createClient }) =>
    createClient({
      appId,
      token,
      functionsVersion,
      serverUrl,
      requiresAuth: false,
      appBaseUrl,
    })
  );
}

/** Returns a Promise<client>. Safe to call multiple times (singleton). */
export function getBase44Client() {
  if (!_clientPromise) {
    _clientPromise = buildClientPromise();
  }
  return _clientPromise;
}

// ---------------------------------------------------------------------------
// Async wrapper helpers
// These let callers write one-liners without repeating getBase44Client() everywhere.
// ---------------------------------------------------------------------------

export async function authMe() {
  const c = await getBase44Client();
  return c.auth.me();
}

export async function authLogout(redirectUrl) {
  const c = await getBase44Client();
  return c.auth.logout(redirectUrl);
}

export async function authRedirectToLogin(nextUrl) {
  const c = await getBase44Client();
  return c.auth.redirectToLogin(nextUrl);
}

export async function authIsAuthenticated() {
  const c = await getBase44Client();
  return c.auth.isAuthenticated();
}

export async function invokeFunction(name, payload) {
  const c = await getBase44Client();
  return c.functions.invoke(name, payload);
}

// ---------------------------------------------------------------------------
// Lazy synchronous Proxy
//
// Many existing files do:  import { base44 } from '@/api/base44Client'
// and then call base44.entities.Foo.list() inside useEffect / async handlers.
// Those calls are ALWAYS made after React has mounted (never at module-parse
// time), so by then the dynamic import has already resolved and _resolvedClient
// is set.  The Proxy just forwards to it.
//
// The only requirement: nothing may call base44.X at module top-level.
// ---------------------------------------------------------------------------

let _resolvedClient = null;

// Kick off the import immediately so it resolves as early as possible,
// but don't block module evaluation.
getBase44Client().then((c) => {
  _resolvedClient = c;
});

function resolved() {
  if (!_resolvedClient) {
    throw new Error(
      '[base44] Client not ready yet. ' +
        'Make sure you only call base44.* inside useEffect, event handlers, or async functions — never at module top-level.'
    );
  }
  return _resolvedClient;
}

export const base44 = new Proxy(
  {},
  {
    get(_t, prop) {
      return resolved()[prop];
    },
    set(_t, prop, value) {
      resolved()[prop] = value;
      return true;
    },
  }
);