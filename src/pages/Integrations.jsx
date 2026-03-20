import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, Database, MessageSquare, Workflow } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const crmIntegrations = [
'GoHighLevel',
'HubSpot',
'Salesforce',
'Pipedrive',
'Zoho'];


const calendarIntegrations = ['Google Calendar', 'Outlook Calendar'];
const smsIntegrations = ['Twilio', 'GoHighLevel SMS', 'Other compatible SMS tools'];

const syncSteps = [
'Connect your tools',
'AI captures the conversation',
'Data, bookings, and follow-up sync automatically'];


export default function Integrations() {
  return (
    <div>
      <section className="relative py-24 md:py-32 bg-grid">
        <div className="bg-radial-glow absolute inset-0" />
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16">

            <p className="text-cyan-400 mb-3 text-lg font-medium">INTEGRATIONS</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-4xl mx-auto">Connect AssistantAI to the Tools Your Business Already Uses

            </h1>
            <p className="mt-5 text-gray-400 text-lg max-w-2xl mx-auto">
              Connect the tools your business already uses so calls, bookings, follow-up, and customer data stay aligned.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/BookStrategyCall"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all text-sm">
                
                Book Free Strategy Call
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/Platform"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-white/10 text-white font-medium rounded-full hover:bg-white/5 transition-all text-sm">
                
                View Platform Preview
              </Link>
            </div>
          </motion.div>

          <div className="space-y-10">
            <Card className="bg-[#12121a] border-white/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center">
                    <Database className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-2xl">CRM Integrations</CardTitle>
                    <p className="text-gray-400 text-sm mt-1">Common supported CRM options for lead capture, record updates, and cleaner follow-up workflows.</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  {crmIntegrations.map((name) =>
                  <div key={name} className="rounded-2xl border border-white/5 bg-[#0a0a0f] px-4 py-5 text-center text-white text-sm font-medium">
                      {name}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-[#12121a] border-white/5">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center">
                      <CalendarDays className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-2xl">Calendar Integrations</CardTitle>
                      <p className="text-gray-400 text-sm mt-1">Book appointments automatically, check availability, sync meetings, and reduce admin work.</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {calendarIntegrations.map((name) =>
                    <div key={name} className="rounded-2xl border border-white/5 bg-[#0a0a0f] px-4 py-5 text-center text-white text-sm font-medium">
                        {name}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#12121a] border-white/5">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-2xl">SMS Integrations</CardTitle>
                      <p className="text-gray-400 text-sm mt-1">Send missed-call text back, confirmations, follow-up messages, and internal notifications automatically.</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {smsIntegrations.map((name) =>
                    <div key={name} className="rounded-2xl border border-white/5 bg-[#0a0a0f] px-4 py-5 text-white text-sm font-medium">
                        {name}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Workflow className="w-5 h-5 text-cyan-300" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-2xl">How Syncing Works</CardTitle>
                    <p className="text-white/70 text-sm mt-1">A simple workflow that keeps your systems aligned without extra admin from your team.</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {syncSteps.map((step, index) =>
                  <div key={step} className="rounded-2xl border border-white/10 bg-[#0a0a0f]/50 p-6">
                      <p className="text-cyan-300 text-xs font-medium mb-3">STEP {index + 1}</p>
                      <p className="text-white font-medium leading-relaxed">{step}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16 p-10 rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/5 to-transparent">

            <h3 className="text-2xl font-bold text-white mb-3">Want a custom integration setup?</h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Book a strategy call and we’ll map out the right CRM, calendar, and communication workflow for your business.
            </p>
            <Link
              to="/BookStrategyCall"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all text-sm">

              Book Free Strategy Call
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>);

}