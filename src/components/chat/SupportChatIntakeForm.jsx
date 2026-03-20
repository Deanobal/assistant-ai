import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function SupportChatIntakeForm({ form, setForm, onSubmit, isLoading }) {
  return (
    <div className="space-y-3">
      <Input
        value={form.name}
        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
        placeholder="Your name"
        className="bg-white/[0.03] border-white/10 text-white placeholder:text-gray-500"
      />
      <Input
        type="email"
        value={form.email}
        onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
        placeholder="Your email"
        className="bg-white/[0.03] border-white/10 text-white placeholder:text-gray-500"
      />
      <Input
        value={form.mobile}
        onChange={(e) => setForm((prev) => ({ ...prev, mobile: e.target.value }))}
        placeholder="Mobile number (optional)"
        className="bg-white/[0.03] border-white/10 text-white placeholder:text-gray-500"
      />
      <Textarea
        value={form.message}
        onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
        placeholder="How can we help?"
        className="min-h-[110px] bg-white/[0.03] border-white/10 text-white placeholder:text-gray-500"
      />
      <Button
        onClick={onSubmit}
        disabled={isLoading || !form.name || !form.email || !form.message}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
      >
        {isLoading ? 'Sending…' : 'Send message'}
      </Button>
    </div>
  );
}