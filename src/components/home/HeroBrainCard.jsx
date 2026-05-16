export default function HeroBrainCard() {
  return (
    <div className="relative w-full max-w-[520px] rounded-[28px] border border-white/12 bg-white/[0.03] p-3 shadow-[0_24px_90px_rgba(6,182,212,0.16)] backdrop-blur-xl">
      <div className="absolute -inset-10 -z-10 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="relative overflow-hidden rounded-[22px] border border-white/20 bg-[#080c14]">
        <img
          src="https://media.base44.com/images/public/69b3622e4aaa6acc06c2547f/13f816ce8_9541496d0_generated_bc3bb2a9.png"
          alt="Glowing AI brain illustration"
          className="aspect-[1.18/1] w-full object-cover object-center" />
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#06080d]/92 via-transparent to-transparent" />
        <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/10 bg-[#080c14]/88 p-4 backdrop-blur-md">
          <p className="font-bold uppercase tracking-[0.22em] text-cyan-300 text-lg">WORKFLOW</p>
          <p className="mt-1 font-medium leading-6 text-white text-base">Call answered → lead qualified → payment secured

          </p>
        </div>
      </div>
    </div>);

}