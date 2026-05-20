import { useEffect, useState } from 'react';
import { Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const blank = { id: '', setting_key: '', setting_label: '', setting_value: '', setting_group: 'general', is_public: false };

function toForm(item) {
  return {
    id: item.id || '',
    setting_key: item.setting_key || '',
    setting_label: item.setting_label || '',
    setting_value: item.setting_value || '',
    setting_group: item.setting_group || 'general',
    is_public: Boolean(item.is_public),
  };
}

export default function SiteSettings() {
  const [settings, setSettings] = useState([]);
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState('');

  async function loadSettings() {
    try {
      const res = await fetch('/api/site-settings');
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Could not load settings');
      setSettings(data.settings || []);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => { loadSettings(); }, []);

  async function save() {
    try {
      const res = await fetch('/api/site-settings', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Could not save setting');
      setForm(toForm(data.setting));
      setMessage('Setting saved.');
      await loadSettings();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">Site Control</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Site Settings</h1>
          <p className="mt-2 text-sm text-slate-400">Manage global business, contact, CTA and marketing settings.</p>
        </div>
        <Button onClick={() => setForm(blank)} className="bg-cyan-500 text-white hover:bg-cyan-400"><Plus className="mr-2 h-4 w-4" />New Setting</Button>
      </div>

      {message && <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">{message}</div>}

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card className="border-white/10 bg-[#0b0f18]">
          <CardHeader><CardTitle className="text-white">Settings</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {settings.length === 0 ? <p className="text-sm text-slate-500">No settings yet.</p> : null}
            {settings.map((item) => (
              <button key={item.id} onClick={() => setForm(toForm(item))} className="w-full rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left hover:border-cyan-400/30">
                <div className="text-xs uppercase tracking-wide text-cyan-300">{item.setting_group}</div>
                <div className="mt-1 font-semibold text-white">{item.setting_label}</div>
                <div className="mt-1 text-xs text-slate-500">{item.setting_key}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#0b0f18]">
          <CardHeader><CardTitle className="text-white">{form.id ? 'Edit Setting' : 'Create Setting'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label className="text-slate-300">Key</Label><Input value={form.setting_key} onChange={(e) => update('setting_key', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Label</Label><Input value={form.setting_label} onChange={(e) => update('setting_label', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Group</Label><Input value={form.setting_group} onChange={(e) => update('setting_group', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Value</Label><Input value={form.setting_value} onChange={(e) => update('setting_value', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
            </div>
            <Button onClick={save} className="bg-cyan-500 text-white hover:bg-cyan-400"><Save className="mr-2 h-4 w-4" />Save Setting</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
