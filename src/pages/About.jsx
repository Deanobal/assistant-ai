import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Target, Eye, Zap, Shield, CheckCircle2 } from 'lucide-react';

const values = [
  { icon: Target, title: 'Results-Driven', desc: 'Every system is designed to support better lead handling, smoother workflows, and faster response times.' },
  { icon: Eye, title: 'Transparent', desc: 'Clear pricing, practical recommendations, and a simple explanation of how the automation works.' },
  { icon: Zap, title: 'Practical AI', desc: 'We focus on useful automations for calls, bookings, CRM updates, and follow-up instead of hype.' },
  { icon: Shield, title: 'Ongoing Support', desc: 'Launch is only the start. We keep refining the workflow with monitoring, optimisation, and support.' },
];

const reasons = [
  'Practical AI systems',
  'Fast setup',
  'Local business focus',
  'No hype',
  'Ongoing optimisation',
  'Real business outcomes',
];

export default function About() {
  return (
    <div>
      <section className="relative py-24 md:py-32 bg-grid">
        <div className="bg-radial-glow absolute inset-0" />
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <p className="text-cyan-400 text-sm font-medium mb-3">ABOUT US</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              AssistantAI.com.au Helps Businesses{' '}
              <span className="text-gradient">Work Smarter</span>
            </h1>
          </motion.div>

          <div className="max-w-3xl mx-auto mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-5 text-gray-400 leading-relaxed text-lg"
            >
              <p>
                AssistantAI.com.au was built to help Australian businesses stop losing leads to missed calls, slow response times, and disconnected admin workflows.
              </p>
              <p>
                We focus on practical automation that answers calls, captures customer details, books appointments, updates systems, and follows up automatically.
              </p>
              <p>
                The goal is simple: reduce admin, improve response time, and give businesses a more reliable front-end customer workflow without adding more staff.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="text-2xl font-bold text-white text-center mb-12">Our Approach</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl border border-white/5 bg-[#12121a] text-center"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mx-auto mb-4">
                    <v.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{v.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 p-8 md:p-10 rounded-2xl border border-white/5 bg-[#12121a]"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">What We Actually Build</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'AI call handling',
                'Lead capture automation',
                'CRM sync',
                'Calendar booking',
                'Follow-up workflows',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-[#0a0a0f] px-4 py-4 text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20 p-8 md:p-10 rounded-2xl border border-white/5 bg-[#12121a]"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Why Businesses Choose AssistantAI.com.au</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reasons.map((reason) => (
                <div key={reason} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-[#0a0a0f] px-4 py-4 text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center p-10 rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/5 to-transparent"
          >
            <h3 className="text-2xl font-bold text-white mb-3">Ready to See What AI Could Look Like in Your Business?</h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Book a free strategy call and we’ll map out where AssistantAI.com.au can help with calls, bookings, lead capture, and follow-up.
            </p>
            <Link
              to="/Contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all text-sm"
            >
              Book Your Free Strategy Call
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}