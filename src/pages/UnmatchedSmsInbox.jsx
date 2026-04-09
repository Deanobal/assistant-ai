<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-T5JXSXTG');</script>
<!-- End Google Tag Manager -->
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import UnmatchedSmsCard from '@/components/admin/sms/UnmatchedSmsCard';
import { getResolutionState } from '@/lib/smsMatching';

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

  const { data: outboundLogs = [] } = useQuery({
    queryKey: ['manual-match-outbound-sms'],
    queryFn: () => base44.entities.NotificationLog.filter({ channel: 'sms', recipient_role: 'client' }, '-created_date', 300),
    initialData: [],
  });

  const orderedLogs = [...logs].sort((a, b) => new Date(b.triggered_at || b.created_date) - new Date(a.triggered_at || a.created_date));
  const matchedCount = orderedLogs.filter((log) => getResolutionState(log) === 'matched').length;
  const reviewedNoMatchCount = orderedLogs.filter((log) => getResolutionState(log) === 'reviewed_no_match').length;
  const openCount = orderedLogs.filter((log) => getResolutionState(log) === 'open').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">Admin SMS Review</p>
          <h2 className="text-3xl font-bold text-white mt-1">Unmatched SMS Inbox</h2>
          <p className="text-gray-400 mt-2 max-w-3xl">Review inbound customer SMS replies that were not confidently attached to a lead, then manually link them without losing the original audit record.</p>
        </div>
        <div className="grid grid-cols-3 gap-3 xl:min-w-[420px]">
          <Card className="bg-[#12121a] border-white/5"><CardContent className="p-4"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Open</p><p className="text-2xl font-semibold text-white mt-2">{openCount}</p></CardContent></Card>
          <Card className="bg-[#12121a] border-white/5"><CardContent className="p-4"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Manually matched</p><p className="text-2xl font-semibold text-white mt-2">{matchedCount}</p></CardContent></Card>
          <Card className="bg-[#12121a] border-white/5"><CardContent className="p-4"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Reviewed no match</p><p className="text-2xl font-semibold text-white mt-2">{reviewedNoMatchCount}</p></CardContent></Card>
        </div>
      </div>

      {orderedLogs.length === 0 ? (
        <Card className="bg-[#12121a] border-white/5">
          <CardContent className="p-8 text-gray-400">No unmatched inbound SMS replies yet.</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orderedLogs.map((log) => <UnmatchedSmsCard key={log.id} log={log} leads={leads} outboundLogs={outboundLogs} />)}
        </div>
      )}
    </div>
  );
}