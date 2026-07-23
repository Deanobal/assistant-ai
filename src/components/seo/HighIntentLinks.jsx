import { Link } from 'react-router-dom';
import { ArrowRight, Bot, BriefcaseBusiness, Building2, CalendarCheck, Gavel, MessageSquareText, PhoneCall, ShieldCheck, Sparkles, Target, Wrench } from 'lucide-react';

const highIntentLinks = [
  {
    title: 'AI Assistant Australia',
    description: 'Connect calls, lead capture, booking support and follow-up in one practical business workflow.',
    href: '/ai-assistant-australia',
    icon: Bot,
  },
  {
    title: 'AI Receptionist Australia',
    description: 'Explore 24/7 call answering, enquiry capture and escalation for Australian service businesses.',
    href: '/ai-receptionist-australia',
    icon: PhoneCall,
  },
  {
    title: 'AI Phone Assistant for Small Business',
    description: 'Give a small team reliable call coverage, structured details and clearer follow-up.',
    href: '/ai-phone-assistant-small-business',
    icon: Bot,
  },
  {
    title: 'Missed Call Automation Australia',
    description: 'Recover valuable enquiries when your team cannot answer immediately.',
    href: '/missed-call-automation-australia',
    icon: Target,
  },
  {
    title: 'AI Lead Follow-Up Automation',
    description: 'Move qualified enquiries into faster SMS, email and human follow-up.',
    href: '/ai-lead-follow-up-automation',
    icon: MessageSquareText,
  },
  {
    title: 'AI Appointment Booking Assistant',
    description: 'Capture service, timing and contact details before the booking handoff.',
    href: '/ai-appointment-booking-assistant',
    icon: CalendarCheck,
  },
  {
    title: 'AI Receptionist for Trades',
    description: 'Capture jobs while plumbers, electricians and other field-service teams stay on the tools.',
    href: '/ai-receptionist-for-trades',
    icon: ShieldCheck,
  },
  {
    title: 'AI Receptionist for Clinics',
    description: 'Support appointment enquiries while keeping sensitive decisions with clinic staff.',
    href: '/ai-receptionist-for-clinics',
    icon: CalendarCheck,
  },
  {
    title: 'AI Receptionist for Real Estate',
    description: 'Capture buyer, seller, rental, appraisal, and property management enquiries before they go cold.',
    href: '/ai-receptionist-for-real-estate',
    icon: Building2,
  },
  {
    title: 'AI Receptionist for Cleaning Companies',
    description: 'Capture cleaning quote requests, service frequency, site details, and recurring contract opportunities.',
    href: '/ai-receptionist-for-cleaning-companies',
    icon: Sparkles,
  },
  {
    title: 'AI Receptionist for Law Firms',
    description: 'Support careful intake capture, matter routing, and human review for professional service enquiries.',
    href: '/ai-receptionist-for-law-firms',
    icon: Gavel,
  },
  {
    title: 'AI Receptionist for Property Maintenance',
    description: 'Triage maintenance requests, capture property details, identify urgency, and route jobs faster.',
    href: '/ai-receptionist-for-property-maintenance',
    icon: Wrench,
  },
  {
    title: 'AI Receptionist for Professional Services',
    description: 'Give consultants, advisers and service firms a more consistent first response.',
    href: '/Services',
    icon: BriefcaseBusiness,
  },
];

export default function HighIntentLinks({ compact = false }) {
  return (
    <section className={`relative border-y border-[#152238] bg-[#040b14] ${compact ? 'py-14 md:py-16' : 'py-16 md:py-24'}`}>
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-16">
        <div className="max-w-3xl">
          <h2 className="text-balance text-3xl font-[700] tracking-[-0.04em] text-white md:text-4xl">Find the workflow that fits your business</h2>
          <p className="mt-5 text-base leading-7 text-[#aab4c3]">
            Explore the call-handling, follow-up and industry scenarios AssistantAI can be configured to support.
          </p>
        </div>

        <div className="mt-10 grid gap-px overflow-hidden rounded-[16px] border border-[#26364d] bg-[#26364d] md:grid-cols-2 xl:grid-cols-3">
          {highIntentLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={`${item.href}-${item.title}`} to={item.href} className="group bg-[#07121f] p-6 transition hover:bg-[#091827]">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#10284c]">
                    <Icon className="h-5 w-5 text-[#74a7ff]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-[#dbe7ff]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#9eaabb]">{item.description}</p>
                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#76a7ff]">
                      View solution
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export { highIntentLinks };
