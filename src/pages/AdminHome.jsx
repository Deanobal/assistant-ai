import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { assistantApi } from '@/api/nativeClient';
import { Activity, AlertTriangle, ArrowUpRight, BarChart3, BookOpen, BriefcaseBusiness, CheckCircle2, ClipboardList, DollarSign, FileText, HelpCircle, Image, Inbox, Layers, LifeBuoy, Link2, MessageSquareQuote, Navigation, PlugZap, Radio, Rocket, Search, Settings, ShieldCheck, SlidersHorizontal, Sparkles, TrendingUp, Zap } from 'lucide-react';
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

function recordDate(record) {
  return record?.created_at || record?.created_date || record?.updated_at || record?.updated_date;
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

function moneyByCurrency(value, currency = 'AUD') {
  return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'en-AU', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value || 0);
}

function formatSeconds(value) {
  if (!Number.isFinite(Number(value))) return 'Not connected';
  const seconds = Math.round(Number(value));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder ? `${minutes}m ${remainder}s` : `${minutes}m`;
}

function formatAiCost(metric) {
  if (!metric?.connected) return 'Not connected';
  return moneyByCurrency(metric.value, metric.currency || 'AUD');
}

function formatLatency(metric) {
  if (!metric?.connected || !Number.isFinite(Number(metric.value_ms))) return 'Not connected';
  return `${Math.round(Number(metric.value_ms))}ms`;
}

function dateLabel(value) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return date.toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' });
}

