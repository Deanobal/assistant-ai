import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, PhoneCall, CalendarCheck2, Database } from 'lucide-react';

const useCases = [
{
  icon: PhoneCall,
  label: 'Use Case',
  title: 'Trades: Fewer Missed Leads',
  desc: 'Answer urgent calls while the team is on-site, capture job details, and move the enquiry into the workflow instantly.',
  outcome: 'Sample outcome: faster response times and fewer missed opportunities.'
},
{
  icon: CalendarCheck2,
  label: 'Example Client Scenario',
  title: 'Clinics: Faster Booking Flow',
  desc: 'Handle bookings, reschedules, and common questions automatically so staff can stay focused on patients and front-desk flow.',
  outcome: 'Sample outcome: smoother appointment handling and less admin pressure.'
},
{
  icon: Database,
  label: 'Sample Outcome',
  title: 'Service Businesses: Better Follow-Up',
  desc: 'Capture customer details, sync data into the CRM, and trigger follow-up messages after every enquiry without manual data entry.',
  outcome: 'Sample outcome: cleaner systems and more reliable lead follow-up.'
}];


export default function UseCasesPreview() {
  return (
    <section className="relative py-16 md:py-20 bg-[#0c0c14]">
      <div className="bg-radial-glow absolute inset-0" />
      <div className="relative max-w-7xl mx-auto px-6">
...
          className="text-center mb-12">

          <p className="text-cyan-400 mb-3 text-lg font-medium">PROOF</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Use Cases & Sample Outcomes</h2>
          <p className="mt-4 text-gray-400 max-w-3xl mx-auto">
            See how AssistantAI.com.au is designed to support common business workflows across lead capture, bookings, and follow-up.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {useCases.map((item, index) =>
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            className="p-7 rounded-2xl border border-white/5 bg-[#12121a]">

              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5 text-cyan-400" />
              </div>
              <p className="text-cyan-400 mb-3 text-sm font-medium uppercase tracking-[0.2em]">{item.label}</p>
              <h3 className="text-white font-semibold text-xl mb-3">{item.title}</h3>
              <p className="text-gray-400 mb-4 text-lg leading-relaxed">{item.desc}</p>
              <p className="text-white/80 text-base">{item.outcome}</p>
            </motion.div>
          )}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/CaseStudies" className="text-cyan-400 text-base font-medium inline-flex items-center gap-2 hover:text-cyan-300 transition-colors">See More Use Cases



          </Link>
        </div>
      </div>
    </section>);

}