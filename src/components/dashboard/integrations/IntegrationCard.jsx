import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getPrimaryAction, getSecondaryAction } from './integrationsData';

const statusLabel = {
  not_connected: 'Not Connected',
  pending: 'Pending',
  connected: 'Connected',
  error: 'Error',
  disconnected: 'Disconnected',
};

const statusClasses = {
  connected: 'bg-green-500/10 text-green-400 border-green-500/20',
  pending: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  error: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  not_connected: 'bg-white/5 text-gray-300 border-white/10',
  disconnected: 'bg-white/5 text-gray-300 border-white/10',
};

const actionLabel = {
  connect: 'Request Connection',
  pending: 'Request Pending',
  manage: 'Request Review',
  reconnect: 'Request Reconnect',
  disconnect: 'Request Disconnect',
};

export default function IntegrationCard({ item, features, onAction, isSaving }) {
  const primaryAction = getPrimaryAction(item.status);
  const secondaryAction = getSecondaryAction(item.status);
  const isPendingRequest = item.status === 'pending';

  return (
    <Card className="bg-[#12121a] border-white/5 h-full shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-blue-500/15 border border-cyan-500/15 flex items-center justify-center text-sm font-semibold text-cyan-300 shrink-0">
              {item.appCode}
            </div>
            <div className="min-w-0">
              <h4 className="text-lg font-semibold text-white truncate">{item.appName}</h4>
              <p className="text-sm text-gray-500">{item.status === 'error' ? 'Needs admin review before this can be considered active' : item.status === 'pending' ? 'A connection request has been stored for admin review' : item.status === 'connected' ? 'Stored connection state is active' : 'No live connection saved yet'}</p>
            </div>
          </div>
          <Badge className={statusClasses[item.status]}>{statusLabel[item.status]}</Badge>
        </div>

        <p className="text-sm leading-relaxed text-gray-400">{item.description}</p>

        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 space-y-3">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-gray-500">Last Sync</span>
            <span className="text-white text-right">{item.lastSyncTime ? new Date(item.lastSyncTime).toLocaleString() : 'No sync yet'}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-gray-500">Managed By</span>
            <span className="text-white capitalize">{item.managedBy}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-gray-500">Account</span>
            <span className="text-white text-right">{item.connectedAccountIdentifier || 'Not linked yet'}</span>
          </div>
          {item.lastErrorMessage && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
              {item.lastErrorMessage}
            </div>
          )}
        </div>

        <div className="space-y-2">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-sm text-gray-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Button
            disabled={isSaving || isPendingRequest}
            onClick={() => onAction(item, primaryAction)}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50"
          >
            {actionLabel[primaryAction]}
          </Button>
          {secondaryAction && (
            <Button
              variant="outline"
              disabled={isSaving}
              onClick={() => onAction(item, secondaryAction)}
              className="border-white/10 bg-transparent text-white hover:bg-white/5 disabled:opacity-50"
            >
              {actionLabel[secondaryAction]}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}