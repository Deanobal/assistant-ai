import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, CheckCircle2, Phone, Reply, UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { channelStyles, getTriageLabel, intentLevelStyles, slaStyles, triageStyles } from './actionInboxUtils';

const senderStyles = {
  visitor: 'border border-white/10 bg-slate-900 text-slate-100',
  client: 'border border-white/10 bg-slate-900 text-slate-100',
  admin: 'bg-white text-slate-900',
  system: 'border border-cyan-500/20 bg-cyan-500/10 text-cyan-50',
};

const QUICK_REPLIES = [
  'Got it — give me 2 mins',
  'Can you share more details?',
  'I’ll call you now',
];

export default function ActionInboxDetail({ item, conversation, linkedLead, currentAdmin, messages, isSaving, onReply, onResolve, onAssignToMe, onSnooze, onBack, showBack }) {
  const [messageBody, setMessageBody] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const replyInputRef = useRef(null);
  const messageListRef = useRef(null);

  useEffect(() => {
    if (!item || item.kind !== 'conversation') return;

    const focusReply = () => replyInputRef.current?.focus({ preventScroll: true });
    const firstTimeout = window.setTimeout(focusReply, 60);
    const secondTimeout = window.setTimeout(focusReply, 180);

    return () => {
      window.clearTimeout(firstTimeout);
      window.clearTimeout(secondTimeout);
    };
  }, [item?.id]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (messageListRef.current) {
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      }
    }, 40);

    return () => window.clearTimeout(timeout);
  }, [item?.id, messages.length]);

  if (!item) {
    return (
      <Card className="border-white/5 bg-[#0f172a] shadow-none">
        <CardContent className="p-8 text-slate-400">Pick an item from the inbox to open the reply workspace.</CardContent>
      </Card>
    );
  }

  const phoneHref = item.phone ? `tel:${item.phone.replace(/\s+/g, '')}` : null;
  const lastVisibleMessage = [...messages].filter((entry) => !entry.is_internal_note).slice(-1)[0] || null;

  if (item.kind !== 'conversation' || !conversation) {
    return (
      <Card className="border-white/5 bg-[#0f172a] shadow-none">
        <CardContent className="space-y-6 p-5 sm:p-6">
          {showBack && (
            <Button type="button" variant="ghost" onClick={onBack} className="h-11 rounded-xl px-0 text-slate-300 hover:bg-transparent hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to list
            </Button>
          )}

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                <Badge className={channelStyles[item.channel] || channelStyles.Support}>{item.channel}</Badge>
                <Badge className={triageStyles[item.triageState] || triageStyles.waiting_on_admin}>{getTriageLabel(item.triageState)}</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-400">{item.business}</p>
            </div>
            <div className={`rounded-2xl border px-4 py-3 text-center ${slaStyles[item.slaState] || slaStyles.normal}`}>
              <p className="text-xs uppercase tracking-[0.18em] opacity-70">Waiting</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{item.waitShort}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#111827] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Action Summary</p>
            <p className="mt-3 text-base leading-7 text-slate-100">{item.intentSummary}</p>
            <p className="mt-4 text-sm leading-6 text-slate-400">Recommended next action: {item.recommendedNextAction}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="h-11 rounded-xl bg-white text-slate-900 hover:bg-slate-200">
              <Link to={item.actionUrl}>{item.primaryLabel}</Link>
            </Button>
            {phoneHref && (
              <Button asChild variant="outline" className="h-11 rounded-xl border-white/10 bg-transparent text-white hover:bg-white/5">
                <a href={phoneHref}><Phone className="mr-2 h-4 w-4" />Call</a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/5 bg-[#0f172a] shadow-none">
      <CardContent className="flex h-full flex-col p-0">
        <div className="border-b border-white/5 px-5 py-4">
          {showBack && (
            <Button type="button" variant="ghost" onClick={onBack} className="mb-3 h-11 rounded-xl px-0 text-slate-300 hover:bg-transparent hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to list
            </Button>
          )}

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                <Badge className={channelStyles[item.channel] || channelStyles.Support}>{item.channel}</Badge>
                <Badge className={triageStyles[item.triageState] || triageStyles.waiting_on_admin}>{getTriageLabel(item.triageState)}</Badge>
                <Badge className={intentLevelStyles[item.intentLevel] || intentLevelStyles.LOW}>{item.intentLevel}</Badge>
              </div>
              <p className="mt-2 break-words text-sm text-slate-300">{item.business}</p>
              <p className="mt-1 break-words text-sm text-slate-400">{item.email}{item.phone ? ` · ${item.phone}` : ''}</p>
              <p className="mt-1 text-sm text-slate-500">{item.intentSummary}</p>
            </div>

            <div className="flex items-start gap-3">
              {phoneHref && (
                <Button asChild type="button" variant="outline" className="h-11 rounded-2xl border-white/10 bg-transparent text-white hover:bg-white/5">
                  <a href={phoneHref}><Phone className="mr-2 h-4 w-4" /> Call</a>
                </Button>
              )}
              <div className={`rounded-3xl border px-4 py-3 text-center ${slaStyles[item.slaState] || slaStyles.normal}`}>
                <p className="text-xs uppercase tracking-[0.18em] opacity-70">Waiting</p>
                <p className="mt-1 text-3xl font-semibold tabular-nums">{item.waitShort}</p>
              </div>
            </div>
          </div>
        </div>

        <div ref={messageListRef} className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            <div className="rounded-2xl border border-white/5 bg-[#111827] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Booking</p>
              <p className="mt-2 text-sm font-medium text-white">{item.bookingStatus}</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#111827] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Last activity</p>
              <p className="mt-2 text-sm font-medium text-white">{item.lastActivity}</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#111827] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Intent level</p>
              <p className="mt-2 text-sm font-medium text-white">{item.intentLevel}</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#111827] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Category</p>
              <p className="mt-2 text-sm font-medium text-white">{item.category.replace(/_/g, ' ')}</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#111827] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Urgency</p>
              <p className="mt-2 text-sm font-medium text-white">{item.urgency.replace(/_/g, ' ')}</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#111827] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Owner</p>
              <p className="mt-2 text-sm font-medium text-white">{item.owner}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-3xl border border-white/5 bg-[#111827] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Current AI Summary</p>
              <p className="mt-3 text-base leading-7 text-slate-100">{item.aiSummary || item.intentSummary}</p>
            </div>
            <div className="rounded-3xl border border-white/5 bg-[#111827] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Recommended Next Action</p>
              <p className="mt-3 text-base leading-7 text-slate-100">{linkedLead?.next_action || item.recommendedNextAction}</p>
              {item.snoozeLabel && <p className="mt-3 text-sm text-amber-200">{item.snoozeLabel}</p>}
            </div>
          </div>

          {lastVisibleMessage && (
            <div className="mt-5 rounded-3xl border border-cyan-500/15 bg-cyan-500/5 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Latest customer message</p>
              <p className="mt-2 text-sm font-medium text-white">{lastVisibleMessage.sender_name || item.name}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-100">{lastVisibleMessage.message_body}</p>
            </div>
          )}

          <div className="mt-5 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`rounded-3xl px-4 py-3 ${senderStyles[message.sender_type] || senderStyles.visitor}`}>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs opacity-80">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{message.sender_name || message.sender_type}</span>
                    {message.is_internal_note && <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-200">Internal note</Badge>}
                  </div>
                  <span>{format(new Date(message.created_at), 'dd MMM p')}</span>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-7">{message.message_body}</p>
              </div>
            ))}
            {messages.length === 0 && <div className="text-sm text-slate-400">No messages yet.</div>}
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-white/5 bg-[#0f172a] px-4 py-4 sm:px-5">
          <div className="space-y-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {QUICK_REPLIES.map((reply) => (
                <Button key={reply} type="button" variant="outline" onClick={() => { setMessageBody(reply); replyInputRef.current?.focus(); }} className="h-10 rounded-2xl border-white/10 bg-[#111827] whitespace-nowrap text-white hover:bg-slate-800">
                  {reply}
                </Button>
              ))}
            </div>

            <Textarea
              ref={replyInputRef}
              autoFocus
              value={messageBody}
              onChange={(event) => setMessageBody(event.target.value)}
              placeholder={isInternalNote ? 'Add internal note' : 'Reply to the conversation'}
              className="min-h-[110px] rounded-2xl border-white/10 bg-[#111827] text-white placeholder:text-slate-500"
            />

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              <Button type="button" onClick={() => replyInputRef.current?.focus()} className="h-11 rounded-2xl bg-white text-slate-900 hover:bg-slate-200">
                <Reply className="mr-2 h-4 w-4" /> Reply
              </Button>
              {phoneHref ? (
                <Button asChild type="button" variant="outline" className="h-11 rounded-2xl border-white/10 bg-transparent text-white hover:bg-white/5">
                  <a href={phoneHref}><Phone className="mr-2 h-4 w-4" /> Call</a>
                </Button>
              ) : <div />}
              <Button type="button" variant="outline" onClick={onAssignToMe} className="h-11 rounded-2xl border-white/10 bg-transparent text-white hover:bg-white/5">
                Assign
              </Button>
              {item.secondaryUrl ? (
                <Button asChild type="button" variant="outline" className="h-11 rounded-2xl border-white/10 bg-transparent text-white hover:bg-white/5">
                  <Link to={item.secondaryUrl}><UserRound className="mr-2 h-4 w-4" /> Open Lead</Link>
                </Button>
              ) : <div />}
              <Button type="button" onClick={onResolve} disabled={isSaving || conversation.status === 'resolved'} className="h-11 rounded-2xl bg-emerald-500 text-white hover:bg-emerald-400 disabled:opacity-50">
                <CheckCircle2 className="mr-2 h-4 w-4" /> Resolved
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[5, 15, 60].map((minutes) => (
                <Button key={minutes} type="button" variant="outline" onClick={() => onSnooze(minutes)} className="h-10 rounded-2xl border-white/10 bg-transparent text-white hover:bg-white/5">
                  {minutes === 60 ? '1 hour' : `${minutes} min`}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={isInternalNote} onChange={(event) => setIsInternalNote(event.target.checked)} className="h-4 w-4 rounded border-white/20 bg-transparent" />
                Save as internal note
              </label>
              <Button
                type="button"
                disabled={isSaving || !messageBody.trim()}
                onClick={() => onReply({
                  messageBody,
                  isInternalNote,
                  reset: () => {
                    setMessageBody('');
                    setIsInternalNote(false);
                    replyInputRef.current?.focus();
                  },
                })}
                className="h-11 rounded-2xl bg-white text-slate-900 hover:bg-slate-200 disabled:opacity-50"
              >
                {isInternalNote ? 'Save Note' : 'Send Reply'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}