function relativeTime(value) {
  if (!value) return 'Date unavailable';
  const date = new Date(value).getTime();
  if (Number.isNaN(date)) return 'Date unavailable';
  const minutes = Math.max(0, Math.floor((Date.now() - date) / 60000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
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

function LiveMetricCard({ title, value, subtitle, icon: Icon, tone = 'slate', badge = 'Live' }) {
  const toneClass = tone === 'red' ? 'bg-red-50 text-red-700' : tone === 'amber' ? 'bg-amber-50 text-amber-700' : tone === 'green' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700';
  return (
    <div className="rounded-[26px] border border-white/55 bg-white/70 p-5 shadow-sm backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2"><p className="text-sm font-medium text-slate-500">{title}</p><Badge className={`border-0 ${toneClass}`}>{badge}</Badge></div>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${toneClass}`}><Icon className="h-5 w-5" /></div>
      </div>
    </div>
  );
}

function ReadinessPanel({ score, readinessGroups }) {
  return (
    <div className="rounded-[30px] border border-white/55 bg-white/70 p-5 shadow-sm backdrop-blur-2xl">
      <div className="mb-4 flex items-center justify-between"><h3 className="text-xl font-bold text-slate-950">Integration readiness</h3><ShieldCheck className="h-5 w-5 text-slate-500" /></div>
      <div className="flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${score}%` }} /></div><span className="text-sm font-bold text-emerald-700">{score}%</span></div>
      <div className="mt-4 space-y-2 rounded-2xl bg-white/80 p-3">
        {readinessGroups.length === 0 ? <p className="text-sm text-slate-500">No readiness groups returned by config-status yet.</p> : readinessGroups.map(([name, group]) => <div key={name} className="flex items-center justify-between gap-3 text-xs"><span className="capitalize text-slate-600">{name}</span><StatusPill ready={group.ready} /></div>)}
      </div>
    </div>
  );
}

function LiveRecordsPanel({ title, rows, emptyText, renderRow, icon: Icon }) {
  return (
    <div className="admin-card p-6">
      <div className="mb-5 flex items-center justify-between gap-4"><div><p className="admin-kicker">Live records</p><h2 className="mt-2 text-2xl font-bold text-slate-950">{title}</h2></div>{Icon && <Icon className="h-6 w-6 text-slate-700" />}</div>
      <div className="space-y-3">
        {rows.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">{emptyText}</div> : rows.map(renderRow)}
      </div>
    </div>
  );
}

function LiveRunsTable({ rows }) {
  return (
    <div className="rounded-[26px] border border-white/55 bg-white/70 p-5 shadow-sm backdrop-blur-2xl">
      <div className="mb-4 flex items-center justify-between"><h3 className="font-bold text-slate-950"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />Live Runs Stream</h3><Badge className="border-0 bg-emerald-50 text-emerald-700">Live records</Badge></div>
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70">
        <div className="grid grid-cols-4 px-4 py-3 text-xs font-semibold text-slate-500"><span>Source</span><span>Record</span><span>Updated</span><span className="text-right">Status</span></div>
        {rows.length === 0 ? <div className="border-t border-slate-200/70 px-4 py-4 text-sm text-slate-500">No recent live records.</div> : rows.map((row) => <div key={row.key} className="grid grid-cols-4 border-t border-slate-200/70 px-4 py-3 text-sm text-slate-700"><span className="font-medium text-slate-900">{row.source}</span><span className="truncate">{row.name}</span><span>{row.time}</span><span className="text-right"><span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">{row.status}</span></span></div>)}
      </div>
    </div>
  );
}

export default function AdminHome() {
  const { data: leads = [], isFetching: leadsFetching } = useQuery({ queryKey: ['admin-home-leads'], queryFn: () => assistantApi.entities.Lead.list('-updated_date', 200), initialData: [] });
  const { data: clients = [], isFetching: clientsFetching } = useQuery({ queryKey: ['admin-home-clients'], queryFn: () => assistantApi.entities.Client.list('-updated_date', 200), initialData: [] });
  const { data: conversations = [], isFetching: conversationsFetching } = useQuery({ queryKey: ['admin-home-conversations'], queryFn: () => assistantApi.entities.SupportConversation.list('-updated_at', 200), initialData: [] });
  const { data: tasks = [], isFetching: tasksFetching } = useQuery({ queryKey: ['admin-home-tasks'], queryFn: () => assistantApi.entities.OnboardingTask.list('-updated_date', 500), initialData: [] });
  const { data: billingRecords = [], isFetching: billingFetching } = useQuery({ queryKey: ['admin-home-billing'], queryFn: () => assistantApi.entities.BillingStatus.list('-updated_date', 300), initialData: [] });
  const { data: configStatus = null, isFetching: configFetching } = useQuery({ queryKey: ['admin-home-config-status'], queryFn: () => fetch('/api/config-status').then((response) => response.json()), initialData: null });
  const { data: adminAiMetrics = null, isFetching: adminAiFetching } = useQuery({
    queryKey: ['admin-ai-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/admin-ai-metrics', { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.details || json?.error || 'Admin AI metrics unavailable');
      return json;
    },
    initialData: null,
    refetchInterval: 30000,
    retry: false,
    staleTime: 0,
  });

  const isRefreshing = leadsFetching || clientsFetching || conversationsFetching || tasksFetching || billingFetching || configFetching || adminAiFetching;

  const metrics = useMemo(() => {
    const openConversations = conversations.filter((item) => !['resolved', 'closed'].includes(item.status));
    const unreadConversations = conversations.filter((item) => item.unread_for_admin && !['resolved', 'closed'].includes(item.status));
    const newLeads = leads.filter((lead) => lead.status === 'New Lead');
    const wonLeads = leads.filter((lead) => lead.status === 'Won');
    const leads24h = leads.filter((lead) => isWithinHours(recordDate(lead), 24));
    const onboardingClients = clients.filter((client) => client.lifecycle_state !== 'live' && client.status !== 'Live');
    const liveClients = clients.filter((client) => client.lifecycle_state === 'live' || client.status === 'Live');
    const overdueTasks = tasks.filter((task) => task.due_date && !task.completed && new Date(task.due_date) < new Date());
    const completedTasks = tasks.filter((task) => task.completed);
    const requiredTasks = tasks.filter((task) => task.required);
    const blockedTasks = tasks.filter((task) => task.blocked);
    const readinessGroups = Object.entries(configStatus?.status || {});
    const readyGroups = readinessGroups.filter(([, group]) => group.ready).length;
    const readinessScore = readinessGroups.length ? percentage(readyGroups, readinessGroups.length) : 0;
    const taskCompletion = tasks.length ? percentage(completedTasks.length, tasks.length) : 0;
    const conversionRate = leads.length ? percentage(wonLeads.length, leads.length) : 0;
    const activeBilling = billingRecords.filter((item) => item.billing_status === 'active');
    const billing24h = billingRecords.filter((item) => isWithinHours(recordDate(item), 24));
    const setupRecorded = activeBilling.reduce((sum, item) => sum + Number(item.setup_fee || 0), 0);
    const monthlyRecurring = activeBilling.reduce((sum, item) => sum + Number(item.monthly_fee || 0), 0);
    const intake24h = billing24h.reduce((sum, item) => sum + Number(item.setup_fee || 0) + Number(item.monthly_fee || 0), 0);
    const liveRows = [
      ...leads.slice(0, 4).map((lead) => ({ key: `lead-${lead.id || recordDate(lead)}`, source: 'Lead', name: lead.full_name || lead.name || lead.business_name || 'Unnamed lead', time: relativeTime(recordDate(lead)), status: lead.status || 'Open' })),
      ...clients.slice(0, 4).map((client) => ({ key: `client-${client.id || recordDate(client)}`, source: 'Client', name: client.business_name || client.full_name || 'Unnamed client', time: relativeTime(recordDate(client)), status: client.status || client.lifecycle_state || 'Active' })),
      ...tasks.slice(0, 4).map((task) => ({ key: `task-${task.id || task.task_name}`, source: 'Task', name: task.task_name || 'Unnamed task', time: relativeTime(recordDate(task)), status: task.completed ? 'Done' : task.blocked ? 'Blocked' : 'Open' })),
      ...conversations.slice(0, 4).map((conversation) => ({ key: `conversation-${conversation.id || recordDate(conversation)}`, source: 'Support', name: conversation.subject || conversation.customer_name || 'Conversation', time: relativeTime(recordDate(conversation)), status: conversation.status || 'Open' })),
    ].sort((a, b) => String(a.time).localeCompare(String(b.time))).slice(0, 8);
    return { openConversations, unreadConversations, newLeads, wonLeads, leads24h, onboardingClients, liveClients, overdueTasks, completedTasks, requiredTasks, blockedTasks, readinessGroups, readyGroups, readinessScore, taskCompletion, conversionRate, activeBilling, billing24h, setupRecorded, monthlyRecurring, intake24h, liveRows };
  }, [leads, clients, conversations, tasks, billingRecords, configStatus]);

  const criticalAlerts = [
    ...(metrics.unreadConversations.length ? [`${metrics.unreadConversations.length} unread client/support conversations`] : []),
    ...(metrics.overdueTasks.length ? [`${metrics.overdueTasks.length} overdue onboarding tasks`] : []),
    ...(metrics.blockedTasks.length ? [`${metrics.blockedTasks.length} blocked onboarding tasks`] : []),
    ...(metrics.readinessGroups.length && metrics.readinessScore < 100 ? [`${100 - metrics.readinessScore}% integration readiness gap`] : []),
    ...(metrics.newLeads.length ? [`${metrics.newLeads.length} new leads need qualification`] : []),
  ];

  const recentClientRows = clients.slice(0, 5);
  const recentLeadRows = leads.slice(0, 5);
  const recentTaskRows = tasks.filter((task) => !task.completed).slice(0, 5);
  const aiOperationalMetrics = adminAiMetrics?.metrics || {};
  const aiCalls24h = aiOperationalMetrics.calls_24h || 0;
  const aiCostMetric = aiOperationalMetrics.ai_cost_24h || {};
  const aiLatencyMetric = aiOperationalMetrics.p95_latency || {};
  const aiDurationMetric = aiOperationalMetrics.p95_call_duration || {};
  const aiCostConnected = Boolean(aiCostMetric.connected);
  const aiLatencyConnected = Boolean(aiLatencyMetric.connected);
  const aiDurationConnected = Boolean(aiDurationMetric.connected);
  const aiCostSubtitle = aiCostConnected
    ? `From ${aiCostMetric.field} across ${aiCalls24h} call records in 24h`
    : `${aiCalls24h} call records checked; no real cost field connected`;
  const aiLatencySubtitle = aiLatencyConnected
    ? `From ${aiLatencyMetric.field} on call_records`
    : aiDurationConnected
      ? `No latency field yet. P95 call duration is ${formatSeconds(aiDurationMetric.value_seconds)}`
      : `${aiCalls24h} call records checked; no latency field connected`;

  return (
    <div className="space-y-8 text-slate-950">
      <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-[linear-gradient(135deg,#f8fafc,#e0f2fe_48%,#ecfccb)] p-6 shadow-2xl shadow-slate-300/50 md:p-8">
        <div className="absolute inset-0 bg-white/25 backdrop-blur-[1px]" />
        <div className="relative space-y-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <Badge className="rounded-full border-0 bg-white/70 px-4 py-2 text-slate-900 shadow-sm">Live Admin Console</Badge>
                <Badge className={`rounded-full border-0 px-4 py-2 shadow-sm ${isRefreshing ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{isRefreshing ? 'Refreshing live data' : 'Live data loaded'}</Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">AssistantAI admin console</h1>
              <p className="mt-2 text-sm text-slate-600">Live Supabase records, first-party analytics and configuration status. AI cost and latency widgets check live call records and only show values when real source fields exist.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/Onboarding" className="rounded-full border border-white/70 bg-white/50 px-5 py-3 text-sm font-bold text-slate-800 shadow-sm backdrop-blur-xl">New client</Link>
              <Link to="/ClientConnectors" className="rounded-full border border-white/70 bg-white/50 px-5 py-3 text-sm font-bold text-slate-800 shadow-sm backdrop-blur-xl">Connect data</Link>
              <Link to="/LeadDashboard" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-sm">Review leads</Link>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[0.7fr_1fr_0.75fr]">
            <div className="rounded-[30px] border border-white/55 bg-white/70 p-5 shadow-sm backdrop-blur-2xl">
              <h3 className="text-xl font-bold text-slate-950">Setup readiness</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">Live completion status from configuration checks and onboarding tasks.</p>
              <div className="mt-4 space-y-4">
                <div><div className="mb-2 flex justify-between text-xs font-semibold text-slate-600"><span>Integration readiness</span><span>{metrics.readinessScore}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${metrics.readinessScore}%` }} /></div></div>
                <div><div className="mb-2 flex justify-between text-xs font-semibold text-slate-600"><span>Task completion</span><span>{metrics.taskCompletion}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-slate-900" style={{ width: `${metrics.taskCompletion}%` }} /></div></div>
              </div>
              <div className="mt-4 space-y-3 rounded-2xl bg-white/80 p-4">
                {[
                  ['Client records present', clients.length > 0],
                  ['Live clients present', metrics.liveClients.length > 0],
                  ['Billing records present', billingRecords.length > 0],
                  ['Required onboarding tasks complete', metrics.requiredTasks.length ? metrics.requiredTasks.every((task) => task.completed) : false],
                ].map(([text, done]) => <div key={text} className="flex items-center gap-3 text-sm text-slate-700">{done ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <span className="h-4 w-4 rounded-full border border-slate-400" />}{text}</div>)}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <LiveMetricCard title="24h Intake" value={money(metrics.intake24h)} subtitle={`${metrics.billing24h.length} billing records updated or created in 24h`} icon={DollarSign} tone="green" />
              <LiveMetricCard title="24h AI Cost" value={formatAiCost(aiCostMetric)} subtitle={aiCostSubtitle} icon={Zap} tone={aiCostConnected ? 'green' : 'amber'} badge={aiCostConnected ? 'Live' : 'Source needed'} />
              <LiveMetricCard title="Success Rate" value={`${metrics.conversionRate}%`} subtitle={`${metrics.wonLeads.length} won leads from ${leads.length} lead records`} icon={TrendingUp} tone="green" />
              <LiveMetricCard title="P95 Latency" value={formatLatency(aiLatencyMetric)} subtitle={aiLatencySubtitle} icon={Radio} tone={aiLatencyConnected ? 'green' : 'amber'} badge={aiLatencyConnected ? 'Live' : 'Source needed'} />
            </div>

            <ReadinessPanel score={metrics.readinessScore} readinessGroups={metrics.readinessGroups} />
          </div>

          <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            <LiveMetricCard title="30-day Intake" value={money(metrics.monthlyRecurring)} subtitle="Current monthly recurring total from active billing records" icon={DollarSign} tone="green" />
            <LiveRunsTable rows={metrics.liveRows} />
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <LiveMetricCard title="Active billing records" value={metrics.activeBilling.length} subtitle={`${money(metrics.monthlyRecurring)} monthly recurring recorded`} icon={DollarSign} tone="green" />
            <LiveMetricCard title="Setup fees recorded" value={money(metrics.setupRecorded)} subtitle="Sum of setup_fee on active billing records" icon={DollarSign} tone="slate" />
            <LiveMetricCard title="Lead conversion" value={`${metrics.conversionRate}%`} subtitle={`${metrics.wonLeads.length} won leads from ${leads.length} lead records`} icon={TrendingUp} tone="green" />
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
            {metrics.readinessGroups.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No connector readiness groups returned by config-status.</div> : metrics.readinessGroups.map(([name, group]) => <div key={name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><p className="font-bold capitalize text-slate-950">{name}</p><StatusPill ready={group.ready} /></div><p className="mt-2 text-xs text-slate-500">{group.ready ? 'Configured and present' : `${group.missing.length} missing variable${group.missing.length === 1 ? '' : 's'}`}</p></div>)}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="admin-card p-6">
          <div className="mb-5 flex items-center justify-between gap-4"><div><p className="admin-kicker">Easy client onboarding</p><h2 className="mt-2 text-2xl font-bold text-slate-950">Connector launchpad</h2><p className="admin-muted mt-2 text-sm">A one-page path for setting up a new client without losing commercial or technical details.</p></div><Link2 className="h-6 w-6 text-slate-700" /></div>
          <div className="space-y-3">{connectorSteps.map((step, index) => <div key={step.name} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">{index + 1}</div><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-slate-950">{step.name}</h3><Badge className="border-0 bg-slate-100 text-slate-600">{step.owner}</Badge></div><p className="mt-1 text-sm text-slate-500">{step.detail}</p></div></div>)}</div>
        </div>

        <div className="space-y-6">
          <div className="admin-card p-6"><div className="mb-5 flex items-center justify-between gap-4"><div><p className="admin-kicker">Fast actions</p><h2 className="mt-2 text-2xl font-bold text-slate-950">Connect and launch</h2></div><Zap className="h-6 w-6 text-slate-700" /></div><div className="grid gap-3 sm:grid-cols-2">{connectorLinks.map((item) => <MiniLink key={item.href} item={item} />)}</div></div>
          <LiveRecordsPanel title="Recent client records" rows={recentClientRows} emptyText="No client records yet." icon={Activity} renderRow={(client) => <Link key={client.id} to={`/ClientWorkspace?id=${client.id}`} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 transition hover:bg-slate-50"><div><p className="font-bold text-slate-950">{client.business_name || client.full_name || 'Unnamed client'}</p><p className="text-sm text-slate-500">{client.plan || 'Plan not set'} · {client.status || client.lifecycle_state || 'Status pending'}</p></div><ArrowUpRight className="h-4 w-4 text-slate-400" /></Link>} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <LiveRecordsPanel title="Recent lead records" rows={recentLeadRows} emptyText="No lead records yet." icon={BarChart3} renderRow={(lead) => <Link key={lead.id} to={`/LeadDetail?id=${lead.id}`} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 transition hover:bg-slate-50"><div><p className="font-bold text-slate-950">{lead.full_name || lead.name || lead.business_name || 'Unnamed lead'}</p><p className="text-sm text-slate-500">{lead.status || 'Status pending'} · {dateLabel(recordDate(lead))}</p></div><ArrowUpRight className="h-4 w-4 text-slate-400" /></Link>} />
        <LiveRecordsPanel title="Open onboarding tasks" rows={recentTaskRows} emptyText="No open onboarding tasks." icon={ClipboardList} renderRow={(task) => <div key={task.id || task.task_name} className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-slate-950">{task.task_name || 'Unnamed task'}</p><p className="text-sm text-slate-500">{task.task_phase || 'Setup'} · {task.due_date ? `Due ${task.due_date}` : 'No due date'}</p></div>{task.blocked && <Badge className="border-0 bg-red-50 text-red-700">Blocked</Badge>}</div></div>} />
      </section>

      <section className="space-y-4"><div><p className="admin-kicker">Operations modules</p><h2 className="mt-2 text-2xl font-bold text-slate-950">Run the business</h2></div><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{operations.map((module) => <ModuleCard key={module.href} item={module} />)}</div></section>
      <section className="space-y-4"><div><p className="admin-kicker">Growth systems</p><h2 className="mt-2 text-2xl font-bold text-slate-950">Website, campaigns and market position</h2></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{growthModules.map((module) => <ModuleCard key={module.href} item={module} />)}</div></section>
    </div>
  );
}
