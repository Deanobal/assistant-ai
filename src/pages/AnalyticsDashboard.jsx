import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, BarChart3, Clock3, Globe2, MousePointerClick, Radio, Search, Smartphone, TrendingUp, Users } from 'lucide-react';

function formatNumber(value) {
  return new Intl.NumberFormat('en-AU').format(value || 0);
}

function percent(value) {
  return `${Math.round(value || 0)}%`;
}

function MetricCard({ title, value, subtitle, icon: Icon, tone = 'slate' }) {
  const toneClass = tone === 'green' ? 'bg-emerald-50 text-emerald-700' : tone === 'blue' ? 'bg-sky-50 text-sky-700' : tone === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700';
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function BarList({ title, rows, emptyText = 'No data yet.' }) {
  const max = Math.max(...(rows || []).map((row) => row.count), 1);
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-slate-950">{title}</h3>
      <div className="mt-5 space-y-3">
        {rows?.length ? rows.map((row) => (
          <div key={row.name}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-medium text-slate-700">{row.name}</span>
              <span className="font-bold text-slate-950">{formatNumber(row.count)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-slate-900" style={{ width: `${Math.max(6, (row.count / max) * 100)}%` }} />
            </div>
          </div>
        )) : <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">{emptyText}</p>}
      </div>
    </div>
  );
}

function HourlyChart({ series }) {
  const max = Math.max(...(series || []).map((item) => item.count), 1);
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-950">Page views by hour</h3>
          <p className="text-sm text-slate-500">Last 24 hours from first-party site tracking</p>
        </div>
        <BarChart3 className="h-5 w-5 text-slate-400" />
      </div>
      <div className="flex h-44 items-end gap-1.5 overflow-hidden rounded-2xl bg-slate-50 p-4">
        {(series || []).map((item) => (
          <div key={item.time} className="flex flex-1 flex-col items-center justify-end gap-2">
            <div className="w-full rounded-t-lg bg-slate-900" style={{ height: `${Math.max(4, (item.count / max) * 132)}px` }} title={`${item.count} views`} />
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentEvents({ events }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-950">Live activity stream</h3>
          <p className="text-sm text-slate-500">Most recent website events</p>
        </div>
        <Radio className="h-5 w-5 text-emerald-600" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="grid grid-cols-[1.1fr_1.2fr_0.8fr_0.8fr] bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
          <span>Time</span><span>Page</span><span>Device</span><span>Country</span>
        </div>
        {events?.length ? events.map((event) => (
          <div key={`${event.created_at}-${event.session_id}-${event.page_path}`} className="grid grid-cols-[1.1fr_1.2fr_0.8fr_0.8fr] border-t border-slate-200 px-4 py-3 text-sm text-slate-700">
            <span>{new Date(event.created_at).toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' })}</span>
            <span className="truncate font-medium text-slate-950">{event.page_path || '/'}</span>
            <span>{event.device_type || 'Unknown'}</span>
            <span>{event.country || 'Unknown'}</span>
          </div>
        )) : <div className="border-t border-slate-200 px-4 py-5 text-sm text-slate-500">No tracked website events yet. Deploy the tracker and visit the public site to start collecting data.</div>}
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: async () => {
      const response = await fetch('/api/analytics-summary');
      const json = await response.json();
      if (!response.ok) throw new Error(json?.details || json?.error || 'Analytics unavailable');
      return json;
    },
    refetchInterval: 30000,
  });

  const metrics = data?.metrics || {};
  const breakdowns = data?.breakdowns || {};
  const series = data?.series || {};
  const recent = data?.recent || {};

  const conversionSubtitle = useMemo(() => `${formatNumber(metrics.leads_24h)} leads from ${formatNumber(metrics.visitors_24h)} visitors`, [metrics.leads_24h, metrics.visitors_24h]);

  if (isLoading) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600">Loading live analytics...</div>;
  }

  return (
    <div className="space-y-8 text-slate-950">
      <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.22),transparent_28%),radial-gradient(circle_at_80%_15%,rgba(34,197,94,0.18),transparent_26%),linear-gradient(135deg,#ffffff,#f1f5f9)] p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-700">Live Analytics</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">Store-style site intelligence</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">First-party tracking for live visitors, sessions, page views, top pages, sources, devices, leads, calls, and conversion signals.</p>
          </div>
          <button onClick={() => refetch()} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">Refresh</button>
        </div>
        {error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error.message}</div>}
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Live visitors" value={formatNumber(metrics.active_visitors)} subtitle="Active in last 30 minutes" icon={Radio} tone="green" />
        <MetricCard title="Visitors 24h" value={formatNumber(metrics.visitors_24h)} subtitle={`${formatNumber(metrics.sessions_24h)} sessions`} icon={Users} tone="blue" />
        <MetricCard title="Page views 24h" value={formatNumber(metrics.page_views_24h)} subtitle={`${metrics.avg_pages_per_session || 0} pages per session`} icon={MousePointerClick} />
        <MetricCard title="Conversion rate" value={percent(metrics.conversion_rate_24h)} subtitle={conversionSubtitle} icon={TrendingUp} tone="green" />
        <MetricCard title="Leads 24h" value={formatNumber(metrics.leads_24h)} subtitle="Captured lead records" icon={Search} tone="amber" />
        <MetricCard title="Calls 24h" value={formatNumber(metrics.calls_24h)} subtitle="Call records ingested" icon={Activity} />
        <MetricCard title="Visitors 7d" value={formatNumber(metrics.visitors_7d)} subtitle="Weekly unique visitors" icon={Clock3} tone="blue" />
        <MetricCard title="Primary device" value={breakdowns.devices?.[0]?.name || 'Unknown'} subtitle={`${formatNumber(breakdowns.devices?.[0]?.count)} events`} icon={Smartphone} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <HourlyChart series={series.hourly_page_views || []} />
        <BarList title="Live pages right now" rows={breakdowns.live_pages || []} emptyText="No active pages in the last 30 minutes." />
        <BarList title="Top pages" rows={breakdowns.top_pages || []} />
        <BarList title="Traffic sources" rows={(breakdowns.sources?.length ? breakdowns.sources : breakdowns.referrers) || []} />
        <BarList title="Devices" rows={breakdowns.devices || []} />
        <BarList title="Browsers" rows={breakdowns.browsers || []} />
        <BarList title="Countries" rows={breakdowns.countries || []} />
        <RecentEvents events={recent.events || []} />
      </section>

      <section className="rounded-[28px] border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-900">
        <strong>Important:</strong> this dashboard is first-party AssistantAI tracking. It starts collecting from the deployment that includes the tracker and requires the <code>site_events</code> Supabase migration. Google Analytics/Search Console can be connected later for external search and acquisition data.
      </section>
    </div>
  );
}
