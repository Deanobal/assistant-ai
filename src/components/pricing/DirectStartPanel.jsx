import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DirectStartPanel({ plan }) {
  return (
    <div className="space-y-6">
      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">{plan.name}</Badge>
            <Badge className="bg-white/5 text-gray-300 border-white/10">Direct start path</Badge>
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">Plan Investment</h3>
            <p className="text-gray-400 mt-1">{plan.setup} setup + {plan.monthly}/month</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-gray-300 leading-relaxed">
            This path saves your onboarding start request for the {plan.name} plan and prepares the handoff for setup, management, support, and optimisation.
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-b from-amber-500/10 to-transparent border-amber-500/20">
        <CardContent className="p-6 space-y-3">
          <h3 className="text-white font-semibold">Checkout Status</h3>
          <p className="text-sm text-amber-200 leading-relaxed">
            Stripe checkout is not live yet, so this page does not take payment or show fake purchase success.
          </p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Once you submit this form, AssistantAI stores your direct-start intent and our team can move you into the next onboarding step manually until live billing is connected.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}