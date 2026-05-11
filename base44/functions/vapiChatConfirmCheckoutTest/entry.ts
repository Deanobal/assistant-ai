Deno.serve(async () => {
  try {
    const apiKey = Deno.env.get('VAPI_API_KEY') || '';
    const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
    const assistantId = 'cbd73d14-2515-4633-a01c-928b3ccdbadb';
    const input = 'Yes, please create the secure checkout link now.';

    async function postChat(body) {
      const res = await fetch('https://api.vapi.ai/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { raw: text }; }
      return { status: res.status, ok: res.ok, data };
    }

    const attempts = [];
    const bodies = [
      { assistantId, input },
      { assistantId, message: input },
      { assistantId, messages: [{ role: 'user', content: input }] },
      { assistantId, previousChatId: 'f5f3c4a2-b303-48ba-9055-38ef382510b4', input },
    ];

    for (const body of bodies) {
      const result = await postChat(body);
      attempts.push({ body_shape: Object.keys(body), ...result });
      if (result.ok) break;
    }

    const successful = attempts.find((attempt) => attempt.ok) || null;
    const serialized = JSON.stringify(successful?.data || {});
    const hasSecrets = /sk_live_|sk_test_|whsec_|VAPI_WEBHOOK_SECRET|GHL_API_KEY|STRIPE_SECRET|STRIPE_API_KEY/i.test(serialized);
    const leadToolFirstIndex = serialized.indexOf('create_ai_qualified_lead');
    const checkoutToolIndex = serialized.indexOf('create_checkout_for_qualified_lead');
    const leadToolCalledFirst = leadToolFirstIndex >= 0 && checkoutToolIndex >= 0 && leadToolFirstIndex < checkoutToolIndex;
    const checkoutLinkMatch = serialized.match(/https:\/\/checkout\.stripe\.com[^"\\\s]*/);

    return Response.json({
      success: !!successful,
      confirmation_sent: !!successful,
      confirmation_message: input,
      chat_status: successful?.status || null,
      chat_id: successful?.data?.id || successful?.data?.chat?.id || null,
      lead_tool_called_first_detected: leadToolCalledFirst,
      checkout_tool_detected: checkoutToolIndex >= 0,
      checkout_link_detected: !!checkoutLinkMatch,
      checkout_link: checkoutLinkMatch?.[0] || null,
      secrets_detected_in_response: hasSecrets,
      attempts,
    }, { status: 200 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 200 });
  }
});