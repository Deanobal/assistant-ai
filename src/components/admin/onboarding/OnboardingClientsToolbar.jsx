import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CLIENT_STATUSES, OWNER_OPTIONS, PLAN_OPTIONS } from './onboardingConfig';

export default function OnboardingClientsToolbar({ filters, onChange }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Input
        value={filters.search}
        onChange={(e) => onChange('search', e.target.value)}
        placeholder="Search business or contact"
        className="bg-[#12121a] border-white/10 text-white"
      />
      <Select value={filters.plan} onValueChange={(value) => onChange('plan', value)}>
        <SelectTrigger className="bg-[#12121a] border-white/10 text-white"><SelectValue placeholder="Filter by plan" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All plans</SelectItem>
          {PLAN_OPTIONS.map((plan) => <SelectItem key={plan} value={plan}>{plan}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filters.status} onValueChange={(value) => onChange('status', value)}>
        <SelectTrigger className="bg-[#12121a] border-white/10 text-white"><SelectValue placeholder="Filter by status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {CLIENT_STATUSES.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filters.owner} onValueChange={(value) => onChange('owner', value)}>
        <SelectTrigger className="bg-[#12121a] border-white/10 text-white"><SelectValue placeholder="Filter by owner" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All owners</SelectItem>
          {OWNER_OPTIONS.map((owner) => <SelectItem key={owner} value={owner}>{owner}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}