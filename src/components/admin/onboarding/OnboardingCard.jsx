import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const stageOptions = ['Payment Received', 'Intake Form Sent', 'Intake Form Completed', 'Assets Received', 'Workflow Mapped', 'AI Agent Built', 'Integrations Connected', 'Testing', 'Live', 'Optimisation'];

const stageStyles = {
  'Payment Received': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Intake Form Sent': 'bg-sky-500/10 text-sky-300 border-sky-500/20',
  'Intake Form Completed': 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  'Assets Received': 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
  'Workflow Mapped': 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  'AI Agent Built': 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20',
  'Integrations Connected': 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  Testing: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  Live: 'bg-green-500/10 text-green-400 border-green-500/20',
  Optimisation: 'bg-white/5 text-gray-300 border-white/10',
};

export default function OnboardingCard({ onboarding, onSave, isSaving }) {
  return (
    <Card className="bg-[#12121a] border-white/5">
      <CardContent className="p-6 space-y-5">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="text-white font-semibold text-lg">{onboarding.client_name}</h3>
              <Badge className={stageStyles[onboarding.onboarding_stage]}>{onboarding.onboarding_stage}</Badge>
            </div>
            <p className="text-sm text-gray-400">{onboarding.contact_name} • {onboarding.email}</p>
            <p className="text-sm text-gray-500 mt-1">Plan: {onboarding.plan || 'Not set'} • Industry: {onboarding.industry || 'Not set'}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[
            ['Payment Status', onboarding.payment_status],
            ['Intake Form', onboarding.intake_form_status],
            ['Testing', onboarding.testing_status],
            ['Go Live', onboarding.go_live_status],
            ['Assets Received', onboarding.assets_received ? 'Yes' : 'No'],
            ['Integrations Connected', onboarding.integrations_connected ? 'Yes' : 'No'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-gray-500">{label}</p>
              <p className="text-white mt-2">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[220px_1fr_auto] gap-4 items-start">
          <Select value={onboarding.onboarding_stage} onValueChange={(value) => onSave({ ...onboarding, onboarding_stage: value })}>
            <SelectTrigger className="bg-white/[0.03] border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {stageOptions.map((stage) => <SelectItem key={stage} value={stage}>{stage}</SelectItem>)}
            </SelectContent>
          </Select>
          <Textarea
            value={onboarding.onboarding_notes || ''}
            onChange={(e) => onSave({ ...onboarding, onboarding_notes: e.target.value }, true)}
            className="bg-white/[0.03] border-white/10 text-white min-h-[92px]"
            placeholder="Onboarding notes, blockers, next actions, and progress details."
          />
          <Button
            onClick={() => onSave(onboarding)}
            disabled={isSaving}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white disabled:opacity-50"
          >
            Save Progress
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}