import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const senderStyles = {
  visitor: 'bg-white/[0.04] text-gray-200 border border-white/8',
  client: 'bg-white/[0.04] text-gray-200 border border-white/8',
  admin: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white',
  system: 'bg-cyan-500/8 text-cyan-100 border border-cyan-500/20',
};

export default function SupportThreadPanel({ conversation, messages, admins, leads, currentAdmin, isSaving, onReply, onResolve, onPriorityChange, onCategoryChange, onAiModeChange, onAssignAdmin, onLinkLead }) {
  const [messageBody, setMessageBody] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);

  if (!conversation) {
    return (
      <Card className="bg-[#12121a] border-white/5 h-full">
        <CardContent className="p-8 text-gray-400">Select a conversation to open the support thread.</CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#12121a] border-white/5 h-full">
      <CardContent className="flex h-full flex-col p-0">
        <div className="space-y-4 border-b border-white/5 px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-white">{conversation.visitor_name || 'Unknown visitor'}</h3>
              <p className="text-sm text-gray-400">{conversation.visitor_email}{conversation.visitor_phone ? ` • ${conversation.visitor_phone}` : ''}</p>
            </div>
            <Button onClick={onResolve} disabled={isSaving || conversation.status === 'resolved'} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white disabled:opacity-50">Mark resolved</Button>
          </div>

          <div className="grid gap-3 lg:grid-cols-5">
            <Select value={conversation.priority || 'normal'} onValueChange={onPriorityChange}>
              <SelectTrigger className="border-white/10 bg-white/[0.03] text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low urgency</SelectItem>
                <SelectItem value="normal">Normal urgency</SelectItem>
                <SelectItem value="high">High urgency</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={conversation.enquiry_category || 'general'} onValueChange={onCategoryChange}>
              <SelectTrigger className="border-white/10 bg-white/[0.03] text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="onboarding">Onboarding</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
            <Select value={conversation.ai_mode || 'human_required'} onValueChange={onAiModeChange}>
              <SelectTrigger className="border-white/10 bg-white/[0.03] text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ai_active">AI active</SelectItem>
                <SelectItem value="human_required">Human required</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={conversation.assigned_admin_id || 'unassigned'} onValueChange={onAssignAdmin}>
              <SelectTrigger className="border-white/10 bg-white/[0.03] text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {admins.map((admin) => (
                  <SelectItem key={admin.id} value={admin.id}>{admin.full_name || admin.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={conversation.linked_lead_id || 'unlinked'} onValueChange={onLinkLead}>
              <SelectTrigger className="border-white/10 bg-white/[0.03] text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="unlinked">No linked lead</SelectItem>
                {leads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>{lead.business_name || lead.full_name} • {lead.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="rounded-2xl border border-cyan-500/15 bg-cyan-500/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-300/90">AI Summary</p>
              <p className="mt-2 text-sm text-cyan-50/90">{conversation.ai_summary || 'No AI summary has been saved for this conversation yet.'}</p>
              {conversation.ai_handover_reason && (
                <p className="mt-3 text-xs text-cyan-200/75">Handover reason: {conversation.ai_handover_reason}</p>
              )}
            </div>

            <div className="flex flex-wrap content-start items-center gap-2 text-xs text-gray-400">
              <Badge className="border-white/10 bg-white/5 text-gray-300">{conversation.status}</Badge>
              <Badge className="border-white/10 bg-white/5 text-gray-300">{conversation.source_type}</Badge>
              <Badge className="border-white/10 bg-white/5 text-gray-300">{conversation.enquiry_category || 'general'}</Badge>
              <Badge className="border-white/10 bg-white/5 text-gray-300">{conversation.urgency_level || conversation.priority || 'normal'}</Badge>
              <Badge className="border-cyan-500/20 bg-cyan-500/10 text-cyan-300">{conversation.ai_mode || 'human_required'}</Badge>
              {conversation.assigned_admin_id && <Badge className="border-cyan-500/20 bg-cyan-500/10 text-cyan-300">Assigned</Badge>}
              {conversation.ai_last_response_at && <Badge className="border-white/10 bg-white/5 text-gray-300">AI replied {format(new Date(conversation.ai_last_response_at), 'dd MMM p')}</Badge>}
              {conversation.linked_lead_id && (
                <Button asChild variant="outline" className="h-7 border-cyan-500/20 bg-cyan-500/5 px-2 text-cyan-300 hover:bg-cyan-500/10">
                  <Link to={`/LeadDetail?id=${conversation.linked_lead_id}`}>Open linked lead</Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="max-h-[52vh] flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {messages.map((message) => (
            <div key={message.id} className={`rounded-2xl px-4 py-3 ${senderStyles[message.sender_type] || senderStyles.visitor}`}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs opacity-80">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{message.sender_name || message.sender_type}</span>
                  <span className="uppercase tracking-wide">{message.sender_type === 'system' ? 'ai assistant' : message.sender_type}</span>
                  {message.is_internal_note && <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-200">Internal note</Badge>}
                </div>
                <span>{format(new Date(message.created_at), 'dd MMM yyyy p')}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.message_body}</p>
            </div>
          ))}
          {messages.length === 0 && <div className="text-sm text-gray-400">No messages in this conversation yet.</div>}
        </div>

        <div className="space-y-3 border-t border-white/5 px-5 py-4">
          <Textarea
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            placeholder={isInternalNote ? 'Add an internal note' : 'Reply as AssistantAI admin'}
            className="min-h-[110px] border-white/10 bg-white/[0.03] text-white placeholder:text-gray-500"
          />
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" checked={isInternalNote} onChange={(e) => setIsInternalNote(e.target.checked)} className="rounded border-white/10 bg-transparent" />
            Save as internal note
          </label>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-gray-500">{isInternalNote ? 'Internal notes stay inside the admin inbox and are hidden from public visitors.' : 'Admin replies take over the thread and pause further AI auto-replies until AI is re-enabled.'}</p>
            <Button
              onClick={() => {
                onReply({
                  messageBody,
                  isInternalNote,
                  currentAdmin,
                  reset: () => {
                    setMessageBody('');
                    setIsInternalNote(false);
                  },
                });
              }}
              disabled={isSaving || !messageBody.trim()}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white disabled:opacity-50"
            >
              {isInternalNote ? 'Save note' : 'Send reply'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}