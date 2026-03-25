import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowDownLeft, ArrowUpRight, MessageSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import LeadSmsReplyBox from '@/components/admin/leads/LeadSmsReplyBox';

function getDirection(log) {
  if (log.sender_role === 'client' || log.event_type === 'customer_sms_reply_received' || log.event_type === 'customer_sms_reply_unmatched') {
    return 'inbound';
  }

  return 'outbound';
}

export default function LeadSmsTrail({ leadId, mobileNumber, fullName }) {
  const { data: logs = [] } = useQuery({
    queryKey: ['lead-sms-trail', leadId],
    queryFn: () => base44.entities.NotificationLog.filter({ entity_id: leadId, channel: 'sms' }, '-created_date', 50),
    initialData: [],
  });

  const orderedLogs = [...logs]
    .filter((log) => log.sender_role === 'client' || log.sender_role === 'admin' || log.recipient_role === 'client')
    .reverse();

  return (
    <Card className="bg-[#12121a] border-white/5">
      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="text-white font-semibold text-lg">SMS Trail</h3>
          <p className="text-sm text-gray-400 mt-1">Inbound customer replies and outbound admin/customer SMS for this lead.</p>
        </div>

        <LeadSmsReplyBox leadId={leadId} mobileNumber={mobileNumber} fullName={fullName} />

        {orderedLogs.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-5 text-sm text-gray-400">
            No SMS activity yet.
          </div>
        ) : orderedLogs.map((log) => {
          const direction = getDirection(log);
          const tags = log.metadata?.reply_intent_tags || [];
          const senderNumber = log.metadata?.sender_number || log.metadata?.sms_from_number_used || 'Unknown';
          const receiverNumber = log.metadata?.receiver_number || log.recipient_email || 'Unknown';

          return (
            <div key={log.id} className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={direction === 'inbound' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'}>
                  <span className="inline-flex items-center gap-1">
                    {direction === 'inbound' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                    {direction}
                  </span>
                </Badge>
                <Badge className="bg-white/5 text-gray-300 border-white/10">{log.delivery_status}</Badge>
                {log.match_status && <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/20">{log.match_status}</Badge>}
                {tags.map((tag) => <Badge key={tag} className="bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20">{tag}</Badge>)}
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs uppercase tracking-[0.16em] text-gray-500">
                      {direction === 'inbound' ? 'Customer reply' : log.sender_role === 'admin' ? 'Admin reply' : 'Outbound SMS'}
                    </p>
                    {log.provider_status && <span className="text-[11px] text-gray-500">Twilio: {log.provider_status}</span>}
                  </div>
                  <p className="text-white whitespace-pre-wrap break-words">{log.message}</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>From: {senderNumber}</p>
                    <p>To: {receiverNumber}</p>
                    <p>{new Date(log.triggered_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}