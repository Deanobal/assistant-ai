import * as React from 'react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const caseStudies = [
{
  industry: 'Trades & Services',
  company: 'Sample Client Scenario',
  logo: '🔧',
  challenge: 'Calls come in while the team is on-site, so new enquiries are easy to miss or follow up too late.',
  solution: 'AssistantAI.com.au answers the call, captures job details, and routes the next step into the business workflow automatically.',
  results: [
  'Faster first response',
  'Cleaner lead capture',
  'Better booking flow',
  'Less manual admin for the team']

},
{
  industry: 'Legal Services',
  company: 'Example Use Case',
  logo: '⚖️',
  challenge: 'Potential clients need a fast first response, but the team can be unavailable during meetings, court, or focused work.',
  solution: 'The AI handles initial contact, captures key information, and sends qualified enquiries into a more structured intake process.',
  results: [
  'More consistent first contact',
  'Improved enquiry qualification',
  'Better follow-up visibility',
  'Smoother handoff to staff']

},
{
  industry: 'Real Estate',
  company: 'Sample Outcome Example',
  logo: '🏡',
  challenge: 'Buyer and seller enquiries can arrive outside inspection times or while agents are already with clients.',
  solution: 'AssistantAI.com.au can capture enquiry details, support inspection booking, and help keep follow-up moving after the conversation.',
  results: [
  'After-hours enquiry coverage',
  'Faster inspection follow-up',
  'Better lead routing',
  'Cleaner CRM updates']

},
{
  industry: 'Medical & Dental',
  company: 'Sample Client Scenario',
  logo: '🦷',
  challenge: 'Front-desk teams can be stretched between appointments, patients, and incoming calls.',
  solution: 'The AI supports appointment flow, enquiry capture, and reminders so the team can stay focused on the people in front of them.',
  results: [
  'Better booking support',
  'Less front-desk admin',
  'Clearer enquiry capture',
  'Smoother patient communication']

}];


export default function CaseStudies() {
  return (
    <>
      <SEO
        title="Case Studies | AI Automation Use Cases & Outcomes | AssistantAI"
        description="Explore AssistantAI case studies and sample outcomes across trades, legal, real estate, medical, and other service businesses using AI automation."
        canonicalPath="/CaseStudies"
      />
      <div>
      <section className="relative py-24 md:py-32 bg-grid">
        <div className="bg-radial-glow absolute inset-0" />
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16">

            <p className="text-cyan-400 mb-3 text-lg font-medium">USE CASES</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Use Cases &{' '}
              <span className="text-gradient">Sample Outcomes</span>
            </h1>
            <p className="mt-5 text-gray-400 text-lg max-w-3xl mx-auto">
              These are example use cases and sample outcomes only. They show the types of business problems AssistantAI.com.au is designed to solve across calls, lead capture, booking, and follow-up.
            </p>
          </motion.div>

          <div className="space-y-12">
            {caseStudies.map((study, i) =>
            <motion.div
              key={`${study.industry}-${i}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}>

                <Card className="bg-[#12121a] border-white/5 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="grid lg:grid-cols-5 gap-8">
                      <div className="lg:col-span-3 p-8 md:p-10">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="text-4xl">{study.logo}</div>
                          <div>
                            <p className="text-cyan-400 mb-1 text-lg font-medium uppercase tracking-[0.2em]">{study.company}</p>
                            <h3 className="text-xl font-bold text-white">{study.industry}</h3>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                              The Challenge
                            </h4>
                            <p className="text-gray-400 leading-relaxed">{study.challenge}</p>
                          </div>

                          <div>
                            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                              Example Workflow
                            </h4>
                            <p className="text-gray-400 leading-relaxed">{study.solution}</p>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-2 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-8 md:p-10">
                        <div className="flex items-center gap-2 mb-6">
                          <TrendingUp className="w-5 h-5 text-cyan-400" />
                          <h4 className="text-white font-semibold">Example Outcome</h4>
                        </div>
                        <div className="space-y-3">
                          {study.results.map((result, idx) =>
                        <div key={idx} className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                              <p className="text-white font-medium">{result}</p>
                            </div>
                        )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16 p-10 rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/5 to-transparent">

            <h3 className="text-2xl font-bold text-white mb-3">Want to See What This Could Look Like in Your Business?</h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Book a free strategy call and we’ll map out the right workflow for your industry, team, and enquiry process.
            </p>
            <Link
              to="/BookStrategyCall"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all text-sm">

              Book Free Strategy Call
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
      </div>
    </>);

}