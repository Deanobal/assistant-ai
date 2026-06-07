import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardCheck, Download, FileText, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';

const defaultNote = `Support worker attended participant home from 10am to 12pm. Took client shopping. Helped with groceries. All good.`;

const riskRules = [
  { key: 'time', label: 'Time and duration evidence', test: (text) => /\b\d{1,2}(:\d{2})?\s?(am|pm)\b/i.test(text) || /\bfrom\b.+\bto\b/i.test(text), fix: 'Add start time, finish time, and total duration.' },
  { key: 'support', label: 'Support activity detail', test: (text) => /(supported|assisted|prompted|transport|community|personal care|meal|medication|shopping|budget|mobility)/i.test(text), fix: 'Describe the actual support provided, not only the outing/task.' },
  { key: 'outcome', label: 'Participant goal or outcome', test: (text) => /(goal|outcome|independent|capacity|choice|skill|confidence|community access|daily living)/i.test(text), fix: 'Link the work to the participant goal, skill, or outcome.' },
  { key: 'incident', label: 'Incident or escalation statement', test: (text) => /(no incident|incident|escalated|reported|risk|concern|safe|safety)/i.test(text), fix: 'State whether incidents, risks, or concerns occurred and what action was taken.' },
  { key: 'objective', label: 'Professional objective wording', test: (text) => !/(lazy|bad|annoying|refused for no reason|crazy|rude)/i.test(text), fix: 'Use neutral, factual wording and avoid judgemental language.' },
];

function clampScore(score) {
  return Math.max(1, Math.min(100, score));
}

function auditNote(note, supportType) {
  const text = note.trim();
  const checks = riskRules.map((rule) => ({ ...rule, passed: rule.test(text) }));
  const passed = checks.filter((item) => item.passed).length;
  const billingScore = clampScore(35 + passed * 12 + (text.length > 160 ? 8 : 0));
  const complianceScore = clampScore(30 + passed * 13 + (supportType ? 5 : 0));
  const missing = checks.filter((item) => !item.passed).map((item) => item.fix);
  const riskLevel = complianceScore >= 80 ? 'Low' : complianceScore >= 60 ? 'Medium' : 'High';

  const improved = `Supported participant with ${supportType || 'NDIS support services'} during the recorded shift. Worker provided practical assistance with the stated activity, encouraged participant choice and safe participation, and documented the support provided in a factual manner. Recommended manager edit: add exact start and finish times, participant goal/outcome, and whether any incidents, risks, or follow-up actions occurred before this note is used for billing or audit evidence.`;

  return { checks, billingScore, complianceScore, missing, riskLevel, improved };
}

