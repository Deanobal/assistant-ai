import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { enableOneSignalPush, initOneSignal } from '@/lib/onesignal';
import ActionInboxList from './ActionInboxList';
import ActionInboxDetail from './ActionInboxDetail';
import ActionInboxContextPanel from './ActionInboxContextPanel';
import ActionInboxMobileControls from './ActionInboxMobileControls';
import {
  ACTION_VIEWS,
  SALES_HEAT_VIEWS,
  buildConversationAction,
  buildLeadAlertAction,
  buildUnmatchedSmsAction,
  matchesActionView,
  matchesOwnership,
  matchesSalesHeat,
  sortActionItems,
} from './actionInboxUtils';

const OWNERSHIP_VIEWS = [
  { key: 'all', label: 'All Queue' },
  { key: 'assigned_to_me', label: 'Assigned to me' },
  { key: 'unassigned', label: 'Unassigned' },
  { key: 'team_queue', label: 'Team queue' },
];

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
    description: 'One mobile-first response surface for live chats, high-intent leads, and unmatched SMS follow-up.',
    views: ACTION_VIEWS,
    includeLeadAlerts: true,
  };
}

function getSelectedKeyFromUrl() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('conversationId')) return `conversation:${params.get('conversationId')}`;
  if (params.get('logId')) return `unmatched-sms:${params.get('logId')}`;
  return null;
}

