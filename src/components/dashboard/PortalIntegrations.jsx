import React from 'react';
import { Badge } from '@/components/ui/badge';
import { integrationSections, integrationSummary } from './integrations/integrationsData';
import IntegrationSummaryStrip from './integrations/IntegrationSummaryStrip';
import IntegrationSection from './integrations/IntegrationSection';

export default function PortalIntegrations() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Integrations</h2>
          <p className="text-gray-400 max-w-3xl">Connected tools help AssistantAI sync call data, bookings, follow-up, and billing across your business systems.</p>
        </div>
        <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 w-fit">Connected Apps Overview</Badge>
      </div>

      <div className="rounded-[28px] border border-white/5 bg-gradient-to-r from-cyan-500/8 via-blue-500/6 to-transparent px-6 py-5">
        <p className="text-sm text-gray-200 leading-relaxed">Connected tools help AssistantAI sync call data, bookings, follow-up, and billing across your business systems.</p>
      </div>

      <IntegrationSummaryStrip items={integrationSummary} />

      <div className="space-y-10">
        {integrationSections.map((section) => (
          <IntegrationSection key={section.title} section={section} />
        ))}
      </div>
    </div>
  );
}