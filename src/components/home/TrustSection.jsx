import React from 'react';
import { motion } from 'framer-motion';

const trustPoints = [
'Built for Australian businesses',
'Designed for lead capture and automation',
'Works across calls, bookings, and follow-up',
'Ongoing optimisation and support included'];


export default function TrustSection({ aboutImage }) {
  return (
    <section className="relative py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}>

            <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-[#12121a]">
              <div className="bg-gradient-to-t px-1 py-1 absolute inset-0 from-[#0a0a0f]/50 to-transparent z-10" />
              <img
                src={aboutImage}
                alt="AssistantAI.com.au workflow preview"
                className="w-full rounded-2xl" />

            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}>

            <p className="text-cyan-400 mb-3 text-lg font-medium">ABOUT ASSISTANTAI.COM.AU</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Premium AI Systems Built for{' '}
              <span className="text-gradient">Real Business Workflows</span>
            </h2>
            <div className="space-y-4 text-gray-400 leading-relaxed">
              <p>
                AssistantAI.com.au helps businesses answer more calls, capture better leads, and automate follow-up with practical AI systems that fit into daily operations.
              </p>
              <p>
                We focus on productised, business-ready automation that connects calls, bookings, CRM updates, and customer communication in one smoother workflow.
              </p>
            </div>
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {trustPoints.map((point) =>
              <div key={point} className="p-4 rounded-xl bg-[#12121a] border border-white/5 text-sm text-white/90">
                  {point}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>);

}