export default function ActionInboxWorkspace({ mode = 'action' }) {
  const queryClient = useQueryClient();
  const messageListCacheRef = React.useRef({});
  const config = getWorkspaceConfig(mode);
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const initialView = searchParams.get('view');
  const requestedFocusReply = searchParams.get('focusReply') === '1';
  const defaultMobileView = typeof window !== 'undefined' && window.innerWidth < 1280 && config.views.some((view) => view.key === 'high_intent') ? 'high_intent' : config.views[0].key;
  const [activeView, setActiveView] = React.useState(() => config.views.some((view) => view.key === initialView) ? initialView : defaultMobileView);
  const [ownerFilter, setOwnerFilter] = React.useState('all');
  const [heatFilter, setHeatFilter] = React.useState('all');
  const [selectedKey, setSelectedKey] = React.useState(() => getSelectedKeyFromUrl());
  const [selectionError, setSelectionError] = React.useState(null);
  const [isMobile, setIsMobile] = React.useState(typeof window !== 'undefined' ? window.innerWidth < 1280 : false);
  const [showMobileDetail, setShowMobileDetail] = React.useState(!!getSelectedKeyFromUrl());
  const [installPromptEvent, setInstallPromptEvent] = React.useState(null);
  const [notificationPermission, setNotificationPermission] = React.useState(typeof window !== 'undefined' && 'Notification' in window ? window.Notification.permission : 'default');
  const [notificationSupported, setNotificationSupported] = React.useState(typeof window !== 'undefined' ? 'serviceWorker' in navigator : false);
  const [isStandalone, setIsStandalone] = React.useState(typeof window !== 'undefined' ? window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true : false);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1280);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPromptEvent(event);
    };
    const displayModeQuery = window.matchMedia('(display-mode: standalone)');
    const syncStandaloneState = () => setIsStandalone(displayModeQuery.matches || window.navigator.standalone === true);
    const handlePopState = () => {
      const nextKey = getSelectedKeyFromUrl();
      const nextParams = new URLSearchParams(window.location.search);
      const nextView = nextParams.get('view');
      setSelectedKey(nextKey);
      setSelectionError(null);
      if (nextView && config.views.some((view) => view.key === nextView)) {
        setActiveView(nextView);
      }
      if (window.innerWidth < 1280 && nextKey) {
        setShowMobileDetail(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('popstate', handlePopState);
    if (displayModeQuery.addEventListener) displayModeQuery.addEventListener('change', syncStandaloneState);
    if (displayModeQuery.addListener) displayModeQuery.addListener(syncStandaloneState);
    syncStandaloneState();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('popstate', handlePopState);
      if (displayModeQuery.removeEventListener) displayModeQuery.removeEventListener('change', syncStandaloneState);
      if (displayModeQuery.removeListener) displayModeQuery.removeListener(syncStandaloneState);
    };
  }, [config.views]);

  const { data: currentAdmin = null } = useQuery({ queryKey: ['action-inbox-me'], queryFn: () => base44.auth.me(), initialData: null });
  const { data: conversations = [] } = useQuery({ queryKey: ['action-inbox-conversations'], queryFn: () => base44.entities.SupportConversation.list('-updated_at', 200), initialData: [] });
  const { data: admins = [] } = useQuery({ queryKey: ['action-inbox-admin-users'], queryFn: () => base44.entities.User.list('-created_date', 200), initialData: [] });
  const { data: leads = [] } = useQuery({ queryKey: ['action-inbox-leads'], queryFn: () => base44.entities.Lead.list('-updated_date', 200), initialData: [] });
  const { data: notifications = [] } = useQuery({ queryKey: ['action-inbox-notifications'], queryFn: () => base44.entities.NotificationLog.filter({ recipient_role: 'admin' }, '-created_date', 300), initialData: [], enabled: config.includeLeadAlerts });

  React.useEffect(() => {
    const refreshQueue = () => {
      queryClient.invalidateQueries({ queryKey: ['action-inbox-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['action-inbox-leads'] });
      queryClient.invalidateQueries({ queryKey: ['action-inbox-notifications'] });
    };

    const unsubscribeConversation = base44.entities.SupportConversation.subscribe(refreshQueue);
    const unsubscribeLead = base44.entities.Lead.subscribe(refreshQueue);
    const unsubscribeNotification = config.includeLeadAlerts ? base44.entities.NotificationLog.subscribe(refreshQueue) : () => {};

    return () => {
      unsubscribeConversation?.();
      unsubscribeLead?.();
      unsubscribeNotification?.();
    };
  }, [config.includeLeadAlerts, queryClient]);

  React.useEffect(() => {
    if (!selectedKey?.startsWith('conversation:')) return undefined;
    const selectedConversationId = selectedKey.replace('conversation:', '');
    return base44.entities.SupportMessage.subscribe((event) => {
      if (event.data?.conversation_id === selectedConversationId) {
        queryClient.invalidateQueries({ queryKey: ['action-inbox-messages', selectedConversationId] });
      }
    });
  }, [selectedKey, queryClient]);

  React.useEffect(() => {
    let isActive = true;

    if (!currentAdmin?.id) return undefined;

    initOneSignal(currentAdmin)
      .then((status) => {
        if (!isActive) return;
        setNotificationSupported(status.supported);
        setNotificationPermission(status.subscribed ? 'granted' : status.permission);
      })
      .catch(() => {
        if (!isActive) return;
        setNotificationSupported(false);
      });

    return () => {
      isActive = false;
    };
  }, [currentAdmin?.id]);

  const adminsById = React.useMemo(() => Object.fromEntries(admins.map((admin) => [admin.id, admin])), [admins]);
  const leadsById = React.useMemo(() => Object.fromEntries(leads.map((lead) => [lead.id, lead])), [leads]);

  const conversationItems = React.useMemo(
    () => conversations.map((conversation) => buildConversationAction(conversation, leadsById, adminsById, currentAdmin)),
    [conversations, leadsById, adminsById, currentAdmin]
  );

  const leadAlertItems = React.useMemo(() => {
    if (!config.includeLeadAlerts) return [];
    return notifications
      .filter((log) => log.channel === 'in_app' && log.entity_name === 'Lead' && ['customer_sms_reply_received', 'strategy_call_requested', 'booking_request_failed'].includes(log.event_type))
      .filter((log) => log.event_type !== 'customer_sms_reply_received' || log.metadata?.alert_category === 'high_intent_inbound_sms')
      .map((log) => buildLeadAlertAction(log, leadsById, currentAdmin));
  }, [notifications, leadsById, currentAdmin, config.includeLeadAlerts]);

  const unmatchedSmsItems = React.useMemo(() => {
    if (!config.includeLeadAlerts) return [];
    return notifications
      .filter((log) => log.channel === 'sms' && log.event_type === 'customer_sms_reply_unmatched')
      .map(buildUnmatchedSmsAction);
  }, [notifications, config.includeLeadAlerts]);

  const allItems = React.useMemo(
    () => [...conversationItems, ...leadAlertItems, ...unmatchedSmsItems].sort(sortActionItems),
    [conversationItems, leadAlertItems, unmatchedSmsItems]
  );

  const counts = React.useMemo(
    () => Object.fromEntries(config.views.map((view) => [view.key, allItems.filter((item) => matchesActionView(item, view.key)).length])),
    [config.views, allItems]
  );

  const itemsByView = React.useMemo(() => allItems.filter((item) => matchesActionView(item, activeView)), [allItems, activeView]);
  const heatCounts = React.useMemo(
    () => Object.fromEntries(SALES_HEAT_VIEWS.map((view) => [view.key, view.key === 'all' ? itemsByView.length : itemsByView.filter((item) => matchesSalesHeat(item, view.key)).length])),
    [itemsByView]
  );
  const ownerCounts = React.useMemo(
    () => Object.fromEntries(OWNERSHIP_VIEWS.map((view) => [view.key, view.key === 'all' ? itemsByView.length : itemsByView.filter((item) => matchesOwnership(item, view.key)).length])),
    [itemsByView]
  );

  const filteredItems = React.useMemo(
    () => itemsByView.filter((item) => matchesSalesHeat(item, heatFilter)).filter((item) => matchesOwnership(item, ownerFilter)),
    [itemsByView, heatFilter, ownerFilter]
  );

  React.useEffect(() => {
    filteredItems
      .filter((item) => item.kind === 'conversation')
      .slice(0, isMobile ? 6 : 3)
      .forEach((item) => {
        queryClient.prefetchQuery({
          queryKey: ['action-inbox-messages', item.entityId],
          queryFn: () => base44.entities.SupportMessage.filter({ conversation_id: item.entityId }, 'created_at', 200),
          staleTime: 15000,
        });
      });
  }, [filteredItems, isMobile, queryClient]);

  const selectedItem = filteredItems.find((item) => item.id === selectedKey) || allItems.find((item) => item.id === selectedKey) || null;
  const selectedConversation = selectedItem?.kind === 'conversation' ? conversations.find((conversation) => conversation.id === selectedItem.entityId) || null : null;
  const selectedLead = selectedItem?.linkedLeadId ? leads.find((lead) => lead.id === selectedItem.linkedLeadId) || null : null;

  React.useEffect(() => {
    if (!config.views.some((view) => view.key === activeView)) {
      setActiveView(config.views[0].key);
    }
  }, [config.views, activeView]);

  React.useEffect(() => {
    if (!allItems.length) {
      setSelectedKey(null);
      if (requestedFocusReply) {
        setSelectionError('No conversations are available right now.');
      }
      return;
    }

    const deepLinkedKey = getSelectedKeyFromUrl();
    if (deepLinkedKey) {
      const deepLinkedItem = allItems.find((item) => item.id === deepLinkedKey);
      if (deepLinkedItem) {
        if (selectedKey !== deepLinkedKey) {
          setSelectedKey(deepLinkedKey);
        }
        setSelectionError(null);
        if (isMobile) setShowMobileDetail(true);
        return;
      }

      if (requestedFocusReply) {
        setSelectionError('That conversation could not be loaded. It may have been removed or moved out of this queue.');
      }
    }

    if (selectedKey && allItems.some((item) => item.id === selectedKey)) {
      setSelectionError(null);
      return;
    }

    const nextItem = filteredItems[0] || allItems[0] || null;
    setSelectedKey(nextItem?.id || null);
    if (!nextItem && requestedFocusReply) {
      setSelectionError('That conversation could not be loaded.');
    }
  }, [allItems, filteredItems, selectedKey, isMobile, requestedFocusReply]);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('view', activeView);
    params.delete('conversationId');
    params.delete('leadId');
    params.delete('logId');
    params.delete('focusReply');

    if (selectedItem?.kind === 'conversation') {
      params.set('conversationId', selectedItem.entityId);
      params.set('focusReply', '1');
    }
    if (selectedItem?.kind === 'unmatched_sms') params.set('logId', selectedItem.logId);

    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  }, [activeView, selectedItem?.id]);

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['action-inbox-conversations'] });
    queryClient.invalidateQueries({ queryKey: ['action-inbox-notifications'] });
    queryClient.invalidateQueries({ queryKey: ['action-inbox-messages', selectedConversation?.id] });
    queryClient.invalidateQueries({ queryKey: ['action-inbox-leads'] });
    queryClient.invalidateQueries({ queryKey: ['admin-support-unread-count'] });
    queryClient.invalidateQueries({ queryKey: ['admin-unmatched-sms-count'] });
  };

  const updateConversationMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SupportConversation.update(id, data),
    onSuccess: refreshAll,
  });

  React.useEffect(() => {
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
    queryFn: () => base44.entities.SupportMessage.filter({ conversation_id: selectedConversation.id }, 'created_at', 200),
    initialData: [],
    enabled: !!selectedConversation,
    staleTime: 15000,
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
        snoozed_at: null,
        snoozed_until: null,
        snooze_label: null,
        snooze_alert_sent_at: null,
      });
    },
    onSuccess: refreshAll,
  });

  const handleSelect = (item) => {
    setSelectedKey(item.id);
    setSelectionError(null);
    if (item.kind === 'conversation') {
      messageListCacheRef.current[item.entityId] = true;
    }
    if (isMobile) {
      setShowMobileDetail(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const updateSelectedConversation = (data) => selectedConversation && updateConversationMutation.mutate({ id: selectedConversation.id, data });

  const snoozeConversation = (conversation, minutes) => {
    const now = new Date();
    const snoozedUntil = new Date(now.getTime() + (minutes * 60 * 1000));
    updateConversationMutation.mutate({
      id: conversation.id,
      data: {
        ...conversation,
        snoozed_at: now.toISOString(),
        snoozed_until: snoozedUntil.toISOString(),
        snooze_label: minutes === 60 ? 'Remind in 1 hour' : `Remind in ${minutes} min`,
        snooze_alert_sent_at: null,
      },
    });
  };

  const handleInstall = async () => {
    if (!installPromptEvent) return;
    await installPromptEvent.prompt();
    await installPromptEvent.userChoice;
    setInstallPromptEvent(null);
  };

  const handleEnableNotifications = async () => {
    if (!currentAdmin?.id) return;
    const status = await enableOneSignalPush(currentAdmin);
    setNotificationSupported(status.supported);
    setNotificationPermission(status.subscribed ? 'granted' : status.permission);
  };

  const listTitle = mode === 'support' ? 'Support Threads' : 'Action Queue';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <Badge className="border-cyan-500/20 bg-cyan-500/10 text-cyan-300">{config.badge}</Badge>
            <Badge className="border-white/10 bg-white/5 text-slate-300">Lead-closing workflow</Badge>
          </div>
          <h2 className="text-3xl font-bold text-white">{config.title}</h2>
          <p className="mt-2 max-w-3xl text-slate-400">{config.description}</p>
          <ActionInboxMobileControls
            canInstall={!!installPromptEvent}
            isStandalone={isStandalone}
            onInstall={handleInstall}
            notificationsSupported={notificationSupported}
            notificationPermission={notificationPermission}
            onEnableNotifications={handleEnableNotifications}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {config.views.map((view) => (
          <button
            key={view.key}
            type="button"
            onClick={() => {
              setActiveView(view.key);
              if (isMobile) setShowMobileDetail(false);
            }}
            className={`rounded-3xl border px-4 py-4 text-left transition-colors ${activeView === view.key ? 'border-cyan-500/30 bg-cyan-500/10' : 'border-white/5 bg-[#0f172a] hover:bg-white/[0.03]'}`}
          >
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{view.label}</p>
            <p className="mt-2 text-3xl font-semibold text-white tabular-nums">{counts[view.key] || 0}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {SALES_HEAT_VIEWS.map((view) => (
            <button
              key={view.key}
              type="button"
              onClick={() => setHeatFilter(view.key)}
              className={`rounded-2xl border px-4 py-2 text-sm ${heatFilter === view.key ? 'border-violet-500/30 bg-violet-500/10 text-violet-200' : 'border-white/10 bg-[#111827] text-slate-300 hover:bg-slate-800'}`}
            >
              {view.label} <span className="ml-2 tabular-nums text-xs opacity-75">{heatCounts[view.key] || 0}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {OWNERSHIP_VIEWS.map((view) => (
            <button
              key={view.key}
              type="button"
              onClick={() => setOwnerFilter(view.key)}
              className={`rounded-2xl border px-4 py-2 text-sm ${ownerFilter === view.key ? 'border-amber-500/30 bg-amber-500/10 text-amber-200' : 'border-white/10 bg-[#111827] text-slate-300 hover:bg-slate-800'}`}
            >
              {view.label} <span className="ml-2 tabular-nums text-xs opacity-75">{ownerCounts[view.key] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      {selectionError && (
        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {selectionError}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[400px_minmax(0,1fr)_340px]">
        {(!isMobile || !showMobileDetail) && (
          <ActionInboxList
            title={listTitle}
            items={filteredItems}
            selectedId={selectedItem?.id || null}
            onSelect={handleSelect}
            onQuickAssign={(item) => {
              const conversation = conversations.find((entry) => entry.id === item.entityId);
              if (conversation && currentAdmin?.id) {
                updateConversationMutation.mutate({
                  id: conversation.id,
                  data: { ...conversation, assigned_admin_id: currentAdmin.id },
                });
              }
            }}
            onQuickSnooze={(item, minutes) => {
              const conversation = conversations.find((entry) => entry.id === item.entityId);
              if (conversation) snoozeConversation(conversation, minutes);
            }}
          />
        )}

        {(!isMobile || showMobileDetail) && (
          <ActionInboxDetail
            item={selectedItem}
            conversation={selectedConversation}
            linkedLead={selectedLead}
            currentAdmin={currentAdmin}
            messages={messages}
            isSaving={replyMutation.isPending || updateConversationMutation.isPending}
            onBack={() => setShowMobileDetail(false)}
            showBack={isMobile}
            onAssignToMe={() => selectedConversation && currentAdmin?.id && updateConversationMutation.mutate({
              id: selectedConversation.id,
              data: { ...selectedConversation, assigned_admin_id: currentAdmin.id },
            })}
            onSnooze={(minutes) => selectedConversation && snoozeConversation(selectedConversation, minutes)}
            onReply={({ messageBody, isInternalNote, reset }) => {
              replyMutation.mutate({ messageBody, isInternalNote }, { onSuccess: reset });
            }}
            onResolve={() => updateSelectedConversation({
              ...selectedConversation,
              status: 'resolved',
              unread_for_admin: false,
              unread_for_client: false,
              snoozed_at: null,
              snoozed_until: null,
              snooze_label: null,
              snooze_alert_sent_at: null,
            })}
          />
        )}

        {!isMobile && (
          <ActionInboxContextPanel
            item={selectedItem}
            conversation={selectedConversation}
            admins={admins.filter((admin) => admin.role === 'admin')}
            leads={leads}
            onAssignAdmin={(assignedAdminId) => updateSelectedConversation({
              ...selectedConversation,
              assigned_admin_id: assignedAdminId === 'unassigned' ? null : assignedAdminId,
            })}
            onPriorityChange={(priority) => updateSelectedConversation({
              ...selectedConversation,
              priority,
              urgency_level: priority,
            })}
            onSnooze={(minutes) => selectedConversation && snoozeConversation(selectedConversation, minutes)}
          />
        )}
      </div>
    </div>
  );
}