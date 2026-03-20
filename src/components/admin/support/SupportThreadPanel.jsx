import React, { useState } from 'react';
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

export default function SupportThreadPanel({ conversation, messages, admins, currentAdmin, isSaving, onReply, onResolve, onPriorityChange, onAssignAdmin }) {
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
      <CardContent className="p-0 flex flex-col h-full">
        <div className="border-b border-white/5 px-5 py-4 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-white font-semibold text-lg">{conversation.visitor_name || 'Unknown visitor'}</h3>
              <p className="text-sm text-gray-400">{conversation.visitor_email}{conversation.visitor_phone ? ` • ${conversation.visitor_phone}` : ''}</p>
            </div>
            <Button onClick={onResolve} disabled={isSaving || conversation.status === 'resolved'} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white disabled:opacity-50">Mark resolved</Button>
          </div>
          <div className="grid lg:grid-cols-2 gap-3">
            <Select value={conversation.priority} onValueChange={onPriorityChange}>
              <SelectTrigger className="bg-white/[0.03] border-white/10 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low priority</SelectItem>
                <SelectItem value="normal">Normal priority</SelectItem>
                <SelectItem value="high">High priority</SelectItem>
                <SelectItem value="urgent">Urgent priority</SelectItem>
              </SelectContent>
            </Select>
            <Select value={conversation.assigned_admin_id || 'unassigned'} onValueChange={onAssignAdmin}>
              <SelectTrigger className="bg-white/[0.03] border-white/10 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {admins.map((admin) => (
                  <SelectItem key={admin.id} value={admin.id}>{admin.full_name || admin.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-gray-400">
            <Badge className="bg-white/5 text-gray-300 border-white/10">{conversation.status}</Badge>
            <Badge className="bg-white/5 text-gray-300 border-white/10">{conversation.priority}</Badge>
            <Badge className="bg-white/5 text-gray-300 border-white/10">{conversation.source_type}</Badge>
            {conversation.assigned_admin_id && <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20">Assigned</Badge>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 max-h-[52vh]">
          {messages.map((message) => (
            <div key={message.id} className={`rounded-2xl px-4 py-3 ${senderStyles[message.sender_type] || senderStyles.visitor}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs opacity-80">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{message.sender_name || message.sender_type}</span>
                  <span className="uppercase tracking-wide">{message.sender_type}</span>
                  {message.is_internal_note && <Badge className="bg-amber-500/10 text-amber-200 border-amber-500/20">Internal note</Badge>}
                </div>
                <span>{format(new Date(message.created_at), 'dd MMM yyyy p')}</span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message_body}</p>
            </div>
          ))}
          {messages.length === 0 && <div className="text-sm text-gray-400">No messages in this conversation yet.</div>}
        </div>

        <div className="border-t border-white/5 px-5 py-4 space-y-3">
          <Textarea
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            placeholder={isInternalNote ? 'Add an internal note' : 'Reply as AssistantAI admin'}
            className="min-h-[110px] bg-white/[0.03] border-white/10 text-white placeholder:text-gray-500"
          />
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" checked={isInternalNote} onChange={(e) => setIsInternalNote(e.target.checked)} className="rounded border-white/10 bg-transparent" />
            Save as internal note
          </label>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-gray-500">{isInternalNote ? 'Internal notes stay inside the admin inbox and are hidden from public visitors.' : 'Admin replies update the visitor-facing conversation thread.'}</p>
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