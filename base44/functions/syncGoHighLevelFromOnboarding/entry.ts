import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function clean(value) {
  return String(value || '').trim();
}

function normalizePhone(value) {
  return clean(value).replace(/\s+/g, '');
}

function getHeaders() {
  const token = clean(Deno.env.get('GHL_API_KEY'));
  const locationId = clean(Deno.env.get('GHL_LOCATION_ID'));
  return {
    token,
    locationId,
    headers: {
      Authorization: `Bearer ${token}`,
      Version: '2021-07-28',
      'Content-Type': 'application/json',
    },
  };
}

async function updateOpportunity(headers, locationId, contactId, client) {
  const payload = {
    locationId,
    contactId,
    status: 'open',
    title: `${clean(client.business_name) || clean(client.full_name) || 'Client'} Onboarding`,
    monetaryValue: 0,
  };

  await fetch('https://services.leadconnectorhq.com/opportunities/', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const payload = await req.json();
    const client = payload?.data;
    if (!client?.id || client.lifecycle_state !== 'live') {
      return Response.json({ skipped: true, reason: 'Client is not live' });
    }

    const { token, locationId, headers } = getHeaders();
    if (!token || !locationId) {
      return Response.json({ error: 'GoHighLevel secrets are missing' }, { status: 500 });
    }

    const contactId = client?.crm_contact_id || null;

    if (!contactId) {
      return Response.json({ skipped: true, reason: 'No CRM contact linked yet' });
    }

    await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        locationId,
        firstName: clean(client.full_name) || 'Client',
        lastName: clean(client.business_name),
        name: clean(client.full_name) || clean(client.business_name),
        email: clean(client.email) || undefined,
        phone: normalizePhone(client.mobile_number) || undefined,
        companyName: clean(client.business_name) || undefined,
        tags: ['AssistantAI', 'Client Live'],
      }),
    });

    await updateOpportunity(headers, locationId, contactId, client);

    const syncedAt = new Date().toISOString();
    await base44.asServiceRole.entities.Client.update(client.id, {
      ...client,
      crm_last_synced_at: syncedAt,
    });

    return Response.json({ success: true, contact_id: contactId, synced_at: syncedAt });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});