import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const serverUrl =
  typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('server_url') ||
      window.location.origin
    : '';

export const base44 = createClient({
  appId: appParams.appId,
  token: appParams.token,
  functionsVersion: appParams.functionsVersion,
  serverUrl,
  requiresAuth: false,
  appBaseUrl: appParams.appBaseUrl,
});

export function prewarmBase44Client() {
  // no-op: kept for compatibility with main.jsx import
}

export async function authMe() {
  return base44.auth.me();
}

export async function authLogout(redirectUrl) {
  return base44.auth.logout(redirectUrl);
}

export async function authRedirectToLogin(nextUrl) {
  return base44.auth.redirectToLogin(nextUrl);
}

export async function authIsAuthenticated() {
  return base44.auth.isAuthenticated();
}

export async function invokeFunction(name, payload) {
  return base44.functions.invoke(name, payload);
}