import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import OnboardingKpiGrid from '@/components/admin/onboarding/OnboardingKpiGrid';
import OnboardingClientsTable from '@/components/admin/onboarding/OnboardingClientsTable';
import { AdminEmptyState } from '@/components/admin/AdminState';
import { ArrowUpRight, Bot, BriefcaseBusiness, CheckCircle2, Clock, PlugZap, Rocket, ShieldCheck, Signal } from 'lucide-react';

function isLive(client) {
  return client.lifecycle_state === 'live' || client.status === 'Live';
}

function needsAttention(client) {
  return Boolean(client.blockers?.length) || ['Paused', 'At Risk', 'Needs Attention'].includes(client.status);
}

function clientName(client) {
  return client.business_name || client.full_name || 'Unnamed client';
}

function MiniStat({ icon: Icon, label, value, helper, tone = 'slate' }) {
  const toneClass = tone === 'green' ? 'bg-emerald-50 text-emerald-700' : tone === 'amber' ? 'bg-amber-50 text-amber-700' : tone === 'blue' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-900';
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${toneClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-950">{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">{helper}</p>
    </div>
  );
}

function ClientRow({ client }) {
  return (
    <Link to={`/ClientWorkspace?id=${client.id}`} className="block rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-bold text-slate-950">{clientName(client)}</h3>
            <Badge className="border-0 bg-slate-100 text-slate-600">{client.plan || 'Plan pending'}</Badge>
            {needsAttention(client) ? <Badge className="border-0 bg-amber-50 text-amber-700">Needs attention</Badge> : <Badge className="border-0 bg-emerald-50 text-emerald-700">Healthy</Badge>}
          </div>
          <p className="mt-1 text-sm text-slate-500">{client.industry || 'Industry not set'} · {client.status || client.lifecycle_state || 'Status pending'}</p>
        </div>
        <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3 lg:w-[520px]">
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Owner</p>
            <p className="mt-1 font-semibold text-slate-800">{client.assigned_owner || 'Unassigned'}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Progress</p>
            <p className="mt-1 font-semibold text-slate-800">{client.progress_percentage || 0}%</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Next</p>
            <p className="mt-1 truncate font-semibold text-slate-800">{client.next_action || 'Review workspace'}</p>
          </div>
        </div>
        <ArrowUpRight className="hidden h-5 w-5 text-slate-400 lg:block" />
      </div>
    </Link>
  );
}

export default function ClientManager() {
  const { data: clients = [] } = useQuery({
    queryKey: ['client-manager-clients'],
    queryFn: () => base44.entities.Client.list('-updated_date', 200),
    initialData: [],
  });

  const liveClients = clients.filter(isLive);
  const onboardingClients = clients.filter((client) => !isLive(client));
  const atRiskClients = liveClients.filter(needsAttention);
  const connectedClients = liveClients.filter((client) => client.go_live_date || client.go_live_ready);
  const starter = liveClients.filter((client) => client.plan === 'Starter').length;
  const growth = liveClients.filter((client) => client.plan === 'Growth').length;
  const enterprise = liveClients.filter((client) => client.plan === 'Enterprise').length;

  return (
    <div className="space-y-8 text-slate-950">
      <section className="admin-card overflow-hidden p-6 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr] xl:items-end">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Badge className="border-0 bg-slate-900 text-white">Client Operations Cockpit</Badge>
              <Badge className="border-0 bg-emerald-50 text-emerald-700">Post-live management</Badge>
              <Badge className="border-0 bg-blue-50 text-blue-700">Connector oversight</Badge>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">Live client command centre</h2>
            <p className="admin-muted mt-4 max-w-3xl text-base leading-relaxed">Manage every live AssistantAI account, see connection health, identify operational risk, and jump into each client workspace for onboarding, billing, integrations, files, notes and go-live controls.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/Onboarding" className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800">Start onboarding</Link>
              <Link to="/SystemReadiness" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">System readiness</Link>
              <Link to="/admin/marketing/forms" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Client intake forms</Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <MiniStat icon={BriefcaseBusiness} label="Live Clients" value={liveClients.length} helper="Single source-of-truth client records" tone="green" />
            <MiniStat icon={Rocket} label="Onboarding" value={onboardingClients.length} helper="Pre-live accounts still being built" tone="blue" />
            <MiniStat icon={ShieldCheck} label="Connected" value={connectedClients.length} helper="Go-live completed or ready" tone="green" />
            <MiniStat icon={Clock} label="At Risk" value={atRiskClients.length} helper="Paused, blocked or needing attention" tone={atRiskClients.length ? 'amber' : 'green'} />
          </div>
        </div>
      </section>

      <OnboardingKpiGrid items={[
        { label: 'Live Clients', value: liveClients.length, helper: 'Single source of truth records' },
        { label: 'Paused / At Risk', value: atRiskClients.length, helper: 'Operational holds or blockers' },
        { label: 'Starter / Growth / Enterprise', value: `${starter} / ${growth} / ${enterprise}`, helper: 'Live plan mix' },
        { label: 'Go-Live Completed', value: liveClients.filter((client) => client.go_live_date).length, helper: 'Clients formally launched' },
      ]} />

      <section className="grid gap-6 xl:grid-cols-[1fr_0.7fr]">
        <div className="admin-card p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="admin-kicker">Client health</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-950">Live accounts</h3>
            </div>
            <Signal className="h-6 w-6 text-slate-700" />
          </div>
          <div className="space-y-3">
            {liveClients.length === 0 ? (
              <AdminEmptyState
                icon={BriefcaseBusiness}
                title="No live clients yet"
                description="Move a client through onboarding, activate billing, complete go-live QA, then mark them live. Live accounts will appear here for ongoing management."
                action={<Link to="/Onboarding" className="inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800">Open onboarding</Link>}
              />
            ) : liveClients.map((client) => <ClientRow key={client.id} client={client} />)}
          </div>
        </div>

        <div className="space-y-6">
          <div className="admin-card p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="admin-kicker">Connector readiness</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-950">Client launch checklist</h3>
              </div>
              <PlugZap className="h-6 w-6 text-slate-700" />
            </div>
            <div className="space-y-3">
              {['Business profile complete', 'Knowledge source connected', 'Voice assistant configured', 'Notifications routed', 'Billing active', 'Go-live QA completed'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="admin-kicker">New client flow</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-950">Onboard faster</h3>
              </div>
              <Bot className="h-6 w-6 text-slate-700" />
            </div>
            <div className="grid gap-3">
              <Link to="/Onboarding" className="rounded-2xl border border-slate-200 bg-white p-4 font-semibold text-slate-700 hover:bg-slate-50">Create or continue onboarding</Link>
              <Link to="/admin/marketing/forms" className="rounded-2xl border border-slate-200 bg-white p-4 font-semibold text-slate-700 hover:bg-slate-50">Review intake forms</Link>
              <Link to="/SystemReadiness" className="rounded-2xl border border-slate-200 bg-white p-4 font-semibold text-slate-700 hover:bg-slate-50">Check platform readiness</Link>
              <Link to="/admin/marketing/site-settings" className="rounded-2xl border border-slate-200 bg-white p-4 font-semibold text-slate-700 hover:bg-slate-50">Update site settings</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="admin-card p-5">
        <div className="mb-5">
          <p className="admin-kicker">Legacy table view</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-950">All live clients</h3>
        </div>
        <OnboardingClientsTable clients={liveClients} />
      </section>
    </div>
  );
}
