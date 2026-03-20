import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import ClientSupportConversationList from './support/ClientSupportConversationList';
import ClientSupportThread from './support/ClientSupportThread';

export default function SupportSection({ clientAccountId, currentUser }) {
  const queryClient = useQueryClient();
  const [selectedConversationId, setSelectedConversationId] = useState(null);

  const { data: conversations = [] } = useQuery({
    queryKey: ['client-support-conversations', clientAccountId],
    queryFn: async () => {
      const response = await base44.functions.invoke('listClientSupportConversations', {});
      return response.data.conversations || [];
    },
    initialData: [],
    enabled: !!clientAccountId,
  });

  useEffect(() => {
    if (!conversations.length) {
      setSelectedConversationId(null);
      return;
    }
    if (!selectedConversationId || !conversations.some((item) => item.id === selectedConversationId)) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  const selectedConversation = conversations.find((item) => item.id === selectedConversationId) || null;

  const { data: thread = { conversation: null, messages: [] } } = useQuery({
    queryKey: ['client-support-thread', selectedConversationId],
    queryFn: async () => {
      const response = await base44.functions.invoke('getClientSupportConversation', { conversationId: selectedConversationId });
      return response.data;
    },
    enabled: !!selectedConversationId,
    initialData: { conversation: null, messages: [] },
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['client-support-conversations', clientAccountId] });
    queryClient.invalidateQueries({ queryKey: ['client-support-thread', selectedConversationId] });
  };

  const createConversationMutation = useMutation({
    mutationFn: async ({ subject, messageBody }) => {
      const response = await base44.functions.invoke('startClientSupportConversation', {
        subject,
        message: messageBody,
        sourcePage: '/ClientPortal',
      });
      return response.data;
    },
    onSuccess: (data) => {
      setSelectedConversationId(data.conversation.id);
      refresh();
    },
  });

  const replyMutation = useMutation({
    mutationFn: async ({ messageBody }) => {
      const response = await base44.functions.invoke('replyClientSupportConversation', {
        conversationId: selectedConversationId,
        message: messageBody,
        sourcePage: '/ClientPortal',
      });
      return response.data;
    },
    onSuccess: refresh,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">Support Messaging</Badge>
            <Badge className="bg-white/5 text-gray-300 border-white/10">Private client portal</Badge>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Chat with Support</h2>
          <p className="text-gray-400 max-w-3xl">Send us a message from your portal and keep the full support conversation history in one secure thread.</p>
        </div>
      </div>

      <div className="grid xl:grid-cols-[340px_minmax(0,1fr)] gap-6 items-start">
        <ClientSupportConversationList
          conversations={conversations}
          selectedId={selectedConversationId}
          onSelect={setSelectedConversationId}
          onNewConversation={() => setSelectedConversationId(null)}
        />

        <ClientSupportThread
          conversation={thread.conversation || selectedConversation}
          messages={thread.messages || []}
          isSaving={createConversationMutation.isPending || replyMutation.isPending}
          onCreateConversation={({ subject, messageBody, reset }) => {
            createConversationMutation.mutate({ subject, messageBody }, { onSuccess: reset });
          }}
          onReply={({ messageBody, reset }) => {
            replyMutation.mutate({ messageBody }, { onSuccess: reset });
          }}
        />
      </div>
    </div>
  );
}