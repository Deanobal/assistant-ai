import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wrench, Home, Heart, Stethoscope, Scale, Car, UtensilsCrossed, Building2, ArrowRight } from 'lucide-react';

const industries = [
  {
    icon: Wrench,
    name: 'Trades',
    problem: 'Calls come in while the team is on-site, on the tools, or driving between jobs.',
    solution: 'AI can answer enquiries, capture job details, and keep the lead flow moving while the team stays focused on delivery.',
    fit: 'Common fit: urgent call handling, job intake, and lead capture.',
  },
  {
    icon: Home,
    name: 'Real Estate',
    problem: 'Agents can be in inspections, appraisals, or meetings when buyer and seller enquiries come in.',
    solution: 'AI can respond quickly, capture key details, and help route enquiries into the right follow-up workflow.',
    fit: 'Common fit: enquiry capture, inspection booking, and after-hours response.',
  },
  {
    icon: Heart,
    name: 'Medical Clinics',
    problem: 'Front-desk teams juggle calls, schedules, and patient questions at the same time.',
    solution: 'AI can support appointment flow, common questions, and structured enquiry capture without adding pressure to staff.',
    fit: 'Common fit: appointment handling and patient enquiry support.',
  },
  {
    icon: Stethoscope,
    name: 'Dental Clinics',
    problem: 'Booking requests, reschedules, and missed enquiries create admin load for reception teams.',
    solution: 'AI can help manage appointment requests, confirmations, and follow-up while staff stay focused on patients.',
    fit: 'Common fit: booking support and follow-up automation.',
  },
  {
    icon: Scale,
    name: 'Law Firms',
    problem: 'Potential clients expect prompt responses even when the team is in meetings, court, or deep work.',
    solution: 'AI can handle first contact professionally, capture case details, and move qualified enquiries into the right intake flow.',
    fit: 'Common fit: consultation intake and lead qualification.',
  },
  {
    icon: Car,
    name: 'Automotive',
    problem: 'Service and sales teams miss opportunities when phones ring during busy workshop periods.',
    solution: 'AI can help capture booking intent, answer common questions, and push enquiries into the next step faster.',
    fit: 'Common fit: service bookings, sales follow-up, and enquiry triage.',
  },
  {
    icon: UtensilsCrossed,
    name: 'Hospitality',
    problem: 'Venues and restaurants can miss reservations and event enquiries during peak periods.',
    solution: 'AI can support reservation flow, event enquiries, and customer communication when the team is busy on the floor.',
    fit: 'Common fit: reservations, function enquiries, and follow-up.',
  },
  {
    icon: Building2,
    name: 'Service Businesses',
    problem: 'Service-based teams often handle enquiries while also doing the work, creating delays and missed follow-up.',
    solution: 'AI can create a more reliable front-end workflow for calls, bookings, and customer details.',
    fit: 'Common fit: lead capture, booking support, and workflow automation.',
  },
];

export default function Industries() {
  const topIndustries = industries.slice(0, 4);
  const bottomIndustries = industries.slice(4);

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
            <p className="text-cyan-400 text-sm font-medium mb-3">INDUSTRIES</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              AI Workflows Adapted for{' '}
              <span className="text-gradient">Different Industries</span>
            </h1>
            <p className="mt-5 text-gray-400 text-lg max-w-3xl mx-auto">
              See how AssistantAI.com.au can be tailored to the way your industry handles calls, bookings, lead capture, and follow-up.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {topIndustries.map((ind, i) => (
              <motion.div
                key={ind.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-8 rounded-2xl border border-white/5 bg-[#12121a] card-hover"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center">
                    <ind.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">{ind.name}</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-600 text-xs font-medium uppercase tracking-wider mb-1">Challenge</p>
                    <p className="text-gray-400 text-sm leading-relaxed">{ind.problem}</p>
                  </div>
                  <div>
                    <p className="text-cyan-400/70 text-xs font-medium uppercase tracking-wider mb-1">How AI Helps</p>
                    <p className="text-gray-300 text-sm leading-relaxed">{ind.solution}</p>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-cyan-400 text-sm font-medium">{ind.fit}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mb-12 text-center p-8 rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/5 to-transparent">
            <h3 className="text-2xl font-bold text-white mb-3">See how AssistantAI.com.au would work in your business.</h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Book a strategy call and we’ll map the right workflow for your industry, team, and enquiry process.
            </p>
            <Link
              to="/Contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all text-sm"
            >
              Book Strategy Call
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {bottomIndustries.map((ind, i) => (
              <motion.div
                key={ind.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-8 rounded-2xl border border-white/5 bg-[#12121a] card-hover"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center">
                    <ind.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">{ind.name}</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-600 text-xs font-medium uppercase tracking-wider mb-1">Challenge</p>
                    <p className="text-gray-400 text-sm leading-relaxed">{ind.problem}</p>
                  </div>
                  <div>
                    <p className="text-cyan-400/70 text-xs font-medium uppercase tracking-wider mb-1">How AI Helps</p>
                    <p className="text-gray-300 text-sm leading-relaxed">{ind.solution}</p>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-cyan-400 text-sm font-medium">{ind.fit}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <p className="text-gray-400 mb-4">See how AssistantAI.com.au would work in your business.</p>
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