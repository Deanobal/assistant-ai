import { Link } from 'react-router-dom';
import { ArrowRight, PhoneCall, Users, CalendarCheck2, Send, PlugZap } from 'lucide-react';

const previewItems = [
  { icon: PhoneCall, label: 'Calls Handled', value: 'Live', helper: 'Every call tracked in one place' },
  { icon: Users, label: 'Leads Captured', value: 'Tracked', helper: 'Qualified enquiries logged automatically' },
  { icon: CalendarCheck2, label: 'Appointments Booked', value: 'Synced', helper: 'Bookings aligned with availability' },
  { icon: Send, label: 'Follow-Up Status', value: 'Automated', helper: 'SMS and email actions triggered fast' },
  { icon: PlugZap, label: 'Integrations Connected', value: 'Active', helper: 'CRM, calendar, and workflow visibility' },
];

export default function PlatformPreviewSection() {
  return (
    <section className="relative py-18 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-cyan-400 mb-3 text-lg font-medium">PLATFORM PREVIEW</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">See the Operating Layer Behind the Calls</h2>
          <p className="mt-4 text-gray-400 max-w-3xl mx-auto">
            AssistantAI gives you a cleaner view of calls handled, leads captured, appointments booked, follow-up status, and integrations connected.
          </p>
        </div>

        <div className="rounded-[32px] border border-white/5 bg-[#12121a] p-6 md:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
          <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
            <div>
              <p className="text-white font-semibold text-lg">AssistantAI Platform Preview</p>
              <p className="text-sm text-gray-500 mt-1">A premium internal view across enquiries, bookings, and connected systems.</p>
            </div>
            <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">
              Sample Preview
            </div>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
            {previewItems.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="text-2xl font-semibold text-white mt-2">{item.value}</p>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed">{item.helper}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link to="/Platform" className="inline-flex items-center gap-2 text-cyan-400 text-base font-medium hover:text-cyan-300 transition-colors">
            View Platform Preview <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}