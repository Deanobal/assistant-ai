import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function OnboardingLeadCard({ lead, onConvert, disabled }) {
  return (
    <Card className="bg-[#12121a] border-white/5">
      <CardContent className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="min-w-0">
          <p className="text-white font-semibold">{lead.business_name || lead.full_name}</p>
          <p className="text-sm text-gray-400 mt-1">{lead.full_name} • {lead.email}</p>
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{lead.message || 'Won lead ready to move into onboarding.'}</p>
        </div>
        <Button
          onClick={() => onConvert(lead)}
          disabled={disabled}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white disabled:opacity-50"
        >
          Convert to Onboarding
        </Button>
      </CardContent>
    </Card>
  );
}