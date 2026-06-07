import React, { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import SystemReadinessCard from '@/components/admin/system/SystemReadinessCard';

const baseReadinessItems = [
  {
    title: 'Lead Capture',
    status: 'live',
    lastUpdated: '20 Mar 2026',
    dependencies: ['Lead entity', 'shared lead capture helper', 'public enquiry forms'],
    notes: 'Public enquiry and strategy call forms save real Lead records, deduplicate by email/mobile, and append enquiry history.',
    nextAction: 'Monitor live submissions and add provider-side alerts if desired.',
  },
  {
    title: 'Booking Flow',
    status: 'partial',
    lastUpdated: '20 Mar 2026',
    dependencies: ['Lead capture flow', 'booking page', 'external booking URL'],
    notes: 'Booking requests save real lead intent and can hand off to a live booking URL, but the external calendar link is not connected yet.',
    nextAction: 'Add the real live booking URL in the booking config.',
  },
  {
    title: 'Authentication',
    status: 'live',
    lastUpdated: '20 Mar 2026',
    dependencies: ['Base44 auth', 'User role field'],
    notes: 'Client and admin access use real Base44 authentication rather than public demo gating.',
    nextAction: 'Keep assigning approved users through Team Access.',
  },
  {
    title: 'Client Portal Protection',
    status: 'live',
    lastUpdated: '20 Mar 2026',
    dependencies: ['User.client_account_id', 'entity RLS', 'ClientPortal access checks'],
    notes: 'Client users are blocked unless authenticated and linked to a client account, and portal entity reads are scoped to their own business records.',
    nextAction: 'Keep user-to-client links accurate when inviting portal users.',
  },
  {
    title: 'Onboarding Workflow',
    status: 'live',
    lastUpdated: '20 Mar 2026',
    dependencies: ['Onboarding entity', 'won lead automation', 'intake workflow'],
    notes: 'Won leads can move into onboarding automatically, intake data is saved, and admin/client access is linked to the correct onboarding record.',
    nextAction: 'Optionally add automated reminders for incomplete intake forms.',
  },
  {
    title: 'Billing',
    status: 'partial',
    lastUpdated: '20 Mar 2026',
    dependencies: ['BillingRecord entity', 'client billing UI', 'future Stripe wiring'],
    notes: 'Billing records, setup fee fields, monthly fee fields, and visibility are real, but Stripe charging, subscriptions, and webhooks are not connected yet.',
    nextAction: 'Connect Stripe live customer/subscription flows and webhook updates.',
  },
  {
    title: 'Integrations',
    status: 'partial',
    lastUpdated: '20 Mar 2026',
    dependencies: ['IntegrationConnection entity', 'portal/admin integrations UI'],
    notes: 'Integration state is stored for real, but provider connections are still request-driven rather than live OAuth/API-connected.',
    nextAction: 'Connect Google Calendar, Twilio, Stripe, and GoHighLevel in that order.',
  },
  {
    title: 'Notifications',
    status: 'partial',
    lastUpdated: '6 Jun 2026',
    dependencies: ['notification_logs table', '/api/notifications-send', 'Resend email', 'Twilio SMS'],
    notes: 'Business events can be sent through /api/notifications-send. The route requires Supabase notification logging first, then uses Resend email and Twilio SMS when providers are configured.',
    nextAction: 'Confirm VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are present in Vercel so notification logs can be stored before outbound provider delivery.',
  },
  {
    title: 'Analytics Data',
    status: 'partial',
    lastUpdated: '20 Mar 2026',
    dependencies: ['Lead entity', 'CallRecord entity', 'live analytics queries'],
    notes: 'Protected analytics now read from real Lead and CallRecord data when present, and show empty states when not; the public preview still uses labeled sample data.',
    nextAction: 'Ensure live CallRecord ingestion is connected for real portal analytics.',
  },
  {
    title: 'Empty State / Sample State Audit',
    status: 'live',
    lastUpdated: '20 Mar 2026',
    dependencies: ['portal empty states', 'public preview labels', 'proof guardrails'],
    notes: 'Protected areas now avoid fake live numbers when data is missing, and public preview areas are labeled clearly as sample/demo content.',
    nextAction: 'Continue reviewing new pages so proof and preview language stays honest.',
  },
];

function buildNotificationItem(baseItem, configStatus) {
  const providers = configStatus?.status?.notifications?.providers;
  if (!providers) return baseItem;

  const inAppReady = providers.in_app === 'ready';
  const emailReady = providers.email === 'ready';
  const smsReady = providers.sms === 'ready';
  const outboundReady = emailReady || smsReady;
  const status = inAppReady && outboundReady ? 'live' : 'partial';

  let notes = '';
  let nextAction = '';

  if (!inAppReady) {
    notes = `Outbound provider variables are detected (${emailReady ? 'Resend email ready' : 'email not configured'}; ${smsReady ? 'Twilio SMS ready' : 'SMS not configured'}), but notification logging is not configured. /api/notifications-send requires Supabase logging before it can complete delivery.`;
    nextAction = 'Add or fix VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel, then redeploy and retest /api/config-status.';
  } else if (outboundReady) {
    notes = `Notification logging is live. ${emailReady ? 'Resend email delivery is configured. ' : 'Email is not configured. '}${smsReady ? 'Twilio SMS delivery is configured.' : 'SMS remains stored-only until Twilio values are added.'}`;
    nextAction = smsReady && emailReady
      ? 'Monitor delivery logs and provider failure rates after live events fire.'
      : emailReady
        ? 'Email is ready. Add SMS only after phone/SMS provider verification is complete.'
        : 'SMS is ready. Add Resend for email delivery if admin email notifications are required.';
  } else {
    notes = 'Notification logging is live, but outbound email/SMS providers are not fully configured yet. Events will still be stored for admin tracking.';
    nextAction = 'Add RESEND_API_KEY, RESEND_FROM_EMAIL, and ADMIN_NOTIFICATION_EMAIL in Vercel to activate live email notifications.';
  }

  return {
    ...baseItem,
    status,
    dependencies: [
      `In-app log: ${inAppReady ? 'ready' : 'not configured'}`,
      `Email provider: ${emailReady ? 'Resend ready' : 'not configured'}`,
      `SMS provider: ${smsReady ? 'Twilio ready' : 'not configured'}`,
    ],
    notes,
    nextAction,
  };
}

export default function SystemReadiness() {
  const [configStatus, setConfigStatus] = useState(null);

  useEffect(() => {
    let active = true;
    async function loadConfigStatus() {
      try {
        const response = await fetch('/api/config-status');
        const data = await response.json();
        if (active && response.ok) setConfigStatus(data);
      } catch (error) {
        console.warn('System readiness config status unavailable:', error?.message || error);
      }
    }
    loadConfigStatus();
    return () => { active = false; };
  }, []);

  const readinessItems = useMemo(() => baseReadinessItems.map((item) => (
    item.title === 'Notifications' ? buildNotificationItem(item, configStatus) : item
  )), [configStatus]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">System Readiness</Badge>
            <Badge className="bg-white/5 text-gray-300 border-white/10">Internal operational status</Badge>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Live vs Prepared System Status</h2>
          <p className="text-gray-400 max-w-3xl">A single internal view of what is truly live, what is partially wired, and what still needs external provider connections before full client delivery.</p>
        </div>
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        {readinessItems.map((item) => (
          <SystemReadinessCard key={item.title} item={item} />
        ))}
      </div>
    </div>
  );
}
