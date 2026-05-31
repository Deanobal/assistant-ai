import { useEffect, useMemo, useState } from 'react';
import { ClipboardList, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const blank = { id: '', form_name: '', form_key: '', title: '', description: '', submit_label: 'Submit', success_message: 'Thanks. We will be in touch shortly.', route_to: 'lead_dashboard', notification_group: 'sales', fields: '', status: 'draft' };

const presets = [
  {
    form_name: 'AI Receptionist Lead Form', form_key: 'ai_receptionist_lead', title: 'Start With AssistantAI', description: 'Tell us about your business and we will prepare your AI receptionist setup.', submit_label: 'Start Setup', route_to: 'lead_dashboard', notification_group: 'sales', fields: 'Full Name|text|required\nBusiness Name|text|required\nEmail|email|required\nPhone|tel|required\nWebsite|url|optional\nBusiness Type|text|optional\nMessage|textarea|optional'
  },
  {
    form_name: 'Secure Setup Form', form_key: 'secure_setup', title: 'Secure Setup Details', description: 'Confirm or correct the details captured by the AI assistant.', submit_label: 'Save Setup Details', route_to: 'secure_setup', notification_group: 'operations', fields: 'Full Name|text|required\nMobile|tel|required\nEmail|email|optional\nBusiness Name|text|optional\nBest Time To Call|text|optional\nNotes|textarea|optional'
  },
  {
    form_name: 'Contact Request', form_key: 'contact_request', title: 'Contact AssistantAI', description: 'Send us your details and we will respond shortly.', submit_label: 'Send Enquiry', route_to: 'support_inbox', notification_group: 'support', fields: 'Name|text|required\nEmail|email|required\nPhone|tel|optional\nReason|text|required\nMessage|textarea|required'
  },
  {
    form_name: 'Demo Request', form_key: 'demo_request', title: 'Book an AI Demo', description: 'Request a live walkthrough of the AI receptionist and dashboard.', submit_label: 'Request Demo', route_to: 'lead_dashboard', notification_group: 'sales', fields: 'Name|text|required\nCompany|text|required\nEmail|email|required\nPhone|tel|required\nLead Volume|text|optional\nCurrent Problem|textarea|required'
  },
];

function keyify(value) {
  return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 80);
}

function fieldsToText(fields) {
  return Array.isArray(fields) ? fields.map((field) => `${field.label || field.key}|${field.type || 'text'}|${field.required ? 'required' : 'optional'}`).join('\n') : '';
}

function parseFields(text) {
  return String(text || '').split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
    const [label = '', type = 'text', required = 'optional'] = line.split('|').map((item) => item.trim());
    return { label, key: keyify(label), type, required: required === 'required' };
  });
}

function toForm(form) {
  return {
    id: form.id || '',
    form_name: form.form_name || '',
    form_key: form.form_key || '',
    title: form.title || '',
    description: form.description || '',
    submit_label: form.submit_label || 'Submit',
    success_message: form.success_message || 'Thanks. We will be in touch shortly.',
    route_to: form.route_to || 'lead_dashboard',
    notification_group: form.notification_group || 'sales',
    fields: fieldsToText(form.fields),
    status: form.status || 'draft',
  };
}

function presetToForm(preset) {
  return { ...blank, ...preset, status: 'draft' };
}

function statusClass(status) {
  if (status === 'active') return 'bg-emerald-50 text-emerald-700';
  if (status === 'draft') return 'bg-amber-50 text-amber-700';
  return 'bg-slate-100 text-slate-600';
}

function FieldPreview({ field }) {
  const base = 'min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-400';
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-700">{field.label || 'Untitled field'} {field.required && <span className="text-red-500">*</span>}</label>
      {field.type === 'textarea' ? <div className={`${base} min-h-[88px]`}>Textarea field</div> : <div className={base}>{field.type || 'text'} field</div>}
    </div>
  );
}

