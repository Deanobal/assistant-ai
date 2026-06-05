import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ClipboardCheck, Gauge, Link as LinkIcon, PhoneCall, Workflow } from 'lucide-react';

const resources = [
  {
    icon: ClipboardCheck,
    title: 'AI Receptionist Australia Buyer Checklist',
    description: 'A practical checklist for comparing AI receptionist providers by lead capture, workflow depth, CRM integration, escalation, and reporting.',
    href: '/Blog/best-ai-receptionist-australia-checklist',
  },
  {
    icon: PhoneCall,
    title: 'Missed Call Revenue Leak Guide',
    description: 'A plain-English guide to calculating how missed calls, slow response, and poor follow-up can leak revenue from service businesses.',
    href: '/Blog/missed-calls-losing-business',
  },
  {
    icon: Workflow,
    title: 'After-the-Call Workflow Guide',
    description: 'Shows why call answering alone is not enough and how better systems qualify, route, update CRM, and follow up.',
    href: '/Blog/what-happens-after-the-call',
  },
  {
    icon: Gauge,
    title: 'AI Receptionist ROI Guide',
    description: 'A safer ROI framework using missed enquiries, average job value, response speed, admin time, and conversion rate.',
    href: '/Blog/measuring-roi-of-ai-receptionists',
  },
];

const outreachTargets = [
  'Australian service-business blogs and trade publications',
  'Small business technology roundups',
  'Local chamber and business directory profiles',
  'Podcast guest pages for trades, automation, and SMB growth',
  'Partner pages from CRM, booking, web design, and marketing agencies',
  'Supplier/resource pages for cleaning, trades, clinics, property, and professional services',
];

const linkAngles = [
  'Missed-call revenue leakage for Australian service businesses',
  'AI receptionist buyer checklist for 2026',
  'AI receptionist vs virtual receptionist comparison',
  'How CRM follow-up turns call answering into a revenue workflow',
  'Practical AI implementation checklist for small service businesses',
];

export default function Resources() {
  return (
    <>
      <SEO
        title="AI Receptionist Resources for Australian Service Businesses | AssistantAI"
        description="Free AssistantAI resources for Australian service businesses comparing AI receptionists, missed-call automation, CRM follow-up, booking workflows, and ROI."
        canonicalPath="/Resources"
      />
      <section className="relative overflow-hidden bg-[#070912] py-24 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(34,211,238,0.12),transparent_30%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_75%,rgba(59,130,246,0.10),transparent_32%)]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">AssistantAI Resources</p>
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
              AI receptionist guides worth linking to.
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              Practical resources for Australian service businesses comparing AI call answering, lead capture, CRM follow-up, booking automation, and revenue workflow systems.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/AIDemo" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-6 font-semibold text-white transition hover:shadow-lg hover:shadow-cyan-500/20">
                Talk to Our AI Receptionist
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/Blog" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 px-6 font-semibold text-white transition hover:bg-white/5">
                View all articles
              </Link>
            </div>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2">
            {resources.map((resource) => (
              <Link key={resource.title} to={resource.href} className="group rounded-[28px] border border-white/8 bg-white/[0.035] p-6 transition hover:border-cyan-400/35 hover:bg-white/[0.055]">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                    <resource.icon className="h-5 w-5 text-cyan-300" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white group-hover:text-cyan-100">{resource.title}</h2>
                    <p className="mt-3 text-base leading-7 text-slate-400">{resource.description}</p>
                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">
                      Read resource
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[28px] border border-white/8 bg-[#10131f] p-7 md:p-8">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10">
                  <LinkIcon className="h-5 w-5 text-cyan-300" />
                </div>
                <h2 className="text-2xl font-bold text-white">Best backlink outreach targets</h2>
              </div>
              <div className="space-y-3">
                {outreachTargets.map((target) => (
                  <div key={target} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.025] p-4 text-slate-300">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                    <span>{target}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-[#10131f] p-7 md:p-8">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-400/10">
                  <Workflow className="h-5 w-5 text-blue-300" />
                </div>
                <h2 className="text-2xl font-bold text-white">Angles publishers can reference</h2>
              </div>
              <div className="space-y-3">
                {linkAngles.map((angle) => (
                  <div key={angle} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.025] p-4 text-slate-300">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-300" />
                    <span>{angle}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-16 rounded-[28px] border border-cyan-400/15 bg-cyan-400/[0.06] p-7 text-center md:p-10">
            <h2 className="text-2xl font-bold text-white md:text-3xl">Want to reference AssistantAI?</h2>
            <p className="mx-auto mt-3 max-w-3xl text-base leading-7 text-slate-300">
              AssistantAI helps Australian service businesses answer calls, qualify enquiries, capture leads, update systems, and follow up faster. For quotes, interviews, or partnership content, contact sales@assistantai.com.au.
            </p>
            <div className="mt-6">
              <Link to="/Contact" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 font-semibold text-[#070912] transition hover:bg-cyan-50">
                Contact AssistantAI
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
