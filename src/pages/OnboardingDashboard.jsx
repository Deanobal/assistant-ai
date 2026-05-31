import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
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
import { PLAN_PRICING, getDefaultIntegrationRecords, getNextActionFromTasks, getProgressFromTasks, getTasksForPlan, getWorkflowPhaseFromTasks } from '@/components/admin/onboarding/onboardingConfig';
import { getSmartPriorityQueue } from '@/components/admin/onboarding/smartPriority';

function resetManualForm() {
  return {
    full_name: '',
    business_name: '',
    mobile_number: '',
    email: '',
    industry: 'other',
    website: '',
    plan: 'Starter',
    source: 'manual_sale',
  };
}

function leadFromManualForm(form) {
  return {
    full_name: form.full_name?.trim(),
    business_name: form.business_name?.trim(),
    email: form.email?.trim(),
    mobile_number: form.mobile_number?.trim(),
    industry: form.industry,
    website: form.website?.trim(),
    source_page: form.source,
    source: form.source,
    message: `Manual onboarding entry from ${form.source.replaceAll('_', ' ')}.`,
    status: 'Won',
    plan: form.plan,
    booking_intent: false,
  };
}

function validateLeadForOnboarding(lead) {
  if (!lead?.business_name && !lead?.full_name) throw new Error('Business name or contact name is required.');
  if (!lead?.email && !lead?.mobile_number) throw new Error('Email or phone number is required.');
}

async function safeBulkCreate(entity, records) {
  if (!records?.length) return [];
  try {
    if (typeof entity.bulkCreate === 'function') return await entity.bulkCreate(records);
  } catch (error) {
    console.warn('bulkCreate failed, falling back to individual creates', error);
  }
  const created = [];
  for (const record of records) {
    try {
      created.push(await entity.create(record));
    } catch (error) {
      console.warn('Non-blocking onboarding record create failed', error);
    }
  }
  return created;
}

async function safeCreate(entity, record) {
  try {
    return await entity.create(record);
  } catch (error) {
    console.warn('Non-blocking onboarding record create failed', error);
    return null;
  }
}

async function createDirectOnboardingFromLead(lead) {
  validateLeadForOnboarding(lead);
  const plan = lead.plan || 'Starter';
  const taskTemplates = getTasksForPlan(plan);
  const now = new Date().toISOString();

  const client = await base44.entities.Client.create({
    full_name: lead.full_name || lead.contact_name || '',
    business_name: lead.business_name || lead.company || lead.full_name || 'New Client',
    email: lead.email || '',
    mobile_number: lead.mobile_number || lead.phone || '',
    industry: lead.industry || 'other',
    website: lead.website || '',
    plan,
    source_lead_id: lead.id || null,
    source_page: lead.source_page || lead.source || 'manual_sale',
    status: 'Awaiting Payment',
    lifecycle_state: 'pre_live',
    workflow_phase: 'Payment',
    assigned_owner: 'Onboarding',
    progress_percentage: 0,
    next_action: 'Complete: confirm setup payment received',
    blockers: ['Missing intake details', 'Unpaid billing', 'Missing integrations'],
    go_live_ready: false,
    onboarding_archived: false,
    last_activity: 'Onboarding created directly from dashboard',
    created_at: now,
    updated_at: now,
  });

  const intake = await base44.entities.IntakeForm.create({
    client_id: client.id,
    contact_name: lead.full_name || '',
    business_name: lead.business_name || lead.full_name || '',
    email: lead.email || '',
    phone: lead.mobile_number || lead.phone || '',
    website: lead.website || '',
    industry: lead.industry || 'other',
    approval_status: 'draft',
    business_description: '',
    services_offered: '',
    service_areas: '',
    business_hours: '',
    emergency_rules: '',
    faq_list: '',
    pricing_guidance: '',
    escalation_contact: lead.mobile_number || lead.email || '',
    is_archived: false,
    last_updated: now,
  });

  const taskRecords = taskTemplates.map((task) => ({
    ...task,
    client_id: client.id,
    completed: false,
    due_date: null,
    assigned_to: 'Onboarding',
    notes: '',
    created_at: now,
    updated_at: now,
    blocked: false,
    is_archived: false,
  }));

  await safeBulkCreate(base44.entities.OnboardingTask, taskRecords);

  const integrationRecords = getDefaultIntegrationRecords(client.id, plan).map((record) => ({
    ...record,
    created_at: now,
    updated_at: now,
  }));
  await safeBulkCreate(base44.entities.IntegrationStatus, integrationRecords);

  await safeCreate(base44.entities.BillingStatus, {
    client_id: client.id,
    plan,
    setup_fee: PLAN_PRICING[plan]?.setup_fee || 0,
    monthly_fee: PLAN_PRICING[plan]?.monthly_fee || 0,
    billing_status: 'draft',
    payment_method: '',
    invoice_reference: '',
    renewal_date: null,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    stripe_checkout_session_id: null,
    admin_override: false,
    notes: 'Created from onboarding dashboard direct flow.',
  });

  await safeCreate(base44.entities.ClientNote, {
    client_id: client.id,
    note_type: 'system',
    content: `Onboarding created directly from ${lead.source_page || lead.source || 'manual'}.`,
    created_by: 'admin',
    created_at: now,
    is_archived: false,
  });

  if (lead.id) {
    await base44.entities.Lead.update(lead.id, {
      ...lead,
      status: 'Won',
      client_account_id: client.id,
      updated_at: now,
    }).catch(() => null);
  }

  const progress = getProgressFromTasks(taskRecords);
  await base44.entities.Client.update(client.id, {
    ...client,
    progress_percentage: progress,
    workflow_phase: getWorkflowPhaseFromTasks(taskRecords),
    next_action: getNextActionFromTasks(taskRecords),
    updated_at: now,
  }).catch(() => null);

  return { client_id: client.id, intake_id: intake.id, fallback: true };
}

