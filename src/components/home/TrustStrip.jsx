import { ClipboardCheck, CalendarDays, MessageSquare, PhoneCall } from 'lucide-react';

const items = [
  { icon: PhoneCall, label: '24/7 Call Handling' },
  { icon: MessageSquare, label: 'Live Qualification' },
  { icon: CalendarDays, label: 'Secure Signup' },
  { icon: ClipboardCheck, label: 'Setup Underway' },
];

export default function TrustStrip() {
  return (
    <section className="relative border-y border-white/5 bg-white/[0.02]">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4 md:px-8">
        <div className="mx-auto grid max-w-sm grid-cols-2 gap-2 sm:max-w-none sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-3 md:gap-4 lg:gap-5">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex min-h-[2.75rem] items-center justify-center gap-2 rounded-2xl border border-white/6 bg-white/[0.02] px-3 py-2 text-center sm:rounded-full sm:px-4 sm:py-2.5"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 sm:h-7 sm:w-7">
                <item.icon className="h-3.5 w-3.5 text-cyan-400" />
              </div>
              <span className="text-xs font-medium text-white/80 sm:text-sm md:text-base">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
