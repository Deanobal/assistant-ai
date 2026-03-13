import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, Headphones, MessageSquare, Database, CalendarCheck, Send, GitBranch, ArrowRight } from 'lucide-react';

const services = [
  { icon: Mic, title: 'AI Voice Agents', desc: 'Intelligent voice AI that handles inbound and outbound calls naturally.' },
  { icon: Headphones, title: 'AI Receptionists', desc: 'A virtual front desk that greets callers and routes enquiries.' },
  { icon: MessageSquare, title: 'AI Chatbots', desc: 'Website chat that engages visitors and captures leads 24/7.' },
  { icon: Database, title: 'CRM Automation', desc: 'Automatically update your CRM with every customer interaction.' },
  { icon: CalendarCheck, title: 'Appointment Booking', desc: 'AI-powered scheduling that fills your calendar effortlessly.' },
  { icon: Send, title: 'SMS & Email Follow-Up', desc: 'Automated follow-up sequences that nurture every lead.' },
  { icon: GitBranch, title: 'Workflow Automation', desc: 'Connect your tools and automate repetitive business processes.' },
];

export default function ServicesPreview() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-cyan-400 text-sm font-medium mb-3">SERVICES</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">AI Solutions Built for Business</h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            From voice agents to workflow automation — everything you need to run a smarter, more efficient business.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-5 rounded-2xl border border-white/5 bg-[#12121a] card-hover group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mb-3 group-hover:from-cyan-500/20 group-hover:to-blue-500/20 transition-colors">
                <s.icon className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-white font-semibold text-sm mb-1.5">{s.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/Services"
            className="inline-flex items-center gap-2 text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors"
          >
            Explore All Services <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}