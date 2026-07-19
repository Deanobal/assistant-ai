import { Link } from 'react-router-dom';
import { ArrowRight, Bot, CheckCircle2, MessageSquareText, PhoneCall, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import SEO from '../components/SEO';
import VapiReceptionistDemoButton from '@/components/voice/VapiReceptionistDemoButton';

const SITE_URL = 'https://www.assistantai.com.au';
const pageTitle = 'AI Assistant Australia | Calls, Leads, Bookings & Follow-Up | AssistantAI';
const pageDescription = 'AssistantAI provides an AI assistant for Australian service businesses that answers calls, captures leads, qualifies enquiries, supports bookings, and helps teams follow up faster.';

const outcomes = [
  'Answer inbound enquiries when your team is busy, after hours, or already on another job',
  'Capture name, phone, email, service need, urgency, location, and buyer intent',
  'Qualify callers before they reach your team so follow-up is faster and cleaner',
  'Support booking handoff, SMS/email follow-up, and CRM-ready lead records',
];

const useCases = [
  'Service businesses losing calls while staff are on site or driving',
  'Companies spending on Google Ads that need every lead captured properly',
  'Teams that need a practical AI assistant for calls, forms, follow-up, and bookings',
  'Owners who want better response speed without hiring full-time admin immediately',
];

const capabilities = [
  { icon: PhoneCall, title: 'Call answering', body: 'Your AI assistant can answer routine inbound enquiries and collect the information your team needs.' },
  { icon: MessageSquareText, title: 'Lead capture', body: 'It captures structured lead details instead of loose notes, missed calls, or scattered inbox messages.' },
  { icon: ShieldCheck, title: 'Smart routing', body: 'Urgent, complex, or Enterprise-style enquiries can be escalated for human review.' },
  { icon: Zap, title: 'Follow-up support', body: 'Qualified leads can move toward SMS, email, booking, checkout, or CRM workflows depending on your setup.' },
];

const faq = [
  ['What is an AI assistant for business?', 'An AI assistant for business helps answer enquiries, capture customer details, qualify intent, support bookings, and prepare follow-up actions so staff can respond faster.'],
  ['Is AssistantAI an AI assistant or an AI receptionist?', 'It is both. AssistantAI is positioned as an AI receptionist for calls and as an AI assistant for lead capture, booking support, follow-up, and workflow automation.'],
  ['Who is this built for?', 'AssistantAI is built for Australian service businesses such as trades, cleaning companies, clinics, real estate teams, property maintenance operators, law firms, and other appointment or enquiry-based businesses.'],
  ['Can the AI assistant take payments?', 'Starter and Growth buyers can be moved toward secure signup when appropriate. Enterprise or complex workflows should be reviewed before setup.'],
];

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE_URL}/ai-assistant-australia#service`,
    name: 'AI Assistant Australia',
    provider: { '@id': `${SITE_URL}/#organization` },
    serviceType: 'AI assistant, AI receptionist, call answering, lead capture, booking support, follow-up automation',
    areaServed: 'AU',
    audience: { '@type': 'BusinessAudience', audienceType: 'Australian service businesses' },
    url: `${SITE_URL}/ai-assistant-australia`,
    description: pageDescription,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  },
];

export default function AiAssistantAustralia() {
  return (
    <>
      <SEO title={pageTitle} description={pageDescription} canonicalPath="/ai-assistant-australia" structuredData={structuredData} />
      <section className="relative overflow-hidden bg-[#07070d] py-24 md:py-32">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute left-1/2 top-0 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300">
                <Bot className="h-4 w-4" /> AI ASSISTANT AUSTRALIA
              </div>
              <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight text-white md:text-6xl">
                AI Assistant for Australian Service Businesses
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-300">
                AssistantAI gives service businesses a practical AI assistant that answers calls, captures leads, qualifies enquiries, supports booking handoff, and helps your team follow up faster.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/GetStartedNow" className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-4 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-cyan-500/25">
                  Get Started Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <VapiReceptionistDemoButton variant="secondary" className="min-h-0 px-8 py-4 text-sm" showFallbackText />
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#11111a]/90 p-6 shadow-2xl shadow-cyan-950/20 md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Solution focus</p>
              <h2 className="mt-3 text-2xl font-bold text-white">AI assistant for calls, leads, bookings and follow-up</h2>
              <p className="mt-4 leading-7 text-gray-400">
                This page targets buyers who search broadly for an AI assistant, but need a real business system behind it: phone answering, enquiry capture, workflow routing, and conversion support.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {['AI assistant Australia', 'AI assistant for business', 'AI virtual assistant', 'AI call assistant', 'AI lead assistant', 'AI receptionist'].map((keyword) => (
                  <span key={keyword} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300">{keyword}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {outcomes.map((outcome) => (
              <div key={outcome} className="rounded-2xl border border-white/5 bg-[#12121a] p-6">
                <CheckCircle2 className="h-6 w-6 text-cyan-400" />
                <p className="mt-4 text-base leading-7 text-gray-300">{outcome}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {capabilities.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-3xl border border-white/5 bg-[#12121a] p-6">
                  <Icon className="h-7 w-7 text-cyan-400" />
                  <h2 className="mt-4 text-xl font-bold text-white">{item.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-gray-400">{item.body}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/5 bg-[#12121a] p-8">
              <Sparkles className="h-8 w-8 text-cyan-400" />
              <h2 className="mt-4 text-3xl font-bold text-white">Built for real service-business work</h2>
              <p className="mt-4 leading-8 text-gray-400">
                Generic AI assistants are useful, but service businesses need an assistant that can handle live enquiry flow: calls, forms, urgency, contact details, bookings, CRM follow-up, and clear escalation rules.
              </p>
            </div>
            <div className="rounded-3xl border border-white/5 bg-[#12121a] p-8">
              <Target className="h-8 w-8 text-cyan-400" />
              <h2 className="mt-4 text-3xl font-bold text-white">Best-fit use cases</h2>
              <ul className="mt-5 space-y-4">
                {useCases.map((item) => <li key={item} className="flex items-start gap-3 leading-7 text-gray-300"><span className="mt-2 h-2 w-2 rounded-full bg-cyan-400" />{item}</li>)}
              </ul>
            </div>
          </div>

          <div className="mt-16 rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-8 md:p-10">
            <h2 className="text-3xl font-bold text-white">AI assistant FAQs</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {faq.map(([question, answer]) => (
                <div key={question} className="rounded-2xl border border-white/10 bg-black/20 p-6">
                  <h3 className="font-bold text-white">{question}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-400">{answer}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-white">Ready to turn your AI assistant into a revenue system?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-400">Start with call answering and lead capture, then connect booking, follow-up, payments, and reporting as your workflow matures.</p>
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
