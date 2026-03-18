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
          className="w-full h-full object-cover opacity-30" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_35%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0a0a0f]/95 to-[#0a0a0f]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-16 md:px-8 md:pt-28 md:pb-20">
        <div className="grid lg:grid-cols-[1fr_0.95fr] gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl">

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="text-cyan-400 text-lg font-medium">Premium AI automation for Australian businesses</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.02] tracking-tight mb-6">
              Never Miss a Call. Never Lose a Lead.
            </h1>

            <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl">Assistant AI helps Australian businesses answer every call, capture more leads, and automate follow-up without hiring more staff.

            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/Contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all">

                Book Free Strategy Call
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/AIDemo"
                className="bg-white/[0.02] text-white mx-3 px-8 py-4 font-semibold rounded-full inline-flex items-center justify-center gap-2 border border-white/20 hover:bg-white/[0.05] hover:border-white/30 transition-all">
                <Play className="w-5 h-5 text-cyan-300" />
                Watch AI Demo
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="hidden lg:block">

            <div className="relative max-w-[540px] ml-auto">
              <div className="absolute -inset-6 bg-cyan-500/6 blur-3xl rounded-full" />
              <div className="relative rounded-[32px] border border-white/8 bg-[#11111a]/75 backdrop-blur-xl p-3.5 shadow-2xl shadow-cyan-500/5">
                <div className="rounded-[24px] overflow-hidden border border-white/4 bg-[#0c0c14]">
                  <img
                    src={heroImage}
                    alt="AssistantAI.com.au platform preview"
                    className="w-full h-[560px] object-cover" />

                </div>
                


                
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>);

}