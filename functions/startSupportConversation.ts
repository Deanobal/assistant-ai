import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

function buildSubject(sourcePage, name) {
  const pageLabel = (sourcePage || '/').replace('/', '') || 'home';
  return `Website message from ${name} (${pageLabel})`;
}

function uniqueById(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { name, email, mobile, message, sourcePage, runtimeDataEnv } = await req.json();

    if (runtimeDataEnv === 'dev') {
      return Response.json({ error: 'Support messaging is disabled in preview test mode so test actions do not write into production data.' }, { status: 409 });
    }

    if (!name || !email || !message) {
      return Response.json({ error: 'name, email, and message are required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const preview = message.slice(0, 180);
    const byEmail = email ? await base44.asServiceRole.entities.Lead.filter({ email }, '-updated_date', 10) : [];
    const byMobile = mobile ? await base44.asServiceRole.entities.Lead.filter({ mobile_number: mobile }, '-updated_date', 10) : [];
    const matchedLeads = uniqueById([...byEmail, ...byMobile]);
    const matchedLead = matchedLeads.length === 1 ? matchedLeads[0] : null;

    const conversation = await base44.asServiceRole.entities.SupportConversation.create({
      created_at: now,
      updated_at: now,
      status: 'new',
      source_type: 'public_site',
      source_page: sourcePage || '/',
      visitor_name: name,
      visitor_email: email,
      visitor_phone: mobile || '',
      subject: buildSubject(sourcePage, name),
      assigned_admin_id: null,
      linked_lead_id: matchedLead?.id || null,
      linked_client_account_id: matchedLead?.client_account_id || null,
      unread_for_admin: true,
      unread_for_client: false,
      last_message_at: now,
      last_message_preview: preview,
      priority: 'normal',
    });

    const firstMessage = await base44.asServiceRole.entities.SupportMessage.create({
      conversation_id: conversation.id,
      sender_type: 'visitor',
      sender_user_id: null,
      sender_name: name,
      sender_email: email,
      message_body: message,
      attachment_url: null,
      created_at: now,
      is_internal_note: false,
    });

    await base44.asServiceRole.entities.NotificationLog.create({
      event_type: 'support_conversation_created',
      entity_name: 'SupportConversation',
      entity_id: conversation.id,
      client_account_id: conversation.linked_client_account_id || null,
      recipient_role: 'admin',
      recipient_email: null,
      channel: 'in_app',
      delivery_status: 'stored',
      provider_name: 'SupportChat',
      provider_message: 'Stored for internal admin review. No external delivery configured yet.',
      title: 'New public support conversation',
      message: `${name} started a new support conversation from ${sourcePage || '/'}.`,
      triggered_at: now,
      actor_email: email,
      metadata: {
        conversation_id: conversation.id,
        source_page: sourcePage || '/',
        linked_lead_id: conversation.linked_lead_id || null,
      },
    });

    return Response.json({
      conversation,
      messages: [firstMessage],
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});