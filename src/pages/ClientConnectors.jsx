import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, Bot, BriefcaseBusiness, CheckCircle2, CreditCard, DatabaseZap, FileText, Globe, Mail, MessageSquare, PhoneCall, Rocket, Sparkles, Workflow, XCircle } from 'lucide-react';

const connectorBlueprint = [
  { key: 'business_profile', label: 'Business Profile', icon: BriefcaseBusiness, description: 'Business name, contact, industry, locations, hours and service area.' },
  { key: 'knowledge', label: 'Knowledge Base', icon: FileText, description: 'Website, service list, FAQs, booking rules, policies and product information.' },
  { key: 'voice_agent', label: 'Voice Agent', icon: Bot, description: 'Vapi assistant, prompts, fallback logic, secure setup link and call handling.' },
  { key: 'phone_sms', label: 'Phone + SMS', icon: PhoneCall, description: 'Twilio number, admin SMS alerts, missed lead routing and reply handling.' },
  { key: 'email', label: 'Email', icon: Mail, description: 'Resend notifications, admin email, sender identity and support routing.' },
  { key: 'crm', label: 'CRM / GHL', icon: Workflow, description: 'Lead capture, pipeline sync, booking workflow and follow-up automation.' },
  { key: 'website', label: 'Website Widget', icon: Globe, description: 'Hero-page demo, lead forms, embedded AI assistant and tracking.' },
  { key: 'billing', label: 'Billing', icon: CreditCard, description: 'Stripe setup fee, subscription, checkout session and billing status.' },
  { key: 'support', label: 'Support', icon: MessageSquare, description: 'Action Inbox, support inbox, handover, escalation and human fallback.' },
  { key: 'go_live', label: 'Go-Live QA', icon: Rocket, description: 'End-to-end test call, secure form test, notifications, payment and launch signoff.' },
];

function clientName(client) {
  return client.business_name || client.full_name || client.email || 'Unnamed client';
}

function integrationText(item) {
  return `${item.integration_name || ''} ${item.provider || ''} ${item.integration_type || ''}`.toLowerCase();
}

function connectorStatus(client, integrations, billing, connector) {
  const hasConnected = (keywords) => integrations.some((item) => item.connection_status === 'connected' && keywords.some((keyword) => integrationText(item).includes(keyword)));

  if (connector.key === 'business_profile') return Boolean(client.business_name && (client.email || client.mobile_number || client.phone));
  if (connector.key === 'knowledge') return Boolean(client.website || client.knowledge_base_url || client.service_summary);
  if (connector.key === 'voice_agent') return hasConnected(['vapi', 'voice', 'assistant']);
  if (connector.key === 'phone_sms') return hasConnected(['twilio', 'sms', 'phone']);
  if (connector.key === 'email') return hasConnected(['resend', 'email']);
  if (connector.key === 'crm') return hasConnected(['ghl', 'crm', 'hubspot', 'jobber']);
  if (connector.key === 'website') return Boolean(client.website || hasConnected(['widget', 'website']));
  if (connector.key === 'billing') return billing?.billing_status === 'active';
  if (connector.key === 'support') return Boolean(client.assigned_owner || client.support_channel || client.admin_notification_email);
  if (connector.key === 'go_live') return Boolean(client.go_live_ready || client.status === 'Live' || client.lifecycle_state === 'live');
  return false;
}

