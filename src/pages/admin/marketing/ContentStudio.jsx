import { useEffect, useState } from 'react';
import { Copy, Plus, Save, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const blank = {
  id: '', title: '', content_type: 'blog', target_audience: 'Australian service businesses',
  objective: 'generate qualified leads', keywords: 'AI receptionist, missed calls, lead capture',
  channel: 'website', prompt: '', draft_body: '', status: 'draft'
};

function toForm(draft) {
  return {
    id: draft.id || '',
    title: draft.title || '',
    content_type: draft.content_type || 'blog',
    target_audience: draft.target_audience || '',
    objective: draft.objective || '',
    keywords: Array.isArray(draft.keywords) ? draft.keywords.join(', ') : '',
    channel: draft.channel || 'website',
    prompt: draft.prompt || '',
    draft_body: draft.draft_body || '',
    status: draft.status || 'draft',
  };
}

export default function ContentStudio() {
  const [drafts, setDrafts] = useState([]);
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState('');

  async function loadDrafts() {
    try {
      const res = await fetch('/api/content-drafts');
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Could not load drafts');
      setDrafts(data.drafts || []);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => { loadDrafts(); }, []);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function generateDraft() {
    try {
      const payload = { ...form, draft_body: '' };
      const res = await fetch('/api/content-drafts', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Could not generate draft');
      setForm(toForm(data.draft));
      setMessage('Draft generated.');
      await loadDrafts();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function saveDraft() {
    try {
      const res = await fetch('/api/content-drafts', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Could not save draft');
      setForm(toForm(data.draft));
      setMessage('Draft saved.');
      await loadDrafts();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function deleteDraft() {
    if (!form.id || !window.confirm('Delete this draft?')) return;
    try {
      const res = await fetch(`/api/content-drafts?id=${encodeURIComponent(form.id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Could not delete draft');
      setForm(blank);
      setMessage('Draft deleted.');
      await loadDrafts();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function copyDraft() {
    await navigator.clipboard.writeText(form.draft_body || '');
    setMessage('Draft copied.');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">AI Content Studio</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Content Studio</h1>
          <p className="mt-2 text-sm text-slate-400">Generate and store drafts for blogs, ads, social posts, emails and landing page copy.</p>
        </div>
        <Button onClick={() => setForm(blank)} className="bg-cyan-500 text-white hover:bg-cyan-400"><Plus className="mr-2 h-4 w-4" />New Draft</Button>
      </div>

      {message && <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">{message}</div>}

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <Card className="border-white/10 bg-[#0b0f18]">
          <CardHeader><CardTitle className="text-white">Drafts</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {drafts.length === 0 ? <p className="text-sm text-slate-500">No drafts yet.</p> : null}
            {drafts.map((draft) => (
              <button key={draft.id} onClick={() => setForm(toForm(draft))} className="w-full rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left hover:border-cyan-400/30">
                <div className="text-xs uppercase tracking-wide text-cyan-300">{draft.content_type} / {draft.channel}</div>
                <div className="mt-1 font-semibold text-white">{draft.title}</div>
                <div className="mt-1 line-clamp-2 text-xs text-slate-500">{draft.objective}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#0b0f18]">
          <CardHeader><CardTitle className="text-white">{form.id ? 'Edit Draft' : 'Create Draft'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label className="text-slate-300">Title</Label><Input value={form.title} onChange={(e) => update('title', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Type</Label><Input value={form.content_type} onChange={(e) => update('content_type', e.target.value)} className="border-white/10 bg-white/5 text-white" placeholder="blog, ad, social, email" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Audience</Label><Input value={form.target_audience} onChange={(e) => update('target_audience', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Objective</Label><Input value={form.objective} onChange={(e) => update('objective', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Keywords</Label><Input value={form.keywords} onChange={(e) => update('keywords', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Channel</Label><Input value={form.channel} onChange={(e) => update('channel', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2 md:col-span-2"><Label className="text-slate-300">Extra Prompt</Label><Textarea value={form.prompt} onChange={(e) => update('prompt', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2 md:col-span-2"><Label className="text-slate-300">Draft Body</Label><Textarea value={form.draft_body} onChange={(e) => update('draft_body', e.target.value)} className="min-h-[340px] border-white/10 bg-white/5 font-mono text-sm text-white" /></div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button onClick={generateDraft} className="bg-cyan-500 text-white hover:bg-cyan-400"><Sparkles className="mr-2 h-4 w-4" />Generate Draft</Button>
              <Button onClick={saveDraft} variant="outline" className="border-white/10 bg-white/[0.03] text-white"><Save className="mr-2 h-4 w-4" />Save</Button>
              {form.draft_body && <Button onClick={copyDraft} variant="outline" className="border-white/10 bg-white/[0.03] text-white"><Copy className="mr-2 h-4 w-4" />Copy</Button>}
              {form.id && <Button onClick={deleteDraft} variant="outline" className="border-red-500/20 bg-red-500/10 text-red-200"><Trash2 className="mr-2 h-4 w-4" />Delete</Button>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
