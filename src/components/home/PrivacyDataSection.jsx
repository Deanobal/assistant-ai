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
    <section id="privacy-and-data" className="site-section border-y border-blue-200/[0.07]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(43,94,255,0.08),transparent_28rem)]" />

      <div className="site-container relative">
        <div className="grid gap-12 xl:grid-cols-[0.82fr_1.18fr] xl:items-start xl:gap-16">
          <div className="max-w-[40rem]">
            <p className="site-kicker">Privacy and data</p>
            <h2>Clear, responsible handling of call data.</h2>
            <p className="site-lede">
              AI call handling can involve personal information. AssistantAI explains what is collected, why it is needed and which connected systems process it before a deployment goes live.
            </p>

            <a href="/Contact" className="site-button-secondary mt-7">
              Ask about privacy and data handling
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-3">
            {privacyPoints.map((point) => (
              <article key={point.title} className="site-card min-h-[18rem] p-5 sm:p-6">
                <span className="site-icon">
                  <point.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="site-card-title mt-6">{point.title}</h3>
                <p className="site-card-copy mt-3">{point.description}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="site-muted-panel mt-8 px-5 py-4 sm:px-6">
          <p className="site-meta">
            Retention, access, correction and deletion arrangements depend on the configured service and connected providers. These settings should be confirmed in the client implementation record and reflected in the applicable privacy notices.
          </p>
        </div>
      </div>
    </section>
  );
}
