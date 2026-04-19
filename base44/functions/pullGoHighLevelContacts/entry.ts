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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { token, locationId, headers } = getHeaders();
    if (!token || !locationId) {
      return Response.json({ error: 'GoHighLevel secrets are missing' }, { status: 500 });
    }

    const response = await fetch(`https://services.leadconnectorhq.com/contacts/?locationId=${locationId}&limit=100`, { headers });
    const data = await response.json();
    const contacts = data.contacts || [];
    const syncedAt = new Date().toISOString();
    const updates = [];

    for (const contact of contacts) {
      const email = clean(contact.email).toLowerCase();
      const phone = normalizePhone(contact.phone);
      const leads = email ? await base44.asServiceRole.entities.Lead.filter({ email }, '-updated_date', 1) : [];
      const clients = email ? await base44.asServiceRole.entities.Client.filter({ email }, '-updated_date', 1) : [];
      const lead = leads[0] || null;
      const client = clients[0] || null;

      if (lead) {
        await base44.asServiceRole.entities.Lead.update(lead.id, {
          ...lead,
          full_name: clean(contact.name) || lead.full_name,
          mobile_number: phone || lead.mobile_number,
          business_name: clean(contact.companyName) || lead.business_name,
          crm_contact_id: contact.id,
          crm_last_synced_at: syncedAt,
        });
        updates.push({ entity: 'Lead', id: lead.id, contact_id: contact.id });
      }

      if (client) {
        await base44.asServiceRole.entities.Client.update(client.id, {
          ...client,
          full_name: clean(contact.name) || client.full_name,
          mobile_number: phone || client.mobile_number,
          business_name: clean(contact.companyName) || client.business_name,
          crm_contact_id: contact.id,
          crm_last_synced_at: syncedAt,
        });
        updates.push({ entity: 'Client', id: client.id, contact_id: contact.id });
      }
    }

    return Response.json({ success: true, synced_at: syncedAt, updates });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});