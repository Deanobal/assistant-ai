import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Bot, BriefcaseBusiness, CheckCircle2, CreditCard, FileText, Globe, Mail, MessageSquare, PhoneCall, PlugZap, Rocket, Workflow, XCircle } from 'lucide-react';

const connectorItems = [
  { key: 'profile', label: 'Business profile', icon: BriefcaseBusiness, description: 'Business name, email/mobile, industry and owner.' },
  { key: 'knowledge', label: 'Knowledge base', icon: FileText, description: 'Website, service rules, FAQs and product knowledge.' },
  { key: 'voice', label: 'Voice agent', icon: Bot, description: 'Assistant, prompt, fallback and call handling.' },
  { key: 'sms', label: 'Phone + SMS', icon: PhoneCall, description: 'Twilio, SMS alerts and reply handling.' },
  { key: 'email', label: 'Email', icon: Mail, description: 'Resend sender, admin notifications and routing.' },
  { key: 'crm', label: 'CRM / GHL', icon: Workflow, description: 'Pipeline sync, bookings and follow-up automation.' },
  { key: 'website', label: 'Website widget', icon: Globe, description: 'Website, forms, public demo and client entry points.' },
  { key: 'billing', label: 'Billing', icon: CreditCard, description: 'Stripe customer, subscription and active payment status.' },
  { key: 'support', label: 'Support handover', icon: MessageSquare, description: 'Action Inbox, support queue and escalation logic.' },
  { key: 'goLive', label: 'Go-live QA', icon: Rocket, description: 'Final launch readiness and live transition.' },
];

function integrationText(integration) {
  return `${integration?.integration_name || ''} ${integration?.provider || ''} ${integration?.integration_type || ''}`.toLowerCase();
}

function hasConnectedIntegration(integrations, keywords) {
  return integrations.some((integration) => {
    const text = integrationText(integration);
    return integration.connection_status === 'connected' && keywords.some((keyword) => text.includes(keyword));
  });
}

function isReady(key, client, intake, integrations, billing, tasks) {
  if (key === 'profile') return Boolean(client?.business_name && (client?.email || client?.mobile_number || client?.phone));
  if (key === 'knowledge') return Boolean(client?.website || client?.knowledge_base_url || client?.service_summary || intake?.business_description || intake?.services_offered);
  if (key === 'voice') return hasConnectedIntegration(integrations, ['vapi', 'voice', 'assistant']);
  if (key === 'sms') return hasConnectedIntegration(integrations, ['twilio', 'sms', 'phone']);
  if (key === 'email') return hasConnectedIntegration(integrations, ['resend', 'email']);
  if (key === 'crm') return hasConnectedIntegration(integrations, ['ghl', 'crm', 'hubspot', 'jobber']);
  if (key === 'website') return Boolean(client?.website || hasConnectedIntegration(integrations, ['website', 'widget']));
  if (key === 'billing') return billing?.billing_status === 'active';
  if (key === 'support') return Boolean(client?.assigned_owner || client?.support_channel || client?.admin_notification_email);
  if (key === 'goLive') return Boolean(client?.go_live_ready || client?.status === 'Live' || client?.lifecycle_state === 'live' || tasks.some((task) => task.task_name?.toLowerCase().includes('go live') && task.completed));
  return false;
}

export default function ClientConnectorCockpit({ client, intake, integrations = [], billing, tasks = [] }) {
  const states = connectorItems.map((item) => ({ ...item, ready: isReady(item.key, client, intake, integrations, billing, tasks) }));
  const readyCount = states.filter((item) => item.ready).length;
  const score = states.length ? Math.round((readyCount / states.length) * 100) : 0;
  const missing = states.filter((item) => !item.ready);

  return (
    <section className="admin-card p-5 md:p-6">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <Badge className="border-0 bg-slate-900 text-white">Connector Cockpit</Badge>
            <Badge className="border-0 bg-blue-50 text-blue-700">{score}% ready</Badge>
            {missing.length ? <Badge className="border-0 bg-amber-50 text-amber-700">{missing.length} missing</Badge> : <Badge className="border-0 bg-emerald-50 text-emerald-700">Launch ready</Badge>}
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">Client setup and connection status</h2>
          <p className="admin-muted mt-2 max-w-3xl text-sm">One view for business profile, knowledge source, AI voice setup, notifications, CRM, billing, support handover and go-live readiness.</p>
        </div>
        <Link to="/ClientConnectors" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">
          <PlugZap className="mr-2 h-4 w-4" /> Open connector launchpad
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {states.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.key} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.ready ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                {item.ready ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <XCircle className="h-5 w-5 text-amber-500" />}
              </div>
              <h3 className="text-sm font-bold text-slate-950">{item.label}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.description}</p>
            </div>
          );
        })}
      </div>

      {missing.length > 0 && (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-bold text-amber-900">Next missing setup items</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {missing.slice(0, 6).map((item) => <Badge key={item.key} className="border-0 bg-white text-amber-800">{item.label}</Badge>)}
          </div>
        </div>
      )}
    </section>
  );
}
