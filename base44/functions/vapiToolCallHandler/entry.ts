import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SUPPORTED_TOOLS = new Set([
  'create_ai_qualified_lead',
  'create_checkout_for_qualified_lead',
]);

function mask(value) {
  return value ? '[present-redacted]' : '[missing]';
}

function jsonResponse(body) {
  console.log('Final response shape:', JSON.stringify({
    has_results: Array.isArray(body?.results),
    result_count: body?.results?.length || 0,
    success: body?.success,
    message: body?.message,
  }));
  return Response.json(body, {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function errorResult(toolCallId, message) {
  return {
    toolCallId: toolCallId || 'unknown_tool_call',
    result: {
      success: false,
      error: message,
    },
  };
}

function parseArguments(value) {
  if (!value) return {};
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
}

function getToolName(call, body) {
  return String(
    call?.function?.name ||
    call?.functionCall?.name ||
    call?.function_call?.name ||
    call?.name ||
    call?.toolName ||
    call?.tool_name ||
    body?.function?.name ||
    body?.name ||
    body?.toolName ||
    body?.tool_name ||
    ''
  ).trim();
}

function getToolCallId(call, index) {
  return String(
    call?.toolCallId ||
    call?.tool_call_id ||
    call?.id ||
    call?.callId ||
    call?.functionCall?.id ||
    call?.function_call?.id ||
    `tool_call_${index + 1}`
  );
}

function getToolArguments(call, body) {
  const extracted =
    call?.function?.arguments ??
    call?.function?.parameters ??
    call?.functionCall?.arguments ??
    call?.functionCall?.parameters ??
    call?.function_call?.arguments ??
    call?.function_call?.parameters ??
    call?.arguments ??
    call?.parameters ??
    call?.args;

  const parsed = parseArguments(extracted);
  if (Object.keys(parsed).length > 0) return parsed;

  const ignored = new Set(['message', 'toolCalls', 'functionCall', 'function_call', 'function', 'name', 'toolName', 'tool_name', 'debug', 'webhook_secret', 'x_webhook_secret']);
  const flat = {};
  Object.entries(body || {}).forEach(([key, value]) => {
    if (!ignored.has(key)) flat[key] = value;
  });
  return flat;
}

function extractToolCalls(body) {
  const source = Array.isArray(body?.message?.toolCalls)
    ? body.message.toolCalls
    : Array.isArray(body?.toolCalls)
      ? body.toolCalls
      : body?.functionCall
        ? [body.functionCall]
        : body?.function_call
          ? [body.function_call]
          : getToolName(body, body)
            ? [body]
            : [];

  return source.map((call, index) => ({
    toolCallId: getToolCallId(call, index),
    name: getToolName(call, body),
    arguments: getToolArguments(call, body),
  }));
}

async function invokeInternalFunction(base44, toolName, args, secret) {
  const functionName = toolName === 'create_ai_qualified_lead'
    ? 'createAIQualifiedLead'
    : 'createCheckoutForQualifiedLead';

  const response = await base44.asServiceRole.functions.invoke(functionName, {
    ...args,
    webhook_secret: secret,
  });

  return response?.data || response;
}

Deno.serve(async (req) => {
  let body = {};
  try {
    const expectedSecret = Deno.env.get('VAPI_WEBHOOK_SECRET') || '';
    const receivedSecret = req.headers.get('x-webhook-secret') || '';
    const secretValid = !!receivedSecret && !!expectedSecret && receivedSecret === expectedSecret;

    console.log('Incoming headers present:', JSON.stringify({
      content_type: req.headers.get('content-type') || '',
      user_agent: req.headers.get('user-agent') || '',
      x_webhook_secret: mask(receivedSecret),
    }));

    try {
      body = await req.json();
    } catch {
      body = {};
    }

    console.log('Request body shape:', JSON.stringify({
      keys: Object.keys(body || {}),
      has_message_toolCalls: Array.isArray(body?.message?.toolCalls),
      has_toolCalls: Array.isArray(body?.toolCalls),
      has_functionCall: !!body?.functionCall,
      has_function_call: !!body?.function_call,
      debug: body?.debug === true,
    }));

    if (body?.debug === true) {
      return jsonResponse({
        success: true,
        message: 'Vapi tool-call handler reachable',
        secret_received: !!receivedSecret,
        secret_valid: secretValid,
      });
    }

    const toolCalls = extractToolCalls(body);
    console.log('Detected tool names:', JSON.stringify(toolCalls.map((call) => call.name)));
    console.log('Extracted arguments:', JSON.stringify(toolCalls.map((call) => ({ toolCallId: call.toolCallId, name: call.name, arguments: call.arguments }))));

    if (!secretValid) {
      const fallbackToolCallId = toolCalls[0]?.toolCallId || 'unknown_tool_call';
      return jsonResponse({ results: [errorResult(fallbackToolCallId, 'Invalid webhook secret')] });
    }

    if (toolCalls.length === 0) {
      return jsonResponse({ results: [errorResult('unknown_tool_call', 'No tool call found in request')] });
    }

    const base44 = createClientFromRequest(req);
    const results = [];

    for (const toolCall of toolCalls) {
      if (!SUPPORTED_TOOLS.has(toolCall.name)) {
        results.push(errorResult(toolCall.toolCallId, `Unsupported tool: ${toolCall.name || 'unknown'}`));
        continue;
      }

      try {
        const internalResult = await invokeInternalFunction(base44, toolCall.name, toolCall.arguments, expectedSecret);
        console.log('Internal function result:', JSON.stringify({ toolCallId: toolCall.toolCallId, name: toolCall.name, result: internalResult }));
        results.push({
          toolCallId: toolCall.toolCallId,
          result: internalResult,
        });
      } catch (error) {
        console.log('Internal function failure:', JSON.stringify({ toolCallId: toolCall.toolCallId, name: toolCall.name, error: error?.message || String(error) }));
        results.push(errorResult(toolCall.toolCallId, error?.message || 'Tool execution failed'));
      }
    }

    return jsonResponse({ results });
  } catch (error) {
    console.log('Handler failure:', error?.message || String(error));
    return jsonResponse({
      results: [errorResult('unknown_tool_call', error?.message || 'Unexpected handler error')],
    });
  }
});