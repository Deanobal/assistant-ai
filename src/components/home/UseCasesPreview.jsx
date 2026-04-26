import { Link } from 'react-router-dom';
import { Wrench, HeartPulse, Building2, Briefcase, ArrowRight } from 'lucide-react';

const industries = [
  { icon: Wrench, title: 'Trades', desc: 'Capture urgent jobs, quote requests, and after-hours enquiries faster.' },
  { icon: HeartPulse, title: 'Clinics', desc: 'Handle appointments, reschedules, and patient enquiries with less front-desk pressure.' },
  { icon: Building2, title: 'Real Estate', desc: 'Respond quickly to listings, rental enquiries, and high-intent buyer calls.' },
  { icon: Briefcase, title: 'Professional Services', desc: 'Make sure valuable new business enquiries get answered and followed up properly.' },
];

export default function UseCasesPreview() {
  return (
    <section className="relative py-16 md:py-20 bg-[#0c0c14]">
      <div className="bg-radial-glow absolute inset-0" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-cyan-400 mb-3 text-lg font-medium">INDUSTRIES / USE CASES</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Built for the Businesses Where Speed Matters</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {industries.map((item, index) => (
            <div
              key={item.title}
              className="p-6 rounded-2xl border border-white/5 bg-[#12121a]"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-[28px] border border-white/5 bg-white/[0.03] p-6 md:p-7">
            <p className="text-cyan-400 text-sm font-medium uppercase tracking-[0.18em] mb-3">Sample Use Case</p>
            <h3 className="text-white text-xl font-semibold mb-3">Missed Calls Turn Into Booked Work</h3>
            <p className="text-gray-400 leading-relaxed">When the team is busy on-site, AssistantAI answers instantly, qualifies the lead, and books the next step instead of letting the enquiry go cold.</p>
          </div>
          <div className="rounded-[28px] border border-white/5 bg-white/[0.03] p-6 md:p-7">
            <p className="text-cyan-400 text-sm font-medium uppercase tracking-[0.18em] mb-3">Example Outcome</p>
            <h3 className="text-white text-xl font-semibold mb-3">Follow-Up Stops Falling Through the Cracks</h3>
            <p className="text-gray-400 leading-relaxed">Customer details, call context, and next actions move into the workflow automatically so your team can respond faster and more consistently.</p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link to="/CaseStudies" className="text-cyan-400 text-base font-medium inline-flex items-center gap-2 hover:text-cyan-300 transition-colors">
            See More Use Cases <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}