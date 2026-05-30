import { useEffect, useMemo, useState } from 'react';
import { Copy, Eye, Image, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const blank = {
  id: '',
  title: '',
  slug: '',
  badge: 'AI Receptionist + Sales Automation',
  headline: '',
  subheadline: '',
  offer: '',
  hero_image_url: '',
  secondary_image_url: '',
  trust_chips: 'Call answered, Enquiry qualified, Secure signup, Setup underway',
  cta_label: 'Get Started',
  cta_url: '/GetStartedNow',
  meta_title: '',
  meta_description: '',
  sections: '',
  status: 'draft',
};

function slugify(value) {
  return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);
}

function sectionText(sections) {
  if (Array.isArray(sections)) return sections.map((s) => s.body || s.title || '').join('\n\n');
  return sections || '';
}

function findField(page, keys, fallback = '') {
  for (const key of keys) {
    if (page?.[key]) return page[key];
  }
  return fallback;
}

function toForm(page) {
  return {
    id: page.id || '',
    title: page.title || '',
    slug: page.slug || '',
    badge: page.badge || page.eyebrow || 'AI Receptionist + Sales Automation',
    headline: page.headline || '',
    subheadline: page.subheadline || '',
    offer: page.offer || '',
    hero_image_url: findField(page, ['hero_image_url', 'heroImageUrl', 'hero_image', 'image_url']),
    secondary_image_url: findField(page, ['secondary_image_url', 'secondaryImageUrl', 'secondary_image']),
    trust_chips: Array.isArray(page.trust_chips) ? page.trust_chips.join(', ') : (page.trust_chips || 'Call answered, Enquiry qualified, Secure signup, Setup underway'),
    cta_label: page.cta_label || 'Get Started',
    cta_url: page.cta_url || '/GetStartedNow',
    meta_title: page.meta_title || '',
    meta_description: page.meta_description || '',
    sections: sectionText(page.sections),
    status: page.status || 'draft',
  };
}

function buildSections(text) {
  return String(text || '').split('\n').map((x) => x.trim()).filter(Boolean).map((body, index) => ({ title: index === 0 ? 'Overview' : '', body }));
}

function buildPayload(form, status) {
  return {
    ...form,
    status,
    heroImageUrl: form.hero_image_url,
    secondaryImageUrl: form.secondary_image_url,
    hero_image_url: form.hero_image_url,
    secondary_image_url: form.secondary_image_url,
    trust_chips: form.trust_chips.split(',').map((item) => item.trim()).filter(Boolean),
    sections: buildSections(form.sections),
    updated_at: new Date().toISOString(),
  };
}

