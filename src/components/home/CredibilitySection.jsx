import { Plug, TrendingUp, HeadphonesIcon } from 'lucide-react';

const points = [
  {
    icon: Plug,
    heading: 'Stable Integrations',
    description: 'Built on proven platforms — Google Calendar, Stripe, Twilio, and leading CRMs — so your workflows run reliably from day one.',
  },
  {
    icon: TrendingUp,
    heading: 'Proven Early Results',
    description: 'Early customers are seeing faster response times, higher lead capture rates, and more booked appointments with less admin overhead.',
  },
  {
    icon: HeadphonesIcon,
    heading: 'Hands-On Support',
    description: 'Our team handles setup, onboarding, and ongoing optimisation — so you\'re never left figuring things out on your own.',
  },
];

export default function CredibilitySection() {
  return (
    <section className="relative py-16 md:py-20 bg-[#070a12]">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Trusted by Service Businesses
          </h2>
          <p className="mt-4 text-base text-slate-400 max-w-lg mx-auto leading-7">
            Built to be reliable, not experimental. Here's what backs that up.
          </p>
        </div>

        {/* Points */}
        <div className="grid gap-6 sm:grid-cols-3">
          {points.map((point) => {
            const Icon = point.icon;
            return (
              <div
                key={point.heading}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col gap-4 hover:border-cyan-400/20 transition-colors duration-300"
              >
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">{point.heading}</h3>
                  <p className="text-sm text-slate-400 leading-6">{point.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}