import { CalendarCheck2, CheckCircle2, PhoneCall, UserRoundCheck } from 'lucide-react';

const bars = [28, 46, 64, 38, 72, 52, 82, 42, 68, 34, 58, 76, 44, 62, 32, 54, 70, 40, 60, 30, 48, 66, 36, 56];

const completedActions = [
  { icon: UserRoundCheck, label: 'Contact details captured' },
  { icon: CheckCircle2, label: 'Lead qualified' },
  { icon: CalendarCheck2, label: 'Booking confirmed', detail: 'Today, 2:00 PM' },
];

export default function HeroBrainCard() {
  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-blue-500/15 blur-3xl" />

      <div className="overflow-hidden rounded-[24px] border border-blue-300/20 bg-[#080d17]/95 shadow-[0_28px_100px_rgba(19,70,220,0.24)] backdrop-blur-xl">
        <div className="border-b border-white/[0.08] px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10">
                <PhoneCall className="h-5 w-5 text-blue-300" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-base font-semibold text-white">Live call</p>
                <p className="mt-0.5 truncate text-sm text-slate-400">New service enquiry</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.8)]" />
              <span>02:37</span>
            </div>
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6 sm:py-6">
          <div className="rounded-2xl border border-blue-300/10 bg-[#0b1220] px-4 py-5">
            <div className="flex h-20 items-center justify-center gap-[5px]" aria-hidden="true">
              {bars.map((height, index) => (
                <span
                  key={`${height}-${index}`}
                  className="w-[4px] rounded-full bg-gradient-to-t from-[#3458ff] to-[#65b2ff] opacity-90 motion-safe:animate-pulse"
                  style={{ height: `${height}%`, animationDelay: `${index * 55}ms`, animationDuration: '1.7s' }}
                />
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-blue-200">AssistantAI</p>
                <span className="text-sm text-slate-500">02:37 PM</span>
              </div>
              <p className="mt-2 text-[0.95rem] leading-6 text-slate-200">Hi, how can I help you today?</p>
            </div>

            <div className="ml-5 rounded-2xl border border-white/[0.08] bg-[#111826] p-4 sm:ml-9">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">Caller</p>
                <span className="text-sm text-slate-500">02:37 PM</span>
              </div>
              <p className="mt-2 text-[0.95rem] leading-6 text-slate-300">I need a plumber for a leaking tap.</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-blue-300/15 bg-blue-500/[0.055] p-4 sm:p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.1em] text-blue-200">AI action taken</p>
            <div className="mt-4 space-y-3.5">
              {completedActions.map((action) => (
                <div key={action.label} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-400/10">
                    <action.icon className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[0.95rem] font-medium leading-6 text-white">{action.label}</p>
                    {action.detail && <p className="text-sm leading-5 text-slate-400">{action.detail}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
