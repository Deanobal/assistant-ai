import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Boxes,
  BriefcaseBusiness,
  Building2,
  CalendarCheck2,
  Check,
  CheckCircle2,
  CircleDot,
  ClipboardCheck,
  ContactRound,
  CreditCard,
  FileCheck2,
  Gauge,
  Layers3,
  Link2,
  MapPin,
  MessageSquareText,
  Network,
  Phone,
  PhoneCall,
  Play,
  Route,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
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
  visual = 'assistant',
  visualData = null,
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
          <div>{aside || <HeroVisual variant={visual} data={visualData} />}</div>
        </div>
      </div>
    </section>
  );
}

function VisualFrame({ children, className = '' }) {
  return (
    <div className="relative mx-auto w-full max-w-[650px]">
      <div className="absolute -inset-10 -z-10 bg-[radial-gradient(circle,rgba(31,111,255,0.13),transparent_64%)] blur-2xl" />
      <div className={`overflow-hidden rounded-[18px] border border-[#2a394f] bg-[#06101c]/96 shadow-[0_32px_90px_rgba(0,0,0,0.44)] ${className}`}>
        {children}
      </div>
    </div>
  );
}

function VisualHeading({ title, description, icon: Icon }) {
  return (
    <div className="flex items-center gap-4 border-b border-[#1d2b3e] px-5 py-4 sm:px-6">
      {Icon ? (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#28559a] bg-[#10284c] text-[#74a7ff]">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      ) : null}
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[#95a3b5]">{description}</p>
      </div>
    </div>
  );
}

function AssistantOrbitPanel() {
  const nodes = [
    { label: 'Calls', icon: PhoneCall, position: 'left-4 top-8 sm:left-8' },
    { label: 'Leads', icon: ContactRound, position: 'right-4 top-8 sm:right-8' },
    { label: 'Bookings', icon: CalendarCheck2, position: 'bottom-8 left-4 sm:left-8' },
    { label: 'Follow-up', icon: Send, position: 'bottom-8 right-4 sm:right-8' },
  ];

  return (
    <VisualFrame>
      <VisualHeading title="One connected assistant" description="Calls, context and next actions stay together" icon={Sparkles} />
      <div className="relative min-h-[330px] overflow-hidden bg-[radial-gradient(circle_at_50%_50%,rgba(31,111,255,0.14),transparent_50%)] p-5">
        <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#24549c]/65" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#213654]" />
        <div className="absolute left-1/2 top-1/2 z-10 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-[#347cff] bg-[#0a1d37] text-center shadow-[0_0_55px_rgba(31,111,255,0.2)]">
          <Network className="h-6 w-6 text-[#74a7ff]" aria-hidden="true" />
          <p className="mt-2 text-sm font-semibold text-white">AssistantAI</p>
        </div>
        {nodes.map(({ label, icon: Icon, position }) => (
          <div key={label} className={`absolute ${position} z-20 flex min-w-[112px] items-center gap-2.5 rounded-[11px] border border-[#263b59] bg-[#081522] px-3 py-3`}>
            <Icon className="h-4 w-4 text-[#6fa3ff]" aria-hidden="true" />
            <span className="text-xs font-semibold text-[#d8e2ef]">{label}</span>
          </div>
        ))}
      </div>
    </VisualFrame>
  );
}

function PricingPreviewPanel({ plans = [] }) {
  const fallbackPlans = [
    { name: 'Starter', monthly: '$497/month' },
    { name: 'Growth', monthly: '$1,500/month', featured: true },
    { name: 'Enterprise', monthly: 'Custom scope' },
  ];
  const visiblePlans = (plans.length ? plans : fallbackPlans).slice(0, 3);

  return (
    <VisualFrame>
      <VisualHeading title="Choose your coverage" description="AUD pricing with implementation included" icon={CreditCard} />
      <div className="space-y-3 p-5 sm:p-6">
        {visiblePlans.map((plan) => (
          <div
            key={plan.name}
            className={`flex items-center justify-between gap-4 rounded-[13px] border px-4 py-4 sm:px-5 ${
              plan.featured ? 'border-[#347cff] bg-[#0a1d37]' : 'border-[#213149] bg-[#081522]'
            }`}
          >
            <div>
              <p className="text-sm font-semibold text-white">{plan.name}</p>
              <p className="mt-1 text-xs text-[#95a3b5]">{plan.description || 'Done-for-you setup and support'}</p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-[#8bb4ff]">{plan.monthly}</p>
          </div>
        ))}
        <div className="flex items-center gap-3 border-t border-[#1d2b3e] px-1 pt-4 text-xs leading-5 text-[#9eabba]">
          <ShieldCheck className="h-4 w-4 shrink-0 text-[#5f97f8]" aria-hidden="true" />
          Scope, rollout and operating boundaries are confirmed before launch.
        </div>
      </div>
    </VisualFrame>
  );
}

function IntegrationMapPanel({ items = [] }) {
  const fallbackItems = [
    { title: 'Calendars', icon: CalendarCheck2 },
    { title: 'Customer systems', icon: Users },
    { title: 'SMS and email', icon: MessageSquareText },
    { title: 'Secure signup', icon: CreditCard },
  ];
  const visibleItems = (items.length ? items : fallbackItems).slice(0, 4);

  return (
    <VisualFrame>
      <VisualHeading title="Connected business workflow" description="The call becomes a useful next action" icon={Link2} />
      <div className="grid gap-4 p-5 sm:grid-cols-[0.78fr_1.22fr] sm:p-6">
        <div className="flex min-h-[245px] flex-col items-center justify-center rounded-[14px] border border-[#2a5eae] bg-[#0a1d37] text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1768ec] text-white">
            <PhoneCall className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="mt-4 text-base font-semibold text-white">AssistantAI</p>
          <p className="mt-1 max-w-[150px] text-xs leading-5 text-[#a7b5c7]">Understands the enquiry and routes the next step</p>
        </div>
        <div className="relative grid gap-2.5">
          <div className="absolute -left-2 top-1/2 hidden h-px w-4 bg-[#347cff] sm:block" />
          {visibleItems.map(({ title, icon: Icon = Boxes }) => (
            <div key={title} className="flex items-center gap-3 rounded-[11px] border border-[#213149] bg-[#081522] px-4 py-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#10284c] text-[#74a7ff]">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="text-sm font-semibold text-[#dce5f0]">{title}</p>
              <Check className="ml-auto h-4 w-4 text-[#62d895]" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </VisualFrame>
  );
}

function IndustryRoutingPanel({ items = [] }) {
  const fallbackItems = [
    { name: 'Trades', icon: Wrench },
    { name: 'Property', icon: Building2 },
    { name: 'Clinics', icon: BriefcaseBusiness },
    { name: 'Professional services', icon: FileCheck2 },
  ];
  const visibleItems = (items.length ? items : fallbackItems).slice(0, 4);

  return (
    <VisualFrame>
      <VisualHeading title="Industry-aware call routing" description="Different questions, boundaries and next steps" icon={Route} />
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-4 rounded-[13px] border border-[#2657a5] bg-[#0a1d37] p-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1768ec]">
            <Phone className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">Incoming customer enquiry</p>
            <p className="mt-1 text-xs text-[#a0aec0]">Identify the need before routing</p>
          </div>
        </div>
        <div className="mx-8 h-5 border-l border-[#2e63b7]" />
        <div className="grid gap-2.5 sm:grid-cols-2">
          {visibleItems.map(({ name, title, icon: Icon = Building2 }) => (
            <div key={name || title} className="flex items-center gap-3 rounded-[11px] border border-[#213149] bg-[#081522] p-3.5">
              <Icon className="h-4 w-4 text-[#6fa3ff]" aria-hidden="true" />
              <span className="text-xs font-semibold text-[#d8e2ef]">{name || title}</span>
            </div>
          ))}
        </div>
      </div>
    </VisualFrame>
  );
}

function EditorialPanel({ mode = 'blog', items = [] }) {
  const isResources = mode === 'resources';
  const fallback = isResources
    ? ['AI receptionist buyer checklist', 'Call-flow planning guide', 'Provider comparison framework']
    : ['Designing a useful call flow', 'What to automate first', 'Measuring speed to lead'];
  const visibleItems = (items.length ? items : fallback).slice(0, 3);

  return (
    <div className="relative mx-auto w-full max-w-[620px] px-2 py-4 sm:px-6">
      <div className="absolute inset-x-10 bottom-0 top-12 rotate-3 rounded-[18px] border border-[#1f3554] bg-[#071421]" />
      <div className="absolute inset-x-5 bottom-4 top-6 -rotate-2 rounded-[18px] border border-[#253f63] bg-[#081827]" />
      <div className="relative rounded-[18px] border border-[#31517c] bg-[#07121f] p-5 shadow-[0_32px_90px_rgba(0,0,0,0.44)] sm:p-7">
        <div className="flex items-center justify-between gap-4 border-b border-[#1d2b3e] pb-5">
          <div>
            <p className="text-sm font-semibold text-white">{isResources ? 'Buyer resource library' : 'AssistantAI field notes'}</p>
            <p className="mt-1 text-xs text-[#95a3b5]">Practical guidance for Australian operators</p>
          </div>
          <BookOpenCheck className="h-5 w-5 text-[#74a7ff]" aria-hidden="true" />
        </div>
        <div className="divide-y divide-[#1d2b3e]">
          {visibleItems.map((item, index) => {
            const title = typeof item === 'string' ? item : item.title;
            const category = typeof item === 'string' ? (isResources ? 'Guide' : 'Operations') : item.category || (isResources ? 'Guide' : 'Operations');
            return (
              <div key={`${title}-${index}`} className="flex items-start gap-4 py-5">
                <span className="mt-0.5 text-xs font-semibold text-[#6e9fff]">0{index + 1}</span>
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-semibold leading-6 text-white">{title}</p>
                  <p className="mt-1 text-xs text-[#95a3b5]">{category}</p>
                </div>
                <ArrowRight className="ml-auto mt-1 h-4 w-4 shrink-0 text-[#568fee]" aria-hidden="true" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CaseOutcomePanel({ items = [] }) {
  const visibleItems = (items.length ? items : [
    { industry: 'Service business', challenge: 'Missed enquiries', outcomes: ['Faster response'] },
  ]).slice(0, 2);

  return (
    <VisualFrame>
      <VisualHeading title="Workflow evidence" description="From operating problem to accountable next action" icon={BarChart3} />
      <div className="space-y-4 p-5 sm:p-6">
        {visibleItems.map((item, index) => (
          <div key={item.industry || index} className="rounded-[13px] border border-[#213149] bg-[#081522] p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-white">{item.industry || `Scenario ${index + 1}`}</p>
              <span className="text-xs font-semibold text-[#6fa3ff]">0{index + 1}</span>
            </div>
            <div className="mt-4 grid items-center gap-2 sm:grid-cols-[1fr_auto_1fr]">
              <div className="rounded-[9px] border border-[#2c3443] bg-[#09111c] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#98a5b5]">Before</p>
                <p className="mt-2 text-xs leading-5 text-[#c0c9d4]">{item.challenge || 'Manual response gaps'}</p>
              </div>
              <ArrowRight className="mx-auto h-4 w-4 rotate-90 text-[#4b8cff] sm:rotate-0" aria-hidden="true" />
              <div className="rounded-[9px] border border-[#28579f] bg-[#0a1d37] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#79aaff]">Next action</p>
                <p className="mt-2 text-xs leading-5 text-[#d2ddec]">{item.outcomes?.[0] || 'Structured follow-up'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </VisualFrame>
  );
}

function PrinciplesPanel() {
  const principles = [
    ['Calm for callers', 'Natural, clear and useful first response.'],
    ['Useful for teams', 'Structured context instead of another inbox.'],
    ['Visible to owners', 'Clear rules, handoffs and accountability.'],
  ];

  return (
    <div className="relative mx-auto max-w-[620px]">
      <div className="absolute -right-6 top-4 h-44 w-44 rounded-full bg-[#145fd1]/15 blur-3xl" />
      <div className="relative border-y border-[#2a394f]">
        <div className="flex items-center gap-4 py-5">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#2b5a9f] bg-[#10284c]">
            <ShieldCheck className="h-5 w-5 text-[#74a7ff]" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">Our operating principles</p>
            <p className="mt-1 text-xs text-[#95a3b5]">Human-approved boundaries around useful automation</p>
          </div>
        </div>
        {principles.map(([title, body], index) => (
          <div key={title} className="grid gap-2 border-t border-[#1d2b3e] py-5 sm:grid-cols-[0.42fr_0.58fr] sm:gap-8">
            <p className="text-base font-semibold text-white">0{index + 1}. {title}</p>
            <p className="text-sm leading-6 text-[#a9b5c4]">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlatformPreviewPanel() {
  const activity = [
    ['New enquiry captured', 'Ready for review'],
    ['Booking request prepared', 'Waiting on confirmation'],
    ['Follow-up action queued', 'Next step organised'],
  ];

  return (
    <VisualFrame>
      <VisualHeading title="Client workspace preview" description="Sample operational view — no customer data" icon={Gauge} />
      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-3 gap-2.5">
          {[
            ['Calls', PhoneCall],
            ['Bookings', CalendarCheck2],
            ['Follow-up', Send],
          ].map(([label, Icon]) => (
            <div key={label} className="rounded-[11px] border border-[#213149] bg-[#081522] p-3.5">
              <Icon className="h-4 w-4 text-[#6fa3ff]" aria-hidden="true" />
              <p className="mt-3 text-xs font-semibold text-white">{label}</p>
              <div className="mt-2 h-1.5 rounded-full bg-[#13243a]">
                <div className="h-full w-2/3 rounded-full bg-[#347cff]" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 overflow-hidden rounded-[12px] border border-[#213149] bg-[#081522]">
          <div className="flex items-center justify-between border-b border-[#1d2b3e] px-4 py-3">
            <p className="text-xs font-semibold text-white">Recent activity</p>
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6fa3ff]">Sample</span>
          </div>
          {activity.map(([title, status], index) => (
            <div key={title} className={`flex items-start gap-3 px-4 py-3.5 ${index ? 'border-t border-[#15243a]' : ''}`}>
              <CircleDot className="mt-0.5 h-4 w-4 shrink-0 text-[#568fee]" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold text-[#dbe5f0]">{title}</p>
                <p className="mt-1 text-[11px] leading-5 text-[#95a3b5]">{status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </VisualFrame>
  );
}

function SolutionPlaybookPanel({ title = 'AI receptionist workflow', items = [], icon: Icon = Layers3 }) {
  const visibleItems = (items.length ? items : [
    'Capture the right enquiry details',
    'Apply clear routing and escalation',
    'Prepare the next useful action',
  ]).slice(0, 4);

  return (
    <VisualFrame>
      <VisualHeading title="Solution playbook" description={title} icon={Icon} />
      <div className="p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-3 rounded-[12px] border border-[#2657a5] bg-[#0a1d37] p-4">
          <Search className="h-5 w-5 text-[#74a7ff]" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-white">Understand the enquiry</p>
            <p className="mt-1 text-xs text-[#a0aec0]">Use the right questions for this workflow</p>
          </div>
        </div>
        <div className="space-y-2.5">
          {visibleItems.map((item, index) => (
            <div key={item} className="flex items-start gap-3 rounded-[10px] border border-[#213149] bg-[#081522] px-4 py-3.5">
              <span className="mt-0.5 text-xs font-semibold text-[#6fa3ff]">0{index + 1}</span>
              <p className="text-xs leading-5 text-[#d0dae6]">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </VisualFrame>
  );
}

function OfferBriefPanel({ offer = '', sections = [] }) {
  const visibleSections = sections.slice(0, 3);

  return (
    <VisualFrame>
      <VisualHeading title="Your implementation brief" description="Scope, next steps and delivery stay clear" icon={FileCheck2} />
      <div className="p-5 sm:p-6">
        <div className="rounded-[12px] border border-[#2657a5] bg-[#0a1d37] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#76a7ff]">Offer</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-white">{offer || 'A focused AssistantAI workflow for your business'}</p>
        </div>
        <div className="mt-4 space-y-2.5">
          {(visibleSections.length ? visibleSections : [
            { title: 'Discover', body: 'Map the operating need' },
            { title: 'Configure', body: 'Build the right workflow' },
            { title: 'Launch', body: 'Test and go live' },
          ]).map((section, index) => (
            <div key={`${section.title}-${index}`} className="grid grid-cols-[auto_1fr] gap-3 rounded-[10px] border border-[#213149] bg-[#081522] p-3.5">
              <span className="text-xs font-semibold text-[#6fa3ff]">0{index + 1}</span>
              <div>
                <p className="text-xs font-semibold text-white">{section.title || `Step ${index + 1}`}</p>
                <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-[#95a3b5]">{section.body || section.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </VisualFrame>
  );
}

function HeroVisual({ variant, data = null }) {
  switch (variant) {
    case 'workflow':
      return <VoiceWorkflowPanel title={data?.title || 'Live call workflow'} />;
    case 'pricing':
      return <PricingPreviewPanel plans={data?.plans} />;
    case 'integrations':
      return <IntegrationMapPanel items={data?.items} />;
    case 'industries':
      return <IndustryRoutingPanel items={data?.items} />;
    case 'blog':
      return <EditorialPanel mode="blog" items={data?.items} />;
    case 'resources':
      return <EditorialPanel mode="resources" items={data?.items} />;
    case 'outcomes':
      return <CaseOutcomePanel items={data?.items} />;
    case 'principles':
      return <PrinciplesPanel />;
    case 'platform':
      return <PlatformPreviewPanel />;
    case 'solution':
      return <SolutionPlaybookPanel title={data?.title} items={data?.items} icon={data?.icon} />;
    case 'offer':
      return <OfferBriefPanel offer={data?.offer} sections={data?.sections} />;
    case 'assistant':
    default:
      return <AssistantOrbitPanel />;
  }
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
