import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, BriefcaseBusiness } from 'lucide-react';
import { assistantApi } from '@/api/nativeClient';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminEmptyState } from '@/components/admin/AdminState';
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
import ClientConnectorCockpit from '@/components/admin/onboarding/ClientConnectorCockpit';
import { PLAN_PRICING, getBlockers, getNextActionFromTasks, getProgressFromTasks, getWorkflowPhaseFromTasks, isGoLiveReady } from '@/components/admin/onboarding/onboardingConfig';

function fallbackIntakeFromClient(client, clientId) {
  if (!client) return null;
  return {
    client_id: clientId,
    contact_name: client.full_name || '',
    business_name: client.business_name || client.full_name || '',
    email: client.email || '',
    phone: client.mobile_number || client.phone || '',
    website: client.website || '',
    industry: client.industry || 'other',
    approval_status: 'draft',
    business_description: '',
    services_offered: '',
    service_areas: '',
    business_hours: '',
    emergency_rules: '',
    faq_list: '',
    pricing_guidance: '',
    escalation_contact: client.mobile_number || client.phone || client.email || '',
    is_archived: false,
    last_updated: new Date().toISOString(),
    _temporary: true,
  };
}

async function loadWorkspace(clientId) {
  if (!clientId) throw new Error('Client id is required');
  const response = await fetch(`/api/client-workspace?id=${encodeURIComponent(clientId)}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) throw new Error(data.details || data.error || 'Client workspace could not be loaded');
  return data;
}

export default function ClientWorkspace() {
  const queryClient = useQueryClient();
  const clientId = new URLSearchParams(window.location.search).get('id');
  const [clientDraft, setClientDraft] = useState(null);
  const [intakeDraft, setIntakeDraft] = useState(null);

  const { data: workspace = null, error: workspaceError, isLoading } = useQuery({
    queryKey: ['client-workspace-direct', clientId],
    queryFn: () => loadWorkspace(clientId),
    enabled: Boolean(clientId),
    retry: 1,
  });

  const client = workspace?.client || null;
  const intake = workspace?.intake || null;
  const tasks = workspace?.tasks || [];
  const integrations = workspace?.integrations || [];
  const notes = workspace?.notes || [];
  const billing = workspace?.billing || null;

  useEffect(() => {
    if (client) {
      setClientDraft(client);
      setIntakeDraft(intake || fallbackIntakeFromClient(client, clientId));
    }
  }, [client, intake, clientId]);

  const updateClientMutation = useMutation({
    mutationFn: (data) => assistantApi.entities.Client.update(clientId, { ...data, updated_at: new Date().toISOString() }),
    onSuccess: () => {
      ['client-workspace-direct', 'onboarding-clients', 'client-manager-clients'].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
    },
  });

  const updateIntakeMutation = useMutation({
    mutationFn: (data) => data.id
      ? assistantApi.entities.IntakeForm.update(data.id, { ...data, last_updated: new Date().toISOString() })
      : assistantApi.entities.IntakeForm.create({ ...data, client_id: clientId, last_updated: new Date().toISOString() }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client-workspace-direct', clientId] }),
  });

  const updateTaskMutation = useMutation({ mutationFn: (task) => assistantApi.entities.OnboardingTask.update(task.id, { ...task, updated_at: new Date().toISOString() }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client-workspace-direct', clientId] }) });

  const updateIntegrationMutation = useMutation({
    mutationFn: async ({ record, status }) => {
      if (record.id) return assistantApi.entities.IntegrationStatus.update(record.id, { ...record, connection_status: status, last_sync: status === 'connected' ? new Date().toISOString() : record.last_sync });
      return assistantApi.entities.IntegrationStatus.create({ ...record, client_id: clientId, connection_status: status, last_sync: status === 'connected' ? new Date().toISOString() : null, notes: record.notes || '' });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client-workspace-direct', clientId] }),
  });

  const createNoteMutation = useMutation({ mutationFn: (note) => assistantApi.entities.ClientNote.create({ client_id: clientId, note_type: note.note_type, content: note.content, created_by: 'admin', created_at: new Date().toISOString(), is_archived: false }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client-workspace-direct', clientId] }) });

  const updateBillingMutation = useMutation({
    mutationFn: (patch) => billing?.id ? assistantApi.entities.BillingStatus.update(billing.id, { ...billing, ...patch }) : assistantApi.entities.BillingStatus.create({ client_id: clientId, plan: clientDraft.plan, setup_fee: PLAN_PRICING[clientDraft.plan].setup_fee, monthly_fee: PLAN_PRICING[clientDraft.plan].monthly_fee, billing_status: 'draft', payment_method: '', invoice_reference: '', renewal_date: null, stripe_customer_id: null, stripe_subscription_id: null, stripe_checkout_session_id: null, admin_override: false, notes: '', ...patch }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client-workspace-direct', clientId] }),
  });

  const sendCheckoutMutation = useMutation({ mutationFn: () => assistantApi.functions.invoke('adminCreateStripeCheckout', { clientId, origin: window.location.origin }), onSuccess: (response) => { queryClient.invalidateQueries({ queryKey: ['client-workspace-direct', clientId] }); if (response?.data?.checkout_url) window.open(response.data.checkout_url, '_blank'); } });
  const overrideBillingMutation = useMutation({ mutationFn: () => assistantApi.functions.invoke('adminOverrideBillingStatus', { clientId, billingStatus: 'active' }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client-workspace-direct', clientId] }) });

  const taskSummary = useMemo(() => ({ total: tasks.length, completed: tasks.filter((task) => task.completed).length }), [tasks]);
  const activeTasks = tasks.filter((task) => !task.is_archived);
  const activeNotes = notes.filter((note) => !note.is_archived || clientDraft?.lifecycle_state === 'live');
  const progressPercentage = getProgressFromTasks(activeTasks);
  const workflowPhase = getWorkflowPhaseFromTasks(activeTasks);
  const nextAction = getNextActionFromTasks(activeTasks);
  const blockers = getBlockers({ intake: intakeDraft, integrations, billing, tasks: activeTasks });
  const isBillingActive = billing?.billing_status === 'active';
  const goLiveReady = isGoLiveReady(activeTasks);

  if (isLoading) {
    return <AdminEmptyState icon={BriefcaseBusiness} title="Loading client workspace" description="Fetching the client directly from Supabase." />;
  }

  if (!clientDraft) {
    return (
      <AdminEmptyState
        icon={BriefcaseBusiness}
        title="Client workspace unavailable"
        description={workspaceError?.message || 'This client could not be loaded. Return to onboarding and open the client again.'}
        action={<Link to="/Onboarding" className="inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800">Open onboarding</Link>}
      />
    );
  }

  const getOperationalClientState = (baseClient, nextTasks = activeTasks, nextIntake = intakeDraft, nextIntegrations = integrations, nextBilling = billing) => ({
    ...baseClient,
    progress_percentage: getProgressFromTasks(nextTasks),
    workflow_phase: getWorkflowPhaseFromTasks(nextTasks),
    next_action: getNextActionFromTasks(nextTasks),
    blockers: getBlockers({ intake: nextIntake, integrations: nextIntegrations, billing: nextBilling, tasks: nextTasks }),
    go_live_ready: isGoLiveReady(nextTasks),
    lifecycle_state: baseClient.lifecycle_state || 'pre_live',
  });

  const persistClient = (patch) => {
    const next = { ...clientDraft, ...patch };
    if (patch.plan && patch.plan !== clientDraft.plan) updateBillingMutation.mutate({ plan: patch.plan, setup_fee: PLAN_PRICING[patch.plan].setup_fee, monthly_fee: PLAN_PRICING[patch.plan].monthly_fee });
    if (patch.plan || patch.status || patch.assigned_owner) next.last_activity = 'Client workspace updated';
    const operationalClient = getOperationalClientState(next);
    setClientDraft(operationalClient);
    updateClientMutation.mutate(operationalClient);
  };

  const handleGoLive = async () => {
    if (!isBillingActive) return;
    await updateClientMutation.mutateAsync({ ...getOperationalClientState(clientDraft), status: 'Live', lifecycle_state: 'live', onboarding_archived: true, go_live_ready: true, go_live_date: new Date().toISOString().slice(0, 10), workflow_phase: 'Go Live', last_activity: 'Client marked live and transitioned into Client Manager', progress_percentage: 100, updated_at: new Date().toISOString() });
    if (intakeDraft?.id) await updateIntakeMutation.mutateAsync({ ...intakeDraft, is_archived: true, approval_status: 'approved', last_updated: new Date().toISOString() });
    await Promise.all(tasks.map((task) => updateTaskMutation.mutateAsync({ ...task, is_archived: true })));
    await Promise.all(notes.filter((note) => !note.is_archived).map((note) => assistantApi.entities.ClientNote.update(note.id, { ...note, is_archived: true })));
    queryClient.invalidateQueries({ queryKey: ['client-workspace-direct', clientId] });
    queryClient.invalidateQueries({ queryKey: ['onboarding-clients'] });
    queryClient.invalidateQueries({ queryKey: ['client-manager-clients'] });
  };

  return (
    <div className="space-y-8 text-slate-950">
      <div className="flex items-center justify-between gap-4">
        <Link to={clientDraft.lifecycle_state === 'live' ? '/ClientManager' : '/Onboarding'} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-950"><ArrowLeft className="w-4 h-4" />Back</Link>
        {clientDraft.lifecycle_state !== 'live' && <Button onClick={handleGoLive} disabled={!isBillingActive} className="bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50">Mark as Go Live</Button>}
      </div>

      <WorkspaceHeader client={{ ...clientDraft, progress_percentage: progressPercentage, workflow_phase: workflowPhase, next_action: nextAction, blockers, go_live_ready: goLiveReady, status: goLiveReady && clientDraft.status !== 'Live' ? 'Ready for Go Live' : clientDraft.status }} />
      <ClientConnectorCockpit client={clientDraft} intake={intakeDraft} integrations={integrations} billing={billing} tasks={activeTasks} />
      {!intakeDraft?.id && <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">This workspace is using a temporary intake draft from the client record. Open the Intake tab and save once to create the permanent intake record.</div>}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex h-auto flex-wrap justify-start gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          {['overview', 'intake', 'checklist', 'integrations', 'notes', 'billing', 'files', 'go_live', 'settings'].map((tab) => <TabsTrigger key={tab} value={tab} className="capitalize data-[state=active]:bg-slate-900 data-[state=active]:text-white">{tab.replace('_', ' ')}</TabsTrigger>)}
        </TabsList>
        <TabsContent value="overview"><OverviewTab client={{ ...clientDraft, progress_percentage: progressPercentage, workflow_phase: workflowPhase, next_action: nextAction, blockers }} intake={intakeDraft} taskSummary={taskSummary} /></TabsContent>
        <TabsContent value="intake"><OnboardingIntakeForm value={intakeDraft} client={clientDraft} onChange={(key, value) => setIntakeDraft((prev) => ({ ...prev, [key]: value }))} onClientChange={(key, value) => setClientDraft((prev) => ({ ...prev, [key]: value }))} onSave={() => { const operationalClient = getOperationalClientState({ ...clientDraft, last_activity: 'Intake updated', status: clientDraft.onboarding_archived ? clientDraft.status : 'Onboarding' }, activeTasks, intakeDraft); setClientDraft(operationalClient); updateIntakeMutation.mutate(intakeDraft); updateClientMutation.mutate(operationalClient); }} isSaving={updateIntakeMutation.isPending || updateClientMutation.isPending} isReadOnly={!!clientDraft.onboarding_archived} /></TabsContent>
        <TabsContent value="checklist"><ChecklistTab client={clientDraft} tasks={activeTasks} onToggleTask={(task) => { if (!isBillingActive) return; const nextTasks = activeTasks.map((item) => item.id === task.id ? { ...item, completed: !task.completed } : item); const operationalClient = getOperationalClientState({ ...clientDraft, last_activity: 'Checklist updated' }, nextTasks); setClientDraft(operationalClient); updateTaskMutation.mutate({ ...task, completed: !task.completed }); updateClientMutation.mutate(operationalClient); }} onToggleBlocked={(task) => { if (!isBillingActive) return; const nextTasks = activeTasks.map((item) => item.id === task.id ? { ...item, blocked: !task.blocked } : item); const operationalClient = getOperationalClientState({ ...clientDraft, last_activity: 'Checklist blocker updated' }, nextTasks); setClientDraft(operationalClient); updateTaskMutation.mutate({ ...task, blocked: !task.blocked }); updateClientMutation.mutate(operationalClient); }} onUpdateDueDate={(task, dueDate) => { if (!isBillingActive) return; const nextTasks = activeTasks.map((item) => item.id === task.id ? { ...item, due_date: dueDate || null } : item); const operationalClient = getOperationalClientState({ ...clientDraft, last_activity: 'Checklist due date updated' }, nextTasks); setClientDraft(operationalClient); updateTaskMutation.mutate({ ...task, due_date: dueDate || null }); updateClientMutation.mutate(operationalClient); }} /></TabsContent>
        <TabsContent value="integrations"><IntegrationsTab integrations={integrations} onUpdate={(record, status) => { const nextIntegrations = integrations.some((item) => item.id === record.id) ? integrations.map((item) => item.id === record.id ? { ...item, connection_status: status, last_sync: status === 'connected' ? new Date().toISOString() : item.last_sync } : item) : [...integrations, { ...record, connection_status: status, last_sync: status === 'connected' ? new Date().toISOString() : null }]; const operationalClient = getOperationalClientState({ ...clientDraft, last_activity: 'Integration status updated' }, activeTasks, intakeDraft, nextIntegrations); setClientDraft(operationalClient); updateIntegrationMutation.mutate({ record, status }); updateClientMutation.mutate(operationalClient); }} /></TabsContent>
        <TabsContent value="notes"><NotesTab notes={activeNotes} onCreate={(note) => createNoteMutation.mutate(note)} /></TabsContent>
        <TabsContent value="billing"><BillingTab billing={billing} onSendCheckout={() => sendCheckoutMutation.mutate()} onOverrideActive={() => overrideBillingMutation.mutate()} isSendingCheckout={sendCheckoutMutation.isPending} isUpdatingBilling={overrideBillingMutation.isPending} /></TabsContent>
        <TabsContent value="files"><FilesTab client={clientDraft} onUpdate={persistClient} /></TabsContent>
        <TabsContent value="go_live"><GoLiveTab client={{ ...clientDraft, progress_percentage: getProgressFromTasks(activeTasks) }} tasks={activeTasks} /></TabsContent>
        <TabsContent value="settings"><SettingsTab client={clientDraft} onUpdate={persistClient} /></TabsContent>
      </Tabs>
    </div>
  );
}
