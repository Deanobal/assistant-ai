import React from 'react';
import { motion } from 'framer-motion';
import { TimerReset, TrendingUp, ClipboardMinus, Smile, Users2, Database } from 'lucide-react';

const outcomes = [
  { icon: TimerReset, title: 'Respond Faster', desc: 'Answer enquiries immediately instead of letting leads sit unanswered.' },
  { icon: TrendingUp, title: 'Convert More Enquiries', desc: 'Move more callers from first contact into booked jobs and real opportunities.' },
  { icon: ClipboardMinus, title: 'Reduce Admin Workload', desc: 'Remove repetitive call handling, data entry, and follow-up tasks from your team.' },
  { icon: Smile, title: 'Improve Customer Experience', desc: 'Give customers a faster, more professional response every time they call.' },
  { icon: Users2, title: 'Scale Without Hiring', desc: 'Handle more enquiries without needing more reception staff.' },
  { icon: Database, title: 'Keep Every Lead Tracked', desc: 'Make sure every lead is captured, updated, and followed up properly.' },
];

export default function WhyItMattersSection() {
  return (
    <section className="relative py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-cyan-400 mb-3 text-lg font-medium">WHY IT MATTERS</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
            This is not AI for the sake of AI. It is lead capture infrastructure.
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {outcomes.map((item, index) => (
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
      </div>
    </section>
  );
}