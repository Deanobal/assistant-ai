import React, { useEffect, useState } from 'react';

export default function ChatBubble({ role, children, isTyping = false, shouldAnimate = false }) {
  const text = typeof children === 'string' ? children : '';
  const [displayedText, setDisplayedText] = useState(shouldAnimate ? '' : text);

  useEffect(() => {
    if (role !== 'assistant' || isTyping || !shouldAnimate) {
      setDisplayedText(text);
      return;
    }

    setDisplayedText('');
    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setDisplayedText(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [isTyping, role, shouldAnimate, text]);

  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          role === 'user'
            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
            : 'bg-white/[0.04] text-gray-200 border border-white/8'
        }`}
      >
        {isTyping ? (
          <div className="flex items-center gap-1 py-1">
            <span className="h-2 w-2 rounded-full bg-cyan-300/80 animate-pulse" />
            <span className="h-2 w-2 rounded-full bg-cyan-300/60 animate-pulse [animation-delay:150ms]" />
            <span className="h-2 w-2 rounded-full bg-cyan-300/40 animate-pulse [animation-delay:300ms]" />
          </div>
        ) : (
          displayedText
        )}
      </div>
    </div>
  );
}