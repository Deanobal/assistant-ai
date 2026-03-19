import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';

export default function HeroSection({ heroImage }) {
  return (
    <section className="relative overflow-hidden pt-6">
      <div className="absolute inset-0 z-0">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b3622e4aaa6acc06c2547f/6bac2678b_FuturisticglowingAIwithdigitalelements.png"
          alt="AI Background"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_35%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0a0a0f]/95 to-[#0a0a0f]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-10 md:px-8 md:py-12 lg:min-h-[calc(100vh-4rem)] lg:flex lg:items-center">
        <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.82fr)] gap-10 lg:gap-14 items-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 mb-5">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="text-cyan-400 text-sm md:text-base font-medium">Premium AI automation for Australian service businesses</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[4.25rem] font-bold leading-[0.98] tracking-tight mb-5 text-balance">
              Never Miss a Call.<br />
              Never Lose Another High-Value Lead.
            </h1>

            <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl text-pretty">
              AssistantAI helps Australian businesses answer calls instantly, capture qualified leads, book jobs, and automate follow-up — without hiring more admin staff.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/BookStrategyCall"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
              >
                Book Free Strategy Call
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/AIDemo"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/15 bg-white/[0.03] text-white font-semibold rounded-full hover:bg-white/[0.05] hover:border-white/30 transition-all"
              >
                <Play className="w-5 h-5 text-cyan-300" />
                Watch AI Demo
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-[440px] lg:max-w-[470px]">
              <div className="absolute inset-0 scale-105 rounded-[32px] bg-cyan-500/8 blur-2xl" />
              <div className="relative rounded-[28px] border border-white/10 bg-[#11111a]/80 p-3 shadow-[0_24px_80px_rgba(8,145,178,0.12)] backdrop-blur-xl">
                <div className="overflow-hidden rounded-[22px] border border-white/6 bg-[#0c0c14] relative">
                  <img
                    src={heroImage}
                    alt="AssistantAI platform preview"
                    className="w-full h-[180px] sm:h-[240px] lg:h-[400px] object-cover object-center"
                  />
                  <div className="absolute left-4 right-4 bottom-4 rounded-2xl border border-white/10 bg-[#0a0a0f]/70 backdrop-blur-xl px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-cyan-300 mb-1">Workflow</p>
                    <p className="text-sm text-white">Call answered → lead captured → follow-up queued</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}