function ConnectorCard({ connector, isReady, clientId }) {
  const Icon = connector.icon;
  return (
    <Link to={`/ClientWorkspace?id=${clientId}`} className="group block h-full">
      <div className="h-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition group-hover:-translate-y-0.5 group-hover:border-slate-300 group-hover:shadow-lg">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isReady ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
            <Icon className="h-5 w-5" />
          </div>
          {isReady ? (
            <Badge className="border-0 bg-emerald-50 text-emerald-700"><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Ready</Badge>
          ) : (
            <Badge className="border-0 bg-amber-50 text-amber-700"><XCircle className="mr-1 h-3.5 w-3.5" />Setup</Badge>
          )}
        </div>
        <h3 className="text-base font-bold text-slate-950">{connector.label}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{connector.description}</p>
        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
          Open workspace <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}

function MissingAction({ item, clientId }) {
  const Icon = item.icon;
  return (
    <Link to={`/ClientWorkspace?id=${clientId}`} className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 transition hover:bg-amber-100">
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span><strong>{item.label}:</strong> {item.description}</span>
    </Link>
  );
}

export default function ClientConnectors() {
  const [selectedClientId, setSelectedClientId] = useState('');
  const { data: clients = [] } = useQuery({ queryKey: ['connector-clients'], queryFn: () => base44.entities.Client.list('-updated_date', 200), initialData: [] });
  const activeClientId = selectedClientId || clients[0]?.id || '';
  const client = clients.find((item) => item.id === activeClientId) || null;
  const { data: integrations = [] } = useQuery({ queryKey: ['connector-integrations', activeClientId], queryFn: () => base44.entities.IntegrationStatus.filter({ client_id: activeClientId }, '-updated_date', 100), initialData: [], enabled: Boolean(activeClientId) });
  const { data: billingRecords = [] } = useQuery({ queryKey: ['connector-billing', activeClientId], queryFn: () => base44.entities.BillingStatus.filter({ client_id: activeClientId }, '-updated_date', 10), initialData: [], enabled: Boolean(activeClientId) });
  const billing = billingRecords[0] || null;

  const readiness = useMemo(() => {
    if (!client) return [];
    return connectorBlueprint.map((connector) => ({ ...connector, ready: connectorStatus(client, integrations, billing, connector) }));
  }, [client, integrations, billing]);

  const readyCount = readiness.filter((item) => item.ready).length;
  const score = readiness.length ? Math.round((readyCount / readiness.length) * 100) : 0;
  const missing = readiness.filter((item) => !item.ready);

  return (
    <div className="space-y-8 text-slate-950">
      <section className="relative overflow-hidden rounded-[34px] border border-slate-200 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300/40 md:p-8">
        <div className="absolute right-0 top-0 h-80 w-80 translate-x-20 -translate-y-24 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="relative grid gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:items-end">
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <Badge className="border border-white/10 bg-white/10 text-white">Client Connector Launchpad</Badge>
              <Badge className="border border-cyan-400/30 bg-cyan-400/10 text-cyan-200">One-page setup</Badge>
            </div>
            <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">Connect new clients faster</h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-300 md:text-lg">Pick a client, see every setup requirement, then jump straight into the workspace to complete AI, CRM, phone, billing, support and go-live configuration.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/Onboarding" className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-black/20 hover:bg-slate-100">Start new onboarding</Link>
              {client && <Link to={`/ClientWorkspace?id=${client.id}`} className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/15">Open selected workspace</Link>}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Selected client readiness</p>
            <p className="mt-2 text-5xl font-bold">{score}%</p>
            <p className="mt-2 text-sm text-slate-300">{readyCount} of {readiness.length || connectorBlueprint.length} connector checkpoints ready</p>
          </div>
        </div>
      </section>

      <section className="admin-card p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_0.5fr] lg:items-end">
          <div>
            <p className="admin-kicker">Client selector</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">Choose account to connect</h2>
            <p className="admin-muted mt-2 text-sm">This page is built for speed: select the client, review missing setup items, then finish the work inside the client workspace.</p>
          </div>
          <select value={activeClientId} onChange={(event) => setSelectedClientId(event.target.value)} className="min-h-[48px] rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-slate-900/10">
            {clients.length === 0 && <option value="">No clients yet</option>}
            {clients.map((item) => <option key={item.id} value={item.id}>{clientName(item)}</option>)}
          </select>
        </div>
      </section>

      {!client ? (
        <section className="admin-card p-8 text-center">
          <DatabaseZap className="mx-auto mb-4 h-12 w-12 text-slate-400" />
          <h2 className="text-2xl font-bold text-slate-950">No client records yet</h2>
          <p className="admin-muted mt-2">Create a new onboarding record first, then return here to connect the client.</p>
          <Link to="/Onboarding" className="mt-5 inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800">Create onboarding</Link>
        </section>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Client</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{clientName(client)}</p>
              <p className="mt-2 text-sm text-slate-500">{client.plan || 'Plan pending'} · {client.status || client.lifecycle_state || 'Status pending'}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Missing checkpoints</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{missing.length}</p>
              <p className="mt-2 text-sm text-slate-500">Resolve these before go-live QA.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Billing</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{billing?.billing_status || 'Not active'}</p>
              <p className="mt-2 text-sm text-slate-500">Stripe and subscription status.</p>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {readiness.map((connector) => <ConnectorCard key={connector.key} connector={connector} isReady={connector.ready} clientId={client.id} />)}
          </section>

          <section className="admin-card p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="admin-kicker">Next best actions</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">Finish setup path</h2>
              </div>
              <Sparkles className="h-6 w-6 text-slate-700" />
            </div>
            {missing.length === 0 ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-semibold text-emerald-700">All connector checkpoints look ready. Run go-live QA inside the client workspace.</div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {missing.slice(0, 6).map((item) => <MissingAction key={item.key} item={item} clientId={client.id} />)}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
