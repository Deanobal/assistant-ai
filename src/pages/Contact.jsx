import React from 'react';
import { Link } from 'react-router-dom';

export default function Contact() {
  return (
    <main className="min-h-screen bg-[#070912] px-6 py-20 text-white">
      <div className="mx-auto max-w-4xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">Contact</p>
        <h1 className="text-4xl font-bold md:text-5xl">Talk to our AI receptionist or start now.</h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">Crisp remains available for website chat and support. Vapi is now the primary public voice demo for sales qualification and plan guidance.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><a href="/#live-demo" className="rounded-full bg-cyan-500 px-6 py-3 font-medium">Talk to Our AI Receptionist</a><Link to="/GetStartedNow" className="rounded-full border border-white/15 px-6 py-3 font-medium">Get Started Now</Link></div>
      </div>
    </main>
  );
}