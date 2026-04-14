import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { clientStatusStyles } from '@/components/admin/client-manager/mockClients';
import { getClientLifecycleLabel } from './onboardingConfig';

export default function WorkspaceHeader({ client }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Badge className={clientStatusStyles[client.status] || 'bg-white/5 text-gray-300 border-white/10'}>{client.status}</Badge>
        <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">{client.plan}</Badge>
        <Badge className="bg-white/5 text-gray-300 border-white/10">{getClientLifecycleLabel(client)}</Badge>
      </div>
      <div>
        <h2 className="text-3xl font-bold text-white">{client.business_name}</h2>
        <p className="text-gray-400 mt-2">Primary contact: {client.full_name} • {client.email}</p>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          ['Next Recommended Action', client.next_action || 'No next action set'],
          ['Blockers', client.blockers?.length ? client.blockers.join(', ') : 'No blockers'],
          ['Target Go-Live Date', client.target_go_live_date || 'Not set'],
          ['Workflow Phase', client.workflow_phase || 'Not set'],
        ].map(([label, value]) => (
          <Card key={label} className="bg-[#12121a] border-white/5">
            <CardContent className="p-5">
              <p className="text-sm text-gray-400">{label}</p>
              <p className="text-white font-semibold mt-2">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-gray-400">Progress</p>
            <p className="text-white font-semibold">{client.progress_percentage || 0}%</p>
          </div>
          <div className="h-3 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${client.progress_percentage || 0}%` }} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}