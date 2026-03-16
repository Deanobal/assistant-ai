import React from 'react';
import { motion } from 'framer-motion';
import { Phone, UserCheck, ClipboardList, CalendarCheck, PhoneForwarded, MailCheck } from 'lucide-react';

const features = [
{ icon: Phone, title: 'Answer Every Call', desc: 'Make sure every enquiry is answered professionally during business hours, after hours, and on weekends.' },
{ icon: UserCheck, title: 'Qualify Better Leads', desc: 'Ask the right questions early so your team spends more time on the opportunities that matter most.' },
{ icon: ClipboardList, title: 'Capture Customer Details Instantly', desc: 'Collect names, phone numbers, enquiry details, and context automatically while the conversation is happening.' },
{ icon: CalendarCheck, title: 'Book Appointments Automatically', desc: 'Check availability and schedule appointments directly into your workflow without back-and-forth admin.' },
{ icon: PhoneForwarded, title: 'Route Calls to the Right Person', desc: 'Send urgent or high-value calls to the right staff member when human input is needed.' },
{ icon: MailCheck, title: 'Follow Up Automatically', desc: 'Trigger SMS and email follow-up so no lead is left waiting after the call ends.' }];


export default function WhatAgentsDo() {
  return (
    <section className="relative py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16">

          <p className="text-cyan-400 mb-3 text-lg font-medium">CAPABILITIES</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">What Our AI Agents Do</h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            Intelligent AI systems that handle your customer communication from first contact to booked appointment.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) =>
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group p-6 rounded-2xl border border-white/5 bg-[#12121a] card-hover">

              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
                <f.icon className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-500 text-base leading-relaxed">{f.desc}</p>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}