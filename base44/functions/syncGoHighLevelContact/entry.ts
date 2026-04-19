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

async function searchContact(headers, locationId, email, phone) {
  if (email) {
    const response = await fetch(`https://services.leadconnectorhq.com/contacts/search/duplicate?locationId=${locationId}&email=${encodeURIComponent(email)}`, { headers });
    const data = await response.json();
    if (data?.contact?.id) return data.contact;
  }
  if (phone) {
    const response = await fetch(`https://services.leadconnectorhq.com/contacts/search/duplicate?locationId=${locationId}&number=${encodeURIComponent(phone)}`, { headers });
    const data = await response.json();
    if (data?.contact?.id) return data.contact;
  }
  return null;
}

async function upsertContact(headers, locationId, record) {
  const email = clean(record.email);
  const phone = normalizePhone(record.mobile_number || record.phone);
  const fullName = clean(record.full_name || record.contact_name);
  const [firstName, ...rest] = fullName.split(' ');
  const lastName = rest.join(' ');
  const existing = await searchContact(headers, locationId, email, phone);

  const payload = {
    locationId,
    firstName: firstName || clean(record.business_name) || 'Contact',
    lastName: lastName || clean(record.business_name),
    name: fullName || clean(record.business_name),
    email: email || undefined,
    phone: phone || undefined,
    companyName: clean(record.business_name) || undefined,
    source: 'AssistantAI',
    tags: [record.status || 'AssistantAI'],
    customFields: [],
  };

  if (existing?.id) {
    const response = await fetch(`https://services.leadconnectorhq.com/contacts/${existing.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return data.contact || existing;
  }

  const response = await fetch('https://services.leadconnectorhq.com/contacts/', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  return data.contact;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { entityName, recordId } = await req.json();
    if (!entityName || !recordId) {
      return Response.json({ error: 'entityName and recordId are required' }, { status: 400 });
    }

    const { token, locationId, headers } = getHeaders();
    if (!token || !locationId) {
      return Response.json({ error: 'GoHighLevel secrets are missing' }, { status: 500 });
    }

    const matches = await base44.asServiceRole.entities[entityName].filter({ id: recordId }, '-updated_date', 1);
    const record = matches[0];
    if (!record) {
      return Response.json({ error: 'Record not found' }, { status: 404 });
    }

    const contact = await upsertContact(headers, locationId, record);
    const syncedAt = new Date().toISOString();

    await base44.asServiceRole.entities[entityName].update(record.id, {
      ...record,
      crm_contact_id: contact?.id || record.crm_contact_id || null,
      crm_last_synced_at: syncedAt,
    });

    return Response.json({ success: true, contact_id: contact?.id || null, synced_at: syncedAt });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});