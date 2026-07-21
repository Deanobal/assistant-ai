import { CheckCircle2, Play } from 'lucide-react';
import HeroBrainCard from './HeroBrainCard';
import VapiReceptionistDemoButton from '@/components/voice/VapiReceptionistDemoButton';

const reassuranceItems = [
  'Keep your existing number',
  'Australian-based support',
  'No lock-in contracts',
];

export default function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden border-b border-white/[0.06] bg-[#060a12]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(43,94,255,0.18),transparent_32%),radial-gradient(circle_at_18%_20%,rgba(18,73,170,0.12),transparent_28%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,10,18,0.36)_0%,#060a12_82%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
      </div>

      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-[88rem] items-center gap-12 px-5 py-14 sm:px-8 sm:py-16 lg:px-10 lg:py-20 xl:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.88fr)] xl:gap-20">
        <div className="max-w-[46rem]">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7096ff] sm:text-[0.95rem]">
            AI receptionists built for Australian businesses
          </p>

          <h1 className="mt-7 text-[3.05rem] font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:text-[4.2rem] lg:text-[4.7rem]">
            <span className="block">Never Miss a Call.</span>
            <span className="mt-2 block bg-gradient-to-r from-[#4566ff] via-[#527cff] to-[#6ba8ff] bg-clip-text text-transparent">
              Book More Jobs.
            </span>
          </h1>

          <p className="mt-7 max-w-[39rem] text-lg leading-8 text-slate-300 sm:text-xl sm:leading-9">
            AssistantAI answers every call in a natural Australian voice, qualifies leads and books jobs directly into your calendar — 24/7.
          </p>

          <div className="mt-9 flex max-w-[39rem] flex-col gap-3 sm:flex-row sm:items-stretch">
            <VapiReceptionistDemoButton
              variant="hero"
              className="w-full sm:w-auto sm:min-w-[19rem]"
            />

            <a
              href="#how-it-works"
              className="inline-flex min-h-[3.75rem] w-full items-center justify-center gap-3 rounded-[14px] border border-white/30 bg-white/[0.025] px-7 py-4 text-lg font-semibold text-white transition duration-200 hover:border-white/50 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060a12] sm:w-auto sm:min-w-[16.5rem]"
            >
              <Play className="h-5 w-5 fill-none" aria-hidden="true" />
              <span>See How It Works</span>
            </a>
          </div>

          <div className="mt-6 flex max-w-[46rem] flex-wrap items-center gap-x-3 gap-y-3 text-sm font-medium text-slate-300 sm:text-[0.95rem]">
            {reassuranceItems.map((item, index) => (
              <div key={item} className="flex items-center gap-3">
                {index > 0 && <span className="hidden text-slate-600 sm:inline" aria-hidden="true">•</span>}
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[#5276ff]" aria-hidden="true" />
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-[34rem] xl:mx-0 xl:justify-self-end">
          <HeroBrainCard />
        </div>
      </div>
    </section>
  );
}
