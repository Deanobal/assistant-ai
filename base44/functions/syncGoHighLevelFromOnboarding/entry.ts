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

async function updateOpportunity(headers, locationId, contactId, onboarding) {
  const payload = {
    locationId,
    contactId,
    status: 'open',
    title: `${clean(onboarding.client_name) || clean(onboarding.contact_name) || 'Client'} Onboarding`,
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
    const onboarding = payload?.data;
    if (!onboarding?.id || onboarding.onboarding_stage !== 'Live') {
      return Response.json({ skipped: true, reason: 'Onboarding not completed' });
    }

    const { token, locationId, headers } = getHeaders();
    if (!token || !locationId) {
      return Response.json({ error: 'GoHighLevel secrets are missing' }, { status: 500 });
    }

    const clientMatches = onboarding.client_account_id
      ? await base44.asServiceRole.entities.ClientAccount.filter({ id: onboarding.client_account_id }, '-updated_date', 1)
      : [];
    const client = clientMatches[0] || null;
    const contactId = client?.crm_contact_id || null;

    if (!contactId) {
      return Response.json({ skipped: true, reason: 'No CRM contact linked yet' });
    }

    await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        locationId,
        firstName: clean(onboarding.contact_name) || clean(client?.contact_name) || 'Client',
        lastName: clean(onboarding.client_name) || clean(client?.business_name),
        name: clean(onboarding.contact_name) || clean(client?.contact_name) || clean(onboarding.client_name),
        email: clean(onboarding.email) || clean(client?.email) || undefined,
        phone: normalizePhone(onboarding.mobile) || normalizePhone(client?.phone) || undefined,
        companyName: clean(onboarding.client_name) || clean(client?.business_name) || undefined,
        tags: ['AssistantAI', 'Onboarding Complete'],
      }),
    });

    await updateOpportunity(headers, locationId, contactId, onboarding);

    const syncedAt = new Date().toISOString();
    await base44.asServiceRole.entities.ClientAccount.update(client.id, {
      ...client,
      crm_last_synced_at: syncedAt,
    });

    return Response.json({ success: true, contact_id: contactId, synced_at: syncedAt });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});