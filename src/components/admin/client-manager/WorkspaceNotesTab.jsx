import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function WorkspaceNotesTab({ client, onAddNote }) {
  const [form, setForm] = useState({ title: '', category: 'support notes', content: '', next_action: '' });

  return (
    <div className="space-y-6">
      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-white font-semibold">Internal Notes</h3>
          {client.notes_entries.map((note, index) => (
            <div key={`${note.title}-${index}`} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 space-y-2">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
                <div>
                  <p className="text-white font-medium">{note.title}</p>
                  <p className="text-sm text-gray-500">{note.category} • {note.date}</p>
                </div>
                {note.next_action && <p className="text-sm text-cyan-400">Next: {note.next_action}</p>}
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{note.content}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-[#12121a] border-white/5">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-white font-semibold">Add Note</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-400">Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-white/[0.03] border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-400">Category</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="bg-white/[0.03] border-white/10 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-400">Content</Label>
            <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="bg-white/[0.03] border-white/10 text-white min-h-28" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-400">Next Action</Label>
            <Input value={form.next_action} onChange={(e) => setForm({ ...form, next_action: e.target.value })} className="bg-white/[0.03] border-white/10 text-white" />
          </div>
          <div className="flex justify-end">
            <Button onClick={() => {
              if (!form.title || !form.content) return;
              onAddNote(form);
              setForm({ title: '', category: 'support notes', content: '', next_action: '' });
            }} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">Save Note</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}