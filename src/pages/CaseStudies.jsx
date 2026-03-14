import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const caseStudies = [
  {
    industry: 'Trades & Services',
    company: 'Melbourne Plumbing Solutions',
    logo: '🔧',
    challenge: 'Missing 40% of calls while technicians were on-site, losing approximately $15K/month in potential bookings.',
    solution: 'Deployed AI receptionist to handle all incoming calls, qualify leads, and book appointments directly into their calendar system.',
    results: [
      '95% of calls now answered instantly',
      '$42K additional monthly revenue captured',
      '280% ROI in first 3 months',
      'Zero missed emergency calls',
    ],
    testimonial: {
      quote: "We were losing jobs every single day because we couldn't answer the phone while we were under a sink. Now our AI picks up every call, books the jobs, and our calendar stays full. Best business decision we've made.",
      author: 'Mark Stevens',
      role: 'Owner, Melbourne Plumbing Solutions',
    },
  },
  {
    industry: 'Legal Services',
    company: 'Harrison & Associates Law',
    logo: '⚖️',
    challenge: 'Reception staff overwhelmed during court hours, potential clients hanging up after long hold times, losing high-value cases.',
    solution: 'AI assistant handling initial consultations, screening cases, scheduling appointments, and routing urgent matters to appropriate attorneys.',
    results: [
      '100% call answer rate achieved',
      '18 additional cases/month',
      'Average case value: $8,500',
      '$153K additional annual revenue',
    ],
    testimonial: {
      quote: "Our AI doesn't just answer calls—it qualifies leads better than our previous receptionist. We're only spending time on cases that fit our practice, and we haven't missed a potential client since launch.",
      author: 'Jennifer Harrison',
      role: 'Senior Partner, Harrison & Associates',
    },
  },
  {
    industry: 'Real Estate',
    company: 'Bayside Property Group',
    logo: '🏡',
    challenge: 'Agents constantly at inspections and unable to respond to new enquiries. Missing buyers during peak weekend periods.',
    solution: 'AI agent handling property enquiries, scheduling inspections, qualifying buyers, and providing instant property information 24/7.',
    results: [
      '340+ extra inspections booked/month',
      '24/7 property information service',
      '67% increase in qualified leads',
      '5 additional sales/month attributed to AI',
    ],
    testimonial: {
      quote: "Saturday mornings used to be chaos—buyers calling while we're running inspections. Now our AI handles everything seamlessly. We're booking more inspections and closing more sales.",
      author: 'David Chen',
      role: 'Principal Agent, Bayside Property Group',
    },
  },
  {
    industry: 'Medical & Dental',
    company: 'Brighton Dental Clinic',
    logo: '🦷',
    challenge: 'Front desk staff juggling walk-ins and phones, long patient wait times, appointment no-shows, after-hours emergencies going to voicemail.',
    solution: 'AI receptionist managing appointment bookings, sending reminders, handling patient FAQs, and triaging after-hours emergency calls.',
    results: [
      '45% reduction in no-shows',
      '120+ additional appointments/month',
      'After-hours enquiries captured',
      '$28K extra monthly revenue',
    ],
    testimonial: {
      quote: "Our patients love the instant response. They can book appointments at 10pm if they want. And our staff can focus on patient care instead of answering the same questions all day.",
      author: 'Dr. Sarah Mitchell',
      role: 'Practice Owner, Brighton Dental Clinic',
    },
  },
];

export default function CaseStudies() {
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
            <p className="text-cyan-400 text-sm font-medium mb-3">SUCCESS STORIES</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Real Businesses.{' '}
              <span className="text-gradient">Real Results.</span>
            </h1>
            <p className="mt-5 text-gray-400 text-lg max-w-2xl mx-auto">
              See how Australian businesses are using Assistant AI to capture more revenue, improve customer experience, and scale without hiring.
            </p>
          </motion.div>

          <div className="space-y-12">
            {caseStudies.map((study, i) => (
              <motion.div
                key={study.company}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-[#12121a] border-white/5 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="grid lg:grid-cols-5 gap-8">
                      <div className="lg:col-span-3 p-8 md:p-10">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="text-4xl">{study.logo}</div>
                          <div>
                            <h3 className="text-xl font-bold text-white">{study.company}</h3>
                            <p className="text-cyan-400 text-sm">{study.industry}</p>
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
                              The Solution
                            </h4>
                            <p className="text-gray-400 leading-relaxed">{study.solution}</p>
                          </div>

                          <div className="p-5 rounded-xl bg-[#0a0a0f] border border-cyan-500/20">
                            <p className="text-gray-400 italic leading-relaxed mb-3">"{study.testimonial.quote}"</p>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                                <span className="text-cyan-400 font-bold">{study.testimonial.author[0]}</span>
                              </div>
                              <div>
                                <p className="text-white text-sm font-medium">{study.testimonial.author}</p>
                                <p className="text-gray-500 text-xs">{study.testimonial.role}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-2 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-8 md:p-10">
                        <div className="flex items-center gap-2 mb-6">
                          <TrendingUp className="w-5 h-5 text-cyan-400" />
                          <h4 className="text-white font-semibold">Measurable Results</h4>
                        </div>
                        <div className="space-y-3">
                          {study.results.map((result, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                              <p className="text-white font-medium">{result}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16 p-10 rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/5 to-transparent"
          >
            <h3 className="text-2xl font-bold text-white mb-3">Ready to Be Our Next Success Story?</h3>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">
              Book a free strategy call and discover how we can help you achieve similar results.
            </p>
            <Link
              to="/Contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all text-sm"
            >
              Book Your Free Strategy Call
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}