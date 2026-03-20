import React from 'react';
import { Button } from '@/components/ui/button';

const filters = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'open', label: 'Open' },
  { key: 'waiting_on_admin', label: 'Waiting on Admin' },
  { key: 'waiting_on_customer', label: 'Waiting on Customer' },
  { key: 'resolved', label: 'Resolved' },
];

export default function SupportInboxFilters({ activeFilter, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <Button
          key={filter.key}
          type="button"
          variant="outline"
          onClick={() => onChange(filter.key)}
          className={activeFilter === filter.key ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300' : 'border-white/10 bg-transparent text-white hover:bg-white/5'}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}