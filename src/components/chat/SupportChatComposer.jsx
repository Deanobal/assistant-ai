import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function SupportChatComposer({ value, onChange, onSend, isLoading, canReply = true }) {
  return (
    <div className="space-y-3">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Reply to this conversation"
        className="min-h-[90px] bg-white/[0.03] border-white/10 text-white placeholder:text-gray-500"
      />
      <Button
        onClick={onSend}
        disabled={isLoading || !value.trim() || !canReply}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
      >
        {isLoading ? 'Sending…' : 'Send reply'}
      </Button>
    </div>
  );
}