function LandingPreview({ form }) {
  const chips = form.trust_chips.split(',').map((item) => item.trim()).filter(Boolean);
  const sections = buildSections(form.sections);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 text-white shadow-sm">
      <div className="relative p-6 md:p-8">
        <div className="absolute right-0 top-0 h-64 w-64 translate-x-20 -translate-y-20 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            {form.badge && <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-bold text-cyan-200">{form.badge}</div>}
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">{form.headline || 'Landing page headline preview'}</h2>
            <p className="mt-4 text-base leading-relaxed text-slate-300">{form.subheadline || 'Your subheadline will appear here. Keep it clear, commercial and outcome-focused.'}</p>
            {form.offer && <div className="mt-5 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-slate-200">{form.offer}</div>}
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={form.cta_url || '#'} className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950">{form.cta_label || 'Get Started'}</a>
              {form.slug && <a href={`/lp/${form.slug}`} className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white">Preview URL</a>}
            </div>
            {chips.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{chips.map((chip) => <span key={chip} className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">{chip}</span>)}</div>}
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-3">
            {form.hero_image_url ? (
              <img src={form.hero_image_url} alt="Landing page hero preview" className="h-[320px] w-full rounded-2xl object-cover" />
            ) : (
              <div className="flex h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-slate-900 text-center text-slate-400">
                <Image className="mb-3 h-10 w-10" />
                Hero image preview
              </div>
            )}
          </div>
        </div>
      </div>

      {form.secondary_image_url && <div className="border-t border-white/10 p-6 md:p-8"><img src={form.secondary_image_url} alt="Secondary landing page preview" className="max-h-[260px] w-full rounded-3xl object-cover" /></div>}

      {sections.length > 0 && (
        <div className="border-t border-white/10 bg-white/[0.03] p-6 md:p-8">
          <div className="grid gap-4 md:grid-cols-2">
            {sections.slice(0, 4).map((section, index) => (
              <div key={`${section.body}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">Section {index + 1}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{section.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LandingPageBuilder() {
  const [pages, setPages] = useState([]);
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState('');
  const pageUrl = useMemo(() => form.slug ? `${window.location.origin}/lp/${form.slug}` : '', [form.slug]);

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
      const payload = buildPayload(form, status);
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
    if (!pageUrl) return;
    await navigator.clipboard.writeText(pageUrl);
    setMessage('Landing page URL copied.');
  }

  return (
    <div className="space-y-6 text-slate-950">
      <div className="admin-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="admin-kicker">Campaign Pages</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">Landing Page Builder</h1>
            <p className="admin-muted mt-2 max-w-3xl text-sm">Create offer pages with images, trust chips, SEO metadata and live preview. This is now a what-you-see-is-what-you-edit workflow.</p>
          </div>
          <Button onClick={() => setForm(blank)} className="bg-slate-900 text-white hover:bg-slate-800"><Plus className="mr-2 h-4 w-4" />New Page</Button>
        </div>
      </div>

      {message && <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">{message}</div>}

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
          <CardHeader><CardTitle className="text-slate-950">Pages</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {pages.length === 0 ? <p className="text-sm text-slate-500">No landing pages yet.</p> : null}
            {pages.map((page) => (
              <button key={page.id} onClick={() => setForm(toForm(page))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-slate-300 hover:bg-white hover:shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">{page.status}</div>
                <div className="mt-1 font-semibold text-slate-950">{page.title}</div>
                <div className="mt-1 text-xs text-slate-500">/lp/{page.slug}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6 2xl:grid-cols-[0.9fr_1.1fr]">
          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader><CardTitle className="text-slate-950">{form.id ? 'Edit Page' : 'Create Page'}</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label className="text-slate-700">Title</Label><Input value={form.title} onChange={(e) => update('title', e.target.value)} className="border-slate-200 bg-white text-slate-950" /></div>
                <div className="space-y-2"><Label className="text-slate-700">Slug</Label><Input value={form.slug} onChange={(e) => update('slug', slugify(e.target.value))} className="border-slate-200 bg-white text-slate-950" /></div>
                <div className="space-y-2 md:col-span-2"><Label className="text-slate-700">Badge</Label><Input value={form.badge} onChange={(e) => update('badge', e.target.value)} className="border-slate-200 bg-white text-slate-950" /></div>
                <div className="space-y-2 md:col-span-2"><Label className="text-slate-700">Headline</Label><Input value={form.headline} onChange={(e) => update('headline', e.target.value)} className="border-slate-200 bg-white text-slate-950" /></div>
                <div className="space-y-2 md:col-span-2"><Label className="text-slate-700">Subheadline</Label><Textarea value={form.subheadline} onChange={(e) => update('subheadline', e.target.value)} className="border-slate-200 bg-white text-slate-950" /></div>
                <div className="space-y-2 md:col-span-2"><Label className="text-slate-700">Offer</Label><Textarea value={form.offer} onChange={(e) => update('offer', e.target.value)} className="border-slate-200 bg-white text-slate-950" /></div>
                <div className="space-y-2 md:col-span-2"><Label className="text-slate-700">Hero Image URL</Label><Input value={form.hero_image_url} onChange={(e) => update('hero_image_url', e.target.value)} className="border-slate-200 bg-white text-slate-950" placeholder="https://..." /></div>
                <div className="space-y-2 md:col-span-2"><Label className="text-slate-700">Secondary Image URL</Label><Input value={form.secondary_image_url} onChange={(e) => update('secondary_image_url', e.target.value)} className="border-slate-200 bg-white text-slate-950" placeholder="https://..." /></div>
                <div className="space-y-2 md:col-span-2"><Label className="text-slate-700">Trust Chips</Label><Input value={form.trust_chips} onChange={(e) => update('trust_chips', e.target.value)} className="border-slate-200 bg-white text-slate-950" /></div>
                <div className="space-y-2"><Label className="text-slate-700">CTA Label</Label><Input value={form.cta_label} onChange={(e) => update('cta_label', e.target.value)} className="border-slate-200 bg-white text-slate-950" /></div>
                <div className="space-y-2"><Label className="text-slate-700">CTA URL</Label><Input value={form.cta_url} onChange={(e) => update('cta_url', e.target.value)} className="border-slate-200 bg-white text-slate-950" /></div>
                <div className="space-y-2"><Label className="text-slate-700">Meta Title</Label><Input value={form.meta_title} onChange={(e) => update('meta_title', e.target.value)} className="border-slate-200 bg-white text-slate-950" /></div>
                <div className="space-y-2"><Label className="text-slate-700">Meta Description</Label><Input value={form.meta_description} onChange={(e) => update('meta_description', e.target.value)} className="border-slate-200 bg-white text-slate-950" /></div>
                <div className="space-y-2 md:col-span-2"><Label className="text-slate-700">Sections</Label><Textarea value={form.sections} onChange={(e) => update('sections', e.target.value)} className="min-h-[220px] border-slate-200 bg-slate-50 text-slate-950" placeholder="Each paragraph becomes a section" /></div>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button onClick={() => save('draft')} variant="outline" className="border-slate-200 bg-white text-slate-700"><Save className="mr-2 h-4 w-4" />Save Draft</Button>
                <Button onClick={() => save('published')} className="bg-slate-900 text-white hover:bg-slate-800"><Eye className="mr-2 h-4 w-4" />Publish</Button>
                {form.slug && <Button onClick={copyUrl} variant="outline" className="border-slate-200 bg-white text-slate-700"><Copy className="mr-2 h-4 w-4" />Copy URL</Button>}
                {form.id && <Button onClick={remove} variant="outline" className="border-red-200 bg-red-50 text-red-700"><Trash2 className="mr-2 h-4 w-4" />Delete</Button>}
              </div>
              {pageUrl && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">Preview URL: <a href={pageUrl} target="_blank" rel="noreferrer" className="font-semibold text-slate-950 underline">{pageUrl}</a></div>}
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="admin-kicker">Live Preview</p>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{form.status || 'draft'}</span>
            </div>
            <LandingPreview form={form} />
          </div>
        </div>
      </div>
    </div>
  );
}
