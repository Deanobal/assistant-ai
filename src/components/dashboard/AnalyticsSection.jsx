import React from 'react';
import { Badge } from '@/components/ui/badge';
import KpiCards from './analytics/KpiCards';
import TrendPanel from './analytics/TrendPanel';
import CategoryPanel from './analytics/CategoryPanel';
import InsightsPanel from './analytics/InsightsPanel';
import { getAnalyticsSnapshot } from './analytics/mockData';

export default function AnalyticsSection() {
  const analytics = getAnalyticsSnapshot();

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Performance Analytics</h2>
          <p className="text-gray-400 max-w-3xl">A polished reporting view showing lead quality, booking momentum, and the kinds of enquiries your AI receptionist is handling most often.</p>
        </div>
        <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 w-fit">Presentation-ready sample data</Badge>
      </div>

      <KpiCards kpis={analytics.kpis} stageRates={analytics.stageRates} />

      <div className="grid xl:grid-cols-[1.4fr_0.9fr] gap-6">
        <TrendPanel trendData={analytics.trendData} />
        <CategoryPanel categoryData={analytics.categoryData} />
      </div>

      <InsightsPanel insights={analytics.insights} />
    </div>
  );
}