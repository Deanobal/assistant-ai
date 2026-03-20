import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const statusStyles = {
  new: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  open: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  waiting_on_admin: 'bg-amber-500/10 text-amber-200 border-amber-500/20',
  waiting_on_customer: 'bg-violet-500/10 text-violet-200 border-violet-500/20',
  resolved: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  closed: 'bg-white/5 text-gray-300 border-white/10',
};

const priorityStyles = {
  low: 'bg-white/5 text-gray-300 border-white/10',
  normal: 'bg-white/5 text-gray-300 border-white/10',
  high: 'bg-amber-500/10 text-amber-200 border-amber-500/20',
  urgent: 'bg-red-500/10 text-red-300 border-red-500/20',
};

export default function SupportConversationList({ conversations, selectedId, onSelect }) {
  return (
    <Card className="bg-[#12121a] border-white/5 h-full">
      <CardContent className="p-0">
        <div className="border-b border-white/5 px-5 py-4">
          <h3 className="text-white font-semibold">Support Conversations</h3>
        </div>
        <div className="divide-y divide-white/5 max-h-[72vh] overflow-y-auto">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelect(conversation.id)}
              className={`w-full text-left px-5 py-4 transition ${selectedId === conversation.id ? 'bg-cyan-500/8' : 'hover:bg-white/[0.03]'}`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium truncate">{conversation.visitor_name || 'Unknown visitor'}</p>
                    {conversation.unread_for_admin && <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shrink-0" />}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{conversation.visitor_email}</p>
                </div>
                <p className="text-xs text-gray-500 shrink-0">{conversation.last_message_at ? format(new Date(conversation.last_message_at), 'dd MMM p') : '—'}</p>
              </div>
              <p className="text-sm text-gray-300 truncate">{conversation.subject || conversation.last_message_preview || 'Support conversation'}</p>
              <p className="text-xs text-gray-500 truncate mt-1">{conversation.last_message_preview || 'No messages yet'}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className={statusStyles[conversation.status] || statusStyles.open}>{conversation.status}</Badge>
                <Badge className={priorityStyles[conversation.priority] || priorityStyles.normal}>{conversation.priority}</Badge>
              </div>
            </button>
          ))}
          {conversations.length === 0 && (
            <div className="px-5 py-8 text-sm text-gray-400">No support conversations match this filter yet.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}