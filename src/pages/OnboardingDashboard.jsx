import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import OnboardingLeadCard from '@/components/admin/onboarding/OnboardingLeadCard';
import OnboardingCard from '@/components/admin/onboarding/OnboardingCard';

export default function OnboardingDashboard() {
  const queryClient = useQueryClient();

  const { data: wonLeads = [] } = useQuery({
    queryKey: ['won-leads'],
    queryFn: () => base44.entities.Lead.filter({ status: 'Won' }, '-updated_date', 50),
    initialData: [],
  });

  const { data: onboardings = [] } = useQuery({
    queryKey: ['onboardings'],
    queryFn: () => base44.entities.Onboarding.list('-updated_date', 100),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: async (lead) => {
      const existing = onboardings.find((item) => item.email === lead.email);
      if (existing) return existing;

      return base44.entities.Onboarding.create({
        client_name: lead.business_name || lead.full_name,
        contact_name: lead.full_name,
        email: lead.email,
        mobile: lead.mobile_number || '',
        industry: lead.industry || 'other',
        plan: '',
        payment_status: 'paid',
        intake_form_status: 'not_sent',
        assets_received: false,
        workflow_mapped: false,
        ai_agent_built: false,
        integrations_connected: false,
        testing_status: 'not_started',
        go_live_status: 'not_ready',
        onboarding_stage: 'Payment Received',
        lead_id: lead.id,
        client_account_id: null,
        onboarding_notes: lead.notes || '',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboardings'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Onboarding.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboardings'] });
    },
  });

  const readyLeads = wonLeads.filter((lead) => !onboardings.some((item) => item.email === lead.email));
  const activeOnboardings = onboardings.filter((item) => item.onboarding_stage !== 'Live' && item.onboarding_stage !== 'Optimisation');

  return (
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">Client Onboarding</Badge>
            <Badge className="bg-white/5 text-gray-300 border-white/10">Internal rollout workspace</Badge>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Track Clients from Won to Live</h2>
          <p className="text-gray-400 max-w-3xl">Convert won leads into onboarding records, track every rollout stage, and keep notes in one premium internal dashboard.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          ['Won Leads Ready', readyLeads.length],
          ['Active Onboarding Clients', activeOnboardings.length],
          ['Live / Optimisation', onboardings.filter((item) => item.onboarding_stage === 'Live' || item.onboarding_stage === 'Optimisation').length],
        ].map(([label, value]) => (
          <Card key={label} className="bg-[#12121a] border-white/5">
            <CardContent className="p-5">
              <p className="text-sm text-gray-400">{label}</p>
              <p className="text-3xl font-semibold text-white mt-2">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-white text-xl font-semibold">Won Leads Ready for Onboarding</h3>
        {readyLeads.length === 0 ? (
          <Card className="bg-[#12121a] border-white/5">
            <CardContent className="p-6 text-gray-400">No won leads are waiting to be converted right now.</CardContent>
          </Card>
        ) : readyLeads.map((lead) => (
          <OnboardingLeadCard key={lead.id} lead={lead} onConvert={(item) => createMutation.mutate(item)} disabled={createMutation.isPending} />
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-white text-xl font-semibold">Active Onboarding Clients</h3>
        {activeOnboardings.length === 0 ? (
          <Card className="bg-[#12121a] border-white/5">
            <CardContent className="p-6 text-gray-400">No active onboarding clients yet.</CardContent>
          </Card>
        ) : activeOnboardings.map((item) => (
          <OnboardingCard
            key={item.id}
            onboarding={item}
            isSaving={updateMutation.isPending}
            onSave={(data, silent = false) => {
              if (silent) return;
              updateMutation.mutate({ id: item.id, data });
            }}
          />
        ))}
      </div>
    </div>
  );
}