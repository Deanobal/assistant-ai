import React, { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  LogOut,
  Headphones,
  CreditCard,
  ClipboardList,
  AlertCircle,
  CheckCircle2,
  Loader2,
  User,
  Phone,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AudioPlayer from '@/components/calls/AudioPlayer';

function formatMoney(value) {
  if (value === null || value === undefined || value === '') return '—';
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value);
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(number);
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-AU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function formatDuration(seconds) {
  const total = Number(seconds || 0);
  if (!total) return '0:00';
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function statusBadge(status) {
  const clean = String(status || 'Unknown');
  const lower = clean.toLowerCase();

  if (lower.includes('active') || lower.includes('paid') || lower.includes('live')) {
    return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
  }

  if (lower.includes('pending') || lower.includes('draft') || lower.includes('onboarding')) {
    return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
  }

  return 'bg-white/5 text-gray-300 border-white/10';
}

async function loadPortalData() {
  await supabase.rpc('claim_client_account');

  const { data: clients, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .limit(1);

  if (clientError) throw clientError;

  const client = clients?.[0] || null;

  if (!client?.id) {
    return {
      client: null,
      billing: null,
      calls: [],
      intake: null,
      tasks: [],
      secureSetupRequests: [],
    };
  }

  const [billingResult, callsResult, intakeResult, tasksResult, setupResult] = await Promise.all([
    supabase.from('billing_status').select('*').eq('client_id', client.id).limit(1),
    supabase
      .from('client_call_recordings')
      .select('*')
      .eq('client_id', client.id)
      .order('started_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false, nullsFirst: false })
      .limit(50),
    supabase.from('intake_forms').select('*').eq('client_id', client.id).limit(1),
    supabase
      .from('onboarding_tasks')
      .select('*')
      .eq('client_id', client.id)
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true })
      .limit(100),
    supabase
      .from('secure_setup_requests')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  for (const result of [billingResult, callsResult, intakeResult, tasksResult, setupResult]) {
    if (result.error) throw result.error;
  }

  return {
    client,
    billing: billingResult.data?.[0] || null,
    calls: callsResult.data || [],
    intake: intakeResult.data?.[0] || null,
    tasks: tasksResult.data || [],
    secureSetupRequests: setupResult.data || [],
  };
}

export default function ClientPortal() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [portalData, setPortalData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function boot() {
      setLoading(true);
      setError('');

      try {
        const { data } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(data?.session || null);

        if (data?.session) {
          const loaded = await loadPortalData();
          if (mounted) setPortalData(loaded);
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message || 'Unable to load client portal.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    boot();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession || null);
      if (!nextSession) {
        setPortalData(null);
      } else {
        loadPortalData()
          .then(setPortalData)
          .catch((loadError) => setError(loadError.message || 'Unable to load client portal.'));
      }
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const client = portalData?.client || null;
  const billing = portalData?.billing || null;
  const calls = portalData?.calls || [];
  const tasks = portalData?.tasks || [];
  const secureSetupRequests = portalData?.secureSetupRequests || [];

  const progress = useMemo(() => {
    if (!tasks.length) return 0;
    const completed = tasks.filter((task) => task.completed).length;
    return Math.round((completed / tasks.length) * 100);
  }, [tasks]);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/ClientLogin';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] px-6 text-white">
        <div className="flex items-center gap-3 text-gray-300">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-300" />
          Loading client portal...
        </div>
      </div>
    );
  }

  if (!session) return <Navigate to="/ClientLogin" replace />;

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <Badge className="border-cyan-500/20 bg-cyan-500/10 text-cyan-400">Client Portal</Badge>
              <Badge className="border-white/10 bg-white/5 text-gray-300">Supabase Auth</Badge>
              {client && (
                <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-300">Linked client</Badge>
              )}
            </div>

            <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">AssistantAI Client Portal</h1>

            <p className="text-gray-400">
              {client?.business_name
                ? `Review billing, setup progress, and AI call activity for ${client.business_name}.`
                : 'Your login is active, but no AssistantAI client record is linked to this email yet.'}
            </p>
          </div>

          <Button
            variant="outline"
            onClick={signOut}
            className="w-fit border-white/10 bg-transparent text-white hover:bg-white/5"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>

        {error && (
          <Card className="mb-8 border-red-500/20 bg-red-500/10">
            <CardContent className="flex gap-3 p-5 text-sm text-red-100">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
              <p>{error}</p>
            </CardContent>
          </Card>
        )}

        {!client && (
          <Card className="border-amber-500/20 bg-amber-500/10">
            <CardContent className="p-8">
              <div className="mb-4 flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-amber-300" />
                <h2 className="text-xl font-bold text-white">No linked client record</h2>
              </div>
              <p className="leading-7 text-amber-100">
                You are signed in as {session.user.email}, but no active AssistantAI client row is linked to this email. Contact sales@assistantai.com.au and ask us to link your portal access.
              </p>
            </CardContent>
          </Card>
        )}

        {client && (
          <>
            <div className="mb-8 grid gap-4 md:grid-cols-3">
              <Card className="border-white/5 bg-[#12121a]">
                <CardContent className="p-5">
                  <div className="mb-2 flex items-center gap-2 text-gray-400">
                    <User className="h-4 w-4" />
                    Client
                  </div>
                  <p className="text-xl font-semibold text-white">{client.business_name || '—'}</p>
                  <p className="mt-1 text-sm text-gray-500">{client.email || session.user.email}</p>
                </CardContent>
              </Card>

              <Card className="border-white/5 bg-[#12121a]">
                <CardContent className="p-5">
                  <div className="mb-2 flex items-center gap-2 text-gray-400">
                    <CreditCard className="h-4 w-4" />
                    Billing
                  </div>
                  <p className="text-xl font-semibold text-white">{billing?.plan || client.plan || '—'}</p>
                  <Badge className={`mt-2 ${statusBadge(billing?.billing_status)}`}>
                    {billing?.billing_status || 'No billing status'}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="border-white/5 bg-[#12121a]">
                <CardContent className="p-5">
                  <div className="mb-2 flex items-center gap-2 text-gray-400">
                    <ClipboardList className="h-4 w-4" />
                    Setup progress
                  </div>
                  <p className="text-xl font-semibold text-white">{progress}%</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-8">
              <TabsList className="flex h-auto flex-wrap justify-start gap-2 border border-white/5 bg-[#12121a] p-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="billing">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing
                </TabsTrigger>
                <TabsTrigger value="calls">
                  <Headphones className="mr-2 h-4 w-4" />
                  Call Activity
                </TabsTrigger>
                <TabsTrigger value="setup">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Setup
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card className="border-white/5 bg-[#12121a]">
                  <CardHeader>
                    <CardTitle className="text-white">Account overview</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-gray-500">Business</p>
                      <p className="text-white">{client.business_name || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact email</p>
                      <p className="text-white">{client.email || session.user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-white">{client.phone || client.mobile_number || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="text-white">{client.status || client.lifecycle_state || '—'}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="billing">
                <Card className="border-white/5 bg-[#12121a]">
                  <CardHeader>
                    <CardTitle className="text-white">Billing status</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-sm text-gray-500">Plan</p>
                      <p className="text-white">{billing?.plan || client.plan || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Setup fee</p>
                      <p className="text-white">{formatMoney(billing?.setup_fee)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Monthly fee</p>
                      <p className="text-white">{formatMoney(billing?.monthly_fee)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Billing status</p>
                      <Badge className={statusBadge(billing?.billing_status)}>
                        {billing?.billing_status || '—'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="calls">
                <div className="space-y-5">
                  {calls.length === 0 && (
                    <Card className="border-white/5 bg-[#12121a]">
                      <CardContent className="p-8 text-center text-gray-400">
                        No AI call recordings have been captured for this client yet.
                      </CardContent>
                    </Card>
                  )}

                  {calls.map((call) => (
                    <Card key={call.id} className="border-white/5 bg-[#12121a]">
                      <CardHeader>
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <CardTitle className="text-white">{call.caller_name || 'Unknown caller'}</CardTitle>
                            <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {call.phone_number || 'No phone captured'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDuration(call.duration_seconds)}
                              </span>
                              <span>{formatDate(call.started_at || call.created_at)}</span>
                            </div>
                          </div>

                          <Badge className={statusBadge(call.status)}>
                            {call.outcome_label || call.status || 'Completed'}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-5">
                        <AudioPlayer
                          src={call.recording_url || call.stereo_recording_url}
                          duration={formatDuration(call.duration_seconds)}
                        />

                        <div>
                          <h4 className="mb-2 text-sm font-semibold text-white">AI Summary</h4>
                          <p className="text-sm leading-7 text-gray-400">
                            {call.summary || 'No summary captured yet.'}
                          </p>
                        </div>

                        {call.transcript && (
                          <details className="rounded-2xl border border-white/5 bg-black/20 p-4">
                            <summary className="cursor-pointer text-sm font-semibold text-white">
                              View transcript
                            </summary>
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-400">
                              {call.transcript}
                            </p>
                          </details>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="setup">
                <div className="space-y-5">
                  <Card className="border-white/5 bg-[#12121a]">
                    <CardHeader>
                      <CardTitle className="text-white">Setup tasks</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {tasks.length === 0 && <p className="text-gray-400">No onboarding tasks are visible yet.</p>}

                      {tasks.map((task) => (
                        <div key={task.id} className="flex items-start gap-3 rounded-2xl border border-white/5 bg-black/20 p-4">
                          {task.completed ? (
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                          ) : (
                            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                          )}
                          <div>
                            <p className="font-medium text-white">{task.task_name}</p>
                            <p className="mt-1 text-sm text-gray-500">
                              {task.task_phase || 'Setup'} {task.due_date ? `• Due ${task.due_date}` : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-white/5 bg-[#12121a]">
                    <CardHeader>
                      <CardTitle className="text-white">Secure setup requests</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {secureSetupRequests.length === 0 && (
                        <p className="text-gray-400">No secure setup submissions are visible yet.</p>
                      )}

                      {secureSetupRequests.map((request) => (
                        <div key={request.id} className="rounded-2xl border border-white/5 bg-black/20 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="font-medium text-white">
                              {request.corrected_business_name || request.captured_business_name || 'Setup request'}
                            </p>
                            <Badge className={statusBadge(request.status)}>{request.status || 'pending'}</Badge>
                          </div>
                          <p className="mt-2 text-sm text-gray-500">Created {formatDate(request.created_at)}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
