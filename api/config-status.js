const GROUPS = {
  supabase: ['VITE_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'],
  stripe: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'STRIPE_STARTER_SETUP_PRICE_ID', 'STRIPE_STARTER_PRICE_ID', 'STRIPE_GROWTH_SETUP_PRICE_ID', 'STRIPE_GROWTH_PRICE_ID'],
  vapi: ['VITE_VAPI_PUBLIC_KEY', 'VITE_VAPI_ASSISTANT_ID', 'VAPI_WEBHOOK_SECRET'],
  ghl: ['GHL_API_KEY', 'GHL_LOCATION_ID'],
  email: ['RESEND_API_KEY', 'RESEND_FROM_EMAIL', 'ADMIN_NOTIFICATION_EMAIL'],
  sms: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM_NUMBER', 'ADMIN_NOTIFICATION_PHONE']
};

function maskStatus(name) {
  const value = process.env[name];
  return {
    name,
    present: Boolean(value),
    length: value ? String(value).length : 0
  };
}

function groupStatus(names) {
  const vars = names.map(maskStatus);
  return {
    ready: vars.every((item) => item.present),
    missing: vars.filter((item) => !item.present).map((item) => item.name),
    variables: vars
  };
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const status = Object.fromEntries(Object.entries(GROUPS).map(([group, names]) => [group, groupStatus(names)]));

  return res.status(200).json({
    ok: true,
    service: 'assistantai-config-status',
    warning: 'This route reports presence only. It never returns secret values.',
    timestamp: new Date().toISOString(),
    status
  });
}
