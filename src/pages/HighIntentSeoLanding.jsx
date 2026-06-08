import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight, Bot, CalendarCheck, CheckCircle2, Clock3, MessageSquareText, PhoneCall, ShieldCheck, Sparkles, Target, Zap } from 'lucide-react';
import SEO from '../components/SEO';
import VapiReceptionistDemoButton from '@/components/voice/VapiReceptionistDemoButton';

const landingPages = {
  'ai-receptionist-australia': {
    title: 'AI Receptionist Australia | 24/7 Call Answering & Lead Capture | AssistantAI',
    description: 'AssistantAI provides AI receptionist systems for Australian service businesses that answer calls, capture leads, qualify enquiries, and support fast follow-up.',
    canonicalPath: '/ai-receptionist-australia',
    eyebrow: 'AI RECEPTIONIST AUSTRALIA',
    h1: 'AI Receptionist for Australian Service Businesses',
    intro: 'Answer more calls, capture more enquiries, and stop high-intent leads disappearing after hours. AssistantAI gives Australian service businesses a practical AI receptionist that can answer, qualify, record, and route enquiries before your team loses the opportunity.',
    primaryKeyword: 'AI receptionist Australia',
    secondary: ['AI virtual receptionist Australia', 'AI phone receptionist', 'AI receptionist for small business', '24/7 AI call answering'],
    pain: 'Most service businesses do not lose leads because the offer is weak. They lose them because nobody answers quickly enough, details are missed, or follow-up happens too late.',
    outcomes: ['24/7 AI call answering for new enquiries', 'Lead capture with name, phone, email, service need, urgency, and location', 'Clear escalation when a human needs to step in', 'Follow-up-ready records your team can action quickly'],
    useCases: ['Trades and field service businesses', 'Clinics and appointment-based operators', 'Real estate and property teams', 'Legal, finance, and consulting firms'],
    faq: [
      ['What does an AI receptionist do?', 'It answers inbound enquiries, asks structured questions, captures contact details, identifies intent, and routes the lead or next action to your team.'],
      ['Is this built for Australian businesses?', 'Yes. AssistantAI is positioned for Australian service businesses that need practical call answering, enquiry capture, booking support, and follow-up workflows.'],
      ['Can it replace a human receptionist?', 'It can handle repetitive first-response and enquiry capture. Complex, sensitive, or high-value cases should still escalate to a person.']
    ],
    icon: PhoneCall,
  },
  'ai-phone-assistant-small-business': {
    title: 'AI Phone Assistant for Small Business | Capture Calls & Leads | AssistantAI',
    description: 'AI phone assistant for small businesses that answers calls, captures enquiries, reduces missed calls, and helps convert more leads into booked jobs or consultations.',
    canonicalPath: '/ai-phone-assistant-small-business',
    eyebrow: 'AI PHONE ASSISTANT',
    h1: 'AI Phone Assistant for Small Business',
    intro: 'A small business cannot afford missed calls, slow replies, or messy lead notes. AssistantAI gives your business an AI phone assistant that answers consistently, captures the right information, and gives your team clean next steps.',
    primaryKeyword: 'AI phone assistant for small business',
    secondary: ['small business AI receptionist', 'AI call assistant', 'AI phone answering service', 'automated phone assistant'],
    pain: 'Small teams are usually too busy delivering the work to answer every enquiry properly. That creates lost jobs, weak follow-up, and poor visibility on where leads are coming from.',
    outcomes: ['Answers routine phone enquiries while your team is busy', 'Captures structured lead details instead of loose notes', 'Helps separate serious buyers from low-quality enquiries', 'Supports quick SMS/email follow-up after the call'],
    useCases: ['Owner-operated service businesses', 'Growing teams without full-time admin', 'Businesses with after-hours enquiry demand', 'Companies spending on ads but losing calls'],
    faq: [
      ['Who is this best for?', 'Businesses that receive phone enquiries but do not have consistent reception or admin coverage.'],
      ['Can it qualify leads?', 'Yes. The assistant can ask structured questions to understand service need, urgency, area, and buyer intent.'],
      ['Does it support follow-up?', 'Yes. AssistantAI is designed around reception plus enquiry capture and follow-up visibility.']
    ],
    icon: Bot,
  },
  'missed-call-automation-australia': {
    title: 'Missed Call Automation Australia | Recover Lost Leads | AssistantAI',
    description: 'Missed call automation for Australian service businesses. Capture missed calls, trigger fast follow-up, and stop paid leads leaking from your sales process.',
    canonicalPath: '/missed-call-automation-australia',
    eyebrow: 'MISSED CALL AUTOMATION',
    h1: 'Missed Call Automation for Australian Businesses',
    intro: 'Every missed call can be a lost job. AssistantAI helps Australian service businesses recover missed enquiries with faster capture, clear routing, and follow-up workflows that protect paid traffic and referral opportunities.',
    primaryKeyword: 'missed call automation Australia',
    secondary: ['missed call text back', 'missed call lead recovery', 'automated missed call follow up', 'missed call management for service business'],
    pain: 'If a prospect calls and gets no useful response, they usually keep searching. The business that replies first often wins the job.',
    outcomes: ['Reduce missed-call lead leakage', 'Capture contact details and service intent faster', 'Create an auditable trail of enquiry activity', 'Escalate urgent or high-value opportunities'],
    useCases: ['Google Ads campaigns', 'After-hours calls', 'Busy trade teams', 'Multi-location service businesses'],
    faq: [
      ['Why is missed call automation valuable?', 'It reduces the gap between enquiry and response, which is where many service businesses lose high-intent buyers.'],
      ['Does this replace call answering?', 'It complements call answering. The best setup answers where possible and recovers missed opportunities when no human is available.'],
      ['Can it help with paid ads?', 'Yes. It protects ad spend by reducing the number of paid leads lost through unanswered calls or delayed follow-up.']
    ],
    icon: Clock3,
  },
  'ai-lead-follow-up-automation': {
    title: 'AI Lead Follow-Up Automation | Convert More Enquiries | AssistantAI',
    description: 'AI lead follow-up automation for service businesses. Capture enquiries, qualify intent, and support faster SMS/email follow-up so fewer leads go cold.',
    canonicalPath: '/ai-lead-follow-up-automation',
    eyebrow: 'AI LEAD FOLLOW-UP',
    h1: 'AI Lead Follow-Up Automation That Stops Leads Going Cold',
    intro: 'Lead capture is only valuable if your team follows up quickly and consistently. AssistantAI helps turn calls and forms into structured lead records, clear next steps, and faster follow-up actions.',
    primaryKeyword: 'AI lead follow-up automation',
    secondary: ['automated lead follow up', 'AI lead qualification', 'lead response automation', 'sales follow-up automation'],
    pain: 'Many businesses have enough enquiries but poor conversion discipline. Leads sit in inboxes, staff forget details, and interested buyers move on.',
    outcomes: ['Capture enquiries into structured lead records', 'Identify buyer intent and urgency', 'Support fast SMS/email follow-up', 'Give owners clearer visibility over pipeline activity'],
    useCases: ['Service businesses with quote requests', 'Businesses running paid ads', 'Teams with multiple inboxes and phone numbers', 'Companies with slow sales follow-up'],
    faq: [
      ['What is AI lead follow-up automation?', 'It is the process of using AI and workflow automation to capture enquiries, classify intent, and support timely follow-up actions.'],
      ['Does it work with calls and forms?', 'AssistantAI is designed to support enquiry capture across calls and public forms, then make follow-up easier for the team.'],
      ['Why does speed matter?', 'High-intent prospects often contact several providers. Faster, clearer follow-up improves your chance of winning the job.']
    ],
    icon: MessageSquareText,
  },
  'ai-appointment-booking-assistant': {
    title: 'AI Appointment Booking Assistant | Calls, Enquiries & Booking Intent | AssistantAI',
    description: 'AI appointment booking assistant for service businesses. Capture booking intent, qualify enquiries, and hand off to your live calendar or booking process.',
    canonicalPath: '/ai-appointment-booking-assistant',
    eyebrow: 'AI BOOKING ASSISTANT',
    h1: 'AI Appointment Booking Assistant for Service Businesses',
    intro: 'Bookings fall apart when staff are busy, calls are missed, or clients do not know the next step. AssistantAI captures booking intent, qualifies the enquiry, and can hand off to your live booking process.',
    primaryKeyword: 'AI appointment booking assistant',
    secondary: ['AI booking assistant', 'appointment booking automation', 'AI scheduling assistant', 'automated appointment booking'],
    pain: 'A booking enquiry without clear next steps is a leak in the sales system. Customers want speed, clarity, and confirmation.',
    outcomes: ['Capture preferred service, timing, and contact details', 'Qualify appointment intent before staff follow-up', 'Support handoff to calendar or booking URL', 'Reduce admin pressure around repetitive booking questions'],
    useCases: ['Clinics and allied health', 'Beauty and wellness operators', 'Consulting and professional services', 'Home service appointments'],
    faq: [
      ['Can it book directly into a calendar?', 'It can support booking handoff and can be connected to external booking tools depending on the client setup.'],
      ['What information can it capture?', 'Service type, preferred time, urgency, location, contact details, and relevant notes for the team.'],
      ['Is it only for appointments?', 'No. The same structure also supports quote requests, strategy calls, demos, and service enquiries.']
    ],
    icon: CalendarCheck,
  },
  'ai-receptionist-for-trades': {
    title: 'AI Receptionist for Trades | Capture Jobs & Missed Calls | AssistantAI',
    description: 'AI receptionist for trades businesses. Answer calls, capture job details, recover missed enquiries, and help tradies convert more calls into booked work.',
    canonicalPath: '/ai-receptionist-for-trades',
    eyebrow: 'AI RECEPTIONIST FOR TRADES',
    h1: 'AI Receptionist for Trades and Field Service Teams',
    intro: 'Tradies lose work when calls arrive on the tools, after hours, or while driving between jobs. AssistantAI captures job details, urgency, location, and contact information so your team can quote or respond faster.',
    primaryKeyword: 'AI receptionist for trades',
    secondary: ['AI receptionist for plumbers', 'AI receptionist for electricians', 'AI call answering for tradies', 'trade business call answering'],
    pain: 'The highest-intent trade leads usually come through the phone. If the call is missed or poorly handled, the customer calls the next business.',
    outcomes: ['Capture job type, suburb, urgency, and contact details', 'Support after-hours enquiry handling', 'Separate emergency work from routine quotes', 'Protect Google Ads and local SEO leads'],
    useCases: ['Plumbing, electrical, HVAC, cleaning, maintenance, roofing, landscaping, and mobile service teams'],
    faq: [
      ['Why do tradies need an AI receptionist?', 'Because calls often arrive while the team is on site, driving, or unavailable, and those leads can be high value.'],
      ['Can it capture job details?', 'Yes. It can ask structured trade-specific questions around job type, urgency, location, access, and contact details.'],
      ['Can it work after hours?', 'Yes. After-hours coverage is one of the strongest use cases for trade and field service businesses.']
    ],
    icon: ShieldCheck,
  },
};

