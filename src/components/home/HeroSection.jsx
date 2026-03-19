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

      <div className="relative max-w-7xl mx-auto px-6 py-8 md:px-8 md:py-10 lg:min-h-[calc(100vh-4rem)] lg:flex lg:items-center">
        <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.8fr)] gap-10 lg:gap-14 items-center w-full">
...
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="order-first lg:order-none flex justify-center lg:justify-end">

            <div className="relative w-full max-w-[440px] lg:max-w-[460px]">
              <div className="absolute inset-0 scale-105 rounded-[32px] bg-cyan-500/8 blur-2xl" />
              <div className="relative rounded-[28px] border border-white/10 bg-[#11111a]/80 p-3 shadow-[0_24px_80px_rgba(8,145,178,0.12)] backdrop-blur-xl">
                <div className="overflow-hidden rounded-[22px] border border-white/6 bg-[#0c0c14]">
                  <img
                    src={heroImage}
                    alt="AssistantAI platform preview"
                    className="w-full h-[260px] sm:h-[320px] lg:h-[380px] object-cover object-center" />

                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>);

}