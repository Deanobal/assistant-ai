import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Mic, TrendingUp, UserRound } from 'lucide-react';
import VapiReceptionistDemoButton from '@/components/voice/VapiReceptionistDemoButton';

const plans = [
  {
    name: 'Starter',
    price: '$497',
    cadence: '/ month',
    setup: '$1,500 setup',
    description: 'Missed-call coverage, lead capture and simple follow-up.',
    cta: 'Choose Starter',
    to: '/GetStartedNow?plan=starter',
    icon: UserRound,
  },
  {
    name: 'Growth',
    price: '$1,500',
    cadence: '/ month',
    setup: '$3,000 setup',
    description: 'AI call handling, booking support, customer updates and SMS/email follow-up.',
    cta: 'Choose Growth',
    to: '/GetStartedNow?plan=growth',
    icon: TrendingUp,
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    cadence: '',
    setup: '',
    description: 'For multi-location operations, advanced integrations and complex routing.',
    cta: 'Talk to us',
    to: '/Contact',
    icon: Building2,
  },
];

export default function PremiumPricingSection() {
  return (
    <section id="pricing" className="aai-deferred-section scroll-mt-20 border-b border-[#142033] bg-[#040a14] py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-4xl font-[700] leading-[1.04] tracking-[-0.045em] text-white sm:text-5xl">Simple plans. Serious capability.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#aab4c3] sm:text-lg">Choose the level of call handling and follow-up your business needs. All prices are AUD and exclude GST.</p>
        </div>

        <div className="mt-12 overflow-hidden rounded-[18px] border border-[#2b384a] bg-[#07111d]">
          {plans.map(({ name, price, cadence, setup, description, cta, to, icon: Icon, featured }, index) => (
            <div
              key={name}
              className={`relative grid gap-5 border-[#263448] p-5 sm:p-7 lg:grid-cols-[0.75fr_0.85fr_1.35fr_auto] lg:items-center lg:gap-8 ${index ? 'border-t' : ''} ${featured ? 'bg-[#0a1d35] shadow-[inset_3px_0_0_#2f7cff]' : 'bg-[#07111d]'}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#263b5c] bg-[#0d1c30] text-[#4d8dff]"><Icon className="h-5 w-5" /></div>
                <h3 className="text-xl font-semibold text-white sm:text-2xl">{name}</h3>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-[700] tracking-[-0.035em] text-white sm:text-4xl">{price}</span>
                  {cadence ? <span className="text-sm text-[#9ca9b8]">{cadence}</span> : null}
                </div>
                {setup ? <p className="mt-1 text-sm text-[#9ca9b8]">{setup}</p> : null}
              </div>
              <p className="max-w-md text-sm leading-6 text-[#c0c9d4] sm:text-base sm:leading-7">{description}</p>
              <Link
                to={to}
                className={`inline-flex min-h-12 items-center justify-center rounded-[11px] px-6 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7faaff] ${featured ? 'border border-[#347cff] bg-[#0b4dbb] text-white shadow-[0_10px_35px_rgba(31,111,255,0.28)] hover:bg-[#0a45aa]' : 'border border-[#465267] bg-[#08121e] text-white hover:border-[#6a778a] hover:bg-[#0c1826]'}`}
              >
                {cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link to="/Pricing" className="inline-flex items-center gap-2 text-sm font-semibold text-[#6d9fff] transition hover:text-[#8db4ff]">Compare all features <ArrowRight className="h-4 w-4" /></Link>
        </div>

        <div className="relative mt-16 overflow-hidden rounded-[20px] border border-[#2d3e57] bg-[#071421] px-6 py-8 sm:px-9 sm:py-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_right,rgba(31,111,255,0.25),transparent_65%)]" />
          <div className="relative flex items-start gap-4 sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#2e599a] bg-[#102b53] text-[#6da2ff]"><Mic className="h-5 w-5" /></div>
            <div>
              <h2 className="text-2xl font-[680] tracking-[-0.03em] text-white sm:text-3xl">Ready to turn every call into an opportunity?</h2>
              <p className="mt-2 text-sm leading-6 text-[#aab4c3] sm:text-base">Talk to the AssistantAI receptionist or start building your setup today.</p>
            </div>
          </div>
          <div className="relative mt-7 flex flex-col gap-3 sm:flex-row lg:mt-0">
            <VapiReceptionistDemoButton className="w-full sm:w-auto" showFallbackText />
            <Link to="/GetStartedNow" className="inline-flex min-h-[3.5rem] items-center justify-center gap-2 rounded-[12px] border border-[#536077] bg-[#08121e] px-6 py-4 text-sm font-semibold text-white transition hover:border-[#748197] hover:bg-[#0d1927]">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
