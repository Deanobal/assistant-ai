import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="relative py-20 md:py-24 bg-[#0c0c14]">
      <div className="absolute inset-0 bg-radial-glow" />
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px]" />
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}>

          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Ready to Capture More Leads Without Hiring More Staff?
          </h2>
          <p className="mt-6 text-gray-400 text-lg max-w-2xl mx-auto">
            Book a free strategy call and see how AssistantAI.com.au can automate calls, follow-up, and lead capture for your business.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/Contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all">

              Book Your Free AI Strategy Call
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-gray-600 mt-4 text-base">No commitment. No pressure. Just a conversation about what's possible.</p>
        </motion.div>
      </div>
    </section>);

}