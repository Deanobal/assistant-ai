import {
  ArrowRight,
  CalendarCheck2,
  Check,
  CheckCircle2,
  CircleDot,
  ClipboardCheck,
  ContactRound,
  MapPin,
  MessageSquareText,
  Phone,
  Play,
  Send,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import VapiReceptionistDemoButton from '@/components/voice/VapiReceptionistDemoButton';

const waveform = [10, 18, 13, 27, 17, 34, 15, 23, 42, 20, 14, 31, 47, 25, 17, 37, 22, 15, 30, 20, 12, 25, 16, 9];

export const premiumButton =
  'inline-flex min-h-[3.5rem] items-center justify-center gap-2 rounded-[11px] border border-[#347cff] bg-[#0b4dbb] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(31,111,255,0.22)] transition hover:bg-[#0a45aa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7faaff]';

export const premiumButtonSecondary =
  'inline-flex min-h-[3.5rem] items-center justify-center gap-2 rounded-[11px] border border-[#425067] bg-[#07111d] px-6 py-3.5 text-sm font-semibold text-white transition hover:border-[#66748a] hover:bg-[#0a1725] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4b8cff]';

export function AccentText({ children }) {
  return <span className="text-[#347cff]">{children}</span>;
}

export function PageShell({ children, className = '' }) {
  return <div className={`bg-[#030812] text-white ${className}`}>{children}</div>;
}

export function PageHero({
  title,
  description,
  children = null,
  primaryLabel = 'Talk to Our AI Receptionist',
  primaryTo = '',
  secondaryLabel = 'See How It Works',
  secondaryTo = '#page-content',
  aside = null,
  footnote = 'Built for Australian service businesses',
}) {
  return (
    <section className="relative overflow-hidden border-b border-[#152238]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_22%,rgba(31,111,255,0.12),transparent_35%)]" />
      <div className="relative mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24 xl:px-16">
        <div className="grid items-center gap-12 lg:min-h-[520px] lg:grid-cols-[0.94fr_1.06fr] lg:gap-16">
          <div className="max-w-[670px]">
            <h1 className="text-balance text-[2.7rem] font-[720] leading-[1.02] tracking-[-0.052em] text-white sm:text-[3.7rem] lg:text-[4.25rem]">
              {title}
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-[#aeb8c6] sm:text-lg sm:leading-8">
              {description}
            </p>
            {children}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {primaryTo ? (
                <Link to={primaryTo} className={premiumButton}>
                  {primaryLabel}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ) : (
                <VapiReceptionistDemoButton className="w-full sm:w-auto" showFallbackText />
              )}
              {secondaryTo.startsWith('#') ? (
                <a href={secondaryTo} className={premiumButtonSecondary}>
                  <Play className="h-4 w-4" aria-hidden="true" />
                  {secondaryLabel}
                </a>
              ) : (
                <Link to={secondaryTo} className={premiumButtonSecondary}>
                  {secondaryLabel}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
            </div>
            {footnote ? (
              <p className="mt-6 flex items-center gap-2.5 text-sm text-[#aeb8c5]">
                <MapPin className="h-4 w-4 text-[#4b8cff]" aria-hidden="true" />
                {footnote}
              </p>
            ) : null}
          </div>
          <div>{aside || <VoiceWorkflowPanel />}</div>
        </div>
      </div>
    </section>
  );
}

export function VoiceWorkflowPanel({ title = 'Live call workflow' }) {
  const events = [
    { label: 'Contact captured', detail: 'Caller details organised', icon: ContactRound },
    { label: 'Enquiry qualified', detail: 'Need and urgency understood', icon: ClipboardCheck },
    { label: 'Booking requested', detail: 'Preferred time recorded', icon: CalendarCheck2 },
    { label: 'Follow-up queued', detail: 'Next steps ready to send', icon: Send },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[650px]">
      <div className="absolute -inset-10 -z-10 bg-[radial-gradient(circle,rgba(31,111,255,0.15),transparent_64%)] blur-2xl" />
      <div className="overflow-hidden rounded-[18px] border border-[#2a394f] bg-[#06101c]/96 shadow-[0_32px_90px_rgba(0,0,0,0.44)]">
        <div className="flex items-center justify-between border-b border-[#1d2b3e] px-5 py-4 sm:px-6">
          <div>
            <p className="text-sm font-semibold text-white">{title}</p>
            <p className="mt-1 text-xs text-[#95a3b5]">Example customer journey</p>
          </div>
          <span className="flex items-center gap-2 text-xs font-semibold text-[#c9f8dc]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#32d273]" />
            Live
          </span>
        </div>
        <div className="border-b border-[#1d2b3e] p-4 sm:p-5">
          <div className="flex items-center gap-4 rounded-[13px] border border-[#2657a5] bg-[#0a1d37] px-4 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1768ec] text-white">
              <Phone className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Call in progress</p>
              <p className="text-xs text-[#9aa8b8]">02:37</p>
            </div>
            <div className="ml-auto hidden h-12 items-center gap-1 overflow-hidden sm:flex" aria-hidden="true">
              {waveform.map((height, index) => (
                <span
                  key={`${height}-${index}`}
                  className="aai-wave-bar w-1 rounded-full bg-[#2f7cff]"
                  style={{ height: `${height}px`, animationDelay: `${index * 45}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="grid gap-2.5 p-4 sm:grid-cols-2 sm:p-5">
          {events.map(({ label, detail, icon: Icon }, index) => (
            <div key={label} className="flex items-start gap-3 rounded-[12px] border border-[#1c2b3f] bg-[#081522] p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#10284c] text-[#74a7ff]">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="mt-1 text-xs leading-5 text-[#95a3b5]">{detail}</p>
              </div>
              {index === 0 ? <Check className="ml-auto h-4 w-4 text-[#62d895]" aria-hidden="true" /> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Section({ children, className = '', id = undefined }) {
  return (
    <section id={id} className={`border-b border-[#152238] ${className}`}>
      <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24 xl:px-16">
        {children}
      </div>
    </section>
  );
}

export function SectionHeading({ title, description = '', align = 'left', className = '' }) {
  const alignment = align === 'center' ? 'mx-auto text-center' : '';
  return (
    <div className={`max-w-3xl ${alignment} ${className}`}>
      <h2 className="text-balance text-3xl font-[700] tracking-[-0.04em] text-white sm:text-4xl lg:text-[2.8rem]">{title}</h2>
      {description ? <p className="mt-5 text-base leading-7 text-[#aab4c3] sm:text-lg sm:leading-8">{description}</p> : null}
    </div>
  );
}

export function CapabilityRail({ items }) {
  return (
    <div className="overflow-hidden rounded-[16px] border border-[#26364d] bg-[#07121f]">
      <div className="grid md:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, description }, index) => (
          <div key={title} className={`p-6 lg:p-7 ${index ? 'border-t border-[#1d2b3e] md:border-l md:border-t-0' : ''} ${index === 2 ? 'md:border-l-0 lg:border-l' : ''}`}>
            <Icon className="h-6 w-6 text-[#4b8cff]" aria-hidden="true" />
            <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#9eaabb]">{description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FeatureSplit({ title, description, points = [], children, reverse = false }) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={reverse ? 'lg:order-2' : ''}>
        <SectionHeading title={title} description={description} />
        {points?.length ? (
          <ul className="mt-7 space-y-4">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-3 text-[15px] leading-7 text-[#c1cad5]">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#4b8cff]" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className={reverse ? 'lg:order-1' : ''}>{children}</div>
    </div>
  );
}

export function OutcomeList({ items }) {
  return (
    <div className="overflow-hidden rounded-[16px] border border-[#26364d] bg-[#07121f]">
      {items.map((item, index) => (
        <div key={item} className={`flex items-start gap-4 px-5 py-5 sm:px-6 ${index ? 'border-t border-[#1d2b3e]' : ''}`}>
          <CircleDot className="mt-1 h-4 w-4 shrink-0 text-[#4b8cff]" aria-hidden="true" />
          <p className="text-[15px] leading-7 text-[#c3ccd7]">{item}</p>
        </div>
      ))}
    </div>
  );
}

export function FAQRows({ items }) {
  return (
    <div className="grid gap-px overflow-hidden rounded-[15px] border border-[#26364d] bg-[#26364d] md:grid-cols-2">
      {items.map(([question, answer]) => (
        <details key={question} className="group bg-[#07121f] p-5 open:bg-[#091725] sm:p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-white">
            {question}
            <span className="text-[#6f9eff] transition group-open:rotate-45">+</span>
          </summary>
          <p className="mt-4 text-sm leading-7 text-[#aab4c3]">{answer}</p>
        </details>
      ))}
    </div>
  );
}

export function ConversionCTA({
  title = 'Ready to turn more calls into customers?',
  description = 'See how AssistantAI can fit your call flow, booking process and existing tools.',
  primaryLabel = 'Talk to Our AI Receptionist',
  primaryTo = '',
  secondaryLabel = 'Get Started',
  secondaryTo = '/GetStartedNow',
}) {
  return (
    <Section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_50%,rgba(31,111,255,0.12),transparent_28%)]" />
      <div className="relative rounded-[18px] border border-[#2a3b55] bg-[#071421] px-6 py-10 text-center sm:px-10 sm:py-14">
        <MessageSquareText className="mx-auto h-7 w-7 text-[#4b8cff]" aria-hidden="true" />
        <h2 className="mx-auto mt-5 max-w-3xl text-balance text-3xl font-[700] tracking-[-0.04em] text-white sm:text-4xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#aab4c3]">{description}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {primaryTo ? (
            <Link to={primaryTo} className={premiumButton}>
              {primaryLabel}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : (
            <VapiReceptionistDemoButton className="w-full sm:w-auto" showFallbackText />
          )}
          <Link to={secondaryTo} className={premiumButtonSecondary}>
            {secondaryLabel}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </Section>
  );
}
