import crypto from 'crypto';
import { requireAdmin } from './_native-auth.js';

function makeToken() {
  return crypto.randomBytes(24).toString('base64url');
}

function normalisePhone(phone) {
  return String(phone || '').replace(/\s+/g, '').trim();
}

function text(value) {
  const clean = String(value || '').trim();
  return clean || null;
}

function getConfig() {
  const url = String(process.env.VITE_SUPABASE_URL || '').trim().replace(/\/$/, '');
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !key) throw new Error('Server database configuration missing');
  return { url, key };
}

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

function getExpectedWebhookSecret() {
  return String(
    process.env.VAPI_WEBHOOK_SECRET ||
    process.env.SECURE_SETUP_WEBHOOK_SECRET ||
    ''
  ).trim();
}

function isAuthorised(req) {
  const expected = getExpectedWebhookSecret();
  if (!expected) return true;

  const candidates = [
    getHeader(req, 'x-webhook-secret'),
    getHeader(req, 'x-vapi-webhook-secret'),
    getHeader(req, 'x-vapi-secret'),
    getHeader(req, 'x-assistantai-webhook-secret'),
    getBearerToken(req),
  ].filter(Boolean);

  return candidates.some((candidate) => candidate === expected);
}

function parseArgs(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (_error) {
    return {};
  }
}

function getToolCallId(call, index) {
  return String(
    call?.toolCallId ||
    call?.tool_call_id ||
    call?.id ||
    call?.functionCall?.id ||
    call?.function_call?.id ||
    `tool_call_${index + 1}`
  );
}

function getToolArguments(call) {
  return parseArgs(
    call?.function?.arguments ??
    call?.function?.parameters ??
    call?.functionCall?.arguments ??
    call?.functionCall?.parameters ??
    call?.function_call?.arguments ??
    call?.function_call?.parameters ??
    call?.arguments ??
    call?.parameters ??
    call?.args
  );
}

function extractVapiToolCalls(body) {
  const calls = Array.isArray(body?.message?.toolCallList)
    ? body.message.toolCallList
    : Array.isArray(body?.message?.toolCalls)
      ? body.message.toolCalls
      : Array.isArray(body?.toolCallList)
        ? body.toolCallList
        : Array.isArray(body?.toolCalls)
          ? body.toolCalls
          : body?.functionCall
            ? [body.functionCall]
            : body?.message?.functionCall
              ? [body.message.functionCall]
              : [];

  return calls.map((call, index) => ({
    toolCallId: getToolCallId(call, index),
    arguments: getToolArguments(call)
  }));
}

async function sendTwilioSms({ to, message }) {
  const accountSid = String(process.env.TWILIO_ACCOUNT_SID || '').trim();
  const authToken = String(process.env.TWILIO_AUTH_TOKEN || '').trim();
  const from = String(process.env.TWILIO_FROM_NUMBER || '').trim();
  const recipient = normalisePhone(to);

  if (!accountSid || !authToken || !from || !recipient) {
    return { status: 'not_configured_or_missing_phone', from: from || null };
  }

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  const params = new URLSearchParams();
  params.append('To', recipient);
  params.append('From', normalisePhone(from));
  params.append('Body', message);

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      status: 'failed',
      provider: 'twilio',
      from,
      error: data?.message || data?.error_message || JSON.stringify(data),
      provider_response: data
    };
  }

  return {
    status: 'sent',
    provider: 'twilio',
    from,
    provider_message_id: data?.sid || null,
    provider_response: data
  };
}

function buildNotes(body) {
  const parts = [
    body.notes,
    body.summary,
    body.conversation_summary,
    body.reason ? `Reason: ${body.reason}` : null,
    body.service_needed ? `Service needed: ${body.service_needed}` : null,
    body.buyer_intent ? `Buyer intent: ${body.buyer_intent}` : null,
    body.current_call_handling ? `Current call handling: ${body.current_call_handling}` : null,
    body.monthly_enquiry_volume ? `Monthly enquiry volume: ${body.monthly_enquiry_volume}` : null,
    body.wants_booking !== undefined ? `Wants booking: ${body.wants_booking}` : null,
    body.wants_crm_sync !== undefined ? `Wants CRM sync: ${body.wants_crm_sync}` : null,
    body.wants_sms_followup !== undefined ? `Wants SMS follow-up: ${body.wants_sms_followup}` : null,
    body.wants_email_followup !== undefined ? `Wants email follow-up: ${body.wants_email_followup}` : null,
  ].map(text).filter(Boolean);
  return parts.length ? parts.join('\n') : null;
}

