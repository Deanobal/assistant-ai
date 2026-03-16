import React from 'react';
import { motion } from 'framer-motion';
import { PhoneCall, Lightbulb, Link as LinkIcon, Rocket } from 'lucide-react';

const steps = [
  { icon: PhoneCall, step: '01', title: 'Book a Strategy Call', desc: 'We learn how your business handles calls, leads, bookings, and follow-up today.' },
  { icon: Lightbulb, step: '02', title: 'We Map Your Workflow', desc: 'We identify what the AI should say, capture, automate, and sync into your systems.' },
  { icon: LinkIcon, step: '03', title: 'We Build & Integrate Your AI', desc: 'Your AI is configured and connected to the tools your team already uses.' },
  { icon: Rocket, step: '04', title: 'Your Assistant Goes Live', desc: 'You launch with monitoring, optimisation, and support included from day one.' },
];

export default function HowItWorks() {
  return (
    <section className="relative py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-cyan-400 text-sm font-medium mb-3">PROCESS</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How It Works</h2>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto">
            From strategy call to live AI — we handle everything so you can focus on running your business.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative p-6 rounded-2xl border border-white/5 bg-[#12121a]"
            >
              <span className="text-5xl font-bold text-white/[0.03] absolute top-4 right-4">{s.step}</span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-4">
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}