import { extractSalesIntentLabel, hasHighValueLeadSignal } from './actionInboxUtils';

export function shouldNotifyConversation(conversation) {
  if (!conversation) return false;
  if (['resolved', 'closed', 'waiting_on_customer'].includes(conversation.status)) return false;
  return hasHighValueLeadSignal(conversation.ai_summary)
    || ['human_required', 'escalated'].includes(conversation.ai_mode)
    || ['high', 'urgent'].includes(conversation.urgency_level)
    || ['high', 'urgent'].includes(conversation.priority);
}

export function buildConversationNotificationPayload(conversation) {
  if (!shouldNotifyConversation(conversation)) return null;

  const intent = extractSalesIntentLabel(conversation.ai_summary);
  const name = conversation.visitor_name || 'New lead';
  const summary = String(conversation.last_message_preview || conversation.ai_summary || conversation.subject || 'Open Action Inbox')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);

  const reasons = [];
  if (hasHighValueLeadSignal(conversation.ai_summary)) reasons.push('High-value lead');
  if (conversation.ai_mode === 'human_required') reasons.push('Human required');
  if (conversation.ai_mode === 'escalated' || conversation.urgency_level === 'urgent' || conversation.priority === 'urgent') reasons.push('Urgent');

  return {
    title: `${reasons[0] || `${intent} intent`} • ${name}`,
    body: `${intent} intent${conversation.enquiry_category ? ` • ${conversation.enquiry_category.replace(/_/g, ' ')}` : ''} • ${summary}`,
    tag: `conversation-${conversation.id}`,
    url: `/ActionInbox?view=needs_reply_now&conversationId=${conversation.id}&focusReply=1`,
  };
}