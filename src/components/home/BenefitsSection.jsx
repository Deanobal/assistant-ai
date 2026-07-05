import React from 'react';
import { motion } from 'framer-motion';
import { PhoneOff, Clock, BriefcaseBusiness, TrendingUp, Users, Star } from 'lucide-react';

const benefits = [
  { icon: PhoneOff, title: 'Never Miss a Call Again', desc: 'Every call answered, every lead captured — even at 2am.' },
  { icon: Clock, title: '24/7 Customer Response', desc: 'Your AI never sleeps, never takes a break, never calls in sick.' },
  { icon: BriefcaseBusiness, title: 'Reduce Admin Workload', desc: 'Free your team from repetitive tasks so they can focus on what matters.' },
  { icon: TrendingUp, title: 'Increase Conversions', desc: 'Faster response times mean more leads converted to customers.' },
  { icon: Users, title: 'Scale Without Hiring', desc: 'Handle 10x the volume without adding a single team member.' },
  { icon: Star, title: 'Better Customer Experience', desc: 'Instant, professional responses that make your business look premium.' }
];

export default function BenefitsSection() {
  return (
    <section className="relative bg-[#0c0c14] py-14 sm:py-16 md:py-20">
      <div className="bg-radial-glow absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center sm:mb-12"
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.22em] text-cyan-400 sm:text-base md:text-lg">WHY ASSISTANTAI</p>
          <h2 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">Why It Matters for Lead Capture, Speed, and Growth</h2>
        </motion.div>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="flex gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-4 sm:min-h-[150px] sm:p-5 lg:border-transparent lg:bg-transparent lg:p-0"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/10 bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
                <benefit.icon className="h-5 w-5 text-cyan-400" />
              </div>
              <div className="min-w-0">
                <h3 className="mb-1 font-semibold text-white">{benefit.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500 sm:text-base">{benefit.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
