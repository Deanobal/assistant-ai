import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Activity, AlertTriangle, ArrowUpRight, BarChart3, BookOpen, BriefcaseBusiness, CheckCircle2, ClipboardList, Clock, DollarSign, FileText, HelpCircle, Image, Inbox, Layers, LifeBuoy, Link2, MessageSquareQuote, Navigation, PlugZap, Rocket, Search, Settings, ShieldCheck, SlidersHorizontal, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const operations = [
  { title: 'Action Inbox', desc: 'Urgent conversations, replies and escalations.', href: '/ActionInbox', icon: Inbox, tag: 'Live queue' },
  { title: 'Leads', desc: 'Pipeline, lead detail and follow-up control.', href: '/LeadDashboard', icon: BarChart3, tag: 'Revenue' },
  { title: 'Clients', desc: 'Client records, workspaces and account status.', href: '/ClientManager', icon: BriefcaseBusiness, tag: 'Accounts' },
  { title: 'Client Connectors', desc: 'One-page client setup, integrations, billing and go-live checklist.', href: '/ClientConnectors', icon: PlugZap, tag: 'Setup' },
  { title: 'Onboarding', desc: 'Build progress, intake and go-live readiness.', href: '/Onboarding', icon: Rocket, tag: 'Delivery' },
  { title: 'Support', desc: 'Client and website support threads.', href: '/SupportInbox', icon: LifeBuoy, tag: 'Service' },
  { title: 'System Readiness', desc: 'Launch checks, config and operational status.', href: '/SystemReadiness', icon: Settings, tag: 'Ops' },
];

const growthModules = [
  { title: 'Content Studio', href: '/admin/marketing/content-studio', icon: Sparkles },
  { title: 'Landing Pages', href: '/admin/marketing/landing-pages', icon: Layers },
  { title: 'Pricing Manager', href: '/admin/marketing/pricing', icon: DollarSign },
  { title: 'Social Proof', href: '/admin/marketing/social-proof', icon: MessageSquareQuote },
  { title: 'FAQ Manager', href: '/admin/marketing/faqs', icon: HelpCircle },
  { title: 'Navigation', href: '/admin/marketing/navigation', icon: Navigation },
  { title: 'Form Builder', href: '/admin/marketing/forms', icon: ClipboardList },
  { title: 'Blog Manager', href: '/admin/marketing/blog', icon: BookOpen },
  { title: 'Content Manager', href: '/admin/marketing/content', icon: FileText },
  { title: 'Media Library', href: '/admin/marketing/media', icon: Image },
  { title: 'Site Settings', href: '/admin/marketing/site-settings', icon: SlidersHorizontal },
  { title: 'SEO Dashboard', href: '/admin/marketing/seo-dashboard', icon: Search },
];

const connectorSteps = [
  { name: 'Business profile', detail: 'Client name, services, locations and operating hours.', owner: 'Client intake' },
  { name: 'Knowledge source', detail: 'Website, FAQs, product list, service rules and pricing logic.', owner: 'AI setup' },
  { name: 'Voice agent', detail: 'Vapi assistant, public key, assistant ID and safe fallback flows.', owner: 'AI operations' },
  { name: 'Notifications', detail: 'SMS, email, admin phone, support routing and escalation queue.', owner: 'Ops' },
  { name: 'Payments', detail: 'Stripe setup fee, recurring plan and checkout flow.', owner: 'Revenue' },
  { name: 'Go live QA', detail: 'Test call, handover, secure setup link, guardrails and reporting.', owner: 'Launch' },
];

const connectorLinks = [
  { label: 'Connector launchpad', href: '/ClientConnectors', icon: PlugZap },
  { label: 'New onboarding', href: '/Onboarding', icon: Rocket },
  { label: 'Client manager', href: '/ClientManager', icon: BriefcaseBusiness },
  { label: 'System readiness', href: '/SystemReadiness', icon: ShieldCheck },
  { label: 'Pricing', href: '/admin/marketing/pricing', icon: DollarSign },
  { label: 'Forms', href: '/admin/marketing/forms', icon: ClipboardList },
];

function percentage(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function isRecent(dateValue, days = 7) {
  if (!dateValue) return false;
  const date = new Date(dateValue).getTime();
  if (Number.isNaN(date)) return false;
  return date >= Date.now() - days * 24 * 60 * 60 * 1000;
}

function StatusPill({ ready }) {
  return ready ? (
    <Badge className="border-0 bg-emerald-50 text-emerald-700">Ready</Badge>
  ) : (
    <Badge className="border-0 bg-amber-50 text-amber-700">Needs setup</Badge>
  );
}

function MetricCard({ icon: Icon, label, value, helper, tone = 'slate' }) {
  const toneClass = tone === 'green' ? 'bg-emerald-50 text-emerald-700' : tone === 'amber' ? 'bg-amber-50 text-amber-700' : tone === 'blue' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-900';
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">{helper}</p>
    </div>
  );
}

