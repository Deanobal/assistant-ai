import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import ContactForm from '@/components/contact/ContactForm';

export default function Contact() {
  return (
    <>
      <SEO
        title="Contact | Talk to AssistantAI"
        description="Contact AssistantAI to discuss AI receptionist setup, missed-call coverage, lead capture, booking support, CRM follow-up, and secure signup for Australian service businesses."
        canonicalPath="/Contact"
      />
      <main className="min-h-screen bg-[#070912] px-6 py-20 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">Contact</p>
            <h1 className="text-4xl font-bold md:text-5xl">Talk to the AI receptionist or get started now.</h1>
            <p className="mt-5 text-lg leading-8 text-slate-300">Ask questions, see how AssistantAI qualifies new enquiries, or choose a plan and begin secure signup when you are ready.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/AIDemo" className="rounded-full bg-cyan-500 px-6 py-3 font-medium text-white transition hover:bg-cyan-400">Talk to Our AI Receptionist</Link>
              <Link to="/GetStartedNow" className="rounded-full border border-white/15 px-6 py-3 font-medium text-white transition hover:bg-white/5">Get Started Now</Link>
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-3xl">
            <ContactForm />
          </div>
        </div>
      </main>
    </>
  );
}
