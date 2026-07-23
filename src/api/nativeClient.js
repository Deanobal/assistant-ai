async function parseResponse(response, url) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    const error = Object.assign(new Error(data.details || data.error || `Request failed: ${url}`), {
      status: response.status,
    });
    throw error;
  }
  return data;
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload || {}),
  });
  return parseResponse(response, url);
}

async function getJson(url) {
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  return parseResponse(response, url);
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

export const assistantApi = {
  auth: {
    async me() {
      try {
        const session = await getJson('/api/admin-session');
        return session.authenticated
          ? { id: 'native-admin', role: 'admin', full_name: 'AssistantAI Admin', email: 'admin@assistantai.com.au' }
          : null;
      } catch (error) {
        if (error.status === 401) return null;
        throw error;
      }
    },
    async isAuthenticated() {
      try {
        const session = await getJson('/api/admin-session');
        return Boolean(session.authenticated);
      } catch (error) {
        if (error.status === 401) return false;
        throw error;
      }
    },
    async logout() {
      await postJson('/api/admin-logout', {});
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

export function prewarmNativeClient() { return assistantApi; }
export async function authMe() { return assistantApi.auth.me(); }
export async function authLogout() { return assistantApi.auth.logout(); }
export async function authRedirectToLogin(nextUrl) { return assistantApi.auth.redirectToLogin(nextUrl); }
export async function authIsAuthenticated() { return assistantApi.auth.isAuthenticated(); }
export async function invokeFunction(name, payload) { return assistantApi.functions.invoke(name, payload); }
export function getNativeClient() { return assistantApi; }
