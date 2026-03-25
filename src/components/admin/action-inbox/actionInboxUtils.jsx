import { formatDistanceToNowStrict } from 'date-fns';

export const ACTION_VIEWS = [
  { key: 'needs_reply_now', label: 'Needs Reply Now' },
  { key: 'high_intent', label: 'High Intent' },
  { key: 'unassigned', label: 'Unassigned' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'unmatched_sms', label: 'Unmatched SMS' },
];

export const priorityStyles = {
  urgent: 'border-red-500/30 bg-red-500/10 text-red-200',
  high: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  normal: 'border-slate-700 bg-slate-800 text-slate-200',
  low: 'border-slate-700 bg-slate-900 text-slate-300',
};

export const channelStyles = {
  'Live Chat': 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300',
  'Client Portal': 'border-violet-500/20 bg-violet-500/10 text-violet-200',
  SMS: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200',
  Lead: 'border-blue-500/20 bg-blue-500/10 text-blue-200',
  Support: 'border-slate-700 bg-slate-800 text-slate-200',
};

const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };

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

function getOverdueThreshold(priority) {
  if (priority === 'urgent') return 10;
  if (priority === 'high') return 30;
  if (priority === 'low') return 240;
  return 60;
}

function formatWaitLabel(dateValue) {
  if (!dateValue) return 'No timer';
  return `${formatDistanceToNowStrict(new Date(dateValue))} waiting`;
}

function getConversationChannelLabel(sourceType) {
  if (sourceType === 'client_portal') return 'Client Portal';
  if (sourceType === 'public_site') return 'Live Chat';
  return 'Support';
}

function buildOwnerLabel(assignedAdminId, adminsById) {
  if (!assignedAdminId) return 'Unassigned';
  const admin = adminsById[assignedAdminId];
  return admin?.full_name || admin?.email || 'Assigned';
}

export function buildConversationAction(conversation, leadsById, adminsById) {
  const linkedLead = leadsById[conversation.linked_lead_id] || null;
  const priority = cleanText(conversation.urgency_level || conversation.priority, 'normal');
  const waitMinutes = getWaitMinutes(conversation.last_message_at || conversation.updated_at || conversation.updated_date);
  const needsReply = conversation.unread_for_admin || ['new', 'open', 'waiting_on_admin'].includes(conversation.status);
  const highIntent = ['urgent', 'high'].includes(priority)
    || conversation.enquiry_category === 'urgent'
    || conversation.enquiry_category === 'sales'
    || conversation.ai_mode === 'escalated';

  return {
    id: `conversation:${conversation.id}`,
    kind: 'conversation',
    entityId: conversation.id,
    name: cleanText(conversation.visitor_name, 'Unknown contact'),
    business: cleanText(linkedLead?.business_name || linkedLead?.full_name || conversation.visitor_email, 'No business linked'),
    channel: getConversationChannelLabel(conversation.source_type),
    intentSummary: clipText(conversation.ai_summary || conversation.subject || conversation.last_message_preview),
    preview: clipText(conversation.last_message_preview || conversation.subject),
    priority,
    owner: buildOwnerLabel(conversation.assigned_admin_id, adminsById),
    waitLabel: formatWaitLabel(conversation.last_message_at || conversation.updated_at || conversation.updated_date),
    waitMinutes,
    overdue: needsReply && waitMinutes >= getOverdueThreshold(priority),
    needsReply,
    highIntent,
    unassigned: !conversation.assigned_admin_id,
    linkedLeadId: conversation.linked_lead_id || null,
    phone: cleanText(conversation.visitor_phone, ''),
    email: cleanText(conversation.visitor_email, ''),
    sourcePage: cleanText(conversation.source_page, '/'),
    status: cleanText(conversation.status, 'open'),
    primaryLabel: 'Reply now',
    secondaryLabel: conversation.linked_lead_id ? 'Open Lead' : null,
    actionUrl: `/ActionInbox?view=needs_reply_now&conversationId=${conversation.id}`,
    secondaryUrl: conversation.linked_lead_id ? `/LeadDetail?id=${conversation.linked_lead_id}` : null,
  };
}

