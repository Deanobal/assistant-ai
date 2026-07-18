import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import SEO from '@/components/SEO';
import VapiReceptionistDemoButton from '@/components/voice/VapiReceptionistDemoButton';

const capabilities = [
  'Answer real enquiries through the browser voice demo',
  'Qualify the business and identify the main problem',
  'Recommend Starter, Growth, or Enterprise without forcing a plan',
  'Capture contact details for follow-up and CRM workflow',
  'Offer secure signup to ready Starter and Growth buyers',
  'Escalate Enterprise or complex workflows for human review',
];

const liveFlow = [
  {
    title: 'Answer the enquiry',
    body: 'The receptionist starts like a real front desk, then works out what the caller needs.',
  },
  {
    title: 'Qualify the buyer',
    body: 'It asks about missed calls, bookings, CRM, follow-up, locations, and urgency.',
  },
  {
    title: 'Recommend the right path',
    body: 'Starter and Growth buyers can move toward signup. Enterprise cases are escalated.',
  },
  {
    title: 'Trigger the next step',
    body: 'Qualified buyers can be captured, sent to checkout, or handed to a human for review.',
  },
];

export default function AIDemo() {
  return (
    <>
      <SEO
        title="Live AI Receptionist Demo | AssistantAI"
        description="Talk to the live AssistantAI receptionist demo. See how it answers enquiries, qualifies buyers, recommends Starter or Growth, and escalates Enterprise workflows for review."
        canonicalPath="/AIDemo"
      />

      <section className="relative overflow-hidden bg-[#07070d] py-20 sm:py-24 md:py-28">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 text-xs font-medium text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" /> Live AI Receptionist Demo
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Talk to the AI Receptionist That Turns Enquiries Into Action
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-400 sm:text-lg">
              Start a live browser voice call with AssistantAI. It can answer questions, qualify your business, recommend the right plan, and help ready buyers move toward secure signup.
            </p>

            <div className="mx-auto mt-8 flex max-w-md flex-col items-center justify-center gap-3 sm:max-w-none sm:flex-row">
              <VapiReceptionistDemoButton className="w-full px-8 py-4 sm:w-auto" showFallbackText />
              <Link
                to="/GetStartedNow"
                className="inline-flex min-h-[3.5rem] w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-8 py-4 text-base font-semibold text-white transition hover:bg-white/[0.08] sm:w-auto"
              >
                Get Started Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-500">
              Browser microphone permission is required. The demo runs through the live receptionist flow, not a pre-recorded sample.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-[28px] border border-white/8 bg-[#11111a]/80 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl"
            >
              <h2 className="text-xl font-bold text-white">What the AI Can Do</h2>
              <div className="mt-5 space-y-4">
                {capabilities.map((item) => (
                  <div key={item} className="flex gap-3 text-sm leading-7 text-slate-300 sm:text-base">
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-cyan-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="rounded-[28px] border border-white/8 bg-[#11111a]/80 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl"
            >
              <h2 className="text-xl font-bold text-white">Live Sales Flow</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {liveFlow.map((item, index) => (
                  <div key={item.title} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-sm font-semibold text-cyan-300">Step {index + 1}</p>
                    <h3 className="mt-2 font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{item.body}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
