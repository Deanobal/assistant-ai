Deno.serve(async () => {
  try {
    const apiKey = Deno.env.get('VAPI_API_KEY') || '';
    const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
    const assistantId = 'cbd73d14-2515-4633-a01c-928b3ccdbadb';
    const assistantRes = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, { headers });
    const assistant = await assistantRes.json();
    const toolRes = await fetch('https://api.vapi.ai/tool', { headers });
    const toolData = await toolRes.json();
    const tools = Array.isArray(toolData) ? toolData : toolData?.data || [];
    return Response.json({
      success: true,
      assistant: {
        id: assistant.id,
        name: assistant.name,
        top_keys: Object.keys(assistant),
        model_keys: Object.keys(assistant.model || {}),
        toolIds: assistant.toolIds || assistant.model?.toolIds || null,
        model_tools_count: assistant.model?.tools?.length || 0,
        model_tools: (assistant.model?.tools || []).map(t => ({ id: t.id, type: t.type, name: t.function?.name || t.name, server: t.server ? { url: t.server.url, header_keys: Object.keys(t.server.headers || {}) } : null })),
      },
      tools_count: tools.length,
      matching_tools: tools.filter(t => /qualified|checkout|lead/i.test(JSON.stringify(t))).map(t => ({ id: t.id, type: t.type, name: t.function?.name || t.name, server: t.server ? { url: t.server.url, header_keys: Object.keys(t.server.headers || {}) } : null, keys: Object.keys(t) })),
    }, { status: 200 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 200 });
  }
});