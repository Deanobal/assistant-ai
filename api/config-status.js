import { requireAdmin } from './_native-auth.js';

const GROUPS = {
  supabase: ['VITE_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'],
  stripe: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'STRIPE_STARTER_SETUP_PRICE_ID', 'STRIPE_STARTER_PRICE_ID', 'STRIPE_GROWTH_SETUP_PRICE_ID', 'STRIPE_GROWTH_PRICE_ID'],
  vapi: ['VITE_VAPI_PUBLIC_KEY', 'VITE_VAPI_ASSISTANT_ID', 'VAPI_WEBHOOK_SECRET'],
  ghl: ['GHL_API_KEY', 'GHL_LOCATION_ID'],
  email: ['RESEND_API_KEY', 'RESEND_FROM_EMAIL', 'ADMIN_NOTIFICATION_EMAIL'],
  sms: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM_NUMBER', 'ADMIN_NOTIFICATION_PHONE'],
  notifications: ['VITE_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'ADMIN_NOTIFICATION_EMAIL'],
  google_calendar: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN']
};

const ENV_ALIASES = {
  GOOGLE_CLIENT_ID: ['GOOGLE_CLIENT_ID', 'GOOGLE_OAUTH_CLIENT_ID'],
  GOOGLE_CLIENT_SECRET: ['GOOGLE_CLIENT_SECRET', 'GOOGLE_OAUTH_CLIENT_SECRET'],
  GOOGLE_REFRESH_TOKEN: ['GOOGLE_REFRESH_TOKEN', 'GOOGLE_OAUTH_REFRESH_TOKEN']
};

function rawValue(name) {
  return String(process.env[name] || '').trim();
}

function valueFor(name) {
  const aliases = ENV_ALIASES[name] || [name];
  for (const alias of aliases) {
    const value = rawValue(alias);
    if (value) return value;
  }
  return '';
}

function sourceFor(name) {
  const aliases = ENV_ALIASES[name] || [name];
  for (const alias of aliases) {
    if (rawValue(alias)) return alias;
  }
  return name;
}

function maskStatus(name) {
  const value = valueFor(name);
  return {
    name,
    source_name: sourceFor(name),
    present: Boolean(value),
    length: value.length,
    valid: isVariableValid(name, value)
  };
}

function isVariableValid(name, value) {
  if (!value) return false;
  if (name === 'VITE_SUPABASE_URL') {
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'https:' && parsed.hostname.endsWith('.supabase.co');
    } catch (_error) {
      return false;
    }
  }
  if (name === 'SUPABASE_SERVICE_ROLE_KEY') {
    return value.startsWith('eyJ') && value.length > 150;
  }
  if (name === 'RESEND_FROM_EMAIL' || name === 'ADMIN_NOTIFICATION_EMAIL') {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
  if (name === 'TWILIO_FROM_NUMBER' || name === 'ADMIN_NOTIFICATION_PHONE') {
    return /^\+?[0-9]{8,15}$/.test(value.replace(/\s+/g, ''));
  }
  if (name === 'GOOGLE_CLIENT_ID') {
    return value.includes('.apps.googleusercontent.com');
  }
  if (name === 'GOOGLE_CLIENT_SECRET') {
    return value.length >= 20;
  }
  if (name === 'GOOGLE_REFRESH_TOKEN') {
    return value.length >= 40;
  }
  return true;
}

function groupStatus(names) {
  const vars = names.map(maskStatus);
  return {
    ready: vars.every((item) => item.present && item.valid),
    missing: vars.filter((item) => !item.present).map((item) => item.name),
    invalid: vars.filter((item) => item.present && !item.valid).map((item) => item.name),
    variables: vars
  };
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!requireAdmin(req, res)) return;

  const status = Object.fromEntries(Object.entries(GROUPS).map(([group, names]) => [group, groupStatus(names)]));

  status.notifications.ready = status.notifications.ready && (status.email.ready || status.sms.ready || Boolean(rawValue('ADMIN_NOTIFICATION_EMAIL')));
  status.notifications.providers = {
    in_app: status.supabase.ready ? 'ready' : 'not_configured',
    email: status.email.ready ? 'ready' : 'not_configured',
    sms: status.sms.ready ? 'ready' : 'not_configured'
  };

  status.booking = {
    ready: status.supabase.ready && status.google_calendar.ready,
    providers: {
      lead_storage: status.supabase.ready ? 'supabase' : 'not_configured',
      calendar: status.google_calendar.ready ? 'google_calendar_native' : 'not_configured'
    },
    calendar_email: 'sales@assistantai.com.au'
  };

  return res.status(200).json({
    ok: true,
    service: 'assistantai-config-status',
    runtime: 'native-vercel-supabase',
    warning: 'This route reports presence and validity only. It never returns secret values.',
    timestamp: new Date().toISOString(),
    status
  });
}
