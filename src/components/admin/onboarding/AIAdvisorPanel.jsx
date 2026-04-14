import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AIAdvisorPanel({ insights, isLoading, onRefresh }) {
  return (
    <Card className="bg-[#12121a] border-white/5">
      <CardContent className="p-6 space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-white text-xl font-semibold">AI onboarding advisor</h3>
            <p className="text-sm text-gray-400 mt-1">Reads intake details and highlights what to improve next.</p>
          </div>
          <Button onClick={onRefresh} disabled={isLoading} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
            {isLoading ? 'Reviewing…' : 'Refresh advice'}
          </Button>
        </div>

        {!insights ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm text-gray-400">
            Run the advisor to generate workflow suggestions, next actions, and weak setup flags.
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-3">
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
              <p className="text-sm font-medium text-cyan-300 mb-3">Workflow improvements</p>
              <ul className="space-y-2 text-sm text-gray-300">
                {insights.workflow_improvements?.map((item, index) => <li key={index}>• {item}</li>)}
              </ul>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
              <p className="text-sm font-medium text-blue-300 mb-3">Next actions</p>
              <ul className="space-y-2 text-sm text-gray-300">
                {insights.next_actions?.map((item, index) => <li key={index}>• {item}</li>)}
              </ul>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
              <p className="text-sm font-medium text-amber-300 mb-3">Weak setup risks</p>
              <ul className="space-y-2 text-sm text-gray-300">
                {insights.weak_setups?.map((item, index) => <li key={index}>• {item}</li>)}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}