import { appParams } from '@/lib/app-params';

// ---------------------------------------------------------------------------
// Async client initialisation via dynamic import.
//
// WHY dynamic import?
// @base44/sdk bundles its own copy of React. If we use a static import, Vite
// merges it into the same pre-bundled chunk as the app's React and produces
// TWO React instances → "Cannot read properties of null (reading 'useEffect')".
//
// With a dynamic import, Vite keeps the SDK in a separate async chunk and the
// duplicate-React problem disappears entirely.
//
// The client promise is kicked off in main.jsx (before ReactDOM.createRoot)
// so it is always resolved long before any component's useEffect fires.
// ---------------------------------------------------------------------------

let _clientPromise = null;

function buildClientPromise() {
  const serverUrl =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('server_url') ||
        window.location.origin
      : '';

  // Use a variable so Vite's static scanner does NOT pre-bundle @base44/sdk.
  // Pre-bundling merges the SDK's internal React copy with the app's React,
  // causing two React instances and the "null useEffect" crash.
  const sdkPkg = '@base44/sdk';
  return import(/* @vite-ignore */ sdkPkg).then(({ createClient }) =>
    createClient({
      appId: appParams.appId,
      token: appParams.token,
      functionsVersion: appParams.functionsVersion,
      serverUrl,
      requiresAuth: false,
      appBaseUrl: appParams.appBaseUrl,
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
// Synchronous Proxy — base44.X works inside useEffect / async handlers.
//
// The proxy reads _resolvedClient which is populated by the pre-warm in
// main.jsx (see below). By the time any component mounts and calls hooks,
// the dynamic import has long since resolved.
// ---------------------------------------------------------------------------

let _resolvedClient = null;

// Called from main.jsx to pre-warm before React renders.
export function prewarmBase44Client() {
  getBase44Client().then((c) => {
    _resolvedClient = c;
  });
}

export const base44 = new Proxy(
  {},
  {
    get(_t, prop) {
      if (!_resolvedClient) {
        throw new Error(
          '[base44] Client not ready. Call prewarmBase44Client() in main.jsx before ReactDOM.createRoot().'
        );
      }
      return _resolvedClient[prop];
    },
    set(_t, prop, value) {
      if (_resolvedClient) _resolvedClient[prop] = value;
      return true;
    },
  }
);