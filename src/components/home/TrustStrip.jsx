import React from 'react';
import { motion } from 'framer-motion';
import { Database, CalendarDays, MessageSquare, PhoneCall } from 'lucide-react';

const items = [
  { icon: Database, label: 'CRM Sync' },
  { icon: CalendarDays, label: 'Google / Outlook Calendar' },
  { icon: MessageSquare, label: 'SMS Follow-Up' },
  { icon: PhoneCall, label: '24/7 Call Handling' },
];

export default function TrustStrip() {
  return (
    <section className="relative border-y border-white/5 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {items.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="flex items-center gap-3 rounded-2xl px-4 py-3"
            >
              <div className="w-8 h-8 rounded-xl bg-cyan-500/8 flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-sm text-white/85">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}