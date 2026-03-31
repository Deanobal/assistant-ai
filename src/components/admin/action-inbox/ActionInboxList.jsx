import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Bell, MessageSquareReply, Phone, UserPlus, UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { channelStyles, getTriageLabel, intentLevelStyles, slaStyles, triageStyles } from './actionInboxUtils';

const leadQualityStyles = {
  high_value: 'border-violet-500/30 bg-violet-500/10 text-violet-200',
  urgent: 'border-red-500/30 bg-red-500/10 text-red-200',
  medium: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  low: 'border-slate-700 bg-slate-800 text-slate-200',
};

export default function ActionInboxList({ title, items, selectedId, onSelect, onQuickAssign, onQuickSnooze }) {
  return (
    <Card className="border-white/10 bg-[#101827] shadow-none ring-1 ring-white/5">
      <CardContent className="p-0">
        <div className="border-b border-white/5 px-4 py-4">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">Reply speed first. Wait time is the loudest signal.</p>
        </div>
        <div className="max-h-[calc(100vh-15rem)] space-y-3 overflow-y-auto overscroll-contain p-3 sm:max-h-[72vh]">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className={`w-full rounded-3xl border p-4 text-left transition-colors ${selectedId === item.id ? 'border-cyan-400/50 bg-cyan-500/12 ring-1 ring-cyan-300/15' : item.overdue ? 'border-red-500/25 bg-[#171821] hover:bg-[#1b1d28]' : item.highIntent ? 'border-violet-500/20 bg-[#151726] hover:bg-[#191c2c]' : item.unassigned ? 'border-amber-500/20 bg-[#17161f] hover:bg-[#1c1b25]' : 'border-white/8 bg-[#111827] hover:bg-slate-800/80'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-white">{item.name}</p>
                  <p className="mt-1 truncate text-sm text-slate-400">{item.business}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <Badge className={channelStyles[item.channel] || channelStyles.Support}>{item.channel}</Badge>
                    <Badge className={triageStyles[item.triageState] || triageStyles.waiting_on_admin}>{getTriageLabel(item.triageState)}</Badge>
                    <Badge className={intentLevelStyles[item.intentLevel] || intentLevelStyles.LOW}>{item.intentLevel}</Badge>
                    <Badge className={leadQualityStyles[item.leadQuality] || leadQualityStyles.low}>{item.leadQuality.replace(/_/g, ' ')}</Badge>
                    <Badge className="border-white/10 bg-white/5 text-slate-200">Score {item.leadScore}</Badge>
                  </div>
                </div>
                <div className={`min-w-[84px] rounded-2xl border px-3 py-2 text-center ${slaStyles[item.slaState] || slaStyles.normal}`}>
                  <p className="text-[11px] uppercase tracking-[0.18em] opacity-70">Waiting</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">{item.waitShort}</p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-100">{item.intentSummary}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                <span>Category: <span className="text-slate-200">{item.category.replace(/_/g, ' ')}</span></span>
                <span>Urgency: <span className="text-slate-200">{item.urgency.replace(/_/g, ' ')}</span></span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-400">
                <span className="flex min-w-0 items-center gap-1 truncate">
                  <UserRound className="h-3.5 w-3.5 shrink-0" /> {item.owner}
                </span>
                {item.snoozeLabel && <span className="truncate text-amber-200">{item.snoozeLabel}</span>}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" onClick={(event) => { event.stopPropagation(); onSelect(item); }} className="h-12 rounded-2xl bg-white text-slate-900 hover:bg-slate-200">
                  <MessageSquareReply className="mr-1 h-4 w-4" />
                  Reply Now
                </Button>
                {item.phone ? (
                  <Button asChild type="button" variant="outline" className="h-12 rounded-2xl border-white/10 bg-transparent px-3 text-white hover:bg-white/5">
                    <a href={`tel:${item.phone.replace(/\s+/g, '')}`} onClick={(event) => event.stopPropagation()}>
                      <Phone className="mr-1 h-4 w-4" />
                      {item.highValueLead || item.intentLevel === 'HIGH INTENT' ? 'Call now' : 'Call'}
                    </a>
                  </Button>
                ) : null}
                {item.secondaryUrl ? (
                  <Button asChild type="button" variant="outline" className="h-12 rounded-2xl border-white/10 bg-transparent px-3 text-white hover:bg-white/5">
                    <Link to={item.secondaryUrl} onClick={(event) => event.stopPropagation()}>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : null}
                {item.kind === 'conversation' ? (
                  <Button type="button" variant="outline" onClick={(event) => { event.stopPropagation(); onQuickAssign(item); }} className="h-12 rounded-2xl border-white/10 bg-transparent px-3 text-white hover:bg-white/5">
                    <UserPlus className="h-4 w-4" />
                  </Button>
                ) : null}
                {item.kind === 'conversation' ? (
                  <Button type="button" variant="outline" onClick={(event) => { event.stopPropagation(); onQuickSnooze(item, 15); }} className="h-12 rounded-2xl border-white/10 bg-transparent px-3 text-white hover:bg-white/5">
                    <Bell className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            </button>
          ))}

          {items.length === 0 && (
            <div className="rounded-3xl border border-dashed border-white/10 bg-[#111827] px-4 py-8 text-sm text-slate-400">
              Nothing is waiting in this view right now.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}