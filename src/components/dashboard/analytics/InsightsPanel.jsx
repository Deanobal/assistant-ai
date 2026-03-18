import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function InsightsPanel({ insights }) {
  return (
    <Card className="bg-[#12121a] border-white/5">
      <CardHeader>
        <CardTitle className="text-white text-xl">Secondary Insights</CardTitle>
        <p className="text-sm text-gray-400 mt-2">A simple executive snapshot of what the recent call activity is showing.</p>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {insights.map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 space-y-2">
            <p className="text-sm text-gray-400">{item.label}</p>
            <p className="text-2xl font-semibold text-white leading-tight">{item.value}</p>
            <p className="text-sm text-gray-500 leading-relaxed">{item.helper}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}