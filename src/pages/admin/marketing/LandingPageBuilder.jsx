import { useEffect, useState } from 'react';
import { Copy, Eye, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const blank = { id: '', title: '', slug: '', headline: '', subheadline: '', offer: '', cta_label: 'Get Started', cta_url: '/GetStartedNow', meta_title: '', meta_description: '', sections: '', status: 'draft' };

function slugify(value) {
  return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);
}

function toForm(page) {
  return {
    id: page.id || '',
    title: page.title || '',
    slug: page.slug || '',
    headline: page.headline || '',
    subheadline: page.subheadline || '',
    offer: page.offer || '',
    cta_label: page.cta_label || 'Get Started',
    cta_url: page.cta_url || '/GetStartedNow',
    meta_title: page.meta_title || '',
    meta_description: page.meta_description || '',
    sections: Array.isArray(page.sections) ? page.sections.map((s) => s.body || s.title || '').join('\n\n') : '',
    status: page.status || 'draft',
  };
}

export default function LandingPageBuilder() {
  const [pages, setPages] = useState([]);
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState('');

  async function loadPages() {
    try {
      const res = await fetch('/api/landing-pages?includeDrafts=true');
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Could not load landing pages');
      setPages(data.pages || []);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => { loadPages(); }, []);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value, slug: field === 'title' && !current.id ? slugify(value) : current.slug }));
  }

  async function save(status) {
    try {
      const payload = { ...form, status, sections: form.sections.split('\n').map((x) => x.trim()).filter(Boolean).map((body) => ({ title: '', body })) };
      const res = await fetch('/api/landing-pages', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Could not save landing page');
      setForm(toForm(data.page));
      setMessage(status === 'published' ? 'Landing page published.' : 'Landing page saved.');
      await loadPages();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function remove() {
    if (!form.id || !window.confirm('Delete this landing page?')) return;
    try {
      const res = await fetch(`/api/landing-pages?id=${encodeURIComponent(form.id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Could not delete landing page');
      setForm(blank);
      setMessage('Landing page deleted.');
      await loadPages();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function copyUrl() {
    await navigator.clipboard.writeText(`${window.location.origin}/lp/${form.slug}`);
    setMessage('Landing page URL copied.');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">Campaign Pages</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Landing Page Builder</h1>
          <p className="mt-2 text-sm text-slate-400">Create offer pages for ads, campaigns and niche landing pages.</p>
        </div>
        <Button onClick={() => setForm(blank)} className="bg-cyan-500 text-white hover:bg-cyan-400"><Plus className="mr-2 h-4 w-4" />New Page</Button>
      </div>

      {message && <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">{message}</div>}

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <Card className="border-white/10 bg-[#0b0f18]">
          <CardHeader><CardTitle className="text-white">Pages</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {pages.length === 0 ? <p className="text-sm text-slate-500">No landing pages yet.</p> : null}
            {pages.map((page) => (
              <button key={page.id} onClick={() => setForm(toForm(page))} className="w-full rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left hover:border-cyan-400/30">
                <div className="text-xs uppercase tracking-wide text-cyan-300">{page.status}</div>
                <div className="mt-1 font-semibold text-white">{page.title}</div>
                <div className="mt-1 text-xs text-slate-500">/lp/{page.slug}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#0b0f18]">
          <CardHeader><CardTitle className="text-white">{form.id ? 'Edit Page' : 'Create Page'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label className="text-slate-300">Title</Label><Input value={form.title} onChange={(e) => update('title', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Slug</Label><Input value={form.slug} onChange={(e) => update('slug', slugify(e.target.value))} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2 md:col-span-2"><Label className="text-slate-300">Headline</Label><Input value={form.headline} onChange={(e) => update('headline', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2 md:col-span-2"><Label className="text-slate-300">Subheadline</Label><Textarea value={form.subheadline} onChange={(e) => update('subheadline', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2 md:col-span-2"><Label className="text-slate-300">Offer</Label><Textarea value={form.offer} onChange={(e) => update('offer', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">CTA Label</Label><Input value={form.cta_label} onChange={(e) => update('cta_label', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">CTA URL</Label><Input value={form.cta_url} onChange={(e) => update('cta_url', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Meta Title</Label><Input value={form.meta_title} onChange={(e) => update('meta_title', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Meta Description</Label><Input value={form.meta_description} onChange={(e) => update('meta_description', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2 md:col-span-2"><Label className="text-slate-300">Sections</Label><Textarea value={form.sections} onChange={(e) => update('sections', e.target.value)} className="min-h-[220px] border-white/10 bg-white/5 text-white" placeholder="Each paragraph becomes a section" /></div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button onClick={() => save('draft')} variant="outline" className="border-white/10 bg-white/[0.03] text-white"><Save className="mr-2 h-4 w-4" />Save Draft</Button>
              <Button onClick={() => save('published')} className="bg-cyan-500 text-white hover:bg-cyan-400"><Eye className="mr-2 h-4 w-4" />Publish</Button>
              {form.slug && <Button onClick={copyUrl} variant="outline" className="border-white/10 bg-white/[0.03] text-white"><Copy className="mr-2 h-4 w-4" />Copy URL</Button>}
              {form.id && <Button onClick={remove} variant="outline" className="border-red-500/20 bg-red-500/10 text-red-200"><Trash2 className="mr-2 h-4 w-4" />Delete</Button>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
