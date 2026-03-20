import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const statusStyles = {
  live: 'bg-green-500/10 text-green-400 border-green-500/20',
  partial: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  'not connected': 'bg-white/5 text-gray-300 border-white/10',
};

export default function SystemReadinessCard({ item }) {
  return (
    <Card className="bg-[#12121a] border-white/5 h-full">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-white font-semibold text-lg">{item.title}</h3>
            <p className="text-sm text-gray-500 mt-1">Last updated: {item.lastUpdated}</p>
          </div>
          <Badge className={statusStyles[item.status]}>{item.status}</Badge>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <p className="text-gray-500 mb-1">Key Dependencies</p>
            <ul className="space-y-1">
              {item.dependencies.map((dependency) => (
                <li key={dependency} className="text-gray-300">• {dependency}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-gray-500 mb-1">Notes</p>
            <p className="text-gray-300 leading-relaxed">{item.notes}</p>
          </div>

          <div>
            <p className="text-gray-500 mb-1">Next Required Action</p>
            <p className="text-cyan-300 leading-relaxed">{item.nextAction}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}