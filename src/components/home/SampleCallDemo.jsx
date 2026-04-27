import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';

const transcript = [
  { role: 'ai', text: "Hi, thanks for calling! You've reached [Business Name] — I'm the AI assistant. How can I help you today?" },
  { role: 'customer', text: "Hey, my hot water system just stopped working. I need someone to take a look urgently." },
  { role: 'ai', text: "Sorry to hear that — no hot water is definitely urgent. Can I grab your name and best contact number so we can get someone to you quickly?" },
  { role: 'customer', text: "Sure, it's James Carter, and my number is 0412 345 678." },
  { role: 'ai', text: "Thanks James. And what suburb are you in? I want to make sure we get the closest technician to you." },
  { role: 'customer', text: "I'm in Surry Hills, Sydney." },
  { role: 'ai', text: "Perfect. Just to confirm — this is a residential property and it's urgent, right? Hot water completely out?" },
  { role: 'customer', text: "Yes, exactly. We've got kids at home so the sooner the better." },
  { role: 'ai', text: "Understood. I've captured your details and flagged this as urgent. Our on-call technician will call you within 15 minutes to confirm a time. Is there anything else I can help with?" },
  { role: 'customer', text: "No, that's great. Thank you!" },
  { role: 'ai', text: "You're welcome, James. Help is on the way — have a good one!" },
];

export default function SampleCallDemo() {
  return (
    <section id="homepage-demo" className="relative py-16 md:py-24 bg-[#070a12]">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 mb-4">
            <Phone className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-300">Live call sample</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Sample AI Receptionist Call
          </h2>
          <p className="mt-4 text-base text-slate-400 max-w-xl mx-auto leading-7">
            Here's how our AI receptionist handles a real enquiry — answering instantly, qualifying the lead, capturing key details, and routing the job. All without a human on the other end.
          </p>
        </div>

        {/* Transcript */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8 space-y-4">
          {transcript.map((line, i) => (
            <div
              key={i}
              className={`flex gap-3 ${line.role === 'customer' ? 'justify-end' : 'justify-start'}`}
            >
              {line.role === 'ai' && (
                <div className="flex-shrink-0 h-7 w-7 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center mt-0.5">
                  <span className="text-[10px] font-bold text-cyan-300">AI</span>
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  line.role === 'ai'
                    ? 'bg-white/[0.06] text-slate-200 rounded-tl-sm'
                    : 'bg-cyan-500/10 border border-cyan-400/20 text-slate-300 rounded-tr-sm'
                }`}
              >
                {line.text}
              </div>
              {line.role === 'customer' && (
                <div className="flex-shrink-0 h-7 w-7 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center mt-0.5">
                  <span className="text-[10px] font-bold text-slate-300">You</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link to="/BookStrategyCall">
            <Button
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-full px-8 shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
            >
              Book Free Strategy Call
            </Button>
          </Link>
          <p className="mt-3 text-sm text-slate-500">No commitment. 30 minutes. Real results.</p>
        </div>
      </div>
    </section>
  );
}