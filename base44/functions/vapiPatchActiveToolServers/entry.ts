Deno.serve(async () => {
  try {
    const apiKey = Deno.env.get('VAPI_API_KEY') || '';
    const webhookSecret = Deno.env.get('VAPI_WEBHOOK_SECRET') || '';
    const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
    const activeToolIds = [
      '14ce925f-4295-426b-98b0-2eff1c7e3248',
      '4bad4d88-e6ea-4496-bdf1-30b74083a01a',
    ];

    const results = [];
    for (const toolId of activeToolIds) {
      const getRes = await fetch(`https://api.vapi.ai/tool/${toolId}`, { headers });
      const current = await getRes.json();
      const patchBody = {
        server: {
          url: 'https://assistantai.com.au/functions/vapiToolCallHandler',
          headers: {
            'Content-Type': 'application/json',
            'x-webhook-secret': webhookSecret,
          },
        },
      };
      const patchRes = await fetch(`https://api.vapi.ai/tool/${toolId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(patchBody),
      });
      const patchText = await patchRes.text();
      let patched;
      try { patched = JSON.parse(patchText); } catch { patched = patchText; }
      results.push({
        toolId,
        name: current?.function?.name || current?.name,
        patch_status: patchRes.status,
        success: patchRes.ok,
        server_url: patched?.server?.url || null,
        server_header_keys: patched?.server?.headers ? Object.keys(patched.server.headers) : [],
        error: patchRes.ok ? null : patched,
      });
    }

    return Response.json({ success: results.every((r) => r.success), results }, { status: 200 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 200 });
  }
});