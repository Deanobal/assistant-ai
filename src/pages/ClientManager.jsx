import React from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import ManagerStats from '@/components/admin/client-manager/ManagerStats';
import ClientCard from '@/components/admin/client-manager/ClientCard';
import CreateClientCard from '@/components/admin/client-manager/CreateClientCard';
import WonLeadConversionCard from '@/components/admin/client-manager/WonLeadConversionCard';
import AnalyticsSection from '@/components/dashboard/AnalyticsSection';
import { calculateManagerStats } from '@/components/admin/client-manager/mockClients';
import { isLiveClient } from '@/lib/onboardingHub';

export default function ClientManager() {
  const queryClient = useQueryClient();

  const { data: clients = [] } = useQuery({
    queryKey: ['client-manager-clients'],
    queryFn: () => base44.entities.ClientAccount.list('-updated_date', 200),
    initialData: [],
  });

  const { data: wonLeads = [] } = useQuery({
    queryKey: ['client-manager-won-leads'],
    queryFn: () => base44.entities.Lead.filter({ status: 'Won' }, '-updated_date', 100),
    initialData: [],
  });

  const { data: onboardings = [] } = useQuery({
    queryKey: ['client-manager-onboardings'],
    queryFn: () => base44.entities.Onboarding.list('-updated_date', 200),
    initialData: [],
  });

  const createClientMutation = useMutation({
    mutationFn: (data) => base44.entities.ClientAccount.create({
      ...data,
      phone: '',
      website: '',
      address: '',
      timezone: 'Australia/Sydney',
      monthly_fee: 0,
      setup_fee_status: 'pending',
      billing_status: data.status === 'Trial' ? 'trial' : 'active',
      renewal_date: '',
      included_calls: 0,
      used_calls: 0,
      extra_call_packs: 0,
      overage_usage: 0,
      premium_support_add_on: false,
      monthly_revenue: 0,
      total_calls_month: 0,
      leads_captured: 0,
      appointments_booked: 0,
      last_activity: 'Client record created manually',
      portal_access: true,
      notification_setting: 'standard',
      client_permissions: ['Overview', 'Calls', 'Analytics', 'Billing', 'Integrations', 'Support'],
      payment_method_label: '',
      requires_follow_up: false,
      active_services: [],
      lead_id: null,
      services: [],
      notes_entries: [],
      integrations: [],
      recent_calls: [],
      invoices: [],
      analytics: {
        lead_conversion: 0,
        average_call_duration: '',
        peak_call_times: '',
        follow_up_metrics: '',
        trend: [],
        categories: [],
      },
      is_archived: false,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-manager-clients'] });
    },
  });

  const convertLeadMutation = useMutation({
    mutationFn: async (lead) => {
      const existingClient = (await base44.entities.ClientAccount.filter({ email: lead.email }, '-updated_date', 1))[0];
      const client = existingClient || await base44.entities.ClientAccount.create({
        business_name: lead.business_name || lead.full_name,
        contact_name: lead.full_name,
        email: lead.email,
        phone: lead.mobile_number || '',
        website: '',
        address: '',
        industry: lead.industry || 'other',
        timezone: 'Australia/Sydney',
        plan_name: '',
        status: 'Onboarding',
        monthly_fee: 0,
        setup_fee_status: 'pending',
        billing_status: 'active',
        renewal_date: '',
        included_calls: 0,
        used_calls: 0,
        extra_call_packs: 0,
        overage_usage: 0,
        premium_support_add_on: false,
        monthly_revenue: 0,
        total_calls_month: 0,
        leads_captured: 0,
        appointments_booked: 0,
        last_activity: 'Client created from won lead',
        portal_access: true,
        notification_setting: 'standard',
        client_permissions: ['Overview', 'Calls', 'Analytics', 'Billing', 'Integrations', 'Support'],
        payment_method_label: '',
        requires_follow_up: false,
        active_services: [],
        lead_id: lead.id,
        services: [],
        notes_entries: [],
        integrations: [],
        recent_calls: [],
        invoices: [],
        analytics: {
          lead_conversion: 0,
          average_call_duration: '',
          peak_call_times: '',
          follow_up_metrics: '',
          trend: [],
          categories: [],
        },
        is_archived: false,
      });

      const existingOnboarding = (await base44.entities.Onboarding.filter({ email: lead.email }, '-updated_date', 1))[0];
      if (!existingOnboarding) {
        await base44.entities.Onboarding.create({
          client_name: lead.business_name || lead.full_name,
          contact_name: lead.full_name,
          email: lead.email,
          mobile: lead.mobile_number || '',
          industry: lead.industry || 'other',
          plan: '',
          payment_status: 'pending',
          intake_form_status: 'not_sent',
          assets_received: false,
          workflow_mapped: false,
          ai_agent_built: false,
          integrations_connected: false,
          testing_status: 'not_started',
          go_live_status: 'not_ready',
          onboarding_stage: 'Payment Received',
          lead_id: lead.id,
          client_account_id: client.id,
          onboarding_notes: lead.notes || '',
        });
      }

      await base44.entities.Lead.update(lead.id, {
        ...lead,
        client_account_id: client.id,
        status: 'Onboarding',
      });

      return client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-manager-clients'] });
      queryClient.invalidateQueries({ queryKey: ['client-manager-won-leads'] });
      queryClient.invalidateQueries({ queryKey: ['onboardings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
    },
  });

  const visibleClients = clients.filter((client) => !client.is_archived && isLiveClient(client));
  const convertibleWonLeads = wonLeads.filter((lead) => !lead.client_account_id);
  const onboardingByClientId = Object.fromEntries(onboardings.filter((item) => item.client_account_id).map((item) => [item.client_account_id, item]));

  return (
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">Admin</Badge>
            <Badge className="bg-white/5 text-gray-300 border-white/10">System controls and client records</Badge>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Admin Workspace</h2>
          <p className="text-gray-400 max-w-3xl">Keep client records, team access, and system readiness grouped here so reply work stays separate in the Action Inbox.</p>
        </div>
      </div>

      <ManagerStats stats={calculateManagerStats(visibleClients)} />

      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/TeamAccess" className="rounded-3xl border border-white/5 bg-[#12121a] p-5 transition-colors hover:bg-white/[0.03]">
          <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Admin Only</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Team Access</h3>
          <p className="mt-2 text-sm text-gray-400">Invite team members and control who can access the internal workspace.</p>
        </Link>
        <Link to="/SystemReadiness" className="rounded-3xl border border-white/5 bg-[#12121a] p-5 transition-colors hover:bg-white/[0.03]">
          <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Admin Only</p>
          <h3 className="mt-2 text-xl font-semibold text-white">System Readiness</h3>
          <p className="mt-2 text-sm text-gray-400">Review what is truly live, what is partial, and what still needs provider wiring.</p>
        </Link>
      </div>

      <AnalyticsSection />

      <CreateClientCard onCreate={(form) => createClientMutation.mutate(form)} isSaving={createClientMutation.isPending} />

      <div className="space-y-4">
        <h3 className="text-white text-xl font-semibold">Won Leads Ready for Conversion</h3>
        {convertibleWonLeads.length === 0 ? (
          <Card className="bg-[#12121a] border-white/5">
            <CardContent className="p-6 text-gray-400">No won leads are waiting to be converted right now.</CardContent>
          </Card>
        ) : convertibleWonLeads.map((lead) => (
          <WonLeadConversionCard key={lead.id} lead={lead} onConvert={(item) => convertLeadMutation.mutate(item)} isSaving={convertLeadMutation.isPending} />
        ))}
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        {visibleClients.map((client) => (
          <ClientCard key={client.id} client={client} onboarding={onboardingByClientId[client.id] || null} />
        ))}
      </div>
    </div>
  );
}