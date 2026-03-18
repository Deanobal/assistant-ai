import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function ManagerStats({ stats }) {
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      {stats.map((item) => (
        <Card key={item.label} className="bg-[#12121a] border-white/5 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
          <CardContent className="p-5 space-y-2">
            <p className="text-sm text-gray-400">{item.label}</p>
            <p className="text-3xl font-semibold text-white tabular-nums">{item.value}</p>
            <p className="text-sm text-gray-500">{item.helper}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}