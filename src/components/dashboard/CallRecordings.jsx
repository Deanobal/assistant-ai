import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SmilePlus, Frown, Meh, Clock, User, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const callRecordings = [
  {
    id: 1,
    caller: 'Sarah Mitchell',
    phone: '+61 4XX XXX 123',
    duration: '3:24',
    timestamp: '2 hours ago',
    sentiment: 'positive',
    sentimentScore: 0.87,
    summary: 'Customer inquiring about plumbing services. Successfully booked appointment for Monday 10am. Customer was satisfied with quick response time.',
    topics: ['Booking', 'Emergency Service', 'Pricing'],
    audioUrl: '#',
  },
  {
    id: 2,
    caller: 'Mark Johnson',
    phone: '+61 4XX XXX 456',
    duration: '2:15',
    timestamp: '5 hours ago',
    sentiment: 'neutral',
    sentimentScore: 0.52,
    summary: 'General inquiry about service area coverage. Provided information about suburbs serviced. Customer said they will call back.',
    topics: ['Service Area', 'General Inquiry'],
    audioUrl: '#',
  },
  {
    id: 3,
    caller: 'Emma Davis',
    phone: '+61 4XX XXX 789',
    duration: '4:52',
    timestamp: '8 hours ago',
    sentiment: 'positive',
    sentimentScore: 0.91,
    summary: 'Customer booking follow-up appointment. Previous service was excellent. Scheduled next maintenance check for next month.',
    topics: ['Repeat Customer', 'Booking', 'Maintenance'],
    audioUrl: '#',
  },
  {
    id: 4,
    caller: 'David Chen',
    phone: '+61 4XX XXX 321',
    duration: '1:38',
    timestamp: '10 hours ago',
    sentiment: 'negative',
    sentimentScore: 0.28,
    summary: 'Customer complaint about delayed service. Escalated to manager. Offered 15% discount on next service. Customer agreed to reschedule.',
    topics: ['Complaint', 'Escalation', 'Discount'],
    audioUrl: '#',
  },
];

export default function CallRecordings() {
  const [playingId, setPlayingId] = useState(null);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Call Recordings</h2>
        <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
          {callRecordings.length} Recent Calls
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
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg mb-1">{call.caller}</CardTitle>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
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
            <CardContent className="space-y-4">
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
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: '0%' }} />
                  </div>
                </div>
                <span className="text-gray-500 text-sm">{call.duration}</span>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-white text-sm font-semibold mb-2">AI Summary</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{call.summary}</p>
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
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}