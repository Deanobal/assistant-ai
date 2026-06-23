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
  PlugZap,
  MessageSquareText,
  TrendingUp,
  CalendarCheck,
  Flag,
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

function percent(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function compactLabel(value, fallback = 'Unknown') {
  return String(value || fallback).replace(/_/g, ' ');
}

function normalizeStatus(value) {
  return String(value || '').toLowerCase().replace(/[\s-]+/g, '_');
}

function isConnectedStatus(value) {
  const clean = normalizeStatus(value);
  return clean.includes('connected') && !clean.includes('not_connected') && !clean.includes('disconnected');
}

function statusBadge(status) {
  const clean = normalizeStatus(status);

  if (clean.includes('error') || clean.includes('failed') || clean.includes('blocked')) {
    return 'bg-red-500/10 text-red-300 border-red-500/20';
  }

  if (clean.includes('not_connected') || clean.includes('disconnected')) {
    return 'bg-white/5 text-gray-300 border-white/10';
  }

  if (clean.includes('active') || clean.includes('paid') || clean.includes('live') || isConnectedStatus(clean) || clean.includes('booked')) {
    return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
  }

  if (clean.includes('pending') || clean.includes('draft') || clean.includes('onboarding') || clean.includes('planned')) {
    return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
  }

  return 'bg-white/5 text-gray-300 border-white/10';
}

function sentimentBadge(sentiment) {
  const lower = String(sentiment || '').toLowerCase();

  if (lower.includes('positive') || lower.includes('happy') || lower.includes('good')) {
    return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
  }

  if (lower.includes('negative') || lower.includes('angry') || lower.includes('poor')) {
    return 'bg-red-500/10 text-red-300 border-red-500/20';
  }

  if (lower.includes('neutral')) {
    return 'bg-slate-500/10 text-slate-300 border-slate-500/20';
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
      callRecords: [],
      intake: null,
      tasks: [],
      secureSetupRequests: [],
      integrations: [],
      notes: [],
    };
  }

  const [billingResult, callsResult, callRecordsResult, intakeResult, tasksResult, setupResult, integrationsResult, notesResult] = await Promise.all([
    supabase.from('billing_status').select('*').eq('client_id', client.id).limit(1),
    supabase
      .from('client_call_recordings')
      .select('*')
      .eq('client_id', client.id)
      .order('started_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false, nullsFirst: false })
      .limit(50),
    supabase
      .from('call_records')
      .select('*')
      .eq('client_id', client.id)
      .order('timestamp', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(100),
    supabase.from('intake_forms').select('*').eq('client_id', client.id).limit(1),
    supabase
      .from('onboarding_tasks')
      .select('*')
      .eq('client_id', client.id)
      .order('task_phase', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(100),
    supabase
      .from('secure_setup_requests')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('integration_status')
      .select('*')
      .eq('client_id', client.id)
      .order('integration_type', { ascending: true, nullsFirst: false })
      .order('integration_name', { ascending: true })
      .limit(50),
    supabase
      .from('client_notes')
      .select('*')
      .eq('client_id', client.id)
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  for (const result of [billingResult, callsResult, callRecordsResult, intakeResult, tasksResult, setupResult, integrationsResult, notesResult]) {
    if (result.error) throw result.error;
  }

  return {
    client,
    billing: billingResult.data?.[0] || null,
    calls: callsResult.data || [],
    callRecords: callRecordsResult.data || [],
    intake: intakeResult.data?.[0] || null,
    tasks: tasksResult.data || [],
    secureSetupRequests: setupResult.data || [],
    integrations: integrationsResult.data || [],
    notes: notesResult.data || [],
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
  const callRecords = portalData?.callRecords || [];
  const tasks = portalData?.tasks || [];
  const secureSetupRequests = portalData?.secureSetupRequests || [];
  const integrations = portalData?.integrations || [];
  const notes = portalData?.notes || [];

  const progress = useMemo(() => {
    if (!tasks.length) return 0;
    const completed = tasks.filter((task) => task.completed).length;
    return Math.round((completed / tasks.length) * 100);
  }, [tasks]);

  const callAnalytics = useMemo(() => {
    const total = callRecords.length;
    const appointments = callRecords.filter((call) => call.appointment_booked).length;
    const followUps = callRecords.filter((call) => call.follow_up_required).length;

    const sentimentCounts = callRecords.reduce((acc, call) => {
      const key = compactLabel(call.sentiment, 'Unknown');
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const outcomeCounts = callRecords.reduce((acc, call) => {
      const key = compactLabel(call.outcome_label || call.call_status || call.status, 'Unknown');
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      appointments,
      appointmentRate: percent(appointments, total),
      followUps,
      followUpRate: percent(followUps, total),
      sentimentCounts,
      outcomeCounts,
    };
  }, [callRecords]);

  const integrationSummary = useMemo(() => {
    const connected = integrations.filter((item) => isConnectedStatus(item.connection_status)).length;
    const planned = integrations.filter((item) => normalizeStatus(item.connection_status).includes('planned')).length;
    const errors = integrations.filter((item) => {
      const clean = normalizeStatus(item.connection_status);
      return clean.includes('error') || clean.includes('failed') || clean.includes('blocked');
    }).length;
    return { connected, planned, errors };
  }, [integrations]);

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
                ? `Review billing, setup progress, integrations, updates, and AI call activity for ${client.business_name}.`
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
                <TabsTrigger value="integrations">
                  <PlugZap className="mr-2 h-4 w-4" />
                  Integrations
                </TabsTrigger>
                <TabsTrigger value="setup">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Setup
                </TabsTrigger>
                <TabsTrigger value="updates">
                  <MessageSquareText className="mr-2 h-4 w-4" />
                  Updates
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
                  <div className="grid gap-4 md:grid-cols-4">
                    <Card className="border-white/5 bg-[#12121a]">
                      <CardContent className="p-5">
                        <div className="mb-2 flex items-center gap-2 text-gray-400">
                          <Headphones className="h-4 w-4" />
                          Analysed calls
                        </div>
                        <p className="text-2xl font-semibold text-white">{callAnalytics.total}</p>
                      </CardContent>
                    </Card>

                    <Card className="border-white/5 bg-[#12121a]">
                      <CardContent className="p-5">
                        <div className="mb-2 flex items-center gap-2 text-gray-400">
                          <CalendarCheck className="h-4 w-4" />
                          Appointments
                        </div>
                        <p className="text-2xl font-semibold text-white">{callAnalytics.appointmentRate}%</p>
                        <p className="mt-1 text-sm text-gray-500">{callAnalytics.appointments} booked</p>
                      </CardContent>
                    </Card>

                    <Card className="border-white/5 bg-[#12121a]">
                      <CardContent className="p-5">
                        <div className="mb-2 flex items-center gap-2 text-gray-400">
                          <Flag className="h-4 w-4" />
                          Follow-up
                        </div>
                        <p className="text-2xl font-semibold text-white">{callAnalytics.followUpRate}%</p>
                        <p className="mt-1 text-sm text-gray-500">{callAnalytics.followUps} flagged</p>
                      </CardContent>
                    </Card>

                    <Card className="border-white/5 bg-[#12121a]">
                      <CardContent className="p-5">
                        <div className="mb-2 flex items-center gap-2 text-gray-400">
                          <TrendingUp className="h-4 w-4" />
                          Top outcome
                        </div>
                        <p className="text-lg font-semibold text-white">
                          {Object.entries(callAnalytics.outcomeCounts).sort((a, b) => b[1] - a[1])?.[0]?.[0] || '—'}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {callRecords.length > 0 && (
                    <Card className="border-white/5 bg-[#12121a]">
                      <CardHeader>
                        <CardTitle className="text-white">Call analytics dashboard</CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-6 lg:grid-cols-2">
                        <Breakdown title="Sentiment" items={callAnalytics.sentimentCounts} />
                        <Breakdown title="Outcomes" items={callAnalytics.outcomeCounts} />
                      </CardContent>
                    </Card>
                  )}

                  {callRecords.length > 0 && (
                    <Card className="border-white/5 bg-[#12121a]">
                      <CardHeader>
                        <CardTitle className="text-white">Call outcomes</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {callRecords.map((record) => (
                          <div key={record.id} className="rounded-2xl border border-white/5 bg-black/20 p-4">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                              <div>
                                <p className="font-semibold text-white">{record.caller_name || 'Unknown caller'}</p>
                                <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
                                  <span>{record.caller_phone || 'No phone captured'}</span>
                                  <span>{formatDate(record.timestamp || record.created_at)}</span>
                                  <span>{record.enquiry_category || 'Uncategorised'}</span>
                                  <span>{formatDuration(record.call_duration_seconds || record.duration)}</span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Badge className={sentimentBadge(record.sentiment)}>{compactLabel(record.sentiment, 'No sentiment')}</Badge>
                                <Badge className={statusBadge(record.outcome_label || record.call_status || record.status)}>
                                  {compactLabel(record.outcome_label || record.call_status || record.status, 'No outcome')}
                                </Badge>
                                {record.appointment_booked && <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-300">Appointment booked</Badge>}
                                {record.follow_up_required && <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-300">Follow-up required</Badge>}
                              </div>
                            </div>
                            <p className="mt-3 text-sm leading-7 text-gray-400">{record.ai_summary || 'No AI summary captured.'}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {calls.length === 0 && (
                    <Card className="border-white/5 bg-[#12121a]">
                      <CardContent className="p-8 text-center text-gray-400">
                        {callRecords.length > 0
                          ? 'Call analytics are available, but no playable audio recording has been attached to this client yet.'
                          : 'No AI call recordings have been captured for this client yet.'}
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

              <TabsContent value="integrations">
                <div className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-white/5 bg-[#12121a]">
                      <CardContent className="p-5">
                        <p className="text-sm text-gray-500">Connected</p>
                        <p className="mt-2 text-2xl font-semibold text-white">{integrationSummary.connected}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-white/5 bg-[#12121a]">
                      <CardContent className="p-5">
                        <p className="text-sm text-gray-500">Planned</p>
                        <p className="mt-2 text-2xl font-semibold text-white">{integrationSummary.planned}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-white/5 bg-[#12121a]">
                      <CardContent className="p-5">
                        <p className="text-sm text-gray-500">Needs attention</p>
                        <p className="mt-2 text-2xl font-semibold text-white">{integrationSummary.errors}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-white/5 bg-[#12121a]">
                    <CardHeader>
                      <CardTitle className="text-white">Connected services</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {integrations.length === 0 && <p className="text-gray-400">No integrations are visible yet.</p>}

                      {integrations.map((integration) => (
                        <div key={integration.id} className="rounded-2xl border border-white/5 bg-black/20 p-4">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                              <p className="font-semibold text-white">{integration.integration_name || 'Integration'}</p>
                              <p className="mt-1 text-sm text-gray-500">
                                {compactLabel(integration.integration_type, 'Service')} {integration.last_sync ? `• Last sync ${formatDate(integration.last_sync)}` : ''}
                              </p>
                              {integration.notes && <p className="mt-3 text-sm leading-7 text-gray-400">{integration.notes}</p>}
                            </div>
                            <Badge className={statusBadge(integration.connection_status)}>
                              {compactLabel(integration.connection_status, 'Not connected')}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
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

              <TabsContent value="updates">
                <Card className="border-white/5 bg-[#12121a]">
                  <CardHeader>
                    <CardTitle className="text-white">Client updates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {notes.length === 0 && <p className="text-gray-400">No client updates are visible yet.</p>}

                    {notes.map((note) => (
                      <div key={note.id} className="rounded-2xl border border-white/5 bg-black/20 p-4">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <Badge className="border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
                            {compactLabel(note.note_type, 'Update')}
                          </Badge>
                          <span className="text-sm text-gray-500">{formatDate(note.created_at)}</span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-7 text-gray-300">{note.content || 'No update content.'}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}

function Breakdown({ title, items }) {
  const entries = Object.entries(items || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-white">{title}</h4>
      <div className="space-y-2">
        {entries.length === 0 && <p className="text-sm text-gray-500">No data yet.</p>}
        {entries.map(([label, count]) => (
          <div key={label} className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-3 py-2">
            <span className="text-sm text-gray-300">{label}</span>
            <span className="text-sm font-semibold text-white">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
