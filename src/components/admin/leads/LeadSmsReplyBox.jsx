import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  if (digits.startsWith('61') && digits.length === 11) {
    return `+${digits}`;
  }

  if (digits.startsWith('0') && digits.length === 10) {
    return `+61${digits.slice(1)}`;
  }

  if (digits.startsWith('4') && digits.length === 9) {
    return `+61${digits}`;
  }

  if (String(value || '').trim().startsWith('+')) {
    return `+${digits}`;
  }

  return '';
}

export default function LeadSmsReplyBox({ leadId, mobileNumber, fullName }) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const normalizedPhone = normalizePhone(mobileNumber);
  const hasValidPhone = !!normalizedPhone;

  const replyMutation = useMutation({
    mutationFn: () => base44.functions.invoke('sendLeadSmsReply', { leadId, message: message.trim() }),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['lead-sms-trail', leadId] });
      queryClient.invalidateQueries({ queryKey: ['lead-detail', leadId] });
    },
  });

  const replyResult = replyMutation.data?.data || null;
  const helperText = hasValidPhone
    ? `Replying to ${fullName || 'this lead'} at ${normalizedPhone}`
    : 'Add a valid mobile number on this lead before sending an SMS reply.';

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 space-y-3">
      <div>
        <h4 className="text-sm font-semibold text-white">Reply to customer</h4>
        <p className="text-xs text-gray-400 mt-1">{helperText}</p>
      </div>

      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a manual SMS reply…"
        className="min-h-[96px] bg-[#0f0f17] border-white/10 text-white placeholder:text-gray-500"
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-xs text-gray-400">
          {replyMutation.isPending && 'Sending to Twilio…'}
          {replyResult && !replyMutation.isPending && `Latest send status: ${replyResult.delivery_status}${replyResult.provider_status ? ` (${replyResult.provider_status})` : ''}`}
          {replyMutation.isError && (replyMutation.error?.response?.data?.error || replyMutation.error?.message || 'SMS reply failed.')}
        </div>

        <Button
          onClick={() => replyMutation.mutate()}
          disabled={!hasValidPhone || !message.trim() || replyMutation.isPending}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white disabled:opacity-50"
        >
          {replyMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
          Send SMS Reply
        </Button>
      </div>
    </div>
  );
}