import React, { useState } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const senderStyles = {
  client: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white',
  admin: 'bg-white/[0.04] text-gray-200 border border-white/8',
  system: 'bg-cyan-500/8 text-cyan-100 border border-cyan-500/20',
};

export default function ClientSupportThread({ conversation, messages, isSaving, onCreateConversation, onReply }) {
  const [subject, setSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');

  if (!conversation) {
    return (
      <Card className="bg-[#12121a] border-white/5 h-full">
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="text-white font-semibold text-lg">Send us a message</h3>
            <p className="text-sm text-gray-400 mt-1">Use this space to contact the AssistantAI support team from your portal.</p>
          </div>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="bg-white/[0.03] border-white/10 text-white"
          />
          <Textarea
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            placeholder="Tell us what you need help with"
            className="min-h-[140px] bg-white/[0.03] border-white/10 text-white"
          />
          <p className="text-xs text-gray-500">Messages are reviewed by the AssistantAI team. We’ll get back to you shortly in this thread once your message has been reviewed.</p>
          <Button
            onClick={() => {
              onCreateConversation({
                subject,
                messageBody,
                reset: () => {
                  setSubject('');
                  setMessageBody('');
                },
              });
            }}
            disabled={isSaving || !subject.trim() || !messageBody.trim()}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
          >
            {isSaving ? 'Sending…' : 'Send message'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#12121a] border-white/5 h-full">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="border-b border-white/5 px-5 py-4 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-white font-semibold text-lg">{conversation.subject}</h3>
              <p className="text-sm text-gray-400">We’ll get back to you shortly here once the message has been reviewed.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-white/5 text-gray-300 border-white/10">{conversation.status}</Badge>
              <Badge className="bg-white/5 text-gray-300 border-white/10">{conversation.priority}</Badge>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 max-h-[52vh]">
          {messages.map((message) => (
            <div key={message.id} className={`rounded-2xl px-4 py-3 ${senderStyles[message.sender_type] || senderStyles.system}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs opacity-80">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{message.sender_name || message.sender_type}</span>
                  <span className="uppercase tracking-wide">{message.sender_type}</span>
                </div>
                <span>{format(new Date(message.created_at), 'dd MMM yyyy p')}</span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message_body}</p>
            </div>
          ))}
          {messages.length === 0 && <div className="text-sm text-gray-400">No replies yet.</div>}
        </div>

        <div className="border-t border-white/5 px-5 py-4 space-y-3">
          <Textarea
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            placeholder="Reply to this conversation"
            className="min-h-[110px] bg-white/[0.03] border-white/10 text-white"
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-gray-500">Admin internal notes are hidden from the client portal automatically.</p>
            <Button
              onClick={() => {
                onReply({
                  messageBody,
                  reset: () => setMessageBody(''),
                });
              }}
              disabled={isSaving || !messageBody.trim()}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
            >
              {isSaving ? 'Sending…' : 'Send reply'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}