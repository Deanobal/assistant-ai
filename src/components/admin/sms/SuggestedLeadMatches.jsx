import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function SuggestedLeadMatches({ suggestions, selectedLeadId, onSelect }) {
  if (suggestions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-4 text-sm text-gray-400">
        No strong match suggestions yet. Search all leads below.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {suggestions.map(({ lead, score, reasons }) => {
        const isSelected = selectedLeadId === lead.id;
        return (
          <div key={lead.id} className={`rounded-2xl border px-4 py-4 ${isSelected ? 'border-cyan-500/30 bg-cyan-500/10' : 'border-white/5 bg-white/[0.03]'}`}>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-white">{lead.business_name || lead.full_name || 'Unnamed lead'}</p>
                  <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20">score {score}</Badge>
                  <Badge className="bg-white/5 text-gray-300 border-white/10">advisory only</Badge>
                </div>
                <p className="text-xs text-gray-400">{lead.full_name || 'No contact name'}{lead.email ? ` • ${lead.email}` : ''}{lead.mobile_number ? ` • ${lead.mobile_number}` : ''}</p>
                <div className="flex flex-wrap gap-2">
                  {reasons.map((reason) => (
                    <Badge key={reason} className="bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20">{reason}</Badge>
                  ))}
                </div>
              </div>
              <Button type="button" variant={isSelected ? 'secondary' : 'outline'} onClick={() => onSelect(lead.id)} className="border-white/10 text-white hover:bg-white/5">
                {isSelected ? 'Selected' : 'Use this lead'}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}