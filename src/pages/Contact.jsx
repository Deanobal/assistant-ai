import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail } from 'lucide-react';
import LeadForm from '../components/LeadForm';

export default function Contact() {
  return (
    <div>
      <section className="relative py-24 md:py-32 bg-grid">
        <div className="bg-radial-glow absolute inset-0" />
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <p className="text-cyan-400 text-sm font-medium mb-3">GET STARTED</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Book Your Free{' '}
              <span className="text-gradient">Strategy Call</span>
            </h1>
            <p className="mt-5 text-gray-400 text-lg max-w-2xl mx-auto">
              Tell us about your business and we’ll show you where AssistantAI.com.au can help answer more calls, capture more leads, and automate follow-up.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3 p-8 md:p-10 rounded-2xl border border-white/5 bg-[#12121a]"
            >
              <LeadForm />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 space-y-6"
            >
              <div className="p-6 rounded-2xl border border-white/5 bg-[#12121a]">
                <h3 className="text-white font-semibold mb-4">What Happens Next?</h3>
                <ol className="space-y-4">
                  {[
                    'We review your submission and understand your workflow',
                    'We schedule a practical strategy conversation',
                    'We show where calls, bookings, CRM, and follow-up can be automated',
                    'You receive a recommended setup for your business',
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0 text-xs font-bold text-white">
                        {i + 1}
                      </div>
                      <p className="text-gray-400 text-sm">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="p-6 rounded-2xl border border-white/5 bg-[#12121a] space-y-4">
                <h3 className="text-white font-semibold">Contact Info</h3>
                <div className="flex items-center gap-3 text-gray-400 text-sm">
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                  Australia-based service
                </div>
                <div className="flex items-center gap-3 text-gray-400 text-sm">
                  <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                  sales@assistantai.com.au
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/5 to-transparent">
                <p className="text-white font-semibold mb-2">No obligation. No pressure.</p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Just a practical strategy call about how AI could help your business.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}