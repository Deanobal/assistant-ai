Deno.serve(async () => {
  try {
    const apiKey = Deno.env.get('VAPI_API_KEY') || '';
    const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
    const assistantId = 'cbd73d14-2515-4633-a01c-928b3ccdbadb';
    const previousChatId = 'f5f3c4a2-b303-48ba-9055-38ef382510b4';
    const input = 'Yes, please create the secure checkout link now.';

    const bodies = [
      { assistantId, previousChatId, input },
      { assistantId, previousChatId, message: input },
      { assistantId, previousChatId, messages: [{ role: 'user', content: input }] },
    ];

    const attempts = [];
    for (const body of bodies) {
      const res = await fetch('https://api.vapi.ai/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { raw: text }; }
      attempts.push({ status: res.status, ok: res.ok, body_shape: Object.keys(body), data });
    }

    const serialized = JSON.stringify(attempts);
    const checkoutLinkMatch = serialized.match(/https:\/\/checkout\.stripe\.com[^"\\\s]*/);
    const secretLeakDetected = /sk_live_|sk_test_|whsec_|GHL_API_KEY|STRIPE_SECRET|STRIPE_API_KEY|VAPI_WEBHOOK_SECRET/i.test(serialized);

    const successfulAttempts = attempts.filter((attempt) => attempt.ok);
    const outputText = successfulAttempts.map((attempt) => JSON.stringify(attempt.data?.output || [])).join('\n');
    const leadToolIndex = outputText.indexOf('create_ai_qualified_lead');
    const checkoutToolIndex = outputText.indexOf('create_checkout_for_qualified_lead');

    return Response.json({
      success: attempts.some((a) => a.ok),
      confirmation_message: input,
      previousChatId,
      successful_attempt_count: successfulAttempts.length,
      chat_ids: successfulAttempts.map((attempt) => attempt.data?.id),
      lead_tool_called: leadToolIndex >= 0,
      checkout_tool_called: checkoutToolIndex >= 0,
      lead_tool_called_first: leadToolIndex >= 0 && checkoutToolIndex >= 0 && leadToolIndex < checkoutToolIndex,
      checkout_link_detected: !!checkoutLinkMatch,
      checkout_link: checkoutLinkMatch?.[0] || null,
      secret_leak_detected: secretLeakDetected,
      contains_success_true: serialized.includes('"success":true'),
      contains_lead_id: serialized.includes('lead_id'),
      contains_selected_starter: serialized.includes('Starter'),
      response_preview: outputText.slice(0, 2500),
    }, { status: 200 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 200 });
  }
});