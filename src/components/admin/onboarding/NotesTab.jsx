import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const noteTypes = ['onboarding_note', 'client_request', 'support_note', 'issue', 'upsell_opportunity', 'next_action'];

export default function NotesTab({ notes, onCreate }) {
  const [form, setForm] = useState({ note_type: 'onboarding_note', content: '' });

  return (
    <div className="space-y-6">
      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-white font-semibold">Notes Feed</h3>
          {notes.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-6 text-sm text-gray-400">No notes saved yet.</div>
          ) : notes.map((note) => (
            <div key={note.id} className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-white font-medium">{note.note_type.replaceAll('_', ' ')}</p>
                <p className="text-xs text-gray-500">{note.created_at}</p>
              </div>
              <p className="text-sm text-gray-300 mt-2">{note.content}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-white font-semibold">Add Note</h3>
          <Select value={form.note_type} onValueChange={(value) => setForm((prev) => ({ ...prev, note_type: value }))}>
            <SelectTrigger className="bg-white/[0.03] border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent>{noteTypes.map((type) => <SelectItem key={type} value={type}>{type.replaceAll('_', ' ')}</SelectItem>)}</SelectContent>
          </Select>
          <Textarea value={form.content} onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))} className="bg-white/[0.03] border-white/10 text-white min-h-[120px]" />
          <div className="flex justify-end">
            <Button onClick={() => {
              if (!form.content) return;
              onCreate(form);
              setForm({ note_type: 'onboarding_note', content: '' });
            }} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">Save Note</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}