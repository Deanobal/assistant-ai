import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import OnboardingKpiGrid from '@/components/admin/onboarding/OnboardingKpiGrid';
import OnboardingClientsTable from '@/components/admin/onboarding/OnboardingClientsTable';

export default function ClientManager() {
  const { data: clients = [] } = useQuery({
    queryKey: ['client-manager-clients'],
    queryFn: () => base44.entities.Client.list('-updated_date', 200),
    initialData: [],
  });

  const liveClients = clients.filter((client) => client.lifecycle_state === 'live' || client.status === 'Live');

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">Client Manager</Badge>
          <Badge className="bg-white/5 text-gray-300 border-white/10">Post-live operations only</Badge>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Live client operations</h2>
        <p className="text-gray-400 max-w-3xl">This workspace only shows live clients after onboarding is complete and the shared client record has transitioned into post-live management.</p>
      </div>

      <OnboardingKpiGrid items={[
        { label: 'Live Clients', value: liveClients.length, helper: 'Single source of truth records' },
        { label: 'Paused Clients', value: liveClients.filter((client) => client.status === 'Paused').length, helper: 'Operational holds' },
        { label: 'Starter / Growth / Enterprise', value: `${liveClients.filter((c) => c.plan === 'Starter').length} / ${liveClients.filter((c) => c.plan === 'Growth').length} / ${liveClients.filter((c) => c.plan === 'Enterprise').length}`, helper: 'Live plan mix' },
        { label: 'Go-Live Completed', value: liveClients.filter((client) => client.go_live_date).length, helper: 'Clients formally launched' },
      ]} />

      <OnboardingClientsTable clients={liveClients} />
    </div>
  );
}