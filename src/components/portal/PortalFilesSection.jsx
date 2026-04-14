import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import SharedFilesManager from '@/components/files/SharedFilesManager';

export default function PortalFilesSection({ clientAccountId }) {
  const { data: clients = [] } = useQuery({
    queryKey: ['portal-files', clientAccountId],
    queryFn: () => base44.entities.Client.filter({ id: clientAccountId }, '-updated_date', 1),
    initialData: [],
  });

  const client = clients[0];
  return <SharedFilesManager files={client?.shared_files || []} />;
}