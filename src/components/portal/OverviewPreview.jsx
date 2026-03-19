import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Calendar, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const stats = [
  { icon: Phone, label: 'Calls handled', value: '1,247', note: 'Example snapshot' },
  { icon: Users, label: 'Leads captured', value: '589', note: 'Example tracked enquiries' },
  { icon: Calendar, label: 'Appointments booked', value: '342', note: 'Example booking view' },
  { icon: TrendingUp, label: 'Response time', value: '< 2s', note: 'Example response benchmark' },
];

const recentActivity = [
  { contact: 'Demo Caller A', detail: 'Example workflow: call captured and qualified', status: 'Qualified' },
  { contact: 'Demo Caller B', detail: 'Example workflow: appointment booked automatically', status: 'Booked' },
  { contact: 'Demo Caller C', detail: 'Example workflow: follow-up queued by SMS', status: 'Follow Up' },
  { contact: 'Demo Caller D', detail: 'Example workflow: urgent enquiry escalated', status: 'Urgent' },
];

const supportItems = ['Contact support', 'Onboarding help', 'Optimisation help'];

export default function OverviewPreview() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-white">Overview Preview</h2>
          <p className="text-sm text-gray-400 mt-1">Sample dashboard data shown for preview purposes only.</p>
        </div>
        <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">Sample Snapshot</Badge>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
          >
            <Card className="bg-[#12121a] border-white/5 h-full">
              <CardContent className="p-6">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mb-4">
                  <stat.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-gray-400 text-sm font-medium mb-1">{stat.label}</p>
                <p className="text-gray-600 text-xs">{stat.note}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-[#12121a] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div key={item.contact} className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-[#0a0a0f] p-4">
                  <div>
                    <p className="text-white font-medium text-sm">{item.contact}</p>
                    <p className="text-gray-500 text-xs mt-1">{item.detail}</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium">
                    {item.status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-white">Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {supportItems.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-[#0a0a0f]/40 px-4 py-3 text-sm text-gray-300">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}