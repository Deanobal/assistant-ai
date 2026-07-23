import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, BriefcaseBusiness, Rocket } from 'lucide-react';
import { assistantApi } from '@/api/nativeClient';
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

function normaliseManualForm(form) {
  return {
    full_name: form.full_name?.trim(),
    business_name: form.business_name?.trim(),
    email: form.email?.trim(),
    mobile_number: form.mobile_number?.trim(),
    industry: form.industry || 'other',
    website: form.website?.trim(),
    source: form.source || 'manual_sale',
    plan: form.plan || 'Starter',
  };
}

function getLeadPlan(lead) {
  const raw = String(lead?.selected_plan || lead?.likely_plan_fit || lead?.plan || '').toLowerCase();
  if (raw.includes('enterprise')) return 'Enterprise';
  if (raw.includes('growth')) return 'Growth';
  return 'Starter';
}

function validateOnboardingPayload(payload) {
  if (!payload.business_name && !payload.full_name) throw new Error('Business name or contact name is required.');
  if (!payload.email && !payload.mobile_number && !payload.phone) throw new Error('Email or phone number is required.');
}

async function createOnboarding(payload) {
  validateOnboardingPayload(payload);
  const response = await fetch('/api/onboarding-create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) throw new Error(data.details || data.error || 'Onboarding creation failed.');
  return data;
}

function EmptyCard({ children }) {
  return <Card className="border-slate-200 bg-slate-50"><CardContent className="p-6 text-slate-500">{children}</CardContent></Card>;
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
    ['onboarding-clients', 'onboarding-leads', 'onboarding-tasks', 'onboarding-notes', 'client-manager-clients', 'connector-clients', 'admin-home-clients', 'admin-leads'].forEach((key) => {
      queryClient.invalidateQueries({ queryKey: [key] });
    });
  };

  const { data: clients = [] } = useQuery({ queryKey: ['onboarding-clients'], queryFn: () => assistantApi.entities.Client.list('-updated_date', 200), initialData: [] });
  const { data: leads = [] } = useQuery({ queryKey: ['onboarding-leads'], queryFn: () => assistantApi.entities.Lead.filter({ status: 'Won' }, '-updated_date', 100), initialData: [] });
  const { data: tasks = [] } = useQuery({ queryKey: ['onboarding-tasks'], queryFn: () => assistantApi.entities.OnboardingTask.list('-updated_date', 500), initialData: [] });
  const { data: notes = [] } = useQuery({ queryKey: ['onboarding-notes'], queryFn: () => assistantApi.entities.ClientNote.list('-updated_date', 500), initialData: [] });

  const createManualOnboardingMutation = useMutation({
    mutationFn: async (form) => {
      setOnboardingError(null);
      setOnboardingNotice(null);
      return createOnboarding(normaliseManualForm(form));
    },
    onSuccess: (result) => {
      setIsNewOnboardingOpen(false);
      setNewOnboardingForm(resetManualForm());
      setOnboardingNotice('Onboarding created. Opening client workspace now.');
      invalidateOnboardingQueries();
      if (result?.client_id) navigate(`/ClientWorkspace?id=${result.client_id}`);
    },
    onError: (err) => setOnboardingError(err.message || 'Could not start onboarding.'),
  });

  const createLeadOnboardingMutation = useMutation({
    mutationFn: async (lead) => {
      setOnboardingError(null);
      setOnboardingNotice(null);
      return createOnboarding({
        source_lead_id: lead.id,
        lead_id: lead.id,
        full_name: lead.full_name || lead.contact_name || '',
        business_name: lead.business_name || lead.company || lead.full_name || '',
        email: lead.email || '',
        mobile_number: lead.mobile_number || lead.phone || '',
        industry: lead.industry || 'other',
        website: lead.website || '',
        source: lead.source_page || lead.source || 'sold_lead',
        plan: getLeadPlan(lead),
      });
    },
    onSuccess: (result) => {
      invalidateOnboardingQueries();
      if (result?.client_id) navigate(`/ClientWorkspace?id=${result.client_id}`);
    },
    onError: (err) => setOnboardingError(err.message || 'Could not start onboarding from lead.'),
  });

  const preLiveClients = clients.filter((client) => client.lifecycle_state !== 'live' && !client.onboarding_archived);
  const liveClients = clients.filter((client) => client.lifecycle_state === 'live' || client.status === 'Live');
  const readyLeads = leads.filter((lead) => !lead.client_account_id && !lead.client_id && !clients.some((client) => client.source_lead_id === lead.id));
  const taskMap = useMemo(() => tasks.reduce((acc, task) => { acc[task.client_id] = acc[task.client_id] || []; acc[task.client_id].push(task); return acc; }, {}), [tasks]);

  const filteredClients = preLiveClients.filter((client) => {
    const searchText = [client.business_name, client.full_name].join(' ').toLowerCase();
    const matchesSearch = !filters.search || searchText.includes(filters.search.toLowerCase());
    const matchesPlan = filters.plan === 'all' || client.plan === filters.plan;
    const matchesStatus = filters.status === 'all' || client.status === filters.status;
    const matchesOwner = filters.owner === 'all' || (client.assigned_owner || 'Unassigned') === filters.owner;
    return matchesSearch && matchesPlan && matchesStatus && matchesOwner;
  });

  const overdueTasks = tasks.filter((task) => task.due_date && !task.completed && new Date(task.due_date) < new Date());
  const dueToday = tasks.filter((task) => task.due_date === new Date().toISOString().slice(0, 10) && !task.completed);
  const readyForGoLive = preLiveClients.filter((client) => client.go_live_ready || client.status === 'Ready for Go Live');
  const waitingOnAssets = preLiveClients.filter((client) => client.status === 'Awaiting Assets');
  const readyForBuild = preLiveClients.filter((client) => client.status === 'Onboarding' || client.workflow_phase === 'Build');

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

  const recentActivity = notes.slice(0, 6).map((note) => ({ title: String(note.note_type || 'note').replaceAll('_', ' '), description: note.content, meta: note.created_at?.slice(0, 10) }));
  const blockersSummary = preLiveClients.filter((client) => client.blockers?.length).slice(0, 6).map((client) => ({ title: client.business_name, description: client.blockers.join(', '), meta: client.assigned_owner || 'Unassigned' }));
  const nextActions = preLiveClients.slice(0, 6).map((client) => ({ title: client.business_name, description: client.next_action || 'No next action set', meta: `${getProgressFromTasks(taskMap[client.id] || [])}% progress` }));
  const smartPriorityQueue = getSmartPriorityQueue(preLiveClients, taskMap);

  return (
    <div className="space-y-8 text-slate-950">
      <div className="admin-card p-6 md:p-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <Badge className="border-0 bg-slate-900 text-white">Client Onboarding Hub</Badge>
              <Badge className="border-0 bg-blue-50 text-blue-700">Pre-Live = Onboarding Hub</Badge>
              <Badge className="border-0 bg-emerald-50 text-emerald-700">Live = Client Manager</Badge>
            </div>
            <h2 className="mb-2 text-3xl font-bold text-slate-950">Operational onboarding system for sold AssistantAI clients</h2>
            <p className="admin-muted max-w-4xl">Creates client workspaces through the AssistantAI Supabase API, with linked intake, billing, integration and task records.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button onClick={() => setIsNewOnboardingOpen(true)} className="bg-slate-900 text-white hover:bg-slate-800"><Rocket className="mr-2 h-4 w-4" />+ New Onboarding</Button>
            </div>
          </div>
          <div className="hidden h-20 w-20 items-center justify-center rounded-3xl bg-slate-900 text-white xl:flex"><BriefcaseBusiness className="h-9 w-9" /></div>
        </div>
      </div>

      {onboardingError && <div className="flex items-center gap-3 rounded-3xl border border-red-200 bg-red-50 p-4 text-red-700"><AlertCircle className="h-5 w-5" /><p>{onboardingError}</p></div>}
      {onboardingNotice && <div className="flex items-center gap-3 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-amber-800"><AlertCircle className="h-5 w-5" /><p>{onboardingNotice}</p></div>}

      <NewOnboardingDialog open={isNewOnboardingOpen} onOpenChange={setIsNewOnboardingOpen} form={newOnboardingForm} onChange={(key, value) => setNewOnboardingForm((prev) => ({ ...prev, [key]: value }))} onSubmit={() => createManualOnboardingMutation.mutate(newOnboardingForm)} isSaving={createManualOnboardingMutation.isPending} />

      <OnboardingKpiGrid items={kpis} />

      <div className="grid gap-6 xl:grid-cols-3">
        <OnboardingActivityPanel title="Recent Activity Feed" items={recentActivity} emptyText="No onboarding activity yet." />
        <OnboardingActivityPanel title="Blockers Summary" items={blockersSummary} emptyText="No blockers currently recorded." />
        <OnboardingActivityPanel title="Next Recommended Actions" items={nextActions} emptyText="No next actions yet." />
      </div>

      <SmartPriorityQueue items={smartPriorityQueue} />

      <div className="admin-panel space-y-4 p-5">
        <h3 className="text-xl font-semibold text-slate-950">Sold Leads Ready to Start Onboarding</h3>
        {readyLeads.length === 0 ? <EmptyCard>No sold leads are waiting to enter the onboarding hub.</EmptyCard> : readyLeads.map((lead) => <OnboardingLeadCard key={lead.id} lead={lead} onConvert={(item) => createLeadOnboardingMutation.mutate(item)} disabled={createLeadOnboardingMutation.isPending} />)}
      </div>

      <div className="admin-panel space-y-4 p-5">
        <h3 className="text-xl font-semibold text-slate-950">Active Onboarding</h3>
        <OnboardingClientsToolbar filters={filters} onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))} />
        <OnboardingClientsTable clients={filteredClients} />
      </div>

      <div className="admin-panel space-y-4 p-5">
        <h3 className="text-xl font-semibold text-slate-950">Live</h3>
        {liveClients.length === 0 ? <EmptyCard>No completed live clients yet.</EmptyCard> : <OnboardingClientsTable clients={liveClients} />}
      </div>
    </div>
  );
}
