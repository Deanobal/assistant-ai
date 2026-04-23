import React from 'react';
import { Button } from '@/components/ui/button';

export default function AdminBillingActions({ billing, onSendCheckout, onOverrideActive, isSending, isUpdating }) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={onSendCheckout} disabled={isSending} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white disabled:opacity-50">
        {isSending ? 'Sending…' : billing?.stripe_checkout_session_id ? 'Resend Payment Link' : 'Send Payment Link'}
      </Button>
      <Button variant="outline" onClick={onOverrideActive} disabled={isUpdating} className="border-white/10 bg-transparent text-white hover:bg-white/5 disabled:opacity-50">
        {isUpdating ? 'Updating…' : 'Admin Override to Active'}
      </Button>
    </div>
  );
}