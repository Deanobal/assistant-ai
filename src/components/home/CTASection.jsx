import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="relative py-16 md:py-20 bg-[#0c0c14]">
      <div className="absolute inset-0 bg-radial-glow" />
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px]" />
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-balance">
            Ready to capture more leads without hiring more staff?
          </h2>
          <p className="mt-6 text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
            If missed calls, slow follow-up, and disconnected systems are costing you business, we will show you exactly how to fix it.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/BookStrategyCall"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
            >
              Book Free Strategy Call
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/Contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/15 bg-white/[0.03] text-white font-medium rounded-full hover:bg-white/[0.05] hover:border-white/30 transition-all"
            >
              Speak to Our Team
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}