import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, ExternalLink, Loader2, Search, ShieldAlert } from 'lucide-react';
import { AdminEmptyState } from '@/components/admin/AdminState';
import SeoMetricsCard from '@/components/admin/marketing/SeoMetricsCard';
import KeywordsTable from '@/components/admin/marketing/KeywordsTable';
import PerformanceChart from '@/components/admin/marketing/PerformanceChart';

const fallbackGoogleData = {
  connected: false,
  auth_method: 'none',
  generated_at: '',
  range: { label: 'Last 30 days' },
  ga4: { ready: false, totals: {}, channels: [], error: '' },
  search_console: {
    ready: false,
    property_used: '',
    totals: {},
    queries: [],
    pages: [],
    countries: [],
    devices: [],
    error: '',
  },
};

const competitorWatchlist = [
  {
    id: 'vozi',
    name: 'Vozi',
    domain: 'vozi.com.au',
    category: 'Australian AI receptionist',
    positioning: 'Local voice, 24/7 call answering and appointment handling.',
    attackAngle: 'Differentiate on revenue workflow depth: CRM updates, follow-up, checkout, onboarding and measurable lead conversion.',
  },
  {
    id: 'lana',
    name: 'LANA Software',
    domain: 'lanasoftware.com.au',
    category: 'AI receptionist for service businesses',
    positioning: 'AI receptionist, trades/service-business focus, booking and call handling.',
    attackAngle: 'Win with stronger done-for-you implementation, clearer plan fit and faster path from enquiry to paid client.',
  },
  {
    id: 'autoreception',
    name: 'AutoReception',
    domain: 'autoreception.com.au',
    category: 'AI call answering',
    positioning: 'Call answering replacement for reception/admin workflows.',
    attackAngle: 'Position AssistantAI as a complete revenue system, not just a message-taking tool.',
  },
  {
    id: 'sophiie',
    name: 'Sophiie',
    domain: 'sophiie.com.au',
    category: 'AI receptionist / business phone assistant',
    positioning: 'AI call handling with business-friendly receptionist language.',
    attackAngle: 'Outrank with industry pages, proof assets, comparison pages and workflow automation examples.',
  },
  {
    id: 'enterprise-cx',
    name: 'Enterprise CX platforms',
    domain: 'Genesys / AWS Connect / enterprise stacks',
    category: 'Large contact-centre AI',
    positioning: 'Enterprise-grade contact centre infrastructure and AI customer experience tooling.',
    attackAngle: 'Counter with SMB speed: fixed-scope implementation, transparent pricing and service-business workflows without enterprise complexity.',
  },
];

const competitorInsights = {
  strengths: [
    'AssistantAI is positioned around revenue protection, not generic AI novelty.',
    'The site now has GA4 and Search Console visibility, so SEO decisions can be driven by live data.',
    'Starter and Growth checkout flows create a clearer commercial path than demo-only competitors.',
  ],
  opportunities: [
    'Build comparison pages for AI receptionist Australia, virtual receptionist alternatives and trades-specific use cases.',
    'Publish proof assets showing call capture, CRM update, SMS follow-up and onboarding trigger flows.',
    'Add backlink/provider data later through DataForSEO, SEMrush or Ahrefs to replace manual watchlist mode.',
  ],
  threats: [
    'Competitors with older domains and existing backlinks may outrank new pages initially.',
    'Australian accent and 24/7 answering are now commodity claims, so weak copy will blend into the market.',
    'Enterprise vendors can appear more credible unless AssistantAI shows clear implementation outcomes and proof.',
  ],
};

const rangeOptions = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
];

function formatNumber(value = 0) {
  return Number(value || 0).toLocaleString();
}

function mapQueryRows(rows = []) {
  return rows.map((row) => ({
    keyword: row.query || row.page || row.country || row.device || 'Unknown',
    impressions: Number(row.impressions || 0),
    clicks: Number(row.clicks || 0),
    avgPosition: Number(row.position || 0),
  }));
}

function mapPageRows(rows = []) {
  return rows.map((row) => {
    const rawPage = row.page || 'Unknown';
    const pageName = rawPage.replace('https://www.assistantai.com.au', '').replace('https://assistantai.com.au', '') || '/';
    return {
      name: pageName.length > 28 ? `${pageName.slice(0, 28)}...` : pageName,
      keyword: pageName,
      impressions: Number(row.impressions || 0),
      clicks: Number(row.clicks || 0),
      avgPosition: Number(row.position || 0),
    };
  });
}

