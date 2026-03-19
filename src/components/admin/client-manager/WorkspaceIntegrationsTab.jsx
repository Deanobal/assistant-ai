import React from 'react';
import PortalIntegrations from '@/components/dashboard/PortalIntegrations';

export default function WorkspaceIntegrationsTab({ client }) {
  return <PortalIntegrations clientAccountId={client.id} />;
}