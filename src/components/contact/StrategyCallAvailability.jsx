import { useEffect, useState } from 'react';
import { Loader2, CalendarClock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function buildInternalStrategySlots() {
  const slots = [];
  const now = new Date();
  const slotHours = [10, 13, 15];

  for (let dayOffset = 1; slots.length < 9 && dayOffset <= 14; dayOffset += 1) {
    const date = new Date(now);
    date.setDate(now.getDate() + dayOffset);

    const day = date.getDay();
    if (day === 0 || day === 6) continue;

    slotHours.forEach((hour) => {
      if (slots.length >= 9) return;
      const start = new Date(date);
      start.setHours(hour, 0, 0, 0);
      const end = new Date(start);
      end.setMinutes(start.getMinutes() + 60);
      slots.push({ start: start.toISOString(), end: end.toISOString(), source: 'internal_request_only' });
    });
  }

  return slots;
}

export default function StrategyCallAvailability({ selectedSlot, onSelectSlot, onAvailabilityStateChange }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState({ slots: [], working_hours: 'Monday to Friday, 9:00am–5:00pm Melbourne time', timezone: 'Australia/Melbourne', provider: 'AssistantAI internal booking request' });

  useEffect(() => {
    const loadAvailability = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('/api/calendar-availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ daysAhead: 10, slotMinutes: 60 })
        });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.details || data.error || 'No live calendar slots returned');
        const slots = data.slots || [];
        if (!slots.length) throw new Error('No live calendar slots returned');
        setAvailability({ ...data, slots, working_hours: 'Monday to Friday, 9:00am–5:00pm Melbourne time', timezone: 'Australia/Melbourne', provider: data.provider || 'Google Calendar' });
        onAvailabilityStateChange?.({ isLive: true, hasSlots: true, error: '', provider: data.provider || 'Google Calendar' });
      } catch (loadError) {
        const slots = buildInternalStrategySlots();
        setAvailability({
          slots,
          working_hours: 'Monday to Friday, 9:00am–5:00pm Melbourne time',
          timezone: 'Australia/Melbourne',
          provider: 'AssistantAI booking request mode',
        });
        setError('Live Google Calendar availability could not be loaded. You can still request a preferred time and our team will confirm it.');
        onAvailabilityStateChange?.({ isLive: false, hasSlots: slots.length > 0, error: loadError.message || 'Live calendar unavailable', provider: 'AssistantAI booking request mode' });
      } finally {
        setLoading(false);
      }
    };

    loadAvailability();
  }, [onAvailabilityStateChange]);

  return (
    <Card className="mb-6 rounded-[14px] border-[#26364d] bg-[#081522]">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
            <CalendarClock className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">Strategy Call Availability</h3>
            <p className="text-sm text-gray-400 mt-1">Choose a 60-minute strategy call slot. Times are shown in Melbourne time.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 rounded-[11px] border border-[#26364d] bg-[#07121f] px-4 py-6 text-gray-300">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading available slots…
          </div>
        ) : error ? (
          <>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-sm text-amber-200">
              {error}
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {availability.slots.map((slot) => {
                const isSelected = selectedSlot?.start === slot.start;
                return (
                  <Button
                    key={slot.start}
                    type="button"
                    variant="outline"
                    onClick={() => onSelectSlot(slot)}
                    className={`h-auto justify-start border-[#31435e] bg-transparent px-4 py-3 text-left text-white hover:bg-[#0a1725] ${isSelected ? 'border-[#347cff] bg-[#0b203c] text-[#dbe7ff]' : ''}`}
                  >
                    <div>
                      <div className="font-medium">{new Date(slot.start).toLocaleDateString('en-AU', { timeZone: 'Australia/Melbourne', weekday: 'short', day: 'numeric', month: 'short' })}</div>
                      <div className="text-sm text-gray-400">{new Date(slot.start).toLocaleTimeString('en-AU', { timeZone: 'Australia/Melbourne', hour: 'numeric', minute: '2-digit' })} – {new Date(slot.end).toLocaleTimeString('en-AU', { timeZone: 'Australia/Melbourne', hour: 'numeric', minute: '2-digit' })} Melbourne time</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </>
        ) : availability.slots?.length ? (
          <>
            <div className="rounded-[11px] border border-[#29405f] bg-[#081727] px-4 py-3 text-sm text-[#c7d8f4]">
              Provider: {availability.provider}. Confirmed bookings are added to the AssistantAI Google Calendar for sales@assistantai.com.au.
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {availability.slots.map((slot) => {
                const isSelected = selectedSlot?.start === slot.start;
                return (
                  <Button
                    key={slot.start}
                    type="button"
                    variant="outline"
                    onClick={() => onSelectSlot(slot)}
                    className={`h-auto justify-start border-[#31435e] bg-transparent px-4 py-3 text-left text-white hover:bg-[#0a1725] ${isSelected ? 'border-[#347cff] bg-[#0b203c] text-[#dbe7ff]' : ''}`}
                  >
                    <div>
                      <div className="font-medium">{new Date(slot.start).toLocaleDateString('en-AU', { timeZone: 'Australia/Melbourne', weekday: 'short', day: 'numeric', month: 'short' })}</div>
                      <div className="text-sm text-gray-400">{new Date(slot.start).toLocaleTimeString('en-AU', { timeZone: 'Australia/Melbourne', hour: 'numeric', minute: '2-digit' })} – {new Date(slot.end).toLocaleTimeString('en-AU', { timeZone: 'Australia/Melbourne', hour: 'numeric', minute: '2-digit' })} Melbourne time</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-gray-300">
            Submit your details and we’ll contact you to confirm the best time.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
