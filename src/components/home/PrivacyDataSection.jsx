import { ArrowRight, Database, FileAudio2, ShieldCheck } from 'lucide-react';

const privacyPoints = [
  {
    icon: FileAudio2,
    title: 'Clear call disclosure',
    description: 'Depending on the configured service, calls may be transcribed or recorded. The caller experience and required notices are confirmed during setup.',
  },
  {
    icon: ShieldCheck,
    title: 'Used for the configured service',
    description: 'Contact details and conversation information are processed to answer enquiries, qualify leads, arrange bookings and complete approved follow-up workflows.',
  },
  {
    icon: Database,
    title: 'Connected systems are documented',
    description: 'Data may pass through the voice, CRM, calendar, messaging, payment and hosting providers connected to each deployment. The applicable systems are documented during onboarding.',
  },
];

export default function PrivacyDataSection() {
  return (
    <section id="privacy-and-data" className="relative overflow-hidden border-y border-white/[0.06] bg-[#080c14] py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(45,83,255,0.11),transparent_28%)]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-16">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-300">Privacy and data</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl lg:text-[2.8rem] lg:leading-[1.08]">
              Clear, responsible handling of call data.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              AI call handling can involve personal information. AssistantAI explains what is collected, why it is needed and which connected systems process it before a deployment goes live.
            </p>

            <a
              href="/Contact"
              className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl border border-blue-300/25 bg-blue-500/10 px-5 py-3 text-base font-semibold text-blue-100 transition hover:border-blue-300/45 hover:bg-blue-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              Ask about privacy and data handling
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {privacyPoints.map((point) => (
              <article key={point.title} className="rounded-2xl border border-white/[0.09] bg-white/[0.035] p-5 sm:p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10">
                  <point.icon className="h-5 w-5 text-blue-300" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-white">{point.title}</h3>
                <p className="mt-3 text-[0.98rem] leading-7 text-slate-300">{point.description}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-white/[0.08] bg-[#0c121e] px-5 py-4 text-sm leading-6 text-slate-300 sm:px-6 sm:text-[0.95rem]">
          Retention, access, correction and deletion arrangements depend on the configured service and connected providers. These settings should be confirmed in the client implementation record and reflected in the applicable privacy notices.
        </div>
      </div>
    </section>
  );
}
