import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, TimerReset } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { channelStyles, intentLevelStyles, priorityStyles, triageStyles } from './actionInboxUtils';

export default function ActionInboxContextPanel({ item, conversation, admins, leads, onAssignAdmin, onPriorityChange, onSnooze }) {
  if (!item) {
    return (
      <Card className="border-white/5 bg-[#0f172a] shadow-none">
        <CardContent className="p-5 text-sm text-slate-400">Context appears here after you open an item.</CardContent>
      </Card>
    );
  }

  const linkedLead = leads.find((lead) => lead.id === item.linkedLeadId) || null;
  const phoneHref = item.phone ? `tel:${item.phone.replace(/\s+/g, '')}` : null;

  return (
    <div className="space-y-4 xl:sticky xl:top-24">
      <Card className="border-white/5 bg-[#0f172a] shadow-none">
        <CardContent className="space-y-4 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Lead Context</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge className={channelStyles[item.channel] || channelStyles.Support}>{item.channel}</Badge>
              <Badge className={triageStyles[item.triageState] || triageStyles.waiting_on_admin}>{item.triageState.replace(/_/g, ' ')}</Badge>
              <Badge className={intentLevelStyles[item.intentLevel] || intentLevelStyles.LOW}>{item.intentLevel}</Badge>
            </div>
          </div>

          <div className="space-y-2 text-sm text-slate-300">
            <div className="flex items-center justify-between gap-4"><span className="text-slate-500">Owner</span><span>{item.owner}</span></div>
            <div className="flex items-center justify-between gap-4"><span className="text-slate-500">Wait time</span><span className="tabular-nums">{item.waitLabel}</span></div>
            <div className="flex items-center justify-between gap-4"><span className="text-slate-500">Category</span><span className="text-right">{item.category.replace(/_/g, ' ')}</span></div>
            <div className="flex items-center justify-between gap-4"><span className="text-slate-500">Urgency</span><span className="text-right">{item.urgency.replace(/_/g, ' ')}</span></div>
            <div className="flex items-center justify-between gap-4"><span className="text-slate-500">Booking</span><span className="text-right">{item.bookingStatus}</span></div>
            <div className="flex items-center justify-between gap-4"><span className="text-slate-500">Last activity</span><span className="text-right">{item.lastActivity}</span></div>
            <div className="flex items-center justify-between gap-4"><span className="text-slate-500">Business</span><span className="text-right">{item.business}</span></div>
            {item.sourcePage && <div className="flex items-center justify-between gap-4"><span className="text-slate-500">Source</span><span className="text-right">{item.sourcePage}</span></div>}
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#111827] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Current AI Summary</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">{item.aiSummary || item.intentSummary}</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#111827] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Recommended Next Action</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">{linkedLead?.next_action || item.recommendedNextAction}</p>
          </div>

          {conversation && (
            <div className="space-y-3 border-t border-white/5 pt-4">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">Assign</p>
                <Select value={conversation.assigned_admin_id || 'unassigned'} onValueChange={onAssignAdmin}>
                  <SelectTrigger className="h-11 rounded-xl border-white/10 bg-[#111827] text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {admins.map((admin) => (
                      <SelectItem key={admin.id} value={admin.id}>{admin.full_name || admin.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">Priority</p>
                <Select value={conversation.priority || 'normal'} onValueChange={onPriorityChange}>
                  <SelectTrigger className="h-11 rounded-xl border-white/10 bg-[#111827] text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">Remind me</p>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 15, 60].map((minutes) => (
                    <Button key={minutes} type="button" variant="outline" onClick={() => onSnooze(minutes)} className="h-10 rounded-xl border-white/10 bg-transparent text-white hover:bg-white/5">
                      {minutes === 60 ? '1 hour' : `${minutes} min`}
                    </Button>
                  ))}
                </div>
                {item.snoozeLabel && <p className="mt-2 text-xs text-amber-200">{item.snoozeLabel}</p>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-white/5 bg-[#0f172a] shadow-none">
        <CardContent className="space-y-4 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Fast Actions</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">Everything needed to close the lead or move the conversation forward.</p>
          </div>

          <div className="space-y-2">
            {item.secondaryUrl && (
              <Button asChild variant="outline" className="h-11 w-full rounded-xl border-white/10 bg-transparent text-white hover:bg-white/5">
                <Link to={item.secondaryUrl}>Open Lead</Link>
              </Button>
            )}
            <Button asChild variant="outline" className="h-11 w-full rounded-xl border-white/10 bg-transparent text-white hover:bg-white/5">
              <Link to={item.actionUrl}>{item.primaryLabel}</Link>
            </Button>
            {phoneHref && (
              <Button asChild variant="outline" className="h-11 w-full rounded-xl border-white/10 bg-transparent text-white hover:bg-white/5">
                <a href={phoneHref}><Phone className="mr-2 h-4 w-4" />Call</a>
              </Button>
            )}
            {item.kind === 'unmatched_sms' && (
              <Button asChild variant="outline" className="h-11 w-full rounded-xl border-white/10 bg-transparent text-white hover:bg-white/5">
                <Link to="/UnmatchedSmsInbox"><TimerReset className="mr-2 h-4 w-4" />Match SMS</Link>
              </Button>
            )}
          </div>

          {conversation && (
            <div className="rounded-2xl border border-white/5 bg-[#111827] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Current Priority</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge className={priorityStyles[conversation.priority || 'normal'] || priorityStyles.normal}>{conversation.priority || 'normal'}</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}