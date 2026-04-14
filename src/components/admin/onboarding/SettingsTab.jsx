import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CLIENT_STATUSES, OWNER_OPTIONS, PLAN_OPTIONS } from './onboardingConfig';

export default function SettingsTab({ client, onUpdate }) {
  return (
    <Card className="bg-[#12121a] border-white/5">
      <CardContent className="p-6 grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-400">Plan</p>
          <Select value={client.plan} onValueChange={(value) => onUpdate({ plan: value })}>
            <SelectTrigger className="bg-white/[0.03] border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent>{PLAN_OPTIONS.map((plan) => <SelectItem key={plan} value={plan}>{plan}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-400">Status</p>
          <Select value={client.status} onValueChange={(value) => onUpdate({ status: value })}>
            <SelectTrigger className="bg-white/[0.03] border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent>{CLIENT_STATUSES.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-400">Assigned Owner</p>
          <Select value={client.assigned_owner || 'Unassigned'} onValueChange={(value) => onUpdate({ assigned_owner: value === 'Unassigned' ? '' : value })}>
            <SelectTrigger className="bg-white/[0.03] border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent>{OWNER_OPTIONS.map((owner) => <SelectItem key={owner} value={owner}>{owner}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}