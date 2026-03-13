import React from 'react';
import { motion } from 'framer-motion';
import { Phone, UserCheck, ClipboardList, CalendarCheck, PhoneForwarded, MailCheck } from 'lucide-react';

const features = [
  { icon: Phone, title: 'Answer Calls Automatically', desc: 'Never miss a call. Your AI agent picks up every time, day or night.' },
  { icon: UserCheck, title: 'Qualify Leads', desc: 'Ask the right questions to filter high-value prospects instantly.' },
  { icon: ClipboardList, title: 'Collect Customer Details', desc: 'Capture names, numbers, and enquiry details automatically.' },
  { icon: CalendarCheck, title: 'Book Appointments', desc: 'Schedule meetings directly into your calendar without lifting a finger.' },
  { icon: PhoneForwarded, title: 'Transfer to Staff', desc: 'Seamlessly hand off calls to your team when human touch is needed.' },
  { icon: MailCheck, title: 'Automate Follow-Up', desc: 'Send SMS and email follow-ups to every lead, every time.' },
];

export default function WhatAgentsDo() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-cyan-400 text-sm font-medium mb-3">CAPABILITIES</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">What Our AI Agents Do</h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            Intelligent AI systems that handle your customer communication from first contact to booked appointment.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-6 rounded-2xl border border-white/5 bg-[#12121a] card-hover"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
                <f.icon className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}