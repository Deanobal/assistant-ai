import { useEffect, useState } from 'react';
import { MessageSquareQuote, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const blank = { id: '', item_type: 'testimonial', title: '', client_name: '', business_name: '', industry: '', quote: '', result_summary: '', metric_label: '', metric_value: '', image_url: '', case_study_url: '', sort_order: 0, status: 'draft' };

function toForm(item) {
  return {
    id: item.id || '',
    item_type: item.item_type || 'testimonial',
    title: item.title || '',
    client_name: item.client_name || '',
    business_name: item.business_name || '',
    industry: item.industry || '',
    quote: item.quote || '',
    result_summary: item.result_summary || '',
    metric_label: item.metric_label || '',
    metric_value: item.metric_value || '',
    image_url: item.image_url || '',
    case_study_url: item.case_study_url || '',
    sort_order: item.sort_order || 0,
    status: item.status || 'draft',
  };
}

export default function SocialProofManager() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState('');

  async function loadItems() {
    try {
      const res = await fetch('/api/social-proof?includeDrafts=true');
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Could not load social proof');
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
      const res = await fetch('/api/social-proof', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Could not save social proof');
      setForm(toForm(data.item));
      setMessage(status === 'active' ? 'Social proof item activated.' : 'Social proof item saved.');
      await loadItems();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function remove() {
    if (!form.id || !window.confirm('Delete this item?')) return;
    try {
      const res = await fetch(`/api/social-proof?id=${encodeURIComponent(form.id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Could not delete item');
      setForm(blank);
      setMessage('Social proof item deleted.');
      await loadItems();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">Conversion Assets</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Social Proof Manager</h1>
          <p className="mt-2 text-sm text-slate-400">Manage testimonials, case studies, proof metrics and industry wins.</p>
        </div>
        <Button onClick={() => setForm(blank)} className="bg-cyan-500 text-white hover:bg-cyan-400"><Plus className="mr-2 h-4 w-4" />New Item</Button>
      </div>

      {message && <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">{message}</div>}

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <Card className="border-white/10 bg-[#0b0f18]">
          <CardHeader><CardTitle className="text-white">Items</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {items.length === 0 ? <p className="text-sm text-slate-500">No social proof items yet.</p> : null}
            {items.map((item) => (
              <button key={item.id} onClick={() => setForm(toForm(item))} className="w-full rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left hover:border-cyan-400/30">
                <div className="text-xs uppercase tracking-wide text-cyan-300">{item.item_type} / {item.status}</div>
                <div className="mt-1 font-semibold text-white">{item.title}</div>
                <div className="mt-1 text-sm text-slate-400">{item.business_name || item.client_name || item.industry}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#0b0f18]">
          <CardHeader><CardTitle className="text-white">{form.id ? 'Edit Item' : 'Create Item'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label className="text-slate-300">Type</Label><Input value={form.item_type} onChange={(e) => update('item_type', e.target.value)} className="border-white/10 bg-white/5 text-white" placeholder="testimonial or case_study" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Title</Label><Input value={form.title} onChange={(e) => update('title', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Client Name</Label><Input value={form.client_name} onChange={(e) => update('client_name', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Business Name</Label><Input value={form.business_name} onChange={(e) => update('business_name', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Industry</Label><Input value={form.industry} onChange={(e) => update('industry', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Sort Order</Label><Input type="number" value={form.sort_order} onChange={(e) => update('sort_order', Number(e.target.value))} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2 md:col-span-2"><Label className="text-slate-300">Quote</Label><Textarea value={form.quote} onChange={(e) => update('quote', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2 md:col-span-2"><Label className="text-slate-300">Result Summary</Label><Textarea value={form.result_summary} onChange={(e) => update('result_summary', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Metric Label</Label><Input value={form.metric_label} onChange={(e) => update('metric_label', e.target.value)} className="border-white/10 bg-white/5 text-white" placeholder="Response time saved" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Metric Value</Label><Input value={form.metric_value} onChange={(e) => update('metric_value', e.target.value)} className="border-white/10 bg-white/5 text-white" placeholder="24/7" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Image URL</Label><Input value={form.image_url} onChange={(e) => update('image_url', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Case Study URL</Label><Input value={form.case_study_url} onChange={(e) => update('case_study_url', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button onClick={() => save('draft')} variant="outline" className="border-white/10 bg-white/[0.03] text-white"><Save className="mr-2 h-4 w-4" />Save Draft</Button>
              <Button onClick={() => save('active')} className="bg-cyan-500 text-white hover:bg-cyan-400"><MessageSquareQuote className="mr-2 h-4 w-4" />Activate</Button>
              {form.id && <Button onClick={remove} variant="outline" className="border-red-500/20 bg-red-500/10 text-red-200"><Trash2 className="mr-2 h-4 w-4" />Delete</Button>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
