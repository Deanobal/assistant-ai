import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Play, Pause, SmilePlus, Frown, Meh, Clock, User, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const sampleCallRecordings = [
  {
    id: 1,
    caller: 'Demo Caller A',
    phone: '+61 4XX XXX 123',
    duration: '3:24',
    timestamp: '2 hours ago',
    sentiment: 'positive',
    sentimentScore: 0.87,
    summary: 'Caller asked about an urgent plumbing job, provided site details, and was booked into the next available slot.',
    topics: ['Booking', 'Emergency Service', 'Pricing'],
    outcome: 'Booked',
    urgency: 'Urgent',
    followUpStatus: 'Confirmed by SMS',
    leadQuality: 'Hot Lead',
  },
  {
    id: 2,
    caller: 'Demo Caller B',
    phone: '+61 4XX XXX 456',
    duration: '2:15',
    timestamp: '5 hours ago',
    sentiment: 'neutral',
    sentimentScore: 0.52,
    summary: 'Caller asked whether the business services their suburb and requested pricing guidance before deciding on next steps.',
    topics: ['Service Area', 'General Inquiry'],
    outcome: 'Follow Up Needed',
    urgency: 'Standard',
    followUpStatus: 'Reminder queued',
    leadQuality: 'Qualified',
  },
];

const labelColors = {
  Positive: 'bg-green-500/10 text-green-400 border-green-500/20',
  Neutral: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Negative: 'bg-red-500/10 text-red-400 border-red-500/20',
  Booked: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Follow Up Needed': 'bg-orange-500/10 text-orange-300 border-orange-500/20',
  Urgent: 'bg-red-500/10 text-red-400 border-red-500/20',
  Standard: 'bg-white/5 text-gray-300 border-white/10',
  'Hot Lead': 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20',
  Qualified: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  'Needs Review': 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
};

export default function CallRecordings({ mode = 'live', clientAccountId = null }) {
  const [playingId, setPlayingId] = useState(null);
  const isSample = mode === 'sample';

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['call-recordings', clientAccountId || 'all', mode],
    queryFn: () => clientAccountId
      ? base44.entities.CallRecord.filter({ client_account_id: clientAccountId }, '-timestamp', 100)
      : base44.entities.CallRecord.list('-timestamp', 100),
    initialData: [],
    enabled: !isSample,
  });

  const callRecordings = isSample
    ? sampleCallRecordings
    : records.map((record) => ({
        id: record.id,
        caller: record.caller_name,
        phone: record.caller_phone,
        duration: `${Math.floor((record.duration || 0) / 60)}:${String((record.duration || 0) % 60).padStart(2, '0')}`,
        timestamp: record.timestamp ? new Date(record.timestamp).toLocaleString() : 'Unknown',
        sentiment: record.sentiment,
        sentimentScore: record.sentiment === 'positive' ? 0.8 : record.sentiment === 'negative' ? 0.3 : 0.5,
        summary: record.ai_summary,
        topics: [record.enquiry_category, record.outcome_label].filter(Boolean),
        outcome: record.outcome_label || record.status,
        urgency: record.enquiry_category === 'urgent service' ? 'Urgent' : 'Standard',
        followUpStatus: record.follow_up_required ? 'Follow-up required' : 'No follow-up needed',
        leadQuality: record.lead_id ? 'Qualified' : 'Needs Review',
      }));

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return <SmilePlus className="w-4 h-4 text-green-400" />;
      case 'negative': return <Frown className="w-4 h-4 text-red-400" />;
      default: return <Meh className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'negative': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    }
  };

  if (!isSample && isLoading) {
    return (
      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-8 text-center text-gray-400">Loading call recordings…</CardContent>
      </Card>
    );
  }

  if (!isSample && callRecordings.length === 0) {
    return (
      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-10 text-center space-y-3">
          <h2 className="text-2xl font-bold text-white">No Call Recordings Yet</h2>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">Once live calls are stored for this client, recordings, summaries, sentiment, and follow-up states will appear here automatically.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Call Recordings</h2>
          <p className="text-gray-400 text-sm mt-1">{isSample ? 'Demo call examples showing how summaries, labels, and sentiment can appear inside the client portal.' : 'Live call records and AI summaries for this client account.'}</p>
        </div>
        <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
          {isSample ? `${callRecordings.length} Sample Calls` : `${callRecordings.length} Live Calls`}
        </Badge>
      </div>

      {callRecordings.map((call, i) => (
        <motion.div
          key={call.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="bg-[#12121a] border-white/5">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg mb-1">{call.caller}</CardTitle>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {call.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {call.duration}
                      </span>
                      <span>{call.timestamp}</span>
                    </div>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-full border flex items-center gap-2 ${getSentimentColor(call.sentiment)}`}>
                  {getSentimentIcon(call.sentiment)}
                  <span className="text-xs font-medium capitalize">{call.sentiment}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-[#0a0a0f] border border-white/5">
                <button
                  onClick={() => setPlayingId(playingId === call.id ? null : call.id)}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                >
                  {playingId === call.id ? (
                    <Pause className="w-4 h-4 text-white" />
                  ) : (
                    <Play className="w-4 h-4 text-white ml-0.5" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: playingId === call.id ? '36%' : '0%' }} />
                  </div>
                </div>
                <span className="text-gray-500 text-sm">{call.duration}</span>
              </div>

              <div>
                <h4 className="text-white text-sm font-semibold mb-2">AI Summary</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{call.summary}</p>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
                <Badge className={labelColors[call.outcome] || 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'}>{call.outcome}</Badge>
                <Badge className={labelColors[call.urgency] || 'bg-white/5 text-gray-300 border-white/10'}>{call.urgency}</Badge>
                <Badge className="bg-white/5 text-gray-300 border-white/10">{call.followUpStatus}</Badge>
                <Badge className={labelColors[call.leadQuality] || 'bg-white/5 text-gray-300 border-white/10'}>{call.leadQuality}</Badge>
              </div>

              <div>
                <h4 className="text-white text-sm font-semibold mb-2">Topics Discussed</h4>
                <div className="flex flex-wrap gap-2">
                  {call.topics.map((topic) => (
                    <Badge key={topic} className="bg-white/5 text-gray-400 border-white/10">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white text-sm font-semibold">Sentiment Score</h4>
                  <span className="text-cyan-400 font-semibold">{(call.sentimentScore * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      call.sentiment === 'positive' ? 'bg-green-400' :
                      call.sentiment === 'negative' ? 'bg-red-400' : 'bg-yellow-400'
                    }`}
                    style={{ width: `${call.sentimentScore * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}