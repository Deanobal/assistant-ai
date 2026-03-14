import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Calendar, MessageSquare, Database, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const integrations = [
  {
    category: 'CRM Platforms',
    items: [
      { name: 'Salesforce', icon: '☁️', status: 'available', description: 'Sync leads and customer data automatically' },
      { name: 'HubSpot', icon: '🟠', status: 'available', description: 'Connect deals and contact management' },
      { name: 'Pipedrive', icon: '🔵', status: 'available', description: 'Streamline sales pipeline tracking' },
      { name: 'Zoho CRM', icon: '🔴', status: 'available', description: 'Integrate customer relationship data' },
    ],
  },
  {
    category: 'Calendar Systems',
    icon: Calendar,
    items: [
      { name: 'Google Calendar', icon: '📅', status: 'available', description: 'Auto-schedule appointments and meetings' },
      { name: 'Outlook Calendar', icon: '📆', status: 'available', description: 'Sync with Microsoft 365 calendar' },
      { name: 'Apple Calendar', icon: '🍎', status: 'available', description: 'Connect iCloud calendar integration' },
    ],
  },
  {
    category: 'SMS & Messaging',
    icon: MessageSquare,
    items: [
      { name: 'Twilio', icon: '💬', status: 'available', description: 'Send automated SMS follow-ups' },
      { name: 'WhatsApp Business', icon: '💚', status: 'available', description: 'Enable WhatsApp communications' },
      { name: 'SMS Gateway', icon: '📱', status: 'available', description: 'Direct SMS integration' },
    ],
  },
  {
    category: 'Email Platforms',
    icon: Mail,
    items: [
      { name: 'Gmail', icon: '✉️', status: 'available', description: 'Sync email communications' },
      { name: 'Outlook', icon: '📧', status: 'available', description: 'Connect Microsoft email' },
      { name: 'SendGrid', icon: '📮', status: 'available', description: 'Automated email campaigns' },
    ],
  },
];

export default function Integrations() {
  const [connecting, setConnecting] = useState(null);

  const handleConnect = (name) => {
    setConnecting(name);
    setTimeout(() => setConnecting(null), 1500);
  };

  return (
    <div>
      <section className="relative py-24 md:py-32 bg-grid">
        <div className="bg-radial-glow absolute inset-0" />
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <p className="text-cyan-400 text-sm font-medium mb-3">INTEGRATIONS</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Connect Your{' '}
              <span className="text-gradient">Existing Tools</span>
            </h1>
            <p className="mt-5 text-gray-400 text-lg max-w-2xl mx-auto">
              Seamlessly integrate Assistant AI with your CRM, calendar, and communication platforms for automatic data syncing.
            </p>
          </motion.div>

          <div className="space-y-12">
            {integrations.map((category, i) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  {category.icon && <category.icon className="w-6 h-6 text-cyan-400" />}
                  {category.category}
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.items.map((item) => (
                    <Card key={item.name} className="bg-[#12121a] border-white/5 hover:border-cyan-500/20 transition-all">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{item.icon}</span>
                            <CardTitle className="text-white text-lg">{item.name}</CardTitle>
                          </div>
                          {item.status === 'connected' && (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-400 text-sm mb-4">{item.description}</p>
                        <Button
                          onClick={() => handleConnect(item.name)}
                          disabled={connecting === item.name}
                          className={`w-full ${
                            item.status === 'connected'
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
                              : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25'
                          }`}
                        >
                          {connecting === item.name ? (
                            'Connecting...'
                          ) : item.status === 'connected' ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Connected
                            </>
                          ) : (
                            <>
                              Connect
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16 p-8 rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/5 to-transparent"
          >
            <h3 className="text-xl font-bold text-white mb-2">Need a Custom Integration?</h3>
            <p className="text-gray-400 mb-4">
              We can build custom integrations for your specific business needs.
            </p>
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25">
              Contact Our Team
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}