import { Badge } from '@/components/ui/badge';
import { Mic, PhoneCall } from 'lucide-react';

export default function HeroDemoCard() {
  return (
    <div id="hero-ai-demo" className="relative w-full max-w-[500px] scroll-mt-28">
      <div className="absolute inset-0 rounded-[32px] bg-cyan-500/10 blur-3xl" />
      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0f18]/90 p-4 shadow-[0_24px_90px_rgba(6,182,212,0.14)] backdrop-blur-xl sm:p-6">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

        <div className="flex items-center justify-between gap-3">
          <Badge className="border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-cyan-200 hover:bg-cyan-400/10">
            Live Demo
          </Badge>
          <div className="flex items-center gap-2 text-xs text-cyan-100/80">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            Voice interaction
          </div>
        </div>

        <div className="mt-5 rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,24,39,0.98),rgba(8,12,20,0.96))] p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-300/80">Try the receptionist now</p>
              <h3 className="mt-2 text-lg font-semibold text-white sm:text-xl">Talk to the AI receptionist</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Ask how it handles bookings, lead capture, or missed calls.
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
              <Mic className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/8 bg-black/20 p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
              <PhoneCall className="h-3.5 w-3.5 text-cyan-300" />
              Live receptionist experience
            </div>

            <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[#060910] px-2 py-3 sm:px-4 sm:py-4">
              <div className="flex min-h-[300px] items-center justify-center overflow-hidden sm:min-h-[360px] [&_elevenlabs-convai]:w-full [&_elevenlabs-convai]:max-w-none">
                <elevenlabs-convai agent-id="agent_5301kpkzdmade089yktcm780dz3s"></elevenlabs-convai>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-400">
            <Mic className="h-3.5 w-3.5 text-cyan-300" />
            Speak naturally to hear how enquiries can be handled before your team steps in.
          </div>
        </div>
      </div>
    </div>
  );
}