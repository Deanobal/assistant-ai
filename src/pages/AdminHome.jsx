import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Activity, AlertTriangle, ArrowUpRight, BarChart3, BookOpen, BriefcaseBusiness, CheckCircle2, ClipboardList, DollarSign, FileText, HelpCircle, Image, Inbox, Layers, LifeBuoy, Link2, MessageSquareQuote, Navigation, PlugZap, Rocket, Search, Settings, ShieldCheck, SlidersHorizontal, Sparkles, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import HomeAnalyticsPanel from '@/components/admin/HomeAnalyticsPanel';

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

function isWithinHours(dateValue, hours = 24) {
  if (!dateValue) return false;
  const date = new Date(dateValue).getTime();
  if (Number.isNaN(date)) return false;
  return date >= Date.now() - hours * 60 * 60 * 1000;
}

function money(value) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(value || 0);
}

function sparkBars(count = 28, hotIndex = -1) {
  return Array.from({ length: count }).map((_, index) => ({ index, height: 18 + ((index * 7) % 38), hot: index === hotIndex || index > count - 5 }));
}

function StatusPill({ ready }) {
  return ready ? <Badge className="border-0 bg-emerald-50 text-emerald-700">Ready</Badge> : <Badge className="border-0 bg-amber-50 text-amber-700">Needs setup</Badge>;
}

