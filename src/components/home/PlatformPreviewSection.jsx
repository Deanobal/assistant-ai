import { Link } from 'react-router-dom';
import { ArrowRight, PhoneCall, Users, CalendarCheck2, Send, ClipboardCheck } from 'lucide-react';

const previewItems = [
  { icon: PhoneCall, label: 'Calls Handled', value: 'Tracked', helper: 'Every call tracked in one place' },
  { icon: Users, label: 'Enquiries Qualified', value: 'Clear', helper: 'See which leads are ready to move forward' },
  { icon: CalendarCheck2, label: 'Secure Signup', value: 'Ready', helper: 'Starter and Growth buyers can start through secure checkout' },
  { icon: Send, label: 'Follow-Up', value: 'Fast', helper: 'SMS and email actions help keep leads warm' },
  { icon: ClipboardCheck, label: 'Setup Progress', value: 'Visible', helper: 'Track what is happening after a client signs up' },
];

export default function PlatformPreviewSection() {
  return (
    <section className="relative overflow-hidden py-18 md:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/15 to-transparent" />

      <div className="mx-auto max-w-[88rem] px-5 sm:px-8 lg:px-10">
        <div className="mb-10 max-w-3xl md:mb-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-blue-300">Example platform preview</p>
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white md:text-5xl md:leading-[1.06]">
            See how every enquiry is handled.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            AssistantAI gives you visibility over calls, enquiries, follow-up, and setup progress.
          </p>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-blue-200/[0.12] bg-[linear-gradient(145deg,rgba(14,23,40,0.96),rgba(7,12,22,0.98))] shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
          <div className="flex flex-col gap-4 border-b border-blue-200/[0.1] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 md:px-8">
            <div>
              <p className="text-lg font-semibold tracking-[-0.02em] text-white">AssistantAI platform</p>
              <p className="mt-1 text-base leading-7 text-slate-400">
                A clear view of the customer journey from first call through to setup.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-400/[0.06] px-3.5 py-2 text-sm font-medium text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.65)]" aria-hidden="true" />
              Example workflow
            </div>
          </div>

          <div className="grid gap-px bg-blue-200/[0.08] sm:grid-cols-2 xl:grid-cols-5">
            {previewItems.map((item) => (
              <article
                key={item.label}
                className="group relative min-h-[15.5rem] bg-[#09101d] p-5 transition-colors duration-200 hover:bg-[#0c1525] sm:p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-200/[0.16] bg-[linear-gradient(145deg,rgba(82,118,255,0.16),rgba(18,30,51,0.92))] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_28px_rgba(0,0,0,0.2)]">
                  <item.icon className="h-5 w-5 text-blue-100 drop-shadow-[0_0_10px_rgba(113,150,255,0.28)]" strokeWidth={1.8} aria-hidden="true" />
                </div>

                <p className="mt-6 text-sm font-medium uppercase tracking-[0.08em] text-slate-400">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-white">{item.value}</p>
                <p className="mt-3 text-[0.95rem] leading-7 text-slate-400">{item.helper}</p>

                <div className="absolute inset-x-6 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-blue-400/70 to-transparent transition-transform duration-300 group-hover:scale-x-100" aria-hidden="true" />
              </article>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <Link
            to="/Platform"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-blue-300/20 bg-blue-500/[0.07] px-5 py-3 text-base font-semibold text-blue-100 transition hover:border-blue-300/40 hover:bg-blue-500/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            View Platform Preview
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
