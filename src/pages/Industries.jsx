import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wrench, Home, Heart, Stethoscope, Scale, Car, UtensilsCrossed, Building2, ArrowRight } from 'lucide-react';

const industries = [
  {
    icon: Wrench,
    name: 'Trades',
    problem: 'Tradies miss calls while they\'re on-site. By the time they call back, the customer has already booked someone else.',
    solution: 'Your AI answers every call instantly, captures job details, and books the appointment — even while you\'re up a ladder.',
    stats: '60% of missed trade calls go to a competitor',
  },
  {
    icon: Home,
    name: 'Real Estate',
    problem: 'Buyer enquiries come in at all hours. Agents juggling showings can\'t respond to every one fast enough.',
    solution: 'AI handles buyer and seller enquiries 24/7, qualifies leads, and schedules inspections automatically.',
    stats: 'Agents save 15+ hours per week on admin',
  },
  {
    icon: Heart,
    name: 'Medical Clinics',
    problem: 'Reception staff are overwhelmed with calls, bookings, and rescheduling — leaving patients on hold or going to voicemail.',
    solution: 'AI manages appointment bookings, cancellations, and patient enquiries without tying up your team.',
    stats: 'Reduce phone wait times by 90%',
  },
  {
    icon: Stethoscope,
    name: 'Dental Clinics',
    problem: 'Dental practices lose revenue from no-shows and unconfirmed appointments, plus constant rebooking takes staff time.',
    solution: 'Automated booking confirmations, reminders, and intelligent rescheduling keep your chair time filled.',
    stats: 'Cut no-shows by up to 40%',
  },
  {
    icon: Scale,
    name: 'Law Firms',
    problem: 'Potential clients calling for consultations expect immediate, professional responses — but lawyers are in court or meetings.',
    solution: 'AI handles intake calls, gathers case details, qualifies the enquiry, and books the initial consultation.',
    stats: 'Capture 3x more qualified consultations',
  },
  {
    icon: Car,
    name: 'Automotive',
    problem: 'Service departments miss booking calls, and sales enquiries go cold when response times are too slow.',
    solution: 'AI books service appointments, answers vehicle enquiries, and follows up with every sales lead promptly.',
    stats: 'Increase service bookings by 35%',
  },
  {
    icon: UtensilsCrossed,
    name: 'Hospitality',
    problem: 'Restaurants and venues lose bookings when phones go unanswered during busy periods.',
    solution: 'AI manages reservations, event enquiries, and customer questions — even during the Friday night rush.',
    stats: 'Never miss a reservation again',
  },
  {
    icon: Building2,
    name: 'Service Businesses',
    problem: 'From cleaning to accounting, service businesses struggle to handle enquiries while delivering their actual service.',
    solution: 'AI provides a professional front-of-house experience, capturing leads and booking clients while you focus on delivery.',
    stats: 'Save $50K+ annually in reception costs',
  },
];

export default function Industries() {
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
              AI Built for{' '}
              <span className="text-gradient">Your Industry</span>
            </h1>
            <p className="mt-5 text-gray-400 text-lg max-w-2xl mx-auto">
              We understand the unique challenges of every industry. Here's how Assistant AI helps businesses like yours win more customers.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {industries.map((ind, i) => (
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

                <div className="space-y-4 mb-5">
                  <div>
                    <p className="text-gray-600 text-xs font-medium uppercase tracking-wider mb-1">The Problem</p>
                    <p className="text-gray-400 text-sm leading-relaxed">{ind.problem}</p>
                  </div>
                  <div>
                    <p className="text-cyan-400/60 text-xs font-medium uppercase tracking-wider mb-1">The Solution</p>
                    <p className="text-gray-300 text-sm leading-relaxed">{ind.solution}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <p className="text-cyan-400 text-sm font-medium">{ind.stats}</p>
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