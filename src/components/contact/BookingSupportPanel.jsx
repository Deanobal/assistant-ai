import React from 'react';
import { Mail, Phone, Clock3, CalendarDays, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function BookingSupportPanel({ bookingUrl, bookingMode = 'request', bookingProvider = 'Live Calendar', heading = 'What Happens Next?', intro, responseText, adminWarning }) {
  const hasLiveBooking = bookingMode !== 'request' && !!bookingUrl;
  const steps = hasLiveBooking
    ? [
        'Complete the short form so AssistantAI stores the lead details correctly.',
        bookingMode === 'embed' ? 'Choose an available slot in the embedded booking widget.' : `Continue to ${bookingProvider} to choose an available slot.`,
        'Your meeting is only fully booked once the external calendar confirms it.',
      ]
    : [
        'We review your enquiry and business needs.',
        'We confirm the right next step for your strategy call.',
        'We reply with timing, recommendations, or booking options.',
      ];

  return (
    <div className="space-y-6">
      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-white font-semibold text-lg">{heading}</h3>
          {intro && <p className="text-gray-400 leading-relaxed">{intro}</p>}
          <ol className="space-y-4">
            {steps.map((step, index) => (
              <li key={step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0 text-xs font-bold text-white">
                  {index + 1}
                </div>
                <p className="text-gray-300 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {hasLiveBooking ? (
        <Card className="bg-gradient-to-b from-cyan-500/10 to-transparent border-cyan-500/20">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Live Booking Enabled</h3>
                <p className="text-sm text-gray-400">{bookingMode === 'embed' ? `A ${bookingProvider} widget is ready on this page after the form step.` : `After submitting the short form, continue to ${bookingProvider} to choose a time.`}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0f]/40 px-4 py-3 text-sm text-gray-300">
              {bookingMode === 'embed' ? `${bookingProvider} embed is configured for live slot selection.` : `${bookingProvider} booking link is configured for live slot selection.`}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-b from-white/[0.04] to-transparent border-white/10">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Request Flow Only</h3>
                <p className="text-sm text-gray-400">Submit the form and our team will arrange the next step for your strategy call.</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0f]/40 px-4 py-3 text-sm text-gray-300">
              No live booking URL or widget is connected yet, so public users see an honest request flow instead of fake scheduling.
            </div>
            {adminWarning && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                {adminWarning}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-white font-semibold">Contact Details</h3>
          <div className="flex items-start gap-3 text-gray-300 text-sm">
            <Mail className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <a href="mailto:sales@assistantai.com.au" className="hover:text-cyan-300 transition-colors">sales@assistantai.com.au</a>
          </div>
          <div className="flex items-start gap-3 text-gray-300 text-sm">
            <Phone className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>Phone support available by request during the strategy call process.</span>
          </div>
          <div className="flex items-start gap-3 text-gray-300 text-sm">
            <Clock3 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>{responseText}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}