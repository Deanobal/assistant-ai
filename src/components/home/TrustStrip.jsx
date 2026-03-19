import React from 'react';
import { motion } from 'framer-motion';
import { Database, CalendarDays, MessageSquare, PhoneCall } from 'lucide-react';

const items = [
{ icon: Database, label: 'CRM Sync' },
{ icon: CalendarDays, label: 'Google / Outlook Calendar' },
{ icon: MessageSquare, label: 'SMS Follow-Up' },
{ icon: PhoneCall, label: '24/7 AI Call Handling' }];

export default function TrustStrip() {
  return (
    <section className="relative border-y border-white/5 bg-white/[0.03]">
      <div className="max-w-7xl mx-auto px-6 py-4 md:px-8">
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 lg:gap-5">
          {items.map((item, index) =>
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06 }}
            className="flex items-center justify-center gap-2.5 rounded-full border border-white/6 bg-white/[0.02] px-4 py-2.5 text-center">

              <div className="w-7 h-7 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0">
                <item.icon className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <span className="text-white/85 text-sm md:text-base whitespace-nowrap">{item.label}</span>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}