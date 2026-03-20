import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import SupportInboxFilters from '@/components/admin/support/SupportInboxFilters';
import SupportConversationList from '@/components/admin/support/SupportConversationList';
import SupportThreadPanel from '@/components/admin/support/SupportThreadPanel';

function matchesFilter(conversation, filter) {
  if (filter === 'all') return true;
  if (filter === 'unread') return conversation.unread_for_admin;
  if (filter === 'open') return ['new', 'open'].includes(conversation.status);
  return conversation.status === filter;
}

export default function SupportInbox() {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedConversationId, setSelectedConversationId] = useState(null);

  const { data: currentAdmin } = useQuery({
    queryKey: ['support-inbox-me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['support-conversations'],
    queryFn: () => base44.entities.SupportConversation.list('-updated_at', 200),
    initialData: [],
  });

  const { data: admins = [] } = useQuery({
    queryKey: ['support-admin-users'],
    queryFn: () => base44.entities.User.list('-created_date', 200),
    initialData: [],
  });

  const filteredConversations = useMemo(
    () => conversations.filter((conversation) => matchesFilter(conversation, activeFilter)),
    [activeFilter, conversations]
  );

  useEffect(() => {
    if (!filteredConversations.length) {
      setSelectedConversationId(null);
      return;
    }
    if (!selectedConversationId || !filteredConversations.some((item) => item.id === selectedConversationId)) {
      setSelectedConversationId(filteredConversations[0].id);
    }
  }, [filteredConversations, selectedConversationId]);

  const selectedConversation = conversations.find((item) => item.id === selectedConversationId) || null;

  const { data: messages = [] } = useQuery({
    queryKey: ['support-messages', selectedConversationId],
    queryFn: () => base44.entities.SupportMessage.filter({ conversation_id: selectedConversationId }, 'created_at', 500),
    initialData: [],
    enabled: !!selectedConversationId,
  });

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['support-conversations'] });
    queryClient.invalidateQueries({ queryKey: ['support-messages', selectedConversationId] });
  };

  const updateConversationMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SupportConversation.update(id, data),
    onSuccess: refreshAll,
  });

  const replyMutation = useMutation({
    mutationFn: async ({ messageBody, isInternalNote }) => {
      const now = new Date().toISOString();
      await base44.entities.SupportMessage.create({
        conversation_id: selectedConversation.id,
        sender_type: 'admin',
        sender_user_id: currentAdmin?.id || null,
        sender_name: currentAdmin?.full_name || currentAdmin?.email || 'AssistantAI Admin',
        sender_email: currentAdmin?.email || 'admin@assistantai.com.au',
        message_body: messageBody,
        attachment_url: null,
        created_at: now,
        is_internal_note: isInternalNote,
      });

      return base44.entities.SupportConversation.update(selectedConversation.id, {
        ...selectedConversation,
        updated_at: now,
        status: isInternalNote ? selectedConversation.status : 'waiting_on_customer',
        unread_for_admin: false,
        unread_for_client: isInternalNote ? selectedConversation.unread_for_client : true,
        last_message_at: now,
        last_message_preview: messageBody.slice(0, 180),
      });
    },
    onSuccess: refreshAll,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">Support Inbox</Badge>
            <Badge className="bg-white/5 text-gray-300 border-white/10">Admin-only</Badge>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Manage Support Conversations</h2>
          <p className="text-gray-400 max-w-3xl">Review public support and sales enquiries, reply as admin, add internal notes, and move each conversation through the right support status.</p>
        </div>
        <SupportInboxFilters activeFilter={activeFilter} onChange={setActiveFilter} />
      </div>

      <div className="grid xl:grid-cols-[380px_minmax(0,1fr)] gap-6 items-start">
        <SupportConversationList
          conversations={filteredConversations}
          selectedId={selectedConversationId}
          onSelect={setSelectedConversationId}
        />

        <SupportThreadPanel
          conversation={selectedConversation}
          messages={messages}
          admins={admins.filter((user) => user.role === 'admin')}
          currentAdmin={currentAdmin}
          isSaving={replyMutation.isPending || updateConversationMutation.isPending}
          onReply={({ messageBody, isInternalNote, reset }) => {
            replyMutation.mutate({ messageBody, isInternalNote }, { onSuccess: reset });
          }}
          onResolve={() => updateConversationMutation.mutate({
            id: selectedConversation.id,
            data: {
              ...selectedConversation,
              status: 'resolved',
              unread_for_admin: false,
            },
          })}
          onPriorityChange={(priority) => updateConversationMutation.mutate({
            id: selectedConversation.id,
            data: {
              ...selectedConversation,
              priority,
            },
          })}
          onAssignAdmin={(assignedAdminId) => updateConversationMutation.mutate({
            id: selectedConversation.id,
            data: {
              ...selectedConversation,
              assigned_admin_id: assignedAdminId === 'unassigned' ? null : assignedAdminId,
            },
          })}
        />
      </div>
    </div>
  );
}