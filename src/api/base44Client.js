const nativeAdminUser = {
  id: 'assistantai-native-admin',
  role: 'admin',
  full_name: 'AssistantAI Admin',
  email: 'admin@assistantai.com.au',
};

function hasNativeAdminSession() {
  return typeof window !== 'undefined' && localStorage.getItem('assistantai_admin_session') === 'granted';
}

function unsupportedBase44Call(area) {
  throw new Error(`${area} is no longer available. AssistantAI now uses native Vercel and Supabase APIs.`);
}

export const base44 = {
  auth: {
    async me() {
      if (hasNativeAdminSession()) return nativeAdminUser;
      return null;
    },
    async isAuthenticated() {
      return hasNativeAdminSession();
    },
    async logout() {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('assistantai_admin_session');
      }
      return null;
    },
    async redirectToLogin(nextUrl = '/AdminLogin') {
      if (typeof window !== 'undefined') {
        window.location.href = nextUrl;
      }
      return null;
    },
  },
  entities: new Proxy({}, {
    get(_target, entityName) {
      return new Proxy({}, {
        get() {
          return () => unsupportedBase44Call(`Base44 entity ${String(entityName)}`);
        }
      });
    }
  }),
  functions: {
    invoke(name) {
      return unsupportedBase44Call(`Base44 function ${name}`);
    }
  },
  integrations: new Proxy({}, {
    get(_target, integrationName) {
      return () => unsupportedBase44Call(`Base44 integration ${String(integrationName)}`);
    }
  })
};

export function prewarmBase44Client() {
  // no-op: legacy import kept temporarily while remaining app areas are migrated.
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

export async function invokeFunction(name) {
  return unsupportedBase44Call(`Base44 function ${name}`);
}

export function getBase44Client() {
  return base44;
}
