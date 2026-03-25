import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function getErrorMessage(error) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'Unknown error';
}

function getChannelLabel(sourceType) {
  if (sourceType === 'client_portal') return 'Client Portal';
  if (sourceType === 'public_site') return 'Chat';
  if (sourceType === 'admin_internal') return 'Email';
  return 'Support';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const nowIso = new Date().toISOString();
    const now = new Date(nowIso).getTime();
    const conversations = await base44.asServiceRole.entities.SupportConversation.list('-updated_at', 300);
    const leads = await base44.asServiceRole.entities.Lead.list('-updated_date', 300);
    const leadsById = Object.fromEntries(leads.map((lead) => [lead.id, lead]));

    const dueConversations = conversations.filter((conversation) => {
      if (!conversation.snoozed_until || !conversation.snoozed_at) return false;
      if (['resolved', 'closed'].includes(conversation.status)) return false;
      if (!(conversation.unread_for_admin || ['new', 'open', 'waiting_on_admin'].includes(conversation.status))) return false;

      const snoozedUntil = new Date(conversation.snoozed_until).getTime();
      const snoozedAt = new Date(conversation.snoozed_at).getTime();
      const lastMessageAt = conversation.last_message_at ? new Date(conversation.last_message_at).getTime() : 0;
      const alertSentAt = conversation.snooze_alert_sent_at ? new Date(conversation.snooze_alert_sent_at).getTime() : 0;

      return snoozedUntil <= now && lastMessageAt <= snoozedAt && alertSentAt < snoozedUntil;
    });

    const results = [];

    for (const conversation of dueConversations) {
      const linkedLead = leadsById[conversation.linked_lead_id] || null;
      const summary = conversation.ai_summary || conversation.last_message_preview || conversation.subject || 'Conversation needs a fast follow-up.';
      const priority = ['urgent', 'high'].includes(conversation.urgency_level || conversation.priority) ? 'high' : 'normal';
      const title = priority === 'high' ? 'High-intent chat needs reply' : 'Snoozed chat needs reply';
      const uniqueKey = `snooze_follow_up:${conversation.id}:${conversation.snoozed_until}`;

      const alertResponse = await base44.asServiceRole.functions.invoke('sendAdminAlert', {
        eventType: 'support_conversation_reply',
        entityName: 'SupportConversation',
        entityId: conversation.id,
        clientAccountId: conversation.linked_client_account_id || null,
        title,
        message: summary,
        actorEmail: conversation.visitor_email || null,
        uniqueKey,
        priority,
        smsMessage: summary,
        metadata: {
          conversation_id: conversation.id,
          admin_link: `/ActionInbox?view=needs_reply_now&conversationId=${conversation.id}&focusReply=1`,
          full_name: conversation.visitor_name || 'Contact',
          business_name: linkedLead?.business_name || '',
          email: conversation.visitor_email || linkedLead?.email || null,
          mobile_number: conversation.visitor_phone || linkedLead?.mobile_number || null,
          enquiry_category: conversation.enquiry_category || null,
          urgency_level: conversation.urgency_level || conversation.priority || 'normal',
          message_preview: conversation.last_message_preview || '',
          intent_summary: summary,
          wait_label: 'Reminder due now',
          channel_label: getChannelLabel(conversation.source_type),
          cta_label: 'Reply Now',
          source_page: conversation.source_page || '/',
          snooze_label: conversation.snooze_label || null,
        },
      });

      await base44.asServiceRole.entities.SupportConversation.update(conversation.id, {
        ...conversation,
        snooze_alert_sent_at: nowIso,
      });

      results.push({
        conversation_id: conversation.id,
        alert_status: alertResponse?.data?.results?.in_app || alertResponse?.data?.success || 'processed',
      });
    }

    return Response.json({ success: true, processed: results.length, results });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
});