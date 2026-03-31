import * as React from 'react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { Mic, Headphones, MessageSquare, Database, CalendarCheck, Send, GitBranch, ArrowRight } from 'lucide-react';

const services = [
{
  icon: Mic,
  title: 'AI Voice Agents',
  desc: 'AI voice agents designed to answer calls naturally, capture intent, and move the conversation toward the right next step.',
  outcomes: ['Answer inbound calls consistently', 'Qualify leads in real time', 'Transfer urgent calls to staff', 'Support after-hours workflows']
},
{
  icon: Headphones,
  title: 'AI Receptionists',
  desc: 'A premium front-end call experience that greets callers professionally, routes enquiries, and keeps your team focused.',
  outcomes: ['Professional first impression', 'Route calls to the right person', 'Capture caller details automatically', 'Reduce admin pressure on staff']
},
{
  icon: MessageSquare,
  title: 'AI Chatbots',
  desc: 'Website chat experiences that answer questions, capture leads, and help prospects take action faster.',
  outcomes: ['24/7 website engagement', 'Instant lead capture', 'Pre-qualify enquiries', 'Guide visitors to book or enquire']
},
{
  icon: Database,
  title: 'CRM Automation',
  desc: 'Every interaction can be pushed into the right system so your team has cleaner records and less manual admin.',
  outcomes: ['Sync contacts and notes', 'Update lead records automatically', 'Track call outcomes', 'Reduce manual data entry']
},
{
  icon: CalendarCheck,
  title: 'Appointment Booking Automation',
  desc: 'Let AI check availability, book appointments, and keep your calendar workflow moving without back-and-forth admin.',
  outcomes: ['Sync with your calendar', 'Book and confirm appointments', 'Handle reschedules and cancellations', 'Support reminders and confirmations']
},
{
  icon: Send,
  title: 'SMS & Email Follow-Up',
  desc: 'Automated follow-up that keeps new enquiries warm and makes sure every customer gets a timely next step.',
  outcomes: ['Instant post-call follow-up', 'Confirmation messages', 'Reminder messages', 'Lead nurture workflows']
},
{
  icon: GitBranch,
  title: 'Workflow Automation',
  desc: 'Connect your core business tools so calls, bookings, updates, and follow-up all happen in one smoother process.',
  outcomes: ['Connect key systems', 'Automate repetitive steps', 'Trigger actions across workflows', 'Create cleaner internal handoffs']
}];


export default function Services() {
  return (
    <>
      <SEO
        title="Services | AI Voice Agents, Receptionists & Automation | AssistantAI"
        description="Explore AssistantAI services including AI voice agents, AI receptionists, chatbots, CRM automation, booking automation, follow-up, and workflow integrations."
        canonicalPath="/Services"
      />
      <div>
      <section className="relative py-24 md:py-32 bg-grid">
        <div className="bg-radial-glow absolute inset-0" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">

            <p className="text-cyan-400 mb-3 text-lg font-medium">SERVICES</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Productised Services Built to <span className="text-gradient">Answer More Calls and Capture More Leads</span>
            </h1>
            <p className="mt-5 text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
              AssistantAI.com.au helps Australian service businesses reduce admin, automate follow-up, improve response time, and scale without hiring more staff.
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