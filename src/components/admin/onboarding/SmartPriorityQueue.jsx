import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SmartPriorityQueue({ items }) {
  return (
    <Card className="bg-[#12121a] border-white/5">
      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="text-white font-semibold">Smart Priority Queue</h3>
          <p className="text-sm text-gray-400 mt-1">Overdue tasks currently putting the nearest go-live path at risk.</p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-6 text-sm text-gray-400">No high-priority go-live blockers right now.</div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-4">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-white font-medium">{item.client_name}</p>
                      <Badge className="bg-red-500/10 text-red-300 border-red-500/20">{item.days_overdue}d overdue</Badge>
                      <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">Urgency {item.client_urgency}</Badge>
                    </div>
                    <p className="text-sm text-white/90">{item.task_name}</p>
                    <p className="text-sm text-gray-400">{item.task_phase} • {item.assigned_owner}</p>
                  </div>
                  <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/20">Go-live blocker</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}