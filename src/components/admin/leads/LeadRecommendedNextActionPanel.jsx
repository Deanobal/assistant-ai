import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Clock, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const HIGH_INTENT_TAGS = new Set(['yes', 'call_me', 'preferred_time', 'tomorrow', 'urgent_interest']);

function getHighIntentTags(log) {
  return (log.metadata?.reply_intent_tags || []).filter((tag) => HIGH_INTENT_TAGS.has(tag));
}

export default function LeadRecommendedNextActionPanel({ leadId, nextAction }) {
  const { data: logs = [] } = useQuery({
    queryKey: ['lead-high-intent', leadId],
    queryFn: () => base44.entities.NotificationLog.filter({ entity_id: leadId, channel: 'sms' }, '-created_date', 20),
    initialData: [],
  });

  const recentHighIntentLogs = logs
    .filter((log) => log.sender_role === 'client' && log.match_status === 'matched' && getHighIntentTags(log).length > 0)
    .sort((a, b) => new Date(b.triggered_at || b.created_date) - new Date(a.triggered_at || a.created_date));

  const latestLog = recentHighIntentLogs[0];
  if (!latestLog) {
    return null;
  }

  const tags = getHighIntentTags(latestLog);

  return (
    <Card className="bg-[#12121a] border-amber-500/20 shadow-[0_0_0_1px_rgba(245,158,11,0.08)]">
      <CardContent className="p-5 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/20">
            <Sparkles className="w-3 h-3 mr-1" />
            High-intent reply
          </Badge>
          {tags.map((tag) => (
            <Badge key={tag} className="bg-white/5 text-gray-300 border-white/10">{tag}</Badge>
          ))}
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Recommended next action</p>
          <div className="mt-2 flex items-start gap-2 text-white">
            <ArrowRight className="w-4 h-4 mt-0.5 text-amber-300" />
            <p>{nextAction || 'Follow up on high-intent SMS reply'}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Latest matched SMS</p>
          <p className="text-white mt-2 whitespace-pre-wrap break-words">{latestLog.message}</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date(latestLog.triggered_at || latestLog.created_date).toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}