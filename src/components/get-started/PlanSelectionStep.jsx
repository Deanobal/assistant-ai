import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { GET_STARTED_PLANS, ENTERPRISE_PLAN } from './planConfig';

export default function PlanSelectionStep({ selectedPlan, onChoosePlan }) {
  const plans = Object.values(GET_STARTED_PLANS);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {plans.map((plan) => {
          const isSelected = selectedPlan?.name === plan.name;
          return (
            <div
              key={plan.name}
              className={`rounded-[28px] border p-7 transition-all ${isSelected ? 'border-cyan-400/50 bg-cyan-500/10 glow-border' : 'border-white/8 bg-[#12121a] hover:border-cyan-400/30'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
                  <p className="mt-3 text-gray-300 leading-relaxed">{plan.description}</p>
                </div>
                {isSelected && <CheckCircle2 className="h-6 w-6 shrink-0 text-cyan-300" />}
              </div>

              <div className="mt-7 rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                <p className="text-xl font-semibold text-white">{plan.setupLabel}</p>
                <p className="mt-1 text-lg text-cyan-200">{plan.monthlyLabel}</p>
              </div>

              <button
                type="button"
                onClick={() => onChoosePlan(plan)}
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3.5 font-semibold text-white transition-all hover:shadow-lg hover:shadow-cyan-500/25"
              >
                {plan.buttonLabel}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="rounded-[28px] border border-white/8 bg-[#12121a] p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{ENTERPRISE_PLAN.name}</h2>
            <p className="mt-2 text-cyan-200">{ENTERPRISE_PLAN.setupLabel}</p>
            <p className="mt-2 max-w-2xl text-gray-300 leading-relaxed">{ENTERPRISE_PLAN.description}</p>
          </div>
          <Link
            to="/Contact"
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-6 py-3.5 font-semibold text-white transition-all hover:bg-white/[0.08]"
          >
            Talk to Us
          </Link>
        </div>
      </div>
    </div>
  );
}