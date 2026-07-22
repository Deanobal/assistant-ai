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
    <section className="site-section border-y border-blue-200/[0.07]">
      <div className="site-container">
        <div className="site-section-head site-section-head-center">
          <p className="site-kicker">Industries and use cases</p>
          <h2>Built for the businesses where speed matters.</h2>
        </div>

        <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {industries.map((item) => (
            <article key={item.title} className="site-card min-h-[15rem] p-5 sm:p-6">
              <span className="site-icon">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="site-card-title mt-6">{item.title}</h3>
              <p className="site-card-copy mt-3">{item.desc}</p>
            </article>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <article className="site-card p-5 sm:p-7">
            <p className="site-kicker">Sample use case</p>
            <h3 className="site-card-title">Missed calls turn into paid clients</h3>
            <p className="site-card-copy mt-3">When the team is busy on-site, AssistantAI answers instantly, qualifies the lead, recommends a plan, and moves ready buyers toward secure signup.</p>
          </article>
          <article className="site-card p-5 sm:p-7">
            <p className="site-kicker">Example outcome</p>
            <h3 className="site-card-title">Secure signup starts setup</h3>
            <p className="site-card-copy mt-3">Once payment is complete, your setup details are prepared so we can start building your AI receptionist.</p>
          </article>
        </div>

        <div className="mt-8 text-center">
          <Link to="/CaseStudies" className="site-button-secondary">
            See more use cases
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
