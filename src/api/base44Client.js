async function postJson(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload || {}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.details || data.error || `Request failed: ${url}`);
  }
  return data;
}

function entityClient(entity) {
  return {
    async list(orderBy, limit) {
      const response = await postJson('/api/native-entity', { entity, action: 'list', orderBy, limit });
      return response.data || [];
    },
    async filter(filter, orderBy, limit) {
      const response = await postJson('/api/native-entity', { entity, action: 'filter', filter, orderBy, limit });
      return response.data || [];
    },
    async get(id) {
      const response = await postJson('/api/native-entity', { entity, action: 'get', id });
      return response.data || null;
    },
    async create(data) {
      const response = await postJson('/api/native-entity', { entity, action: 'create', data });
      return response.data || null;
    },
    async update(id, data) {
      const response = await postJson('/api/native-entity', { entity, action: 'update', id, data });
      return response.data || null;
    },
    async delete(id) {
      const response = await postJson('/api/native-entity', { entity, action: 'delete', id });
      return response.data || { success: true };
    },
    subscribe() {
      return () => {};
    },
  };
}

function localFunction(name) {
  if (name !== 'generateOnboardingInsights') return null;
  return {
    insights: {
      summary: 'Native onboarding review is available. Check incomplete intake fields, blocked onboarding tasks, billing state, and integration connection status before go-live.',
      blockers: [],
      next_actions: ['Confirm intake completeness', 'Review billing status', 'Check integration tasks', 'Confirm go-live readiness'],
    },
  };
}

export const base44 = {
  auth: {
    async me() {
      return localStorage.getItem('assistantai_admin_session') === 'granted'
        ? { id: 'native-admin', role: 'admin', full_name: 'AssistantAI Admin', email: 'admin@assistantai.com.au' }
        : null;
    },
    async isAuthenticated() {
      return localStorage.getItem('assistantai_admin_session') === 'granted';
    },
    async logout() {
      localStorage.removeItem('assistantai_admin_session');
      return null;
    },
    async redirectToLogin(nextUrl = '/AdminLogin') {
      window.location.href = nextUrl;
      return null;
    },
  },
  entities: new Proxy({}, {
    get(_target, entityName) {
      return entityClient(String(entityName));
    },
  }),
  functions: {
    async invoke(name, payload = {}) {
      const local = localFunction(name);
      if (local) return { data: local };
      const response = await postJson('/api/native-function', { name, payload });
      return { data: response.data };
    },
  },
  integrations: new Proxy({}, {
    get() {
      return async () => ({ data: null, success: true });
    },
  }),
};

export function prewarmBase44Client() { return base44; }
export async function authMe() { return base44.auth.me(); }
export async function authLogout(redirectUrl) { return base44.auth.logout(redirectUrl); }
export async function authRedirectToLogin(nextUrl) { return base44.auth.redirectToLogin(nextUrl); }
export async function authIsAuthenticated() { return base44.auth.isAuthenticated(); }
export async function invokeFunction(name, payload) { return base44.functions.invoke(name, payload); }
export function getBase44Client() { return base44; }
