import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';

export default function HeroSection({ heroImage }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b3622e4aaa6acc06c2547f/6bac2678b_FuturisticglowingAIwithdigitalelements.png"
          alt="AI Background"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/90 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-32 md:py-40">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6">
              Never Miss a Call.{' '}
              <span className="text-gradient">Never Lose a Lead.</span>
            </h1>

            <p className="text-gray-400 text-xl md:text-2xl leading-relaxed mb-10 max-w-3xl">
              Assistant AI is a premium AI automation agency that helps Australian businesses capture more leads, reduce missed calls, and automate customer communication.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                to="/Contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
              >
                Book Free Strategy Call
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white font-semibold rounded-full hover:bg-white/5 transition-all">
                <Play className="w-5 h-5" />
                See How It Works
              </button>
            </div>

            <div className="flex items-center gap-10 text-sm">
              <div>
                <p className="text-3xl font-bold text-white">500+</p>
                <p className="text-gray-500">Calls Daily</p>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div>
                <p className="text-3xl font-bold text-white">98%</p>
                <p className="text-gray-500">Satisfaction</p>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div>
                <p className="text-3xl font-bold text-white">24/7</p>
                <p className="text-gray-500">Available</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}