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
  try {
    const ghlBaseUrl = 'https://rest.gohighlevel.com/v1';

    // Search for existing contact by phone or email
    let existingContactId = null;

    const searchParams = new URLSearchParams({ locationId: ghlLocationId, query: phone.trim() });
    const searchRes = await fetch(`${ghlBaseUrl}/contacts/search?${searchParams}`, {
      headers: {
        Authorization: `Bearer ${ghlApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const contacts = searchData?.contacts || [];
      if (contacts.length > 0) {
        existingContactId = contacts[0].id;
      }
    }

    const ghlPayload = {
      locationId: ghlLocationId,
      firstName: full_name.trim().split(' ')[0],
      lastName: full_name.trim().split(' ').slice(1).join(' ') || '',
      phone: phone.trim(),
      ...(email ? { email } : {}),
      ...(business_name ? { companyName: business_name } : {}),
      source: 'ElevenLabs website demo',
      tags: ['Website Lead', 'ElevenLabs Demo', 'AssistantAI'],
      customField: [
        { key: 'service_needed', field_value: service_needed },
        { key: 'urgency', field_value: urgency },
        { key: 'preferred_callback_time', field_value: preferred_callback_time || '' },
        { key: 'conversation_summary', field_value: conversation_summary || '' },
      ],
    };

    let ghlRes;
    if (existingContactId) {
      ghlRes = await fetch(`${ghlBaseUrl}/contacts/${existingContactId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${ghlApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ghlPayload),
      });
    } else {
      ghlRes = await fetch(`${ghlBaseUrl}/contacts/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ghlApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ghlPayload),
      });
    }

    if (!ghlRes.ok) {
      const errText = await ghlRes.text();
      ghlWarning = `GoHighLevel sync failed (${ghlRes.status}): ${errText}`;
    } else {
      // Add a note to the GHL contact with the full summary
      const ghlData = await ghlRes.json();
      const ghlContactId = existingContactId || ghlData?.contact?.id;
      if (ghlContactId && notes) {
        await fetch(`${ghlBaseUrl}/contacts/${ghlContactId}/notes`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${ghlApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ body: notes, userId: ghlContactId }),
        });
      }
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
      next_step: 'Lead captured. The team will contact the caller shortly.',
    });
  }

  return Response.json({
    success: true,
    lead_id: leadId,
    next_step: 'Lead captured. The team will contact the caller shortly.',
  });
});