export default function FormBuilder() {
  const [forms, setForms] = useState([]);
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState('');

  const parsedFields = useMemo(() => parseFields(form.fields), [form.fields]);
  const activeForms = forms.filter((item) => item.status === 'active').length;

  async function loadForms() {
    try {
      const res = await fetch('/api/lead-forms?includeDrafts=true');
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Could not load forms');
      setForms(data.forms || []);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => { loadForms(); }, []);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value, form_key: field === 'form_name' && !current.id ? keyify(value) : current.form_key }));
  }

  async function save(status) {
    try {
      if (!form.form_name || !form.form_key || !form.title) throw new Error('Form name, form key and title are required.');
      const res = await fetch('/api/lead-forms', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, fields: parsedFields, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Could not save form');
      setForm(toForm(data.form));
      setMessage(status === 'active' ? 'Form activated.' : 'Form saved as draft.');
      await loadForms();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function remove() {
    if (!form.id || !window.confirm('Delete this form?')) return;
    try {
      const res = await fetch(`/api/lead-forms?id=${encodeURIComponent(form.id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Could not delete form');
      setForm(blank);
      setMessage('Form deleted.');
      await loadForms();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="space-y-6 text-slate-950">
      <div className="admin-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="admin-kicker">Lead Capture</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">Form Builder</h1>
            <p className="admin-muted mt-2 max-w-3xl text-sm">Create lead, demo, secure setup and support forms. Define fields in a simple line format and preview exactly what clients will see.</p>
          </div>
          <Button onClick={() => setForm(blank)} className="bg-slate-900 text-white hover:bg-slate-800"><Plus className="mr-2 h-4 w-4" />New Form</Button>
        </div>
      </div>

      {message && <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">{message}</div>}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><ClipboardList className="mb-3 h-5 w-5 text-slate-700" /><p className="text-sm text-slate-500">Total Forms</p><p className="mt-1 text-3xl font-bold text-slate-950">{forms.length}</p></div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><ClipboardList className="mb-3 h-5 w-5 text-emerald-700" /><p className="text-sm text-slate-500">Active Forms</p><p className="mt-1 text-3xl font-bold text-slate-950">{activeForms}</p></div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><ClipboardList className="mb-3 h-5 w-5 text-blue-700" /><p className="text-sm text-slate-500">Selected Fields</p><p className="mt-1 text-3xl font-bold text-slate-950">{parsedFields.length}</p></div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <div className="space-y-6">
          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader><CardTitle className="text-slate-950">Forms</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {forms.length === 0 ? <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No forms yet. Use a preset or create one manually.</p> : null}
              {forms.map((item) => (
                <button key={item.id} onClick={() => setForm(toForm(item))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-slate-300 hover:bg-white hover:shadow-sm">
                  <div className="mb-1 flex items-center justify-between gap-3"><span className="text-xs font-bold uppercase tracking-wide text-slate-500">{item.form_key}</span><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusClass(item.status)}`}>{item.status}</span></div>
                  <div className="font-semibold text-slate-950">{item.form_name}</div>
                  <div className="mt-1 text-sm text-slate-500">{item.title}</div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader><CardTitle className="text-slate-950">Form Presets</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {presets.map((preset) => (
                <button key={preset.form_key} onClick={() => setForm(presetToForm(preset))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  {preset.form_name}
                  <span className="ml-2 text-xs font-normal text-slate-400">{preset.notification_group}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 2xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader><CardTitle className="text-slate-950">{form.id ? 'Edit Form' : 'Create Form'}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">Field format: <strong>Label|type|required</strong>. Supported types include text, email, tel, url and textarea.</div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label className="text-slate-700">Form Name</Label><Input value={form.form_name} onChange={(e) => update('form_name', e.target.value)} className="border-slate-200 bg-white text-slate-950" /></div>
                <div className="space-y-2"><Label className="text-slate-700">Form Key</Label><Input value={form.form_key} onChange={(e) => update('form_key', keyify(e.target.value))} className="border-slate-200 bg-white text-slate-950" /></div>
                <div className="space-y-2 md:col-span-2"><Label className="text-slate-700">Title</Label><Input value={form.title} onChange={(e) => update('title', e.target.value)} className="border-slate-200 bg-white text-slate-950" /></div>
                <div className="space-y-2 md:col-span-2"><Label className="text-slate-700">Description</Label><Textarea value={form.description} onChange={(e) => update('description', e.target.value)} className="border-slate-200 bg-white text-slate-950" /></div>
                <div className="space-y-2"><Label className="text-slate-700">Submit Label</Label><Input value={form.submit_label} onChange={(e) => update('submit_label', e.target.value)} className="border-slate-200 bg-white text-slate-950" /></div>
                <div className="space-y-2"><Label className="text-slate-700">Route To</Label><select value={form.route_to} onChange={(e) => update('route_to', e.target.value)} className="min-h-[42px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800"><option value="lead_dashboard">Lead Dashboard</option><option value="secure_setup">Secure Setup</option><option value="support_inbox">Support Inbox</option><option value="onboarding">Onboarding</option></select></div>
                <div className="space-y-2"><Label className="text-slate-700">Notification Group</Label><select value={form.notification_group} onChange={(e) => update('notification_group', e.target.value)} className="min-h-[42px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800"><option value="sales">Sales</option><option value="operations">Operations</option><option value="support">Support</option><option value="admin">Admin</option></select></div>
                <div className="space-y-2"><Label className="text-slate-700">Success Message</Label><Input value={form.success_message} onChange={(e) => update('success_message', e.target.value)} className="border-slate-200 bg-white text-slate-950" /></div>
                <div className="space-y-2 md:col-span-2"><Label className="text-slate-700">Fields</Label><Textarea value={form.fields} onChange={(e) => update('fields', e.target.value)} className="min-h-[260px] border-slate-200 bg-slate-50 font-mono text-sm text-slate-950" placeholder="Name|text|required&#10;Email|email|required&#10;Phone|tel|required&#10;Message|textarea|optional" /></div>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button onClick={() => save('draft')} variant="outline" className="border-slate-200 bg-white text-slate-700"><Save className="mr-2 h-4 w-4" />Save Draft</Button>
                <Button onClick={() => save('active')} className="bg-slate-900 text-white hover:bg-slate-800"><ClipboardList className="mr-2 h-4 w-4" />Activate</Button>
                {form.id && <Button onClick={remove} variant="outline" className="border-red-200 bg-red-50 text-red-700"><Trash2 className="mr-2 h-4 w-4" />Delete</Button>}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader><CardTitle className="text-slate-950">Live Form Preview</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-4 flex flex-wrap gap-2"><span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">{form.form_key || 'form_key'}</span><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(form.status)}`}>{form.status}</span></div>
                <h2 className="text-2xl font-bold text-slate-950">{form.title || 'Form title'}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{form.description || 'Form description preview.'}</p>
                <div className="mt-5 space-y-4">{parsedFields.length === 0 ? <p className="text-sm text-slate-500">No fields added yet.</p> : parsedFields.map((field) => <FieldPreview key={field.key || field.label} field={field} />)}</div>
                <button className="mt-5 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white">{form.submit_label || 'Submit'}</button>
                <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-800">{form.success_message || 'Success message preview.'}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Routing: <strong>{form.route_to}</strong>. Notifications: <strong>{form.notification_group}</strong>.</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
