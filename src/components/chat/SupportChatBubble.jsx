import React from 'react';

export default function SupportChatBubble({ message }) {
  const isVisitor = message.sender_type === 'visitor';
  const isSystem = message.sender_type === 'system';

  return (
    <div className={`flex ${isVisitor ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isVisitor
            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
            : isSystem
              ? 'bg-cyan-500/8 text-cyan-100 border border-cyan-500/20'
              : 'bg-white/[0.04] text-gray-200 border border-white/8'
        }`}
      >
        {message.message_body}
      </div>
    </div>
  );
}