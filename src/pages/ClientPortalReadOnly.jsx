import React, { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const fmtDate = (value) => (value ? new Date(value).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' }) : '-');
const label = (value, fallback = 'Unknown') => String(value || fallback).replace(/_/g, ' ');
const countBy = (rows, key, fallback = 'Unknown') => rows.reduce((acc, row) => {
  const next = label(typeof key === 'function' ? key(row) : row[key], fallback);
  acc[next] = (acc[next] || 0) + 1;
  return acc;
}, {});

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
        if (mounted) setError(err.message || 'Unable to load portal.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    boot();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession || null);
      if (!nextSession) return setPortal(null);
      loadPortalData().then(setPortal).catch((err) => setError(err.message || 'Unable to load portal.'));
    });
    return () => { mounted = false; listener?.subscription?.unsubscribe(); };
  }, []);

  const client = portal?.client || null;
  const billing = portal?.billing || null;
  const calls = portal?.calls || [];
  const stats = useMemo(() => ({
    total: calls.length,
    booked: calls.filter((call) => call.appointment_booked).length,
    followUps: calls.filter((call) => call.follow_up_required).length,
    sentiments: countBy(calls, 'sentiment', 'No sentiment'),
    outcomes: countBy(calls, (call) => call.outcome_label || call.call_status || call.status, 'No outcome'),
    categories: countBy(calls, (call) => call.enquiry_category, 'Uncategorised'),
  }), [calls]);

  if (loading) return <div className="min-h-screen bg-[#0a0a0f] p-8 text-white">Loading client portal...</div>;
  if (!session) return <Navigate to="/ClientLogin" replace />;

  return <div className="min-h-screen bg-[#0a0a0f] px-6 py-24 text-white"><div className="mx-auto max-w-7xl">
    <div className="mb-8 flex items-start justify-between gap-4"><div><Badge className="mb-3 border-cyan-500/20 bg-cyan-500/10 text-cyan-300">Read-only client portal</Badge><h1 className="text-4xl font-bold">AssistantAI Client Portal</h1><p className="mt-2 text-gray-400">Billing, setup, integrations, updates and AI call activity.</p></div><Button variant="outline" onClick={() => supabase.auth.signOut().then(() => { window.location.href = '/ClientLogin'; })}>Log Out</Button></div>
    {error && <Card className="mb-6 border-red-500/20 bg-red-500/10"><CardContent className="p-5 text-red-100">{error}</CardContent></Card>}
    {!client && <Card className="border-amber-500/20 bg-amber-500/10"><CardContent className="p-6">No linked client record for {session.user.email}.</CardContent></Card>}
    {client && <Tabs defaultValue="overview"><TabsList className="mb-6 flex h-auto flex-wrap gap-2 bg-[#12121a] p-2"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="billing">Billing</TabsTrigger><TabsTrigger value="calls">Call Activity</TabsTrigger><TabsTrigger value="integrations">Integrations</TabsTrigger><TabsTrigger value="setup">Setup</TabsTrigger><TabsTrigger value="updates">Updates</TabsTrigger></TabsList>
      <TabsContent value="overview"><Grid title="Overview"><Field k="Business" v={client.business_name} /><Field k="Email" v={client.email || session.user.email} /><Field k="Phone" v={client.phone || client.mobile_number} /><Field k="Status" v={client.status || client.lifecycle_state} /></Grid></TabsContent>
      <TabsContent value="billing"><Grid title="Billing"><Field k="Plan" v={billing?.plan || client.plan} /><Field k="Billing status" v={billing?.billing_status} /><Field k="Setup fee" v={billing?.setup_fee} /><Field k="Monthly fee" v={billing?.monthly_fee} /><Field k="Renewal date" v={billing?.renewal_date} /></Grid></TabsContent>
      <TabsContent value="calls"><Calls calls={calls} recordings={portal.recordings} stats={stats} /></TabsContent>
      <TabsContent value="integrations"><List title="Integrations" note="Read-only from integration_status. No portal writes are performed." rows={portal.integrations} render={(row) => <><div className="flex items-center justify-between gap-3"><strong>{row.integration_name || 'Integration'}</strong><Badge>{label(row.connection_status, 'Not connected')}</Badge></div><p className="mt-1 text-sm text-gray-500">{label(row.integration_type, 'Service')} - last sync {fmtDate(row.last_sync || row.last_checked_at)}</p>{row.notes && <p className="mt-3 text-gray-300">{row.notes}</p>}</>} /></TabsContent>
      <TabsContent value="setup"><div className="space-y-5"><List title="Setup tasks" rows={portal.tasks} render={(row) => <><strong>{row.task_name}</strong><p className="mt-1 text-sm text-gray-500">{row.task_phase || 'Setup'} {row.due_date ? `- Due ${row.due_date}` : ''}</p></>} /><List title="Secure setup requests" rows={portal.requests} render={(row) => <><strong>{row.corrected_business_name || row.captured_business_name || 'Setup request'}</strong><p className="mt-1 text-sm text-gray-500">Status {label(row.status, 'pending')} - created {fmtDate(row.created_at)}</p></>} /></div></TabsContent>
      <TabsContent value="updates"><List title="Client updates" note="Read-only from client_notes. Portal users can view updates only." rows={portal.notes} render={(row) => <><div className="mb-2 flex gap-2"><Badge>{label(row.note_type, 'Update')}</Badge><span className="text-sm text-gray-500">{fmtDate(row.created_at)}</span></div><p className="whitespace-pre-wrap text-gray-300">{row.content || 'No update content.'}</p></>} /></TabsContent>
    </Tabs>}
  </div></div>;
}

