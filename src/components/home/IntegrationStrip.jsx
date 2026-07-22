import { AudioLines, CalendarDays, MessageCircleMore, TrendingUp } from 'lucide-react';

const integrations = [
  {
    name: 'Google Calendar',
    icon: CalendarDays,
    iconClass: 'text-blue-300',
    iconWrapClass: 'border-blue-300/20 bg-blue-500/10',
  },
  {
    name: 'HighLevel',
    icon: TrendingUp,
    iconClass: 'text-emerald-300',
    iconWrapClass: 'border-emerald-300/20 bg-emerald-500/10',
  },
  {
    name: 'Stripe',
    wordmark: true,
    wordmarkClass: 'text-[#8d83ff]',
  },
  {
    name: 'Twilio',
    icon: MessageCircleMore,
    iconClass: 'text-rose-300',
    iconWrapClass: 'border-rose-300/20 bg-rose-500/10',
  },
  {
    name: 'Vapi',
    icon: AudioLines,
    iconClass: 'text-cyan-300',
    iconWrapClass: 'border-cyan-300/20 bg-cyan-500/10',
  },
];

export default function IntegrationStrip() {
  return (
    <section className="relative bg-[#060a12] px-4 pb-10 pt-5 sm:px-6 sm:pb-14 lg:px-8">
      <div className="mx-auto max-w-[88rem] overflow-hidden rounded-2xl border border-white/[0.12] bg-[#080d16]/95 shadow-[0_20px_70px_rgba(0,0,0,0.24)]">
        <p className="px-5 pb-2 pt-5 text-center text-base font-medium text-slate-300 sm:pt-6 sm:text-lg">
          Works with the tools you already use
        </p>

        <div className="grid grid-cols-2 border-t border-white/[0.06] sm:grid-cols-3 lg:grid-cols-5 lg:border-t-0">
          {integrations.map((integration, index) => {
            const Icon = integration.icon;
            const isLastOddMobileItem = index === integrations.length - 1;

            return (
              <div
                key={integration.name}
                className={`flex min-h-[6.25rem] items-center justify-center gap-3 px-4 py-5 sm:min-h-[7rem] sm:px-5 lg:min-h-[7.5rem] lg:border-l lg:border-white/[0.10] lg:first:border-l-0 ${
                  isLastOddMobileItem ? 'col-span-2 sm:col-span-1' : ''
                }`}
              >
                {integration.wordmark ? (
                  <span className={`text-2xl font-bold tracking-[-0.04em] sm:text-[1.8rem] ${integration.wordmarkClass}`}>
                    {integration.name}
                  </span>
                ) : (
                  <>
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${integration.iconWrapClass}`}>
                      <Icon className={`h-6 w-6 ${integration.iconClass}`} aria-hidden="true" />
                    </span>
                    <span className="text-lg font-semibold tracking-[-0.025em] text-white sm:text-xl">
                      {integration.name}
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
