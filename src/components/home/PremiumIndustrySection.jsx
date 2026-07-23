import { useState } from 'react';
import { BriefcaseBusiness, Building2, CalendarDays, Check, House, Phone, Stethoscope, UserRound, Wrench } from 'lucide-react';

const industries = [
  {
    id: 'trades',
    label: 'Trades',
    icon: Wrench,
    image: '/images/assistantai-trades-workshop.webp',
    alt: 'Australian trade business owner reviewing jobs in a workshop office',
    heading: 'Never lose the job because nobody could answer.',
    body: 'Capture the caller, understand the job, identify urgency and send the right next step — even while your team is on site.',
    overlayTitle: 'Emergency plumbing enquiry',
    overlayAction: 'Escalated to on-call team',
    proofs: ['24/7 call coverage', 'Booking and CRM handoff', 'Human escalation when it matters'],
  },
  {
    id: 'clinics',
    label: 'Clinics',
    icon: Stethoscope,
    image: '/images/assistantai-clinic-operations.webp',
    alt: 'Australian clinic practice manager reviewing the appointment schedule',
    heading: 'Give every enquiry a calm, consistent first response.',
    body: 'Capture booking intent, preferred times and contact details while sensitive or urgent enquiries are handed to your team.',
    overlayTitle: 'New appointment enquiry',
    overlayAction: 'Callback request sent',
    proofs: ['Appointment enquiry capture', 'Clear escalation rules', 'Less repetitive reception admin'],
  },
  {
    id: 'property',
    label: 'Property',
    icon: House,
    image: '/images/assistantai-property-office.webp',
    alt: 'Australian property manager reviewing an inspection workflow',
    heading: 'Route every property enquiry to the right next step.',
    body: 'Separate sales, rental, appraisal and maintenance enquiries, then capture the property and caller details your team needs.',
    overlayTitle: 'New property enquiry',
    overlayAction: 'Routed to property team',
    proofs: ['Enquiry classification', 'Property details captured', 'After-hours lead coverage'],
  },
  {
    id: 'professional',
    label: 'Professional services',
    icon: BriefcaseBusiness,
    image: '/images/assistantai-professional-services.webp',
    alt: 'Australian professional services principal reviewing client workflow notes',
    heading: 'Capture the opportunity without crossing the professional line.',
    body: 'Collect the matter type, urgency and contact details, while advice and sensitive conversations remain with your qualified team.',
    overlayTitle: 'New client enquiry',
    overlayAction: 'Sent for professional review',
    proofs: ['Structured intake', 'Sensitive-call escalation', 'Clear human review path'],
  },
];

export default function PremiumIndustrySection() {
  const [selectedId, setSelectedId] = useState('trades');
  const selected = industries.find((industry) => industry.id === selectedId) || industries[0];

  return (
    <section id="industries" className="aai-deferred-section scroll-mt-20 border-b border-[#142033] bg-[#030812] py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid gap-12 xl:grid-cols-[minmax(0,0.9fr)_minmax(560px,1.1fr)] xl:items-end">
          <div>
            <h2 className="max-w-xl text-balance text-4xl font-[700] leading-[1.04] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">Built for real service work.</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#aab4c3] sm:text-lg sm:leading-8">From the first ring to the final follow-up, AssistantAI adapts to how your business handles customers.</p>

            <div className="mt-10 grid gap-8 lg:grid-cols-[230px_1fr] xl:grid-cols-[220px_1fr]" role="tablist" aria-label="Service business industries">
              <div className="overflow-hidden rounded-[14px] border border-[#2a374a] bg-[#07111d]">
                {industries.map(({ id, label, icon: Icon }, index) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={selectedId === id}
                    aria-controls="industry-panel"
                    onClick={() => setSelectedId(id)}
                    className={`flex min-h-[72px] w-full items-center gap-4 border-[#233044] px-4 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7faaff] ${index ? 'border-t' : ''} ${selectedId === id ? 'bg-[#0b1e38] text-[#7faaff] shadow-[inset_2px_0_0_#347cff]' : 'text-[#b0bbc8] hover:bg-[#0a1624] hover:text-white'}`}
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>

              <div id="industry-panel" role="tabpanel" className="min-w-0" aria-live="polite">
                <h3 className="text-2xl font-[680] leading-tight tracking-[-0.03em] text-white sm:text-3xl">{selected.heading}</h3>
                <p className="mt-4 text-base leading-7 text-[#aab4c3]">{selected.body}</p>
                <ul className="mt-6 divide-y divide-[#243145] border-y border-[#243145]">
                  {selected.proofs.map((proof, index) => {
                    const icons = [Phone, CalendarDays, UserRound];
                    const Icon = icons[index] || Check;
                    return (
                      <li key={proof} className="flex items-center gap-3 py-3.5 text-sm font-medium text-[#d6dde6]">
                        <Icon className="h-4 w-4 text-[#4d8dff]" aria-hidden="true" />
                        {proof}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[20px] border border-[#29364a] bg-[#08111d] shadow-[0_30px_90px_rgba(0,0,0,0.4)]">
            <div className="aspect-[4/3] overflow-hidden">
              <img
                key={selected.image}
                src={selected.image}
                alt={selected.alt}
                className="h-full w-full object-cover [animation:aai-image-reveal_420ms_ease-out]"
                loading="lazy"
                width="1280"
                height="960"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(3,8,18,0.32),transparent_36%),linear-gradient(0deg,rgba(3,8,18,0.24),transparent_42%)]" />
            <div className="absolute bottom-4 left-4 right-4 max-w-[360px] overflow-hidden rounded-[14px] border border-[#314056] bg-[#06101c]/94 shadow-2xl backdrop-blur-md sm:bottom-7 sm:left-7">
              <div className="flex items-center gap-3 border-b border-[#26354a] px-4 py-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#155fd3] text-white"><Phone className="h-4 w-4" /></div>
                <div>
                  <p className="text-xs text-[#9eaaba]">Incoming call</p>
                  <p className="mt-0.5 text-sm font-semibold text-white">{selected.overlayTitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3.5">
                <Building2 className="h-4 w-4 text-[#74a6ff]" aria-hidden="true" />
                <p className="flex-1 text-xs font-medium text-[#d9e0e8]">{selected.overlayAction}</p>
                <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
