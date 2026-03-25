export const ACTION_VIEWS = [
  { key: 'needs_reply_now', label: 'Needs Reply Now' },
  { key: 'high_intent', label: 'High Intent' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'unassigned', label: 'Unassigned' },
  { key: 'unmatched_sms', label: 'Unmatched SMS' },
];

export const SALES_HEAT_VIEWS = [
  { key: 'all', label: 'All Leads' },
  { key: 'hot', label: 'HOT LEADS' },
  { key: 'warm', label: 'WARM' },
  { key: 'cold', label: 'COLD' },
];

export const priorityStyles = {
  urgent: 'border-red-500/30 bg-red-500/10 text-red-200',
  high: 'border-violet-500/30 bg-violet-500/10 text-violet-200',
  normal: 'border-slate-700 bg-slate-800 text-slate-200',
  low: 'border-slate-700 bg-slate-900 text-slate-300',
};

export const attentionStyles = {
  overdue: 'border-red-500/30 bg-red-500/10 text-red-200',
  needs_reply: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  high_intent: 'border-violet-500/30 bg-violet-500/10 text-violet-200',
  normal: 'border-slate-700 bg-slate-800 text-slate-200',
};

export const slaStyles = {
  overdue: 'border-red-500/30 bg-red-500/10 text-red-200',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  normal: 'border-slate-700 bg-slate-900 text-slate-100',
};

export const intentLevelStyles = {
  'HIGH INTENT': 'border-violet-500/30 bg-violet-500/10 text-violet-200',
  MEDIUM: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  LOW: 'border-slate-700 bg-slate-800 text-slate-200',
};

export const channelStyles = {
  Chat: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300',
  'Client Portal': 'border-violet-500/20 bg-violet-500/10 text-violet-200',
  SMS: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200',
  Email: 'border-blue-500/20 bg-blue-500/10 text-blue-200',
  Lead: 'border-blue-500/20 bg-blue-500/10 text-blue-200',
  Support: 'border-slate-700 bg-slate-800 text-slate-200',
};

const attentionOrder = { overdue: 0, high_intent: 1, needs_reply: 2, normal: 3 };
const heatOrder = { hot: 0, warm: 1, cold: 2 };

function cleanText(value, fallback = '') {
  const text = String(value || '').trim();
  return text || fallback;
}

