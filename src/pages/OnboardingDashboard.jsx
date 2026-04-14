import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import OnboardingLeadCard from '@/components/admin/onboarding/OnboardingLeadCard';
import OnboardingKpiGrid from '@/components/admin/onboarding/OnboardingKpiGrid';
import OnboardingActivityPanel from '@/components/admin/onboarding/OnboardingActivityPanel';
import OnboardingClientsToolbar from '@/components/admin/onboarding/OnboardingClientsToolbar';
import OnboardingClientsTable from '@/components/admin/onboarding/OnboardingClientsTable';
import { PLAN_PRICING, getDefaultIntegrationRecords, getProgressFromTasks, getTasksForPlan } from '@/components/admin/onboarding/onboardingConfig';

export default function OnboardingDashboard() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ search: '', plan: 'all', status: 'all', owner: 'all' });

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

  const createClientMutation = useMutation({
    mutationFn: async (lead) => {
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
        status: 'Awaiting Payment',
        progress_percentage: 0,
        assigned_owner: lead.assigned_owner || '',
        target_go_live_date: '',
        source_lead_id: lead.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        lifecycle_state: 'pre_live',
        last_activity: 'Client created from sold lead',
        blockers: [],
        next_action: 'Confirm setup payment and send intake form',
        workflow_phase: 'Payment',
        assets_status: 'not_started',
        onboarding_archived: false,
        go_live_ready: false,
        go_live_date: null,
      });

      const planTasks = getTasksForPlan(plan);
      await base44.entities.OnboardingTask.bulkCreate(planTasks.map((task) => ({
        client_id: client.id,
        task_name: task.task_name,
        task_phase: task.task_phase,
        required: task.required,
        completed: false,
        plan_scope: task.plan_scope,
        due_date: null,
        assigned_to: client.assigned_owner || '',
        notes: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        blocked: false,
        is_archived: false,
      })));

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
        setup_fee: PLAN_PRICING[plan].setup_fee,
        monthly_fee: PLAN_PRICING[plan].monthly_fee,
        billing_status: 'awaiting_payment',
        payment_method: '',
        invoice_reference: '',
        renewal_date: null,
        notes: '',
      });

      await base44.entities.IntegrationStatus.bulkCreate(getDefaultIntegrationRecords(client.id, plan));

      await base44.entities.ClientNote.create({
        client_id: client.id,
        note_type: 'onboarding_note',
        content: 'Client created in Client Onboarding Hub from sold lead.',
        created_by: 'system',
        created_at: new Date().toISOString(),
        is_archived: false,
      });

      await base44.entities.Lead.update(lead.id, {
        ...lead,
        status: 'Onboarding',
        client_account_id: client.id,
      });

      return client;
    },
    onSuccess: () => {
      ['onboarding-clients', 'onboarding-leads', 'onboarding-tasks', 'onboarding-notes', 'client-manager-clients', 'admin-leads'].forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    },
  });

  const preLiveClients = clients.filter((client) => client.lifecycle_state !== 'live' && !client.onboarding_archived);
  const readyLeads = leads.filter((lead) => !lead.client_account_id && !clients.some((client) => client.source_lead_id === lead.id));
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
  const readyForGoLive = preLiveClients.filter((client) => client.status === 'Ready for Go Live');

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
        </div>
      </div>

      <OnboardingKpiGrid items={kpis} />

      <div className="grid xl:grid-cols-3 gap-6">
        <OnboardingActivityPanel title="Recent Activity Feed" items={recentActivity} emptyText="No onboarding activity yet." />
        <OnboardingActivityPanel title="Blockers Summary" items={blockersSummary} emptyText="No blockers currently recorded." />
        <OnboardingActivityPanel title="Next Recommended Actions" items={nextActions} emptyText="No next actions yet." />
      </div>

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
          <h3 className="text-white text-xl font-semibold">Clients List</h3>
        </div>
        <OnboardingClientsToolbar filters={filters} onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))} />
        <OnboardingClientsTable clients={filteredClients} />
      </div>
    </div>
  );
}