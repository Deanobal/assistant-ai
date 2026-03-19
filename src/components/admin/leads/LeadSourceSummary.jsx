import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function LeadSourceSummary({ sources }) {
  return (
    <Card className="bg-[#12121a] border-white/5">
      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="text-white font-semibold text-lg">Leads by Source Page</h3>
          <p className="text-sm text-gray-400 mt-1">See where your enquiries are coming from so you can improve the right pages first.</p>
        </div>

        <div className="space-y-3">
          {sources.map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 flex items-center justify-between gap-4">
              <p className="text-gray-300 break-all">{item.label}</p>
              <p className="text-white font-semibold tabular-nums">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}