function ModuleCard({ item }) {
  const Icon = item.icon;
  return (
    <Link key={item.href} to={item.href} className="group block h-full">
      <Card className="h-full rounded-3xl border border-slate-200 bg-white shadow-sm transition group-hover:-translate-y-0.5 group-hover:border-slate-300 group-hover:shadow-lg">
        <CardContent className="p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
              <Icon className="h-5 w-5" />
            </div>
            {item.tag && <Badge className="border-0 bg-slate-100 text-slate-600">{item.tag}</Badge>}
          </div>
          <h2 className="text-base font-bold text-slate-950">{item.title}</h2>
          {item.desc && <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{item.desc}</p>}
        </CardContent>
      </Card>
    </Link>
  );
}

function MiniLink({ item }) {
  const Icon = item.icon;
  return (
    <Link to={item.href} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950">
      <span className="flex items-center gap-3"><Icon className="h-4 w-4" />{item.label}</span>
      <ArrowUpRight className="h-4 w-4 text-slate-400" />
    </Link>
  );
}

export default function AdminHome() {
  const { data: leads = [] } = useQuery({ queryKey: ['admin-home-leads'], queryFn: () => base44.entities.Lead.list('-updated_date', 200), initialData: [] });
  const { data: clients = [] } = useQuery({ queryKey: ['admin-home-clients'], queryFn: () => base44.entities.Client.list('-updated_date', 200), initialData: [] });
  const { data: conversations = [] } = useQuery({ queryKey: ['admin-home-conversations'], queryFn: () => base44.entities.SupportConversation.list('-updated_at', 200), initialData: [] });
  const { data: tasks = [] } = useQuery({ queryKey: ['admin-home-tasks'], queryFn: () => base44.entities.OnboardingTask.list('-updated_date', 500), initialData: [] });
  const { data: configStatus = null } = useQuery({ queryKey: ['admin-home-config-status'], queryFn: () => fetch('/api/config-status').then((response) => response.json()), initialData: null });

  const openConversations = conversations.filter((item) => !['resolved', 'closed'].includes(item.status));
  const unreadConversations = conversations.filter((item) => item.unread_for_admin && !['resolved', 'closed'].includes(item.status));
  const newLeads = leads.filter((lead) => lead.status === 'New Lead');
  const wonLeads = leads.filter((lead) => lead.status === 'Won');
  const recentLeads = leads.filter((lead) => isRecent(lead.created_at || lead.created_date || lead.updated_date));
  const onboardingClients = clients.filter((client) => client.lifecycle_state !== 'live' && client.status !== 'Live');
  const liveClients = clients.filter((client) => client.lifecycle_state === 'live' || client.status === 'Live');
  const overdueTasks = tasks.filter((task) => task.due_date && !task.completed && new Date(task.due_date) < new Date());
  const completedTasks = tasks.filter((task) => task.completed);
  const readinessGroups = Object.entries(configStatus?.status || {});
  const readyGroups = readinessGroups.filter(([, group]) => group.ready).length;
  const readinessScore = readinessGroups.length ? percentage(readyGroups, readinessGroups.length) : 0;
  const taskCompletion = tasks.length ? percentage(completedTasks.length, tasks.length) : 0;
  const conversionRate = leads.length ? percentage(wonLeads.length + liveClients.length, leads.length + liveClients.length) : 0;

  const criticalAlerts = [
    ...(unreadConversations.length ? [`${unreadConversations.length} unread client/support conversations`] : []),
    ...(overdueTasks.length ? [`${overdueTasks.length} overdue onboarding tasks`] : []),
    ...(readinessScore < 100 ? [`${100 - readinessScore}% integration readiness gap`] : []),
    ...(newLeads.length ? [`${newLeads.length} new leads need qualification`] : []),
  ];

  const recentClientRows = clients.slice(0, 5);

  return (
    <div className="space-y-8 text-slate-950">
      <section className="relative overflow-hidden rounded-[34px] border border-slate-200 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300/40 md:p-8">
        <div className="absolute right-0 top-0 h-80 w-80 translate-x-20 -translate-y-24 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative grid gap-8 xl:grid-cols-[1.25fr_0.75fr] xl:items-end">
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <Badge className="border border-white/10 bg-white/10 text-white">AI Operations Command Centre</Badge>
              <Badge className="border border-emerald-400/30 bg-emerald-400/10 text-emerald-200">Live admin</Badge>
              <Badge className="border border-cyan-400/30 bg-cyan-400/10 text-cyan-200">One-page control room</Badge>
            </div>
            <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">AssistantAI OpsPulse Dashboard</h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-300 md:text-lg">Monitor leads, onboarding, support, live clients, integrations, compliance readiness and launch risk from one high-signal operating page.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/Onboarding" className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-black/20 hover:bg-slate-100">Start new client</Link>
              <Link to="/ClientConnectors" className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-sm font-bold text-cyan-100 hover:bg-cyan-400/15">Open connector hub</Link>
              <Link to="/ActionInbox" className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/15">Open live queue</Link>
              <Link to="/SystemReadiness" className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/15">Check readiness</Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Readiness</p>
              <p className="mt-2 text-4xl font-bold">{readinessScore}%</p>
              <p className="mt-1 text-sm text-slate-300">Integration groups ready</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Task completion</p>
              <p className="mt-2 text-4xl font-bold">{taskCompletion}%</p>
              <p className="mt-1 text-sm text-slate-300">Onboarding checklist progress</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Sales conversion</p>
              <p className="mt-2 text-4xl font-bold">{conversionRate}%</p>
              <p className="mt-1 text-sm text-slate-300">Won/live against total leads</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={TrendingUp} label="Total leads" value={leads.length} helper={`${recentLeads.length} created or updated this week`} tone="blue" />
        <MetricCard icon={BriefcaseBusiness} label="Clients" value={clients.length} helper={`${liveClients.length} live, ${onboardingClients.length} onboarding`} tone="green" />
        <MetricCard icon={Inbox} label="Open conversations" value={openConversations.length} helper={`${unreadConversations.length} unread for admin`} tone={unreadConversations.length ? 'amber' : 'slate'} />
        <MetricCard icon={Clock} label="Overdue tasks" value={overdueTasks.length} helper={`${tasks.length} total onboarding tasks tracked`} tone={overdueTasks.length ? 'amber' : 'green'} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="admin-card p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="admin-kicker">Live operating risk</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">Command alerts</h2>
            </div>
            <AlertTriangle className="h-6 w-6 text-amber-500" />
          </div>
          <div className="space-y-3">
            {criticalAlerts.length === 0 ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">No critical admin alerts right now.</div>
            ) : criticalAlerts.map((alert) => (
              <div key={alert} className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {alert}
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="admin-kicker">Integration health</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">Connectors</h2>
            </div>
            <PlugZap className="h-6 w-6 text-slate-700" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {readinessGroups.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Checking connector readiness...</div>
            ) : readinessGroups.map(([name, group]) => (
              <div key={name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold capitalize text-slate-950">{name}</p>
                  <StatusPill ready={group.ready} />
                </div>
                <p className="mt-2 text-xs text-slate-500">{group.ready ? 'Configured and present' : `${group.missing.length} missing variable${group.missing.length === 1 ? '' : 's'}`}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="admin-card p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="admin-kicker">Easy client onboarding</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">Connector launchpad</h2>
              <p className="admin-muted mt-2 text-sm">A simple one-page path for setting up a new client without losing commercial or technical details.</p>
            </div>
            <Link2 className="h-6 w-6 text-slate-700" />
          </div>
          <div className="space-y-3">
            {connectorSteps.map((step, index) => (
              <div key={step.name} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">{index + 1}</div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-950">{step.name}</h3>
                    <Badge className="border-0 bg-slate-100 text-slate-600">{step.owner}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="admin-card p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="admin-kicker">Fast actions</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">Connect and launch</h2>
              </div>
              <Zap className="h-6 w-6 text-slate-700" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {connectorLinks.map((item) => <MiniLink key={item.href} item={item} />)}
            </div>
          </div>

          <div className="admin-card p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="admin-kicker">Latest clients</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">Recent client records</h2>
              </div>
              <Activity className="h-6 w-6 text-slate-700" />
            </div>
            <div className="space-y-3">
              {recentClientRows.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No client records yet.</div>
              ) : recentClientRows.map((client) => (
                <Link key={client.id} to={`/ClientWorkspace?id=${client.id}`} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 transition hover:bg-slate-50">
                  <div>
                    <p className="font-bold text-slate-950">{client.business_name || client.full_name || 'Unnamed client'}</p>
                    <p className="text-sm text-slate-500">{client.plan || 'Plan not set'} · {client.status || client.lifecycle_state || 'Status pending'}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="admin-kicker">Operations modules</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">Run the business</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {operations.map((module) => <ModuleCard key={module.href} item={module} />)}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="admin-kicker">Growth systems</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">Website, campaigns and market position</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {growthModules.map((module) => <ModuleCard key={module.href} item={module} />)}
        </div>
      </section>
    </div>
  );
}
