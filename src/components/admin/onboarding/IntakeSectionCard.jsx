import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function IntakeSectionCard({ title, description, children }) {
  return (
    <Card className="bg-[#12121a] border-white/5">
      <CardContent className="p-6 space-y-5">
        <div>
          <h3 className="text-white font-semibold">{title}</h3>
          <p className="text-sm text-gray-400 mt-1">{description}</p>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}