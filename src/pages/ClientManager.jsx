import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import ManagerStats from '@/components/admin/client-manager/ManagerStats';
import ClientCard from '@/components/admin/client-manager/ClientCard';
import { calculateManagerStats } from '@/components/admin/client-manager/mockClients';
import { loadClientAccounts } from '@/components/admin/client-manager/storage';

export default function ClientManager() {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    setClients(loadClientAccounts().filter((client) => !client.is_archived));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">Client Manager</Badge>
            <Badge className="bg-white/5 text-gray-300 border-white/10">Internal agency workspace</Badge>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Manage Every Client Account</h2>
          <p className="text-gray-400 max-w-3xl">Review client health, open full workspaces, manage services, control billing, and keep your agency operations in one polished internal system.</p>
        </div>
      </div>

      <ManagerStats stats={calculateManagerStats(clients)} />

      <div className="grid xl:grid-cols-2 gap-6">
        {clients.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>
    </div>
  );
}