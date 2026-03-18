import React from 'react';
import { Loader2, PhoneIncoming, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DemoScenarioSelector({ scenarios, selectedScenario, onSelect, onGenerate, isGenerating }) {
  return (
    <div className="mb-8 rounded-[28px] border border-white/8 bg-[#11111a] p-5 md:p-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-400">Live Scenario</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Choose a lead scenario</h3>
          <p className="mt-2 text-sm text-gray-400 max-w-2xl">
            Pick a business scenario, then receive a dynamic AI-generated call simulation on screen.
          </p>
        </div>
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25"
        >
          {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PhoneIncoming className="mr-2 h-4 w-4" />}
          {isGenerating ? 'Receiving Call...' : 'Receive AI Call'}
        </Button>
      </div>

      <div className="mt-6 grid md:grid-cols-3 gap-4">
        {scenarios.map((scenario) => {
          const active = selectedScenario.id === scenario.id;
          return (
            <button
              key={scenario.id}
              onClick={() => onSelect(scenario)}
              className={`rounded-2xl border p-4 text-left transition-all ${
                active
                  ? 'border-cyan-500/30 bg-cyan-500/8'
                  : 'border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center gap-2 text-cyan-300 text-xs font-medium uppercase tracking-[0.2em] mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                {scenario.label}
              </div>
              <p className="text-white font-medium mb-2">{scenario.title}</p>
              <p className="text-sm text-gray-400 leading-relaxed">{scenario.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}