function LandingSection({ page }) {
  const Icon = page.icon || Sparkles;
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: page.h1,
      provider: { '@type': 'Organization', name: 'AssistantAI', url: 'https://www.assistantai.com.au/' },
      areaServed: { '@type': 'Country', name: 'Australia' },
      serviceType: page.primaryKeyword,
      description: page.description,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faq.map(([question, answer]) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    }
  ];

  return (
    <>
      <SEO title={page.title} description={page.description} canonicalPath={page.canonicalPath} structuredData={structuredData} />
      <section className="relative overflow-hidden py-24 md:py-32 bg-grid">
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300">
                <Icon className="h-4 w-4" />
                {page.eyebrow}
              </div>
              <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight text-white md:text-6xl">{page.h1}</h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-300">{page.intro}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/GetStartedNow" className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-4 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-cyan-500/25">
                  Get Started Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <VapiReceptionistDemoButton variant="secondary" className="min-h-0 px-8 py-4 text-sm" showFallbackText />
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#11111a]/90 p-6 shadow-2xl shadow-cyan-950/20 md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Search intent target</p>
              <h2 className="mt-3 text-2xl font-bold text-white">{page.primaryKeyword}</h2>
              <p className="mt-4 text-gray-400 leading-7">{page.pain}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {page.secondary.map((keyword) => <span key={keyword} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300">{keyword}</span>)}
              </div>
            </div>
          </div>

          <div className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {page.outcomes.map((outcome) => (
              <div key={outcome} className="rounded-2xl border border-white/5 bg-[#12121a] p-6">
                <CheckCircle2 className="h-6 w-6 text-cyan-400" />
                <p className="mt-4 text-base leading-7 text-gray-300">{outcome}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/5 bg-[#12121a] p-8">
              <Target className="h-8 w-8 text-cyan-400" />
              <h2 className="mt-4 text-3xl font-bold text-white">Built for buying intent, not vanity traffic</h2>
              <p className="mt-4 text-gray-400 leading-8">These pages are written for prospects already looking for a practical AI reception, missed-call, booking, or follow-up system. The goal is to capture commercial search demand and move visitors toward a demo or setup conversation.</p>
            </div>
            <div className="rounded-3xl border border-white/5 bg-[#12121a] p-8">
              <Zap className="h-8 w-8 text-cyan-400" />
              <h2 className="mt-4 text-3xl font-bold text-white">Best-fit use cases</h2>
              <ul className="mt-5 space-y-4">
                {page.useCases.map((item) => <li key={item} className="flex items-start gap-3 text-gray-300 leading-7"><span className="mt-2 h-2 w-2 rounded-full bg-cyan-400" />{item}</li>)}
              </ul>
            </div>
          </div>

          <div className="mt-16 rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-8 md:p-10">
            <h2 className="text-3xl font-bold text-white">Frequently asked questions</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {page.faq.map(([question, answer]) => (
                <div key={question} className="rounded-2xl border border-white/10 bg-black/20 p-6">
                  <h3 className="font-bold text-white">{question}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-400">{answer}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-white">Ready to capture more high-intent enquiries?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-400">Start with AssistantAI’s AI receptionist and lead capture system, then connect booking, follow-up, payments, and reporting as your workflow matures.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to="/Pricing" className="inline-flex items-center justify-center rounded-full border border-white/10 px-8 py-4 text-sm font-semibold text-white hover:bg-white/5">View Pricing</Link>
              <Link to="/BookStrategyCall" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-slate-950 hover:bg-cyan-100">Book Strategy Call <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function HighIntentSeoLanding() {
  const { slug } = useParams();
  const page = landingPages[slug];
  if (!page) return <Navigate to="/Services" replace />;
  return <LandingSection page={page} />;
}

export { landingPages };
