import { buildLeadScoringProfile, formatLeadIntentLabel } from './actionInboxUtils';

export function shouldNotifyConversation(conversation) {
  if (!conversation) return false;
  if (['resolved', 'closed', 'waiting_on_customer'].includes(conversation.status)) return false;

  const leadProfile = buildLeadScoringProfile(
    [conversation.ai_summary, conversation.last_message_preview, conversation.subject].filter(Boolean).join(' '),
    conversation,
    null,
  );

  return leadProfile.highValueLead
    || ['human_required', 'escalated'].includes(conversation.ai_mode)
    || ['high', 'urgent'].includes(conversation.urgency_level)
    || ['high', 'urgent'].includes(conversation.priority);
}

export function buildConversationNotificationPayload(conversation) {
  if (!shouldNotifyConversation(conversation)) return null;

  const leadProfile = buildLeadScoringProfile(
    [conversation.ai_summary, conversation.last_message_preview, conversation.subject].filter(Boolean).join(' '),
    conversation,
    null,
  );

  const name = conversation.visitor_name || 'New lead';
  const urgency = String(conversation.urgency_level || conversation.priority || 'normal').replace(/_/g, ' ');
  const leadQuality = leadProfile.leadQuality === 'high_value' ? 'high-value lead' : leadProfile.leadQuality;
  const summary = String(conversation.last_message_preview || conversation.ai_summary || conversation.subject || 'Open Action Inbox')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);

  return {
    title: `${urgency.toUpperCase()} • ${formatLeadIntentLabel(leadProfile.intentTag)} • ${leadQuality}`,
    body: `${name} • score ${leadProfile.score} • ${summary}`,
    tag: `conversation-${conversation.id}`,
    url: `/ActionInbox?view=needs_reply_now&conversationId=${conversation.id}&focusReply=1`,
  };
}