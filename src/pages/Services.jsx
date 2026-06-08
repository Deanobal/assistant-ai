import * as React from 'react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { Mic, UserCheck, CreditCard, ClipboardList, Rocket, ArrowRight } from 'lucide-react';
import VapiReceptionistDemoButton from '@/components/voice/VapiReceptionistDemoButton';
import HighIntentLinks from '@/components/seo/HighIntentLinks';

const services = [
  { icon: Mic, title: 'AI Receptionist', desc: 'Answers calls and captures enquiries 24/7.', outcomes: ['Instant call answering', 'After-hours coverage', 'Clear enquiry capture', 'Human handoff when needed'] },
  { icon: UserCheck, title: 'Enquiry Qualification', desc: 'Asks the right questions and identifies whether the buyer fits Starter, Growth, or Enterprise.', outcomes: ['Qualifies live enquiries', 'Identifies buying intent', 'Recommends plan fit', 'Escalates Enterprise for review'] },
  { icon: CreditCard, title: 'Secure Signup', desc: 'Guides ready Starter and Growth buyers toward secure checkout after confirmation.', outcomes: ['Secure checkout', 'Selected-plan pricing', 'No forced Growth default', 'Setup can begin after payment'] },
  { icon: ClipboardList, title: 'Follow-Up Support', desc: 'Helps keep customer details organised and supports fast SMS/email follow-up.', outcomes: ['Customer details stay organised', 'Clear next steps', 'SMS/email follow-up', 'Cleaner team visibility'] },
  { icon: Rocket, title: 'Setup Support', desc: 'Once payment is complete, your setup details are prepared so we can start building your AI receptionist.', outcomes: ['Setup details prepared', 'Build can begin', 'Team has the right information', 'Clear setup path'] },
];

export default function Services() {
  return (
    <>
      <SEO title="Services | AI Receptionist, Enquiry Qualification & Follow-Up | AssistantAI" description="AssistantAI answers calls, qualifies enquiries, supports fast follow-up, and helps ready customers begin secure signup." canonicalPath="/Services" />
      <div>
        <section className="relative py-24 md:py-32 bg-grid">
          <div className="bg-radial-glow absolute inset-0" />
          <div className="relative max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-cyan-400 mb-3 text-lg font-medium">SERVICES</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">A Revenue System, Not Just a Receptionist</h1>
              <p className="mt-5 text-gray-400 text-lg max-w-4xl mx-auto leading-relaxed">AssistantAI does more than answer the phone. It can qualify new enquiries, capture the details your team needs, support fast follow-up, and help ready Starter or Growth buyers start securely.</p>
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
                <VapiReceptionistDemoButton variant="secondary" className="min-h-0 px-8 py-3.5 text-sm" showFallbackText />
              </div>
            </div>
          </div>
        </section>
        <HighIntentLinks />
      </div>
    </>
  );
}