export default function HeroBrainCard() {
  return (
    <div className="relative w-full max-w-[520px] rounded-[24px] border border-white/12 bg-white/[0.03] p-2.5 shadow-[0_24px_90px_rgba(6,182,212,0.16)] backdrop-blur-xl sm:rounded-[28px] sm:p-3">
      <div className="absolute -inset-6 -z-10 rounded-full bg-cyan-400/10 blur-3xl sm:-inset-10" />
      <div className="relative overflow-hidden rounded-[20px] border border-white/20 bg-[#080c14] sm:rounded-[22px]">
        <img
          src="https://media.base44.com/images/public/69b3622e4aaa6acc06c2547f/13f816ce8_9541496d0_generated_bc3bb2a9.png"
          alt="Glowing AI brain illustration"
          className="aspect-[1.08/1] w-full object-cover object-center sm:aspect-[1.18/1]"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#06080d]/92 via-transparent to-transparent" />
        <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/10 bg-[#080c14]/88 p-3 backdrop-blur-md sm:inset-x-4 sm:bottom-4 sm:p-4">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300 sm:text-lg">WORKFLOW</p>
          <p className="mt-1 text-sm font-medium leading-5 text-white sm:text-base sm:leading-6">Call answered → lead qualified → payment secured</p>
        </div>
      </div>
    </div>
  );
}
