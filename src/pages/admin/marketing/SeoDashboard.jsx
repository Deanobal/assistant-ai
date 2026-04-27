import { useState, useEffect } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SeoMetricsCard from '@/components/admin/marketing/SeoMetricsCard';
import KeywordsTable from '@/components/admin/marketing/KeywordsTable';
import PerformanceChart from '@/components/admin/marketing/PerformanceChart';
import CompetitorCard from '@/components/admin/marketing/CompetitorCard';

export default function SeoDashboard() {
  const [seoData, setSeoData] = useState(null);
  const [competitorData, setCompetitorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [seoRes, compRes] = await Promise.all([
          base44.functions.invoke('fetchSeoMetrics', {}),
          base44.functions.invoke('fetchCompetitorData', {}),
        ]);

        setSeoData(seoRes.data);
        setCompetitorData(compRes.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-400/20 bg-red-400/5 p-4 flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-red-400" />
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!seoData || !competitorData) {
    return <div className="text-slate-400">No data available</div>;
  }

  const totalImpressions = seoData.topKeywords.reduce((sum, kw) => sum + kw.impressions, 0);
  const totalClicks = seoData.topKeywords.reduce((sum, kw) => sum + kw.clicks, 0);

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">SEO Dashboard</h2>
        <p className="text-slate-400">Track keyword rankings, traffic metrics, and competitive positioning</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SeoMetricsCard title="Total Impressions" value={totalImpressions} change={12.5} trend="up" />
        <SeoMetricsCard title="Total Clicks" value={totalClicks} change={18.3} trend="up" />
        <SeoMetricsCard title="Domain Rating" value={competitorData.assistantAiMetrics.domainRating} change={3.2} trend="up" unit="/ 100" />
        <SeoMetricsCard title="Avg Position" value="2.5" change={5.1} trend="up" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart data={seoData.performanceTrend} type="line" title="Impressions & Clicks Trend" />
        <PerformanceChart data={seoData.topPages} type="bar" title="Top Performing Pages" />
      </div>

      {/* Keywords and Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Top Keywords</h3>
          <KeywordsTable keywords={seoData.topKeywords} />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Top Pages</h3>
          <KeywordsTable keywords={seoData.topPages} />
        </div>
      </div>

      {/* Backlinks & Authority */}
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Backlinks & Authority</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-sm text-slate-400 mb-1">Total Backlinks</p>
            <p className="text-3xl font-bold text-cyan-400">{seoData.backlinks.totalBacklinks}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Domain Rating</p>
            <p className="text-3xl font-bold text-cyan-400">{seoData.backlinks.domainRating}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Trust Rating</p>
            <p className="text-3xl font-bold text-cyan-400">{seoData.backlinks.trustRating}</p>
          </div>
        </div>

        <h4 className="text-sm font-semibold text-white mb-3">Recent Backlinks</h4>
        <div className="space-y-2">
          {seoData.backlinks.recentLinks.map((link, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/5">
              <div>
                <p className="text-sm font-medium text-white">{link.source}</p>
                <p className="text-xs text-slate-500">{link.date}</p>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded ${link.relevance === 'high' ? 'bg-green-400/10 text-green-400' : 'bg-yellow-400/10 text-yellow-400'}`}>
                {link.relevance}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Competitors */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Competitive Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {competitorData.competitors.map((competitor) => (
            <CompetitorCard key={competitor.id} competitor={competitor} userMetrics={competitorData.assistantAiMetrics} />
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] p-6">
          <h4 className="text-sm font-semibold text-white mb-4">Insights & Opportunities</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h5 className="text-xs font-semibold text-green-400 uppercase mb-3">Strengths</h5>
              <ul className="space-y-2">
                {competitorData.analysis.strengths.map((item, idx) => (
                  <li key={idx} className="text-sm text-slate-300">• {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-semibold text-cyan-400 uppercase mb-3">Opportunities</h5>
              <ul className="space-y-2">
                {competitorData.analysis.opportunities.map((item, idx) => (
                  <li key={idx} className="text-sm text-slate-300">• {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-semibold text-red-400 uppercase mb-3">Threats</h5>
              <ul className="space-y-2">
                {competitorData.analysis.threats.map((item, idx) => (
                  <li key={idx} className="text-sm text-slate-300">• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}