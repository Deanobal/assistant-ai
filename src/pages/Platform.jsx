import React from 'react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import OverviewPreview from '../components/portal/OverviewPreview';
import CallRecordings from '../components/dashboard/CallRecordings';
import AnalyticsSection from '../components/dashboard/AnalyticsSection';
import BillingSection from '../components/dashboard/BillingSection';
import PortalIntegrations from '../components/dashboard/PortalIntegrations';
import SupportSection from '../components/dashboard/SupportSection';

export default function Platform() {
  return (
    <>
      <SEO
        title="Platform | AI Automation System Dashboard for Service Businesses | AssistantAI"
        description="Preview the AssistantAI platform for Australian service businesses including lead capture, job booking, CRM integration, analytics, billing, and support workflows."
        canonicalPath="/Platform"
      />
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
              Public Preview of the <span className="text-gradient">AssistantAI AI Automation System</span>
            </h1>
            <p className="mt-5 text-gray-400 text-lg max-w-3xl mx-auto">
              See what the client experience looks like across instant call answering, lead capture, job booking, CRM integration, analytics, billing, and support for Australian service businesses.
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
            <p className="mt-4 text-gray-500 text-sm">This is a public preview only. All data shown here is sample data and not real client performance.</p>
          </motion.div>

          <div className="mb-12">
            <Card className="bg-[#12121a] border-white/5">
              <CardContent className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <p className="text-white font-semibold">Portal Preview</p>
                  <p className="text-sm text-gray-400 mt-1">All sections below are sample previews only, designed to show the software and client experience clearly.</p>
                </div>
                <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300 w-fit">
                  Sample Data Preview
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-12">
            <OverviewPreview />
            <CallRecordings />
            <AnalyticsSection mode="sample" />
            <BillingSection mode="sample" />
            <PortalIntegrations mode="sample" />
            <SupportSection />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center p-10 rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/5 to-transparent"
          >
            <h3 className="text-2xl font-bold text-white mb-3">Want This Experience for Your Business?</h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Book a free strategy call and we’ll show you how AssistantAI can help your business answer more calls, capture more leads, and reduce admin.
            </p>
            <Link
              to="/BookStrategyCall"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all text-sm"
            >
              Book Free Strategy Call
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
    </>
  );
}