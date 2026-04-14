import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { INTEGRATION_LIBRARY } from './onboardingConfig';

const statusStyles = {
  connected: 'bg-green-500/10 text-green-400 border-green-500/20',
  pending: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  planned: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  not_included: 'bg-white/5 text-gray-300 border-white/10',
  upgrade_required: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
};

export default function IntegrationsTab({ integrations, onUpdate }) {
  return (
    <div className="space-y-6">
      {Object.entries(INTEGRATION_LIBRARY).map(([group, names]) => (
        <div key={group} className="space-y-4">
          <h3 className="text-white font-semibold">{group}</h3>
          <div className="grid xl:grid-cols-2 gap-4">
            {names.map((name) => {
              const integration = integrations.find((item) => item.integration_name === name) || { integration_name: name, integration_type: group, connection_status: 'planned', last_sync: null, notes: '' };
              return (
                <Card key={name} className="bg-[#12121a] border-white/5">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-white font-medium">{integration.integration_name}</p>
                        <p className="text-sm text-gray-400 mt-1">Type: {integration.integration_type}</p>
                      </div>
                      <Badge className={statusStyles[integration.connection_status]}>{integration.connection_status.replaceAll('_', ' ')}</Badge>
                    </div>
                    <div className="space-y-2 text-sm text-gray-400">
                      <p>Last sync: <span className="text-white">{integration.last_sync || 'Not synced yet'}</span></p>
                      <p>Notes: <span className="text-white">{integration.notes || 'No notes yet'}</span></p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['connected', 'pending', 'planned', 'not_included', 'upgrade_required'].map((status) => (
                        <Button key={status} size="sm" variant="outline" onClick={() => onUpdate(integration, status)} className="border-white/10 bg-transparent text-white hover:bg-white/5">
                          {status === 'connected' ? 'Connect' : status === 'pending' ? 'Mark Pending' : status === 'planned' ? 'Plan' : status === 'not_included' ? 'Not Included' : 'Upgrade Required'}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}