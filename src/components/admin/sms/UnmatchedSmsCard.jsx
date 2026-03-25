import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link2, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function UnmatchedSmsCard({ log, leads }) {
  const queryClient = useQueryClient();
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const tags = log.metadata?.reply_intent_tags || [];
  const senderNumber = log.metadata?.sender_number || 'Unknown';
  const receiverNumber = log.metadata?.receiver_number || log.recipient_email || 'Unknown';
  const resolvedLeadId = log.metadata?.resolved_lead_id || '';
  const resolvedLeadName = log.metadata?.resolved_lead_name || '';
  const isResolved = !!log.metadata?.manual_match_copy_log_id;

  const leadOptions = useMemo(() => leads.map((lead) => ({
    id: lead.id,
    label: `${lead.business_name || lead.full_name || 'Unnamed lead'}${lead.mobile_number ? ` — ${lead.mobile_number}` : lead.email ? ` — ${lead.email}` : ''}`,
  })), [leads]);

  const matchMutation = useMutation({
    mutationFn: () => base44.functions.invoke('manualMatchUnmatchedSms', { unmatchedLogId: log.id, leadId: selectedLeadId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unmatched-sms-inbox'] });
      queryClient.invalidateQueries({ queryKey: ['lead-sms-trail', selectedLeadId] });
      queryClient.invalidateQueries({ queryKey: ['lead-detail', selectedLeadId] });
    },
  });

  return (
    <Card className="bg-[#12121a] border-white/5">
      <CardContent className="p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={isResolved ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20' : 'bg-amber-500/10 text-amber-300 border-amber-500/20'}>
            {isResolved ? 'Manually matched' : 'Unmatched inbox'}
          </Badge>
          <Badge className="bg-white/5 text-gray-300 border-white/10">match_status: {log.match_status || 'unmatched'}</Badge>
          {tags.map((tag) => (
            <Badge key={tag} className="bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20">{tag}</Badge>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Sender number</p>
            <p className="text-white mt-2 break-all">{senderNumber}</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Receiver number</p>
            <p className="text-white mt-2 break-all">{receiverNumber}</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Timestamp</p>
            <p className="text-white mt-2 break-all">{new Date(log.triggered_at || log.created_date).toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Provider SID</p>
            <p className="text-white mt-2 break-all">{log.provider_message_id || 'Not available'}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4">
          <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Message body</p>
          <p className="text-white mt-2 whitespace-pre-wrap break-words">{log.message}</p>
        </div>

        {isResolved ? (
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
            <span>Matched to {resolvedLeadName || 'lead'}.</span>
            {resolvedLeadId && (
              <Link to={`/LeadDetail?id=${resolvedLeadId}`} className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200">
                <Link2 className="w-4 h-4" />
                Open lead trail
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
            <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
              <SelectTrigger className="bg-[#0f0f17] border-white/10 text-white lg:max-w-md">
                <SelectValue placeholder="Select a lead to manually attach this SMS" />
              </SelectTrigger>
              <SelectContent>
                {leadOptions.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>{lead.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => matchMutation.mutate()}
              disabled={!selectedLeadId || matchMutation.isPending}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white disabled:opacity-50"
            >
              {matchMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Attach to lead
            </Button>
          </div>
        )}

        {(matchMutation.isError || matchMutation.data?.data?.success) && (
          <p className="text-xs text-gray-400">
            {matchMutation.isError
              ? (matchMutation.error?.response?.data?.error || matchMutation.error?.message || 'Manual match failed.')
              : 'Manual match saved and copied into the selected lead trail.'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}