import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Loader2, CalendarClock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function StrategyCallAvailability({ selectedSlot, onSelectSlot, onAvailabilityStateChange }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState({ slots: [], working_hours: 'Mon-Fri 09:00-17:00 UTC', timezone: 'UTC' });

  useEffect(() => {
    const loadAvailability = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await base44.functions.invoke('getCalendarAvailability', {
          daysAhead: 10,
          slotMinutes: 60,
        });
        const data = response.data;
        setAvailability(data);
        onAvailabilityStateChange?.({ isLive: true, hasSlots: (data.slots || []).length > 0, error: '' });
      } catch (loadError) {
        setError('Live calendar availability is not ready right now, so this page will stay in request mode.');
        onAvailabilityStateChange?.({ isLive: false, hasSlots: false, error: loadError.message || 'Availability unavailable' });
      } finally {
        setLoading(false);
      }
    };

    loadAvailability();
  }, [onAvailabilityStateChange]);

  return (
    <Card className="mb-6 bg-[#0f1016] border-white/10">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
            <CalendarClock className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">Live Google Calendar Availability</h3>
            <p className="text-sm text-gray-400 mt-1">Current rule: 60-minute slots, {availability.working_hours}, based on real Google Calendar availability.</p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-6 flex items-center gap-3 text-gray-300">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading available slots…
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-sm text-amber-200">
            {error}
          </div>
        ) : availability.slots?.length ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {availability.slots.map((slot) => {
              const isSelected = selectedSlot?.start === slot.start;
              return (
                <Button
                  key={slot.start}
                  type="button"
                  variant="outline"
                  onClick={() => onSelectSlot(slot)}
                  className={`justify-start h-auto py-3 px-4 border-white/10 bg-transparent text-left text-white hover:bg-white/5 ${isSelected ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200' : ''}`}
                >
                  <div>
                    <div className="font-medium">{format(new Date(slot.start), 'EEE d MMM')}</div>
                    <div className="text-sm text-gray-400">{format(new Date(slot.start), 'HH:mm')} – {format(new Date(slot.end), 'HH:mm')} UTC</div>
                  </div>
                </Button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-gray-300">
            Google Calendar is connected, but there are no open 60-minute slots in the next 10 days.
          </div>
        )}
      </CardContent>
    </Card>
  );
}