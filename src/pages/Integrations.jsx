import * as React from 'react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, CreditCard, ClipboardList, MessageSquare, Users, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const coreIntegrations = [
  { icon: CreditCard, title: 'Secure Signup', desc: 'Starter and Growth buyers can move through secure checkout when they are ready.' },
  { icon: Users, title: 'Customer Details', desc: 'Names, contact details, notes, and next steps stay organised for your team.' },
  { icon: CalendarDays, title: 'Calendar Support', desc: 'Bookings, availability, reminders, and appointment workflows can be connected.' },
  { icon: MessageSquare, title: 'SMS + Email', desc: 'Follow-up, confirmations, reminders, and customer messages help keep leads warm.' },
  { icon: ClipboardList, title: 'Setup Details', desc: 'After signup, the information needed for setup is prepared so work can begin.' },
];

const paymentWorkflow = ['Secure signup', 'Buyer confirmed', 'Details prepared', 'Setup underway', 'Team notified', 'Follow-up ready'];

export default function Integrations() {
  return (
    <>
      <SEO title="Integrations | Calendar, Follow-Up & Secure Signup | AssistantAI" description="AssistantAI can connect calendar support, customer details, SMS/email follow-up, and secure signup so enquiries are handled faster." canonicalPath="/Integrations" />
      <div>
        <section className="relative py-24 md:py-32 bg-grid">
          <div className="bg-radial-glow absolute inset-0" />
          <div className="relative max-w-7xl mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
              <p className="text-cyan-400 mb-3 text-lg font-medium">INTEGRATIONS</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-4xl mx-auto text-white">Connect the Tools That Help You Respond Faster</h1>
              <p className="mt-5 text-gray-400 text-lg max-w-3xl mx-auto">AssistantAI can connect the tools that help you answer enquiries, organise customer details, follow up quickly, and begin setup after signup.</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/Platform" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all text-sm">View Platform Preview <ArrowRight className="w-4 h-4" /></Link>
                <Link to="/GetStartedNow" className="inline-flex items-center justify-center px-8 py-3.5 border border-white/10 text-white font-medium rounded-full hover:bg-white/5 transition-all text-sm">Get Started Now</Link>
              </div>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
              {coreIntegrations.map((item) => <Card key={item.title} className="bg-[#12121a] border-white/5"><CardContent className="p-6"><div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mb-5"><item.icon className="w-5 h-5 text-cyan-400" /></div><h2 className="text-white font-semibold text-lg">{item.title}</h2><p className="mt-3 text-gray-400 text-sm leading-relaxed">{item.desc}</p></CardContent></Card>)}
            </div>

            <Card className="mt-10 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
              <CardHeader>
                <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center"><Bell className="w-5 h-5 text-cyan-300" /></div><div><CardTitle className="text-white text-2xl">From Secure Signup to Setup</CardTitle><p className="text-white/70 text-sm mt-1">When a customer completes checkout, your setup details can be prepared and your team can see the next steps clearly.</p></div></div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">{paymentWorkflow.map((step, index) => <div key={step} className="rounded-2xl border border-white/10 bg-[#0a0a0f]/50 p-5"><p className="text-cyan-300 text-xs font-medium mb-3">STEP {index + 1}</p><p className="text-white font-medium leading-relaxed">{step}</p></div>)}</div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}