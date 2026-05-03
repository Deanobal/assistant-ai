import React from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Clock, DollarSign, PhoneCall, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const DEFAULT_AVG_JOB = 450;
const CAPTURE_RATE = 0.95;
const CONVERSION_RATE = 0.35;
const MINS_PER_CALL = 8; // admin time per missed call follow-up

export default function ROICalculator() {
  const [missedCalls, setMissedCalls] = React.useState('');
  const [avgJobValue, setAvgJobValue] = React.useState('');

  const missed = Math.max(0, parseInt(missedCalls) || 0);
  const jobValue = parseFloat(avgJobValue) || DEFAULT_AVG_JOB;

  const captured = Math.round(missed * CAPTURE_RATE);
  const newJobs = Math.round(captured * CONVERSION_RATE);
  const monthlyRevenue = Math.round(newJobs * jobValue);
  const yearlyRevenue = monthlyRevenue * 12;
  const timeSavedHrsMonth = Math.round((missed * MINS_PER_CALL) / 60);

  const hasInput = missed > 0;

  return (
    <section className="relative py-16 md:py-24 bg-[#070a12]">
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-30" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(34,211,238,0.06) 0%, transparent 65%)' }} />

      <div className="relative mx-auto max-w-5xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-1.5 mb-5">
            <Calculator className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-300">Revenue Calculator</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            How Much Are Missed Calls<br className="hidden sm:block" /> Costing You?
          </h2>
          <p className="mt-4 text-base text-slate-400 max-w-xl mx-auto leading-7">
            Enter your monthly missed calls and see exactly what you're leaving on the table.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="relative rounded-[28px] border border-white/10 bg-[#0b0f18]/90 overflow-hidden shadow-[0_24px_90px_rgba(6,182,212,0.08)] backdrop-blur-xl"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/8">
            {/* Inputs */}
            <div className="p-8 md:p-10">
              <h3 className="text-base font-semibold text-white mb-6">Your numbers</h3>

              <div className="space-y-6">
                {/* Primary input */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Monthly missed calls <span className="text-cyan-400">*</span>
                  </label>
                  <div className="relative">
                    <PhoneCall className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 40"
                      value={missedCalls}
                      onChange={(e) => setMissedCalls(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-11 pr-4 py-3 text-white text-lg font-semibold placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">Calls that ring out, go to voicemail, or are never returned</p>
                </div>

                {/* Secondary input */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Average job value <span className="text-slate-500 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">$</span>
                    <input
                      type="number"
                      min="0"
                      placeholder={`${DEFAULT_AVG_JOB} (default)`}
                      value={avgJobValue}
                      onChange={(e) => setAvgJobValue(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-8 pr-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">Average value of a booked job in your business</p>
                </div>

                {/* Assumptions */}
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs text-slate-500 space-y-1">
                  <p className="font-medium text-slate-400 mb-2">Assumptions used</p>
                  <p>• 95% of missed calls answered by AI</p>
                  <p>• 35% of captured leads convert to a job</p>
                  <p>• 8 mins admin saved per missed call</p>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="p-8 md:p-10 flex flex-col">
              <h3 className="text-base font-semibold text-white mb-6">Your potential with AssistantAI</h3>

              {hasInput ? (
                <div className="flex flex-col gap-4 flex-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <p className="text-xs text-slate-500 mb-1">Calls captured</p>
                      <p className="text-2xl font-bold text-white">{captured}</p>
                      <p className="text-xs text-slate-600 mt-0.5">per month</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <p className="text-xs text-slate-500 mb-1">New jobs booked</p>
                      <p className="text-2xl font-bold text-cyan-400">{newJobs}</p>
                      <p className="text-xs text-slate-600 mt-0.5">per month</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Time saved</p>
                      <p className="text-xl font-bold text-white">{timeSavedHrsMonth} hrs <span className="text-slate-400 text-base font-normal">/ month</span></p>
                    </div>
                  </div>

                  {/* Hero result */}
                  <div className="rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-5 flex items-center gap-4 mt-auto">
                    <div className="h-11 w-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/70 text-sm">Revenue you could be capturing</p>
                      <p className="text-3xl font-bold text-white">${monthlyRevenue.toLocaleString()}<span className="text-lg font-normal text-white/70">/mo</span></p>
                      <p className="text-white/60 text-xs mt-0.5">${yearlyRevenue.toLocaleString()} per year</p>
                    </div>
                  </div>

                  <Link
                    to="/BookStrategyCall"
                    className="mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white hover:bg-white/[0.08] transition-colors"
                  >
                    Book a free strategy call
                    <ArrowRight className="h-4 w-4 text-cyan-300" />
                  </Link>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-white/[0.04] border border-white/8 flex items-center justify-center mb-4">
                    <TrendingUp className="h-7 w-7 text-slate-600" />
                  </div>
                  <p className="text-slate-500 text-sm">Enter your missed calls to see<br />your revenue opportunity</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}