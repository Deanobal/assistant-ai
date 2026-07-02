import React, { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AlertCircle, ArrowUpRight, CalendarCheck, CheckCircle2, ClipboardList, Clock, CreditCard, Headphones, HelpCircle, Loader2, LogOut, Mail, MessageSquareText, Phone, PlugZap, ShieldCheck, TrendingUp, User, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AudioPlayer from '@/components/calls/AudioPlayer';

const SUPPORT_EMAIL = 'sales@assistantai.com.au';
const fmtDate = (value) => value ? new Date(value).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' }) : '-';
const fmtShort = (value) => value ? new Date(value).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
const fmtDuration = (seconds) => { const n = Number(seconds || 0); return n ? `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}` : '0:00'; };
const fmtMoney = (value) => value === null || value === undefined || value === '' ? '-' : new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(Number(value));
const label = (value, fallback = 'Unknown') => String(value || fallback).replace(/_/g, ' ');
const pct = (value, total) => total ? Math.round((value / total) * 100) : 0;

function mailto(subject, body) {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function businessBody(client, action) {
  return `Hi, I'd like to ${action}. My business name is ${client?.business_name || '[BUSINESS_NAME]'}.`;
}

function tone(value) {
  const status = String(value || '').toLowerCase().replace(/[\s-]+/g, '_');
  if (/error|failed|blocked|negative|angry|poor/.test(status)) return { badge: 'border-red-500/20 bg-red-500/10 text-red-300', dot: 'bg-red-400', bar: 'bg-red-400', panel: 'border-red-500/20 bg-red-500/[0.03]' };
  if (/pending|planned|draft|neutral|onboarding/.test(status)) return { badge: 'border-amber-500/20 bg-amber-500/10 text-amber-300', dot: 'bg-amber-300', bar: 'bg-amber-300', panel: 'border-amber-500/20 bg-amber-500/[0.03]' };
  if (/active|paid|live|connected|booked|positive|completed|complete/.test(status) && !/not_connected|disconnected/.test(status)) return { badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300', dot: 'bg-emerald-300', bar: 'bg-emerald-300', panel: 'border-emerald-500/20 bg-emerald-500/[0.03]' };
  return { badge: 'border-white/10 bg-white/5 text-gray-300', dot: 'bg-white/30', bar: 'bg-cyan-400', panel: 'border-white/5 bg-black/20' };
}

function countBy(rows, picker, fallback = 'Unknown') {
  return rows.reduce((acc, row) => {
    const raw = typeof picker === 'function' ? picker(row) : row[picker];
    const key = label(raw, fallback);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function isThisMonth(value) {
  if (!value) return false;
  const d = new Date(value);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

async function loadPortalData() {
  await supabase.rpc('claim_client_account');
  const { data: clients, error: clientError } = await supabase.from('clients').select('*').limit(1);
  if (clientError) throw clientError;
  const client = clients?.[0] || null;
  if (!client?.id) return { client: null, billing: null, calls: [], recordings: [], tasks: [], requests: [], integrations: [], notes: [] };

  const [billing, calls, recordings, tasks, requests, integrations, notes] = await Promise.all([
    supabase.from('billing_status').select('*').eq('client_id', client.id).limit(1),
    supabase.from('call_records').select('*').eq('client_id', client.id).order('created_at', { ascending: false }).limit(100),
    supabase.from('client_call_recordings').select('*').eq('client_id', client.id).order('created_at', { ascending: false }).limit(50),
    supabase.from('onboarding_tasks').select('*').eq('client_id', client.id).order('created_at', { ascending: true }).limit(100),
    supabase.from('secure_setup_requests').select('*').eq('client_id', client.id).order('created_at', { ascending: false }).limit(10),
    supabase.from('integration_status').select('*').eq('client_id', client.id).order('integration_name', { ascending: true }).limit(50),
    supabase.from('client_notes').select('*').eq('client_id', client.id).eq('is_archived', false).order('created_at', { ascending: false }).limit(50),
  ]);

  for (const result of [billing, calls, recordings, tasks, requests, integrations, notes]) if (result.error) throw result.error;
  return { client, billing: billing.data?.[0] || null, calls: calls.data || [], recordings: recordings.data || [], tasks: tasks.data || [], requests: requests.data || [], integrations: integrations.data || [], notes: notes.data || [] };
}

export default function ClientPortalReadOnly() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [portal, setPortal] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function boot() {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(data?.session || null);
        if (data?.session) setPortal(await loadPortalData());
      } catch (err) {
        if (mounted) setError(err.message || 'Unable to load client portal.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    boot();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession || null);
      if (!nextSession) return setPortal(null);
      loadPortalData().then(setPortal).catch((err) => setError(err.message || 'Unable to load client portal.'));
    });
    return () => { mounted = false; listener?.subscription?.unsubscribe(); };
  }, []);

  const client = portal?.client || null;
  const billing = portal?.billing || null;
  const calls = portal?.calls || [];
  const recordings = portal?.recordings || [];
  const tasks = portal?.tasks || [];
  const requests = portal?.requests || [];
  const integrations = portal?.integrations || [];
  const notes = portal?.notes || [];

  const stats = useMemo(() => {
    const monthCalls = calls.filter((call) => isThisMonth(call.timestamp));
    const booked = calls.filter((call) => call.appointment_booked).length;
    const followUps = calls.filter((call) => call.follow_up_required).length;
    const completeTasks = tasks.filter((task) => task.completed).length;
    const activeIntegrations = integrations.filter((item) => /connected|active|live/i.test(item.connection_status || '') && !/not_connected|disconnected/i.test(item.connection_status || '')).length;
    const duration = calls.reduce((sum, call) => sum + Number(call.call_duration_seconds || call.duration || 0), 0);
    return {
      monthCalls: monthCalls.length || calls.length,
      booked,
      followUps,
      completeTasks,
      setupProgress: tasks.length ? Math.round((completeTasks / tasks.length) * 100) : 0,
      activeIntegrations,
      avgDuration: calls.length ? Math.round(duration / calls.length) : 0,
      sentiment: countBy(calls, 'sentiment', 'No sentiment'),
      outcomes: countBy(calls, (call) => call.outcome_label || call.call_status || call.status, 'No outcome'),
      categories: countBy(calls, (call) => call.enquiry_category, 'Uncategorised'),
      bookingRate: pct(booked, calls.length),
      followUpRate: pct(followUps, calls.length),
    };
  }, [calls, tasks, integrations]);

  const tasksByPhase = useMemo(() => tasks.reduce((acc, task) => {
    const phase = label(task.task_phase, 'Setup');
    acc[phase] = [...(acc[phase] || []), task];
    return acc;
  }, {}), [tasks]);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] text-white"><Loader2 className="mr-2 h-5 w-5 animate-spin text-cyan-300" />Loading client portal...</div>;
  if (!session) return <Navigate to="/ClientLogin" replace />;

  async function signOut() { await supabase.auth.signOut(); window.location.href = '/ClientLogin'; }

  return <div className="min-h-screen bg-[#0a0a0f] text-white"><div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[280px_1fr] lg:px-8">
    <aside className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]"><div className="flex h-full flex-col rounded-3xl border border-white/5 bg-[#12121a] p-5 shadow-2xl shadow-black/30"><div className="mb-7"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10"><Zap className="h-5 w-5 text-cyan-300" /></div><p className="text-xs uppercase tracking-[0.28em] text-cyan-300">AssistantAI</p><h1 className="mt-2 text-xl font-semibold leading-tight">{client?.business_name || 'Client Portal'}</h1><div className="mt-4 flex flex-wrap gap-2"><Badge className="border-cyan-500/20 bg-cyan-500/10 text-cyan-300">{billing?.plan || client?.plan || 'Active client'}</Badge><Badge className={tone(billing?.billing_status || client?.status || client?.lifecycle_state).badge}>{label(billing?.billing_status || client?.status || client?.lifecycle_state, 'Status pending')}</Badge></div></div><div className="space-y-3"><SideStat label="Calls this month" value={stats.monthCalls} /><SideStat label="Appointments" value={stats.booked} /><SideStat label="Setup progress" value={`${stats.setupProgress}%`} /><SideStat label="Active integrations" value={stats.activeIntegrations} /></div><div className="mt-6 rounded-2xl border border-white/5 bg-black/20 p-4"><p className="text-xs uppercase tracking-[0.2em] text-gray-500">Account manager</p><a href={`mailto:${SUPPORT_EMAIL}`} className="mt-2 flex items-center gap-2 text-sm font-medium text-cyan-300 hover:text-cyan-200"><Mail className="h-4 w-4" />{SUPPORT_EMAIL}</a></div><div className="mt-auto space-y-3 pt-6"><Button asChild className="w-full bg-cyan-500 text-black hover:bg-cyan-400"><a href={mailto('Client Portal Help Request', businessBody(client, 'get help with my AssistantAI portal'))}><HelpCircle className="mr-2 h-4 w-4" />Get Help</a></Button><Button variant="outline" onClick={signOut} className="w-full border-white/10 bg-transparent text-white hover:bg-white/5"><LogOut className="mr-2 h-4 w-4" />Log Out</Button></div></div></aside>

    <main className="min-w-0 space-y-6"><section className="overflow-hidden rounded-3xl border border-white/5 bg-[#12121a] shadow-2xl shadow-black/30"><div className="relative p-6 md:p-8"><div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" /><div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between"><div><div className="mb-4 flex flex-wrap items-center gap-2"><Badge className="border-cyan-500/20 bg-cyan-500/10 text-cyan-300">Live dashboard</Badge><Badge className="border-white/10 bg-white/5 text-gray-300">Read-only activity views</Badge></div><h2 className="max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">{client?.business_name || 'Your AssistantAI account'}</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-gray-400 md:text-base">Monitor call outcomes, appointments, setup progress, integrations and client-visible updates from one premium workspace.</p></div><div className="grid gap-3 sm:grid-cols-2 xl:min-w-[520px]"><HeroPill label="Calls this month" value={stats.monthCalls} /><HeroPill label="Appointments booked" value={stats.booked} /><HeroPill label="Setup progress" value={`${stats.setupProgress}%`} /><HeroPill label="Active integrations" value={stats.activeIntegrations} /></div></div></div></section>

    {error && <Card className="border-red-500/20 bg-red-500/10"><CardContent className="flex gap-3 p-5 text-sm text-red-100"><AlertCircle className="h-5 w-5 shrink-0 text-red-300" /><p>{error}</p></CardContent></Card>}
    {!client && <Card className="border-amber-500/20 bg-amber-500/10"><CardContent className="p-8"><h3 className="text-xl font-semibold">No linked client record</h3><p className="mt-3 leading-7 text-amber-100">You are signed in as {session.user.email}, but no active AssistantAI client row is linked to this email.</p></CardContent></Card>}

    {client && <><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Kpi icon={Headphones} label="Total calls" value={calls.length} helper={`${stats.monthCalls} this month`} /><Kpi icon={CalendarCheck} label="Appointments booked" value={stats.booked} helper={`${stats.bookingRate}% booking rate`} toneValue={stats.booked ? 'booked' : 'neutral'} /><Kpi icon={AlertCircle} label="Follow-up required" value={stats.followUps} helper={`${stats.followUpRate}% of calls`} toneValue={stats.followUps ? 'pending' : 'completed'} /><Kpi icon={PlugZap} label="Integrations" value={`${stats.activeIntegrations}/${integrations.length}`} helper="Connected services" /></section>

    <Tabs defaultValue="calls" className="space-y-6"><div className="sticky top-0 z-20 border-y border-white/5 bg-[#0a0a0f]/90 py-3 backdrop-blur-xl"><TabsList className="flex h-auto flex-wrap justify-start gap-2 border border-white/5 bg-[#12121a] p-2"><TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black">Overview</TabsTrigger><TabsTrigger value="calls" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black">Call Activity</TabsTrigger><TabsTrigger value="integrations" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black">Integrations</TabsTrigger><TabsTrigger value="billing" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black">Billing</TabsTrigger><TabsTrigger value="setup" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black">Setup</TabsTrigger><TabsTrigger value="updates" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black">Updates</TabsTrigger></TabsList></div><TabsContent value="overview"><Overview client={client} billing={billing} session={session} stats={stats} /></TabsContent><TabsContent value="calls"><Calls calls={calls} recordings={recordings} stats={stats} /></TabsContent><TabsContent value="integrations"><Integrations client={client} integrations={integrations} stats={stats} /></TabsContent><TabsContent value="billing"><Billing client={client} billing={billing} /></TabsContent><TabsContent value="setup"><Setup tasks={tasks} requests={requests} stats={stats} tasksByPhase={tasksByPhase} /></TabsContent><TabsContent value="updates"><Updates notes={notes} /></TabsContent></Tabs></>}
    </main></div></div>;
}

function SideStat({ label, value }) { return <div className="rounded-2xl border border-white/5 bg-black/20 px-4 py-3"><p className="text-xs text-gray-500">{label}</p><p className="mt-1 text-lg font-semibold">{value}</p></div>; }
function HeroPill({ label, value }) { return <div className="rounded-2xl border border-white/5 bg-black/25 p-4"><div className="mb-3 flex items-center justify-between"><TrendingUp className="h-4 w-4 text-cyan-300" /><span className="h-2 w-2 rounded-full bg-cyan-400" /></div><p className="text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-gray-500">{label}</p></div>; }
function Kpi({ icon: Icon, label, value, helper, toneValue = 'live' }) { const t = tone(toneValue); return <Card className="group overflow-hidden border-white/5 bg-[#12121a] transition hover:border-cyan-500/20"><CardContent className="p-5"><div className="mb-5 flex items-start justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/5 bg-black/20"><Icon className="h-5 w-5 text-cyan-300" /></div><Badge className={t.badge}>{label === 'Follow-up required' && Number(value) > 0 ? 'Action needed' : 'Live'}</Badge></div><p className="text-3xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-sm text-gray-400">{label}</p><p className="mt-4 flex items-center gap-1 text-xs text-gray-500"><TrendingUp className="h-3.5 w-3.5 text-cyan-300" />{helper}</p></CardContent></Card>; }
function Panel({ title, desc, children, action }) { return <Card className="border-white/5 bg-[#12121a]"><CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div><CardTitle>{title}</CardTitle>{desc && <p className="mt-2 text-sm leading-6 text-gray-500">{desc}</p>}</div>{action}</CardHeader><CardContent>{children}</CardContent></Card>; }
function Field({ label, value }) { return <div className="rounded-2xl border border-white/5 bg-black/20 p-4"><p className="text-xs uppercase tracking-[0.18em] text-gray-500">{label}</p><p className="mt-2 text-sm font-medium">{value ?? '-'}</p></div>; }
function MiniStat({ label, value }) { return <div className="rounded-2xl border border-white/5 bg-black/20 p-4"><p className="text-xs uppercase tracking-[0.18em] text-gray-500">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>; }
function Progress({ label, value }) { return <div><div className="mb-2 flex items-center justify-between text-sm"><span className="text-gray-400">{label}</span><span className="font-medium">{value}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-cyan-400" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div></div>; }
function Breakdown({ items }) { const entries = Object.entries(items || {}).sort((a, b) => b[1] - a[1]); const total = entries.reduce((sum, [, v]) => sum + v, 0); if (!entries.length) return <p className="text-sm text-gray-500">No data yet.</p>; return <div className="space-y-3">{entries.map(([name, value]) => <div key={name}><div className="mb-2 flex justify-between text-sm"><span className="truncate text-gray-300">{name}</span><span>{value}</span></div><div className="h-2 overflow-hidden rounded-full bg-white/5"><div className={`h-full rounded-full ${tone(name).bar}`} style={{ width: `${pct(value, total)}%` }} /></div></div>)}</div>; }
function Empty({ icon: Icon, title, text }) { return <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-8 text-center"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/5 bg-black/20"><Icon className="h-5 w-5 text-cyan-300" /></div><p className="font-medium">{title}</p><p className="mt-2 text-sm leading-6 text-gray-500">{text}</p></div>; }

function Overview({ client, billing, session, stats }) { return <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"><Panel title="Account overview" desc="Client profile and account state."><div className="grid gap-4 md:grid-cols-2"><Field label="Business" value={client.business_name} /><Field label="Email" value={client.email || session.user.email} /><Field label="Phone" value={client.phone || client.mobile_number} /><Field label="Status" value={client.status || client.lifecycle_state} /><Field label="Plan" value={billing?.plan || client.plan} /><Field label="Billing" value={billing?.billing_status} /></div></Panel><Panel title="Operating snapshot" desc="High-level activity health."><div className="space-y-4"><Progress label="Setup progress" value={stats.setupProgress} /><Progress label="Appointment conversion" value={stats.bookingRate} /><Progress label="Follow-up load" value={stats.followUpRate} /></div></Panel></div>; }
function Calls({ calls, recordings, stats }) { return <div className="space-y-6"><div className="grid gap-4 xl:grid-cols-3"><Panel title="Sentiment" desc="Caller sentiment."><Breakdown items={stats.sentiment} /></Panel><Panel title="Outcomes" desc="Call outcomes."><Breakdown items={stats.outcomes} /></Panel><Panel title="Categories" desc="Enquiry mix."><Breakdown items={stats.categories} /></Panel></div><Panel title="Call outcomes" desc="Read-only from call_records."><div className="space-y-3">{calls.length === 0 && <Empty icon={Headphones} title="No call activity yet" text="Call outcomes will appear here." />}{calls.map((call) => <div key={`${call.timestamp}-${call.caller_phone}-${call.caller_name}`} className={`rounded-2xl border p-4 ${call.follow_up_required || /negative/i.test(call.sentiment || '') ? 'border-amber-500/20 bg-amber-500/[0.03]' : 'border-white/5 bg-black/20'}`}><div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between"><div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{call.caller_name || 'Unknown caller'}</p>{call.appointment_booked && <Badge className={tone('booked').badge}>Appointment booked</Badge>}{call.follow_up_required && <Badge className={tone('pending').badge}>Follow-up required</Badge>}</div><p className="mt-2 text-sm text-gray-500">{call.caller_phone || 'No phone captured'} · {fmtDate(call.timestamp)} · {fmtDuration(call.call_duration_seconds || call.duration)}</p></div><div className="flex flex-wrap gap-2"><Badge className={tone(call.sentiment).badge}>{label(call.sentiment, 'No sentiment')}</Badge><Badge className={tone(call.outcome_label || call.call_status).badge}>{label(call.outcome_label || call.call_status, 'No outcome')}</Badge><Badge className="border-white/10 bg-white/5 text-gray-300">{label(call.enquiry_category, 'Uncategorised')}</Badge></div></div><p className="mt-4 text-sm leading-7 text-gray-300">{call.ai_summary || 'No AI summary captured.'}</p></div>)}</div></Panel><Panel title="Recordings" desc="Playable client call recordings."><div className="space-y-4">{recordings.length === 0 && <Empty icon={Headphones} title="No recordings attached" text="Audio will appear once recordings are available." />}{recordings.map((rec) => <div key={`${rec.started_at}-${rec.phone_number}-${rec.recording_url}`} className="rounded-2xl border border-white/5 bg-black/20 p-4"><div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"><div><p className="font-semibold">{rec.caller_name || 'Unknown caller'}</p><p className="mt-1 text-sm text-gray-500">{rec.phone_number || 'No phone captured'} · {fmtDate(rec.started_at)} · {fmtDuration(rec.duration_seconds)}</p></div><Badge className={tone(rec.status || rec.outcome_label).badge}>{label(rec.outcome_label || rec.status, 'Completed')}</Badge></div><AudioPlayer src={rec.recording_url || rec.stereo_recording_url} duration={fmtDuration(rec.duration_seconds)} />{rec.summary && <p className="mt-4 rounded-2xl border border-white/5 bg-[#12121a] p-4 text-sm leading-7 text-gray-300">{rec.summary}</p>}{rec.transcript && <details className="mt-4 rounded-2xl border border-white/5 bg-[#12121a] p-4"><summary className="cursor-pointer text-sm font-medium">View transcript</summary><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-400">{rec.transcript}</p></details>}</div>)}</div></Panel></div>; }
function Integrations({ client, integrations, stats }) { return <Panel title="Integrations" desc="Connected systems. Portal view is strictly read-only." action={<Button asChild className="bg-cyan-500 text-black hover:bg-cyan-400"><a href={mailto('Integration Request', businessBody(client, 'request a new AssistantAI integration'))}>Request new integration<ArrowUpRight className="ml-2 h-4 w-4" /></a></Button>}><div className="mb-5 grid gap-4 md:grid-cols-3"><MiniStat label="Connected" value={stats.activeIntegrations} /><MiniStat label="Total visible" value={integrations.length} /><MiniStat label="Needs attention" value={integrations.filter((i) => /error|failed|blocked/i.test(i.connection_status || '')).length} /></div><div className="grid gap-4 md:grid-cols-2">{integrations.length === 0 && <Empty icon={PlugZap} title="No integrations visible yet" text="Connected services will appear here." />}{integrations.map((i) => { const t = tone(i.connection_status); return <div key={`${i.integration_name}-${i.integration_type}`} className={`rounded-2xl border p-5 ${t.panel}`}><div className="mb-5 flex items-start justify-between gap-4"><div className="flex items-start gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/5 bg-black/25"><PlugZap className="h-5 w-5 text-cyan-300" /></div><div><div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${t.dot}`} /><p className="font-semibold">{i.integration_name || 'Integration'}</p></div><p className="mt-1 text-sm text-gray-500">{label(i.integration_type, 'Service')}</p></div></div><Badge className={t.badge}>{label(i.connection_status, 'Not connected')}</Badge></div><div className="rounded-2xl border border-white/5 bg-black/20 p-4"><p className="text-xs uppercase tracking-[0.18em] text-gray-500">Last sync</p><p className="mt-1 text-sm">{fmtDate(i.last_sync)}</p></div>{i.notes && <p className="mt-4 text-sm leading-7 text-gray-300">{i.notes}</p>}</div>; })}</div></Panel>; }
function Billing({ client, billing }) { const setupPaid = billing?.setup_fee_paid === true || billing?.setup_fee_paid === 'true' || billing?.setup_fee_paid === 'paid'; return <Panel title="Plan and billing" desc="Current package, fees and billing status."><div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"><div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/[0.04] p-6"><div className="mb-6 flex items-start justify-between gap-4"><div><Badge className="border-cyan-500/20 bg-cyan-500/10 text-cyan-300">Current plan</Badge><h3 className="mt-4 text-3xl font-semibold">{billing?.plan || client?.plan || 'AssistantAI'}</h3><p className="mt-2 text-sm leading-6 text-gray-400">Your active AssistantAI service package.</p></div><div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10"><CreditCard className="h-6 w-6 text-cyan-300" /></div></div><div className="grid gap-3 md:grid-cols-3"><Field label="Monthly fee" value={fmtMoney(billing?.monthly_fee)} /><Field label="Setup fee" value={fmtMoney(billing?.setup_fee)} /><Field label="Renewal date" value={fmtShort(billing?.renewal_date)} /></div></div><div className="space-y-4"><div className="rounded-2xl border border-white/5 bg-black/20 p-5"><p className="text-xs uppercase tracking-[0.18em] text-gray-500">Billing status</p><Badge className={`mt-3 ${tone(billing?.billing_status).badge}`}>{label(billing?.billing_status, 'No billing status')}</Badge></div><div className="rounded-2xl border border-white/5 bg-black/20 p-5"><p className="text-xs uppercase tracking-[0.18em] text-gray-500">Setup fee</p><div className="mt-3 flex items-center gap-2">{setupPaid ? <CheckCircle2 className="h-5 w-5 text-emerald-300" /> : <Clock className="h-5 w-5 text-amber-300" />}<p className="font-medium">{setupPaid ? 'Paid' : 'Pending or not confirmed'}</p></div></div><div className="grid gap-3 sm:grid-cols-2"><Button asChild className="bg-cyan-500 text-black hover:bg-cyan-400"><a href={mailto('Plan Upgrade Request', businessBody(client, 'upgrade my AssistantAI plan'))}>Upgrade Plan</a></Button><Button asChild variant="outline" className="border-white/10 bg-transparent text-white hover:bg-white/5"><a href={mailto('AssistantAI Add-ons Request', businessBody(client, 'discuss AssistantAI add-ons'))}>Add-ons</a></Button></div></div></div></Panel>; }
function Setup({ tasks, requests, stats, tasksByPhase }) { return <div className="space-y-6"><Panel title="Setup progress" desc="Onboarding tasks grouped by phase."><div className="mb-8 rounded-3xl border border-cyan-500/20 bg-cyan-500/[0.04] p-5"><div className="mb-3 flex items-center justify-between"><div><p className="font-semibold">{stats.setupProgress}% complete</p><p className="mt-1 text-sm text-gray-500">{stats.completeTasks} of {tasks.length} tasks completed</p></div><Badge className={stats.setupProgress === 100 ? tone('completed').badge : tone('onboarding').badge}>{stats.setupProgress === 100 ? 'Complete' : 'In progress'}</Badge></div><Progress label="Overall setup" value={stats.setupProgress} /></div><div className="space-y-6">{Object.entries(tasksByPhase).length === 0 && <Empty icon={ClipboardList} title="No setup tasks visible" text="Onboarding tasks will appear here." />}{Object.entries(tasksByPhase).map(([phase, phaseTasks]) => <div key={phase}><div className="mb-3 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-cyan-300" /><h3 className="font-semibold">{phase}</h3><Badge className="border-white/10 bg-white/5 text-gray-300">{phaseTasks.length} tasks</Badge></div><div className="space-y-3">{phaseTasks.map((task) => <div key={`${task.task_phase}-${task.task_name}`} className={`rounded-2xl border p-4 ${task.completed ? 'border-white/5 bg-black/10 opacity-70' : task.blocked ? 'border-red-500/20 bg-red-500/[0.03]' : 'border-cyan-500/15 bg-cyan-500/[0.03]'}`}><div className="flex items-start justify-between gap-4"><div><p className={`font-medium ${task.completed ? 'text-gray-400 line-through decoration-white/20' : ''}`}>{task.task_name}</p><p className="mt-1 text-sm text-gray-500">{task.plan_scope ? `${label(task.plan_scope)} · ` : ''}{task.due_date ? `Due ${task.due_date}` : 'No due date'}</p></div><div className="flex flex-wrap justify-end gap-2">{task.required && <Badge className="border-cyan-500/20 bg-cyan-500/10 text-cyan-300">Required</Badge>}{task.blocked && <Badge className="border-red-500/20 bg-red-500/10 text-red-300">Blocked</Badge>}{task.completed && <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-300">Done</Badge>}</div></div></div>)}</div></div>)}</div></Panel><Panel title="Secure setup requests" desc="Recent secure setup submissions."><div className="space-y-3">{requests.length === 0 && <Empty icon={ClipboardList} title="No secure setup requests" text="Submitted setup requests will appear here." />}{requests.map((r) => <div key={`${r.created_at}-${r.status}`} className="rounded-2xl border border-white/5 bg-black/20 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{r.corrected_business_name || r.captured_business_name || 'Setup request'}</p><p className="mt-1 text-sm text-gray-500">Created {fmtDate(r.created_at)}</p></div><Badge className={tone(r.status).badge}>{label(r.status, 'Pending')}</Badge></div></div>)}</div></Panel></div>; }
function Updates({ notes }) { return <Panel title="Client updates" desc="Timeline of client-visible updates. Read-only from client_notes."><div className="space-y-4">{notes.length === 0 && <Empty icon={MessageSquareText} title="No client updates yet" text="Notes and timeline updates will appear here." />}{notes.map((n) => { const t = tone(n.note_type); return <div key={`${n.created_at}-${n.note_type}`} className="relative rounded-2xl border border-white/5 bg-black/20 p-5 pl-6"><div className={`absolute left-0 top-5 h-[calc(100%-2.5rem)] w-1 rounded-r-full ${t.bar}`} /><div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div className="flex flex-wrap items-center gap-2"><Badge className={t.badge}>{label(n.note_type, 'Update')}</Badge>{n.created_by && <Badge className="border-white/10 bg-white/5 text-gray-300">{label(n.created_by, 'AssistantAI')}</Badge>}</div><p className="text-sm text-gray-500">{fmtDate(n.created_at)}</p></div><p className="whitespace-pre-wrap text-sm leading-7 text-gray-300">{n.content || 'No update content.'}</p></div>; })}</div></Panel>; }
