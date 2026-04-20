import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import HeroDemoCard from './HeroDemoCard';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-6">
      <div className="absolute inset-0 z-0">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b3622e4aaa6acc06c2547f/6bac2678b_FuturisticglowingAIwithdigitalelements.png"
          alt="AssistantAI background"
          className="h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_24%,rgba(34,211,238,0.14),transparent_28%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#06080d] via-[#070a12]/96 to-[#06080d]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-10 md:px-8 md:py-14 lg:min-h-[calc(100vh-4.5rem)] lg:flex lg:items-center">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.92fr)] lg:gap-16">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span className="text-sm font-medium text-cyan-300">Live receptionist demo</span>
            </div>

            <h1 className="text-balance text-4xl font-bold leading-[0.98] tracking-tight text-white sm:text-5xl lg:text-[4.4rem]">
              Never miss another call again.
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300 md:text-xl">
              See how your calls are handled with a live AI receptionist.
            </p>

            <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-400 md:text-lg">
              This isn’t a chatbot. This is how your business sounds on every call.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/BookStrategyCall"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-7 py-4 font-semibold text-white transition-all hover:shadow-lg hover:shadow-cyan-500/25 sm:w-auto"
              >
                Call the receptionist
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/AIDemo"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-7 py-4 font-semibold text-white transition-all hover:border-white/30 hover:bg-white/[0.08] sm:w-auto"
              >
                <Play className="h-5 w-5 text-cyan-300" />
                Try live demo
              </Link>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <HeroDemoCard />
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/6 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-5 text-center md:px-8">
          <p className="text-sm font-medium tracking-[0.08em] text-slate-200 sm:text-base">
            Every call answered. Every lead captured. No missed opportunities.
          </p>
        </div>
      </div>
    </section>
  );
}