import * as React from 'react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { Mic, UserCheck, CreditCard, Database, Workflow, ArrowRight } from 'lucide-react';

const services = [
  { icon: Mic, title: 'AI Receptionist', desc: 'Answers calls and captures enquiries 24/7.', outcomes: ['Instant call answering', 'After-hours coverage', 'Structured enquiry capture', 'Human handoff when needed'] },
  { icon: UserCheck, title: 'AI Sales Qualifier', desc: 'Asks the right questions and identifies whether the buyer fits Starter, Growth, or Enterprise.', outcomes: ['Qualifies live enquiries', 'Identifies buying intent', 'Recommends plan fit', 'Escalates Enterprise for review'] },
  { icon: CreditCard, title: 'Secure Payment Flow', desc: 'Creates Stripe checkout for ready Starter and Growth buyers and starts onboarding after confirmed payment.', outcomes: ['Secure checkout links', 'Selected-plan pricing', 'No forced Growth default', 'Payment confirmed by Stripe'] },
  { icon: Database, title: 'CRM + Follow-Up Automation', desc: 'Syncs lead data, triggers SMS/email follow-up, and updates the sales pipeline.', outcomes: ['GoHighLevel sync', 'Pipeline updates', 'SMS/email follow-up', 'Cleaner team visibility'] },
  { icon: Workflow, title: 'Onboarding Automation', desc: 'After payment, creates the client record, billing status, intake form, integrations, notes, and onboarding tasks.', outcomes: ['Client record created', 'Billing activated', 'Intake form prepared', 'Tasks generated automatically'] },
];

export default function Services() {
  return (
    <>
      <SEO title="Services | AI Receptionist, Sales Qualification & Payment Automation | AssistantAI" description="AssistantAI answers calls, qualifies buyers, creates secure checkout for ready customers, syncs CRM data, and starts onboarding after payment." canonicalPath="/Services" />
      <div>
        <section className="relative py-24 md:py-32 bg-grid">
          <div className="bg-radial-glow absolute inset-0" />
          <div className="relative max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-cyan-400 mb-3 text-lg font-medium">SERVICES</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">A Revenue System, Not Just a Receptionist</h1>
              <p className="mt-5 text-gray-400 text-lg max-w-4xl mx-auto leading-relaxed">AssistantAI does more than answer the phone. It can qualify prospects, capture structured lead data, update your CRM, send follow-up, take payment for standard plans, and trigger onboarding workflows.</p>
            </div>

            <div className="space-y-8">
              {services.map((service) => (
                <div key={service.title} className="grid gap-8 rounded-2xl border border-white/5 bg-[#12121a] p-8 md:grid-cols-2 md:p-12 card-hover">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mb-5"><service.icon className="w-6 h-6 text-cyan-400" /></div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{service.title}</h2>
                    <p className="text-gray-400 text-base md:text-lg leading-relaxed">{service.desc}</p>
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-medium mb-4 uppercase tracking-[0.2em]">Key outcomes</h4>
                    <ul className="space-y-4">{service.outcomes.map((outcome) => <li key={outcome} className="flex items-start gap-3 text-gray-300 text-base leading-relaxed"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-cyan-400" />{outcome}</li>)}</ul>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-20 text-center p-10 rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/5 to-transparent">
              <h3 className="text-2xl font-bold text-white mb-3">Ready to Turn Enquiries Into Paid Clients?</h3>
              <p className="text-gray-400 mb-6 max-w-2xl mx-auto">Choose your plan, confirm your details, and proceed to secure checkout when you are ready.</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link to="/GetStartedNow" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all text-sm">Get Started Now <ArrowRight className="w-4 h-4" /></Link>
                <a href="/#live-demo" className="inline-flex items-center justify-center px-8 py-3.5 border border-white/10 text-white font-medium rounded-full hover:bg-white/5 transition-all text-sm">Talk to the AI Receptionist</a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}