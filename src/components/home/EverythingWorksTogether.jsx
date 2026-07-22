import { TimerReset, TrendingUp, ClipboardMinus, Smile, Users2, Database } from 'lucide-react';

const outcomes = [
  { icon: TimerReset, title: 'Qualify Leads While They Are Live', desc: 'Ask the right questions while buyer intent is still fresh.' },
  { icon: TrendingUp, title: 'Turn Enquiries Into Paid Clients', desc: 'Guide standard Starter and Growth buyers from enquiry to secure checkout.' },
  { icon: ClipboardMinus, title: 'Reduce Admin Workload', desc: 'Remove repetitive call handling, manual follow-up, and customer chasing.' },
  { icon: Smile, title: 'Improve Customer Experience', desc: 'Give ready customers a clear next step instead of leaving them waiting.' },
  { icon: Users2, title: 'Do Not Let Hot Buyers Cool Down', desc: 'Move qualified prospects toward signup while they are ready to proceed.' },
  { icon: Database, title: 'Start Setup Faster', desc: 'Once payment is complete, your setup details are prepared so work can begin.' },
];

export default function EverythingWorksTogether() {
  return (
    <section className="site-section">
      <div className="site-container">
        <div className="site-section-head site-section-head-center">
          <p className="site-kicker">Why it matters</p>
          <h2>This is a revenue system, not just a receptionist.</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {outcomes.map((item) => (
            <article key={item.title} className="site-card min-h-[14rem] p-5 sm:p-6">
              <span className="site-icon">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="site-card-title mt-6">{item.title}</h3>
              <p className="site-card-copy mt-3">{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