function Calls({ calls, recordings, stats }) {
  return <div className="space-y-5"><Grid title="Call analytics"><Field k="Analysed calls" v={stats.total} /><Field k="Appointments booked" v={stats.booked} /><Field k="Follow-up required" v={stats.followUps} /><Field k="Recordings" v={recordings.length} /></Grid><Grid title="Breakdowns"><Breakdown title="Sentiment" items={stats.sentiments} /><Breakdown title="Outcomes" items={stats.outcomes} /><Breakdown title="Categories" items={stats.categories} /></Grid><List title="Call outcomes" note="Read-only from call_records." rows={calls} render={(row) => <><div className="flex flex-wrap items-center justify-between gap-3"><strong>{row.caller_name || 'Unknown caller'}</strong><Badge>{label(row.outcome_label || row.call_status || row.status, 'No outcome')}</Badge></div><p className="mt-1 text-sm text-gray-500">{row.caller_phone || row.phone_number || 'No phone captured'} - {fmtDate(row.timestamp || row.created_at)}</p><p className="mt-3 text-gray-300">{row.ai_summary || row.summary || 'No AI summary captured.'}</p></>} /></div>;
}

function Grid({ title, children }) { return <Card className="border-white/5 bg-[#12121a]"><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{children}</CardContent></Card>; }
function Field({ k, v }) { return <div><p className="text-sm text-gray-500">{k}</p><p className="text-white">{v ?? '-'}</p></div>; }
function Breakdown({ title, items }) { return <div><p className="mb-2 text-sm text-gray-500">{title}</p>{Object.entries(items || {}).map(([k, v]) => <div key={k} className="mb-2 flex justify-between rounded-xl border border-white/5 bg-black/20 px-3 py-2"><span>{k}</span><strong>{v}</strong></div>)}</div>; }
function List({ title, note, rows, render }) { return <Card className="border-white/5 bg-[#12121a]"><CardHeader><CardTitle>{title}</CardTitle>{note && <p className="text-sm text-gray-500">{note}</p>}</CardHeader><CardContent className="space-y-3">{rows.length === 0 && <p className="text-gray-400">Nothing visible yet.</p>}{rows.map((row) => <div key={row.id} className="rounded-2xl border border-white/5 bg-black/20 p-4">{render(row)}</div>)}</CardContent></Card>; }
