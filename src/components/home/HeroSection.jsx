import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';

export default function HeroSection({ heroImage }) {
  return (
    <section className="relative overflow-hidden bg-grid">
      <div className="bg-radial-glow absolute inset-0" />
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 md:pt-32 md:pb-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-cyan-400 text-xs font-medium">AI-Powered Automation</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Hire an AI Employee{' '}
              <span className="text-gradient">That Works 24/7</span>
            </h1>

            <p className="mt-6 text-gray-400 text-lg md:text-xl leading-relaxed max-w-lg">
              Automate calls, capture leads, and grow your business with intelligent AI agents built for modern businesses.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                to="/Contact"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all text-sm"
              >
                Book Your Free AI Strategy Call
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/10 text-white font-medium rounded-full hover:bg-white/5 transition-all text-sm">
                <Play className="w-4 h-4" />
                See AI In Action
              </button>
            </div>

            <div className="mt-12 flex items-center gap-8">
              <div>
                <p className="text-2xl font-bold text-white">500+</p>
                <p className="text-gray-500 text-xs">Calls Handled Daily</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="text-2xl font-bold text-white">98%</p>
                <p className="text-gray-500 text-xs">Customer Satisfaction</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="text-2xl font-bold text-white">24/7</p>
                <p className="text-gray-500 text-xs">Always Available</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden md:block"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent z-10 rounded-2xl" />
              <img
                src={heroImage}
                alt="Futuristic AI neural network visualization"
                className="w-full rounded-2xl"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}