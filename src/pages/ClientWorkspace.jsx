import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WorkspaceOverviewTab from '@/components/admin/client-manager/WorkspaceOverviewTab';
import WorkspaceCallsTab from '@/components/admin/client-manager/WorkspaceCallsTab';
import WorkspaceAnalyticsTab from '@/components/admin/client-manager/WorkspaceAnalyticsTab';
import WorkspaceBillingTab from '@/components/admin/client-manager/WorkspaceBillingTab';
import WorkspaceIntegrationsTab from '@/components/admin/client-manager/WorkspaceIntegrationsTab';
import WorkspaceServicesTab from '@/components/admin/client-manager/WorkspaceServicesTab';
import WorkspaceNotesTab from '@/components/admin/client-manager/WorkspaceNotesTab';
import WorkspaceSettingsTab from '@/components/admin/client-manager/WorkspaceSettingsTab';
import { loadClientAccounts, updateClientAccount } from '@/components/admin/client-manager/storage';
import { clientStatusStyles } from '@/components/admin/client-manager/mockClients';

export default function ClientWorkspace() {
  const clientId = new URLSearchParams(window.location.search).get('id');
  const [client, setClient] = useState(null);
  const [overviewDraft, setOverviewDraft] = useState(null);

  useEffect(() => {
    const found = loadClientAccounts().find((item) => item.id === clientId);
    setClient(found || null);
    setOverviewDraft(found || null);
  }, [clientId]);

  const refreshClient = (updater) => {
    const updated = updateClientAccount(clientId, updater);
    setClient(updated);
    setOverviewDraft(updated);
  };

  const derivedClient = useMemo(() => {
    if (!client) return null;
    return {
      ...client,
      active_services: client.services.filter((service) => service.status !== 'Inactive').map((service) => service.name),
    };
  }, [client]);

  if (!derivedClient || !overviewDraft) {
    return <div className="text-gray-400">Client not found.</div>;
  }

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
          <p className="text-gray-400 max-w-3xl">Internal workspace for services, billing, activity, analytics, and account controls.</p>
        </div>
        <Button variant="outline" className="border-white/10 bg-transparent text-white hover:bg-white/5">View Client Portal Access</Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-[#12121a] border border-white/5 flex flex-wrap h-auto gap-2 p-2 justify-start">
          {['overview', 'calls', 'analytics', 'billing', 'integrations', 'services', 'notes', 'settings'].map((tab) => (
            <TabsTrigger key={tab} value={tab} className="capitalize data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500">{tab}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <WorkspaceOverviewTab draft={overviewDraft} onChange={(key, value) => setOverviewDraft((prev) => ({ ...prev, [key]: value }))} onSave={() => refreshClient(() => overviewDraft)} />
        </TabsContent>
        <TabsContent value="calls"><WorkspaceCallsTab client={derivedClient} /></TabsContent>
        <TabsContent value="analytics"><WorkspaceAnalyticsTab client={derivedClient} /></TabsContent>
        <TabsContent value="billing"><WorkspaceBillingTab client={derivedClient} /></TabsContent>
        <TabsContent value="integrations"><WorkspaceIntegrationsTab client={derivedClient} onIntegrationAction={(name, action) => refreshClient((current) => ({ ...current, integrations: current.integrations.map((item) => item.name === name ? { ...item, status: action === 'Disconnect' ? 'Not Connected' : action === 'Reconnect' ? 'Connected' : item.status === 'Not Connected' ? 'Connected' : item.status, last_sync: action === 'Disconnect' ? 'No sync yet' : 'Just now' } : item) }))} /></TabsContent>
        <TabsContent value="services"><WorkspaceServicesTab client={derivedClient} onUpdate={(patch) => refreshClient((current) => ({ ...current, ...patch }))} /></TabsContent>
        <TabsContent value="notes"><WorkspaceNotesTab client={derivedClient} onAddNote={(note) => refreshClient((current) => ({ ...current, notes_entries: [{ ...note, date: 'Today' }, ...current.notes_entries] }))} /></TabsContent>
        <TabsContent value="settings"><WorkspaceSettingsTab client={derivedClient} onUpdate={(patch) => refreshClient((current) => ({ ...current, ...patch }))} /></TabsContent>
      </Tabs>
    </div>
  );
}