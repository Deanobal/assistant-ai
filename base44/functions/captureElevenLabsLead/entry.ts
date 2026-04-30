import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  // --- Security: validate webhook secret ---
  const expectedSecret = Deno.env.get('ELEVENLABS_WEBHOOK_SECRET');
  const providedSecret = req.headers.get('x-webhook-secret');

  if (!expectedSecret || !providedSecret || providedSecret !== expectedSecret) {
    return Response.json({ error: 'Unauthorized: invalid or missing x-webhook-secret header' }, { status: 401 });
  }

  // --- Parse body ---
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const {
    full_name,
    phone,
    email = null,
    business_name = null,
    service_needed,
    urgency = 'medium',
    preferred_callback_time = null,
    lead_source = 'ElevenLabs website demo',
    conversation_summary = null,
  } = body;

  // --- Validation ---
  if (!full_name || !full_name.trim()) {
    return Response.json({ error: 'full_name is required' }, { status: 400 });
  }
  if (!phone || !phone.trim()) {
    return Response.json({ error: 'phone is required' }, { status: 400 });
  }
  if (!service_needed || !service_needed.trim()) {
    return Response.json({ error: 'service_needed is required' }, { status: 400 });
  }

  // --- Build notes field ---
  const notesParts = [];
  if (conversation_summary) notesParts.push(`Summary: ${conversation_summary}`);
  if (service_needed) notesParts.push(`Service needed: ${service_needed}`);
  if (urgency) notesParts.push(`Urgency: ${urgency}`);
  if (preferred_callback_time) notesParts.push(`Preferred callback: ${preferred_callback_time}`);
  const notes = notesParts.join('\n');

  // --- Create Lead in Base44 ---
  const base44 = createClientFromRequest(req);

  let leadId;
  try {
    const lead = await base44.asServiceRole.entities.Lead.create({
      full_name: full_name.trim(),
      mobile_number: phone.trim(),
      email: email || undefined,
      business_name: business_name || undefined,
      source_page: lead_source,
      status: 'New Lead',
      notes,
      message: service_needed.trim(),
    });
    leadId = lead.id;
  } catch (err) {
    return Response.json({ error: `Failed to create lead: ${err.message}` }, { status: 500 });
  }

  // --- GoHighLevel sync (optional) ---
  const ghlApiKey = Deno.env.get('GHL_API_KEY');
  const ghlLocationId = Deno.env.get('GHL_LOCATION_ID');

  if (!ghlApiKey || !ghlLocationId) {
    // GHL not configured — return success without sync
    return Response.json({
      success: true,
      lead_id: leadId,
      next_step: 'Lead captured. The team will contact the caller shortly.',
    });
  }

  // Try GHL sync — never let it break the response
  let ghlWarning = null;
  let ghlResponseBody = null;
  try {
    const nameParts = full_name.trim().split(' ');
    const ghlPayload = {
      locationId: ghlLocationId,
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(' ') || '',
      phone: phone.trim(),
      ...(email ? { email } : {}),
      source: 'ElevenLabs website demo',
      tags: ['Website Lead', 'ElevenLabs Demo', 'AssistantAI'],
    };

    const ghlRes = await fetch('https://services.leadconnectorhq.com/contacts/upsert', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ghlApiKey}`,
        Version: '2021-07-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ghlPayload),
    });

    ghlResponseBody = await ghlRes.json().catch(() => null);

    if (!ghlRes.ok) {
      ghlWarning = `GoHighLevel sync failed (${ghlRes.status}): ${JSON.stringify(ghlResponseBody)}`;
    } else if (notes && ghlResponseBody?.contact?.id) {
      // Add a note with the conversation summary
      const ghlContactId = ghlResponseBody.contact.id;
      await fetch(`https://services.leadconnectorhq.com/contacts/${ghlContactId}/notes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ghlApiKey}`,
          Version: '2021-07-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: notes }),
      });
    }
  } catch (err) {
    ghlWarning = `GoHighLevel sync failed: ${err.message}`;
  }

  if (ghlWarning) {
    return Response.json({
      success: true,
      lead_id: leadId,
      warning: 'Lead saved but GoHighLevel sync failed.',
      ghl_error: ghlWarning,
      ghl_response: ghlResponseBody,
      next_step: 'Lead captured. The team will contact the caller shortly.',
    });
  }

  return Response.json({
    success: true,
    lead_id: leadId,
    next_step: 'Lead captured. The team will contact the caller shortly.',
  });
});