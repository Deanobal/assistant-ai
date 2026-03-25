import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, TimerReset } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { channelStyles, priorityStyles } from './actionInboxUtils';

export default function ActionInboxContextPanel({ item, conversation, admins, leads, onAssignAdmin, onPriorityChange }) {
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
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Context</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge className={channelStyles[item.channel] || channelStyles.Support}>{item.channel}</Badge>
              <Badge className={priorityStyles[item.priority] || priorityStyles.normal}>{item.priority}</Badge>
              {item.overdue && <Badge className="border-red-500/20 bg-red-500/10 text-red-200">Overdue</Badge>}
            </div>
          </div>

          <div className="space-y-2 text-sm text-slate-300">
            <div className="flex items-center justify-between gap-4"><span className="text-slate-500">Owner</span><span>{item.owner}</span></div>
            <div className="flex items-center justify-between gap-4"><span className="text-slate-500">Wait time</span><span className="tabular-nums">{item.waitLabel}</span></div>
            <div className="flex items-center justify-between gap-4"><span className="text-slate-500">Business</span><span className="text-right">{item.business}</span></div>
            {item.sourcePage && <div className="flex items-center justify-between gap-4"><span className="text-slate-500">Source</span><span className="text-right">{item.sourcePage}</span></div>}
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
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-white/5 bg-[#0f172a] shadow-none">
        <CardContent className="space-y-4 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Fast Actions</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">Keep mobile response fast with direct actions and no admin clutter.</p>
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

          {linkedLead?.next_action && (
            <div className="rounded-2xl border border-white/5 bg-[#111827] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Next Action</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">{linkedLead.next_action}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}