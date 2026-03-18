import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function KpiCards({ kpis, stageRates }) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((item) => (
          <Card key={item.label} className="bg-[#12121a] border-white/5 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
            <CardContent className="p-6 space-y-3">
              <p className="text-sm text-gray-400">{item.label}</p>
              <p className="text-3xl font-bold text-white tracking-tight">{item.value}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{item.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-4 grid md:grid-cols-3 gap-3">
          {stageRates.map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500">{item.label}</p>
              <p className="text-xl font-semibold text-white mt-1">{item.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}