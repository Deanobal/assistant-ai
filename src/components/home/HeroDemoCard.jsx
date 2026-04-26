import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle2, Mic, PhoneCall } from 'lucide-react';

export default function HeroDemoCard() {
  return (
    <div id="homepage-demo" className="relative w-full max-w-[500px] scroll-mt-28">
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
              <h3 className="mt-2 text-lg font-semibold text-white sm:text-xl">See the AI receptionist in action</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Open the live demo to hear the conversation flow and see what happens after the enquiry is captured.
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
              <Mic className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/8 bg-black/20 p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
              <PhoneCall className="h-3.5 w-3.5 text-cyan-300" />
              Safe live demo path
            </div>

            <div className="rounded-[22px] border border-white/10 bg-[#060910] p-5 sm:p-6">
              <div className="grid gap-4">
                <div className="rounded-2xl border border-cyan-500/15 bg-cyan-500/5 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-cyan-300/80">Safe homepage preview</p>
                      <p className="mt-2 text-base font-semibold text-white">Prospect asks about missed calls and bookings</p>
                    </div>
                    <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
                      Ready now
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="max-w-[85%] rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm leading-relaxed text-gray-200">
                      Hi, can your AI receptionist answer enquiries after hours and still book the next step?
                    </div>
                    <div className="ml-auto max-w-[85%] rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm leading-relaxed text-white">
                      Yes — it can answer instantly, capture details, qualify urgency, and trigger the right follow-up without your team needing to step in first.
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 sm:p-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-white/8 bg-[#0b0f18] p-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Step 1</p>
                      <p className="mt-2 text-sm font-medium text-white">Call answered</p>
                    </div>
                    <div className="rounded-xl border border-white/8 bg-[#0b0f18] p-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Step 2</p>
                      <p className="mt-2 text-sm font-medium text-white">Lead qualified</p>
                    </div>
                    <div className="rounded-xl border border-white/8 bg-[#0b0f18] p-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Step 3</p>
                      <p className="mt-2 text-sm font-medium text-white">Follow-up triggered</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/5 px-3 py-3 text-sm text-slate-200">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    Stable homepage preview active — the live widget stays isolated so it cannot break this page.
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <Link
                      to="/AIDemo"
                      className="inline-flex min-h-[3rem] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-cyan-500/25"
                    >
                      Launch Live Demo
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      to="/BookStrategyCall"
                      className="inline-flex min-h-[3rem] items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-white/[0.05]"
                    >
                      Book A Strategy Call
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-400">
            <Mic className="h-3.5 w-3.5 text-cyan-300" />
            The homepage now uses a stable demo entry point so the widget cannot break the main landing experience.
          </div>
        </div>
      </div>
    </div>
  );
}