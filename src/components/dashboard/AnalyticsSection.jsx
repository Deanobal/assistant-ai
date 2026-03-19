import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import KpiCards from './analytics/KpiCards';
import TrendPanel from './analytics/TrendPanel';
import CategoryPanel from './analytics/CategoryPanel';
import InsightsPanel from './analytics/InsightsPanel';
import { getAnalyticsSnapshot as getSampleAnalyticsSnapshot } from './analytics/mockData';
import { getLiveAnalyticsSnapshot } from './analytics/liveData';

export default function AnalyticsSection({ mode = 'live', clientAccountId = null }) {
  const isSample = mode === 'sample';

  const { data: leads = [], isLoading: isLoadingLeads } = useQuery({
    queryKey: ['analytics-leads', clientAccountId || 'all'],
    queryFn: () => clientAccountId
      ? base44.entities.Lead.filter({ client_account_id: clientAccountId }, '-updated_date', 500)
      : base44.entities.Lead.list('-updated_date', 500),
    initialData: [],
    enabled: !isSample,
  });

  const { data: callRecords = [], isLoading: isLoadingCalls } = useQuery({
    queryKey: ['analytics-call-records', clientAccountId || 'all'],
    queryFn: () => clientAccountId
      ? base44.entities.CallRecord.filter({ client_account_id: clientAccountId }, '-timestamp', 500)
      : base44.entities.CallRecord.list('-timestamp', 500),
    initialData: [],
    enabled: !isSample,
  });

  const analytics = isSample ? getSampleAnalyticsSnapshot() : getLiveAnalyticsSnapshot(leads, callRecords);
  const isLoading = !isSample && (isLoadingLeads || isLoadingCalls);
  const hasLiveData = leads.length > 0 || callRecords.length > 0;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Performance Analytics</h2>
            <p className="text-gray-400 max-w-3xl">A polished reporting view showing lead quality, booking momentum, and the kinds of enquiries your AI receptionist is handling most often.</p>
          </div>
          <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 w-fit">Loading live data…</Badge>
        </div>
        <Card className="bg-[#12121a] border-white/5">
          <CardContent className="p-8 text-center text-gray-400">Loading analytics…</CardContent>
        </Card>
      </div>
    );
  }

  if (!isSample && !hasLiveData) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Performance Analytics</h2>
            <p className="text-gray-400 max-w-3xl">A polished reporting view showing lead quality, booking momentum, and the kinds of enquiries your AI receptionist is handling most often.</p>
          </div>
          <Badge className="bg-white/5 text-gray-300 border-white/10 w-fit">Live data ready</Badge>
        </div>
        <Card className="bg-[#12121a] border-white/5">
          <CardContent className="p-10 text-center space-y-3">
            <h3 className="text-xl font-semibold text-white">No Live Analytics Yet</h3>
            <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">Once lead records and call records start coming in, this analytics view will populate automatically with real KPI cards, trends, enquiry categories, and follow-up insights.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Performance Analytics</h2>
          <p className="text-gray-400 max-w-3xl">A polished reporting view showing lead quality, booking momentum, and the kinds of enquiries your AI receptionist is handling most often.</p>
        </div>
        <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 w-fit">{isSample ? 'Presentation-ready sample data' : 'Live entity data'}</Badge>
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