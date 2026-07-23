import { BrainCircuit, CheckCircle2, PhoneCall } from 'lucide-react';

export default function HeroBrainCard() {
  return (
    <div className="relative w-full max-w-[520px] rounded-[24px] border border-white/12 bg-white/[0.03] p-2.5 shadow-[0_24px_90px_rgba(6,182,212,0.16)] backdrop-blur-xl sm:rounded-[28px] sm:p-3">
      <div className="absolute -inset-6 -z-10 rounded-full bg-cyan-400/10 blur-3xl sm:-inset-10" />
      <div className="relative aspect-[1.08/1] overflow-hidden rounded-[20px] border border-white/20 bg-[#080c14] sm:aspect-[1.18/1] sm:rounded-[22px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_35%,rgba(34,211,238,0.24),transparent_34%),radial-gradient(circle_at_36%_62%,rgba(59,130,246,0.2),transparent_38%),linear-gradient(145deg,#09111d_0%,#05070c_70%)]" />
        <div className="absolute left-[12%] top-[14%] h-[62%] w-[70%] rounded-full border border-cyan-300/15 shadow-[0_0_80px_rgba(34,211,238,0.15)]" />
        <div className="absolute left-[20%] top-[22%] flex h-[46%] w-[54%] items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/[0.06] backdrop-blur-sm">
          <BrainCircuit className="h-24 w-24 text-cyan-200 drop-shadow-[0_0_24px_rgba(34,211,238,0.6)] sm:h-32 sm:w-32" aria-hidden="true" />
        </div>
        <div className="absolute right-[10%] top-[15%] flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-200 backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-emerald-400" /> Live call
        </div>
        <div className="absolute bottom-[29%] left-[8%] flex items-center gap-2 rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-xs text-cyan-100 backdrop-blur-md">
          <PhoneCall className="h-4 w-4 text-cyan-300" aria-hidden="true" /> Answered in under 2 seconds
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#06080d]/95 via-transparent to-transparent" />
        <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/10 bg-[#080c14]/88 p-3 backdrop-blur-md sm:inset-x-4 sm:bottom-4 sm:p-4">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-300 sm:text-base"><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Workflow complete</p>
          <p className="mt-1 text-sm font-medium leading-5 text-white sm:text-base sm:leading-6">Call answered → lead qualified → payment secured</p>
        </div>
      </div>
    </div>
  );
}
