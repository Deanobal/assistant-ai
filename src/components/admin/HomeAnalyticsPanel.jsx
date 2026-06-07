import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Activity, ArrowUpRight, BarChart3, MousePointerClick, Radio, RefreshCw, Search, Target, TrendingUp, Users, Zap } from 'lucide-react';

function formatNumber(value) {
  return new Intl.NumberFormat('en-AU').format(value || 0);
}

function percent(value) {
  return `${Math.round((value || 0) * 10) / 10}%`;
}

function timeAgo(value) {
  if (!value) return 'Waiting for data';
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function Delta({ value }) {
  const positive = value > 0;
  const neutral = !value;
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${neutral ? 'bg-slate-100 text-slate-500' : positive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
      {neutral ? '0%' : `${positive ? '+' : ''}${value}%`}
    </span>
  );
}

function MiniMetric({ title, value, helper, icon: Icon, delta, tone = 'slate' }) {
  const toneClass = tone === 'green' ? 'bg-emerald-50 text-emerald-700' : tone === 'blue' ? 'bg-sky-50 text-sky-700' : tone === 'amber' ? 'bg-amber-50 text-amber-700' : tone === 'purple' ? 'bg-violet-50 text-violet-700' : 'bg-slate-100 text-slate-700';
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
            {delta !== undefined && <Delta value={delta} />}
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{helper}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${toneClass}`}><Icon className="h-4 w-4" /></div>
      </div>
    </div>
  );
}

function CompactBars({ series = [] }) {
  const max = Math.max(...series.map((item) => item.count), 1);
  return (
    <div className="flex h-28 items-end gap-1 overflow-hidden rounded-2xl bg-slate-50 p-3">
      {series.slice(-32).map((item) => (
        <span key={item.time} className="flex-1 rounded-t bg-slate-900" style={{ height: `${Math.max(4, (item.count / max) * 88)}px` }} title={`${item.count} page views`} />
      ))}
    </div>
  );
}

function SmallList({ title, rows, emptyText }) {
  const max = Math.max(...(rows || []).map((row) => row.count), 1);
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="font-bold text-slate-950">{title}</h3>
      <div className="mt-4 space-y-3">
        {rows?.length ? rows.slice(0, 5).map((row) => (
          <div key={row.name}>
            <div className="mb-1 flex items-center justify-between gap-3 text-xs">
              <span className="truncate font-semibold text-slate-700">{row.name}</span>
              <span className="font-bold text-slate-950">{formatNumber(row.count)}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-900" style={{ width: `${Math.max(6, (row.count / max) * 100)}%` }} /></div>
          </div>
        )) : <p className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-500">{emptyText}</p>}
      </div>
    </div>
  );
}

export default function HomeAnalyticsPanel() {
  const { data, isFetching, refetch } = useQuery({
    queryKey: ['admin-home-analytics-summary'],
    queryFn: async () => {
      const response = await fetch(`/api/analytics-summary?range=24h&home=1&refresh=${Date.now()}`, { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.details || json?.error || 'Analytics unavailable');
      return json;
    },
    refetchInterval: 30000,
    staleTime: 0,
  });

  const metrics = data?.metrics || {};
  const breakdowns = data?.breakdowns || {};
  const series = data?.series || {};
  const recentEvents = data?.recent?.events || [];

  return (
    <section className="admin-card p-6">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="admin-kicker">Live website analytics</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">Storefront pulse</h2>
          <p className="admin-muted mt-2 text-sm">24-hour overview from first-party site tracking. Last updated {timeAgo(data?.generated_at)}.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} disabled={isFetching} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Refreshing' : 'Refresh'}
          </button>
          <Link to="/Analytics" className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-slate-800">
            Full analytics
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniMetric title="Live visitors" value={formatNumber(metrics.active_visitors)} helper="Active last 30 min" icon={Radio} tone="green" />
        <MiniMetric title="Visitors" value={formatNumber(metrics.visitors)} helper={`${formatNumber(metrics.sessions)} sessions`} icon={Users} tone="blue" delta={metrics.deltas?.visitors} />
        <MiniMetric title="Page views" value={formatNumber(metrics.page_views)} helper={`${metrics.avg_pages_per_session || 0} pages/session`} icon={MousePointerClick} delta={metrics.deltas?.page_views} />
        <MiniMetric title="Conversion" value={percent(metrics.conversion_rate)} helper={`${formatNumber(metrics.leads)} leads captured`} icon={TrendingUp} tone="green" delta={metrics.deltas?.conversion_rate} />
        <MiniMetric title="CTA clicks" value={formatNumber(metrics.clicks)} helper={`${formatNumber(metrics.form_submits)} form submits`} icon={Zap} tone="purple" delta={metrics.deltas?.clicks} />
        <MiniMetric title="Checkout starts" value={formatNumber(metrics.checkout_starts)} helper="Get Started intent" icon={Target} tone="amber" />
        <MiniMetric title="Leads" value={formatNumber(metrics.leads)} helper="Lead records" icon={Search} tone="amber" delta={metrics.deltas?.leads} />
        <MiniMetric title="Calls" value={formatNumber(metrics.calls)} helper="Call records" icon={Activity} delta={metrics.deltas?.calls} />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between"><h3 className="font-bold text-slate-950">24h page views</h3><BarChart3 className="h-5 w-5 text-slate-400" /></div>
          <CompactBars series={series.page_views || []} />
        </div>
        <SmallList title="Top pages" rows={breakdowns.top_pages || []} emptyText="No page views yet." />
        <SmallList title="Top CTAs" rows={breakdowns.cta_labels || []} emptyText="CTA clicks will appear after users click buttons." />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <SmallList title="Traffic sources" rows={(breakdowns.sources?.length ? breakdowns.sources : breakdowns.referrers) || []} emptyText="No source data yet." />
        <SmallList title="Devices" rows={breakdowns.devices || []} emptyText="No device data yet." />
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="font-bold text-slate-950">Recent activity</h3>
          <div className="mt-4 space-y-2">
            {recentEvents.length ? recentEvents.slice(0, 5).map((event) => (
              <div key={`${event.created_at}-${event.event_type}-${event.page_path}`} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2 text-xs">
                <span className="truncate font-semibold text-slate-700">{event.event_type} · {event.page_path || '/'}</span>
                <span className="shrink-0 text-slate-500">{new Date(event.created_at).toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' })}</span>
              </div>
            )) : <p className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-500">No recent tracked events yet.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
