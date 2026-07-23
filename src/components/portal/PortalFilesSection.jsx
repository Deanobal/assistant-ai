import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { assistantApi } from '@/api/nativeClient';
import SharedFilesManager from '@/components/files/SharedFilesManager';

export default function PortalFilesSection({ clientAccountId }) {
  const { data: clients = [] } = useQuery({
    queryKey: ['portal-files', clientAccountId],
    queryFn: () => assistantApi.entities.Client.filter({ id: clientAccountId }, '-updated_date', 1),
    initialData: [],
  });

  const client = clients[0];
  return <SharedFilesManager files={client?.shared_files || []} />;
}