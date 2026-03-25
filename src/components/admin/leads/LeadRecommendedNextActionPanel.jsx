import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Bell, Clock, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const HIGH_INTENT_TAGS = new Set(['yes', 'call_me', 'preferred_time', 'tomorrow', 'urgent_interest']);
const BOOKING_RELATED_SMS_KINDS = new Set(['customer_strategy_call_request', 'customer_strategy_call_fallback']);
const FOLLOW_UP_WINDOW_MINUTES = 30;

function getHighIntentTags(log) {
  return (log.metadata?.reply_intent_tags || []).filter((tag) => HIGH_INTENT_TAGS.has(tag));
}

function isBookingConfirmed(lead) {
  return !!lead && (
    lead.status === 'Strategy Call Booked'
    || lead.booking_status === 'confirmed'
    || !!lead.booking_reference
    || (!!lead.confirmed_meeting_date && !!lead.confirmed_meeting_time)
  );
}

function isBookingRelatedLog(log, lead) {
  return !!lead && (
    !!lead.booking_intent
    || lead.enquiry_type === 'strategy_call'
    || BOOKING_RELATED_SMS_KINDS.has(log.metadata?.matched_outbound_sms_kind)
  );
}

export default function LeadRecommendedNextActionPanel({ leadId, lead, nextAction }) {
  const { data } = useQuery({
    queryKey: ['lead-booking-nudge', leadId],
    queryFn: async () => {
      const [smsLogs, alertLogs] = await Promise.all([
        base44.entities.NotificationLog.filter({ entity_id: leadId, channel: 'sms' }, '-created_date', 20),
        base44.entities.NotificationLog.filter({ entity_id: leadId }, '-created_date', 40),
      ]);

      return { smsLogs, alertLogs };
    },
    initialData: { smsLogs: [], alertLogs: [] },
  });

  if (isBookingConfirmed(lead)) {
    return null;
  }

  const recentHighIntentLogs = data.smsLogs
    .filter((log) => log.sender_role === 'client' && log.match_status === 'matched' && getHighIntentTags(log).length > 0 && isBookingRelatedLog(log, lead))
    .sort((a, b) => new Date(b.triggered_at || b.created_date) - new Date(a.triggered_at || a.created_date));

  const latestLog = recentHighIntentLogs[0];
  if (!latestLog) {
    return null;
  }

  const tags = getHighIntentTags(latestLog);
  const dueAt = new Date(new Date(latestLog.triggered_at || latestLog.created_date).getTime() + (FOLLOW_UP_WINDOW_MINUTES * 60 * 1000));
  const latestReminder = [...data.alertLogs]
    .filter((log) => log.metadata?.alert_category === 'booking_nudge_reminder' && log.metadata?.inbound_sms_log_id === latestLog.id)
    .sort((a, b) => new Date(b.triggered_at || b.created_date) - new Date(a.triggered_at || a.created_date))[0] || null;
  const latestEscalation = [...data.alertLogs]
    .filter((log) => log.metadata?.alert_category === 'booking_nudge_escalation' && log.metadata?.inbound_sms_log_id === latestLog.id)
    .sort((a, b) => new Date(b.triggered_at || b.created_date) - new Date(a.triggered_at || a.created_date))[0] || null;

  const stateKey = latestEscalation ? 'escalated' : latestReminder ? 'reminder_sent' : 'follow_up_needed';
  const stateClass = stateKey === 'escalated'
    ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
    : stateKey === 'reminder_sent'
      ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
      : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20';

  return (
    <Card className="bg-[#12121a] border-rose-500/20 shadow-[0_0_0_1px_rgba(244,63,94,0.08)]">
      <CardContent className="p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-rose-500/10 text-rose-300 border-rose-500/20">
            <Bell className="w-3 h-3 mr-1" />
            Booking nudge
          </Badge>
          <Badge className={stateClass}>{stateKey}</Badge>
          <Badge className="bg-white/5 text-gray-300 border-white/10">
            <Sparkles className="w-3 h-3 mr-1" />
            Internal prompt only
          </Badge>
          <Badge className="bg-white/5 text-gray-300 border-white/10">Not a confirmed booking</Badge>
          {tags.map((tag) => (
            <Badge key={tag} className="bg-white/5 text-gray-300 border-white/10">{tag}</Badge>
          ))}
        </div>

        <div className="rounded-2xl border border-rose-500/15 bg-rose-500/[0.05] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.16em] text-rose-200/70">Booking follow-up needed</p>
          <p className="text-white mt-2">A matched customer sent a high-intent SMS, but no booking is confirmed yet. This is a prompt for admin action, not a confirmed booking.</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Recommended next action</p>
          <div className="mt-2 flex items-start gap-2 text-white">
            <ArrowRight className="w-4 h-4 mt-0.5 text-rose-300" />
            <p>{nextAction || 'Booking nudge: follow up quickly and confirm whether the lead wants a strategy call slot.'}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 space-y-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Latest customer intent</p>
            <p className="text-white mt-2 whitespace-pre-wrap break-words">{latestLog.message}</p>
          </div>
          <div className="flex flex-col gap-2 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Inbound SMS: {new Date(latestLog.triggered_at || latestLog.created_date).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>{latestEscalation ? `Latest escalation: ${new Date(latestEscalation.triggered_at || latestEscalation.created_date).toLocaleString()}` : latestReminder ? `Reminder raised: ${new Date(latestReminder.triggered_at || latestReminder.created_date).toLocaleString()}` : `Reminder due: ${dueAt.toLocaleString()}`}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}