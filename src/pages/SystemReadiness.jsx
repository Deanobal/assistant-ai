import React, { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import SystemReadinessCard from '@/components/admin/system/SystemReadinessCard';

const READINESS_LAST_UPDATED = '12 Jun 2026';
const SALES_CALENDAR_ID = 'sales@assistantai.com.au';

function providerState(group) {
  if (!group) return 'not connected';
  return group.ready ? 'ready' : 'action needed';
}

function missingList(group) {
  const missing = group?.missing || [];
  const invalid = group?.invalid || [];
  const issues = [...missing, ...invalid.map((item) => `${item} invalid`)];
  return issues.length ? issues.join(', ') : 'none';
}

function buildReadinessItems(configStatus) {
  const status = configStatus?.status || {};
  const supabaseReady = Boolean(status.supabase?.ready);
  const stripeReady = Boolean(status.stripe?.ready);
  const vapiReady = Boolean(status.vapi?.ready || status.vapi_public?.ready);
  const ghlReady = Boolean(status.ghl?.ready);
  const emailReady = Boolean(status.email?.ready);
  const smsReady = Boolean(status.sms?.ready);
  const notificationsReady = Boolean(status.notifications?.ready || (supabaseReady && (emailReady || smsReady)));
  const googleReady = Boolean(status.google_acquisition?.ready || status.google_oauth?.ready || status.google_service_account?.ready);
  const adminAiReady = Boolean(status.admin_ai?.ready || status.admin_ai_groq?.ready || status.admin_ai_openai?.ready);
  const crispReady = Boolean(status.crisp?.ready);

  return [
    {
      title: 'Lead Capture',
      status: supabaseReady ? 'live' : 'action needed',
      lastUpdated: READINESS_LAST_UPDATED,
      dependencies: [
        `Supabase operational database: ${supabaseReady ? 'ready' : 'needs configuration'}`,
        'Lead-first capture model',
        'Public forms, demo flows, and CRM handoff records',
      ],
      notes: supabaseReady
        ? 'Lead capture is connected to the production data layer. Public enquiry, demo, contact, and signup flows can store real lead records instead of using demo-only state.'
        : `Lead capture requires the Supabase environment to be valid. Open items: ${missingList(status.supabase)}.`,
      nextAction: supabaseReady
        ? 'Monitor new submissions and confirm source_page values are being captured cleanly.'
        : 'Fix Supabase configuration in Vercel, redeploy, then retest Contact, Get Started, and demo capture.',
    },
    {
      title: 'Strategy Call / Booking Flow',
      status: supabaseReady ? 'live' : 'action needed',
      lastUpdated: READINESS_LAST_UPDATED,
      dependencies: [
        'Lead capture',
        'BookStrategyCall page',
        `Google Calendar target: ${SALES_CALENDAR_ID}`,
        'honest request-only fallback if live calendar access fails',
      ],
      notes: supabaseReady
        ? `The strategy-call path now targets ${SALES_CALENDAR_ID}. Live calendar slots are used when the Base44 Google Calendar connector can access that calendar; otherwise the page falls back to request-only mode without claiming a confirmed booking.`
        : 'The booking page should not be treated as ready until lead capture is configured, because the request needs somewhere reliable to save.',
      nextAction: supabaseReady
        ? 'Run one live /BookStrategyCall form test and confirm the created event appears on sales@assistantai.com.au.'
        : 'Restore lead capture first, then retest the strategy call form.',
    },
    {
      title: 'Sales Calendar Connection',
      status: supabaseReady ? 'ready' : 'action needed',
      lastUpdated: READINESS_LAST_UPDATED,
      dependencies: [
        `Calendar ID: ${SALES_CALENDAR_ID}`,
        'getCalendarAvailability function',
        'createStrategyCallBooking function',
        'onGoogleCalendarChange sync handler',
      ],
      notes: `The AssistantAI booking code now reads availability from ${SALES_CALENDAR_ID}, creates confirmed booking events on that calendar, and stores the calendar ID against the lead for follow-up and sync visibility.`,
      nextAction: 'Verify Base44 Google Calendar connector authorisation, then complete a website booking test from /BookStrategyCall.',
    },
    {
      title: 'Authentication',
      status: 'live',
      lastUpdated: READINESS_LAST_UPDATED,
      dependencies: ['Admin login gate', 'client portal shell', 'protected admin routes'],
      notes: 'Admin and client areas are separated from the public marketing site. Public visitors should not be able to trigger admin-only actions.',
      nextAction: 'Keep improving server-side session hardening, but do not block launch on cosmetic auth polish.',
    },
    {
      title: 'Client Portal Protection',
      status: 'ready',
      lastUpdated: READINESS_LAST_UPDATED,
      dependencies: ['ClientPortal route', 'ClientLogin route', 'client record linking fallback'],
      notes: 'The portal now opens cleanly without dead-ending users. If a live client record is not linked yet, the portal presents a safe provisional shell rather than a broken state.',
      nextAction: 'Finish live client record linking so the portal shows real billing, onboarding, and support data for paying clients.',
    },
    {
      title: 'Onboarding Workflow',
      status: supabaseReady ? 'ready' : 'action needed',
      lastUpdated: READINESS_LAST_UPDATED,
      dependencies: ['Client', 'OnboardingTask', 'IntakeForm', 'BillingStatus', 'IntegrationStatus', 'ClientNote'],
      notes: supabaseReady
        ? 'The readiness model reflects the canonical onboarding architecture: Client is the source of truth, with tasks, intake, billing, integrations, and notes as supporting records. No separate Onboarding entity should be treated as the operational source of truth.'
        : 'The onboarding workflow depends on Supabase. It cannot be verified as operational until the database configuration is valid.',
      nextAction: supabaseReady
        ? 'Run one manual Won Lead → Client → tasks/intake/billing/integration creation test after each major deployment.'
        : 'Restore Supabase access and rerun onboarding creation tests.',
    },
    {
      title: 'Billing / Stripe',
      status: stripeReady && supabaseReady ? 'live' : 'action needed',
      lastUpdated: READINESS_LAST_UPDATED,
      dependencies: [
        `Stripe configuration: ${providerState(status.stripe)}`,
        `Supabase records: ${supabaseReady ? 'ready' : 'needs configuration'}`,
        'Starter and Growth checkout flows',
      ],
      notes: stripeReady && supabaseReady
        ? 'Stripe and Supabase are configured for the commercial path: lead capture, checkout creation, payment webhook verification, billing status, and onboarding record creation.'
        : `Billing is blocked by configuration gaps. Stripe issues: ${missingList(status.stripe)}. Supabase issues: ${missingList(status.supabase)}.`,
      nextAction: stripeReady && supabaseReady
        ? 'Continue testing Starter and Growth checkout links after pricing or payment-page edits.'
        : 'Complete Stripe and Supabase configuration before treating payments as production-ready.',
    },
    {
      title: 'Voice Demo / Vapi',
      status: vapiReady ? 'ready' : 'action needed',
      lastUpdated: READINESS_LAST_UPDATED,
      dependencies: ['Vapi public key', 'Vapi assistant ID', 'browser microphone permission', 'tool-call handler'],
      notes: vapiReady
        ? 'The public voice demo is configured at the frontend level. It should be tested manually because browser microphone permission cannot be granted by server-side checks.'
        : `The Vapi frontend demo needs public configuration. Open items: ${missingList(status.vapi_public || status.vapi)}.`,
      nextAction: vapiReady
        ? 'Run a manual browser call test for Starter, Growth, and Enterprise routing. Add webhook-secret hardening if it is not already configured.'
        : 'Add Vapi public key and assistant ID in Vercel, redeploy, then test the demo button.',
    },
    {
      title: 'CRM / GoHighLevel',
      status: ghlReady ? 'ready' : 'action needed',
      lastUpdated: READINESS_LAST_UPDATED,
      dependencies: ['GHL API key', 'GHL location ID', 'lead/contact sync logic'],
      notes: ghlReady
        ? 'GoHighLevel credentials are present for lead/contact sync and CRM follow-up workflows.'
        : `GoHighLevel is not yet production-ready. Open items: ${missingList(status.ghl)}. This is not a launch blocker for the public site, but it is a fulfilment and follow-up blocker.`,
      nextAction: ghlReady
        ? 'Run a live lead push test and confirm duplicate prevention by email/phone.'
        : 'Add GHL credentials when CRM sync becomes the next fulfilment priority.',
    },
    {
      title: 'Notifications',
      status: notificationsReady ? 'ready' : 'action needed',
      lastUpdated: READINESS_LAST_UPDATED,
      dependencies: [
        `In-app log: ${supabaseReady ? 'ready' : 'needs Supabase'}`,
        `Email provider: ${emailReady ? 'ready' : 'not configured'}`,
        `SMS provider: ${smsReady ? 'ready' : 'not configured'}`,
      ],
      notes: notificationsReady
        ? 'Notification logging and at least one outbound/admin path are configured. Events can be tracked without relying only on someone watching the dashboard.'
        : 'Notifications still need either email or SMS provider configuration. Until then, events may be stored but not reliably pushed to an operator.',
      nextAction: notificationsReady
        ? 'Trigger a real contact/demo/signup event and confirm the alert lands in the expected admin channel.'
        : 'Configure Resend email first. SMS can come later through the chosen provider once verification is complete.',
    },
    {
      title: 'Analytics / Search Console',
      status: googleReady ? 'ready' : 'action needed',
      lastUpdated: READINESS_LAST_UPDATED,
      dependencies: ['GA4 property', 'Search Console property', 'Google OAuth refresh token or service account'],
      notes: googleReady
        ? 'GA4 and Search Console acquisition data can be pulled into the analytics layer. Search Console should use the domain property where available.'
        : 'Google acquisition reporting needs OAuth refresh-token or service-account credentials plus GA4 and Search Console identifiers.',
      nextAction: googleReady
        ? 'Monitor high-intent SEO pages for impressions, clicks, CTR, average position, and conversion intent.'
        : 'Finish Google acquisition credentials before relying on the analytics dashboard for SEO decisions.',
    },
    {
      title: 'Admin AI Copilot',
      status: adminAiReady ? 'ready' : 'action needed',
      lastUpdated: READINESS_LAST_UPDATED,
      dependencies: ['Groq or OpenAI provider', 'server-side admin AI route', 'safe admin action endpoint'],
      notes: adminAiReady
        ? 'The private admin AI layer has at least one configured model provider. It must remain admin-only and must not be exposed to public Crisp or client flows.'
        : 'Admin AI needs either Groq or OpenAI configured server-side.',
      nextAction: adminAiReady
        ? 'Keep destructive, pricing, billing, legal, and publishing actions blocked unless explicitly authorised.'
        : 'Add Groq or OpenAI server-side credentials in Vercel.',
    },
    {
      title: 'Crisp Public Chat',
      status: crispReady ? 'ready' : 'action needed',
      lastUpdated: READINESS_LAST_UPDATED,
      dependencies: ['Crisp widget', 'Crisp webhook secret', 'public sales/support prompt'],
      notes: crispReady
        ? 'Crisp can be used for public sales/support chat. It must not be allowed to trigger admin actions or expose private records.'
        : 'Crisp can still load as a chat widget, but webhook AI/lead automation needs the Crisp webhook secret configured.',
      nextAction: crispReady
        ? 'Run one live public chat test and verify lead capture/handoff behaviour.'
        : 'Add CRISP_WEBHOOK_SECRET before relying on Crisp automation.',
    },
    {
      title: 'Empty State / Sample State Audit',
      status: 'live',
      lastUpdated: READINESS_LAST_UPDATED,
      dependencies: ['portal empty states', 'public preview labels', 'proof guardrails'],
      notes: 'Protected areas should avoid fake live numbers when data is missing. Public preview/demo areas should be clearly labelled and should not impersonate real proof.',
      nextAction: 'Continue reviewing new admin and public pages so sample data never looks like fabricated production proof.',
    },
  ];
}

export default function SystemReadiness() {
  const [configStatus, setConfigStatus] = useState(null);
  const [checkedAt, setCheckedAt] = useState(null);

  useEffect(() => {
    let active = true;
    async function loadConfigStatus() {
      try {
        const response = await fetch('/api/config-status');
        const data = await response.json();
        if (active && response.ok) {
          setConfigStatus(data);
          setCheckedAt(data.timestamp || new Date().toISOString());
        }
      } catch (error) {
        console.warn('System readiness config status unavailable:', error?.message || error);
      }
    }
    loadConfigStatus();
    return () => { active = false; };
  }, []);

  const readinessItems = useMemo(() => buildReadinessItems(configStatus), [configStatus]);
  const counts = useMemo(() => readinessItems.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {}), [readinessItems]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">System Readiness</Badge>
            <Badge className="bg-white/5 text-gray-300 border-white/10">Internal operational status</Badge>
            {checkedAt && <Badge className="bg-green-500/10 text-green-300 border-green-500/20">Checked {new Date(checkedAt).toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' })}</Badge>}
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Production Readiness Status</h2>
          <p className="text-gray-400 max-w-3xl">A clean internal view of what is live, what is ready with honest fallback behaviour, and what still needs action. Strategy-call booking now targets the AssistantAI sales calendar instead of a generic calendar.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {['live', 'ready', 'action needed', 'not connected'].map((key) => (
            <div key={key} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center">
              <p className="text-2xl font-bold text-white">{counts[key] || 0}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-gray-500">{key}</p>
            </div>
          ))}
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
