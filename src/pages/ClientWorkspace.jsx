import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WorkspaceHeader from '@/components/admin/onboarding/WorkspaceHeader';
import OverviewTab from '@/components/admin/onboarding/OverviewTab';
import OnboardingIntakeForm from '@/components/admin/onboarding/OnboardingIntakeForm';
import ChecklistTab from '@/components/admin/onboarding/ChecklistTab';
import IntegrationsTab from '@/components/admin/onboarding/IntegrationsTab';
import NotesTab from '@/components/admin/onboarding/NotesTab';
import BillingTab from '@/components/admin/onboarding/BillingTab';
import FilesTab from '@/components/admin/onboarding/FilesTab';
import GoLiveTab from '@/components/admin/onboarding/GoLiveTab';
import SettingsTab from '@/components/admin/onboarding/SettingsTab';
import { PLAN_PRICING, getProgressFromTasks, getTasksForPlan } from '@/components/admin/onboarding/onboardingConfig';

export default function ClientWorkspace() {
  const queryClient = useQueryClient();
  const clientId = new URLSearchParams(window.location.search).get('id');
  const [clientDraft, setClientDraft] = useState(null);
  const [intakeDraft, setIntakeDraft] = useState(null);

  const { data: clients = [] } = useQuery({ queryKey: ['client-workspace', clientId], queryFn: () => base44.entities.Client.filter({ id: clientId }, '-updated_date', 1), initialData: [] });
  const { data: intakeForms = [] } = useQuery({ queryKey: ['client-workspace-intake', clientId], queryFn: () => base44.entities.IntakeForm.filter({ client_id: clientId }, '-updated_date', 1), initialData: [] });
  const { data: tasks = [] } = useQuery({ queryKey: ['client-workspace-tasks', clientId], queryFn: () => base44.entities.OnboardingTask.filter({ client_id: clientId }, '-updated_date', 300), initialData: [] });
  const { data: integrations = [] } = useQuery({ queryKey: ['client-workspace-integrations', clientId], queryFn: () => base44.entities.IntegrationStatus.filter({ client_id: clientId }, '-updated_date', 100), initialData: [] });
  const { data: notes = [] } = useQuery({ queryKey: ['client-workspace-notes', clientId], queryFn: () => base44.entities.ClientNote.filter({ client_id: clientId }, '-updated_date', 200), initialData: [] });
  const { data: billingRecords = [] } = useQuery({ queryKey: ['client-workspace-billing', clientId], queryFn: () => base44.entities.BillingStatus.filter({ client_id: clientId }, '-updated_date', 10), initialData: [] });

  const client = clients[0] || null;
  const intake = intakeForms[0] || null;
  const billing = billingRecords[0] || null;

  useEffect(() => {
    if (client) setClientDraft(client);
    if (intake) setIntakeDraft(intake);
  }, [client, intake]);

  const updateClientMutation = useMutation({
    mutationFn: (data) => base44.entities.Client.update(clientId, { ...data, updated_at: new Date().toISOString() }),
    onSuccess: () => {
      ['client-workspace', 'onboarding-clients', 'client-manager-clients'].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
    },
  });

  const updateIntakeMutation = useMutation({
    mutationFn: (data) => base44.entities.IntakeForm.update(intakeDraft.id, { ...data, last_updated: new Date().toISOString() }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client-workspace-intake', clientId] }),
  });

  const updateTaskMutation = useMutation({
    mutationFn: (task) => base44.entities.OnboardingTask.update(task.id, { ...task, updated_at: new Date().toISOString() }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client-workspace-tasks', clientId] }),
  });

  const updateIntegrationMutation = useMutation({
    mutationFn: async ({ record, status }) => {
      if (record.id) return base44.entities.IntegrationStatus.update(record.id, { ...record, connection_status: status, last_sync: status === 'connected' ? new Date().toISOString() : record.last_sync });
      return base44.entities.IntegrationStatus.create({ ...record, client_id: clientId, connection_status: status, last_sync: status === 'connected' ? new Date().toISOString() : null, notes: record.notes || '' });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client-workspace-integrations', clientId] }),
  });

  const createNoteMutation = useMutation({
    mutationFn: (note) => base44.entities.ClientNote.create({ client_id: clientId, note_type: note.note_type, content: note.content, created_by: 'admin', created_at: new Date().toISOString(), is_archived: false }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client-workspace-notes', clientId] }),
  });

  const updateBillingMutation = useMutation({
    mutationFn: (patch) => billing?.id ? base44.entities.BillingStatus.update(billing.id, { ...billing, ...patch }) : base44.entities.BillingStatus.create({ client_id: clientId, plan: clientDraft.plan, setup_fee: PLAN_PRICING[clientDraft.plan].setup_fee, monthly_fee: PLAN_PRICING[clientDraft.plan].monthly_fee, billing_status: 'draft', payment_method: '', invoice_reference: '', renewal_date: null, notes: '', ...patch }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client-workspace-billing', clientId] }),
  });

  const ensurePlanTasksMutation = useMutation({
    mutationFn: async (plan) => {
      const existingNames = new Set(tasks.map((task) => task.task_name));
      const missing = getTasksForPlan(plan).filter((task) => !existingNames.has(task.task_name));
      if (missing.length) {
        await base44.entities.OnboardingTask.bulkCreate(missing.map((task) => ({ ...task, client_id: clientId, completed: false, due_date: null, assigned_to: clientDraft.assigned_owner || '', notes: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), blocked: false, is_archived: false })));
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client-workspace-tasks', clientId] }),
  });

  const taskSummary = useMemo(() => ({ total: tasks.length, completed: tasks.filter((task) => task.completed).length }), [tasks]);

  useEffect(() => {
    if (clientDraft?.plan) ensurePlanTasksMutation.mutate(clientDraft.plan);
  }, [clientDraft?.plan]);

  if (!clientDraft || !intakeDraft) return <div className="text-gray-400">Client not found.</div>;

  const persistClient = (patch) => {
    const next = { ...clientDraft, ...patch };
    if (patch.plan && patch.plan !== clientDraft.plan) {
      updateBillingMutation.mutate({ plan: patch.plan, setup_fee: PLAN_PRICING[patch.plan].setup_fee, monthly_fee: PLAN_PRICING[patch.plan].monthly_fee });
    }
    if (patch.plan || patch.status || patch.assigned_owner) {
      next.last_activity = 'Client workspace updated';
    }
    setClientDraft(next);
    updateClientMutation.mutate({ ...next, progress_percentage: getProgressFromTasks(tasks), lifecycle_state: next.lifecycle_state || 'pre_live' });
  };

  const handleGoLive = async () => {
    await updateClientMutation.mutateAsync({
      ...clientDraft,
      status: 'Live',
      lifecycle_state: 'live',
      onboarding_archived: true,
      go_live_ready: true,
      go_live_date: new Date().toISOString().slice(0, 10),
      workflow_phase: 'Go Live',
      last_activity: 'Client marked live and transitioned into Client Manager',
      progress_percentage: 100,
      updated_at: new Date().toISOString(),
    });
    if (intakeDraft?.id) {
      await updateIntakeMutation.mutateAsync({ ...intakeDraft, is_archived: true, approval_status: 'approved', last_updated: new Date().toISOString() });
    }
    await Promise.all(tasks.map((task) => updateTaskMutation.mutateAsync({ ...task, is_archived: true })));
    await Promise.all(notes.filter((note) => !note.is_archived).map((note) => base44.entities.ClientNote.update(note.id, { ...note, is_archived: true })));
    queryClient.invalidateQueries({ queryKey: ['client-workspace-notes', clientId] });
    queryClient.invalidateQueries({ queryKey: ['onboarding-clients'] });
    queryClient.invalidateQueries({ queryKey: ['client-manager-clients'] });
  };

  const activeTasks = tasks.filter((task) => !task.is_archived);
  const activeNotes = notes.filter((note) => !note.is_archived || clientDraft.lifecycle_state === 'live');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <Link to={clientDraft.lifecycle_state === 'live' ? '/ClientManager' : '/Onboarding'} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4" />Back</Link>
        {clientDraft.lifecycle_state !== 'live' && <Button onClick={handleGoLive} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">Mark as Go Live</Button>}
      </div>

      <WorkspaceHeader client={{ ...clientDraft, progress_percentage: getProgressFromTasks(activeTasks) }} />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-[#12121a] border border-white/5 flex flex-wrap h-auto gap-2 p-2 justify-start">
          {['overview', 'intake', 'checklist', 'integrations', 'notes', 'billing', 'files', 'go_live', 'settings'].map((tab) => <TabsTrigger key={tab} value={tab} className="capitalize data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500">{tab.replace('_', ' ')}</TabsTrigger>)}
        </TabsList>

        <TabsContent value="overview"><OverviewTab client={clientDraft} intake={intakeDraft} taskSummary={taskSummary} /></TabsContent>
        <TabsContent value="intake"><OnboardingIntakeForm value={intakeDraft} client={clientDraft} onChange={(key, value) => setIntakeDraft((prev) => ({ ...prev, [key]: value }))} onClientChange={(key, value) => setClientDraft((prev) => ({ ...prev, [key]: value }))} onSave={() => { updateIntakeMutation.mutate(intakeDraft); updateClientMutation.mutate(clientDraft); }} isSaving={updateIntakeMutation.isPending || updateClientMutation.isPending} isReadOnly={!!clientDraft.onboarding_archived} /></TabsContent>
        <TabsContent value="checklist"><ChecklistTab tasks={activeTasks} onToggleTask={(task) => updateTaskMutation.mutate({ ...task, completed: !task.completed })} onToggleBlocked={(task) => updateTaskMutation.mutate({ ...task, blocked: !task.blocked })} /></TabsContent>
        <TabsContent value="integrations"><IntegrationsTab integrations={integrations} onUpdate={(record, status) => updateIntegrationMutation.mutate({ record, status })} /></TabsContent>
        <TabsContent value="notes"><NotesTab notes={activeNotes} onCreate={(note) => createNoteMutation.mutate(note)} /></TabsContent>
        <TabsContent value="billing"><BillingTab billing={billing} /></TabsContent>
        <TabsContent value="files"><FilesTab /></TabsContent>
        <TabsContent value="go_live"><GoLiveTab client={{ ...clientDraft, progress_percentage: getProgressFromTasks(activeTasks) }} tasks={activeTasks} /></TabsContent>
        <TabsContent value="settings"><SettingsTab client={clientDraft} onUpdate={persistClient} /></TabsContent>
      </Tabs>
    </div>
  );
}