Deno.serve(async () => {
  try {
    const apiKey = Deno.env.get('VAPI_API_KEY') || '';
    const webhookSecret = Deno.env.get('VAPI_WEBHOOK_SECRET') || '';
    if (!apiKey) return Response.json({ success: false, error: 'Missing VAPI_API_KEY' }, { status: 200 });
    if (!webhookSecret) return Response.json({ success: false, error: 'Missing VAPI_WEBHOOK_SECRET' }, { status: 200 });

    const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
    const assistantsRes = await fetch('https://api.vapi.ai/assistant', { headers });
    const assistants = await assistantsRes.json();
    const assistantList = Array.isArray(assistants) ? assistants : assistants?.data || [];
    const assistant = assistantList.find((item) => /AssistantAI Demo Receptionist/i.test(item?.name || item?.firstMessage || '')) || assistantList[0];
    if (!assistant?.id) return Response.json({ success: false, error: 'No Vapi assistant found' }, { status: 200 });

    const assistantRes = await fetch(`https://api.vapi.ai/assistant/${assistant.id}`, { headers });
    const currentAssistant = await assistantRes.json();
    const model = currentAssistant.model || {};
    const tools = Array.isArray(model.tools) ? model.tools : [];

    const targetNames = new Set(['create_ai_qualified_lead', 'create_checkout_for_qualified_lead']);
    const before = tools.map((tool) => ({
      id: tool.id,
      type: tool.type,
      name: tool.function?.name || tool.name,
      has_server: !!tool.server,
      server_url: tool.server?.url || null,
      server_headers_keys: tool.server?.headers ? Object.keys(tool.server.headers) : [],
      has_secret: !!tool.server?.secret,
    }));

    const updatedTools = tools.map((tool) => {
      const name = tool.function?.name || tool.name;
      if (!targetNames.has(name)) return tool;
      return {
        ...tool,
        server: {
          ...(tool.server || {}),
          url: 'https://assistantai.com.au/functions/vapiToolCallHandler',
          headers: {
            ...(tool.server?.headers || {}),
            'x-webhook-secret': webhookSecret,
          },
        },
      };
    });

    const patchBody = {
      model: {
        ...model,
        tools: updatedTools,
      },
    };

    const patchRes = await fetch(`https://api.vapi.ai/assistant/${assistant.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(patchBody),
    });
    const patchText = await patchRes.text();
    let patchData;
    try { patchData = JSON.parse(patchText); } catch { patchData = patchText; }

    const afterTools = Array.isArray(patchData?.model?.tools) ? patchData.model.tools : updatedTools;
    const after = afterTools.map((tool) => ({
      id: tool.id,
      type: tool.type,
      name: tool.function?.name || tool.name,
      has_server: !!tool.server,
      server_url: tool.server?.url || null,
      server_headers_keys: tool.server?.headers ? Object.keys(tool.server.headers) : [],
      has_secret_header: !!tool.server?.headers?.['x-webhook-secret'],
    }));

    return Response.json({
      success: patchRes.ok,
      assistant_id: assistant.id,
      assistant_name: currentAssistant.name || assistant.name,
      patch_status: patchRes.status,
      before,
      after,
      patch_error: patchRes.ok ? null : patchData,
    }, { status: 200 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 200 });
  }
});