import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

export const base44 = createClient({
  appId: appParams.appId,
  appBaseUrl: appParams.appBaseUrl,
  token: appParams.token,
  functionsVersion: appParams.functionsVersion,
});

export function prewarmBase44Client() {
  return base44;
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

export function getBase44Client() {
  return base44;
}
