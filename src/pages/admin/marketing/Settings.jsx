import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, ExternalLink, Loader2, XCircle } from 'lucide-react';

const integrationGroups = [
  {
    title: 'SEO & Analytics APIs',
    description: 'These integrations require real provider credentials before the SEO dashboard can show live data.',
    items: [
      { key: 'gsc', name: 'Google Search Console', description: 'Keyword rankings, impressions, clicks and indexed page data.', envVars: ['GSC_CLIENT_EMAIL', 'GSC_PRIVATE_KEY', 'GSC_SITE_URL'] },
      { key: 'ga', name: 'Google Analytics', description: 'Traffic, users, page engagement and conversion behaviour.', envVars: ['GA_PROPERTY_ID', 'GA_CLIENT_EMAIL', 'GA_PRIVATE_KEY'] },
      { key: 'semrush', name: 'SEMrush', description: 'Competitor analysis, domain authority and keyword gap data.', envVars: ['SEMRUSH_API_KEY'] },
    ],
  },
  {
    title: 'Campaign & Messaging APIs',
    description: 'These services control outbound email, SMS and admin notification delivery.',
    items: [
      { key: 'email', name: 'Email Service', description: 'Resend sender identity and admin email notifications.', envVars: ['RESEND_API_KEY', 'RESEND_FROM_EMAIL', 'ADMIN_NOTIFICATION_EMAIL'] },
      { key: 'sms', name: 'SMS Service', description: 'Twilio SMS notifications and reply routing.', envVars: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM_NUMBER', 'ADMIN_NOTIFICATION_PHONE'] },
    ],
  },
];

function getIntegrationReady(configStatus, item) {
  if (!configStatus?.status) return false;
  if (item.key === 'email') return Boolean(configStatus.status.email?.ready);
  if (item.key === 'sms') return Boolean(configStatus.status.sms?.ready);
  return item.envVars.every((name) => configStatus.variables?.[name]?.present || false);
}

function getMissing(configStatus, item) {
  if (!configStatus?.status && !configStatus?.variables) return item.envVars;
  if (item.key === 'email') return configStatus.status?.email?.missing || item.envVars;
  if (item.key === 'sms') return configStatus.status?.sms?.missing || item.envVars;
  return item.envVars.filter((name) => !configStatus.variables?.[name]?.present);
}

export default function Settings() {
  const [configStatus, setConfigStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/config-status');
      const data = await response.json();
      setConfigStatus(data);
    } catch (err) {
      setError(err.message || 'Could not load integration status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return (
    <div className="space-y-8 pb-8 text-slate-950">
      <div className="admin-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="admin-kicker">Marketing systems</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">Integration Settings</h2>
            <p className="admin-muted mt-2 max-w-3xl">Real integration status only. This page no longer marks services as connected unless the required backend environment variables are present.</p>
          </div>
          <button onClick={loadConfig} className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Refresh status
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {integrationGroups.map((group) => (
        <section key={group.title} className="admin-card p-6">
          <div className="mb-5">
            <h3 className="text-xl font-bold text-slate-950">{group.title}</h3>
            <p className="admin-muted mt-1 text-sm">{group.description}</p>
          </div>

          <div className="space-y-4">
            {group.items.map((item) => {
              const ready = getIntegrationReady(configStatus, item);
              const missing = getMissing(configStatus, item);
              return (
                <div key={item.key} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="font-bold text-slate-950">{item.name}</h4>
                        {ready ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"><CheckCircle className="mr-1 h-3.5 w-3.5" />Connected</span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700"><XCircle className="mr-1 h-3.5 w-3.5" />Not configured</span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.envVars.map((name) => (
                          <code key={name} className={`rounded-lg px-2 py-1 text-xs ${missing.includes(name) ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{name}</code>
                        ))}
                      </div>
                    </div>
                    <div className="min-w-[180px] text-sm text-slate-500">
                      {ready ? 'Ready for live data.' : `${missing.length} required value${missing.length === 1 ? '' : 's'} missing.`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <section className="admin-card p-6">
        <h3 className="text-xl font-bold text-slate-950">Setup rules</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {[
            'Add provider credentials in Vercel Environment Variables, not VITE variables.',
            'Never show Connected unless the backend confirms required variables are present.',
            'SEO modules should show setup guidance if Google/SEMrush are not configured.',
            'Campaign modules should save drafts locally even when outbound send APIs are not configured.',
          ].map((rule) => (
            <div key={rule} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700">{rule}</div>
          ))}
        </div>
        <a href="/SystemReadiness" className="mt-5 inline-flex items-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800">
          Open System Readiness <ExternalLink className="ml-2 h-4 w-4" />
        </a>
      </section>
    </div>
  );
}
