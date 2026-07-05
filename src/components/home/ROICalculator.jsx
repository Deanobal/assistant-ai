import React from 'react';
import { motion } from 'framer-motion';
import { Calculator, DollarSign, PhoneCall, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CAPTURE_RATE = 0.7;
const CONVERSION_RATE = 0.2;

export default function ROICalculator() {
  const [missedCalls, setMissedCalls] = React.useState(40);
  const [avgJobValue, setAvgJobValue] = React.useState(450);

  const captured = Math.round(missedCalls * CAPTURE_RATE);
  const newJobs = Math.round(captured * CONVERSION_RATE);
  const monthlyRevenue = Math.round(newJobs * avgJobValue);
  const yearlyRevenue = monthlyRevenue * 12;

  const resultCards = [
    { label: 'Enquiries captured', value: captured, helper: 'Example estimate' },
    { label: 'New jobs', value: newJobs, helper: 'Example estimate' },
    { label: 'Monthly value', value: `$${monthlyRevenue.toLocaleString()}`, helper: 'Based on inputs' },
    { label: 'Yearly value', value: `$${yearlyRevenue.toLocaleString()}`, helper: 'Based on inputs' },
  ];

  return (
    <section className="relative bg-[#070a12] py-14 sm:py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-20 sm:opacity-30" />
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(34,211,238,0.05) 0%, transparent 65%)' }} />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-9 text-center sm:mb-12"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-1.5 sm:mb-5">
            <Calculator className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-300">Revenue Calculator</span>
          </div>
          <h2 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-4xl">
            Estimate What Missed Calls Could Be Worth
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base md:text-lg">
            Move the sliders to estimate how much potential revenue AssistantAI could help capture by answering missed calls and qualifying leads.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0b0f18]/90 shadow-[0_24px_90px_rgba(6,182,212,0.08)] backdrop-blur-xl sm:rounded-[28px]"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

          <div className="grid divide-y divide-white/8 md:grid-cols-2 md:divide-x md:divide-y-0">
            <div className="p-5 sm:p-7 md:p-10">
              <h3 className="mb-5 text-lg font-semibold text-white sm:text-xl md:mb-6">Your numbers</h3>

              <div className="space-y-7 sm:space-y-8">
                <SliderField
                  icon={PhoneCall}
                  label="Monthly missed calls"
                  value={missedCalls}
                  display={missedCalls}
                  min="0"
                  max="200"
                  step="1"
                  minLabel="0"
                  maxLabel="200"
                  onChange={setMissedCalls}
                />

                <SliderField
                  icon={DollarSign}
                  label="Average job value"
                  value={avgJobValue}
                  display={`$${avgJobValue.toLocaleString()}`}
                  min="100"
                  max="5000"
                  step="50"
                  minLabel="$100"
                  maxLabel="$5,000"
                  onChange={setAvgJobValue}
                />

                <p className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-sm leading-7 text-slate-500 sm:text-base">
                  Adjust the values above to see the potential value of answering and qualifying more missed calls.
                </p>
              </div>
            </div>

            <div className="flex flex-col p-5 sm:p-7 md:p-10">
              <h3 className="mb-5 text-lg font-semibold text-white sm:text-xl md:mb-6">Potential with AssistantAI</h3>

              <div className="grid flex-1 grid-cols-2 gap-3">
                {resultCards.map((card) => (
                  <div key={card.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 sm:p-5">
                    <p className="mb-2 text-xs leading-5 text-slate-500 sm:text-sm">{card.label}</p>
                    <p className="text-xl font-bold text-white sm:text-2xl">{card.value}</p>
                    <p className="mt-1 text-xs text-slate-600 sm:text-sm">{card.helper}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-5">
                <p className="text-sm text-white/70 sm:text-base">Example captured value</p>
                <p className="mt-1 text-3xl font-bold text-white">
                  ${monthlyRevenue.toLocaleString()}<span className="text-base font-normal text-white/70 sm:text-lg">/mo</span>
                </p>
                <p className="mt-1 text-sm text-white/60">${yearlyRevenue.toLocaleString()} per year</p>
              </div>

              <Link
                to="/GetStartedNow"
                className="mt-5 inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-base font-medium text-white transition-colors hover:bg-white/[0.08]"
              >
                Get Started Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>

        <p className="mt-4 text-center text-xs leading-6 text-slate-600 sm:text-sm">
          This calculator is an example only. Results depend on call volume, job value, follow-up speed, and your sales process.
        </p>
      </div>
    </section>
  );
}

function SliderField({ icon: Icon, label, value, display, min, max, step, minLabel, maxLabel, onChange }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-4">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm font-semibold text-cyan-300">{display}</span>
      </div>
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 shrink-0 text-slate-500" />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan-400"
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-slate-600 sm:text-sm">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}
