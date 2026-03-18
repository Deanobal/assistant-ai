import React from 'react';
import { Mail, CalendarDays, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const supportItems = [
  {
    icon: Mail,
    title: 'Priority Support',
    detail: 'Reach the AssistantAI team for help with live issues, questions, or optimisation requests.',
    action: 'support@assistantai.com.au',
  },
  {
    icon: CalendarDays,
    title: 'Strategy Reviews',
    detail: 'Book a review session to walk through performance, lead quality, and improvement opportunities.',
    action: 'Book quarterly review',
  },
  {
    icon: MessageSquare,
    title: 'Client Success Notes',
    detail: 'Share business changes, seasonal campaigns, or service updates so your AI receptionist stays aligned.',
    action: 'Send update',
  },
];

export default function SupportSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Support</h2>
        <p className="text-gray-400">Everything your team needs to stay supported, aligned, and confident in your AI receptionist rollout.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {supportItems.map((item) => (
          <Card key={item.title} className="bg-[#12121a] border-white/5 h-full">
            <CardHeader>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5 text-cyan-400" />
              </div>
              <CardTitle className="text-white text-lg">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-gray-400 text-sm leading-relaxed">{item.detail}</p>
              <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25">
                {item.action}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}