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
              className={`rounded-[16px] border p-7 transition-all ${isSelected ? 'border-[#347cff] bg-[#081a30] shadow-[0_20px_60px_rgba(31,111,255,0.13)]' : 'border-[#2a394f] bg-[#07121f] hover:border-[#49617f]'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
                  <p className="mt-3 text-gray-300 leading-relaxed">{plan.description}</p>
                </div>
                {isSelected && <CheckCircle2 className="h-6 w-6 shrink-0 text-cyan-300" />}
              </div>

              <div className="mt-7 rounded-[11px] border border-[#26364d] bg-[#081522] p-5">
                <p className="text-xl font-semibold text-white">{plan.setupLabel}</p>
                <p className="mt-1 text-lg text-cyan-200">{plan.monthlyLabel}</p>
              </div>

              <button
                type="button"
                onClick={() => onChoosePlan(plan)}
                className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] border border-[#347cff] bg-[#0b4dbb] px-6 py-3.5 font-semibold text-white transition hover:bg-[#0a45aa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7faaff]"
              >
                {plan.buttonLabel}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="rounded-[16px] border border-[#2a394f] bg-[#07121f] p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{ENTERPRISE_PLAN.name}</h2>
            <p className="mt-2 text-cyan-200">{ENTERPRISE_PLAN.setupLabel}</p>
            <p className="mt-2 max-w-2xl text-gray-300 leading-relaxed">{ENTERPRISE_PLAN.description}</p>
          </div>
          <Link
            to="/Contact"
            className="inline-flex min-h-12 items-center justify-center rounded-[10px] border border-[#425067] bg-[#081522] px-6 py-3.5 font-semibold text-white transition hover:border-[#66748a] hover:bg-[#0a1725]"
          >
            Talk to Us
          </Link>
        </div>
      </div>
    </div>
  );
}
