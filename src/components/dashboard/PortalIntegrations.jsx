import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, CalendarDays, MessageSquare, Settings, ArrowRight } from 'lucide-react';

const integrations = [
  {
    icon: Database,
    title: 'CRM',
    status: 'Connected',
    detail: 'HubSpot connected',
    lastSync: 'Last sync: 8 minutes ago',
    syncStatus: 'Healthy',
  },
  {
    icon: CalendarDays,
    title: 'Calendar',
    status: 'Connected',
    detail: 'Google Calendar connected',
    lastSync: 'Last sync: 2 minutes ago',
    syncStatus: 'Healthy',
  },
  {
    icon: MessageSquare,
    title: 'SMS',
    status: 'Not Connected',
    detail: 'Connect Twilio or compatible SMS tools',
    lastSync: 'No sync yet',
    syncStatus: 'Setup required',
  },
];

export default function PortalIntegrations() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Integrations</h2>
        <p className="text-gray-400">Connect your CRM, calendar, and messaging tools so your AI workflow stays in sync.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {integrations.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Card className="bg-[#12121a] border-white/5 h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <Badge className={item.status === 'Connected' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}>
                    {item.status}
                  </Badge>
                </div>
                <CardTitle className="text-white text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-400 text-sm">{item.detail}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Last sync</span>
                    <span>{item.lastSync.replace('Last sync: ', '')}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Sync status</span>
                    <span>{item.syncStatus}</span>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25">
                    {item.status === 'Connected' ? 'Reconnect' : 'Connect'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}