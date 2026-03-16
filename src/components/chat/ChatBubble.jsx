import React from 'react';

export default function ChatBubble({ role, children }) {
  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          role === 'user'
            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
            : 'bg-white/[0.04] text-gray-200 border border-white/8'
        }`}
      >
        {children}
      </div>
    </div>
  );
}