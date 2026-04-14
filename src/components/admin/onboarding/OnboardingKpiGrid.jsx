import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function OnboardingKpiGrid({ items }) {
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card key={item.label} className="bg-[#12121a] border-white/5">
          <CardContent className="p-5">
            <p className="text-sm text-gray-400">{item.label}</p>
            <p className="text-3xl font-semibold text-white mt-2">{item.value}</p>
            {item.helper && <p className="text-xs text-gray-500 mt-2">{item.helper}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}