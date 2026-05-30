import { useEffect, useMemo, useState } from 'react';
import { Globe, Plus, Save, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const blank = { id: '', setting_key: '', setting_label: '', setting_value: '', setting_group: 'general', is_public: false };

const presets = [
  ['business_name', 'Business Name', 'brand', 'AssistantAI'],
  ['primary_cta_label', 'Primary CTA Label', 'conversion', 'Get Started Now'],
  ['primary_cta_url', 'Primary CTA URL', 'conversion', '/GetStartedNow'],
  ['support_email', 'Support Email', 'contact', 'support@assistantai.com.au'],
  ['homepage_hero_headline', 'Homepage Hero Headline', 'homepage', 'Turn Missed Calls Into Paid Clients'],
  ['homepage_hero_subheadline', 'Homepage Hero Subheadline', 'homepage', 'AssistantAI answers, qualifies and follows up with new enquiries 24/7.'],
  ['trust_chips', 'Trust Chips', 'homepage', 'Call answered, Lead qualified, Secure signup, Setup underway'],
];

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

function presetToForm([key, label, group, value]) {
  return { id: '', setting_key: key, setting_label: label, setting_group: group, setting_value: value, is_public: true };
}

export default function SiteSettings() {
  const [settings, setSettings] = useState([]);
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState('');

  const groupedSettings = useMemo(() => {
    return settings.reduce((acc, item) => {
      const group = item.setting_group || 'general';
      acc[group] = acc[group] || [];
      acc[group].push(item);
      return acc;
    }, {});
  }, [settings]);

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
      if (!form.setting_key || !form.setting_label) throw new Error('Setting key and label are required.');
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
    <div className="space-y-6 text-slate-950">
      <div className="admin-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="admin-kicker">Site Control</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">Site Settings</h1>
            <p className="admin-muted mt-2 max-w-3xl text-sm">Manage reusable website values: brand details, CTAs, support contacts, homepage copy and conversion copy. Use presets to create common settings quickly.</p>
          </div>
          <Button onClick={() => setForm(blank)} className="bg-slate-900 text-white hover:bg-slate-800"><Plus className="mr-2 h-4 w-4" />New Setting</Button>
        </div>
      </div>

      {message && <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">{message}</div>}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><Settings className="mb-3 h-5 w-5 text-slate-700" /><p className="text-sm text-slate-500">Total Settings</p><p className="mt-1 text-3xl font-bold text-slate-950">{settings.length}</p></div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><Globe className="mb-3 h-5 w-5 text-slate-700" /><p className="text-sm text-slate-500">Groups</p><p className="mt-1 text-3xl font-bold text-slate-950">{Object.keys(groupedSettings).length}</p></div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><Save className="mb-3 h-5 w-5 text-slate-700" /><p className="text-sm text-slate-500">Selected</p><p className="mt-1 truncate text-lg font-bold text-slate-950">{form.setting_label || 'None selected'}</p></div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader><CardTitle className="text-slate-950">Settings</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              {settings.length === 0 ? <p className="text-sm text-slate-500">No settings yet. Start with a preset below.</p> : null}
              {Object.entries(groupedSettings).map(([group, items]) => (
                <div key={group}>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{group}</p>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <button key={item.id} onClick={() => setForm(toForm(item))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-slate-300 hover:bg-white hover:shadow-sm">
                        <div className="font-semibold text-slate-950">{item.setting_label}</div>
                        <div className="mt-1 text-xs text-slate-500">{item.setting_key}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader><CardTitle className="text-slate-950">Quick Presets</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {presets.map((preset) => (
                <button key={preset[0]} onClick={() => setForm(presetToForm(preset))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  {preset[1]}
                  <span className="ml-2 text-xs font-normal text-slate-400">{preset[2]}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 2xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader><CardTitle className="text-slate-950">{form.id ? 'Edit Setting' : 'Create Setting'}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label className="text-slate-700">Key</Label><Input value={form.setting_key} onChange={(e) => update('setting_key', e.target.value)} className="border-slate-200 bg-white text-slate-950" placeholder="homepage_hero_headline" /></div>
                <div className="space-y-2"><Label className="text-slate-700">Label</Label><Input value={form.setting_label} onChange={(e) => update('setting_label', e.target.value)} className="border-slate-200 bg-white text-slate-950" placeholder="Homepage Hero Headline" /></div>
                <div className="space-y-2"><Label className="text-slate-700">Group</Label><Input value={form.setting_group} onChange={(e) => update('setting_group', e.target.value)} className="border-slate-200 bg-white text-slate-950" placeholder="homepage" /></div>
                <div className="space-y-2"><Label className="text-slate-700">Visibility</Label><select value={form.is_public ? 'true' : 'false'} onChange={(e) => update('is_public', e.target.value === 'true')} className="min-h-[42px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800"><option value="false">Admin/internal</option><option value="true">Website-facing</option></select></div>
                <div className="space-y-2 md:col-span-2"><Label className="text-slate-700">Value</Label><Textarea value={form.setting_value} onChange={(e) => update('setting_value', e.target.value)} className="min-h-[180px] border-slate-200 bg-slate-50 text-slate-950" /></div>
              </div>
              <Button onClick={save} className="bg-slate-900 text-white hover:bg-slate-800"><Save className="mr-2 h-4 w-4" />Save Setting</Button>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader><CardTitle className="text-slate-950">Preview</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">{form.setting_group || 'general'}</p>
                <h2 className="mt-3 text-2xl font-bold">{form.setting_label || 'Setting label'}</h2>
                <p className="mt-2 break-all text-sm text-slate-400">{form.setting_key || 'setting_key'}</p>
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm leading-relaxed text-slate-200">{form.setting_value || 'Setting value preview'}</div>
                <div className="mt-4"><span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">{form.is_public ? 'Website-facing' : 'Admin/internal'}</span></div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Use consistent keys so public pages and admin modules can reuse these settings without editing code.</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
