import { useEffect, useState } from 'react';
import { AlertCircle, BarChart3, CheckCircle2, ExternalLink, Loader2, Search, ShieldAlert } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { AdminEmptyState } from '@/components/admin/AdminState';
import SeoMetricsCard from '@/components/admin/marketing/SeoMetricsCard';
import KeywordsTable from '@/components/admin/marketing/KeywordsTable';
import PerformanceChart from '@/components/admin/marketing/PerformanceChart';
import CompetitorCard from '@/components/admin/marketing/CompetitorCard';

const fallbackSeoData = {
  topKeywords: [],
  performanceTrend: [],
  topPages: [],
  backlinks: {
    totalBacklinks: 0,
    domainRating: 0,
    trustRating: 0,
    recentLinks: [],
  },
};

const fallbackCompetitorData = {
  assistantAiMetrics: { domainRating: 0 },
  competitors: [],
  analysis: {
    strengths: ['AI receptionist positioning is commercially strong for Australian service businesses.'],
    opportunities: ['Connect Google Search Console and Analytics to replace setup guidance with live data.'],
    threats: ['Competitors with published case studies and high-authority backlinks may outrank generic AI service pages.'],
  },
};

function isMissingFunctionError(message = '') {
  return message.includes('404') || message.toLowerCase().includes('not found') || message.toLowerCase().includes('app not found');
}

export default function SeoDashboard() {
  const [seoData, setSeoData] = useState(null);
  const [competitorData, setCompetitorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [setupMode, setSetupMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setSetupMode(false);
        const [seoRes, compRes] = await Promise.all([
          base44.functions.invoke('fetchSeoMetrics', {}),
          base44.functions.invoke('fetchCompetitorData', {}),
        ]);

        setSeoData(seoRes?.data || fallbackSeoData);
        setCompetitorData(compRes?.data || fallbackCompetitorData);
      } catch (err) {
        const message = err?.message || 'SEO data is not available yet.';
        if (isMissingFunctionError(message)) {
          setSetupMode(true);
          setSeoData(fallbackSeoData);
          setCompetitorData(fallbackCompetitorData);
        } else {
          setError(message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-red-700 flex items-center gap-3">
        <AlertCircle className="h-5 w-5" />
        <p>{error}</p>
      </div>
    );
  }

  const totalImpressions = (seoData?.topKeywords || []).reduce((sum, kw) => sum + (kw.impressions || 0), 0);
  const totalClicks = (seoData?.topKeywords || []).reduce((sum, kw) => sum + (kw.clicks || 0), 0);

  return (
    <div className="space-y-8 pb-8 text-slate-950">
      <div className="admin-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="admin-kicker">Search growth</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">SEO Dashboard</h2>
            <p className="admin-muted mt-2 max-w-3xl">Track search visibility, keyword performance, technical setup and competitive positioning. This page now fails safely when SEO APIs are not configured.</p>
          </div>
          <a href="/admin/marketing/settings" className="inline-flex items-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800">
            Configure APIs <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </div>
      </div>

      {setupMode && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          <div className="flex gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <h3 className="font-bold">SEO APIs are not connected yet</h3>
              <p className="mt-1 text-sm leading-relaxed text-amber-800">The old dashboard was calling missing Base44 functions and throwing 404 errors. It now stays usable and shows setup guidance until Google Search Console, Google Analytics and competitor data providers are connected.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SeoMetricsCard title="Total Impressions" value={totalImpressions} change={0} trend="up" />
        <SeoMetricsCard title="Total Clicks" value={totalClicks} change={0} trend="up" />
        <SeoMetricsCard title="Domain Rating" value={competitorData?.assistantAiMetrics?.domainRating || 0} change={0} trend="up" unit="/ 100" />
        <SeoMetricsCard title="Avg Position" value={setupMode ? 'Setup' : '—'} change={0} trend="up" />
      </div>

      {setupMode ? (
        <AdminEmptyState
          icon={Search}
          title="Connect SEO data sources"
          description="Add Google Search Console, Google Analytics and SEMrush credentials in environment variables. Once connected, this dashboard can show real rankings, traffic, backlinks and competitor data."
          action={<a href="/admin/marketing/settings" className="inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800">Open integration settings</a>}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <PerformanceChart data={seoData?.performanceTrend || []} type="line" title="Impressions & Clicks Trend" />
            <PerformanceChart data={seoData?.topPages || []} type="bar" title="Top Performing Pages" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="admin-card p-5">
              <h3 className="mb-4 text-lg font-semibold text-slate-950">Top Keywords</h3>
              <KeywordsTable keywords={seoData?.topKeywords || []} />
            </div>

            <div className="admin-card p-5">
              <h3 className="mb-4 text-lg font-semibold text-slate-950">Top Pages</h3>
              <KeywordsTable keywords={seoData?.topPages || []} />
            </div>
          </div>
        </>
      )}

      <div className="admin-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-950">Backlinks & Authority</h3>
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div><p className="mb-1 text-sm text-slate-500">Total Backlinks</p><p className="text-3xl font-bold text-slate-950">{seoData?.backlinks?.totalBacklinks || 0}</p></div>
          <div><p className="mb-1 text-sm text-slate-500">Domain Rating</p><p className="text-3xl font-bold text-slate-950">{seoData?.backlinks?.domainRating || 0}</p></div>
          <div><p className="mb-1 text-sm text-slate-500">Trust Rating</p><p className="text-3xl font-bold text-slate-950">{seoData?.backlinks?.trustRating || 0}</p></div>
        </div>

        {(seoData?.backlinks?.recentLinks || []).length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No backlink data yet.</div>
        ) : (
          <div className="space-y-2">
            {seoData.backlinks.recentLinks.map((link, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3">
                <div><p className="text-sm font-medium text-slate-950">{link.source}</p><p className="text-xs text-slate-500">{link.date}</p></div>
                <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{link.relevance}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-slate-950">Competitive Analysis</h3>
        {(competitorData?.competitors || []).length === 0 ? (
          <div className="admin-card p-5 text-sm text-slate-500">No competitor data connected yet.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {competitorData.competitors.map((competitor) => <CompetitorCard key={competitor.id} competitor={competitor} userMetrics={competitorData.assistantAiMetrics} />)}
          </div>
        )}

        <div className="admin-card mt-6 p-6">
          <h4 className="mb-4 text-sm font-semibold text-slate-950">Insights & Opportunities</h4>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div><h5 className="mb-3 text-xs font-semibold uppercase text-emerald-600">Strengths</h5><ul className="space-y-2">{(competitorData?.analysis?.strengths || []).map((item, idx) => <li key={idx} className="text-sm text-slate-600">• {item}</li>)}</ul></div>
            <div><h5 className="mb-3 text-xs font-semibold uppercase text-blue-600">Opportunities</h5><ul className="space-y-2">{(competitorData?.analysis?.opportunities || []).map((item, idx) => <li key={idx} className="text-sm text-slate-600">• {item}</li>)}</ul></div>
            <div><h5 className="mb-3 text-xs font-semibold uppercase text-red-600">Threats</h5><ul className="space-y-2">{(competitorData?.analysis?.threats || []).map((item, idx) => <li key={idx} className="text-sm text-slate-600">• {item}</li>)}</ul></div>
          </div>
        </div>
      </div>
    </div>
  );
}