export function buildLeadAlertAction(log, leadsById) {
  const linkedLead = leadsById[log.entity_id] || null;
  const priority = cleanText(log.metadata?.priority || linkedLead?.priority || 'high', 'high');
  const waitMinutes = getWaitMinutes(log.triggered_at || log.created_date);
  const channel = log.event_type === 'customer_sms_reply_received' ? 'SMS' : 'Lead';
  const name = cleanText(log.metadata?.full_name || log.metadata?.business_name || linkedLead?.full_name || linkedLead?.business_name, 'Lead alert');
  const business = cleanText(log.metadata?.business_name || linkedLead?.business_name || linkedLead?.email, 'Lead follow-up');

  return {
    id: `lead-alert:${log.id}`,
    kind: 'lead_alert',
    entityId: log.id,
    logId: log.id,
    name,
    business,
    channel,
    intentSummary: clipText(log.title || log.message),
    preview: clipText(log.message || log.metadata?.message_preview),
    priority,
    owner: cleanText(linkedLead?.assigned_owner, 'Unassigned'),
    waitLabel: formatWaitLabel(log.triggered_at || log.created_date),
    waitMinutes,
    overdue: waitMinutes >= 60,
    needsReply: true,
    highIntent: true,
    unassigned: !linkedLead?.assigned_owner,
    linkedLeadId: linkedLead?.id || (String(log.entity_id || '').startsWith('unmatched:') ? null : log.entity_id),
    phone: cleanText(log.metadata?.mobile_number || linkedLead?.mobile_number, ''),
    email: cleanText(log.metadata?.email || linkedLead?.email, ''),
    sourcePage: cleanText(log.metadata?.source_page, '/'),
    status: cleanText(log.event_type, 'lead_alert'),
    primaryLabel: 'Open Lead',
    secondaryLabel: cleanText(log.metadata?.mobile_number || linkedLead?.mobile_number, '') ? 'Call' : null,
    actionUrl: linkedLead?.id || log.entity_id ? `/LeadDetail?id=${linkedLead?.id || log.entity_id}` : '/LeadDashboard',
    secondaryUrl: cleanText(log.metadata?.mobile_number || linkedLead?.mobile_number, '') ? `tel:${cleanText(log.metadata?.mobile_number || linkedLead?.mobile_number, '').replace(/\s+/g, '')}` : null,
  };
}

export function buildUnmatchedSmsAction(log) {
  const waitMinutes = getWaitMinutes(log.triggered_at || log.created_date);
  const senderNumber = cleanText(log.metadata?.sender_number, 'Unknown number');
  const needsReply = true;

  return {
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
    owner: 'Unassigned',
    waitLabel: formatWaitLabel(log.triggered_at || log.created_date),
    waitMinutes,
    overdue: needsReply && waitMinutes >= 60,
    needsReply,
    highIntent: !!log.metadata?.requires_admin_attention,
    unassigned: true,
    linkedLeadId: null,
    phone: senderNumber,
    email: '',
    sourcePage: '',
    status: cleanText(log.match_status, 'open'),
    primaryLabel: 'Review SMS',
    secondaryLabel: null,
    actionUrl: `/UnmatchedSmsInbox`,
    secondaryUrl: null,
  };
}

export function matchesActionView(item, viewKey) {
  if (viewKey === 'needs_reply_now') return item.needsReply;
  if (viewKey === 'high_intent') return item.highIntent;
  if (viewKey === 'unassigned') return item.unassigned;
  if (viewKey === 'overdue') return item.overdue;
  if (viewKey === 'unmatched_sms') return item.kind === 'unmatched_sms';
  return true;
}

export function sortActionItems(a, b) {
  const priorityDiff = (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9);
  if (priorityDiff !== 0) return priorityDiff;
  if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
  return b.waitMinutes - a.waitMinutes;
}