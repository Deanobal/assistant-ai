import React from 'react';
import { Button } from '@/components/ui/button';

export default function ActionInboxTabs({ views, activeView, onChange, counts }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {views.map((view) => (
        <Button
          key={view.key}
          type="button"
          variant="outline"
          onClick={() => onChange(view.key)}
          className={activeView === view.key
            ? 'h-11 rounded-2xl border-cyan-500/30 bg-cyan-500/10 px-4 text-cyan-200'
            : 'h-11 rounded-2xl border-white/10 bg-[#111827] px-4 text-slate-200 hover:bg-slate-800'}
        >
          <span>{view.label}</span>
          <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs tabular-nums">{counts[view.key] || 0}</span>
        </Button>
      ))}
    </div>
  );
}