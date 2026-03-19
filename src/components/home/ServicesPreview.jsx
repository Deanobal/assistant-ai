import React from 'react';
import { motion } from 'framer-motion';
import { Phone, UserCheck, CalendarCheck, Database, MessageSquareText, PhoneForwarded } from 'lucide-react';

const cards = [
  { icon: Phone, title: 'Answer Every Call', desc: 'Make sure valuable enquiries are answered immediately instead of going to voicemail or getting missed.' },
  { icon: UserCheck, title: 'Qualify Better Leads', desc: 'Ask the right questions up front so your team spends more time on serious opportunities.' },
  { icon: CalendarCheck, title: 'Book Appointments Automatically', desc: 'Turn inbound demand into booked jobs and scheduled next steps faster.' },
  { icon: Database, title: 'Update Your CRM Instantly', desc: 'Keep customer records accurate without relying on manual admin after each call.' },
  { icon: MessageSquareText, title: 'Trigger SMS & Email Follow-Up', desc: 'Keep prospects warm with faster confirmations, reminders, and follow-up messages.' },
  { icon: PhoneForwarded, title: 'Route Calls Intelligently', desc: 'Send urgent or high-value calls to the right person when human input is needed.' },
];

export default function ServicesPreview() {
  return (
    <section className="relative py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-cyan-400 text-lg font-medium mb-3">WHAT OUR AI AGENTS DO</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">What Our AI Agents Do</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="p-6 rounded-2xl border border-white/5 bg-[#12121a] card-hover"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mb-4">
                <card.icon className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">{card.title}</h3>
              <p className="text-gray-400 text-base leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}