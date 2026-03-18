import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const statusClass = {
  Connected: 'bg-green-500/10 text-green-400 border-green-500/20',
  'Not Connected': 'bg-white/5 text-gray-300 border-white/10',
  'Needs Attention': 'bg-amber-500/10 text-amber-300 border-amber-500/20',
};

export default function WorkspaceIntegrationsTab({ client, onIntegrationAction }) {
  return (
    <div className="grid xl:grid-cols-2 gap-6">
      {client.integrations.map((integration) => {
        const action = integration.status === 'Connected' ? 'Manage' : integration.status === 'Needs Attention' ? 'Reconnect' : 'Connect';
        return (
          <Card key={integration.name} className="bg-[#12121a] border-white/5">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">{integration.category}</p>
                  <h3 className="text-lg font-semibold text-white mt-1">{integration.name}</h3>
                </div>
                <Badge className={statusClass[integration.status]}>{integration.status}</Badge>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-sm text-gray-400 flex items-center justify-between">
                <span>Last Sync</span>
                <span className="text-white">{integration.last_sync}</span>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => onIntegrationAction(integration.name, action)} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white">{action}</Button>
                <Button variant="outline" onClick={() => onIntegrationAction(integration.name, 'Disconnect')} className="border-white/10 text-white hover:bg-white/5">Disconnect</Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}