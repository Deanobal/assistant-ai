import React from 'react';
import { motion } from 'framer-motion';

export default function TrustSection({ aboutImage }) {
  return (
    <section className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f]/50 to-transparent z-10" />
              <img
                src={aboutImage}
                alt="AI automation technology"
                className="w-full rounded-2xl"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-cyan-400 text-sm font-medium mb-3">ABOUT US</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Built to Help Businesses{' '}
              <span className="text-gradient">Win More Customers</span>
            </h2>
            <div className="space-y-4 text-gray-400 leading-relaxed">
              <p>
                AI Assistant was created with a simple mission: help businesses stop losing customers to missed calls, slow response times, and manual processes.
              </p>
              <p>
                We saw businesses across Australia — from tradies to law firms — losing thousands in revenue simply because they couldn't answer every call or follow up with every lead.
              </p>
              <p>
                So we built practical AI systems that work around the clock — answering calls, qualifying leads, booking appointments, and automating follow-up. No hype, just results.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#12121a] border border-white/5">
                <p className="text-2xl font-bold text-white">50+</p>
                <p className="text-gray-500 text-xs mt-1">Businesses Automated</p>
              </div>
              <div className="p-4 rounded-xl bg-[#12121a] border border-white/5">
                <p className="text-2xl font-bold text-white">$2M+</p>
                <p className="text-gray-500 text-xs mt-1">Revenue Captured for Clients</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}