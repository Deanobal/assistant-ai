const CIC_CLIENT_ID = 'e1ef2110-58e6-4abb-9ac0-24d3d0abbddc';
const CIC_PHONE_NUMBER_ID = '09f37f50-6550-4d81-be85-d05c4b65ee3b';
const CIC_PHONE_NUMBER = '+13618852186';
const CIC_CURRENT_ASSISTANT_ID = '8452ae19-09ee-4457-8379-8f46ecb6996e';

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

function getNested(body) {
  const message = body.message || body;
  const call = message.call || body.call || {};
  const phoneNumber = message.phoneNumber || body.phoneNumber || call.phoneNumber || {};
  const customer = message.customer || body.customer || call.customer || {};

  return { message, call, phoneNumber, customer };
}

function resolveInboundRoute(body) {
  const { message, call, phoneNumber, customer } = getNested(body);

  const phoneNumberId = firstValue(
    phoneNumber.id,
    phoneNumber.phoneNumberId,
    phoneNumber.phone_number_id,
    call.phoneNumberId,
    call.phone_number_id,
    message.phoneNumberId,
    body.phoneNumberId,
    body.phone_number_id
  );

  const inboundNumber = firstValue(
    phoneNumber.number,
    phoneNumber.phoneNumber,
    phoneNumber.phone_number,
    call.phoneNumber?.number,
    message.phoneNumber?.number,
    body.number,
    body.phone_number
  );

  const callerNumber = firstValue(
    customer.number,
    customer.phoneNumber,
    customer.phone_number,
    call.customer?.number,
    body.customer?.number,
    body.caller_phone
  );

  const isCicNumber = String(phoneNumberId || '') === CIC_PHONE_NUMBER_ID
    || normalisePhone(inboundNumber) === normalisePhone(CIC_PHONE_NUMBER);

  const assistantId = process.env.VAPI_CIC_ASSISTANT_ID
    || process.env.VAPI_INBOUND_ASSISTANT_ID
    || process.env.VITE_VAPI_ASSISTANT_ID
    || CIC_CURRENT_ASSISTANT_ID;

  if (isCicNumber) {
    return {
      matched: true,
      clientId: CIC_CLIENT_ID,
      assistantId,
      phoneNumberId: phoneNumberId || CIC_PHONE_NUMBER_ID,
      inboundNumber: inboundNumber || CIC_PHONE_NUMBER,
      callerNumber,
      routeName: 'cic_test_receptionist',
    };
  }

  return {
    matched: false,
    clientId: process.env.VAPI_DEFAULT_CLIENT_ID || null,
    assistantId,
    phoneNumberId: phoneNumberId || null,
    inboundNumber: inboundNumber || null,
    callerNumber,
    routeName: 'default_inbound_route',
  };
}

function buildResponse(route) {
  const metadata = {
    client_id: route.clientId,
    clientId: route.clientId,
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
      purpose: 'Inbound Vapi phone-number assistant routing with client metadata',
      cic_client_id: CIC_CLIENT_ID,
      cic_phone_number_id: CIC_PHONE_NUMBER_ID,
      cic_phone_number: CIC_PHONE_NUMBER,
      cic_assistant_id: CIC_CURRENT_ASSISTANT_ID,
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
