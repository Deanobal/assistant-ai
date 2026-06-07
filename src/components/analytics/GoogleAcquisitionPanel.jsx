import { useQuery } from '@tanstack/react-query';
import { BarChart3, ExternalLink, Globe2, RefreshCw, Search, TrendingUp } from 'lucide-react';

function formatNumber(value) {
  return new Intl.NumberFormat('en-AU').format(value || 0);
}

function percent(value) {
  return `${Math.round((value || 0) * 10) / 10}%`;
}

function Metric({ label, value, helper }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
      {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
    </div>
  );
}

function DataTable({ title, rows, columns, emptyText }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-slate-950">{title}</h3>
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
        <div className="grid bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500" style={{ gridTemplateColumns: `minmax(0,1.6fr) repeat(${columns.length - 1}, minmax(80px,0.6fr))` }}>
          {columns.map((column) => <span key={column.key}>{column.label}</span>)}
        </div>
        {rows?.length ? rows.map((row, index) => (
          <div key={`${row[columns[0].key]}-${index}`} className="grid border-t border-slate-200 px-4 py-3 text-sm text-slate-700" style={{ gridTemplateColumns: `minmax(0,1.6fr) repeat(${columns.length - 1}, minmax(80px,0.6fr))` }}>
            {columns.map((column, columnIndex) => (
              <span key={column.key} className={columnIndex === 0 ? 'truncate font-semibold text-slate-950' : ''}>{column.format ? column.format(row[column.key]) : row[column.key]}</span>
            ))}
          </div>
        )) : <div className="border-t border-slate-200 px-4 py-5 text-sm text-slate-500">{emptyText}</div>}
      </div>
    </div>
  );
}

export default function GoogleAcquisitionPanel({ range = '30d' }) {
  const { data, isFetching, refetch } = useQuery({
    queryKey: ['google-acquisition-summary', range],
    queryFn: async () => {
      const response = await fetch(`/api/google-acquisition-summary?range=${range}&refresh=${Date.now()}`, { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.error || 'Google acquisition unavailable');
      return json;
    },
    refetchInterval: 120000,
    staleTime: 0,
  });

  const ga4 = data?.ga4 || {};
  const gsc = data?.search_console || {};
  const connected = Boolean(data?.connected);
  const missing = data?.missing || [];

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-700">Google acquisition</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">GA4 and Search Console</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Search and acquisition data from Google Analytics Data API and Search Console API. This complements first-party live tracking.</p>
          </div>
          <button onClick={() => refetch()} disabled={isFetching} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Refreshing' : 'Refresh Google data'}
          </button>
        </div>

        {!connected && (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            Google acquisition is wired in code but not fully connected yet. Missing/config issue: {missing.length ? missing.join(', ') : ga4.error || gsc.error || 'check Google service account access'}.
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="GA4 sessions" value={formatNumber(ga4.totals?.sessions)} helper={ga4.ready ? 'Google Analytics sessions' : ga4.error || 'Not connected'} />
        <Metric label="GA4 users" value={formatNumber(ga4.totals?.users)} helper="Google Analytics users" />
        <Metric label="Search clicks" value={formatNumber(gsc.totals?.clicks)} helper="Google Search Console" />
        <Metric label="Search impressions" value={formatNumber(gsc.totals?.impressions)} helper={`CTR ${percent(gsc.totals?.ctr)} · Avg pos ${gsc.totals?.avg_position || 0}`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DataTable
          title="GA4 channels and landing pages"
          rows={ga4.channels || []}
          emptyText="No GA4 acquisition rows yet. Add GA_PROPERTY_ID and grant the service account Viewer access in GA4."
          columns={[
            { key: 'channel', label: 'Channel' },
            { key: 'sessions', label: 'Sessions', format: formatNumber },
            { key: 'users', label: 'Users', format: formatNumber },
            { key: 'conversions', label: 'Conv.', format: formatNumber },
          ]}
        />
        <DataTable
          title="Search queries"
          rows={gsc.queries || []}
          emptyText="No Search Console rows yet. Add the service account as a Search Console user for the property."
          columns={[
            { key: 'query', label: 'Query' },
            { key: 'clicks', label: 'Clicks', format: formatNumber },
            { key: 'impressions', label: 'Impr.', format: formatNumber },
            { key: 'position', label: 'Pos.' },
          ]}
        />
        <DataTable
          title="Search pages"
          rows={gsc.pages || []}
          emptyText="Search landing pages will appear after Search Console access is connected."
          columns={[
            { key: 'page', label: 'Page' },
            { key: 'clicks', label: 'Clicks', format: formatNumber },
            { key: 'impressions', label: 'Impr.', format: formatNumber },
            { key: 'ctr', label: 'CTR', format: percent },
          ]}
        />
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-950">Connection checklist</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div className="flex items-start gap-3"><Globe2 className="mt-0.5 h-4 w-4 text-sky-600" /><span>Set VITE_GA_MEASUREMENT_ID to enable GA4 browser events.</span></div>
            <div className="flex items-start gap-3"><BarChart3 className="mt-0.5 h-4 w-4 text-sky-600" /><span>Set GA_PROPERTY_ID and grant the service account Viewer access to the GA4 property.</span></div>
            <div className="flex items-start gap-3"><Search className="mt-0.5 h-4 w-4 text-sky-600" /><span>Grant the same service account access to the Search Console property matching GSC_SITE_URL.</span></div>
            <div className="flex items-start gap-3"><TrendingUp className="mt-0.5 h-4 w-4 text-sky-600" /><span>Use /api/google-acquisition-summary to test server-side Google access.</span></div>
            <a href="https://analytics.google.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">Open Google Analytics <ExternalLink className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
    </section>
  );
}
