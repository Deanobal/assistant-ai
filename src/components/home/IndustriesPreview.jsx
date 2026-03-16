import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wrench, Home, Heart, Scale, ArrowRight } from 'lucide-react';

const industries = [
  { icon: Wrench, name: 'Trades' },
  { icon: Home, name: 'Real Estate' },
  { icon: Heart, name: 'Clinics' },
  { icon: Scale, name: 'Law Firms' },
];

export default function IndustriesPreview() {
  return (
    <section className="relative py-20 md:py-24 bg-[#0c0c14]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-cyan-400 text-sm font-medium mb-3">INDUSTRIES</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Built for High-Intent Service Businesses</h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            AssistantAI.com.au can be tailored to the way your industry handles enquiries, bookings, and follow-up.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {industries.map((ind, i) => (
            <motion.div
              key={ind.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-white/5 bg-[#12121a] card-hover"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center">
                <ind.icon className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-white text-sm font-medium">{ind.name}</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/Industries"
            className="inline-flex items-center gap-2 text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors"
          >
            See Industry Solutions <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}