function clipText(value, max = 120, fallback = 'No summary yet') {
  const text = cleanText(value, fallback);
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function getWaitMinutes(dateValue) {
  if (!dateValue) return 0;
  const diff = Date.now() - new Date(dateValue).getTime();
  return Math.max(0, Math.round(diff / 60000));
}

function getSlaState(waitMinutes) {
  if (waitMinutes >= 15) return 'overdue';
  if (waitMinutes >= 5) return 'warning';
  return 'normal';
}

function formatWaitShort(waitMinutes) {
  if (waitMinutes <= 0) return 'Now';
  if (waitMinutes < 60) return `${waitMinutes}m`;
  if (waitMinutes < 1440) return `${Math.floor(waitMinutes / 60)}h`;
  return `${Math.floor(waitMinutes / 1440)}d`;
}

function formatWaitLong(waitMinutes) {
  if (waitMinutes <= 0) return 'Just now';
  if (waitMinutes < 60) return `${waitMinutes} min waiting`;
  if (waitMinutes < 1440) {
    const hours = Math.floor(waitMinutes / 60);
    const minutes = waitMinutes % 60;
    return minutes ? `${hours}h ${minutes}m waiting` : `${hours}h waiting`;
  }
  const days = Math.floor(waitMinutes / 1440);
  const hours = Math.floor((waitMinutes % 1440) / 60);
  return hours ? `${days}d ${hours}h waiting` : `${days}d waiting`;
}

function formatActivity(dateValue) {
  if (!dateValue) return 'No recent activity';
  const waitMinutes = getWaitMinutes(dateValue);
  return waitMinutes === 0 ? 'Just now' : `${formatWaitShort(waitMinutes)} ago`;
}

function getConversationChannelLabel(sourceType) {
  if (sourceType === 'client_portal') return 'Client Portal';
  if (sourceType === 'public_site') return 'Chat';
  if (sourceType === 'admin_internal') return 'Email';
  return 'Support';
}

function buildOwnerLabel(assignedAdminId, adminsById) {
  if (!assignedAdminId) return 'UNASSIGNED';
  const admin = adminsById[assignedAdminId];
  return admin?.full_name || admin?.email || 'Assigned';
}

function buildAssignedState(assignedAdminId, currentAdmin) {
  if (!assignedAdminId) return 'unassigned';
  if (assignedAdminId === currentAdmin?.id) return 'mine';
  return 'team_queue';
}

function buildLeadAssignedState(assignedOwner, currentAdmin) {
  const owner = cleanText(assignedOwner, '');
  if (!owner) return 'unassigned';
  if (!currentAdmin) return 'team_queue';
  const myName = cleanText(currentAdmin.full_name, '').toLowerCase();
  const myEmail = cleanText(currentAdmin.email, '').toLowerCase();
  const normalizedOwner = owner.toLowerCase();
  if (normalizedOwner === myName || normalizedOwner === myEmail) return 'mine';
  return 'team_queue';
}

function getBookingStatus(lead) {
  if (!lead) return 'Not booked';
  if (lead.booking_status === 'confirmed' || lead.status === 'Strategy Call Booked' || lead.booking_reference) return 'Confirmed';
  if (lead.booking_status === 'requested' || lead.booking_intent || lead.status === 'Strategy Call Requested') return 'Booking requested';
  return 'Not booked';
}

function scoreIntent(text, conversation, lead, extraScore = 0) {
  const normalized = String(text || '').toLowerCase();
  let score = extraScore;

  if (/(yes|call me|phone me|pricing|price|quote|cost|ready|keen|book|booking|schedule|available|demo|trial|proposal)/.test(normalized)) score += 3;
  if (/(help|issue|problem|support|question)/.test(normalized)) score += 1;
  if (conversation?.enquiry_category === 'sales' || conversation?.enquiry_category === 'urgent') score += 2;
  if (conversation?.ai_mode === 'escalated') score += 2;
  if (['urgent', 'high'].includes(conversation?.urgency_level) || ['urgent', 'high'].includes(conversation?.priority)) score += 2;
  if (lead?.booking_intent || ['requested', 'confirmed'].includes(lead?.booking_status)) score += 2;
  if (conversation?.updated_at && conversation?.created_at && conversation.updated_at !== conversation.created_at) score += 1;

  if (score >= 5) return 'HIGH INTENT';
  if (score >= 2) return 'MEDIUM';
  return 'LOW';
}

function getSalesHeat(intentLevel, needsReply) {
  if (intentLevel === 'HIGH INTENT' && needsReply) return 'hot';
  if (intentLevel === 'MEDIUM' && needsReply) return 'warm';
  return 'cold';
}

function getAttentionState({ overdue, needsReply, intentLevel }) {
  if (overdue) return 'overdue';
  if (intentLevel === 'HIGH INTENT') return 'high_intent';
  if (needsReply) return 'needs_reply';
  return 'normal';
}

function getRecommendedNextAction(lead, intentLevel, hasPhone) {
  if (lead?.next_action) return lead.next_action;
  if (lead?.booking_status === 'requested') return 'Send booking link';
  if (lead?.booking_status === 'confirmed') return 'Confirm time';
  if (intentLevel === 'HIGH INTENT' && hasPhone) return 'Call now';
  if (intentLevel === 'HIGH INTENT') return 'Reply now';
  if (intentLevel === 'MEDIUM') return 'Ask qualifying question';
  return 'Send short reply';
}

function isConversationSnoozed(conversation) {
  const snoozedUntil = conversation?.snoozed_until ? new Date(conversation.snoozed_until).getTime() : null;
  const snoozedAt = conversation?.snoozed_at ? new Date(conversation.snoozed_at).getTime() : null;
  const lastMessageAt = conversation?.last_message_at ? new Date(conversation.last_message_at).getTime() : null;

  if (!snoozedUntil || !snoozedAt || snoozedUntil <= Date.now()) return false;
  if (!lastMessageAt) return true;
  return lastMessageAt <= snoozedAt;
}

function buildSnoozeLabel(conversation) {
  if (!conversation?.snoozed_until) return null;
  const date = new Date(conversation.snoozed_until);
  return `Snoozed until ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
}

function buildBaseAction({ id, kind, entityId, name, business, channel, intentSummary, preview, priority, owner, ownerId = null, assignedState, waitMinutes, needsReply, linkedLeadId = null, phone = '', email = '', sourcePage = '', status = 'open', primaryLabel, secondaryUrl = null, actionUrl, bookingStatus, lastActivity, intentLevel, recommendedNextAction, logId = null, isSnoozed = false, snoozeLabel = null }) {
  const overdue = needsReply && getSlaState(waitMinutes) === 'overdue';
  return {
    id,
    kind,
    entityId,
    logId,
    name,
    business,
    channel,
    intentSummary,
    preview,
    priority,
    owner,
    ownerId,
    assignedState,
    waitMinutes,
    waitShort: formatWaitShort(waitMinutes),
    waitLabel: formatWaitLong(waitMinutes),
    slaState: getSlaState(waitMinutes),
    overdue,
    needsReply,
    highIntent: intentLevel === 'HIGH INTENT',
    unassigned: assignedState === 'unassigned',
    linkedLeadId,
    phone,
    email,
    sourcePage,
    status,
    primaryLabel,
    secondaryUrl,
    actionUrl,
    bookingStatus,
    lastActivity,
    intentLevel,
    salesHeat: getSalesHeat(intentLevel, needsReply),
    attentionState: getAttentionState({ overdue, needsReply, intentLevel }),
    recommendedNextAction,
    isSnoozed,
    snoozeLabel,
  };
}

export function buildConversationAction(conversation, leadsById, adminsById, currentAdmin) {
  const linkedLead = leadsById[conversation.linked_lead_id] || null;
  const waitMinutes = getWaitMinutes(conversation.last_message_at || conversation.updated_at || conversation.updated_date);
  const assignedState = buildAssignedState(conversation.assigned_admin_id, currentAdmin);
  const isSnoozed = isConversationSnoozed(conversation);
  const needsReplyBase = conversation.unread_for_admin || ['new', 'open', 'waiting_on_admin'].includes(conversation.status);
  const needsReply = needsReplyBase && !isSnoozed;
  const intentLevel = scoreIntent(
    [conversation.ai_summary, conversation.subject, conversation.last_message_preview, linkedLead?.message, linkedLead?.next_action].filter(Boolean).join(' '),
    conversation,
    linkedLead,
  );

  return buildBaseAction({
    id: `conversation:${conversation.id}`,
    kind: 'conversation',
    entityId: conversation.id,
    name: cleanText(conversation.visitor_name, 'Unknown contact'),
    business: cleanText(linkedLead?.business_name || linkedLead?.full_name || conversation.visitor_email, 'No business linked'),
    channel: getConversationChannelLabel(conversation.source_type),
    intentSummary: clipText(conversation.ai_summary || conversation.subject || conversation.last_message_preview),
    preview: clipText(conversation.last_message_preview || conversation.subject),
    priority: cleanText(conversation.urgency_level || conversation.priority, 'normal'),
    owner: buildOwnerLabel(conversation.assigned_admin_id, adminsById),
    ownerId: conversation.assigned_admin_id || null,
    assignedState,
    waitMinutes,
    needsReply,
    linkedLeadId: conversation.linked_lead_id || null,
    phone: cleanText(conversation.visitor_phone, ''),
    email: cleanText(conversation.visitor_email, ''),
    sourcePage: cleanText(conversation.source_page, '/'),
    status: cleanText(conversation.status, 'open'),
    primaryLabel: 'Reply Now',
    secondaryUrl: conversation.linked_lead_id ? `/LeadDetail?id=${conversation.linked_lead_id}` : null,
    actionUrl: `/ActionInbox?view=needs_reply_now&conversationId=${conversation.id}`,
    bookingStatus: getBookingStatus(linkedLead),
    lastActivity: formatActivity(linkedLead?.last_activity_at || conversation.last_message_at || conversation.updated_at),
    intentLevel,
    recommendedNextAction: getRecommendedNextAction(linkedLead, intentLevel, !!conversation.visitor_phone),
    isSnoozed,
    snoozeLabel: buildSnoozeLabel(conversation),
  });
}

export function buildLeadAlertAction(log, leadsById, currentAdmin) {
  const linkedLead = leadsById[log.entity_id] || null;
  const waitMinutes = getWaitMinutes(log.triggered_at || log.created_date);
  const channel = log.metadata?.channel_label || (log.event_type === 'customer_sms_reply_received' ? 'SMS' : 'Lead');
  const intentLevel = scoreIntent(
    [log.title, log.message, log.metadata?.intent_summary, log.metadata?.message_preview, linkedLead?.message, linkedLead?.next_action].filter(Boolean).join(' '),
    {
      enquiry_category: log.metadata?.enquiry_category || linkedLead?.enquiry_type,
      urgency_level: log.metadata?.urgency_level || 'high',
      priority: log.metadata?.priority || 'high',
      ai_mode: log.metadata?.alert_category === 'high_intent_inbound_sms' ? 'escalated' : 'human_required',
    },
    linkedLead,
    log.metadata?.requires_admin_attention ? 2 : 0,
  );

  return buildBaseAction({
    id: `lead-alert:${log.id}`,
    kind: 'lead_alert',
    entityId: log.id,
    logId: log.id,
    name: cleanText(log.metadata?.full_name || log.metadata?.business_name || linkedLead?.full_name || linkedLead?.business_name, 'Lead alert'),
    business: cleanText(log.metadata?.business_name || linkedLead?.business_name || linkedLead?.email, 'Lead follow-up'),
    channel,
    intentSummary: clipText(log.metadata?.intent_summary || log.title || log.message),
    preview: clipText(log.message || log.metadata?.message_preview),
    priority: cleanText(log.metadata?.priority || 'high', 'high'),
    owner: cleanText(linkedLead?.assigned_owner, 'UNASSIGNED'),
    assignedState: buildLeadAssignedState(linkedLead?.assigned_owner, currentAdmin),
    waitMinutes,
    needsReply: true,
    linkedLeadId: linkedLead?.id || (String(log.entity_id || '').startsWith('unmatched:') ? null : log.entity_id),
    phone: cleanText(log.metadata?.mobile_number || linkedLead?.mobile_number, ''),
    email: cleanText(log.metadata?.email || linkedLead?.email, ''),
    sourcePage: cleanText(log.metadata?.source_page, '/'),
    status: cleanText(log.event_type, 'lead_alert'),
    primaryLabel: 'Open Lead',
    secondaryUrl: linkedLead?.id || log.entity_id ? `/LeadDetail?id=${linkedLead?.id || log.entity_id}` : null,
    actionUrl: linkedLead?.id || log.entity_id ? `/LeadDetail?id=${linkedLead?.id || log.entity_id}` : '/LeadDashboard',
    bookingStatus: getBookingStatus(linkedLead),
    lastActivity: formatActivity(log.triggered_at || log.created_date),
    intentLevel,
    recommendedNextAction: getRecommendedNextAction(linkedLead, intentLevel, !!(log.metadata?.mobile_number || linkedLead?.mobile_number)),
  });
}

export function buildUnmatchedSmsAction(log) {
  const waitMinutes = getWaitMinutes(log.triggered_at || log.created_date);
  const senderNumber = cleanText(log.metadata?.sender_number, 'Unknown number');
  const intentLevel = log.metadata?.requires_admin_attention ? 'HIGH INTENT' : 'MEDIUM';

  return buildBaseAction({
    id: `unmatched-sms:${log.id}`,
    kind: 'unmatched_sms',
    entityId: log.id,
    logId: log.id,
    name: senderNumber,
    business: 'No matched lead',
    channel: 'SMS',
    intentSummary: clipText(log.message || log.title),
    preview: clipText(log.title || 'Inbound SMS needs manual review'),
    priority: log.metadata?.requires_admin_attention ? 'urgent' : 'high',
    owner: 'UNASSIGNED',
    assignedState: 'unassigned',
    waitMinutes,
    needsReply: true,
    phone: senderNumber,
    email: '',
    sourcePage: '',
    status: cleanText(log.match_status, 'open'),
    primaryLabel: 'Review SMS',
    secondaryUrl: null,
    actionUrl: '/UnmatchedSmsInbox',
    bookingStatus: 'Unknown',
    lastActivity: formatActivity(log.triggered_at || log.created_date),
    intentLevel,
    recommendedNextAction: 'Match SMS to lead',
  });
}

export function matchesActionView(item, viewKey) {
  if (item.isSnoozed) return false;
  if (viewKey === 'needs_reply_now') return item.needsReply;
  if (viewKey === 'high_intent') return item.highIntent;
  if (viewKey === 'overdue') return item.overdue;
  if (viewKey === 'unassigned') return item.unassigned;
  if (viewKey === 'unmatched_sms') return item.kind === 'unmatched_sms';
  return true;
}

export function matchesSalesHeat(item, heatKey) {
  if (heatKey === 'all') return true;
  return item.salesHeat === heatKey;
}

export function matchesOwnership(item, ownerKey) {
  if (ownerKey === 'all') return true;
  if (ownerKey === 'assigned_to_me') return item.assignedState === 'mine';
  if (ownerKey === 'unassigned') return item.assignedState === 'unassigned';
  if (ownerKey === 'team_queue') return item.assignedState === 'team_queue';
  return true;
}

export function sortActionItems(a, b) {
  const attentionDiff = (attentionOrder[a.attentionState] ?? 9) - (attentionOrder[b.attentionState] ?? 9);
  if (attentionDiff !== 0) return attentionDiff;
  if (a.unassigned !== b.unassigned) return a.unassigned ? -1 : 1;
  const heatDiff = (heatOrder[a.salesHeat] ?? 9) - (heatOrder[b.salesHeat] ?? 9);
  if (heatDiff !== 0) return heatDiff;
  return b.waitMinutes - a.waitMinutes;
}