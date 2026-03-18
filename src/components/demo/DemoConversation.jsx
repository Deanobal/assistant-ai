import React from 'react';
import { motion } from 'framer-motion';

export const transcript = [
  { role: 'caller', text: 'Hi, I need help with a leaking hot water system at my property in Melbourne.' },
  { role: 'assistant', text: 'Absolutely — I can help with that. Is this urgent, and what’s the best number and address for the job?' },
  { role: 'caller', text: 'Yes, it’s urgent. My number is 0400 000 000 and the property is in Brighton.' },
  { role: 'assistant', text: 'Thanks. I’ve marked this as urgent, captured your details, and requested the next available technician. A confirmation text has now been sent.' },
];

export default function DemoConversation({ currentStep }) {
  return (
    <div className="rounded-[28px] border border-white/8 bg-[#11111a] p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-400">Live Demo</p>
          <h3 className="mt-2 text-lg font-semibold text-white">AI Call Qualification Flow</h3>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-gray-300">
          Step {currentStep + 1} of 4
        </div>
      </div>

      <div className="space-y-3">
        {transcript.slice(0, currentStep + 1).map((message, index) => (
          <motion.div
            key={`${message.role}-${index}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.role === 'assistant' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                message.role === 'assistant'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                  : 'border border-white/8 bg-white/[0.04] text-gray-200'
              }`}
            >
              {message.text}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}