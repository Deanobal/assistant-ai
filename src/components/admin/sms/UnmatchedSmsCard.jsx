import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link2, Loader2, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import SearchableLeadLookup from '@/components/admin/sms/SearchableLeadLookup';
import SuggestedLeadMatches from '@/components/admin/sms/SuggestedLeadMatches';
import { getResolutionState, getSuggestedLeadMatches } from '@/lib/smsMatching';

export default function UnmatchedSmsCard({ log, leads, outboundLogs }) {
  const queryClient = useQueryClient();
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const tags = log.metadata?.reply_intent_tags || [];
  const senderNumber = log.metadata?.sender_number || 'Unknown';
  const receiverNumber = log.metadata?.receiver_number || log.recipient_email || 'Unknown';
  const resolvedLeadId = log.metadata?.resolved_lead_id || '';
  const resolvedLeadName = log.metadata?.resolved_lead_name || '';
  const resolutionState = getResolutionState(log);
  const isResolved = resolutionState !== 'open';
  const suggestions = useMemo(() => getSuggestedLeadMatches(log, leads, outboundLogs || []), [log, leads, outboundLogs]);
  const suggestedLeadIds = suggestions.map((item) => item.lead.id);

  const matchMutation = useMutation({
    mutationFn: () => base44.functions.invoke('manualMatchUnmatchedSms', { action: 'match', unmatchedLogId: log.id, leadId: selectedLeadId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unmatched-sms-inbox'] });
      queryClient.invalidateQueries({ queryKey: ['lead-sms-trail', selectedLeadId] });
      queryClient.invalidateQueries({ queryKey: ['lead-detail', selectedLeadId] });
    },
  });

  const noMatchMutation = useMutation({
    mutationFn: () => base44.functions.invoke('manualMatchUnmatchedSms', { action: 'review_no_match', unmatchedLogId: log.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unmatched-sms-inbox'] });
    },
  });

  return (
    <Card className="bg-[#12121a] border-white/5">
      <CardContent className="p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={resolutionState === 'matched' ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20' : resolutionState === 'reviewed_no_match' ? 'bg-slate-500/10 text-slate-300 border-slate-500/20' : 'bg-amber-500/10 text-amber-300 border-amber-500/20'}>
            {resolutionState === 'matched' ? 'Manually matched' : resolutionState === 'reviewed_no_match' ? 'Reviewed / no match' : 'Unmatched inbox'}
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

        {resolutionState === 'matched' ? (
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex flex-wrap items-center gap-3">
              <span>Matched to {resolvedLeadName || 'lead'}.</span>
              {resolvedLeadId && (
                <Link to={`/LeadDetail?id=${resolvedLeadId}`} className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200">
                  <Link2 className="w-4 h-4" />
                  Open lead trail
                </Link>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Matched by {log.metadata?.resolved_by || log.metadata?.manual_matched_by || 'Unknown'} on {new Date(log.metadata?.resolved_at || log.metadata?.manual_matched_at || log.updated_date).toLocaleString()}</span>
            </div>
          </div>
        ) : resolutionState === 'reviewed_no_match' ? (
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Reviewed no-match by {log.metadata?.no_match_reviewed_by || 'Unknown'} on {new Date(log.metadata?.no_match_reviewed_at || log.updated_date).toLocaleString()}</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-gray-500 mb-2">Suggested matches</p>
              <SuggestedLeadMatches suggestions={suggestions} selectedLeadId={selectedLeadId} onSelect={setSelectedLeadId} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-gray-500 mb-2">Search all leads</p>
              <SearchableLeadLookup leads={leads} selectedLeadId={selectedLeadId} onSelect={setSelectedLeadId} suggestedLeadIds={suggestedLeadIds} />
            </div>
            <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
              <Button
                onClick={() => matchMutation.mutate()}
                disabled={!selectedLeadId || matchMutation.isPending || noMatchMutation.isPending}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white disabled:opacity-50"
              >
                {matchMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Attach to selected lead
              </Button>
              <Button
                variant="outline"
                onClick={() => noMatchMutation.mutate()}
                disabled={matchMutation.isPending || noMatchMutation.isPending}
                className="border-white/10 text-white hover:bg-white/5"
              >
                {noMatchMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Mark reviewed / no match
              </Button>
            </div>
          </div>
        )}

        {(matchMutation.isError || matchMutation.data?.data?.success || noMatchMutation.isError || noMatchMutation.data?.data?.success) && (
          <p className="text-xs text-gray-400">
            {matchMutation.isError
              ? (matchMutation.error?.response?.data?.error || matchMutation.error?.message || 'Manual match failed.')
              : noMatchMutation.isError
                ? (noMatchMutation.error?.response?.data?.error || noMatchMutation.error?.message || 'No-match review failed.')
                : matchMutation.data?.data?.success
                  ? 'Manual match saved and copied into the selected lead trail.'
                  : 'SMS marked as reviewed with no safe lead match.'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}