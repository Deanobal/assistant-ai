import { Link } from 'react-router-dom';
import { ArrowRight, Bot, CalendarCheck, MessageSquareText, PhoneCall, ShieldCheck, Target } from 'lucide-react';

const highIntentLinks = [
  {
    title: 'AI Receptionist Australia',
    description: 'Core money page for Australian service businesses comparing AI reception and call answering systems.',
    href: '/ai-receptionist-australia',
    icon: PhoneCall,
  },
  {
    title: 'AI Phone Assistant for Small Business',
    description: 'For smaller operators that need calls answered, details captured, and follow-up handled faster.',
    href: '/ai-phone-assistant-small-business',
    icon: Bot,
  },
  {
    title: 'Missed Call Automation Australia',
    description: 'Problem-led page for businesses losing paid leads and referral enquiries through unanswered calls.',
    href: '/missed-call-automation-australia',
    icon: Target,
  },
  {
    title: 'AI Lead Follow-Up Automation',
    description: 'Targets buyers searching for faster lead response, qualification, SMS/email follow-up, and pipeline visibility.',
    href: '/ai-lead-follow-up-automation',
    icon: MessageSquareText,
  },
  {
    title: 'AI Appointment Booking Assistant',
    description: 'For clinics, consultants, home services, and appointment-based operators that need booking intent captured.',
    href: '/ai-appointment-booking-assistant',
    icon: CalendarCheck,
  },
  {
    title: 'AI Receptionist for Trades',
    description: 'Industry wedge for plumbers, electricians, cleaners, maintenance, HVAC, and field-service teams.',
    href: '/ai-receptionist-for-trades',
    icon: ShieldCheck,
  },
];

export default function HighIntentLinks({ compact = false }) {
  return (
    <section className={`relative ${compact ? 'py-14 md:py-18' : 'py-20 md:py-24'}`}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Buyer-intent solutions</p>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">Find the exact AI receptionist system your business needs</h2>
          <p className="mt-4 text-base leading-7 text-slate-400">
            Built around high-intent service-business problems: missed calls, slow follow-up, booking friction, lead leakage, and admin overload.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {highIntentLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} to={item.href} className="group rounded-[28px] border border-white/8 bg-white/[0.035] p-6 transition hover:-translate-y-0.5 hover:border-cyan-400/35 hover:bg-white/[0.06]">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                    <Icon className="h-5 w-5 text-cyan-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-cyan-100">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">
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
