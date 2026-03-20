import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';

export default function BookingEmbedCard({ embedUrl, title = 'Live Booking Widget' }) {
  return (
    <Card className="mt-6 bg-[#0f1016] border-cyan-500/20 overflow-hidden">
      <CardContent className="p-0">
        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <h4 className="text-white font-semibold">{title}</h4>
            <p className="text-sm text-gray-400">Choose an available time in the live external calendar below.</p>
          </div>
        </div>
        <iframe
          src={embedUrl}
          title={title}
          className="w-full min-h-[760px] bg-[#0a0a0f]"
        />
      </CardContent>
    </Card>
  );
}