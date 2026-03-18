import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const statusClasses = {
  Connected: 'bg-green-500/10 text-green-400 border-green-500/20',
  'Not Connected': 'bg-white/5 text-gray-300 border-white/10',
  'Needs Attention': 'bg-amber-500/10 text-amber-300 border-amber-500/20',
};

export default function IntegrationCard({ item, features }) {
  return (
    <Card className="bg-[#12121a] border-white/5 h-full shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-blue-500/15 border border-cyan-500/15 flex items-center justify-center text-sm font-semibold text-cyan-300 shrink-0">
              {item.appCode}
            </div>
            <div className="min-w-0">
              <h4 className="text-lg font-semibold text-white truncate">{item.appName}</h4>
              <p className="text-sm text-gray-500">{item.syncState}</p>
            </div>
          </div>
          <Badge className={statusClasses[item.status]}>{item.status}</Badge>
        </div>

        <p className="text-sm leading-relaxed text-gray-400">{item.description}</p>

        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 space-y-3">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-gray-500">Connection Status</span>
            <span className="text-white">{item.status}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-gray-500">Last Sync</span>
            <span className="text-white">{item.lastSync}</span>
          </div>
        </div>

        <div className="space-y-2">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-sm text-gray-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Button className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25">
            {item.primaryAction}
          </Button>
          {item.secondaryAction && (
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
              {item.secondaryAction}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}