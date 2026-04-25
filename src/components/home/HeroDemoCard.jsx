import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Mic, PhoneCall, Play, Radio, Sparkles } from 'lucide-react';

const transcriptSteps = [
  {
    id: 1,
    speaker: 'Receptionist',
    text: 'Good morning — thanks for calling. How can I help?',
  },
  {
    id: 2,
    speaker: 'Caller',
    text: 'I need someone to call me back about a quote today.',
  },
  {
    id: 3,
    speaker: 'Receptionist',
    text: 'Absolutely. I’ve got your details and someone will call you shortly.',
  },
];

export default function HeroDemoCard() {
  const [started, setStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!started) return;

    if (stepIndex < transcriptSteps.length - 1) {
      const timer = window.setTimeout(() => setStepIndex((prev) => prev + 1), 1400);
      return () => window.clearTimeout(timer);
    }

    const doneTimer = window.setTimeout(() => setComplete(true), 1200);
    return () => window.clearTimeout(doneTimer);
  }, [started, stepIndex]);

  const handleStart = () => {
    setStarted(true);
    setStepIndex(0);
    setComplete(false);
  };

  const visibleTranscript = started ? transcriptSteps.slice(0, stepIndex + 1) : transcriptSteps.slice(0, 1);

  return (
    <div className="relative w-full max-w-[480px]">
      <div className="absolute inset-0 rounded-[32px] bg-cyan-500/10 blur-3xl" />
      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0f18]/90 p-5 shadow-[0_24px_90px_rgba(6,182,212,0.14)] backdrop-blur-xl sm:p-6">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

        <div className="flex items-center justify-between gap-3">
          <Badge className="border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-cyan-200 hover:bg-cyan-400/10">
            Live demo
          </Badge>
          <div className="flex items-center gap-2 text-xs text-cyan-100/80">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            Active now
          </div>
        </div>

        <div className="mt-5 rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,24,39,0.98),rgba(8,12,20,0.96))] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">Reception line</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Call the receptionist</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Hear how your business sounds when every call gets answered properly.
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
              {started ? <Mic className="h-5 w-5" /> : <PhoneCall className="h-5 w-5" />}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={handleStart}
              className="h-11 flex-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-95"
            >
              <PhoneCall className="h-4 w-4" />
              Start call
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 flex-1 rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              <a href="/AIDemo">
                <Play className="h-4 w-4 text-cyan-300" />
                Try live demo
              </a>
            </Button>
          </div>

          <div className="mt-5 rounded-2xl border border-white/8 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Transcript preview</p>
                <p className="mt-1 text-sm text-slate-300">A real call experience, shown live.</p>
              </div>
              <Radio className="h-4 w-4 text-cyan-300" />
            </div>

            <div className="mt-4 space-y-3">
              <AnimatePresence initial={false}>
                {visibleTranscript.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: index === visibleTranscript.length - 1 ? 0.08 : 0 }}
                    className={`rounded-2xl px-4 py-3 text-sm ${
                      item.speaker === 'Receptionist'
                        ? 'bg-cyan-400/10 text-cyan-50 border border-cyan-400/15'
                        : 'bg-white/5 text-slate-200 border border-white/8'
                    }`}
                  >
                    <div className="mb-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                      {item.speaker}
                    </div>
                    <p className="leading-relaxed">{item.text}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <AnimatePresence>
            {complete && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                Lead captured
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
            Ready for live call routing and lead capture later.
          </div>
        </div>
      </div>
    </div>
  );
}