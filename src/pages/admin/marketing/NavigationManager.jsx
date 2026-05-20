import { useEffect, useState } from 'react';
import { Navigation, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const blank = { id: '', menu_key: 'header', label: '', href: '', item_type: 'link', parent_label: '', open_in_new_tab: false, sort_order: 0, status: 'draft' };

function toForm(item) {
  return {
    id: item.id || '',
    menu_key: item.menu_key || 'header',
    label: item.label || '',
    href: item.href || '',
    item_type: item.item_type || 'link',
    parent_label: item.parent_label || '',
    open_in_new_tab: Boolean(item.open_in_new_tab),
    sort_order: item.sort_order || 0,
    status: item.status || 'draft',
  };
}

export default function NavigationManager() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState('');

  async function loadItems() {
    try {
      const res = await fetch('/api/navigation-items?includeDrafts=true');
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Could not load navigation');
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
      const res = await fetch('/api/navigation-items', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Could not save navigation item');
      setForm(toForm(data.item));
      setMessage(status === 'active' ? 'Navigation item activated.' : 'Navigation item saved.');
      await loadItems();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function remove() {
    if (!form.id || !window.confirm('Delete this navigation item?')) return;
    try {
      const res = await fetch(`/api/navigation-items?id=${encodeURIComponent(form.id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Could not delete navigation item');
      setForm(blank);
      setMessage('Navigation item deleted.');
      await loadItems();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">Site Structure</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Navigation Manager</h1>
          <p className="mt-2 text-sm text-slate-400">Manage header links, footer links, CTA links and menu ordering.</p>
        </div>
        <Button onClick={() => setForm(blank)} className="bg-cyan-500 text-white hover:bg-cyan-400"><Plus className="mr-2 h-4 w-4" />New Link</Button>
      </div>

      {message && <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">{message}</div>}

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <Card className="border-white/10 bg-[#0b0f18]">
          <CardHeader><CardTitle className="text-white">Menu Items</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {items.length === 0 ? <p className="text-sm text-slate-500">No navigation items yet.</p> : null}
            {items.map((item) => (
              <button key={item.id} onClick={() => setForm(toForm(item))} className="w-full rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left hover:border-cyan-400/30">
                <div className="text-xs uppercase tracking-wide text-cyan-300">{item.menu_key} / {item.status}</div>
                <div className="mt-1 font-semibold text-white">{item.label}</div>
                <div className="mt-1 text-sm text-slate-400">{item.href}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#0b0f18]">
          <CardHeader><CardTitle className="text-white">{form.id ? 'Edit Link' : 'Create Link'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label className="text-slate-300">Menu Key</Label><Input value={form.menu_key} onChange={(e) => update('menu_key', e.target.value)} className="border-white/10 bg-white/5 text-white" placeholder="header, footer, cta" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Label</Label><Input value={form.label} onChange={(e) => update('label', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2 md:col-span-2"><Label className="text-slate-300">URL / Path</Label><Input value={form.href} onChange={(e) => update('href', e.target.value)} className="border-white/10 bg-white/5 text-white" placeholder="/Pricing or https://..." /></div>
              <div className="space-y-2"><Label className="text-slate-300">Type</Label><Input value={form.item_type} onChange={(e) => update('item_type', e.target.value)} className="border-white/10 bg-white/5 text-white" placeholder="link, cta, dropdown" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Parent Label</Label><Input value={form.parent_label} onChange={(e) => update('parent_label', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Sort Order</Label><Input type="number" value={form.sort_order} onChange={(e) => update('sort_order', Number(e.target.value))} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Open Behaviour</Label><Button type="button" variant="outline" onClick={() => update('open_in_new_tab', !form.open_in_new_tab)} className="w-full border-white/10 bg-white/[0.03] text-white">{form.open_in_new_tab ? 'New Tab' : 'Same Tab'}</Button></div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button onClick={() => save('draft')} variant="outline" className="border-white/10 bg-white/[0.03] text-white"><Save className="mr-2 h-4 w-4" />Save Draft</Button>
              <Button onClick={() => save('active')} className="bg-cyan-500 text-white hover:bg-cyan-400"><Navigation className="mr-2 h-4 w-4" />Activate</Button>
              {form.id && <Button onClick={remove} variant="outline" className="border-red-500/20 bg-red-500/10 text-red-200"><Trash2 className="mr-2 h-4 w-4" />Delete</Button>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