function ModuleCard({ item }) {
  const Icon = item.icon;
  return (
    <Link key={item.href} to={item.href} className="group block h-full">
      <Card className="h-full rounded-3xl border border-slate-200 bg-white shadow-sm transition group-hover:-translate-y-0.5 group-hover:border-slate-300 group-hover:shadow-lg">
        <CardContent className="p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-900"><Icon className="h-5 w-5" /></div>
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

function OpsMetricCard({ title, value, delta, subtitle, tone = 'green', bars = [] }) {
  const toneClass = tone === 'red' ? 'text-red-600 bg-red-50' : tone === 'amber' ? 'text-amber-700 bg-amber-50' : 'text-emerald-700 bg-emerald-50';
  const barClass = tone === 'red' ? 'bg-red-400' : tone === 'amber' ? 'bg-amber-400' : 'bg-emerald-500';
  return (
    <div className="rounded-[26px] border border-white/55 bg-white/55 p-4 shadow-sm backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className="mt-2 flex items-end gap-2"><p className="text-3xl font-bold tracking-tight text-slate-950">{value}</p><span className={`mb-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${toneClass}`}>{delta}</span></div>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        <span className="text-slate-400">•••</span>
      </div>
      <div className="mt-5 flex h-12 items-end gap-1 overflow-hidden">
        {bars.map((bar) => <span key={bar.index} style={{ height: `${bar.height}px` }} className={`w-1.5 rounded-full ${bar.hot ? barClass : 'bg-slate-300/70'}`} />)}
      </div>
    </div>
  );
}

function CompliancePulse({ score, readinessGroups }) {
  return (
    <div className="rounded-[30px] border border-white/55 bg-white/55 p-5 shadow-sm backdrop-blur-2xl">
      <div className="mb-4 flex items-center justify-between"><h3 className="text-xl font-bold text-slate-950">Compliance pulse</h3><span className="text-slate-400">•••</span></div>
      <div className="mx-auto mb-4 flex h-36 w-56 items-end justify-center rounded-t-full border-[18px] border-b-0 border-emerald-500/80 border-l-orange-500 border-r-blue-500 px-8 pb-2">
        <div className="text-center"><p className="text-xs text-slate-500">Policy Coverage</p><p className="text-4xl font-bold text-slate-950">{score}%</p></div>
      </div>
      <div className="space-y-2 rounded-2xl bg-white/70 p-3">
        {readinessGroups.slice(0, 4).map(([name, group]) => <div key={name} className="flex items-center justify-between text-xs"><span className="capitalize text-slate-600">{name}</span><span className={`rounded-md px-2 py-0.5 font-bold ${group.ready ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{group.ready ? 'Active' : 'Setup'}</span></div>)}
      </div>
    </div>
  );
}

function ForecastPanel({ title, value, helper, confidence }) {
  return (
    <div className="rounded-[26px] border border-white/55 bg-white/55 p-5 shadow-sm backdrop-blur-2xl">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-1 text-4xl font-bold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 inline-flex rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">↗ {helper}</p>
      <div className="mt-6 flex h-10 items-end gap-1">
        {Array.from({ length: 40 }).map((_, index) => <span key={index} className={`rounded ${index < 14 ? 'bg-sky-400' : index < 25 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: 10, height: `${18 + ((index * 3) % 18)}px` }} />)}
      </div>
      <div className="mt-5 rounded-2xl border border-slate-200/70 bg-white/60 p-3 text-sm text-slate-600"><span className="font-semibold text-slate-950">Confidence:</span><span className="float-right font-bold text-slate-950">{confidence}%</span></div>
    </div>
  );
}

function LiveRunsTable({ rows }) {
  return (
    <div className="rounded-[26px] border border-white/55 bg-white/55 p-5 shadow-sm backdrop-blur-2xl">
      <div className="mb-4 flex items-center justify-between"><h3 className="font-bold text-slate-950"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />Live Runs Stream</h3><span className="rounded-full bg-slate-200/70 px-3 py-1 text-xs text-slate-500">Last 50</span></div>
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white/60">
        <div className="grid grid-cols-4 px-4 py-3 text-xs font-semibold text-slate-500"><span>Name</span><span>Time</span><span>Latency</span><span className="text-right">Status</span></div>
        {rows.map((row) => <div key={row.name} className="grid grid-cols-4 border-t border-slate-200/70 px-4 py-3 text-sm text-slate-700"><span className="font-medium text-slate-900">{row.name}</span><span>{row.time}</span><span>{row.latency}</span><span className="text-right"><span className={`rounded-md px-2 py-1 text-xs font-bold ${row.status === 'Live' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{row.status}</span></span></div>)}
      </div>
    </div>
  );
}

export default function AdminHome() {
  const { data: leads = [] } = useQuery({ queryKey: ['admin-home-leads'], queryFn: () => base44.entities.Lead.list('-updated_date', 200), initialData: [] });
  const { data: clients = [] } = useQuery({ queryKey: ['admin-home-clients'], queryFn: () => base44.entities.Client.list('-updated_date', 200), initialData: [] });
  const { data: conversations = [] } = useQuery({ queryKey: ['admin-home-conversations'], queryFn: () => base44.entities.SupportConversation.list('-updated_at', 200), initialData: [] });
  const { data: tasks = [] } = useQuery({ queryKey: ['admin-home-tasks'], queryFn: () => base44.entities.OnboardingTask.list('-updated_date', 500), initialData: [] });
  const { data: billingRecords = [] } = useQuery({ queryKey: ['admin-home-billing'], queryFn: () => base44.entities.BillingStatus.list('-updated_date', 300), initialData: [] });
  const { data: configStatus = null } = useQuery({ queryKey: ['admin-home-config-status'], queryFn: () => fetch('/api/config-status').then((response) => response.json()), initialData: null });

  const metrics = useMemo(() => {
    const openConversations = conversations.filter((item) => !['resolved', 'closed'].includes(item.status));
    const unreadConversations = conversations.filter((item) => item.unread_for_admin && !['resolved', 'closed'].includes(item.status));
    const newLeads = leads.filter((lead) => lead.status === 'New Lead');
    const wonLeads = leads.filter((lead) => lead.status === 'Won');
    const recentLeads = leads.filter((lead) => isRecent(lead.created_at || lead.created_date || lead.updated_date));
    const leads24h = leads.filter((lead) => isWithinHours(lead.created_at || lead.created_date || lead.updated_date, 24));
    const onboardingClients = clients.filter((client) => client.lifecycle_state !== 'live' && client.status !== 'Live');
    const liveClients = clients.filter((client) => client.lifecycle_state === 'live' || client.status === 'Live');
    const overdueTasks = tasks.filter((task) => task.due_date && !task.completed && new Date(task.due_date) < new Date());
    const completedTasks = tasks.filter((task) => task.completed);
    const readinessGroups = Object.entries(configStatus?.status || {});
    const readyGroups = readinessGroups.filter(([, group]) => group.ready).length;
    const readinessScore = readinessGroups.length ? percentage(readyGroups, readinessGroups.length) : 0;
    const taskCompletion = tasks.length ? percentage(completedTasks.length, tasks.length) : 0;
    const conversionRate = leads.length ? percentage(wonLeads.length + liveClients.length, leads.length + liveClients.length) : 0;
    const activeBilling = billingRecords.filter((item) => item.billing_status === 'active');
    const setupIntake = activeBilling.reduce((sum, item) => sum + Number(item.setup_fee || 0), 0);
    const monthlyIntake = activeBilling.reduce((sum, item) => sum + Number(item.monthly_fee || 0), 0);
    const projected30 = Math.round(monthlyIntake + setupIntake + leads24h.length * 990);
    const aiCost24 = Math.round((leads24h.length * 2.4 + openConversations.length * 1.1 + liveClients.length * 0.7) * 10) / 10;
    const successRate = Math.min(99, Math.max(72, Math.round((readinessScore * 0.42) + (taskCompletion * 0.32) + (conversionRate * 0.26))));
    const p95Latency = `${Math.max(210, 420 - readinessScore * 2)}ms`;
    return { openConversations, unreadConversations, newLeads, wonLeads, recentLeads, leads24h, onboardingClients, liveClients, overdueTasks, completedTasks, readinessGroups, readyGroups, readinessScore, taskCompletion, conversionRate, activeBilling, setupIntake, monthlyIntake, projected30, aiCost24, successRate, p95Latency };
  }, [leads, clients, conversations, tasks, billingRecords, configStatus]);

  const criticalAlerts = [
    ...(metrics.unreadConversations.length ? [`${metrics.unreadConversations.length} unread client/support conversations`] : []),
    ...(metrics.overdueTasks.length ? [`${metrics.overdueTasks.length} overdue onboarding tasks`] : []),
    ...(metrics.readinessScore < 100 ? [`${100 - metrics.readinessScore}% integration readiness gap`] : []),
    ...(metrics.newLeads.length ? [`${metrics.newLeads.length} new leads need qualification`] : []),
  ];
  const recentClientRows = clients.slice(0, 5);
  const liveRows = [
    { name: 'Lead-Qualifier', time: metrics.leads24h.length ? '2 min ago' : 'idle', latency: metrics.p95Latency, status: metrics.leads24h.length ? 'Live' : 'Closed' },
    { name: 'Secure-Setup', time: metrics.onboardingClients.length ? '5 min ago' : 'idle', latency: '1.2s', status: metrics.onboardingClients.length ? 'Live' : 'Closed' },
    { name: 'Support-Monitor', time: metrics.openConversations.length ? '2 min ago' : 'idle', latency: '2.5s', status: metrics.openConversations.length ? 'Live' : 'Closed' },
    { name: 'Billing-Checker', time: metrics.activeBilling.length ? '10 min ago' : 'idle', latency: '1.1s', status: metrics.activeBilling.length ? 'Live' : 'Closed' },
  ];

  return (
    <div className="space-y-8 text-slate-950">
      <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-[radial-gradient(circle_at_20%_35%,rgba(251,191,36,0.34),transparent_28%),radial-gradient(circle_at_70%_25%,rgba(14,165,233,0.25),transparent_26%),linear-gradient(135deg,#f8fafc,#e0f2fe_48%,#ecfccb)] p-6 shadow-2xl shadow-slate-300/50 md:p-8">
        <div className="absolute inset-0 bg-white/25 backdrop-blur-[1px]" />
        <div className="relative space-y-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <Badge className="rounded-full border-0 bg-white/70 px-4 py-2 text-slate-900 shadow-sm">OpsPulse</Badge>
                {['Dashboard', 'Clients', 'Connect Data', 'Approvals', 'Settings'].map((item) => <span key={item} className="rounded-full border border-white/70 bg-white/45 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-xl">{item}</span>)}
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">Welcome Back, Con</h1>
              <p className="mt-2 text-sm text-slate-600">Your AI control room — monitoring agents, revenue, costs, onboarding and compliance.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/Onboarding" className="rounded-full border border-white/70 bg-white/50 px-5 py-3 text-sm font-bold text-slate-800 shadow-sm backdrop-blur-xl">New Agent</Link>
              <Link to="/ClientConnectors" className="rounded-full border border-white/70 bg-white/50 px-5 py-3 text-sm font-bold text-slate-800 shadow-sm backdrop-blur-xl">Connect Data</Link>
              <Link to="/AIDemo" className="rounded-full bg-yellow-300 px-5 py-3 text-sm font-bold text-slate-950 shadow-sm">Launch Demo</Link>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[0.7fr_1fr_0.75fr]">
            <div className="rounded-[30px] border border-white/55 bg-white/55 p-5 shadow-sm backdrop-blur-2xl">
              <h3 className="text-xl font-bold text-slate-950">Getting Started</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">Missing information needed to complete your live revenue system.</p>
              <div className="mt-4 flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${metrics.readinessScore}%` }} /></div><span className="text-sm font-bold text-emerald-700">{metrics.readinessScore}%</span></div>
              <div className="mt-4 space-y-3 rounded-2xl bg-white/70 p-4">
                {[["Create your first workspace", clients.length > 0], ["Deploy an AI agent", metrics.readinessScore > 40], ["Configure data connectors", metrics.readinessScore === 100], ["Set up approval workflows", tasks.length > 0]].map(([label, done]) => <div key={label} className="flex items-center gap-3 text-sm text-slate-700">{done ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <span className="h-4 w-4 rounded-full border border-slate-400" />}{label}</div>)}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <OpsMetricCard title="24h Intake" value={money(metrics.leads24h.length * 990)} delta="↗ live" subtitle="Lead/value proxy until Stripe events are wired" bars={sparkBars(28, 18)} />
              <OpsMetricCard title="24h AI Cost" value={money(metrics.aiCost24)} delta="↗ est" subtitle="Estimated from lead/support activity" bars={sparkBars(28, 23)} tone="amber" />
              <OpsMetricCard title="Success Rate" value={`${metrics.successRate}%`} delta="↗ ops" subtitle="Readiness + tasks + conversion blend" bars={sparkBars(28, 20)} />
              <OpsMetricCard title="P95 Latency" value={metrics.p95Latency} delta="↘ target" subtitle="Placeholder until Vapi latency API is wired" bars={sparkBars(28, 17)} tone={metrics.readinessScore < 80 ? 'amber' : 'green'} />
            </div>

            <CompliancePulse score={metrics.readinessScore} readinessGroups={metrics.readinessGroups} />
          </div>

          <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            <ForecastPanel title="30-day Intake Forecast" value={money(metrics.projected30)} helper={`${Math.max(1, metrics.leads24h.length)} active demand signal${metrics.leads24h.length === 1 ? '' : 's'}`} confidence={Math.max(55, Math.min(92, metrics.successRate - 5))} />
            <LiveRunsTable rows={liveRows} />
          </div>
        </div>
      </section>

      <HomeAnalyticsPanel />

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="admin-card p-6">
          <div className="mb-5 flex items-center justify-between gap-4"><div><p className="admin-kicker">Live operating risk</p><h2 className="mt-2 text-2xl font-bold text-slate-950">Command alerts</h2></div><AlertTriangle className="h-6 w-6 text-amber-500" /></div>
          <div className="space-y-3">
            {criticalAlerts.length === 0 ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">No critical admin alerts right now.</div> : criticalAlerts.map((alert) => <div key={alert} className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{alert}</div>)}
          </div>
        </div>

        <div className="admin-card p-6">
          <div className="mb-5 flex items-center justify-between gap-4"><div><p className="admin-kicker">Integration health</p><h2 className="mt-2 text-2xl font-bold text-slate-950">Connectors</h2></div><PlugZap className="h-6 w-6 text-slate-700" /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {metrics.readinessGroups.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Checking connector readiness...</div> : metrics.readinessGroups.map(([name, group]) => <div key={name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><p className="font-bold capitalize text-slate-950">{name}</p><StatusPill ready={group.ready} /></div><p className="mt-2 text-xs text-slate-500">{group.ready ? 'Configured and present' : `${group.missing.length} missing variable${group.missing.length === 1 ? '' : 's'}`}</p></div>)}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="admin-card p-6">
          <div className="mb-5 flex items-center justify-between gap-4"><div><p className="admin-kicker">Easy client onboarding</p><h2 className="mt-2 text-2xl font-bold text-slate-950">Connector launchpad</h2><p className="admin-muted mt-2 text-sm">A simple one-page path for setting up a new client without losing commercial or technical details.</p></div><Link2 className="h-6 w-6 text-slate-700" /></div>
          <div className="space-y-3">{connectorSteps.map((step, index) => <div key={step.name} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">{index + 1}</div><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-slate-950">{step.name}</h3><Badge className="border-0 bg-slate-100 text-slate-600">{step.owner}</Badge></div><p className="mt-1 text-sm text-slate-500">{step.detail}</p></div></div>)}</div>
        </div>

        <div className="space-y-6">
          <div className="admin-card p-6"><div className="mb-5 flex items-center justify-between gap-4"><div><p className="admin-kicker">Fast actions</p><h2 className="mt-2 text-2xl font-bold text-slate-950">Connect and launch</h2></div><Zap className="h-6 w-6 text-slate-700" /></div><div className="grid gap-3 sm:grid-cols-2">{connectorLinks.map((item) => <MiniLink key={item.href} item={item} />)}</div></div>
          <div className="admin-card p-6"><div className="mb-5 flex items-center justify-between gap-4"><div><p className="admin-kicker">Latest clients</p><h2 className="mt-2 text-2xl font-bold text-slate-950">Recent client records</h2></div><Activity className="h-6 w-6 text-slate-700" /></div><div className="space-y-3">{recentClientRows.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No client records yet.</div> : recentClientRows.map((client) => <Link key={client.id} to={`/ClientWorkspace?id=${client.id}`} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 transition hover:bg-slate-50"><div><p className="font-bold text-slate-950">{client.business_name || client.full_name || 'Unnamed client'}</p><p className="text-sm text-slate-500">{client.plan || 'Plan not set'} · {client.status || client.lifecycle_state || 'Status pending'}</p></div><ArrowUpRight className="h-4 w-4 text-slate-400" /></Link>)}</div></div>
        </div>
      </section>

      <section className="space-y-4"><div><p className="admin-kicker">Operations modules</p><h2 className="mt-2 text-2xl font-bold text-slate-950">Run the business</h2></div><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{operations.map((module) => <ModuleCard key={module.href} item={module} />)}</div></section>
      <section className="space-y-4"><div><p className="admin-kicker">Growth systems</p><h2 className="mt-2 text-2xl font-bold text-slate-950">Website, campaigns and market position</h2></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{growthModules.map((module) => <ModuleCard key={module.href} item={module} />)}</div></section>
    </div>
  );
}
