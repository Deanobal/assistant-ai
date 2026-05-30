import { useEffect, useMemo, useState } from 'react';
import { FileText, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const blank = {
  id: '', page_key: 'home', section_key: '', label: '', content_type: 'text', value: '', status: 'active', sort_order: 0
};

const pageOptions = ['home', 'services', 'pricing', 'about', 'contact', 'platform', 'integrations'];
const contentTypes = ['text', 'headline', 'subheadline', 'cta', 'faq', 'proof', 'image_url', 'html_note'];
const blockPresets = [
  { page_key: 'home', section_key: 'hero_headline', label: 'Homepage Hero Headline', content_type: 'headline', value: 'Turn Missed Calls Into Paid Clients', sort_order: 10 },
  { page_key: 'home', section_key: 'hero_subheadline', label: 'Homepage Hero Subheadline', content_type: 'subheadline', value: 'AssistantAI answers, qualifies and follows up with new enquiries 24/7.', sort_order: 20 },
  { page_key: 'home', section_key: 'primary_cta', label: 'Primary CTA Text', content_type: 'cta', value: 'Get Started Now', sort_order: 30 },
  { page_key: 'pricing', section_key: 'pricing_note', label: 'Pricing Note', content_type: 'text', value: 'Choose the AI receptionist package that matches your lead volume and operational complexity.', sort_order: 10 },
  { page_key: 'services', section_key: 'service_intro', label: 'Services Intro', content_type: 'text', value: 'AI call answering, lead qualification, follow-up automation and secure client onboarding.', sort_order: 10 },
  { page_key: 'contact', section_key: 'contact_intro', label: 'Contact Intro', content_type: 'text', value: 'Speak with AssistantAI and see how the system handles real enquiries.', sort_order: 10 },
];

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

function presetToForm(preset) {
  return { ...blank, ...preset, status: 'active' };
}

function statusClass(status) {
  if (status === 'active') return 'bg-emerald-50 text-emerald-700';
  if (status === 'draft') return 'bg-amber-50 text-amber-700';
  return 'bg-slate-100 text-slate-600';
}

export default function ContentManager() {
  const [blocks, setBlocks] = useState([]);
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [pageFilter, setPageFilter] = useState('');

  const groupedBlocks = useMemo(() => blocks.reduce((acc, block) => {
    const page = block.page_key || 'home';
    acc[page] = acc[page] || [];
    acc[page].push(block);
    acc[page].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    return acc;
  }, {}), [blocks]);

  const activeBlocks = blocks.filter((block) => block.status === 'active').length;
  const draftBlocks = blocks.filter((block) => block.status === 'draft').length;

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
      if (!form.page_key || !form.section_key || !form.label) throw new Error('Page key, section key and label are required.');
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
    <div className="space-y-6 text-slate-950">
      <div className="admin-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="admin-kicker">Website CMS</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">Content Manager</h1>
            <p className="admin-muted mt-2 max-w-3xl text-sm">Create editable website copy blocks for homepage, pricing, services and platform pages. Use stable page and section keys so public pages can render blocks without code changes.</p>
          </div>
          <Button onClick={() => setForm(blank)} className="bg-slate-900 text-white hover:bg-slate-800"><Plus className="mr-2 h-4 w-4" />New Block</Button>
        </div>
      </div>

      {message && <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">{message}</div>}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><FileText className="mb-3 h-5 w-5 text-slate-700" /><p className="text-sm text-slate-500">Total Blocks</p><p className="mt-1 text-3xl font-bold text-slate-950">{blocks.length}</p></div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><FileText className="mb-3 h-5 w-5 text-emerald-700" /><p className="text-sm text-slate-500">Active</p><p className="mt-1 text-3xl font-bold text-slate-950">{activeBlocks}</p></div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><FileText className="mb-3 h-5 w-5 text-amber-700" /><p className="text-sm text-slate-500">Drafts</p><p className="mt-1 text-3xl font-bold text-slate-950">{draftBlocks}</p></div>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={!pageFilter ? 'default' : 'outline'} onClick={() => applyFilter('')} className={!pageFilter ? 'bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700'}>All</Button>
        {pageOptions.map((page) => (
          <Button key={page} size="sm" variant={pageFilter === page ? 'default' : 'outline'} onClick={() => applyFilter(page)} className={`capitalize ${pageFilter === page ? 'bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700'}`}>{page}</Button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[390px_1fr]">
        <div className="space-y-6">
          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader><CardTitle className="text-slate-950">Content Blocks</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {loading ? <div className="flex items-center gap-2 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />Loading...</div> : null}
              {!loading && blocks.length === 0 ? <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No content blocks yet. Use a preset below or create one manually.</p> : null}
              {Object.entries(groupedBlocks).map(([page, items]) => (
                <div key={page}>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{page}</p>
                  <div className="space-y-2">
                    {items.map((block) => (
                      <button key={block.id} onClick={() => setForm(toForm(block))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-slate-300 hover:bg-white hover:shadow-sm">
                        <div className="mb-1 flex items-center justify-between gap-3"><span className="text-xs font-bold uppercase tracking-wide text-slate-500">{block.section_key}</span><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusClass(block.status)}`}>{block.status}</span></div>
                        <div className="font-semibold text-slate-950">{block.label}</div>
                        <div className="mt-1 line-clamp-2 text-xs text-slate-500">{block.value}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader><CardTitle className="text-slate-950">Common Blocks</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {blockPresets.map((preset) => (
                <button key={`${preset.page_key}-${preset.section_key}`} onClick={() => setForm(presetToForm(preset))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  {preset.label}
                  <span className="ml-2 text-xs font-normal text-slate-400">{preset.page_key}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 2xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader><CardTitle className="text-slate-950">{form.id ? 'Edit Block' : 'Create Block'}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label className="text-slate-700">Page Key</Label><select value={form.page_key} onChange={(e) => update('page_key', e.target.value)} className="min-h-[42px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800">{pageOptions.map((page) => <option key={page} value={page}>{page}</option>)}</select></div>
                <div className="space-y-2"><Label className="text-slate-700">Section Key</Label><Input value={form.section_key} onChange={(e) => update('section_key', e.target.value)} className="border-slate-200 bg-white text-slate-950" placeholder="hero_headline" /></div>
                <div className="space-y-2"><Label className="text-slate-700">Label</Label><Input value={form.label} onChange={(e) => update('label', e.target.value)} className="border-slate-200 bg-white text-slate-950" placeholder="Homepage Hero Headline" /></div>
                <div className="space-y-2"><Label className="text-slate-700">Sort Order</Label><Input type="number" value={form.sort_order} onChange={(e) => update('sort_order', Number(e.target.value))} className="border-slate-200 bg-white text-slate-950" /></div>
                <div className="space-y-2"><Label className="text-slate-700">Content Type</Label><select value={form.content_type} onChange={(e) => update('content_type', e.target.value)} className="min-h-[42px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800">{contentTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></div>
                <div className="space-y-2"><Label className="text-slate-700">Status</Label><select value={form.status} onChange={(e) => update('status', e.target.value)} className="min-h-[42px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800"><option value="active">active</option><option value="draft">draft</option><option value="archived">archived</option></select></div>
                <div className="space-y-2 md:col-span-2"><Label className="text-slate-700">Value</Label><Textarea value={form.value} onChange={(e) => update('value', e.target.value)} className="min-h-[260px] border-slate-200 bg-slate-50 text-slate-950" /></div>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button disabled={saving} onClick={saveBlock} className="bg-slate-900 text-white hover:bg-slate-800"><Save className="mr-2 h-4 w-4" />Save Block</Button>
                {form.id && <Button disabled={saving} onClick={deleteBlock} variant="outline" className="border-red-200 bg-red-50 text-red-700"><Trash2 className="mr-2 h-4 w-4" />Delete</Button>}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader><CardTitle className="text-slate-950">Block Preview</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white">
                <div className="flex flex-wrap gap-2"><span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-200">{form.page_key || 'page'}</span><span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">{form.content_type}</span><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(form.status)}`}>{form.status}</span></div>
                <h2 className="mt-5 text-2xl font-bold">{form.label || 'Block label'}</h2>
                <p className="mt-2 break-all text-sm text-slate-400">{form.section_key || 'section_key'} · sort {form.sort_order || 0}</p>
                <div className="mt-5 whitespace-pre-wrap rounded-2xl border border-white/10 bg-white/10 p-4 text-sm leading-relaxed text-slate-200">{form.value || 'Block value preview'}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Keep section keys stable. Public pages can use page_key + section_key to render editable content without changing code.</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
