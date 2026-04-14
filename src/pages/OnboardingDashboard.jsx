import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import OnboardingLeadCard from '@/components/admin/onboarding/OnboardingLeadCard';
import OnboardingCard from '@/components/admin/onboarding/OnboardingCard';
import { getPlanPrice, isPreLiveClient } from '@/lib/onboardingHub';

export default function OnboardingDashboard() {
  const queryClient = useQueryClient();

  const { data: wonLeads = [] } = useQuery({
    queryKey: ['won-leads'],
    queryFn: () => base44.entities.Lead.filter({ status: 'Won' }, '-updated_date', 50),
    initialData: [],
  });

  const { data: onboardings = [] } = useQuery({
    queryKey: ['onboardings'],
    queryFn: () => base44.entities.Client.list('-updated_date', 100),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: async (lead) => {
      const existing = onboardings.find((item) => item.email === lead.email);
      if (existing) return existing;

      const plan = 'Starter';
      const client = await base44.entities.Client.create({
        full_name: lead.full_name,
        business_name: lead.business_name || lead.full_name,
        email: lead.email,
        mobile_number: lead.mobile_number || '',
        industry: lead.industry || 'other',
        website: '',
        main_service: '',
        monthly_enquiry_volume: lead.monthly_enquiry_volume || '0_20',
        biggest_problem: lead.message || '',
        current_missed_call_handling: '',
        ai_first_goal: '',
        plan,
        status: 'Awaiting Assets',
        lifecycle_state: 'pre_live',
        progress_percentage: 8,
        assigned_owner: lead.assigned_owner || '',
        target_go_live_date: '',
        source_lead_id: lead.id,
        last_activity: 'Client created from won lead in Onboarding Hub',
        blockers: [],
        next_action: 'Send intake form and confirm kickoff inputs',
        workflow_phase: 'Payment',
        assets_status: 'waiting',
        onboarding_archived: false,
        go_live_ready: false,
        go_live_date: null,
      });

      await base44.entities.IntakeForm.create({
        client_id: client.id,
        business_name: client.business_name,
        contact_name: client.full_name,
        phone: client.mobile_number,
        email: client.email,
        website: '',
        industry: client.industry,
        service_areas: '',
        crm_used_now: '',
        calendar_used_now: '',
        messaging_sms_tool: '',
        payment_billing_method: '',
        main_business_phone: '',
        business_hours: '',
        after_hours_rules: '',
        hot_lead_definition: '',
        urgent_job_definition: '',
        escalation_rules: '',
        ai_never_say_rules: '',
        booking_rules: '',
        required_capture_before_handoff: '',
        escalation_contacts: '',
        scripts_assets: '',
        faq_list: '',
        pricing_guidance: '',
        objection_handling: '',
        sensitive_data_limits: '',
        recordings_allowed: false,
        sms_followup_approved: false,
        outbound_calling_approved: false,
        final_approver: '',
        approval_status: 'draft',
        last_updated: new Date().toISOString(),
        is_archived: false,
      });

      await base44.entities.BillingStatus.create({
        client_id: client.id,
        plan,
        setup_fee: getPlanPrice(plan, 'setup_fee'),
        monthly_fee: getPlanPrice(plan, 'monthly_fee'),
        billing_status: 'paid',
        payment_method: '',
        invoice_reference: '',
        renewal_date: null,
        notes: '',
      });

      await base44.entities.Lead.update(lead.id, {
        ...lead,
        status: 'Onboarding',
        client_account_id: client.id,
      });

      return client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboardings'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Client.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboardings'] });
    },
  });

  const readyLeads = wonLeads.filter((lead) => !onboardings.some((item) => item.email === lead.email));
  const activeOnboardings = onboardings.filter((item) => isPreLiveClient(item));

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
          ['Pre-Live Clients', activeOnboardings.length],
          ['Live Clients', onboardings.filter((item) => item.lifecycle_state === 'live').length],
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
            onSave={(data) => {
              updateMutation.mutate({ id: item.id, data });
            }}
          />
        ))}
      </div>
    </div>
  );
}