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
  if (filter === 'urgent') return conversation.enquiry_category === 'urgent' || conversation.urgency_level === 'urgent';
  if (filter === 'ai_active' || filter === 'human_required' || filter === 'escalated') return conversation.ai_mode === filter;
  if (filter === 'open') return ['new', 'open'].includes(conversation.status);
  return conversation.status === filter;
}

function urgencyRank(conversation) {
  const level = conversation.urgency_level || conversation.priority || 'normal';
  if (level === 'urgent') return 0;
  if (level === 'high') return 1;
  if (level === 'normal') return 2;
  return 3;
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

  const { data: leads = [] } = useQuery({
    queryKey: ['support-inbox-leads'],
    queryFn: () => base44.entities.Lead.list('-updated_date', 200),
    initialData: [],
  });

  const filteredConversations = useMemo(
    () => [...conversations]
      .filter((conversation) => matchesFilter(conversation, activeFilter))
      .sort((a, b) => urgencyRank(a) - urgencyRank(b) || new Date(b.updated_at || b.updated_date || 0) - new Date(a.updated_at || a.updated_date || 0)),
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

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['support-conversations'] });
    queryClient.invalidateQueries({ queryKey: ['support-messages', selectedConversationId] });
  };

  const updateConversationMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SupportConversation.update(id, data),
    onSuccess: refreshAll,
  });

  useEffect(() => {
    if (!selectedConversation?.unread_for_admin) return;
    updateConversationMutation.mutate({
      id: selectedConversation.id,
      data: {
        ...selectedConversation,
        unread_for_admin: false,
        status: selectedConversation.status === 'new' ? 'open' : selectedConversation.status,
      },
    });
  }, [selectedConversation?.id]);

  const { data: messages = [] } = useQuery({
    queryKey: ['support-messages', selectedConversationId],
    queryFn: () => base44.entities.SupportMessage.filter({ conversation_id: selectedConversationId }, 'created_at', 500),
    initialData: [],
    enabled: !!selectedConversationId,
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
        last_message_at: isInternalNote ? selectedConversation.last_message_at : now,
        last_message_preview: isInternalNote ? selectedConversation.last_message_preview : messageBody.slice(0, 180),
        ai_mode: isInternalNote ? selectedConversation.ai_mode : 'human_required',
        ai_handover_reason: isInternalNote ? selectedConversation.ai_handover_reason : 'Admin replied manually and took over the conversation.',
      });
    },
    onSuccess: refreshAll,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <Badge className="border-cyan-500/20 bg-cyan-500/10 text-cyan-400">Support Inbox</Badge>
            <Badge className="border-white/10 bg-white/5 text-gray-300">Admin-only</Badge>
          </div>
          <h2 className="mb-2 text-3xl font-bold text-white">Manage Support Conversations</h2>
          <p className="max-w-3xl text-gray-400">Review AI-assisted conversations, qualify incoming enquiries, escalate when needed, and step in manually at any point.</p>
        </div>
        <SupportInboxFilters activeFilter={activeFilter} onChange={setActiveFilter} />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <SupportConversationList
          conversations={filteredConversations}
          selectedId={selectedConversationId}
          onSelect={setSelectedConversationId}
        />

        <SupportThreadPanel
          conversation={selectedConversation}
          messages={messages}
          admins={admins.filter((user) => user.role === 'admin')}
          leads={leads}
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
              unread_for_client: false,
            },
          })}
          onPriorityChange={(priority) => updateConversationMutation.mutate({
            id: selectedConversation.id,
            data: {
              ...selectedConversation,
              priority,
              urgency_level: priority,
            },
          })}
          onCategoryChange={(enquiry_category) => updateConversationMutation.mutate({
            id: selectedConversation.id,
            data: {
              ...selectedConversation,
              enquiry_category,
            },
          })}
          onAiModeChange={(ai_mode) => updateConversationMutation.mutate({
            id: selectedConversation.id,
            data: {
              ...selectedConversation,
              ai_mode,
              ai_handover_reason: ai_mode === 'ai_active' ? null : selectedConversation.ai_handover_reason || 'Updated manually by admin.',
            },
          })}
          onAssignAdmin={(assignedAdminId) => updateConversationMutation.mutate({
            id: selectedConversation.id,
            data: {
              ...selectedConversation,
              assigned_admin_id: assignedAdminId === 'unassigned' ? null : assignedAdminId,
            },
          })}
          onLinkLead={(leadId) => {
            const linkedLead = leadId === 'unlinked' ? null : leads.find((lead) => lead.id === leadId) || null;
            updateConversationMutation.mutate({
              id: selectedConversation.id,
              data: {
                ...selectedConversation,
                linked_lead_id: linkedLead?.id || null,
                linked_client_account_id: linkedLead?.client_account_id || null,
              },
            });
          }}
        />
      </div>
    </div>
  );
}