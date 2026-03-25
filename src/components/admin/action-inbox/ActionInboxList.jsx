import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowUpRight, Clock3, MessageSquareReply, UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { channelStyles, priorityStyles } from './actionInboxUtils';

export default function ActionInboxList({ title, items, selectedId, onSelect }) {
  return (
    <Card className="border-white/5 bg-[#0f172a] shadow-none">
      <CardContent className="p-0">
        <div className="border-b border-white/5 px-4 py-4">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">Fast triage with the strongest signals first.</p>
        </div>
        <div className="max-h-[72vh] space-y-3 overflow-y-auto p-3">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className={`w-full rounded-2xl border p-4 text-left transition-colors ${selectedId === item.id ? 'border-cyan-500/30 bg-cyan-500/10' : 'border-white/5 bg-[#111827] hover:bg-slate-800/80'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {item.overdue && <AlertCircle className="h-4 w-4 shrink-0 text-red-300" />}
                    <p className="truncate text-sm font-semibold text-white">{item.name}</p>
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-400">{item.business}</p>
                </div>
                <Badge className={channelStyles[item.channel] || channelStyles.Support}>{item.channel}</Badge>
              </div>

              <p className="mt-3 text-sm text-slate-200">{item.intentSummary}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <Badge className={priorityStyles[item.priority] || priorityStyles.normal}>{item.priority}</Badge>
                <span className="flex items-center gap-1"><UserRound className="h-3.5 w-3.5" /> {item.owner}</span>
                <span className="flex items-center gap-1 tabular-nums"><Clock3 className="h-3.5 w-3.5" /> {item.waitLabel}</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" onClick={(event) => { event.stopPropagation(); onSelect(item); }} className="h-11 rounded-xl bg-white text-slate-900 hover:bg-slate-200">
                  <MessageSquareReply className="mr-1 h-4 w-4" />
                  {item.primaryLabel}
                </Button>
                {item.secondaryUrl && (
                  <Button asChild type="button" variant="outline" className="h-11 rounded-xl border-white/10 bg-transparent text-white hover:bg-white/5">
                    <Link to={item.secondaryUrl} onClick={(event) => event.stopPropagation()}>
                      <ArrowUpRight className="mr-1 h-4 w-4" />
                      {item.secondaryLabel}
                    </Link>
                  </Button>
                )}
              </div>
            </button>
          ))}

          {items.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#111827] px-4 py-8 text-sm text-slate-400">
              Nothing is waiting in this view right now.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}