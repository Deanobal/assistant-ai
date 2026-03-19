import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Eye } from 'lucide-react';
import OverviewPreview from '../components/portal/OverviewPreview';
import CallRecordings from '../components/dashboard/CallRecordings';
import BillingSection from '../components/dashboard/BillingSection';
import PortalIntegrations from '../components/dashboard/PortalIntegrations';

export default function Platform() {
  return (
    <div>
      <section className="relative py-24 md:py-28 bg-grid">
        <div className="bg-radial-glow absolute inset-0" />
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 mb-5">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 text-xs font-medium">Platform Preview</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-4xl mx-auto">
              See What Paying Clients Get with{' '}
              <span className="text-gradient">AssistantAI.com.au</span>
            </h1>
            <p className="mt-5 text-gray-400 text-lg max-w-3xl mx-auto">
              Explore a premium preview of the client experience, including call insights, billing, integrations, and performance visibility.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/BookStrategyCall"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
              >
                Book Free Strategy Call
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/ClientLogin"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-white/10 text-white font-medium rounded-full hover:bg-white/5 transition-all"
              >
                Client Login
              </Link>
            </div>
            <p className="mt-4 text-gray-500 text-sm">This is a public preview of the platform experience, not the private login area.</p>
          </motion.div>

          <div className="space-y-12">
            <OverviewPreview />
            <CallRecordings />
            <BillingSection />
            <PortalIntegrations />
          </div>
        </div>
      </section>
    </div>
  );
}