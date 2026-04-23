import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import OnboardingLeadCard from '@/components/admin/onboarding/OnboardingLeadCard';
import OnboardingKpiGrid from '@/components/admin/onboarding/OnboardingKpiGrid';
import OnboardingActivityPanel from '@/components/admin/onboarding/OnboardingActivityPanel';
import OnboardingClientsToolbar from '@/components/admin/onboarding/OnboardingClientsToolbar';
import OnboardingClientsTable from '@/components/admin/onboarding/OnboardingClientsTable';
import SmartPriorityQueue from '@/components/admin/onboarding/SmartPriorityQueue';
import NewOnboardingDialog from '@/components/admin/onboarding/NewOnboardingDialog';
import { getProgressFromTasks } from '@/components/admin/onboarding/onboardingConfig';
import { getSmartPriorityQueue } from '@/components/admin/onboarding/smartPriority';

export default function OnboardingDashboard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ search: '', plan: 'all', status: 'all', owner: 'all' });
  const [isNewOnboardingOpen, setIsNewOnboardingOpen] = useState(false);
  const [newOnboardingForm, setNewOnboardingForm] = useState({
    full_name: '',
    business_name: '',
    mobile_number: '',
    email: '',
    industry: 'other',
    website: '',
    plan: 'Starter',
    source: 'manual_sale',
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['onboarding-clients'],
    queryFn: () => base44.entities.Client.list('-updated_date', 200),
    initialData: [],
  });

  const { data: leads = [] } = useQuery({
    queryKey: ['onboarding-leads'],
    queryFn: () => base44.entities.Lead.filter({ status: 'Won' }, '-updated_date', 100),
    initialData: [],
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['onboarding-tasks'],
    queryFn: () => base44.entities.OnboardingTask.list('-updated_date', 500),
    initialData: [],
  });

  const { data: notes = [] } = useQuery({
    queryKey: ['onboarding-notes'],
    queryFn: () => base44.entities.ClientNote.list('-updated_date', 500),
    initialData: [],
  });

  const { data: billingRecords = [] } = useQuery({
    queryKey: ['onboarding-billing'],
    queryFn: () => base44.entities.BillingStatus.list('-updated_date', 300),
    initialData: [],
  });

  const { data: integrationRecords = [] } = useQuery({
    queryKey: ['onboarding-integrations'],
    queryFn: () => base44.entities.IntegrationStatus.list('-updated_date', 300),
    initialData: [],
  });

  const createClientMutation = useMutation({
    mutationFn: async (lead) => {
      const response = await base44.functions.invoke('convertWonLeadToOnboarding', {
        event: { entity_name: 'Lead', type: 'update' },
        data: lead,
        old_data: { ...lead, status: 'New Lead' },
      });
      return response.data;
    },
    onSuccess: (result) => {
      ['onboarding-clients', 'onboarding-leads', 'onboarding-tasks', 'onboarding-notes', 'onboarding-billing', 'onboarding-integrations', 'client-manager-clients', 'admin-leads'].forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
      if (result?.client_id) navigate(`/ClientWorkspace?id=${result.client_id}`);
    },
  });

  const createManualOnboardingMutation = useMutation({
    mutationFn: async (form) => {
      const lead = await base44.entities.Lead.create({
        full_name: form.full_name,
        business_name: form.business_name,
        email: form.email,
        mobile_number: form.mobile_number,
        industry: form.industry,
        website: form.website,
        source_page: form.source,
        message: `Manual onboarding entry from ${form.source.replaceAll('_', ' ')}.`,
        status: 'Won',
        plan: form.plan,
        booking_intent: false,
      });

      const response = await base44.functions.invoke('convertWonLeadToOnboarding', {
        event: { entity_name: 'Lead', type: 'update' },
        data: lead,
        old_data: { ...lead, status: 'New Lead' },
      });

      return response.data;
    },
    onSuccess: (result) => {
      setIsNewOnboardingOpen(false);
      setNewOnboardingForm({
        full_name: '',
        business_name: '',
        mobile_number: '',
        email: '',
        industry: 'other',
        website: '',
        plan: 'Starter',
        source: 'manual_sale',
      });
      ['onboarding-clients', 'onboarding-leads', 'onboarding-tasks', 'onboarding-notes', 'onboarding-billing', 'onboarding-integrations', 'client-manager-clients', 'admin-leads'].forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
      if (result?.client_id) navigate(`/ClientWorkspace?id=${result.client_id}`);
    },
  });

  const preLiveClients = clients.filter((client) => client.lifecycle_state !== 'live' && !client.onboarding_archived);
  const readyLeads = leads.filter((lead) => !lead.client_account_id && !clients.some((client) => client.source_lead_id === lead.id));
  const billingMap = billingRecords.reduce((acc, item) => {
    acc[item.client_id] = item;
    return acc;
  }, {});
  const integrationMap = integrationRecords.reduce((acc, item) => {
    acc[item.client_id] = acc[item.client_id] || [];
    acc[item.client_id].push(item);
    return acc;
  }, {});
  const taskMap = useMemo(() => tasks.reduce((acc, task) => {
    acc[task.client_id] = acc[task.client_id] || [];
    acc[task.client_id].push(task);
    return acc;
  }, {}), [tasks]);

  const filteredClients = preLiveClients.filter((client) => {
    const matchesSearch = !filters.search || [client.business_name, client.full_name].join(' ').toLowerCase().includes(filters.search.toLowerCase());
    const matchesPlan = filters.plan === 'all' || client.plan === filters.plan;
    const matchesStatus = filters.status === 'all' || client.status === filters.status;
    const matchesOwner = filters.owner === 'all' || (client.assigned_owner || 'Unassigned') === filters.owner;
    return matchesSearch && matchesPlan && matchesStatus && matchesOwner;
  });

  const overdueTasks = tasks.filter((task) => task.due_date && !task.completed && new Date(task.due_date) < new Date());
  const dueToday = tasks.filter((task) => task.due_date === new Date().toISOString().slice(0, 10) && !task.completed);
  const waitingOnAssets = preLiveClients.filter((client) => client.status === 'Awaiting Assets');
  const readyForBuild = preLiveClients.filter((client) => client.status === 'Onboarding' || client.workflow_phase === 'Build');
  const readyForGoLive = preLiveClients.filter((client) => client.go_live_ready || client.status === 'Ready for Go Live');
  const liveClients = clients.filter((client) => client.lifecycle_state === 'live' || client.status === 'Live');

  const kpis = [
    { label: 'Total Clients Onboarding', value: preLiveClients.length, helper: 'Pre-live operational pipeline' },
    { label: 'Tasks Due Today', value: dueToday.length, helper: 'Immediate actions needing attention' },
    { label: 'Overdue Tasks', value: overdueTasks.length, helper: 'Workflow slippage across onboarding' },
    { label: 'Ready for Go Live', value: readyForGoLive.length, helper: 'Clients close to launch' },
    { label: 'Waiting on Assets', value: waitingOnAssets.length, helper: 'Blocked by missing inputs' },
    { label: 'Ready for Build', value: readyForBuild.length, helper: 'Requirements close to implementation' },
    { label: 'Starter / Growth / Enterprise', value: `${preLiveClients.filter((c) => c.plan === 'Starter').length} / ${preLiveClients.filter((c) => c.plan === 'Growth').length} / ${preLiveClients.filter((c) => c.plan === 'Enterprise').length}`, helper: 'Plan mix' },
    { label: 'By Status', value: `${preLiveClients.filter((c) => c.status === 'Awaiting Payment').length}/${preLiveClients.filter((c) => c.status === 'Onboarding').length}/${preLiveClients.filter((c) => c.status === 'Testing').length}`, helper: 'Awaiting payment / onboarding / testing' },
  ];

  const recentActivity = notes.slice(0, 6).map((note) => ({ title: note.note_type.replaceAll('_', ' '), description: note.content, meta: note.created_at?.slice(0, 10) }));
  const blockersSummary = preLiveClients.filter((client) => client.blockers?.length).slice(0, 6).map((client) => ({ title: client.business_name, description: client.blockers.join(', '), meta: client.assigned_owner || 'Unassigned' }));
  const nextActions = preLiveClients.slice(0, 6).map((client) => ({ title: client.business_name, description: client.next_action || 'No next action set', meta: `${getProgressFromTasks(taskMap[client.id] || [])}% progress` }));
  const smartPriorityQueue = getSmartPriorityQueue(preLiveClients, taskMap);

  return (
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">Client Onboarding Hub</Badge>
            <Badge className="bg-white/5 text-gray-300 border-white/10">Pre-Live = Onboarding Hub</Badge>
            <Badge className="bg-white/5 text-gray-300 border-white/10">Live = Client Manager</Badge>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Operational onboarding system for sold AssistantAI clients</h2>
          <p className="text-gray-400 max-w-4xl">Lead-first onboarding workflow with real client records, structured intake, dynamic checklist logic, integrations tracking, billing status, blockers, notes, and go-live readiness.</p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setIsNewOnboardingOpen(true)} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
              + New Onboarding
            </Button>
          </div>
        </div>
      </div>

      <NewOnboardingDialog
        open={isNewOnboardingOpen}
        onOpenChange={setIsNewOnboardingOpen}
        form={newOnboardingForm}
        onChange={(key, value) => setNewOnboardingForm((prev) => ({ ...prev, [key]: value }))}
        onSubmit={() => createManualOnboardingMutation.mutate(newOnboardingForm)}
        isSaving={createManualOnboardingMutation.isPending}
      />

      <OnboardingKpiGrid items={kpis} />

      <div className="grid xl:grid-cols-3 gap-6">
        <OnboardingActivityPanel title="Recent Activity Feed" items={recentActivity} emptyText="No onboarding activity yet." />
        <OnboardingActivityPanel title="Blockers Summary" items={blockersSummary} emptyText="No blockers currently recorded." />
        <OnboardingActivityPanel title="Next Recommended Actions" items={nextActions} emptyText="No next actions yet." />
      </div>

      <SmartPriorityQueue items={smartPriorityQueue} />

      <div className="space-y-4">
        <h3 className="text-white text-xl font-semibold">Sold Leads Ready to Start Onboarding</h3>
        {readyLeads.length === 0 ? (
          <Card className="bg-[#12121a] border-white/5"><CardContent className="p-6 text-gray-400">No sold leads are waiting to enter the onboarding hub.</CardContent></Card>
        ) : readyLeads.map((lead) => (
          <OnboardingLeadCard key={lead.id} lead={lead} onConvert={(item) => createClientMutation.mutate(item)} disabled={createClientMutation.isPending} />
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h3 className="text-white text-xl font-semibold">Active Onboarding</h3>
        </div>
        <OnboardingClientsToolbar filters={filters} onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))} />
        <OnboardingClientsTable clients={filteredClients} />
      </div>

      <div className="space-y-4">
        <h3 className="text-white text-xl font-semibold">Live</h3>
        {liveClients.length === 0 ? (
          <Card className="bg-[#12121a] border-white/5"><CardContent className="p-6 text-gray-400">No completed live clients yet.</CardContent></Card>
        ) : (
          <OnboardingClientsTable clients={liveClients} />
        )}
      </div>
    </div>
  );
}