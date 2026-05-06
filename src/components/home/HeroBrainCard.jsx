export default function HeroBrainCard() {
  return (
    <div className="relative w-full max-w-[380px] rounded-[28px] border border-white/12 bg-white/[0.03] p-3 shadow-[0_24px_90px_rgba(6,182,212,0.16)] backdrop-blur-xl">
      <div className="absolute -inset-10 -z-10 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="relative overflow-hidden rounded-[22px] border border-white/20 bg-[#080c14]">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b3622e4aaa6acc06c2547f/6bac2678b_FuturisticglowingAIwithdigitalelements.png"
          alt="Glowing AI brain illustration"
          className="aspect-[1.18/1] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06080d]/92 via-transparent to-transparent" />
        <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/10 bg-[#080c14]/88 p-4 backdrop-blur-md">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-cyan-300">Workflow</p>
          <p className="mt-1 text-sm font-medium leading-6 text-white">
            Call answered → lead captured → follow-up queued
          </p>
        </div>
      </div>
    </div>
  );
}