async function createSecureSetup(body) {
  const { url, key } = getConfig();
  const token = makeToken();
  const baseUrl = (process.env.SITE_URL || 'https://www.assistantai.com.au').replace(/\/$/, '');
  const phone = normalisePhone(body.phone || body.caller_phone || body.mobile_number || body.mobile);

  if (!phone) {
    throw new Error('A mobile/phone number is required to send the secure setup form link');
  }

  const setupUrl = `${baseUrl}/secure-setup?token=${encodeURIComponent(token)}`;

  const payload = {
    token,
    source: text(body.source || body.lead_source || body.source_page) || 'vapi',
    caller_phone: phone,
    captured_name: text(body.name || body.full_name),
    captured_email: text(body.email),
    captured_business_name: text(body.business_name || body.businessName || body.company),
    captured_plan: text(body.plan || body.selected_plan || body.likely_plan_fit),
    captured_notes: buildNotes(body),
    call_id: text(body.call_id || body.callId),
    lead_id: text(body.lead_id || body.leadId),
    submitted_payload: body.raw_payload || body,
  };

  const response = await fetch(`${url}/rest/v1/secure_setup_requests`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify(payload)
  });

  const textResponse = await response.text();
  const data = textResponse ? JSON.parse(textResponse) : null;

  if (!response.ok) {
    throw new Error(`Secure setup request creation failed: ${JSON.stringify(data)}`);
  }

  const record = Array.isArray(data) ? data[0] : data;
  const smsMessage = `AssistantAI secure setup form: ${setupUrl}`;
  const sms = await sendTwilioSms({ to: phone, message: smsMessage });

  return {
    success: true,
    token,
    secure_setup_url: setupUrl,
    sent_to: phone,
    twilio_from_number: sms.from || process.env.TWILIO_FROM_NUMBER || null,
    sms_status: sms.status,
    sms_provider: sms.provider || 'twilio',
    sms_provider_message_id: sms.provider_message_id || null,
    sms_error: sms.error || null,
    next_step: sms.status === 'sent'
      ? 'Secure setup form link sent by SMS. Tell the caller the unique secure link has been sent.'
      : 'Secure setup form was created, but SMS was not confirmed. Give the caller only the returned secure_setup_url and flag the SMS issue for human follow-up.',
    record
  };
}

function unauthorisedToolResults(toolCalls) {
  return {
    results: toolCalls.map((toolCall) => ({
      toolCallId: toolCall.toolCallId,
      result: {
        success: false,
        error: 'Unauthorised secure setup tool call. The Vapi tool must send the configured webhook secret in x-webhook-secret, x-vapi-webhook-secret, x-vapi-secret, x-assistantai-webhook-secret, or Authorization: Bearer.',
        next_step: 'Do not provide a generic secure setup link. Tell the caller the secure form could not be generated automatically and request human follow-up.'
      }
    }))
  };
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    if (!requireAdmin(req, res)) return;
    return res.status(200).json({
      success: true,
      service: 'assistantai-secure-setup-create',
      supabase_url_present: Boolean(process.env.VITE_SUPABASE_URL),
      service_role_key_present: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      twilio_configured: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER),
      twilio_from_number_present: Boolean(process.env.TWILIO_FROM_NUMBER),
      webhook_secret_required: Boolean(getExpectedWebhookSecret()),
      accepted_auth_headers: [
        'x-webhook-secret',
        'x-vapi-webhook-secret',
        'x-vapi-secret',
        'x-assistantai-webhook-secret',
        'Authorization: Bearer <secret>'
      ],
      secure_setup_url_param: 'token',
      supports_vapi_tool_results: true
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const toolCalls = extractVapiToolCalls(body);

  if (!isAuthorised(req)) {
    if (toolCalls.length > 0) {
      return res.status(200).json(unauthorisedToolResults(toolCalls));
    }
    return res.status(401).json({
      success: false,
      error: 'Unauthorised secure setup tool call',
      accepted_auth_headers: [
        'x-webhook-secret',
        'x-vapi-webhook-secret',
        'x-vapi-secret',
        'x-assistantai-webhook-secret',
        'Authorization: Bearer <secret>'
      ]
    });
  }

  if (toolCalls.length > 0) {
    const results = [];
    for (const toolCall of toolCalls) {
      try {
        const result = await createSecureSetup({
          ...toolCall.arguments,
          raw_payload: toolCall.arguments
        });
        results.push({ toolCallId: toolCall.toolCallId, result });
      } catch (error) {
        results.push({
          toolCallId: toolCall.toolCallId,
          result: {
            success: false,
            error: error.message,
            next_step: 'Tell the caller the secure setup link could not be sent automatically and a team member will follow up. Do not provide the generic secure setup page.'
          }
        });
      }
    }
    return res.status(200).json({ results });
  }

  try {
    const result = await createSecureSetup(body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Secure setup request creation failed', details: error.message });
  }
}
