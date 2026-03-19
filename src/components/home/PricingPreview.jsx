import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const plans = [
  {
    name: 'Starter',
    setup: '$1,500',
    monthly: '$497',
    desc: 'For businesses getting started with better call handling and lead capture.',
    featured: false,
  },
  {
    name: 'Growth',
    setup: '$3,000',
    monthly: '$1,500',
    desc: 'For businesses ready to combine calls, bookings, CRM sync, and follow-up automation.',
    featured: true,
  },
  {
    name: 'Enterprise',
    setup: '$7,500+',
    monthly: '$3,000+',
    desc: 'For larger or more complex service workflows that need deeper automation and integration.',
    featured: false,
  },
];

export default function PricingPreview() {
  return (
    <section className="relative py-16 md:py-20 bg-[#0c0c14]">
      <div className="bg-radial-glow absolute inset-0" />
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-cyan-400 mb-3 text-lg font-medium">PRICING SNAPSHOT</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Simple Pricing for a Productised Service</h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            All plans include setup, support, optimisation, and ongoing management.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-8 rounded-2xl border ${
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
              <p className="text-gray-400 mt-2 mb-6 leading-relaxed">{plan.desc}</p>

              <div className="space-y-2">
                <p className="text-white text-3xl font-bold">{plan.setup}</p>
                <p className="text-gray-500">setup</p>
              </div>
              <div className="mt-6 space-y-2">
                <p className="text-white text-3xl font-bold">{plan.monthly}</p>
                <p className="text-gray-500">per month</p>
              </div>

              <Link
                to="/Contact"
                className={`mt-8 block w-full text-center py-3 rounded-full text-sm font-medium transition-all ${
                  plan.featured
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/20'
                    : 'border border-white/10 text-white hover:bg-white/5'
                }`}
              >
                Book Free Strategy Call
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}