import { PhoneCall, ClipboardList, CalendarCheck, RefreshCw } from 'lucide-react';

const steps = [
  {
    icon: PhoneCall,
    number: '01',
    heading: 'Answers Instantly',
    description: 'The AI receptionist picks up every call immediately — no hold music, no missed enquiries, 24/7.',
  },
  {
    icon: ClipboardList,
    number: '02',
    heading: 'Qualifies the Enquiry',
    description: 'Asks the right questions to capture name, contact details, urgency level, and job type before anything else.',
  },
  {
    icon: CalendarCheck,
    number: '03',
    heading: 'Books or Routes the Lead',
    description: 'Books the appointment directly into your calendar or escalates urgent jobs to the right team member instantly.',
  },
  {
    icon: RefreshCw,
    number: '04',
    heading: 'Syncs to Your Tools',
    description: 'Notes, follow-up tasks, and lead details are pushed straight into your CRM, calendar, and communication tools automatically.',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-16 md:py-24 bg-[#06080d]">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 mb-4">
            <span className="text-sm font-medium text-cyan-300">How it works</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            From First Ring to Booked Job
          </h2>
          <p className="mt-4 text-base text-slate-400 max-w-xl mx-auto leading-7">
            Four steps. Fully automated. Zero dropped leads.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col gap-4 hover:border-cyan-400/20 transition-colors duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-cyan-400" />
                  </div>
                  <span className="text-3xl font-bold text-white/10 select-none">{step.number}</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">{step.heading}</h3>
                  <p className="text-sm text-slate-400 leading-6">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}