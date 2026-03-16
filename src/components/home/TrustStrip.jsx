import React from 'react';
import { motion } from 'framer-motion';
import { Database, CalendarDays, MessageSquare, PhoneCall } from 'lucide-react';

const items = [
{ icon: Database, label: 'CRM Sync' },
{ icon: CalendarDays, label: 'Google / Outlook Calendar' },
{ icon: MessageSquare, label: 'SMS Follow-Up' },
{ icon: PhoneCall, label: '24/7 Call Handling' }];


export default function TrustStrip() {
  return (
    <section className="relative border-y border-white/5 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-6 py-3.5 md:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {items.map((item, index) =>
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06 }}
            className="flex items-center gap-2.5 rounded-2xl px-3 py-2">

              <div className="w-7 h-7 rounded-lg bg-cyan-500/8 flex items-center justify-center shrink-0">
                <item.icon className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <span className="text-white/85 text-lg">{item.label}</span>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}