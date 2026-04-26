import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import HeroDemoCard from './HeroDemoCard';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-4">
      <div className="absolute inset-0 z-0">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b3622e4aaa6acc06c2547f/6bac2678b_FuturisticglowingAIwithdigitalelements.png"
          alt="AssistantAI background"
          className="h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_24%,rgba(34,211,238,0.14),transparent_28%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#06080d] via-[#070a12]/96 to-[#06080d]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-12 md:px-8 md:py-16 lg:min-h-[calc(100vh-5.5rem)] lg:flex lg:items-center">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.95fr)] lg:gap-14">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span className="text-sm font-medium text-cyan-300">AI receptionist for service businesses</span>
            </div>

            <h1 className="max-w-3xl text-4xl font-bold leading-[0.96] tracking-[-0.04em] text-white sm:text-5xl lg:text-[4.6rem]">
              Never Miss A Lead Again
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 md:text-xl">
              AssistantAI gives your business an AI receptionist that answers instantly, qualifies leads, books calls, and keeps follow-up moving 24/7.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/AIDemo"
                className="inline-flex min-h-[3.5rem] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-4 text-center text-base font-semibold text-white transition-all hover:shadow-lg hover:shadow-cyan-500/25 sm:w-auto sm:min-w-[15.5rem]"
              >
                <Play className="h-4.5 w-4.5" />
                <span>Try The AI Receptionist</span>
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex min-h-[3.5rem] w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-4 text-center text-base font-semibold text-white transition-all hover:border-white/30 hover:bg-white/[0.08] sm:w-auto sm:min-w-[14rem]"
              >
                <span>See How It Works</span>
                <ArrowRight className="h-4.5 w-4.5 text-cyan-300" />
              </a>
            </div>

            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-400 md:text-base">
              Built for service businesses that want faster response times, fewer missed enquiries, and less admin.
            </p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <HeroDemoCard />
          </div>
        </div>
      </div>
    </section>
  );
}