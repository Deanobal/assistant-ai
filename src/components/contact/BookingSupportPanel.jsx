import { Mail, Phone, Clock3, CalendarDays } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function BookingSupportPanel({ bookingUrl, bookingMode = 'request', bookingProvider = 'Live Calendar', heading = 'What Happens Next?', intro = '', responseText = '', adminWarning = '' }) {
  const hasLiveBooking = bookingMode === 'calendar' || (bookingMode !== 'request' && !!bookingUrl);
  const steps = hasLiveBooking
    ? [
        'Complete the short form so AssistantAI stores the lead details correctly.',
        bookingMode === 'embed'
          ? 'Choose an available strategy call time.'
          : bookingMode === 'calendar'
            ? 'Choose an available strategy call time.'
            : `Continue to ${bookingProvider} to choose an available time.`,
        'We’ll confirm the details and prepare for your strategy call.',
      ]
    : [
        'We review your enquiry and business needs.',
        'We confirm the right next step for your strategy call.',
        'We reply with timing, recommendations, or booking options.',
      ];

  return (
    <div className="space-y-6">
      <Card className="rounded-[16px] border-[#2a394f] bg-[#07121f]">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-white font-semibold text-lg">{heading}</h3>
          {intro && <p className="text-gray-400 leading-relaxed">{intro}</p>}
          <ol className="space-y-4">
            {steps.map((step, index) => (
              <li key={step} className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1768ec] text-xs font-bold text-white">
                  {index + 1}
                </div>
                <p className="text-gray-300 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {hasLiveBooking ? (
        <Card className="rounded-[16px] border-[#29405f] bg-[#081727]">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Choose a Suitable Time</h3>
                <p className="text-sm text-gray-400">{bookingMode === 'embed' ? `You can choose a time after the form step.` : bookingMode === 'calendar' ? 'Available strategy call times are shown on this page.' : `After submitting the short form, continue to ${bookingProvider} to choose a time.`}</p>
              </div>
            </div>
            <div className="rounded-[11px] border border-[#26364d] bg-[#081522] px-4 py-3 text-sm text-gray-300">
              Monday to Friday, 9:00am–5:00pm Melbourne time.
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-[16px] border-[#2a394f] bg-[#07121f]">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Strategy Call Request</h3>
                <p className="text-sm text-gray-400">Submit the form and our team will arrange the next step for your strategy call.</p>
              </div>
            </div>
            <div className="rounded-[11px] border border-[#26364d] bg-[#081522] px-4 py-3 text-sm text-gray-300">
              Submit your details and we’ll contact you to confirm the best time.
            </div>

          </CardContent>
        </Card>
      )}

      <Card className="rounded-[16px] border-[#2a394f] bg-[#07121f]">
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
