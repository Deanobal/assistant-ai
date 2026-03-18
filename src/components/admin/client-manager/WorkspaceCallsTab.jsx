import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function WorkspaceCallsTab({ client }) {
  return (
    <div className="grid gap-4">
      {client.recent_calls.map((call, index) => (
        <Card key={`${call.caller_name}-${index}`} className="bg-[#12121a] border-white/5">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <h3 className="text-white font-semibold">{call.caller_name}</h3>
                <p className="text-sm text-gray-500 mt-1">{call.timestamp}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">{call.outcome}</Badge>
                <Badge className="bg-white/5 text-gray-300 border-white/10">{call.sentiment}</Badge>
                <Badge className="bg-white/5 text-gray-300 border-white/10">Urgency: {call.urgency}</Badge>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed">{call.summary}</p>
            <div className="flex flex-wrap gap-3 text-sm text-gray-400">
              <span>Recording: Available</span>
              <span>Follow-Up Required: {call.follow_up_required ? 'Yes' : 'No'}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}