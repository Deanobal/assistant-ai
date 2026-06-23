import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Lock, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const planOptions = ['Starter', 'Growth', 'Enterprise / Review Needed', 'Unsure'];

function valueOrEmpty(value) {
  return value || '';
}

function getTokenFromUrl(routeToken) {
  const params = new URLSearchParams(window.location.search);
  const queryToken =
    params.get('token') ||
    params.get('access_token') ||
    params.get('t') ||
    '';
  return routeToken || queryToken || '';
}

export default function SecureSetup() {
  const params = useParams();
  const token = useMemo(() => getTokenFromUrl(params.token), [params.token]);
  const hasToken = Boolean(token);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    business_name: '',
    selected_plan: 'Unsure',
    notes: '',
  });

  useEffect(() => {
    async function loadPrefill() {
      if (!token) {
        setError('This secure setup link is missing its access token. Please use the unique link sent by AssistantAI, or ask the receptionist to send a fresh secure setup link.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/secure-setup-prefill?t=${encodeURIComponent(token)}`, { cache: 'no-store' });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || 'This secure setup link could not be loaded.');
        }

        const record = data.record || {};
        setForm({
          full_name: valueOrEmpty(record.corrected_name || record.captured_name),
          email: valueOrEmpty(record.corrected_email || record.captured_email),
          phone: valueOrEmpty(record.corrected_phone || record.caller_phone),
          business_name: valueOrEmpty(record.corrected_business_name || record.captured_business_name),
          selected_plan: valueOrEmpty(record.corrected_plan || record.captured_plan || 'Unsure'),
          notes: valueOrEmpty(record.corrected_notes || record.captured_notes),
        });
      } catch (loadError) {
        setError(loadError.message || 'This secure setup link could not be loaded.');
      } finally {
        setLoading(false);
      }
    }

    loadPrefill();
  }, [token]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!token) {
      setError('This form cannot be submitted because the unique setup token is missing. Please use the secure link sent by AssistantAI.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/secure-setup-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ...form }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Unable to submit your setup form.');
      }

      setSubmitted(true);
    } catch (submitError) {
      setError(submitError.message || 'Unable to submit your setup form.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
        <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200">
          <Lock className="h-4 w-4" />
          Secure AssistantAI setup form
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-cyan-500/10 md:p-10">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Confirm your details</h1>
              <p className="mt-3 max-w-2xl text-slate-300">
                We pre-filled what the AI receptionist captured. Please correct anything that looks wrong and add any missing details so setup can continue without delays.
              </p>
            </div>
            <ShieldCheck className="h-10 w-10 text-cyan-300" />
          </div>

          {loading && (
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-slate-300">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading your secure setup form...
            </div>
          )}

          {!loading && !hasToken && (
            <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-6 text-red-50">
              <Lock className="mb-4 h-10 w-10 text-red-200" />
              <h2 className="text-2xl font-bold">Secure setup link required</h2>
              <p className="mt-3 leading-7 text-red-100">
                This page cannot be completed from a bare secure setup URL. For security, each setup form needs a unique access token in the link.
              </p>
              <p className="mt-3 leading-7 text-red-100">
                Use the fresh SMS link sent by AssistantAI, or ask the AI receptionist/team to send a new secure setup link.
              </p>
            </div>
          )}

          {!loading && submitted && (
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-6">
              <CheckCircle2 className="mb-4 h-10 w-10 text-emerald-300" />
              <h2 className="text-2xl font-bold">Details received</h2>
              <p className="mt-2 text-emerald-100">Thanks. AssistantAI has your corrected details and the team can continue setup.</p>
            </div>
          )}

          {!loading && hasToken && !submitted && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
                  {error}
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-200">Name</span>
                  <input
                    value={form.full_name}
                    onChange={(event) => update('full_name', event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none ring-cyan-400/40 focus:ring-2"
                    placeholder="Your full name"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-200">Mobile number</span>
                  <input
                    value={form.phone}
                    onChange={(event) => update('phone', event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none ring-cyan-400/40 focus:ring-2"
                    placeholder="+61..."
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-200">Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => update('email', event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none ring-cyan-400/40 focus:ring-2"
                    placeholder="you@business.com.au"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-200">Business name</span>
                  <input
                    value={form.business_name}
                    onChange={(event) => update('business_name', event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none ring-cyan-400/40 focus:ring-2"
                    placeholder="Business name"
                  />
                </label>
              </div>

              <label className="space-y-2 block">
                <span className="text-sm font-semibold text-slate-200">Plan discussed</span>
                <select
                  value={form.selected_plan}
                  onChange={(event) => update('selected_plan', event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none ring-cyan-400/40 focus:ring-2"
                >
                  {planOptions.map((plan) => (
                    <option key={plan} value={plan}>{plan}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 block">
                <span className="text-sm font-semibold text-slate-200">Extra setup notes</span>
                <textarea
                  value={form.notes}
                  onChange={(event) => update('notes', event.target.value)}
                  rows={5}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none ring-cyan-400/40 focus:ring-2"
                  placeholder="Tell us anything important about your calls, booking process, CRM, or setup requirements."
                />
              </label>

              <Button
                type="submit"
                disabled={submitting}
                className="min-h-[3.25rem] w-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-6 text-base font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Submit secure setup details'}
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
