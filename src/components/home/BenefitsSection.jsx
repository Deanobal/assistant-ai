import React from 'react';
import { motion } from 'framer-motion';
import { PhoneOff, Clock, BriefcaseBusiness, TrendingUp, Users, Star } from 'lucide-react';

const benefits = [
  { icon: PhoneOff, title: 'Never Miss a Call Again', desc: 'Every call answered, every lead captured — even at 2am.' },
  { icon: Clock, title: '24/7 Customer Response', desc: 'Your AI never sleeps, never takes a break, never calls in sick.' },
  { icon: BriefcaseBusiness, title: 'Reduce Admin Workload', desc: 'Free your team from repetitive tasks so they can focus on what matters.' },
  { icon: TrendingUp, title: 'Increase Conversions', desc: 'Faster response times mean more leads converted to customers.' },
  { icon: Users, title: 'Scale Without Hiring', desc: 'Handle 10x the volume without adding a single team member.' },
  { icon: Star, title: 'Better Customer Experience', desc: 'Instant, professional responses that make your business look premium.' },
];

export default function BenefitsSection() {
  return (
    <section className="relative py-20 md:py-24 bg-[#0c0c14]">
      <div className="bg-radial-glow absolute inset-0" />
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-cyan-400 text-sm font-medium mb-3">WHY ASSISTANTAI.COM.AU</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Why It Matters for Lead Capture, Speed, and Growth</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-4"
            >
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/10 flex items-center justify-center">
                <b.icon className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">{b.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}