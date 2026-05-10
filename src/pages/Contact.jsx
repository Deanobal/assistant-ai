import * as React from 'react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, ArrowRight, Rocket, ClipboardCheck } from 'lucide-react';

const cards = [
  { icon: Bot, title: 'Talk to Our AI Receptionist', desc: 'Experience how the AI answers questions, qualifies intent, and recommends the next step.', href: '/#live-demo', label: 'Talk to the AI' },
  { icon: Rocket, title: 'Get Started Now', desc: 'Choose Starter or Growth, review your details, and proceed to secure checkout when ready.', href: '/GetStartedNow', label: 'Start Setup' },
  { icon: ClipboardCheck, title: 'Request Custom Review', desc: 'For Enterprise, multi-location, advanced workflows, complex integrations, or compliance needs.', href: '/BookStrategyCall', label: 'Request Review' },
];

export default function Contact() {
  return (
    <>
      <SEO title="Contact | Get Qualified by AssistantAI" description="Speak to the AI receptionist, choose the right plan, or request a custom review for AssistantAI setup." canonicalPath="/Contact" />
      <div>
        <section className="relative py-24 md:py-28 bg-grid">
          <div className="bg-radial-glow absolute inset-0" />
          <div className="relative max-w-7xl mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
              <p className="text-cyan-400 mb-3 text-base font-medium">CONTACT ASSISTANTAI</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance text-white">Ready to Start? Let the AI Qualify You First</h1>
              <p className="mt-5 text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">Speak to the AI receptionist, choose the right plan, or request a custom review.</p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-3">
              {cards.map((card) => <Link key={card.title} to={card.href} className="rounded-[28px] border border-white/5 bg-[#12121a] p-8 card-hover"><div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-5"><card.icon className="h-6 w-6 text-cyan-300" /></div><h2 className="text-2xl font-bold text-white">{card.title}</h2><p className="mt-3 text-gray-400 leading-relaxed">{card.desc}</p><div className="mt-7 inline-flex items-center gap-2 text-cyan-300 font-semibold">{card.label}<ArrowRight className="h-4 w-4" /></div></Link>)}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}