function buildSummaryTrend(searchConsole = {}) {
  const totals = searchConsole.totals || {};
  if (!searchConsole.ready) return [];
  return [
    {
      date: 'Current period',
      impressions: Number(totals.impressions || 0),
      clicks: Number(totals.clicks || 0),
    },
  ];
}

export default function SeoDashboard() {
  const [googleData, setGoogleData] = useState(fallbackGoogleData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState('30d');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/google-acquisition-summary?range=${encodeURIComponent(range)}`, {
          headers: { Accept: 'application/json' },
        });
        const data = await response.json().catch(() => fallbackGoogleData);

        if (!response.ok) {
          throw new Error(data?.error || 'Google acquisition data is not available yet.');
        }

        setGoogleData({ ...fallbackGoogleData, ...data });
      } catch (err) {
        setGoogleData(fallbackGoogleData);
        setError(err?.message || 'SEO data is not available yet.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [range]);

  const searchConsole = googleData?.search_console || fallbackGoogleData.search_console;
  const ga4 = googleData?.ga4 || fallbackGoogleData.ga4;
  const setupMode = !googleData?.connected && !searchConsole.ready && !ga4.ready;

  const keywordRows = useMemo(() => mapQueryRows(searchConsole.queries || []), [searchConsole.queries]);
  const pageRows = useMemo(() => mapPageRows(searchConsole.pages || []), [searchConsole.pages]);
  const performanceTrend = useMemo(() => buildSummaryTrend(searchConsole), [searchConsole]);

  const totalImpressions = Number(searchConsole?.totals?.impressions || 0);
  const totalClicks = Number(searchConsole?.totals?.clicks || 0);
  const avgPosition = Number(searchConsole?.totals?.avg_position || 0);
  const ctr = Number(searchConsole?.totals?.ctr || 0);
  const gaSessions = Number(ga4?.totals?.sessions || 0);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8 text-slate-100">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-300">Search growth</p>
            <h2 className="mt-2 text-3xl font-bold text-white">SEO Dashboard</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
              Live Google Analytics 4 and Search Console reporting for rankings, traffic, landing pages, countries, devices and acquisition channels.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={range}
              onChange={(event) => setRange(event.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-cyan-400"
            >
              {rangeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <a href="/admin/marketing/settings" className="inline-flex items-center rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-100">
              Configure APIs <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-5 text-red-100">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <h3 className="font-bold">SEO data request failed</h3>
              <p className="mt-1 text-sm leading-relaxed text-red-100/80">{error}</p>
            </div>
          </div>
        </div>
      )}

      {setupMode ? (
        <div className="rounded-3xl border border-amber-300/30 bg-amber-400/10 p-5 text-amber-100">
          <div className="flex gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <h3 className="font-bold">Google SEO sources are not connected yet</h3>
              <p className="mt-1 text-sm leading-relaxed text-amber-100/80">
                Add Google OAuth, GA4 and Search Console environment variables. The dashboard reads from the native /api/google-acquisition-summary route.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-emerald-100">
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <h3 className="font-bold">Google data connected</h3>
              <p className="mt-1 text-sm leading-relaxed text-emerald-100/80">
                Auth: {googleData.auth_method || 'connected'}{searchConsole.property_used ? ` · Search Console property: ${searchConsole.property_used}` : ''}{googleData.generated_at ? ` · Updated ${new Date(googleData.generated_at).toLocaleString()}` : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SeoMetricsCard title="Total Impressions" value={formatNumber(totalImpressions)} change={0} trend="up" />
        <SeoMetricsCard title="Total Clicks" value={formatNumber(totalClicks)} change={0} trend="up" />
        <SeoMetricsCard title="Avg Position" value={avgPosition ? avgPosition.toFixed(1) : '—'} change={0} trend="up" />
        <SeoMetricsCard title="GA4 Sessions" value={formatNumber(gaSessions)} change={0} trend="up" />
      </div>

      {setupMode ? (
        <AdminEmptyState
          icon={Search}
          title="Connect Google data sources"
          description="Add Google OAuth refresh-token credentials, GA_PROPERTY_ID and GSC_SITE_URL in Vercel. Once connected, this dashboard will show live GA4 and Search Console data."
          action={<a href="/admin/marketing/settings" className="inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-100">Open integration settings</a>}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <PerformanceChart data={performanceTrend} type="line" title="Search Console Summary" />
            <PerformanceChart data={pageRows} type="bar" title="Top Performing Pages" />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 xl:col-span-2">
              <h3 className="mb-4 text-lg font-semibold text-white">Top Queries</h3>
              {keywordRows.length ? <KeywordsTable keywords={keywordRows} /> : <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">No query-level rows yet. Search Console may anonymise low-volume query data.</p>}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="mb-4 text-lg font-semibold text-white">GA4 Acquisition</h3>
              <div className="space-y-3">
                {(ga4.channels || []).slice(0, 8).map((channel, index) => (
                  <div key={`${channel.channel}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-white">{channel.channel || 'Unknown'}</p>
                      <span className="text-xs font-bold text-cyan-300">{formatNumber(channel.sessions)} sessions</span>
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-500">{channel.source_medium || 'No source / medium'}</p>
                  </div>
                ))}
                {!(ga4.channels || []).length && <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">No GA4 acquisition rows yet.</p>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="mb-4 text-lg font-semibold text-white">Top Pages</h3>
              {pageRows.length ? <KeywordsTable keywords={pageRows} /> : <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">No page-level Search Console rows yet.</p>}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="mb-4 text-lg font-semibold text-white">Country & Device Signals</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Countries</p>
                  <div className="space-y-2">
                    {(searchConsole.countries || []).slice(0, 6).map((country) => (
                      <div key={country.country} className="flex justify-between rounded-2xl border border-white/10 bg-slate-950/50 p-3 text-sm">
                        <span className="text-slate-300">{country.country}</span>
                        <span className="font-semibold text-white">{formatNumber(country.impressions)}</span>
                      </div>
                    ))}
                    {!(searchConsole.countries || []).length && <p className="text-sm text-slate-500">No country data yet.</p>}
                  </div>
                </div>
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Devices</p>
                  <div className="space-y-2">
                    {(searchConsole.devices || []).slice(0, 6).map((device) => (
                      <div key={device.device} className="flex justify-between rounded-2xl border border-white/10 bg-slate-950/50 p-3 text-sm">
                        <span className="text-slate-300">{device.device}</span>
                        <span className="font-semibold text-white">{formatNumber(device.impressions)}</span>
                      </div>
                    ))}
                    {!(searchConsole.devices || []).length && <p className="text-sm text-slate-500">No device data yet.</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Backlinks & Authority</h3>
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div><p className="mb-1 text-sm text-slate-500">CTR</p><p className="text-3xl font-bold text-white">{ctr ? `${ctr}%` : '—'}</p></div>
          <div><p className="mb-1 text-sm text-slate-500">Domain Rating</p><p className="text-3xl font-bold text-white">Manual</p></div>
          <div><p className="mb-1 text-sm text-slate-500">Competitors</p><p className="text-3xl font-bold text-white">{competitorWatchlist.length}</p></div>
          <div><p className="mb-1 text-sm text-slate-500">Provider</p><p className="text-lg font-bold text-white">Watchlist mode</p></div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-400">
          Google Analytics and Search Console are live. Authority metrics are currently in manual watchlist mode until DataForSEO, SEMrush or Ahrefs is connected.
        </div>
      </div>

      <div>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Competitive Analysis</h3>
            <p className="mt-1 text-sm text-slate-500">Manual competitor watchlist. No fake authority scores are displayed.</p>
          </div>
          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">Watchlist mode</span>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {competitorWatchlist.map((competitor) => (
            <div key={competitor.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <div className="mb-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-bold text-white">{competitor.name}</h4>
                    <p className="mt-1 text-xs text-slate-500">{competitor.domain}</p>
                  </div>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-semibold text-cyan-200">{competitor.category}</span>
                </div>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Positioning</p>
                  <p className="leading-relaxed text-slate-300">{competitor.positioning}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">AssistantAI attack angle</p>
                  <p className="leading-relaxed text-slate-300">{competitor.attackAngle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] mt-6 p-6">
          <h4 className="mb-4 text-sm font-semibold text-white">Insights & Opportunities</h4>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div><h5 className="mb-3 text-xs font-semibold uppercase text-emerald-400">Strengths</h5><ul className="space-y-2">{competitorInsights.strengths.map((item, idx) => <li key={idx} className="text-sm text-slate-400">• {item}</li>)}</ul></div>
            <div><h5 className="mb-3 text-xs font-semibold uppercase text-cyan-400">Opportunities</h5><ul className="space-y-2">{competitorInsights.opportunities.map((item, idx) => <li key={idx} className="text-sm text-slate-400">• {item}</li>)}</ul></div>
            <div><h5 className="mb-3 text-xs font-semibold uppercase text-red-400">Threats</h5><ul className="space-y-2">{competitorInsights.threats.map((item, idx) => <li key={idx} className="text-sm text-slate-400">• {item}</li>)}</ul></div>
          </div>
        </div>
      </div>
    </div>
  );
}
