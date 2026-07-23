import { ArrowRight, Loader2 } from 'lucide-react';

function Row({ label, value }) {
  return (
    <div className="rounded-[11px] border border-[#26364d] bg-[#081522] p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 font-medium text-white">{value || '—'}</p>
    </div>
  );
}

export default function SignupReviewStep({ selectedPlan, form, error, submitting, onBackToForm, onChangePlan, onProceed }) {
  return (
    <div className="rounded-[16px] border border-[#2a394f] bg-[#07121f] p-7 shadow-[0_28px_80px_rgba(0,0,0,0.22)] md:p-9">
      <div className="mb-7 flex flex-col gap-4 rounded-[11px] border border-[#29405f] bg-[#081727] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-cyan-300">Step 3 — Review before payment</p>
          <p className="mt-1 text-xl font-semibold text-white">{selectedPlan.name}: {selectedPlan.setupLabel} + {selectedPlan.monthlyLabel}</p>
        </div>
        <button type="button" onClick={onChangePlan} className="text-sm font-semibold text-cyan-200 underline underline-offset-4 hover:text-white">
          Change Plan
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Row label="Selected plan" value={selectedPlan.name} />
        <Row label="Setup fee" value={selectedPlan.setupLabel} />
        <Row label="Monthly fee" value={selectedPlan.monthlyLabel} />
        <Row label="Business name" value={form.business_name} />
        <Row label="Customer name" value={form.full_name} />
        <Row label="Email" value={form.email} />
        <Row label="Phone" value={form.mobile_number} />
        <Row label="What they want automated" value={form.service_needed} />
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={onBackToForm} className="inline-flex min-h-12 flex-1 items-center justify-center rounded-[10px] border border-[#425067] bg-[#081522] px-6 font-semibold text-white hover:border-[#66748a] hover:bg-[#0a1725]">
          Back to Details
        </button>
        <button type="button" onClick={onProceed} disabled={submitting} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-[10px] border border-[#347cff] bg-[#0b4dbb] px-6 font-semibold text-white hover:bg-[#0a45aa] disabled:opacity-60">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Proceed to Secure Payment <ArrowRight className="h-4 w-4" /></>}
        </button>
      </div>
    </div>
  );
}
