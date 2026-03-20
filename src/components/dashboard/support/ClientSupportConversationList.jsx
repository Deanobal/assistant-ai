import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ClientSupportConversationList({ conversations, selectedId, onSelect, onNewConversation }) {
  return (
    <Card className="bg-[#12121a] border-white/5 h-full">
      <CardContent className="p-0">
        <div className="border-b border-white/5 px-5 py-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-white font-semibold">Support Conversations</h3>
            <p className="text-xs text-gray-500 mt-1">Your support messages in one place.</p>
          </div>
          <Button onClick={onNewConversation} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">New</Button>
        </div>
        <div className="divide-y divide-white/5 max-h-[60vh] overflow-y-auto">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelect(conversation.id)}
              className={`w-full text-left px-5 py-4 transition ${selectedId === conversation.id ? 'bg-cyan-500/8' : 'hover:bg-white/[0.03]'}`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">{conversation.subject || 'Support conversation'}</p>
                  <p className="text-xs text-gray-500 truncate">{conversation.last_message_preview || 'No messages yet'}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {conversation.unread_for_client && <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />}
                  <p className="text-xs text-gray-500">{conversation.last_message_at ? format(new Date(conversation.last_message_at), 'dd MMM p') : '—'}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-white/5 text-gray-300 border-white/10">{conversation.status}</Badge>
                <Badge className="bg-white/5 text-gray-300 border-white/10">{conversation.priority}</Badge>
              </div>
            </button>
          ))}
          {conversations.length === 0 && (
            <div className="px-5 py-8 text-sm text-gray-400">No support conversations yet. Start a new message when you need help.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}