import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, BarChart3, ClipboardCheck, CreditCard, Globe2, MapPin, MessageSquareText, Monitor, MousePointerClick, PhoneCall, Radio, RefreshCw, Search, Smartphone, Target, TrendingUp, Users, Zap } from 'lucide-react';
import GoogleAcquisitionPanel from '@/components/analytics/GoogleAcquisitionPanel';

const ranges = [
  { key: '1h', label: '1 hour' },
  { key: '8h', label: '8 hours' },
  { key: '24h', label: '24 hours' },
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
];

function formatNumber(value) {
  return new Intl.NumberFormat('en-AU').format(value || 0);
}

function percent(value) {
  return `${Math.round((value || 0) * 10) / 10}%`;
}

function timeAgo(value) {
  if (!value) return 'Never';
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function DeltaBadge({ value }) {
  const positive = value > 0;
  const neutral = value === 0 || value === undefined || value === null;
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${neutral ? 'bg-slate-100 text-slate-500' : positive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
      {neutral ? '0%' : `${positive ? '+' : ''}${value}%`}
    </span>
  );
}

function MetricCard({ title, value, subtitle, icon: Icon, delta, tone = 'slate' }) {
  const toneClass = tone === 'green' ? 'bg-emerald-50 text-emerald-700' : tone === 'blue' ? 'bg-sky-50 text-sky-700' : tone === 'amber' ? 'bg-amber-50 text-amber-700' : tone === 'purple' ? 'bg-violet-50 text-violet-700' : 'bg-slate-100 text-slate-700';
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            {delta !== undefined && <DeltaBadge value={delta} />}
          </div>
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

function BarList({ title, rows, emptyText = 'No data yet.', icon: Icon, valueRenderer }) {
  const max = Math.max(...(rows || []).map((row) => row.count), 1);
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-950">{title}</h3>
        {Icon && <Icon className="h-5 w-5 text-slate-400" />}
      </div>
      <div className="mt-5 space-y-3">
        {rows?.length ? rows.map((row) => (
          <div key={`${row.name}-${row.page || ''}`}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-medium text-slate-700">{row.name}</span>
              <span className="font-bold text-slate-950">{valueRenderer ? valueRenderer(row) : formatNumber(row.count)}</span>
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

function TimeChart({ title, subtitle, series, secondarySeries, thirdSeries }) {
  const max = Math.max(...(series || []).map((item) => item.count), ...(secondarySeries || []).map((item) => item.count), ...(thirdSeries || []).map((item) => item.count), 1);
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-950">{title}</h3>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        <BarChart3 className="h-5 w-5 text-slate-400" />
      </div>
      <div className="flex h-48 items-end gap-1.5 overflow-hidden rounded-2xl bg-slate-50 p-4">
        {(series || []).map((item, index) => (
          <div key={item.time} className="flex flex-1 flex-col items-center justify-end gap-1">
            {thirdSeries?.[index] && <div className="w-full rounded-t-lg bg-emerald-400" style={{ height: `${Math.max(2, (thirdSeries[index].count / max) * 44)}px` }} title={`${thirdSeries[index].count} conversion intents`} />}
            {secondarySeries?.[index] && <div className="w-full rounded-t-lg bg-slate-300" style={{ height: `${Math.max(2, (secondarySeries[index].count / max) * 50)}px` }} title={`${secondarySeries[index].count} clicks`} />}
            <div className="w-full rounded-t-lg bg-slate-900" style={{ height: `${Math.max(4, (item.count / max) * 132)}px` }} title={`${item.count} views`} />
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-900" /> Page views</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-300" /> Clicks</span>
        {thirdSeries && <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Conversion intents</span>}
      </div>
    </div>
  );
}

function FunnelCard({ rows }) {
  const max = Math.max(...(rows || []).map((row) => row.count), 1);
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-950">Conversion funnel</h3>
          <p className="text-sm text-slate-500">Visitors through to captured leads</p>
        </div>
        <Target className="h-5 w-5 text-slate-400" />
      </div>
      <div className="space-y-3">
        {(rows || []).map((row) => (
          <div key={row.name} className="rounded-2xl border border-slate-200 p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-800">{row.name}</span>
              <span className="font-bold text-slate-950">{formatNumber(row.count)} · {percent(row.rate)}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-slate-900" style={{ width: `${Math.max(4, (row.count / max) * 100)}%` }} />
            </div>
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
        <div className="grid grid-cols-[0.8fr_0.8fr_1.2fr_0.8fr_0.8fr] bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
          <span>Time</span><span>Event</span><span>Page</span><span>Device</span><span>City</span>
        </div>
        {events?.length ? events.map((event) => (
          <div key={`${event.created_at}-${event.session_id}-${event.page_path}-${event.event_type}`} className="grid grid-cols-[0.8fr_0.8fr_1.2fr_0.8fr_0.8fr] border-t border-slate-200 px-4 py-3 text-sm text-slate-700">
            <span>{new Date(event.created_at).toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' })}</span>
            <span className="font-medium text-slate-950">{event.event_type || 'event'}</span>
            <span className="truncate font-medium text-slate-950">{event.page_path || '/'}</span>
            <span>{event.device_type || 'Unknown'}</span>
            <span>{event.city || event.country || 'Unknown'}</span>
          </div>
        )) : <div className="border-t border-slate-200 px-4 py-5 text-sm text-slate-500">No tracked website events yet. Visit the public site to start collecting data.</div>}
      </div>
    </div>
  );
}

function RecentConversions({ events }) {
  return (
    <div className="rounded-[28px] border border-emerald-200 bg-white p-5 shadow-sm xl:col-span-2">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-950">Recent conversion intent</h3>
          <p className="text-sm text-slate-500">Demo, signup, pricing, contact, strategy call, and form events</p>
        </div>
        <ClipboardCheck className="h-5 w-5 text-emerald-600" />
      </div>
      <div className="space-y-3">
        {events?.length ? events.slice(0, 12).map((event) => (
          <div key={`${event.created_at}-${event.event_type}-${event.page_path}-${event.label}`} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-950">{event.label}</p>
                <p className="mt-1 text-xs text-slate-500">{event.event_type} · {event.intent || 'intent'} · {event.page_path}</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{timeAgo(event.created_at)}</span>
            </div>
          </div>
        )) : <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Conversion intent events will appear after visitors click key CTAs or submit forms.</p>}
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [range, setRange] = useState('24h');
  const [manualRefreshes, setManualRefreshes] = useState(0);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['analytics-summary', range, manualRefreshes],
    queryFn: async () => {
      const response = await fetch(`/api/analytics-summary?range=${range}&refresh=${Date.now()}`, { cache: 'no-store' });
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
  const recent = data?.recent || {};
  const funnel = data?.funnel || [];

  const conversionSubtitle = useMemo(() => `${formatNumber(metrics.leads)} leads from ${formatNumber(metrics.visitors)} visitors`, [metrics.leads, metrics.visitors]);
  const selectedRange = ranges.find((item) => item.key === range)?.label || '24 hours';

  if (isLoading) return <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600">Loading live analytics...</div>;

  return (
    <div className="space-y-8 text-slate-950">
      <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.22),transparent_28%),radial-gradient(circle_at_80%_15%,rgba(34,197,94,0.18),transparent_26%),linear-gradient(135deg,#ffffff,#f1f5f9)] p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-700">Live Analytics</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">Store-style site intelligence</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">Shopify-style reporting for live visitors, sessions, page views, CTA clicks, conversion intent, sources, devices, leads, calls, and revenue movement.</p>
            <p className="mt-2 text-sm text-slate-500">Last updated {timeAgo(data?.generated_at)} · Auto-refresh every 30 seconds</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white/75 p-1 shadow-sm">
              {ranges.map((item) => (
                <button key={item.key} onClick={() => setRange(item.key)} className={`rounded-xl px-3 py-2 text-sm font-bold transition ${range === item.key ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                  {item.label}
                </button>
              ))}
            </div>
            <button onClick={() => { setManualRefreshes((value) => value + 1); refetch(); }} disabled={isFetching} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60">
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Refreshing' : 'Refresh'}
            </button>
          </div>
        </div>
        {error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error.message}</div>}
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Live visitors" value={formatNumber(metrics.active_visitors)} subtitle="Active in last 30 minutes" icon={Radio} tone="green" />
        <MetricCard title={`Visitors · ${selectedRange}`} value={formatNumber(metrics.visitors)} subtitle={`${formatNumber(metrics.sessions)} sessions`} icon={Users} tone="blue" delta={metrics.deltas?.visitors} />
        <MetricCard title="Page views" value={formatNumber(metrics.page_views)} subtitle={`${metrics.avg_pages_per_session || 0} pages per session`} icon={MousePointerClick} delta={metrics.deltas?.page_views} />
        <MetricCard title="Conversion rate" value={percent(metrics.conversion_rate)} subtitle={conversionSubtitle} icon={TrendingUp} tone="green" delta={metrics.deltas?.conversion_rate} />
        <MetricCard title="Conversion intents" value={formatNumber(metrics.conversion_events)} subtitle={`${percent(metrics.intent_rate)} visitor/session intent rate`} icon={ClipboardCheck} tone="green" delta={metrics.deltas?.conversion_events} />
        <MetricCard title="Demo intents" value={formatNumber(metrics.demo_intents)} subtitle="Talk to AI receptionist clicks" icon={PhoneCall} tone="purple" />
        <MetricCard title="Pricing intents" value={formatNumber(metrics.pricing_intents)} subtitle="Pricing and plan clicks" icon={CreditCard} tone="amber" />
        <MetricCard title="Strategy/contact" value={formatNumber((metrics.strategy_call_intents || 0) + (metrics.contact_intents || 0))} subtitle="High-intent sales enquiries" icon={MessageSquareText} tone="blue" />
        <MetricCard title="CTA clicks" value={formatNumber(metrics.clicks)} subtitle={`${formatNumber(metrics.form_submits)} form submits`} icon={Zap} tone="purple" delta={metrics.deltas?.clicks} />
        <MetricCard title="Checkout starts" value={formatNumber(metrics.checkout_starts)} subtitle="Visits/clicks to Get Started" icon={Target} tone="amber" delta={metrics.deltas?.checkout_starts} />
        <MetricCard title="Leads" value={formatNumber(metrics.leads)} subtitle={`${percent(metrics.lead_capture_rate)} intent-to-lead capture`} icon={Search} tone="amber" delta={metrics.deltas?.leads} />
        <MetricCard title="Calls" value={formatNumber(metrics.calls)} subtitle="Call records ingested" icon={Activity} delta={metrics.deltas?.calls} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <TimeChart title="Sessions and engagement" subtitle={`Page views, clicks, and conversion intent · ${selectedRange}`} series={series.page_views || []} secondarySeries={series.clicks || []} thirdSeries={series.conversion_events || []} />
        <FunnelCard rows={funnel} />
        <BarList title="Conversion intent by type" rows={breakdowns.conversion_intents || []} emptyText="Conversion events will appear after key CTA clicks and form submits." icon={ClipboardCheck} />
        <BarList title="Converting pages" rows={breakdowns.conversion_pages || []} emptyText="Pages with conversion intent or leads will appear here." icon={Target} valueRenderer={(row) => `${formatNumber(row.count)} · ${percent(row.conversion_rate)}`} />
        <BarList title="Recent lead pages" rows={breakdowns.lead_pages || []} emptyText="Lead source pages will appear after leads are captured." icon={Search} />
        <BarList title="Selected plans" rows={breakdowns.selected_plans || []} emptyText="Selected plan data will appear after signup or checkout events." icon={CreditCard} />
        <BarList title="Live pages right now" rows={breakdowns.live_pages || []} emptyText="No active pages in the last 30 minutes." icon={Radio} />
        <BarList title="Top pages" rows={breakdowns.top_pages || []} icon={MousePointerClick} />
        <BarList title="Top CTA labels" rows={breakdowns.cta_labels || []} emptyText="CTA clicks will appear after users click buttons or links." icon={Zap} />
        <BarList title="Top conversion labels" rows={breakdowns.conversion_labels || []} emptyText="Key CTA labels will appear after conversion-intent clicks." icon={ClipboardCheck} />
        <BarList title="Traffic sources" rows={(breakdowns.sources?.length ? breakdowns.sources : breakdowns.referrers) || []} icon={Globe2} />
        <BarList title="Campaigns" rows={breakdowns.campaigns || []} emptyText="UTM campaign data will appear after campaign traffic arrives." icon={TrendingUp} />
        <BarList title="Devices" rows={breakdowns.devices || []} icon={Smartphone} />
        <BarList title="Browsers" rows={breakdowns.browsers || []} icon={Monitor} />
        <BarList title="Operating systems" rows={breakdowns.operating_systems || []} icon={Monitor} />
        <BarList title="Countries" rows={breakdowns.countries || []} icon={MapPin} />
        <BarList title="Cities" rows={breakdowns.cities || []} icon={MapPin} />
        <BarList title="Event types" rows={breakdowns.event_types || []} icon={Activity} />
        <RecentConversions events={recent.conversion_events || []} />
        <RecentEvents events={recent.events || []} />
      </section>

      <GoogleAcquisitionPanel range={range} />

      <section className="rounded-[28px] border border-sky-200 bg-sky-50 p-5 text-sm leading-7 text-sky-900">
        <strong>Analytics stack:</strong> first-party AssistantAI tracking shows live operational behaviour and conversion intent. GA4 and Search Console add external acquisition and organic search data once the Google OAuth credentials and property IDs are configured.
      </section>
    </div>
  );
}
