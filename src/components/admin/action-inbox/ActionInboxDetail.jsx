import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, CheckCircle2, Phone, Reply, UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { channelStyles, priorityStyles } from './actionInboxUtils';

const senderStyles = {
  visitor: 'border border-white/10 bg-slate-900 text-slate-100',
  client: 'border border-white/10 bg-slate-900 text-slate-100',
  admin: 'bg-white text-slate-900',
  system: 'border border-cyan-500/20 bg-cyan-500/10 text-cyan-50',
};

export default function ActionInboxDetail({ item, conversation, messages, isSaving, onReply, onResolve, onBack, showBack }) {
  const [messageBody, setMessageBody] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const replyInputRef = useRef(null);

  if (!item) {
    return (
      <Card className="border-white/5 bg-[#0f172a] shadow-none">
        <CardContent className="p-8 text-slate-400">Pick an item from the inbox to open the reply workspace.</CardContent>
      </Card>
    );
  }

  const phoneHref = item.phone ? `tel:${item.phone.replace(/\s+/g, '')}` : null;

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
                <Badge className={priorityStyles[item.priority] || priorityStyles.normal}>{item.priority}</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-400">{item.business}</p>
            </div>
            <div className="text-sm text-slate-400">{item.waitLabel}</div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#111827] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Action Summary</p>
            <p className="mt-3 text-base leading-7 text-slate-100">{item.intentSummary}</p>
            <p className="mt-4 text-sm leading-6 text-slate-400">{item.preview}</p>
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
                <Badge className={priorityStyles[item.priority] || priorityStyles.normal}>{item.priority}</Badge>
              </div>
              <p className="mt-2 break-words text-sm text-slate-400">{item.email}{item.phone ? ` · ${item.phone}` : ''}</p>
              <p className="mt-1 text-sm text-slate-500">{item.intentSummary}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => replyInputRef.current?.focus()} className="h-11 rounded-xl bg-white text-slate-900 hover:bg-slate-200">
                <Reply className="mr-2 h-4 w-4" /> Reply
              </Button>
              {phoneHref && (
                <Button asChild type="button" variant="outline" className="h-11 rounded-xl border-white/10 bg-transparent text-white hover:bg-white/5">
                  <a href={phoneHref}><Phone className="mr-2 h-4 w-4" />Call</a>
                </Button>
              )}
              {item.secondaryUrl && (
                <Button asChild type="button" variant="outline" className="h-11 rounded-xl border-white/10 bg-transparent text-white hover:bg-white/5">
                  <Link to={item.secondaryUrl}><UserRound className="mr-2 h-4 w-4" />Open Lead</Link>
                </Button>
              )}
              <Button type="button" onClick={onResolve} disabled={isSaving || conversation.status === 'resolved'} className="h-11 rounded-xl bg-emerald-500 text-white hover:bg-emerald-400 disabled:opacity-50">
                <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Resolved
              </Button>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-4">
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
            <Textarea
              ref={replyInputRef}
              value={messageBody}
              onChange={(event) => setMessageBody(event.target.value)}
              placeholder={isInternalNote ? 'Add internal note' : 'Reply to the conversation'}
              className="min-h-[110px] rounded-2xl border-white/10 bg-[#111827] text-white placeholder:text-slate-500"
            />
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={isInternalNote} onChange={(event) => setIsInternalNote(event.target.checked)} className="h-4 w-4 rounded border-white/20 bg-transparent" />
              Save as internal note
            </label>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">Sticky mobile reply box for fast responses from phone.</p>
              <Button
                type="button"
                disabled={isSaving || !messageBody.trim()}
                onClick={() => onReply({
                  messageBody,
                  isInternalNote,
                  reset: () => {
                    setMessageBody('');
                    setIsInternalNote(false);
                  },
                })}
                className="h-11 rounded-xl bg-white text-slate-900 hover:bg-slate-200 disabled:opacity-50"
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