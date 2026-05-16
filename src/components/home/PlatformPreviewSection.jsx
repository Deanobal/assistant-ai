import { Link } from 'react-router-dom';
import { ArrowRight, PhoneCall, Users, CalendarCheck2, Send, ClipboardCheck } from 'lucide-react';

const previewItems = [
{ icon: PhoneCall, label: 'Calls Handled', value: 'Tracked', helper: 'Every call tracked in one place' },
{ icon: Users, label: 'Enquiries Qualified', value: 'Clear', helper: 'See which leads are ready to move forward' },
{ icon: CalendarCheck2, label: 'Secure Signup', value: 'Ready', helper: 'Starter and Growth buyers can start through secure checkout' },
{ icon: Send, label: 'Follow-Up', value: 'Fast', helper: 'SMS and email actions help keep leads warm' },
{ icon: ClipboardCheck, label: 'Setup Progress', value: 'Visible', helper: 'Track what is happening after a client signs up' }];


export default function PlatformPreviewSection() {
  return (
    <section className="relative py-18 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-cyan-400 mb-3 text-lg font-medium">EXAMPLE PLATFORM PREVIEW</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">See How Every Enquiry Is Handled</h2>
          <p className="mt-4 text-gray-400 max-w-3xl mx-auto text-lg">AssistantAI gives you visibility over calls, enquiries, follow-up, and setup progress.

          </p>
        </div>

        <div className="rounded-[32px] border border-white/5 bg-[#12121a] p-6 md:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
          <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
            <div>
              <p className="text-white font-semibold text-lg">AssistantAI Example Platform Preview</p>
              <p className="text-gray-500 mt-1 text-base">A simple view of how calls, enquiries, follow-up, and setup progress can stay organised.</p>
            </div>
            <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">
              Example Platform Preview
            </div>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
            {previewItems.map((item) =>
            <div key={item.label} className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <p className="text-gray-500 text-base">{item.label}</p>
                <p className="text-2xl font-semibold text-white mt-2">{item.value}</p>
                <p className="text-gray-400 mt-2 leading-relaxed text-base">{item.helper}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link to="/Platform" className="inline-flex items-center gap-2 text-cyan-400 text-base font-medium hover:text-cyan-300 transition-colors">
            View Platform Preview <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>);

}