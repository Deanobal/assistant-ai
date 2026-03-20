import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { buildIntegrationSummary, mergeIntegrationState } from './integrations/integrationsData';
import IntegrationSummaryStrip from './integrations/IntegrationSummaryStrip';
import IntegrationSection from './integrations/IntegrationSection';

export default function PortalIntegrations({ clientAccountId = null, mode = 'live' }) {
  const queryClient = useQueryClient();
  const isSample = mode === 'sample';

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['integration-connections', clientAccountId || 'all', mode],
    queryFn: () => clientAccountId
      ? base44.entities.IntegrationConnection.filter({ client_account_id: clientAccountId }, '-updated_date', 100)
      : base44.entities.IntegrationConnection.list('-updated_date', 100),
    initialData: [],
    enabled: !isSample,
  });

  const mutation = useMutation({
    mutationFn: async ({ item, action }) => {
      const existing = item.id ? records.find((record) => record.id === item.id) : null;
      const requestNote = action === 'connect'
        ? 'Connection request stored for admin setup.'
        : action === 'manage'
          ? 'Review request stored for admin follow-up.'
          : action === 'reconnect'
            ? 'Reconnect request stored for admin follow-up.'
            : 'Disconnect request stored for admin follow-up.';

      const nextData = {
        category: item.category,
        app_name: item.appName,
        client_account_id: clientAccountId,
        managed_by: existing?.managed_by || 'client',
        connected_account_identifier: existing?.connected_account_identifier || null,
        last_sync_time: existing?.last_sync_time || null,
        last_error_message: requestNote,
        connection_status: action === 'manage'
          ? existing?.connection_status || item.status || 'not_connected'
          : 'pending',
      };

      if (existing) {
        return base44.entities.IntegrationConnection.update(existing.id, {
          ...existing,
          ...nextData,
        });
      }

      return base44.entities.IntegrationConnection.create(nextData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration-connections', clientAccountId || 'all', mode] });
    },
  });

  const sections = mergeIntegrationState(isSample ? [] : records);
  const summary = buildIntegrationSummary(isSample ? [] : records);
  const hasLiveRecords = records.length > 0;

  if (!isSample && isLoading) {
    return (
      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-8 text-center text-gray-400">Loading integration states…</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Integrations</h2>
          <p className="text-gray-400 max-w-3xl">Connected tools help AssistantAI sync call data, bookings, follow-up, and billing across your business systems.</p>
        </div>
        <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 w-fit">{isSample ? 'Sample integration preview' : 'Stored connection states'}</Badge>
      </div>

      <div className="rounded-[28px] border border-white/5 bg-gradient-to-r from-cyan-500/8 via-blue-500/6 to-transparent px-6 py-5">
        <p className="text-sm text-gray-200 leading-relaxed">{hasLiveRecords ? 'These cards read from saved integration records. Where no provider is connected yet, actions create admin-managed requests instead of pretending the connection is live.' : 'No live integrations are connected yet. Safe empty states are shown until real connections are stored.'}</p>
      </div>

      <IntegrationSummaryStrip items={summary} />

      <div className="space-y-10">
        {sections.map((section) => (
          <IntegrationSection key={section.title} section={section} onAction={(item, action) => mutation.mutate({ item: { ...item, category: section.category }, action })} isSaving={mutation.isPending} />
        ))}
      </div>
    </div>
  );
}