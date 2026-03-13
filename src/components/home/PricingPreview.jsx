import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    setup: '$1,500',
    monthly: '$497',
    desc: 'Best for small businesses and basic AI receptionist use.',
    features: ['AI receptionist', 'Basic lead capture', 'Call answering', 'Business hours coverage', 'Email support'],
    featured: false,
  },
  {
    name: 'Growth',
    setup: '$3,000',
    monthly: '$1,500',
    desc: 'Best for growing businesses needing voice AI plus CRM automation.',
    features: ['AI voice agent', 'CRM automation', 'Appointment booking', 'Lead qualification', 'SMS & email follow-up', '24/7 coverage', 'Priority support'],
    featured: true,
  },
  {
    name: 'Enterprise',
    setup: '$7,500+',
    monthly: '$3,000+',
    desc: 'Best for larger businesses with multiple locations and complex workflows.',
    features: ['Multiple AI agents', 'Advanced automation', 'Multi-location support', 'Custom workflows', 'Advanced integrations', 'Dedicated account manager', 'Priority support'],
    featured: false,
  },
];

export default function PricingPreview() {
  return (
    <section className="relative py-24 md:py-32 bg-[#0c0c14]">
      <div className="bg-radial-glow absolute inset-0" />
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-cyan-400 text-sm font-medium mb-3">PRICING</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto">
            Less than the cost of a staff member, with 24/7 coverage.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
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

              <h3 className="text-white font-semibold text-lg">{plan.name}</h3>
              <p className="text-gray-500 text-sm mt-1 mb-6">{plan.desc}</p>

              <div className="mb-1">
                <span className="text-3xl font-bold text-white">{plan.monthly}</span>
                <span className="text-gray-500 text-sm">/month</span>
              </div>
              <p className="text-gray-600 text-xs mb-6">{plan.setup} setup fee</p>

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
                className={`block w-full text-center py-3 rounded-full text-sm font-medium transition-all ${
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

        <div className="mt-12 text-center">
          <Link
            to="/Pricing"
            className="inline-flex items-center gap-2 text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors"
          >
            Compare All Plans <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}