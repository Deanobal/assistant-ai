import { TimerReset, TrendingUp, ClipboardMinus, Smile, Users2, Database } from 'lucide-react';

const outcomes = [
  { icon: TimerReset, title: 'Qualify Leads While They Are Live', desc: 'Ask the right questions while buyer intent is still fresh.' },
  { icon: TrendingUp, title: 'Turn Enquiries Into Paid Clients', desc: 'Guide standard Starter and Growth buyers from enquiry to secure checkout.' },
  { icon: ClipboardMinus, title: 'Reduce Admin Workload', desc: 'Remove repetitive call handling, data entry, payment handoff, and follow-up tasks.' },
  { icon: Smile, title: 'Improve Customer Experience', desc: 'Give ready customers a clear next step instead of leaving them waiting.' },
  { icon: Users2, title: 'Do Not Let Hot Buyers Cool Down', desc: 'Move qualified prospects toward signup while they are ready to proceed.' },
  { icon: Database, title: 'Start Onboarding Automatically', desc: 'After payment, create the records and tasks your team needs to begin setup.' },
];

export default function EverythingWorksTogether() {
  return (
    <section className="relative py-18 md:py-24 bg-[#0c0c14]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-cyan-400 mb-3 text-lg font-medium">WHY IT MATTERS</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">This is a revenue system, not just a receptionist.</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {outcomes.map((item, index) => (
            <div
              key={item.title}
              className="p-6 rounded-2xl border border-white/5 bg-[#12121a]"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-400 text-base leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}