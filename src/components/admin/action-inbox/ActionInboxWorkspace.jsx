import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import ActionInboxTabs from './ActionInboxTabs';
import ActionInboxList from './ActionInboxList';
import ActionInboxDetail from './ActionInboxDetail';
import ActionInboxContextPanel from './ActionInboxContextPanel';
import { ACTION_VIEWS, buildConversationAction, buildLeadAlertAction, buildUnmatchedSmsAction, matchesActionView, sortActionItems } from './actionInboxUtils';

function getWorkspaceConfig(mode) {
  if (mode === 'support') {
    return {
      badge: 'Support',
      title: 'Support Reply Workspace',
      description: 'A cleaner, faster support workflow focused on reply speed and clear triage.',
      views: ACTION_VIEWS.filter((view) => view.key !== 'unmatched_sms'),
      includeLeadAlerts: false,
    };
  }

  return {
    badge: 'Action Inbox',
    title: 'Action Inbox',
    description: 'One mobile-first response surface for live chats, lead follow-up, and unmatched SMS triage.',
    views: ACTION_VIEWS,
    includeLeadAlerts: true,
  };
}

function getSelectedKeyFromUrl() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('conversationId')) return `conversation:${params.get('conversationId')}`;
  if (params.get('leadId')) return `lead-alert:${params.get('leadId')}`;
  if (params.get('logId')) return `unmatched-sms:${params.get('logId')}`;
  return null;
}

