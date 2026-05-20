import { useEffect, useState } from 'react';
import { DollarSign, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const blank = { id: '', offer_name: '', slug: '', headline: '', description: '', setup_fee: 0, monthly_fee: 0, currency: 'AUD', billing_cycle: 'monthly', inclusions: '', cta_label: 'Get Started', cta_url: '/GetStartedNow', stripe_price_key: '', sort_order: 0, status: 'draft' };

function slugify(value) {
  return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);
}

function toForm(offer) {
  return {
    id: offer.id || '',
    offer_name: offer.offer_name || '',
    slug: offer.slug || '',
    headline: offer.headline || '',
    description: offer.description || '',
    setup_fee: offer.setup_fee || 0,
    monthly_fee: offer.monthly_fee || 0,
    currency: offer.currency || 'AUD',
    billing_cycle: offer.billing_cycle || 'monthly',
    inclusions: Array.isArray(offer.inclusions) ? offer.inclusions.join('\n') : '',
    cta_label: offer.cta_label || 'Get Started',
    cta_url: offer.cta_url || '/GetStartedNow',
    stripe_price_key: offer.stripe_price_key || '',
    sort_order: offer.sort_order || 0,
    status: offer.status || 'draft',
  };
}

export default function PricingManager() {
  const [offers, setOffers] = useState([]);
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState('');

  async function loadOffers() {
    try {
      const res = await fetch('/api/offers-pricing?includeDrafts=true');
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Could not load offers');
      setOffers(data.offers || []);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => { loadOffers(); }, []);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value, slug: field === 'offer_name' && !current.id ? slugify(value) : current.slug }));
  }

  async function save(status) {
    try {
      const payload = { ...form, status, inclusions: form.inclusions.split('\n').map((x) => x.trim()).filter(Boolean) };
      const res = await fetch('/api/offers-pricing', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Could not save offer');
      setForm(toForm(data.offer));
      setMessage(status === 'active' ? 'Offer activated.' : 'Offer saved as draft.');
      await loadOffers();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function remove() {
    if (!form.id || !window.confirm('Delete this offer?')) return;
    try {
      const res = await fetch(`/api/offers-pricing?id=${encodeURIComponent(form.id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Could not delete offer');
      setForm(blank);
      setMessage('Offer deleted.');
      await loadOffers();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">Commercial Control</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Pricing Manager</h1>
          <p className="mt-2 text-sm text-slate-400">Manage plans, fees, inclusions, CTA links and Stripe price mapping.</p>
        </div>
        <Button onClick={() => setForm(blank)} className="bg-cyan-500 text-white hover:bg-cyan-400"><Plus className="mr-2 h-4 w-4" />New Offer</Button>
      </div>

      {message && <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">{message}</div>}

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <Card className="border-white/10 bg-[#0b0f18]">
          <CardHeader><CardTitle className="text-white">Offers</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {offers.length === 0 ? <p className="text-sm text-slate-500">No offers yet.</p> : null}
            {offers.map((offer) => (
              <button key={offer.id} onClick={() => setForm(toForm(offer))} className="w-full rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left hover:border-cyan-400/30">
                <div className="text-xs uppercase tracking-wide text-cyan-300">{offer.status}</div>
                <div className="mt-1 font-semibold text-white">{offer.offer_name}</div>
                <div className="mt-1 text-sm text-slate-400">${offer.setup_fee} setup + ${offer.monthly_fee}/{offer.billing_cycle}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#0b0f18]">
          <CardHeader><CardTitle className="text-white">{form.id ? 'Edit Offer' : 'Create Offer'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label className="text-slate-300">Offer Name</Label><Input value={form.offer_name} onChange={(e) => update('offer_name', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Slug</Label><Input value={form.slug} onChange={(e) => update('slug', slugify(e.target.value))} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2 md:col-span-2"><Label className="text-slate-300">Headline</Label><Input value={form.headline} onChange={(e) => update('headline', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2 md:col-span-2"><Label className="text-slate-300">Description</Label><Textarea value={form.description} onChange={(e) => update('description', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Setup Fee</Label><Input type="number" value={form.setup_fee} onChange={(e) => update('setup_fee', Number(e.target.value))} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Monthly Fee</Label><Input type="number" value={form.monthly_fee} onChange={(e) => update('monthly_fee', Number(e.target.value))} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">CTA Label</Label><Input value={form.cta_label} onChange={(e) => update('cta_label', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">CTA URL</Label><Input value={form.cta_url} onChange={(e) => update('cta_url', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Stripe Price Key</Label><Input value={form.stripe_price_key} onChange={(e) => update('stripe_price_key', e.target.value)} className="border-white/10 bg-white/5 text-white" placeholder="starter, growth, custom" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Sort Order</Label><Input type="number" value={form.sort_order} onChange={(e) => update('sort_order', Number(e.target.value))} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2 md:col-span-2"><Label className="text-slate-300">Inclusions</Label><Textarea value={form.inclusions} onChange={(e) => update('inclusions', e.target.value)} className="min-h-[180px] border-white/10 bg-white/5 text-white" placeholder="One inclusion per line" /></div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button onClick={() => save('draft')} variant="outline" className="border-white/10 bg-white/[0.03] text-white"><Save className="mr-2 h-4 w-4" />Save Draft</Button>
              <Button onClick={() => save('active')} className="bg-cyan-500 text-white hover:bg-cyan-400"><DollarSign className="mr-2 h-4 w-4" />Activate</Button>
              {form.id && <Button onClick={remove} variant="outline" className="border-red-500/20 bg-red-500/10 text-red-200"><Trash2 className="mr-2 h-4 w-4" />Delete</Button>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
