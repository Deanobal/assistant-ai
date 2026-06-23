const DEFAULT_CLIENT_ROUTES = [
  {
    client_id: 'e1ef2110-58e6-4abb-9ac0-24d3d0abbddc',
    client_name: 'CIC Facilities Group Pty Ltd',
    plan: 'Starter',
    vapi_phone_number_id: '09f37f50-6550-4d81-be85-d05c4b65ee3b',
    vapi_phone_number: '+13618852186',
    vapi_assistant_id: '8452ae19-09ee-4457-8379-8f46ecb6996e',
    route_name: 'cic_test_receptionist',
  },
];

function getHeader(req, name) {
  const target = String(name || '').toLowerCase();
  const headers = req.headers || {};
  return String(headers[target] || headers[name] || '').trim();
}

function getBearerToken(req) {
  const authorization = getHeader(req, 'authorization');
  if (!authorization) return '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return String(match ? match[1] : authorization).trim();
}

function getExpectedSecret() {
  return String(process.env.VAPI_WEBHOOK_SECRET || process.env.VAPI_CALL_WEBHOOK_SECRET || '').trim();
}

function isAuthorised(req) {
  const expected = getExpectedSecret();
  if (!expected) return true;

  const candidates = [
    getHeader(req, 'x-webhook-secret'),
    getHeader(req, 'x-vapi-webhook-secret'),
    getHeader(req, 'x-vapi-secret'),
    getHeader(req, 'x-assistantai-webhook-secret'),
    getBearerToken(req),
    String(req.query?.vapi_token || '').trim(),
  ].filter(Boolean);

  return candidates.some((candidate) => candidate === expected);
}

function firstValue(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== '') return value;
  }
  return null;
}

function normalisePhone(value) {
  return String(value || '').replace(/[\s().-]/g, '').trim();
}

function safeRoutesFromEnv() {
  const raw = String(process.env.VAPI_CLIENT_ROUTES || '').trim();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch (_error) {
    return [];
  }
}

function getRoutes() {
  return [...safeRoutesFromEnv(), ...DEFAULT_CLIENT_ROUTES];
}

function getNested(body) {
  const message = body.message || body;
  const call = message.call || body.call || {};
  const phoneNumber = message.phoneNumber || body.phoneNumber || call.phoneNumber || {};
  const customer = message.customer || body.customer || call.customer || {};
  const metadata = {
    ...(body.metadata || {}),
    ...(message.metadata || {}),
    ...(call.metadata || {}),
    ...(customer.metadata || {}),
  };

  return { message, call, phoneNumber, customer, metadata };
}

function extractInboundPayload(body) {
  const { message, call, phoneNumber, customer, metadata } = getNested(body);

  return {
    clientId: firstValue(metadata.client_id, metadata.clientId, body.client_id, body.clientId),
    assistantId: firstValue(metadata.assistant_id, metadata.assistantId, call.assistantId, call.assistant_id, message.assistantId, body.assistantId, body.assistant_id),
    phoneNumberId: firstValue(
      metadata.vapi_phone_number_id,
      metadata.phone_number_id,
      phoneNumber.id,
      phoneNumber.phoneNumberId,
      phoneNumber.phone_number_id,
      call.phoneNumberId,
      call.phone_number_id,
      message.phoneNumberId,
      body.phoneNumberId,
      body.phone_number_id
    ),
    inboundNumber: firstValue(
      metadata.inbound_number,
      metadata.vapi_phone_number,
      phoneNumber.number,
      phoneNumber.phoneNumber,
      phoneNumber.phone_number,
      call.phoneNumber?.number,
      message.phoneNumber?.number,
      body.number,
      body.phone_number
    ),
    callerNumber: firstValue(
      metadata.caller_phone,
      customer.number,
      customer.phoneNumber,
      customer.phone_number,
      call.customer?.number,
      body.customer?.number,
      body.caller_phone
    ),
  };
}

function routeMatches(route, payload) {
  if (!route) return false;

  if (payload.clientId && String(route.client_id || '') === String(payload.clientId)) return true;
  if (payload.phoneNumberId && String(route.vapi_phone_number_id || '') === String(payload.phoneNumberId)) return true;
  if (payload.assistantId && String(route.vapi_assistant_id || '') === String(payload.assistantId)) return true;

  if (payload.inboundNumber && route.vapi_phone_number) {
    return normalisePhone(route.vapi_phone_number) === normalisePhone(payload.inboundNumber);
  }

  return false;
}

function resolveInboundRoute(body) {
  const payload = extractInboundPayload(body);
  const routes = getRoutes();
  const matchedRoute = routes.find((route) => routeMatches(route, payload));
  const defaultAssistantId = process.env.VAPI_INBOUND_ASSISTANT_ID || process.env.VITE_VAPI_ASSISTANT_ID || matchedRoute?.vapi_assistant_id || '';
  const route = matchedRoute || null;

  return {
    matched: Boolean(route?.client_id),
    clientId: route?.client_id || null,
    clientName: route?.client_name || route?.business_name || null,
    plan: route?.plan || null,
    assistantId: route?.vapi_assistant_id || defaultAssistantId,
    phoneNumberId: payload.phoneNumberId || route?.vapi_phone_number_id || null,
    inboundNumber: payload.inboundNumber || route?.vapi_phone_number || null,
    callerNumber: payload.callerNumber,
    routeName: route?.route_name || (route?.client_id ? `client_${route.client_id}` : 'default_inbound_route'),
  };
}

function buildResponse(route) {
  const metadata = {
    client_id: route.clientId,
    clientId: route.clientId,
    client_name: route.clientName,
    plan: route.plan,
    route_name: route.routeName,
    phone_number_id: route.phoneNumberId,
    inbound_number: route.inboundNumber,
    caller_phone: route.callerNumber,
    source: 'vapi_inbound_assistant_request',
  };

  Object.keys(metadata).forEach((key) => {
    if (metadata[key] === null || metadata[key] === undefined || metadata[key] === '') delete metadata[key];
  });

  return {
    assistantId: route.assistantId,
    metadata,
    assistantOverrides: {
      variableValues: {
        client_id: route.clientId || '',
        clientId: route.clientId || '',
        client_name: route.clientName || '',
        plan: route.plan || '',
        route_name: route.routeName,
        caller_phone: route.callerNumber || '',
      },
      metadata,
    },
  };
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      service: 'assistantai-vapi-assistant-request',
      purpose: 'Generic inbound Vapi routing with client metadata',
      route_count: getRoutes().length,
      env_routes_configured: safeRoutesFromEnv().length,
      secured: Boolean(getExpectedSecret()),
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isAuthorised(req)) {
    return res.status(401).json({ success: false, error: 'Unauthorized Vapi assistant request' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const route = resolveInboundRoute(body);
    const response = buildResponse(route);

    return res.status(200).json({
      ...response,
      success: true,
      matched: route.matched,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Vapi assistant request routing failed',
      details: error.message,
    });
  }
}
