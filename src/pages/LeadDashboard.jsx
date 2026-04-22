import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import LeadStats from '@/components/admin/leads/LeadStats';
import LeadSourceSummary from '@/components/admin/leads/LeadSourceSummary';
import OnboardingStatusView from '@/components/admin/leads/OnboardingStatusView';
import PipelineBoard from '@/components/admin/leads/PipelineBoard';
import AnalyticsSection from '@/components/dashboard/AnalyticsSection';

const stages = ['New Lead', 'Contacted', 'Strategy Call Booked', 'Proposal Sent', 'Follow-Up', 'Won', 'Lost', 'Onboarding'];

export default function LeadDashboard() {
  const queryClient = useQueryClient();

  const { data: leads = [] } = useQuery({
    queryKey: ['admin-leads'],
    queryFn: () => base44.entities.Lead.list('-updated_date', 200),
    initialData: [],
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['pipeline-clients'],
    queryFn: () => base44.entities.Client.list('-updated_date', 100),
    initialData: [],
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lead.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
    },
  });

  const markWonMutation = useMutation({
    mutationFn: async (lead) => {
      const updatedLead = await base44.entities.Lead.update(lead.id, { ...lead, status: 'Won' });
      await base44.functions.invoke('convertWonLeadToOnboarding', {
        event: { entity_name: 'Lead', type: 'update' },
        data: updatedLead,
        old_data: lead,
      });
    },
    onSuccess: () => {
      ['admin-leads', 'pipeline-clients', 'onboarding-clients', 'onboarding-leads', 'onboarding-tasks'].forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    },
  });

  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const parseLeadDate = (lead) => new Date(lead.created_at || lead.created_date || now).getTime();

  const groupedLeads = stages.reduce((acc, stage) => {
    acc[stage] = leads.filter((lead) => lead.status === stage);
    return acc;
  }, {});

  const sourceCounts = Object.entries(leads.reduce((acc, lead) => {
    const source = lead.source_page || 'Unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {})).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);

  const stats = [
    { label: 'Total Leads', value: leads.length, helper: 'All captured enquiries' },
    { label: 'New Leads This Week', value: leads.filter((lead) => parseLeadDate(lead) >= weekAgo).length, helper: 'Fresh opportunities in the last 7 days' },
    { label: 'Booked Calls', value: leads.filter((lead) => lead.status === 'Strategy Call Booked').length, helper: 'Leads moved into strategy calls' },
    { label: 'Won Clients', value: leads.filter((lead) => lead.status === 'Won').length, helper: 'Ready for conversion into onboarding' },
    { label: 'Lost Leads', value: leads.filter((lead) => lead.status === 'Lost').length, helper: 'Closed out without converting' },
    { label: 'Onboarding', value: leads.filter((lead) => lead.status === 'Onboarding').length, helper: 'Leads already moved forward internally' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">Lead Dashboard</Badge>
            <Badge className="bg-white/5 text-gray-300 border-white/10">Internal sales pipeline</Badge>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Manage Leads, Pipeline, and Onboarding</h2>
          <p className="text-gray-400 max-w-3xl">Track every incoming enquiry, move leads through the pipeline, and keep onboarding visibility in the same internal workspace.</p>
        </div>
      </div>

      <LeadStats stats={stats} />

      <AnalyticsSection />

      <div className="grid xl:grid-cols-[0.95fr_1.05fr] gap-6">
        <LeadSourceSummary sources={sourceCounts} />
        <OnboardingStatusView clients={clients} />
      </div>

      <PipelineBoard
        stages={stages}
        groupedLeads={groupedLeads}
        isSaving={updateMutation.isPending || markWonMutation.isPending}
        onStatusChange={(lead, status) => updateMutation.mutate({
          id: lead.id,
          data: { ...lead, status },
        })}
        onMarkWon={(lead) => markWonMutation.mutate(lead)}
      />
    </div>
  );
}