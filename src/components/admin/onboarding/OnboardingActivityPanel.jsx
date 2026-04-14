import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function OnboardingActivityPanel({ title, items, emptyText }) {
  return (
    <Card className="bg-[#12121a] border-white/5">
      <CardContent className="p-6 space-y-4">
        <h3 className="text-white font-semibold">{title}</h3>
        {items.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-6 text-sm text-gray-400">{emptyText}</div>
        ) : items.map((item, index) => (
          <div key={`${item.title}-${index}`} className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-white font-medium">{item.title}</p>
                <p className="text-sm text-gray-400 mt-1">{item.description}</p>
              </div>
              {item.meta && <span className="text-xs text-cyan-400 whitespace-nowrap">{item.meta}</span>}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}