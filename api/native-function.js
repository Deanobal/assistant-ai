async function callInternal(req, route, payload) {
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  const response = await fetch(`${protocol}://${host}${route}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: req.headers.cookie || '' },
    body: JSON.stringify(payload || {}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.details || data.error || `Native route failed: ${route}`);
  return data.data ?? data;
}

const ROUTES = {
  listClientSupportConversations: '/api/native-support',
  getClientSupportConversation: '/api/native-support',
  startClientSupportConversation: '/api/native-support',
  replyClientSupportConversation: '/api/native-support',
  sendLeadSmsReply: '/api/native-lead-actions',
  convertWonLeadToOnboarding: '/api/native-lead-actions',
  manualMatchUnmatchedSms: '/api/native-lead-actions',
  createCampaign: '/api/native-campaigns',
  sendCampaign: '/api/native-campaigns',
  getOneSignalConfig: '/api/native-config',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const name = String(body.name || '').trim();
    const route = ROUTES[name];
    if (!route) return res.status(400).json({ success: false, error: `Unsupported native function: ${name}` });

    const data = await callInternal(req, route, { action: name, ...(body.payload || {}) });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Native function failed', details: error.message });
  }
}
