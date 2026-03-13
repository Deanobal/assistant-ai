import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Target, Eye, Zap, Shield } from 'lucide-react';

const values = [
  { icon: Target, title: 'Results-Driven', desc: 'Every system we build is designed to deliver measurable business outcomes — more leads, less missed calls, faster response times.' },
  { icon: Eye, title: 'Transparency', desc: 'No jargon, no hidden fees, no lock-in contracts. We keep things simple and honest.' },
  { icon: Zap, title: 'Practical Innovation', desc: 'We don\'t chase hype. We implement AI that works right now, for real businesses.' },
  { icon: Shield, title: 'Reliability', desc: 'Our AI systems are built to work 24/7, and our team is here to support you every step of the way.' },
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
            className="text-center mb-20"
          >
            <p className="text-cyan-400 text-sm font-medium mb-3">ABOUT US</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              We Help Businesses{' '}
              <span className="text-gradient">Work Smarter</span>
            </h1>
          </motion.div>

          <div className="max-w-3xl mx-auto mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6 text-gray-400 leading-relaxed text-lg"
            >
              <p>
                AI Assistant was founded with a clear mission: help Australian businesses stop losing revenue to missed calls, slow responses, and manual processes.
              </p>
              <p>
                We noticed a pattern across industries — from tradies on the tools to real estate agents at inspections to dental receptionists juggling a packed schedule. Every business was losing customers simply because they couldn't respond fast enough.
              </p>
              <p>
                So we built a solution. Practical AI systems that answer calls, qualify leads, book appointments, and follow up with customers — automatically, 24 hours a day, 7 days a week.
              </p>
              <p>
                We're not about AI hype. We're about real results: more answered calls, more booked appointments, less admin, and better customer experiences. That's what we deliver, and that's what keeps our clients coming back.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-24"
          >
            <h2 className="text-2xl font-bold text-white text-center mb-12">Our Values</h2>
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

          <div className="grid sm:grid-cols-3 gap-6 mb-24">
            {[
              { label: 'Businesses Automated', value: '50+' },
              { label: 'Calls Handled', value: '100K+' },
              { label: 'Revenue Captured', value: '$2M+' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl border border-white/5 bg-[#12121a] text-center"
              >
                <p className="text-4xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center p-10 rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/5 to-transparent"
          >
            <h3 className="text-2xl font-bold text-white mb-3">Ready to See What AI Can Do for Your Business?</h3>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">
              Book a free strategy call and discover how we can help you capture more leads and grow.
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