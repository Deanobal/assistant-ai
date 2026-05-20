import { useEffect, useState } from 'react';
import { ClipboardList, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const blank = { id: '', form_name: '', form_key: '', title: '', description: '', submit_label: 'Submit', success_message: 'Thanks. We will be in touch shortly.', route_to: 'lead_dashboard', notification_group: 'sales', fields: '', status: 'draft' };

function keyify(value) {
  return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 80);
}

function fieldsToText(fields) {
  return Array.isArray(fields) ? fields.map((field) => `${field.label || field.key}|${field.type || 'text'}|${field.required ? 'required' : 'optional'}`).join('\n') : '';
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

export default function FormBuilder() {
  const [forms, setForms] = useState([]);
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState('');

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
      const res = await fetch('/api/lead-forms', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, status }),
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">Lead Capture</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Form Builder</h1>
          <p className="mt-2 text-sm text-slate-400">Manage lead forms, fields, routing and notification groups.</p>
        </div>
        <Button onClick={() => setForm(blank)} className="bg-cyan-500 text-white hover:bg-cyan-400"><Plus className="mr-2 h-4 w-4" />New Form</Button>
      </div>

      {message && <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">{message}</div>}

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <Card className="border-white/10 bg-[#0b0f18]">
          <CardHeader><CardTitle className="text-white">Forms</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {forms.length === 0 ? <p className="text-sm text-slate-500">No forms yet.</p> : null}
            {forms.map((item) => (
              <button key={item.id} onClick={() => setForm(toForm(item))} className="w-full rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left hover:border-cyan-400/30">
                <div className="text-xs uppercase tracking-wide text-cyan-300">{item.form_key} / {item.status}</div>
                <div className="mt-1 font-semibold text-white">{item.form_name}</div>
                <div className="mt-1 text-sm text-slate-400">{item.title}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#0b0f18]">
          <CardHeader><CardTitle className="text-white">{form.id ? 'Edit Form' : 'Create Form'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label className="text-slate-300">Form Name</Label><Input value={form.form_name} onChange={(e) => update('form_name', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Form Key</Label><Input value={form.form_key} onChange={(e) => update('form_key', keyify(e.target.value))} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2 md:col-span-2"><Label className="text-slate-300">Title</Label><Input value={form.title} onChange={(e) => update('title', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2 md:col-span-2"><Label className="text-slate-300">Description</Label><Textarea value={form.description} onChange={(e) => update('description', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Submit Label</Label><Input value={form.submit_label} onChange={(e) => update('submit_label', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Route To</Label><Input value={form.route_to} onChange={(e) => update('route_to', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Notification Group</Label><Input value={form.notification_group} onChange={(e) => update('notification_group', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Success Message</Label><Input value={form.success_message} onChange={(e) => update('success_message', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2 md:col-span-2"><Label className="text-slate-300">Fields</Label><Textarea value={form.fields} onChange={(e) => update('fields', e.target.value)} className="min-h-[220px] border-white/10 bg-white/5 font-mono text-sm text-white" placeholder="Name|text|required&#10;Email|email|required&#10;Phone|tel|required&#10;Message|textarea|optional" /></div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button onClick={() => save('draft')} variant="outline" className="border-white/10 bg-white/[0.03] text-white"><Save className="mr-2 h-4 w-4" />Save Draft</Button>
              <Button onClick={() => save('active')} className="bg-cyan-500 text-white hover:bg-cyan-400"><ClipboardList className="mr-2 h-4 w-4" />Activate</Button>
              {form.id && <Button onClick={remove} variant="outline" className="border-red-500/20 bg-red-500/10 text-red-200"><Trash2 className="mr-2 h-4 w-4" />Delete</Button>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
