import { useEffect, useState } from 'react';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const blank = {
  id: '', page_key: 'home', section_key: '', label: '', content_type: 'text', value: '', status: 'active', sort_order: 0
};

const pageOptions = ['home', 'services', 'pricing', 'about', 'contact', 'platform', 'integrations'];

function toForm(block) {
  return {
    id: block.id || '',
    page_key: block.page_key || 'home',
    section_key: block.section_key || '',
    label: block.label || '',
    content_type: block.content_type || 'text',
    value: block.value || '',
    status: block.status || 'active',
    sort_order: block.sort_order || 0
  };
}

export default function ContentManager() {
  const [blocks, setBlocks] = useState([]);
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [pageFilter, setPageFilter] = useState('');

  async function loadBlocks(page = pageFilter) {
    setLoading(true);
    try {
      const url = page ? `/api/content-blocks?page_key=${encodeURIComponent(page)}` : '/api/content-blocks';
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) throw new Error(data.details || data.error || 'Could not load content blocks');
      setBlocks(data.blocks || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadBlocks(); }, []);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveBlock() {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/content-blocks', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.details || data.error || 'Could not save content block');
      setForm(toForm(data.block));
      setMessage('Content block saved.');
      await loadBlocks();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteBlock() {
    if (!form.id || !window.confirm('Delete this content block?')) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/content-blocks?id=${encodeURIComponent(form.id)}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Could not delete content block');
      setForm(blank);
      setMessage('Content block deleted.');
      await loadBlocks();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  function applyFilter(page) {
    setPageFilter(page);
    loadBlocks(page);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">Website CMS</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Content Manager</h1>
          <p className="mt-2 text-sm text-slate-400">Create editable content blocks for homepage, pricing, services and landing pages.</p>
        </div>
        <Button onClick={() => setForm(blank)} className="bg-cyan-500 text-white hover:bg-cyan-400"><Plus className="mr-2 h-4 w-4" />New Block</Button>
      </div>

      {message && <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">{message}</div>}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={!pageFilter ? 'default' : 'outline'} onClick={() => applyFilter('')}>All</Button>
        {pageOptions.map((page) => (
          <Button key={page} size="sm" variant={pageFilter === page ? 'default' : 'outline'} onClick={() => applyFilter(page)} className="capitalize">{page}</Button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card className="border-white/10 bg-[#0b0f18]">
          <CardHeader><CardTitle className="text-white">Content Blocks</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {loading ? <div className="flex items-center gap-2 text-slate-400"><Loader2 className="h-4 w-4 animate-spin" />Loading...</div> : null}
            {!loading && blocks.length === 0 ? <p className="text-sm text-slate-500">No content blocks yet.</p> : null}
            {blocks.map((block) => (
              <button key={block.id} onClick={() => setForm(toForm(block))} className="w-full rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left hover:border-cyan-400/30">
                <div className="mb-1 text-xs uppercase tracking-wide text-cyan-300">{block.page_key} / {block.section_key}</div>
                <div className="font-semibold text-white">{block.label}</div>
                <div className="mt-1 line-clamp-2 text-xs text-slate-500">{block.value}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#0b0f18]">
          <CardHeader><CardTitle className="text-white">{form.id ? 'Edit Block' : 'Create Block'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label className="text-slate-300">Page Key</Label><Input value={form.page_key} onChange={(e) => update('page_key', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Section Key</Label><Input value={form.section_key} onChange={(e) => update('section_key', e.target.value)} className="border-white/10 bg-white/5 text-white" placeholder="hero_headline" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Label</Label><Input value={form.label} onChange={(e) => update('label', e.target.value)} className="border-white/10 bg-white/5 text-white" placeholder="Homepage Hero Headline" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Sort Order</Label><Input type="number" value={form.sort_order} onChange={(e) => update('sort_order', Number(e.target.value))} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2 md:col-span-2"><Label className="text-slate-300">Value</Label><Textarea value={form.value} onChange={(e) => update('value', e.target.value)} className="min-h-[220px] border-white/10 bg-white/5 text-white" /></div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button disabled={saving} onClick={saveBlock} className="bg-cyan-500 text-white hover:bg-cyan-400"><Save className="mr-2 h-4 w-4" />Save Block</Button>
              {form.id && <Button disabled={saving} onClick={deleteBlock} variant="outline" className="border-red-500/20 bg-red-500/10 text-red-200"><Trash2 className="mr-2 h-4 w-4" />Delete</Button>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
