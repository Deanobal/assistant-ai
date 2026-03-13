import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight, HelpCircle } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    setup: '$1,500',
    monthly: '$497',
    desc: 'Best for small businesses and basic AI receptionist use.',
    features: [
      'AI receptionist',
      'Basic lead capture',
      'Call answering',
      'Business hours coverage',
      'Email support',
      'Monthly performance report',
    ],
    featured: false,
  },
  {
    name: 'Growth',
    setup: '$3,000',
    monthly: '$1,500',
    desc: 'Best for growing businesses needing voice AI plus CRM automation.',
    features: [
      'AI voice agent',
      'CRM automation',
      'Appointment booking',
      'Lead qualification',
      'SMS & email follow-up',
      '24/7 coverage',
      'Priority support',
      'Weekly performance reports',
    ],
    featured: true,
  },
  {
    name: 'Enterprise',
    setup: '$7,500+',
    monthly: '$3,000+',
    desc: 'Best for larger businesses with multiple locations and complex workflows.',
    features: [
      'Multiple AI agents',
      'Advanced automation',
      'Multi-location support',
      'Custom workflows',
      'Advanced integrations',
      'Dedicated account manager',
      'Priority support',
      'Custom reporting & analytics',
    ],
    featured: false,
  },
];

const faqs = [
  {
    q: 'How long does setup take?',
    a: 'Most AI systems go live within 5–10 business days, depending on complexity.',
  },
  {
    q: 'Do I need to change my phone system?',
    a: 'No. We integrate with your existing phone number and systems. No disruption to your business.',
  },
  {
    q: 'Can I upgrade my plan later?',
    a: 'Absolutely. You can upgrade at any time as your business grows.',
  },
  {
    q: 'Is there a lock-in contract?',
    a: 'No lock-in contracts. We believe in earning your business every month.',
  },
  {
    q: 'What happens if the AI can\'t handle a call?',
    a: 'Your AI seamlessly transfers the call to a human team member when needed.',
  },
  {
    q: 'Do you offer a trial?',
    a: 'We offer a free strategy call to design the right solution. Setup includes a pilot period to fine-tune performance.',
  },
];

export default function Pricing() {
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
            <p className="text-cyan-400 text-sm font-medium mb-3">PRICING</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Invest in an AI Employee{' '}
              <span className="text-gradient">That Pays for Itself</span>
            </h1>
            <p className="mt-5 text-gray-400 text-lg max-w-2xl mx-auto">
              Less than the cost of a staff member, with 24/7 coverage.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-24">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-8 rounded-2xl border card-hover ${
                  plan.featured
                    ? 'border-cyan-500/30 bg-gradient-to-b from-cyan-500/5 to-[#12121a] glow-border'
                    : 'border-white/5 bg-[#12121a]'
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-xs font-medium text-white">
                    Most Popular
                  </div>
                )}

                <h3 className="text-white font-semibold text-xl">{plan.name}</h3>
                <p className="text-gray-500 text-sm mt-2 mb-6">{plan.desc}</p>

                <div className="mb-1">
                  <span className="text-4xl font-bold text-white">{plan.monthly}</span>
                  <span className="text-gray-500 text-sm">/month</span>
                </div>
                <p className="text-gray-600 text-xs mb-8">{plan.setup} one-time setup</p>

                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-400">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/Contact"
                  className={`block w-full text-center py-3.5 rounded-full text-sm font-medium transition-all ${
                    plan.featured
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/20'
                      : 'border border-white/10 text-white hover:bg-white/5'
                  }`}
                >
                  Get Started
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-white text-center mb-10">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {faqs.map((faq, i) => (
                <div key={i} className="p-6 rounded-2xl border border-white/5 bg-[#12121a]">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-white font-medium text-sm mb-2">{faq.q}</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <p className="text-gray-400 mb-4">Not sure which plan is right for you?</p>
            <Link
              to="/Contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all text-sm"
            >
              Book a Free Strategy Call
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}