import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WorkspaceOverviewTab from '@/components/admin/client-manager/WorkspaceOverviewTab';
import WorkspaceCallsTab from '@/components/admin/client-manager/WorkspaceCallsTab';
import WorkspaceAnalyticsTab from '@/components/admin/client-manager/WorkspaceAnalyticsTab';
import WorkspaceBillingTab from '@/components/admin/client-manager/WorkspaceBillingTab';
import WorkspaceIntegrationsTab from '@/components/admin/client-manager/WorkspaceIntegrationsTab';
import WorkspaceServicesTab from '@/components/admin/client-manager/WorkspaceServicesTab';
import WorkspaceNotesTab from '@/components/admin/client-manager/WorkspaceNotesTab';
import WorkspaceSettingsTab from '@/components/admin/client-manager/WorkspaceSettingsTab';
import { clientStatusStyles } from '@/components/admin/client-manager/mockClients';

export default function ClientWorkspace() {
  const queryClient = useQueryClient();
  const clientId = new URLSearchParams(window.location.search).get('id');
  const [overviewDraft, setOverviewDraft] = useState(null);

  const { data: clients = [] } = useQuery({
    queryKey: ['client-workspace', clientId],
    queryFn: () => base44.entities.ClientAccount.filter({ id: clientId }, '-updated_date', 1),
    initialData: [],
  });

  const { data: onboardingRecords = [] } = useQuery({
    queryKey: ['client-workspace-onboarding', clientId],
    queryFn: () => base44.entities.Onboarding.filter({ client_account_id: clientId }, '-updated_date', 10),
    initialData: [],
  });

  const { data: billingRecords = [] } = useQuery({
    queryKey: ['client-workspace-billing', clientId],
    queryFn: () => base44.entities.BillingRecord.filter({ client_id: clientId }, '-updated_date', 50),
    initialData: [],
  });

  const client = clients[0] || null;

  useEffect(() => {
    if (client) {
      setOverviewDraft(client);
    }
  }, [client]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.ClientAccount.update(clientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-workspace', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client-manager-clients'] });
    },
  });

  const derivedClient = useMemo(() => {
    if (!client) return null;
    return {
      ...client,
      services: client.services || [],
      notes_entries: client.notes_entries || [],
      active_services: (client.services || []).filter((service) => service.status !== 'Inactive').map((service) => service.name),
      recent_calls: client.recent_calls || [],
      analytics: client.analytics || { lead_conversion: 0, average_call_duration: '', peak_call_times: '', follow_up_metrics: '', trend: [], categories: [] },
    };
  }, [client]);

  if (!derivedClient || !overviewDraft) {
    return <div className="text-gray-400">Client not found.</div>;
  }

  const persistClient = (next) => {
    const merged = typeof next === 'function' ? next(derivedClient) : { ...derivedClient, ...next };
    const normalized = {
      ...merged,
      active_services: (merged.services || []).filter((service) => service.status !== 'Inactive').map((service) => service.name),
    };
    updateMutation.mutate(normalized);
  };

  const latestBilling = billingRecords[0] || null;
  const latestOnboarding = onboardingRecords[0] || null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <Link to="/ClientManager" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Client Manager
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <Badge className={clientStatusStyles[derivedClient.status]}>{derivedClient.status}</Badge>
            <Badge className="bg-white/5 text-gray-300 border-white/10">{derivedClient.plan_name} Plan</Badge>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">{derivedClient.business_name}</h2>
          <p className="text-gray-400 max-w-3xl">Internal workspace for services, billing, activity, analytics, onboarding, and account controls.</p>
        </div>
        <Button variant="outline" className="border-white/10 bg-transparent text-white hover:bg-white/5">View Client Portal Access</Button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="bg-[#12121a] border-white/5"><CardContent className="p-5"><p className="text-sm text-gray-400">Linked Lead</p><p className="text-white font-semibold mt-2">{derivedClient.lead_id || 'Not linked yet'}</p></CardContent></Card>
        <Card className="bg-[#12121a] border-white/5"><CardContent className="p-5"><p className="text-sm text-gray-400">Onboarding</p><p className="text-white font-semibold mt-2">{latestOnboarding ? latestOnboarding.onboarding_stage : 'No onboarding record'}</p></CardContent></Card>
        <Card className="bg-[#12121a] border-white/5"><CardContent className="p-5"><p className="text-sm text-gray-400">Billing</p><p className="text-white font-semibold mt-2">{latestBilling ? latestBilling.billing_status : 'No billing record'}</p></CardContent></Card>
        <Card className="bg-[#12121a] border-white/5"><CardContent className="p-5"><p className="text-sm text-gray-400">Integrations</p><p className="text-white font-semibold mt-2">View live status in Integrations tab</p></CardContent></Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-[#12121a] border border-white/5 flex flex-wrap h-auto gap-2 p-2 justify-start">
          {['overview', 'calls', 'analytics', 'billing', 'integrations', 'services', 'notes', 'settings'].map((tab) => (
            <TabsTrigger key={tab} value={tab} className="capitalize data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500">{tab}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <WorkspaceOverviewTab draft={overviewDraft} onChange={(key, value) => setOverviewDraft((prev) => ({ ...prev, [key]: value }))} onSave={() => persistClient(overviewDraft)} />
        </TabsContent>
        <TabsContent value="calls"><WorkspaceCallsTab client={derivedClient} /></TabsContent>
        <TabsContent value="analytics"><WorkspaceAnalyticsTab client={derivedClient} /></TabsContent>
        <TabsContent value="billing"><WorkspaceBillingTab client={derivedClient} billingRecords={billingRecords} /></TabsContent>
        <TabsContent value="integrations"><WorkspaceIntegrationsTab client={derivedClient} /></TabsContent>
        <TabsContent value="services"><WorkspaceServicesTab client={derivedClient} onUpdate={(patch) => persistClient({ ...patch, last_activity: 'Service configuration updated' })} /></TabsContent>
        <TabsContent value="notes"><WorkspaceNotesTab client={derivedClient} onAddNote={(note) => persistClient({ notes_entries: [{ ...note, date: 'Today' }, ...derivedClient.notes_entries], last_activity: 'Internal note added' })} /></TabsContent>
        <TabsContent value="settings"><WorkspaceSettingsTab client={derivedClient} onUpdate={(patch) => persistClient({ ...patch, last_activity: 'Client settings updated' })} /></TabsContent>
      </Tabs>
    </div>
  );
}