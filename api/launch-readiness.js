import { requireAdmin } from './_native-auth.js';

const REQUIRED_FOR_PAYMENT_CUTOVER = [
  'VITE_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_STARTER_SETUP_PRICE_ID',
  'STRIPE_STARTER_PRICE_ID',
  'STRIPE_GROWTH_SETUP_PRICE_ID',
  'STRIPE_GROWTH_PRICE_ID'
];

const RECOMMENDED_FOR_LAUNCH = [
  'VAPI_WEBHOOK_SECRET',
  'ADMIN_NOTIFICATION_EMAIL',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'GHL_API_KEY',
  'GHL_LOCATION_ID'
];

function present(name) {
  return Boolean(process.env[name]);
}

function checkGroup(names) {
  return {
    ready: names.every(present),
    missing: names.filter((name) => !present(name)),
    present: names.filter(present)
  };
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!requireAdmin(req, res)) return;

  const critical = checkGroup(REQUIRED_FOR_PAYMENT_CUTOVER);
  const recommended = checkGroup(RECOMMENDED_FOR_LAUNCH);

  return res.status(200).json({
    launch_status: critical.ready ? 'PASS' : 'BLOCKED',
    payment_cutover_ready: critical.ready,
    recommended_integrations_ready: recommended.ready,
    blockers: critical.missing,
    recommended_missing: recommended.missing,
    rules: {
      can_accept_leads: present('VITE_SUPABASE_URL') && present('SUPABASE_SERVICE_ROLE_KEY'),
      can_create_stripe_checkout: present('STRIPE_SECRET_KEY'),
      can_process_paid_checkout: present('STRIPE_WEBHOOK_SECRET') && present('SUPABASE_SERVICE_ROLE_KEY'),
      can_secure_vapi_tool_calls: present('VAPI_WEBHOOK_SECRET'),
      can_send_email_notifications: present('RESEND_API_KEY') && present('RESEND_FROM_EMAIL') && present('ADMIN_NOTIFICATION_EMAIL'),
      can_sync_ghl: present('GHL_API_KEY') && present('GHL_LOCATION_ID')
    },
    timestamp: new Date().toISOString()
  });
}