export default function CareProofPilot() {
  const [note, setNote] = useState(defaultNote);
  const [supportType, setSupportType] = useState('Community participation and daily living support');
  const [providerName, setProviderName] = useState('Demo NDIS Provider');
  const result = useMemo(() => auditNote(note, supportType), [note, supportType]);

  const stats = [
    { label: 'Billing evidence score', value: `${result.billingScore}%`, icon: TrendingUp },
    { label: 'Compliance readiness', value: `${result.complianceScore}%`, icon: ShieldCheck },
    { label: 'Risk level', value: result.riskLevel, icon: AlertTriangle },
    { label: 'Missing items', value: result.missing.length, icon: ClipboardCheck },
  ];

  function downloadReport() {
    const report = [
      'CareProof AI - Demo Shift Note Audit',
      `Provider: ${providerName}`,
      `Support type: ${supportType}`,
      `Billing evidence score: ${result.billingScore}%`,
      `Compliance readiness score: ${result.complianceScore}%`,
      `Risk level: ${result.riskLevel}`,
      '',
      'Original note:',
      note,
      '',
      'Improved note draft:',
      result.improved,
      '',
      'Missing information:',
      ...(result.missing.length ? result.missing.map((item) => `- ${item}`) : ['- No major missing fields detected in demo rules.']),
      '',
      'Disclaimer: CareProof AI assists documentation review only. It does not provide legal, clinical, regulatory, or NDIS advice. Final review remains with the provider.',
    ].join('\n');

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'careproof-ai-demo-audit.txt';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <header className="flex flex-col gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-200">
              <Sparkles className="h-4 w-4" /> Pilot MVP Demo
            </div>
            <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">CareProof AI</h1>
            <p className="mt-4 max-w-3xl text-lg text-slate-300">
              AI shift-note review for NDIS providers. Clean weak notes, flag missing billing evidence, and create audit-ready documentation before claims or compliance reviews become a problem.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl">
            <p className="text-sm uppercase tracking-wide text-slate-400">First validation offer</p>
            <p className="mt-2 text-2xl font-semibold">Free 50-note audit</p>
            <p className="mt-2 max-w-sm text-sm text-slate-300">For providers willing to test the platform with de-identified shift notes.</p>
          </div>
        </header>

        <section className="grid gap-4 py-8 md:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                <Icon className="mb-4 h-6 w-6 text-emerald-300" />
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold">{stat.value}</p>
              </div>
            );
          })}
        </section>

        <main className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-6">
            <div className="mb-5 flex items-center gap-3">
              <FileText className="h-6 w-6 text-emerald-300" />
              <div>
                <h2 className="text-2xl font-semibold">Shift note audit</h2>
                <p className="text-sm text-slate-400">Paste a de-identified support note and run the pilot audit logic.</p>
              </div>
            </div>

            <label className="mb-2 block text-sm font-medium text-slate-300">Provider name</label>
            <input
              value={providerName}
              onChange={(event) => setProviderName(event.target.value)}
              className="mb-4 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-300"
            />

            <label className="mb-2 block text-sm font-medium text-slate-300">Support category / service type</label>
            <input
              value={supportType}
              onChange={(event) => setSupportType(event.target.value)}
              className="mb-4 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-300"
            />

            <label className="mb-2 block text-sm font-medium text-slate-300">Original shift note</label>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={10}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-300"
            />

            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={() => setNote(defaultNote)} className="rounded-xl bg-white px-4 py-3 font-semibold text-slate-950 hover:bg-slate-200">
                Load sample note
              </button>
              <button onClick={downloadReport} className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950 hover:bg-emerald-300">
                <Download className="h-4 w-4" /> Export demo report
              </button>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6">
              <h2 className="text-2xl font-semibold">Improved note draft</h2>
              <p className="mt-4 rounded-2xl bg-slate-900 p-5 leading-7 text-slate-200">{result.improved}</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6">
              <h2 className="text-2xl font-semibold">Compliance checklist</h2>
              <div className="mt-4 space-y-3">
                {result.checks.map((check) => (
                  <div key={check.key} className="flex items-start justify-between gap-4 rounded-2xl bg-slate-900 p-4">
                    <div>
                      <p className="font-medium">{check.label}</p>
                      <p className="mt-1 text-sm text-slate-400">{check.passed ? 'Detected in note.' : check.fix}</p>
                    </div>
                    {check.passed ? <CheckCircle2 className="h-6 w-6 flex-none text-emerald-300" /> : <AlertTriangle className="h-6 w-6 flex-none text-amber-300" />}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-6 text-amber-50">
              <h3 className="font-semibold">Important pilot disclaimer</h3>
              <p className="mt-2 text-sm leading-6 text-amber-100/90">
                CareProof AI assists documentation quality review only. It does not provide legal, clinical, regulatory, or NDIS advice. Final judgement and responsibility remain with the provider.
              </p>
            </div>
          </section>
        </main>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          {[
            ['1. Upload or paste notes', 'Providers submit de-identified notes from community access, SIL, daily living, or support coordination work.'],
            ['2. AI checks evidence', 'The platform flags missing time, service detail, participant outcome, risk statements, and weak wording.'],
            ['3. Manager approves', 'Managers edit, approve, and export an evidence-ready report for internal review or pilot discussions.'],
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.06] p-6">
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-slate-300">{body}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
