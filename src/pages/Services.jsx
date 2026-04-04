import * as React from 'react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { Mic, Headphones, MessageSquare, Database, CalendarCheck, Send, GitBranch, ArrowRight } from 'lucide-react';

const services = [
{
  icon: Mic,
  title: 'Instant Call Answering',
  desc: 'An AI assistant and AI receptionist built to answer calls instantly, capture intent, and move each enquiry toward the right next step.',
  outcomes: ['Answer inbound calls consistently', 'Cut response times by 80%', 'Transfer urgent calls to staff', 'Support after-hours workflows']
},
{
  icon: Headphones,
  title: 'Lead Capture',
  desc: 'Capture caller details, qualify opportunities, and create a more reliable front-end experience for Australian service businesses.',
  outcomes: ['Capture high-value leads automatically', 'Improve first response consistency', 'Reduce admin pressure on staff', 'Create a professional first impression']
},
{
  icon: CalendarCheck,
  title: 'Job Booking',
  desc: 'Let your AI automation system handle appointment and job booking workflows without back-and-forth admin.',
  outcomes: ['Book jobs and appointments faster', 'Sync with your calendar', 'Handle reschedules and cancellations', 'Support confirmations and reminders']
},
{
  icon: Send,
  title: 'Follow-Up Automation',
  desc: 'Automated SMS and email follow-up keeps new enquiries warm and ensures every customer gets a timely next step.',
  outcomes: ['Instant post-call follow-up', 'Confirmation messages', 'Reminder messages', 'Lead nurture workflows']
},
{
  icon: Database,
  title: 'CRM Sync',
  desc: 'Push every interaction into the right CRM or business system so your team has cleaner records and less manual admin.',
  outcomes: ['CRM integration for contacts and notes', 'Update lead records automatically', 'Track call outcomes', 'Reduce manual data entry']
},
{
  icon: MessageSquare,
  title: 'Website Lead Capture',
  desc: 'Website AI chat experiences answer questions, capture leads, and help prospects take action faster.',
  outcomes: ['24/7 website engagement', 'Instant lead capture', 'Pre-qualify enquiries', 'Guide visitors to book or enquire']
},
{
  icon: GitBranch,
  title: 'Service Business Automation',
  desc: 'Connect calls, bookings, CRM updates, and follow-up into one AI automation system for a smoother workflow.',
  outcomes: ['Connect key systems', 'Automate repetitive steps', 'Reduce admin by 65%', 'Save up to $30,000 per year']
}];


export default function Services() {
  return (
    <>
      <SEO
        title="Services | AI Assistant, AI Receptionist, Lead Capture & CRM Integration | AssistantAI"
        description="Explore AssistantAI services for Australian service businesses including instant call answering, lead capture, job booking, follow-up automation, CRM integration, and service business automation."
        canonicalPath="/Services"
      />
      <div>
      <section className="relative py-24 md:py-32 bg-grid">
        <div className="bg-radial-glow absolute inset-0" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">

            <p className="text-cyan-400 mb-3 text-lg font-medium">SERVICES</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              AI Assistant and AI Receptionist Services Built for <span className="text-gradient">Australian Service Businesses</span>
            </h1>
            <p className="mt-5 text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
              AssistantAI is an AI automation system for Australian cleaning, trades, property, and other service businesses focused on instant call answering, lead capture, job booking, follow-up automation, CRM integration, and measurable outcomes.
            </p>
          </div>

          <div className="space-y-8">
            {services.map((s, i) =>
            <div
              key={s.title}
              className="grid md:grid-cols-2 gap-10 p-8 md:p-12 rounded-2xl border border-white/5 bg-[#12121a] card-hover">

                <div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mb-5">
                    <s.icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{s.title}</h2>
                  <p className="text-gray-400 text-base md:text-lg leading-relaxed">{s.desc}</p>
                </div>
                <div>
                  <h4 className="text-white text-sm font-medium mb-4 uppercase tracking-[0.2em]">Key Outcomes</h4>
                  <ul className="space-y-4">
                    {s.outcomes.map((o) =>
                  <li key={o} className="flex items-start gap-3 text-gray-300 text-base leading-relaxed">
                        <div className="w-5 h-5 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0 mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        </div>
                        {o}
                      </li>
                  )}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="mt-20 text-center p-10 rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/5 to-transparent">

            <h3 className="text-2xl font-bold text-white mb-3">Not Sure Which Setup Fits Best?</h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Book a strategy call and we’ll recommend the right combination of voice AI, integrations, booking automation, and follow-up for your business.
            </p>
            <Link
              to="/BookStrategyCall"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all text-sm">

              Book Free Strategy Call
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>);

}