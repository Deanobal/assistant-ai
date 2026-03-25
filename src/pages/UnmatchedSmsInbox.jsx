import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import UnmatchedSmsCard from '@/components/admin/sms/UnmatchedSmsCard';

export default function UnmatchedSmsInbox() {
  const { data: logs = [] } = useQuery({
    queryKey: ['unmatched-sms-inbox'],
    queryFn: () => base44.entities.NotificationLog.filter({ channel: 'sms', event_type: 'customer_sms_reply_unmatched' }, '-created_date', 200),
    initialData: [],
  });

  const { data: leads = [] } = useQuery({
    queryKey: ['manual-match-leads'],
    queryFn: () => base44.entities.Lead.list('-updated_date', 200),
    initialData: [],
  });

  const orderedLogs = [...logs].sort((a, b) => new Date(b.triggered_at || b.created_date) - new Date(a.triggered_at || a.created_date));
  const resolvedCount = orderedLogs.filter((log) => !!log.metadata?.manual_match_copy_log_id).length;
  const openCount = orderedLogs.length - resolvedCount;

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">Admin SMS Review</p>
          <h2 className="text-3xl font-bold text-white mt-1">Unmatched SMS Inbox</h2>
          <p className="text-gray-400 mt-2 max-w-3xl">Review inbound customer SMS replies that were not confidently attached to a lead, then manually link them without losing the original audit record.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 xl:min-w-[280px]">
          <Card className="bg-[#12121a] border-white/5"><CardContent className="p-4"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Open</p><p className="text-2xl font-semibold text-white mt-2">{openCount}</p></CardContent></Card>
          <Card className="bg-[#12121a] border-white/5"><CardContent className="p-4"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Manually matched</p><p className="text-2xl font-semibold text-white mt-2">{resolvedCount}</p></CardContent></Card>
        </div>
      </div>

      {orderedLogs.length === 0 ? (
        <Card className="bg-[#12121a] border-white/5">
          <CardContent className="p-8 text-gray-400">No unmatched inbound SMS replies yet.</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orderedLogs.map((log) => <UnmatchedSmsCard key={log.id} log={log} leads={leads} />)}
        </div>
      )}
    </div>
  );
}