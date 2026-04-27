import { TrendingUp } from 'lucide-react';

export default function CompetitorCard({ competitor, userMetrics }) {
  const vs = {
    drBetter: competitor.domainRating < userMetrics.domainRating,
    trafficBetter: competitor.trafficEstimate < userMetrics.trafficEstimate,
    keywordsBetter: competitor.topKeywords < userMetrics.topKeywords,
  };

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5 hover:border-cyan-400/20 transition-colors">
      <div className="mb-4">
        <h3 className="text-white font-semibold">{competitor.name}</h3>
        <p className="text-xs text-slate-500">{competitor.domain}</p>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">Domain Rating</span>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-cyan-400">{competitor.domainRating}</span>
            {vs.drBetter && <span className="text-xs text-green-400">↑ You lead</span>}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">Traffic Estimate</span>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-cyan-400">{competitor.trafficEstimate.toLocaleString()}</span>
            {vs.trafficBetter && <span className="text-xs text-green-400">↑ You lead</span>}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">Top Keywords</span>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-cyan-400">{competitor.topKeywords.toLocaleString()}</span>
            {vs.keywordsBetter && <span className="text-xs text-green-400">↑ You lead</span>}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">Growth</span>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-orange-400" />
            <span className="font-semibold text-orange-400">{competitor.recentGrowth}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}