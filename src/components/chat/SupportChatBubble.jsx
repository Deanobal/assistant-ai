import React from 'react';

export default function SupportChatBubble({ message }) {
  const isVisitor = message.sender_type === 'visitor';
  const isSystem = message.sender_type === 'system';
  const senderLabel = isSystem
    ? (message.sender_name || 'AssistantAI Assistant')
    : message.sender_type === 'admin'
      ? (message.sender_name || 'AssistantAI Team')
      : null;

  return (
    <div className={`flex ${isVisitor ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isVisitor
            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
            : isSystem
              ? 'border border-cyan-500/20 bg-cyan-500/8 text-cyan-100'
              : 'border border-white/8 bg-white/[0.04] text-gray-200'
        }`}
      >
        {senderLabel && (
          <div className={`mb-2 text-[11px] font-medium uppercase tracking-[0.14em] ${isSystem ? 'text-cyan-300/90' : 'text-gray-400'}`}>
            {senderLabel}
          </div>
        )}
        {message.message_body}
      </div>
    </div>
  );
}