export default function ActionInboxWorkspace({ mode = 'action' }) {
  const queryClient = useQueryClient();
  const config = getWorkspaceConfig(mode);
  const [activeView, setActiveView] = useState(() => new URLSearchParams(window.location.search).get('view') || config.views[0].key);
  const [selectedKey, setSelectedKey] = useState(() => getSelectedKeyFromUrl());
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1280 : false);
  const [showMobileDetail, setShowMobileDetail] = useState(!!getSelectedKeyFromUrl());

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1280);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { data: currentAdmin } = useQuery({ queryKey: ['action-inbox-me'], queryFn: () => base44.auth.me() });
  const { data: conversations = [] } = useQuery({ queryKey: ['action-inbox-conversations'], queryFn: () => base44.entities.SupportConversation.list('-updated_at', 200), initialData: [] });
  const { data: admins = [] } = useQuery({ queryKey: ['action-inbox-admin-users'], queryFn: () => base44.entities.User.list('-created_date', 200), initialData: [] });
  const { data: leads = [] } = useQuery({ queryKey: ['action-inbox-leads'], queryFn: () => base44.entities.Lead.list('-updated_date', 200), initialData: [] });
  const { data: notifications = [] } = useQuery({ queryKey: ['action-inbox-notifications'], queryFn: () => base44.entities.NotificationLog.filter({ recipient_role: 'admin' }, '-created_date', 300), initialData: [], enabled: config.includeLeadAlerts });

  const adminsById = useMemo(() => Object.fromEntries(admins.map((admin) => [admin.id, admin])), [admins]);
  const leadsById = useMemo(() => Object.fromEntries(leads.map((lead) => [lead.id, lead])), [leads]);

  const conversationItems = useMemo(
    () => conversations.map((conversation) => buildConversationAction(conversation, leadsById, adminsById)),
    [conversations, leadsById, adminsById]
  );

  const leadAlertItems = useMemo(() => {
    if (!config.includeLeadAlerts) return [];
    return notifications
      .filter((log) => log.channel === 'in_app' && log.entity_name === 'Lead' && ['customer_sms_reply_received', 'strategy_call_requested', 'booking_request_failed'].includes(log.event_type))
      .filter((log) => log.event_type !== 'customer_sms_reply_received' || log.metadata?.alert_category === 'high_intent_inbound_sms')
      .map((log) => buildLeadAlertAction(log, leadsById));
  }, [notifications, leadsById, config.includeLeadAlerts]);

  const unmatchedSmsItems = useMemo(() => {
    if (!config.includeLeadAlerts) return [];
    return notifications
      .filter((log) => log.channel === 'sms' && log.event_type === 'customer_sms_reply_unmatched')
      .map(buildUnmatchedSmsAction);
  }, [notifications, config.includeLeadAlerts]);

  const allItems = useMemo(
    () => [...conversationItems, ...leadAlertItems, ...unmatchedSmsItems].sort(sortActionItems),
    [conversationItems, leadAlertItems, unmatchedSmsItems]
  );

  const counts = useMemo(() => Object.fromEntries(config.views.map((view) => [view.key, allItems.filter((item) => matchesActionView(item, view.key)).length])), [config.views, allItems]);
  const filteredItems = useMemo(() => allItems.filter((item) => matchesActionView(item, activeView)), [allItems, activeView]);
  const selectedItem = filteredItems.find((item) => item.id === selectedKey) || allItems.find((item) => item.id === selectedKey) || null;
  const selectedConversation = selectedItem?.kind === 'conversation' ? conversations.find((conversation) => conversation.id === selectedItem.entityId) || null : null;

  useEffect(() => {
    if (!config.views.some((view) => view.key === activeView)) {
      setActiveView(config.views[0].key);
    }
  }, [config.views, activeView]);

  useEffect(() => {
    if (!filteredItems.length) {
      setSelectedKey(null);
      return;
    }
    if (!selectedItem || !filteredItems.some((item) => item.id === selectedItem.id)) {
      setSelectedKey(filteredItems[0].id);
    }
  }, [filteredItems, selectedItem]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('view', activeView);
    params.delete('conversationId');
    params.delete('leadId');
    params.delete('logId');

    if (selectedItem?.kind === 'conversation') params.set('conversationId', selectedItem.entityId);
    if (selectedItem?.kind === 'lead_alert' && selectedItem.linkedLeadId) params.set('leadId', selectedItem.linkedLeadId);
    if (selectedItem?.kind === 'unmatched_sms') params.set('logId', selectedItem.logId);

    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', nextUrl);
  }, [activeView, selectedItem?.id]);

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['action-inbox-conversations'] });
    queryClient.invalidateQueries({ queryKey: ['action-inbox-notifications'] });
    queryClient.invalidateQueries({ queryKey: ['action-inbox-messages', selectedConversation?.id] });
    queryClient.invalidateQueries({ queryKey: ['action-inbox-leads'] });
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
    queryKey: ['action-inbox-messages', selectedConversation?.id],
    queryFn: () => base44.entities.SupportMessage.filter({ conversation_id: selectedConversation.id }, 'created_at', 500),
    initialData: [],
    enabled: !!selectedConversation,
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

  const handleSelect = (item) => {
    setSelectedKey(item.id);
    if (isMobile) setShowMobileDetail(true);
  };

  const listTitle = mode === 'support' ? 'Support Threads' : 'Operational Queue';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <Badge className="border-cyan-500/20 bg-cyan-500/10 text-cyan-300">{config.badge}</Badge>
            <Badge className="border-white/10 bg-white/5 text-slate-300">Mobile-first triage</Badge>
          </div>
          <h2 className="text-3xl font-bold text-white">{config.title}</h2>
          <p className="mt-2 max-w-3xl text-slate-400">{config.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['Needs Reply', counts.needs_reply_now || 0],
            ['High Intent', counts.high_intent || 0],
            ['Overdue', counts.overdue || 0],
            ['Unassigned', counts.unassigned || 0],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/5 bg-[#0f172a] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-white tabular-nums">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <ActionInboxTabs views={config.views} activeView={activeView} onChange={(view) => { setActiveView(view); if (isMobile) setShowMobileDetail(false); }} counts={counts} />

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)_320px]">
        {(!isMobile || !showMobileDetail) && (
          <ActionInboxList title={listTitle} items={filteredItems} selectedId={selectedItem?.id || null} onSelect={handleSelect} />
        )}

        {(!isMobile || showMobileDetail) && (
          <ActionInboxDetail
            item={selectedItem}
            conversation={selectedConversation}
            messages={messages}
            isSaving={replyMutation.isPending || updateConversationMutation.isPending}
            onBack={() => setShowMobileDetail(false)}
            showBack={isMobile}
            onReply={({ messageBody, isInternalNote, reset }) => {
              replyMutation.mutate({ messageBody, isInternalNote }, { onSuccess: reset });
            }}
            onResolve={() => selectedConversation && updateConversationMutation.mutate({
              id: selectedConversation.id,
              data: {
                ...selectedConversation,
                status: 'resolved',
                unread_for_admin: false,
                unread_for_client: false,
              },
            })}
          />
        )}

        {(!isMobile || showMobileDetail) && (
          <ActionInboxContextPanel
            item={selectedItem}
            conversation={selectedConversation}
            admins={admins.filter((admin) => admin.role === 'admin')}
            leads={leads}
            onAssignAdmin={(assignedAdminId) => selectedConversation && updateConversationMutation.mutate({
              id: selectedConversation.id,
              data: {
                ...selectedConversation,
                assigned_admin_id: assignedAdminId === 'unassigned' ? null : assignedAdminId,
              },
            })}
            onPriorityChange={(priority) => selectedConversation && updateConversationMutation.mutate({
              id: selectedConversation.id,
              data: {
                ...selectedConversation,
                priority,
                urgency_level: priority,
              },
            })}
          />
        )}
      </div>
    </div>
  );
}