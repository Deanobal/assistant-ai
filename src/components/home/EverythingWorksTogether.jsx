import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Database, CalendarDays, MessageSquare, BarChart3, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Database,
    title: 'CRM Sync',
    desc: 'Send caller details, lead notes, and call outcomes straight into your CRM so your team always has the latest information.',
  },
  {
    icon: CalendarDays,
    title: 'Calendar Booking',
    desc: 'Check availability, book appointments, and keep your Google or Outlook calendar updated automatically after every conversation.',
  },
  {
    icon: MessageSquare,
    title: 'SMS Automation',
    desc: 'Trigger missed-call text back, confirmations, reminders, and follow-up messages without manual admin from your team.',
  },
  {
    icon: BarChart3,
    title: 'AI Call Insights',
    desc: 'Review summaries, sentiment, outcomes, and follow-up status so you can see what happened on every call and what to do next.',
  },
];

export default function EverythingWorksTogether() {
  return (
    <section className="relative py-24 md:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-cyan-400 text-sm font-medium mb-3">PRODUCT DEPTH</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Everything Works Together</h2>
          <p className="mt-4 text-gray-400 max-w-3xl mx-auto">
            AssistantAI.com.au does more than answer calls. It connects into your business workflow and automates what happens after the conversation too.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="p-6 rounded-2xl border border-white/5 bg-[#12121a] card-hover"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/Integrations"
            className="inline-flex items-center gap-2 text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors"
          >
            Explore Integrations <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}