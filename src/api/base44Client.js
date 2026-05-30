import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const configuredBackendUrl = (
  import.meta.env.VITE_BASE44_FUNCTION_BASE_URL ||
  import.meta.env.VITE_BASE44_APP_BASE_URL ||
  ''
).replace(/\/$/, '').replace(/\/functions$/, '');

const serverUrl =
  typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('server_url') ||
      configuredBackendUrl ||
      window.location.origin
    : configuredBackendUrl;

const nativeAdminUser = {
  id: 'assistantai-native-admin',
  role: 'admin',
  full_name: 'AssistantAI Admin',
  email: 'admin@assistantai.com.au',
};

function hasNativeAdminSession() {
  return typeof window !== 'undefined' && localStorage.getItem('assistantai_admin_session') === 'granted';
}

export const base44 = createClient({
  appId: appParams.appId,
  token: appParams.token,
  functionsVersion: appParams.functionsVersion,
  serverUrl,
  requiresAuth: false,
  appBaseUrl: appParams.appBaseUrl,
});

const originalAuthMe = base44.auth.me.bind(base44.auth);
const originalAuthIsAuthenticated = base44.auth.isAuthenticated.bind(base44.auth);
const originalAuthLogout = base44.auth.logout.bind(base44.auth);

base44.auth.me = async (...args) => {
  if (hasNativeAdminSession()) return nativeAdminUser;
  return originalAuthMe(...args);
};

base44.auth.isAuthenticated = async (...args) => {
  if (hasNativeAdminSession()) return true;
  return originalAuthIsAuthenticated(...args);
};

base44.auth.logout = async (...args) => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('assistantai_admin_session');
  }
  return originalAuthLogout(...args).catch(() => null);
};

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

// Compatibility shim: some files import getBase44Client expecting a client instance
export function getBase44Client() {
  return base44;
}
