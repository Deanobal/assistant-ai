import { useEffect, useState } from 'react';
import { HelpCircle, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const blank = { id: '', question: '', answer: '', category: 'general', page_key: 'global', keywords: '', sort_order: 0, status: 'draft' };

function toForm(item) {
  return {
    id: item.id || '',
    question: item.question || '',
    answer: item.answer || '',
    category: item.category || 'general',
    page_key: item.page_key || 'global',
    keywords: Array.isArray(item.keywords) ? item.keywords.join(', ') : '',
    sort_order: item.sort_order || 0,
    status: item.status || 'draft',
  };
}

export default function FaqManager() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState('');

  async function loadItems() {
    try {
      const res = await fetch('/api/faq-items?includeDrafts=true');
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Could not load FAQs');
      setItems(data.items || []);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => { loadItems(); }, []);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function save(status) {
    try {
      const res = await fetch('/api/faq-items', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Could not save FAQ');
      setForm(toForm(data.item));
      setMessage(status === 'active' ? 'FAQ activated.' : 'FAQ saved as draft.');
      await loadItems();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function remove() {
    if (!form.id || !window.confirm('Delete this FAQ?')) return;
    try {
      const res = await fetch(`/api/faq-items?id=${encodeURIComponent(form.id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Could not delete FAQ');
      setForm(blank);
      setMessage('FAQ deleted.');
      await loadItems();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">Conversion + SEO</p>
          <h1 className="mt-2 text-3xl font-bold text-white">FAQ Manager</h1>
          <p className="mt-2 text-sm text-slate-400">Manage sales objections, pricing answers and SEO FAQ content.</p>
        </div>
        <Button onClick={() => setForm(blank)} className="bg-cyan-500 text-white hover:bg-cyan-400"><Plus className="mr-2 h-4 w-4" />New FAQ</Button>
      </div>

      {message && <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">{message}</div>}

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <Card className="border-white/10 bg-[#0b0f18]">
          <CardHeader><CardTitle className="text-white">FAQs</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {items.length === 0 ? <p className="text-sm text-slate-500">No FAQs yet.</p> : null}
            {items.map((item) => (
              <button key={item.id} onClick={() => setForm(toForm(item))} className="w-full rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left hover:border-cyan-400/30">
                <div className="text-xs uppercase tracking-wide text-cyan-300">{item.page_key} / {item.category} / {item.status}</div>
                <div className="mt-1 font-semibold text-white">{item.question}</div>
                <div className="mt-1 line-clamp-2 text-sm text-slate-400">{item.answer}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#0b0f18]">
          <CardHeader><CardTitle className="text-white">{form.id ? 'Edit FAQ' : 'Create FAQ'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2"><Label className="text-slate-300">Question</Label><Input value={form.question} onChange={(e) => update('question', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2 md:col-span-2"><Label className="text-slate-300">Answer</Label><Textarea value={form.answer} onChange={(e) => update('answer', e.target.value)} className="min-h-[180px] border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Page Key</Label><Input value={form.page_key} onChange={(e) => update('page_key', e.target.value)} className="border-white/10 bg-white/5 text-white" placeholder="pricing, home, global" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Category</Label><Input value={form.category} onChange={(e) => update('category', e.target.value)} className="border-white/10 bg-white/5 text-white" placeholder="pricing, setup, ai, security" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Keywords</Label><Input value={form.keywords} onChange={(e) => update('keywords', e.target.value)} className="border-white/10 bg-white/5 text-white" placeholder="ai receptionist, cost, setup" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Sort Order</Label><Input type="number" value={form.sort_order} onChange={(e) => update('sort_order', Number(e.target.value))} className="border-white/10 bg-white/5 text-white" /></div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button onClick={() => save('draft')} variant="outline" className="border-white/10 bg-white/[0.03] text-white"><Save className="mr-2 h-4 w-4" />Save Draft</Button>
              <Button onClick={() => save('active')} className="bg-cyan-500 text-white hover:bg-cyan-400"><HelpCircle className="mr-2 h-4 w-4" />Activate</Button>
              {form.id && <Button onClick={remove} variant="outline" className="border-red-500/20 bg-red-500/10 text-red-200"><Trash2 className="mr-2 h-4 w-4" />Delete</Button>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
