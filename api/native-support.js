function getConfig() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server configuration missing');
  return { url, key };
}

function headers(key) {
  return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=representation' };
}

function encode(value) {
  return encodeURIComponent(String(value ?? ''));
}

async function db(table, { method = 'GET', query = '', body } = {}) {
  const { url, key } = getConfig();
  const path = query ? `${table}?${query}` : table;
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: headers(key),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.message || data?.error || response.statusText || 'Database request failed');
  return data;
}

function first(rows) {
  return Array.isArray(rows) ? rows[0] || null : rows;
}

async function listConversations(payload) {
  const clientId = payload.clientAccountId || payload.client_id;
  const query = clientId ? `linked_client_id=eq.${encode(clientId)}&order=updated_at.desc` : 'order=updated_at.desc&limit=100';
  const conversations = await db('support_conversations', { query });
  return { conversations };
}

async function getConversation(payload) {
  if (!payload.conversationId) throw new Error('conversationId is required');
  const conversation = first(await db('support_conversations', { query: `id=eq.${encode(payload.conversationId)}&limit=1` }));
  const messages = await db('support_messages', { query: `conversation_id=eq.${encode(payload.conversationId)}&order=created_at.asc` });
  return { conversation, messages };
}

async function startConversation(payload) {
  const now = new Date().toISOString();
  const subject = String(payload.subject || 'Client portal support request').trim();
  const messageBody = String(payload.message || '').trim();
  if (!subject || !messageBody) throw new Error('subject and message are required');

  const conversation = first(await db('support_conversations', {
    method: 'POST',
    body: [{
      created_at: now,
      updated_at: now,
      status: 'waiting_on_admin',
      source_type: 'client_portal',
      source_page: payload.sourcePage || '/ClientPortal',
      visitor_name: payload.name || 'Client',
      visitor_email: payload.email || null,
      subject,
      linked_client_id: payload.clientAccountId || payload.client_id || null,
      priority: 'normal',
      ai_mode: 'human_required',
      ai_summary: messageBody.slice(0, 180),
    }],
  }));

  const message = first(await db('support_messages', {
    method: 'POST',
    body: [{
      conversation_id: conversation.id,
      sender_role: 'client',
      sender_name: payload.name || 'Client',
      message: messageBody,
      metadata: { source_page: payload.sourcePage || '/ClientPortal' },
    }],
  }));

  return { conversation, messages: [message] };
}

async function replyConversation(payload) {
  if (!payload.conversationId) throw new Error('conversationId is required');
  const messageBody = String(payload.message || '').trim();
  if (!messageBody) throw new Error('message is required');

  const message = first(await db('support_messages', {
    method: 'POST',
    body: [{
      conversation_id: payload.conversationId,
      sender_role: payload.sender_role || 'client',
      sender_name: payload.name || 'Client',
      message: messageBody,
      metadata: { source_page: payload.sourcePage || '/ClientPortal' },
    }],
  }));

  await db('support_conversations', {
    method: 'PATCH',
    query: `id=eq.${encode(payload.conversationId)}`,
    body: { updated_at: new Date().toISOString(), status: 'waiting_on_admin' },
  });

  return { message };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    let data;
    if (body.action === 'listClientSupportConversations') data = await listConversations(body);
    else if (body.action === 'getClientSupportConversation') data = await getConversation(body);
    else if (body.action === 'startClientSupportConversation') data = await startConversation(body);
    else if (body.action === 'replyClientSupportConversation') data = await replyConversation(body);
    else return res.status(400).json({ success: false, error: 'Unsupported support action' });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Native support action failed', details: error.message });
  }
}
