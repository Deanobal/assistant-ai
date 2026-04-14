import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const fileSections = ['Scripts', 'FAQ docs', 'Pricing sheets', 'Call flows', 'Approval docs', 'Onboarding assets'];

export default function FilesTab() {
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      {fileSections.map((item) => (
        <Card key={item} className="bg-[#12121a] border-white/5">
          <CardContent className="p-6 space-y-2">
            <h3 className="text-white font-semibold">{item}</h3>
            <p className="text-sm text-gray-400">Ready for live file connections and uploads inside the onboarding workflow.</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}