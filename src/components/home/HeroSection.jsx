import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Database, CalendarDays, MessageSquare, PhoneCall } from 'lucide-react';

const trustItems = [
  { icon: Database, label: 'CRM Sync' },
  { icon: CalendarDays, label: 'Google / Outlook Calendar' },
  { icon: MessageSquare, label: 'SMS Follow-Up' },
  { icon: PhoneCall, label: '24/7 Call Handling' },
];

export default function HeroSection({ heroImage }) {
  return (
    <section className="relative overflow-hidden pt-6">
      <div className="absolute inset-0 z-0">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b3622e4aaa6acc06c2547f/6bac2678b_FuturisticglowingAIwithdigitalelements.png"
          alt="AI Background"
          className="w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_35%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0a0a0f]/95 to-[#0a0a0f]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-20 md:pt-28 md:pb-24">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="text-cyan-400 text-xs font-medium">Premium AI automation for Australian businesses</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.02] tracking-tight mb-6">
              Never Miss a Call. Never Lose a Lead.
            </h1>

            <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl">
              AssistantAI.com.au helps Australian businesses answer every call, capture more leads, and automate follow-up without hiring more staff.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link
                to="/Contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
              >
                Book Free Strategy Call
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/Dashboard"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/15 text-white font-semibold rounded-full hover:bg-white/5 transition-all"
              >
                <Play className="w-5 h-5" />
                Watch AI Demo
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {trustItems.map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-sm text-white/90">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="hidden lg:block"
          >
            <div className="relative max-w-[520px] ml-auto">
              <div className="absolute -inset-8 bg-cyan-500/10 blur-3xl rounded-full" />
              <div className="relative rounded-[32px] border border-white/10 bg-[#11111a]/80 backdrop-blur-xl p-4 shadow-2xl shadow-cyan-500/10">
                <div className="rounded-[24px] overflow-hidden border border-white/5 bg-[#0c0c14]">
                  <img
                    src={heroImage}
                    alt="AssistantAI.com.au platform preview"
                    className="w-full h-[560px] object-cover"
                  />
                </div>
                <div className="absolute top-8 left-8 px-4 py-3 rounded-2xl border border-white/10 bg-[#0a0a0f]/85 backdrop-blur-md">
                  <p className="text-xs text-gray-400 mb-1">AI workflow</p>
                  <p className="text-sm font-medium text-white">Call captured → CRM updated → Follow-up sent</p>
                </div>
                <div className="absolute bottom-8 right-8 px-4 py-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 backdrop-blur-md">
                  <p className="text-xs text-cyan-300 mb-1">Designed for</p>
                  <p className="text-sm font-medium text-white">Lead capture, booking, and automation</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}