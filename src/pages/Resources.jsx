import { ArrowRight, ClipboardCheck, Gauge, PhoneCall, Workflow } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import HighIntentLinks from '@/components/seo/HighIntentLinks';
import {
  AccentText,
  ConversionCTA,
  PageHero,
  PageShell,
  Section,
  SectionHeading,
  premiumButtonSecondary,
} from '@/components/marketing/PremiumMarketing';

const resources = [
  {
    icon: ClipboardCheck,
    title: 'AI Receptionist Australia Buyer Checklist',
    description: 'A practical checklist for comparing providers by call flow, lead capture, integrations, escalation and reporting.',
    href: '/Blog/best-ai-receptionist-australia-checklist',
  },
  {
    icon: PhoneCall,
    title: 'Missed Call Revenue Leak Guide',
    description: 'A plain-English guide to assessing how missed calls and slow follow-up affect a service business.',
    href: '/Blog/missed-calls-losing-business',
  },
  {
    icon: Workflow,
    title: 'After-the-Call Workflow Guide',
    description: 'Why answering is only the first step, and how qualification, routing and follow-up connect.',
    href: '/Blog/what-happens-after-the-call',
  },
  {
    icon: Gauge,
    title: 'AI Receptionist ROI Guide',
    description: 'A grounded framework using enquiry volume, response time, admin effort and conversion assumptions.',
    href: '/Blog/measuring-roi-of-ai-receptionists',
  },
];

export default function Resources() {
  return (
    <>
      <SEO
        title="AI Receptionist Resources for Australian Service Businesses | AssistantAI"
        description="Practical guides for Australian service businesses evaluating AI reception, missed-call automation, booking and follow-up."
        canonicalPath="/Resources"
      />
      <PageShell>
        <PageHero
          title={<>Practical AI reception guides, <AccentText>without the hype.</AccentText></>}
          description="Use these resources to compare providers, understand workflow design and assess the real operational value of faster call handling and follow-up."
          secondaryTo="/Blog"
          secondaryLabel="Browse the Blog"
          visual="resources"
          visualData={{ items: resources }}
        />

        <Section id="page-content" className="bg-[#040b14]">
          <SectionHeading
            title="Start with the decision you need to make"
            description="Each guide is designed to help you evaluate a real business question, not chase a vague automation trend."
          />
          <div className="mt-10 grid gap-px overflow-hidden rounded-[16px] border border-[#26364d] bg-[#26364d] md:grid-cols-2">
            {resources.map(({ icon: Icon, title, description, href }) => (
              <Link key={title} to={href} className="group bg-[#07121f] p-6 transition hover:bg-[#091827] sm:p-8">
                <Icon className="h-6 w-6 text-[#4b8cff]" aria-hidden="true" />
                <h2 className="mt-6 max-w-md text-xl font-semibold text-white group-hover:text-[#dbe7ff]">{title}</h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-[#aab4c3]">{description}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#76a7ff]">
                  Read the guide
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-8">
            <Link to="/Blog" className={premiumButtonSecondary}>
              View all articles
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Section>

        <HighIntentLinks />
        <ConversionCTA
          title="Need an answer for your specific call flow?"
          description="Talk through your current process and see where an AI receptionist can create the clearest operational improvement."
          primaryTo="/BookStrategyCall"
          primaryLabel="Book a Strategy Call"
        />
      </PageShell>
    </>
  );
}
