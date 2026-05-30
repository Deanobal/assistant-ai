import { useEffect, useMemo, useState } from 'react';
import { Copy, Plus, Save, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const TEMPLATE_TYPES = {
  google_search_ad: {
    label: 'Google Search Ad',
    channel: 'Google Ads',
    objective: 'capture high-intent leads searching for AI receptionist solutions',
    title: 'Google Search Ad - Missed Calls',
    build: (form) => `Headline 1: Stop Missing Business Calls
Headline 2: AI Receptionist For ${form.target_audience || 'Australian Businesses'}
Headline 3: Capture More Leads 24/7

Description 1: AssistantAI answers missed calls, qualifies enquiries and follows up so more leads become paying clients.
Description 2: Built for Australian service businesses. Fast setup, secure onboarding and live admin visibility.

Sitelinks:
- Pricing: /Pricing
- AI Demo: /AIDemo
- Case Studies: /CaseStudies
- Contact: /Contact

Keywords:
${form.keywords || 'AI receptionist, missed calls, lead capture, phone answering service'}

CTA: Book a strategy call or start onboarding now.`,
  },
  meta_ad: {
    label: 'Facebook / Instagram Ad',
    channel: 'Meta Ads',
    objective: 'generate curiosity and qualified inbound enquiries',
    title: 'Meta Ad - Missed Calls Into Paid Clients',
    build: (form) => `Primary Text:
How many jobs are you losing because no one answered the phone?

AssistantAI answers calls, qualifies leads and follows up automatically so your business captures more opportunities without hiring another receptionist.

Built for ${form.target_audience || 'Australian service businesses'}.

Headline:
Turn Missed Calls Into Paid Clients

Description:
AI receptionist + sales automation, running 24/7.

Creative Direction:
Premium dark background, glowing AI brain, clear business outcome, strong CTA button.

CTA:
Get Started Now

Audience:
${form.target_audience || 'Australian service businesses'}

Notes:
${form.prompt || 'Use direct, commercial language. Focus on revenue lost from missed calls.'}`,
  },
  linkedin_ad: {
    label: 'LinkedIn Ad',
    channel: 'LinkedIn',
    objective: 'position AssistantAI as a serious operational upgrade',
    title: 'LinkedIn Ad - AI Operations Upgrade',
    build: (form) => `Post Copy:
Missed calls are not an admin problem. They are a revenue leak.

AssistantAI gives service businesses an AI receptionist that answers, qualifies and follows up with leads 24/7 — backed by onboarding, integrations and admin visibility.

For ${form.target_audience || 'Australian service businesses'}, this means faster response times, fewer lost leads and a more scalable front office.

Key outcomes:
- Calls answered when staff are unavailable
- Leads qualified before human follow-up
- Secure setup and onboarding flow
- Sales automation connected to the business process

CTA:
See how AssistantAI works.

Keywords:
${form.keywords || 'AI receptionist, sales automation, service business growth'}`,
  },
  email_campaign: {
    label: 'Email Campaign',
    channel: 'Email',
    objective: 'convert warm leads into booked calls',
    title: 'Email Campaign - Missed Call Revenue Leak',
    build: (form) => `Subject: How many leads did you miss this week?
Preview: AssistantAI answers, qualifies and follows up 24/7.

Hi {{first_name}},

Most businesses do not lose leads because the offer is weak. They lose them because no one responded fast enough.

AssistantAI acts as your AI receptionist and front-line sales assistant. It can answer enquiries, qualify the caller, collect key details and trigger the next step — even when your team is busy or closed.

For ${form.target_audience || 'Australian service businesses'}, that means:

- fewer missed calls
- faster lead response
- better qualification
- cleaner handover to your team
- more opportunities turning into paid work

If you want to see how it would work for your business, start here:

{{cta_url}}

Regards,
AssistantAI

CTA Button: Get Started Now`,
  },
  landing_page_hero: {
    label: 'Landing Page Hero',
    channel: 'Website',
    objective: 'increase landing page conversion',
    title: 'Landing Page Hero - AI Receptionist',
    build: (form) => `Badge:
AI Receptionist + Sales Automation for Australian Businesses

Headline:
Turn Missed Calls Into Paid Clients

Subheadline:
AssistantAI answers, qualifies and follows up with new enquiries 24/7 — so more leads become paying clients instead of disappearing.

Primary CTA:
Talk To Our AI Receptionist

Secondary CTA:
Get Started Now

Trust Chips:
- Call answered
- Enquiry qualified
- Plan selected
- Secure signup
- Setup underway

Hero Visual Direction:
Premium dark SaaS interface, glowing AI brain, workflow panel showing: Call answered → Lead qualified → Payment secured.

SEO Keywords:
${form.keywords || 'AI receptionist, AI phone answering, sales automation, missed call service'}

Additional Notes:
${form.prompt || 'Keep the page direct, commercial and conversion-focused.'}`,
  },
  blog_outline: {
    label: 'Blog Outline',
    channel: 'Website / SEO',
    objective: 'create SEO content briefs quickly',
    title: 'Blog Outline - Missed Calls',
    build: (form) => `Title:
How Missed Calls Cost Service Businesses Real Revenue

Target Audience:
${form.target_audience || 'Australian service businesses'}

Primary Keywords:
${form.keywords || 'missed calls, AI receptionist, lead response, service business automation'}

Search Intent:
Business owners looking for ways to stop losing leads and improve response speed.

Outline:
1. Introduction: missed calls are a revenue leak
2. Why speed-to-lead matters
3. What happens when calls go unanswered
4. How an AI receptionist changes the workflow
5. Human handover vs full automation
6. Common industries that benefit
7. What to check before implementing AI call handling
8. CTA: test AssistantAI or start onboarding

Internal Links:
- /Services
- /Pricing
- /AIDemo
- /CaseStudies

CTA:
See how AssistantAI can answer and qualify your next enquiry.`,
  },
};

const blank = {
  id: '',
  title: '',
  content_type: 'google_search_ad',
  target_audience: 'Australian service businesses',
  objective: 'generate qualified leads',
  keywords: 'AI receptionist, missed calls, lead capture',
  channel: 'Google Ads',
  prompt: '',
  draft_body: '',
  status: 'draft',
};

function toForm(draft) {
  return {
    id: draft.id || '',
    title: draft.title || '',
    content_type: draft.content_type || 'google_search_ad',
    target_audience: draft.target_audience || '',
    objective: draft.objective || '',
    keywords: Array.isArray(draft.keywords) ? draft.keywords.join(', ') : (draft.keywords || ''),
    channel: draft.channel || 'website',
    prompt: draft.prompt || '',
    draft_body: draft.draft_body || '',
    status: draft.status || 'draft',
  };
}

function normalizeForSave(form) {
  return {
    ...form,
    keywords: form.keywords.split(',').map((item) => item.trim()).filter(Boolean),
    updated_at: new Date().toISOString(),
  };
}

export default function ContentStudio() {
  const [drafts, setDrafts] = useState([]);
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState('');

  const selectedTemplate = useMemo(() => TEMPLATE_TYPES[form.content_type] || TEMPLATE_TYPES.google_search_ad, [form.content_type]);

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
    setForm((current) => {
      if (field === 'content_type') {
        const nextTemplate = TEMPLATE_TYPES[value] || TEMPLATE_TYPES.google_search_ad;
        return {
          ...current,
          content_type: value,
          channel: nextTemplate.channel,
          objective: current.objective || nextTemplate.objective,
          title: current.title || nextTemplate.title,
        };
      }
      return { ...current, [field]: value };
    });
  }

  function generateDraft() {
    const draftBody = selectedTemplate.build(form);
    setForm((current) => ({
      ...current,
      title: current.title || selectedTemplate.title,
      channel: selectedTemplate.channel,
      objective: current.objective || selectedTemplate.objective,
      draft_body: draftBody,
      status: 'draft',
    }));
    setMessage(`${selectedTemplate.label} draft generated from template.`);
  }

  async function saveDraft() {
    try {
      const payload = normalizeForSave(form);
      const res = await fetch('/api/content-drafts', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
    <div className="space-y-6 text-slate-950">
      <div className="admin-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="admin-kicker">Template Content Studio</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">Ads, emails and landing copy</h1>
            <p className="admin-muted mt-2 max-w-3xl text-sm">Generate practical drafts from proven templates. No black-box AI call is required, so this works even when external generation APIs are unavailable.</p>
          </div>
          <Button onClick={() => setForm(blank)} className="bg-slate-900 text-white hover:bg-slate-800"><Plus className="mr-2 h-4 w-4" />New Draft</Button>
        </div>
      </div>

      {message && <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">{message}</div>}

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
          <CardHeader><CardTitle className="text-slate-950">Draft Library</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {drafts.length === 0 ? <p className="text-sm text-slate-500">No drafts yet. Choose a template and generate one.</p> : null}
            {drafts.map((draft) => (
              <button key={draft.id} onClick={() => setForm(toForm(draft))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-slate-300 hover:bg-white hover:shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">{draft.content_type} / {draft.channel}</div>
                <div className="mt-1 font-semibold text-slate-950">{draft.title}</div>
                <div className="mt-1 line-clamp-2 text-xs text-slate-500">{draft.objective}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
          <CardHeader><CardTitle className="text-slate-950">{form.id ? 'Edit Draft' : 'Create Draft'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
              <strong>Selected template:</strong> {selectedTemplate.label}. Use Generate Draft to populate editable copy instantly, then Save when ready.
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-slate-700">Template Type</Label>
                <select value={form.content_type} onChange={(e) => update('content_type', e.target.value)} className="min-h-[42px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-slate-900/10">
                  {Object.entries(TEMPLATE_TYPES).map(([value, template]) => <option key={value} value={value}>{template.label}</option>)}
                </select>
              </div>
              <div className="space-y-2"><Label className="text-slate-700">Title</Label><Input value={form.title} onChange={(e) => update('title', e.target.value)} className="border-slate-200 bg-white text-slate-950" /></div>
              <div className="space-y-2"><Label className="text-slate-700">Audience</Label><Input value={form.target_audience} onChange={(e) => update('target_audience', e.target.value)} className="border-slate-200 bg-white text-slate-950" /></div>
              <div className="space-y-2"><Label className="text-slate-700">Objective</Label><Input value={form.objective} onChange={(e) => update('objective', e.target.value)} className="border-slate-200 bg-white text-slate-950" /></div>
              <div className="space-y-2"><Label className="text-slate-700">Keywords</Label><Input value={form.keywords} onChange={(e) => update('keywords', e.target.value)} className="border-slate-200 bg-white text-slate-950" /></div>
              <div className="space-y-2"><Label className="text-slate-700">Channel</Label><Input value={form.channel} onChange={(e) => update('channel', e.target.value)} className="border-slate-200 bg-white text-slate-950" /></div>
              <div className="space-y-2 md:col-span-2"><Label className="text-slate-700">Extra Prompt / Notes</Label><Textarea value={form.prompt} onChange={(e) => update('prompt', e.target.value)} className="border-slate-200 bg-white text-slate-950" /></div>
              <div className="space-y-2 md:col-span-2"><Label className="text-slate-700">Draft Body</Label><Textarea value={form.draft_body} onChange={(e) => update('draft_body', e.target.value)} className="min-h-[420px] border-slate-200 bg-slate-50 font-mono text-sm text-slate-950" /></div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button onClick={generateDraft} className="bg-slate-900 text-white hover:bg-slate-800"><Sparkles className="mr-2 h-4 w-4" />Generate From Template</Button>
              <Button onClick={saveDraft} variant="outline" className="border-slate-200 bg-white text-slate-700"><Save className="mr-2 h-4 w-4" />Save</Button>
              {form.draft_body && <Button onClick={copyDraft} variant="outline" className="border-slate-200 bg-white text-slate-700"><Copy className="mr-2 h-4 w-4" />Copy</Button>}
              {form.id && <Button onClick={deleteDraft} variant="outline" className="border-red-200 bg-red-50 text-red-700"><Trash2 className="mr-2 h-4 w-4" />Delete</Button>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
