import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, Headphones, MessageSquare, Database, CalendarCheck, Send, GitBranch, ArrowRight } from 'lucide-react';

const services = [
  {
    icon: Mic,
    title: 'AI Voice Agents',
    desc: 'Your AI voice agent answers calls like a real team member — understanding customer needs, answering questions, and taking action.',
    outcomes: ['Handle unlimited inbound calls', 'Qualify leads in real-time', 'Transfer urgent calls to staff', 'Work across business hours and after-hours'],
  },
  {
    icon: Headphones,
    title: 'AI Receptionists',
    desc: 'A professional virtual receptionist that greets every caller, routes enquiries, and ensures no customer goes unattended.',
    outcomes: ['Professional first impression every time', 'Route calls to the right person', 'Capture caller details automatically', 'Reduce hold times to zero'],
  },
  {
    icon: MessageSquare,
    title: 'AI Chatbots',
    desc: 'Engage website visitors the moment they land on your site. Answer questions, capture leads, and guide prospects toward booking.',
    outcomes: ['24/7 website engagement', 'Instant lead capture', 'Pre-qualify prospects', 'Reduce bounce rates'],
  },
  {
    icon: Database,
    title: 'CRM Automation',
    desc: 'Every call, message, and interaction gets logged automatically. No more manual data entry or lost customer information.',
    outcomes: ['Auto-sync contacts and notes', 'Track lead status in real-time', 'Trigger workflows from CRM events', 'Eliminate manual data entry'],
  },
  {
    icon: CalendarCheck,
    title: 'Appointment Booking',
    desc: 'Let your AI handle scheduling — checking availability, booking appointments, and sending confirmations without human involvement.',
    outcomes: ['Sync with your existing calendar', 'Send automated reminders', 'Handle rescheduling and cancellations', 'Reduce no-shows by up to 40%'],
  },
  {
    icon: Send,
    title: 'SMS & Email Follow-Up',
    desc: 'Never let a lead go cold. Automated follow-up sequences ensure every prospect gets the right message at the right time.',
    outcomes: ['Instant post-call follow-ups', 'Multi-step nurture sequences', 'Personalised messaging', 'Higher conversion rates'],
  },
  {
    icon: GitBranch,
    title: 'Workflow Automation',
    desc: 'Connect your business tools and create automated workflows that eliminate repetitive tasks and keep everything running smoothly.',
    outcomes: ['Connect 500+ business tools', 'Automate repetitive processes', 'Trigger actions across platforms', 'Save hours of manual work daily'],
  },
];

export default function Services() {
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
            <p className="text-cyan-400 text-sm font-medium mb-3">OUR SERVICES</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              AI Solutions That{' '}
              <span className="text-gradient">Drive Results</span>
            </h1>
            <p className="mt-5 text-gray-400 text-lg max-w-2xl mx-auto">
              Every service is designed around one goal: helping your business capture more leads, respond faster, and operate more efficiently.
            </p>
          </motion.div>

          <div className="space-y-8">
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="grid md:grid-cols-2 gap-8 p-8 md:p-10 rounded-2xl border border-white/5 bg-[#12121a] card-hover"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mb-5">
                    <s.icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3">{s.title}</h2>
                  <p className="text-gray-400 leading-relaxed">{s.desc}</p>
                </div>
                <div>
                  <h4 className="text-white text-sm font-medium mb-4">Key Outcomes</h4>
                  <ul className="space-y-3">
                    {s.outcomes.map(o => (
                      <li key={o} className="flex items-start gap-3 text-gray-400 text-sm">
                        <div className="w-5 h-5 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        </div>
                        {o}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 text-center p-10 rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/5 to-transparent"
          >
            <h3 className="text-2xl font-bold text-white mb-3">Not Sure Which Service You Need?</h3>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">
              Book a free strategy call and we'll recommend the right AI solution for your business.
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