export default function OnboardingDashboard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ search: '', plan: 'all', status: 'all', owner: 'all' });
  const [isNewOnboardingOpen, setIsNewOnboardingOpen] = useState(false);
  const [newOnboardingForm, setNewOnboardingForm] = useState(resetManualForm());
  const [onboardingError, setOnboardingError] = useState(null);
  const [onboardingNotice, setOnboardingNotice] = useState(null);

  const invalidateOnboardingQueries = () => {
    ['onboarding-clients', 'onboarding-leads', 'onboarding-tasks', 'onboarding-notes', 'onboarding-billing', 'onboarding-integrations', 'client-manager-clients', 'admin-leads', 'connector-clients'].forEach((key) => {
      queryClient.invalidateQueries({ queryKey: [key] });
    });
  };

  const { data: clients = [] } = useQuery({ queryKey: ['onboarding-clients'], queryFn: () => base44.entities.Client.list('-updated_date', 200), initialData: [] });
  const { data: leads = [] } = useQuery({ queryKey: ['onboarding-leads'], queryFn: () => base44.entities.Lead.filter({ status: 'Won' }, '-updated_date', 100), initialData: [] });
  const { data: tasks = [] } = useQuery({ queryKey: ['onboarding-tasks'], queryFn: () => base44.entities.OnboardingTask.list('-updated_date', 500), initialData: [] });
  const { data: notes = [] } = useQuery({ queryKey: ['onboarding-notes'], queryFn: () => base44.entities.ClientNote.list('-updated_date', 500), initialData: [] });
  const { data: billingRecords = [] } = useQuery({ queryKey: ['onboarding-billing'], queryFn: () => base44.entities.BillingStatus.list('-updated_date', 300), initialData: [] });
  const { data: integrationRecords = [] } = useQuery({ queryKey: ['onboarding-integrations'], queryFn: () => base44.entities.IntegrationStatus.list('-updated_date', 300), initialData: [] });

  const createClientMutation = useMutation({
    mutationFn: async (lead) => {
      setOnboardingError(null);
      setOnboardingNotice(null);
      const result = await createDirectOnboardingFromLead(lead);
      setOnboardingNotice('Onboarding created directly. Missing conversion app was bypassed.');
      return result;
    },
    onSuccess: (result) => {
      invalidateOnboardingQueries();
      if (result?.client_id) navigate(`/ClientWorkspace?id=${result.client_id}`);
    },
    onError: (err) => setOnboardingError(err.message || 'Could not start onboarding.'),
  });

  const createManualOnboardingMutation = useMutation({
    mutationFn: async (form) => {
      setOnboardingError(null);
      setOnboardingNotice(null);
      const leadPayload = leadFromManualForm(form);
      validateLeadForOnboarding(leadPayload);
      const result = await createDirectOnboardingFromLead(leadPayload);
      setOnboardingNotice('Manual onboarding created directly.');
      return result;
    },
    onSuccess: (result) => {
      setIsNewOnboardingOpen(false);
      setNewOnboardingForm(resetManualForm());
      invalidateOnboardingQueries();
      if (result?.client_id) navigate(`/ClientWorkspace?id=${result.client_id}`);
    },
    onError: (err) => setOnboardingError(err.message || 'Could not start onboarding.'),
  });

  const preLiveClients = clients.filter((client) => client.lifecycle_state !== 'live' && !client.onboarding_archived);
  const readyLeads = leads.filter((lead) => !lead.client_account_id && !clients.some((client) => client.source_lead_id === lead.id));
  const taskMap = useMemo(() => tasks.reduce((acc, task) => { acc[task.client_id] = acc[task.client_id] || []; acc[task.client_id].push(task); return acc; }, {}), [tasks]);

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
    <div className="space-y-8 text-slate-950">
      <div className="admin-card p-6 md:p-8">
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <Badge className="border-0 bg-slate-900 text-white">Client Onboarding Hub</Badge>
              <Badge className="border-0 bg-blue-50 text-blue-700">Pre-Live = Onboarding Hub</Badge>
              <Badge className="border-0 bg-emerald-50 text-emerald-700">Live = Client Manager</Badge>
            </div>
            <h2 className="text-3xl font-bold text-slate-950 mb-2">Operational onboarding system for sold AssistantAI clients</h2>
            <p className="admin-muted max-w-4xl">Lead-first onboarding workflow with real client records, structured intake, dynamic checklist logic, integrations tracking, billing status, blockers, notes, and go-live readiness.</p>
            <div className="flex flex-wrap gap-3 mt-5">
              <Button onClick={() => setIsNewOnboardingOpen(true)} className="bg-slate-900 text-white hover:bg-slate-800">+ New Onboarding</Button>
            </div>
          </div>
        </div>
      </div>

      {onboardingError && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-red-700 flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <p>{onboardingError}</p>
        </div>
      )}

      {onboardingNotice && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-amber-800 flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <p>{onboardingNotice}</p>
        </div>
      )}

      <NewOnboardingDialog open={isNewOnboardingOpen} onOpenChange={setIsNewOnboardingOpen} form={newOnboardingForm} onChange={(key, value) => setNewOnboardingForm((prev) => ({ ...prev, [key]: value }))} onSubmit={() => createManualOnboardingMutation.mutate(newOnboardingForm)} isSaving={createManualOnboardingMutation.isPending} />

      <OnboardingKpiGrid items={kpis} />

      <div className="grid xl:grid-cols-3 gap-6">
        <OnboardingActivityPanel title="Recent Activity Feed" items={recentActivity} emptyText="No onboarding activity yet." />
        <OnboardingActivityPanel title="Blockers Summary" items={blockersSummary} emptyText="No blockers currently recorded." />
        <OnboardingActivityPanel title="Next Recommended Actions" items={nextActions} emptyText="No next actions yet." />
      </div>

      <SmartPriorityQueue items={smartPriorityQueue} />

      <div className="admin-panel p-5 space-y-4">
        <h3 className="text-slate-950 text-xl font-semibold">Sold Leads Ready to Start Onboarding</h3>
        {readyLeads.length === 0 ? (
          <Card className="border-slate-200 bg-slate-50"><CardContent className="p-6 text-slate-500">No sold leads are waiting to enter the onboarding hub.</CardContent></Card>
        ) : readyLeads.map((lead) => (
          <OnboardingLeadCard key={lead.id} lead={lead} onConvert={(item) => createClientMutation.mutate(item)} disabled={createClientMutation.isPending} />
        ))}
      </div>

      <div className="admin-panel p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"><h3 className="text-slate-950 text-xl font-semibold">Active Onboarding</h3></div>
        <OnboardingClientsToolbar filters={filters} onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))} />
        <OnboardingClientsTable clients={filteredClients} />
      </div>

      <div className="admin-panel p-5 space-y-4">
        <h3 className="text-slate-950 text-xl font-semibold">Live</h3>
        {liveClients.length === 0 ? (
          <Card className="border-slate-200 bg-slate-50"><CardContent className="p-6 text-slate-500">No completed live clients yet.</CardContent></Card>
        ) : (
          <OnboardingClientsTable clients={liveClients} />
        )}
      </div>
    </div>
  );
}
