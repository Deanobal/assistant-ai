import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, HeartPulse, Building2, Briefcase } from 'lucide-react';

const industries = [
  { icon: Wrench, title: 'Trades', desc: 'Capture urgent work, quote requests, and after-hours enquiries faster.' },
  { icon: HeartPulse, title: 'Clinics', desc: 'Handle appointments, reschedules, and patient enquiries with less front-desk pressure.' },
  { icon: Building2, title: 'Real Estate', desc: 'Respond quickly to listings, rental enquiries, and high-intent buyer calls.' },
  { icon: Briefcase, title: 'Professional Services', desc: 'Make sure valuable new business enquiries get answered and followed up properly.' },
];

const examples = [
  {
    label: 'Sample Use Case',
    title: 'Missed Calls Turn Into Booked Work',
    body: 'When the team is busy on-site, AssistantAI answers instantly, qualifies the lead, and books the next step instead of letting the enquiry go cold.',
  },
  {
    label: 'Example Outcome',
    title: 'Follow-Up Stops Falling Through the Cracks',
    body: 'Customer details, call context, and next actions move into the workflow automatically so your team can respond faster and more consistently.',
  },
];

export default function IndustriesUseCasesSection() {
  return (
    <section className="relative py-16 md:py-20 bg-[#0c0c14]">
      <div className="max-w-7xl mx-auto px-6 space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-cyan-400 mb-3 text-lg font-medium">INDUSTRIES</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Built for Australian Service Businesses</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {industries.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="rounded-2xl border border-white/5 bg-[#12121a] p-6"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-400 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {examples.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="rounded-[28px] border border-white/5 bg-white/[0.03] p-6 md:p-7"
            >
              <p className="text-cyan-400 text-sm font-medium uppercase tracking-[0.18em] mb-3">{item.label}</p>
              <h3 className="text-white text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-gray-400 leading-relaxed">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}