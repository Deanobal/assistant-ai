import React from 'react';
import { motion } from 'framer-motion';
import { Calculator, DollarSign, PhoneCall, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CAPTURE_RATE = 0.95;
const CONVERSION_RATE = 0.35;

export default function ROICalculator() {
  const [missedCalls, setMissedCalls] = React.useState(40);
  const [avgJobValue, setAvgJobValue] = React.useState(450);

  const captured = Math.round(missedCalls * CAPTURE_RATE);
  const newJobs = Math.round(captured * CONVERSION_RATE);
  const monthlyRevenue = Math.round(newJobs * avgJobValue);
  const yearlyRevenue = monthlyRevenue * 12;

  const resultCards = [
  { label: 'Captured leads', value: captured, helper: '95% answer rate' },
  { label: 'New jobs', value: newJobs, helper: '35% conversion' },
  { label: 'Monthly revenue', value: `$${monthlyRevenue.toLocaleString()}`, helper: 'Potential revenue captured' },
  { label: 'Yearly revenue', value: `$${yearlyRevenue.toLocaleString()}`, helper: 'Projected over 12 months' }];


  return (
    <section className="relative bg-[#070a12] py-16 md:py-24">
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(34,211,238,0.06) 0%, transparent 65%)' }} />

      <div className="relative mx-auto max-w-5xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center">
          
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-1.5">
            <Calculator className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-300">Revenue Calculator</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Reveal The Revenue Your Missed Calls Could Capture
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-400">
            Move the sliders to estimate how much potential revenue AssistantAI.com.au could help capture by answering missed calls, qualifying leads, and moving customers to the next step.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0f18]/90 shadow-[0_24px_90px_rgba(6,182,212,0.08)] backdrop-blur-xl">
          
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

          <div className="grid divide-y divide-white/8 md:grid-cols-2 md:divide-x md:divide-y-0">
            <div className="p-8 md:p-10">
              <h3 className="mb-6 text-base font-semibold text-white">Your numbers</h3>

              <div className="space-y-8">
                <div>
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <label className="text-sm font-medium text-slate-300">Monthly missed calls</label>
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm font-semibold text-cyan-300">{missedCalls}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <PhoneCall className="h-4 w-4 text-slate-500" />
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="1"
                      value={missedCalls}
                      onChange={(event) => setMissedCalls(Number(event.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan-400" />
                    
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-slate-600"><span className="text-lg">0</span><span className="text-lg">200</span></div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <label className="text-sm font-medium text-slate-300">Average job value</label>
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm font-semibold text-cyan-300">${avgJobValue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-slate-500" />
                    <input
                      type="range"
                      min="100"
                      max="5000"
                      step="50"
                      value={avgJobValue}
                      onChange={(event) => setAvgJobValue(Number(event.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan-400" />
                    
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-slate-600"><span className="text-lg">$100</span><span className="text-lg">$5,000</span></div>
                </div>

                <p className="rounded-xl border border-white/5 bg-white/[0.02] p-4 leading-6 text-slate-500 text-lg">Adjust the values above to see the potential revenue captured when more missed calls are answered and qualified by your AI receptionist.

                </p>
              </div>
            </div>

            <div className="flex flex-col p-8 md:p-10">
              <h3 className="mb-6 text-base font-semibold text-white">Potential with AssistantAI.com.au</h3>

              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                {resultCards.map((card) =>
                <div key={card.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                    <p className="mb-2 text-slate-500 text-base">{card.label}</p>
                    <p className="text-2xl font-bold text-white">{card.value}</p>
                    <p className="mt-1 text-slate-600 text-base">{card.helper}</p>
                  </div>
                )}
              </div>

              <div className="mt-5 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-5">
                <p className="text-white/70 text-base">Revenue you could be capturing</p>
                <p className="mt-1 text-3xl font-bold text-white">${monthlyRevenue.toLocaleString()}<span className="text-lg font-normal text-white/70">/mo</span></p>
                <p className="mt-1 text-white/60 text-sm">${yearlyRevenue.toLocaleString()} per year</p>
              </div>

              <Link
                to="/BookStrategyCall"
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-white transition-colors hover:bg-white/[0.08] font-medium text-base">Book a free strategy call



              </Link>
            </div>
          </div>
        </motion.div>

        <p className="mt-4 text-center text-xs leading-6 text-slate-600">
          Assumptions: 95% of missed calls are answered by the AI receptionist, 35% of captured leads convert into jobs, and revenue is calculated from the selected average job value.
        </p>
      </div>
    </section>);

}