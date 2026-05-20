import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LogOut, Headphones, CreditCard, Link2, BarChart3, LifeBuoy, FolderOpen, ClipboardList, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ClientOverviewSection from '../components/portal/ClientOverviewSection';
import ClientLeadsSection from '../components/portal/ClientLeadsSection';
import CallRecordings from '../components/dashboard/CallRecordings';
import AnalyticsSection from '../components/dashboard/AnalyticsSection';
import BillingSection from '../components/dashboard/BillingSection';
import PortalIntegrations from '../components/dashboard/PortalIntegrations';
import SupportSection from '../components/dashboard/SupportSection';
import PortalFilesSection from '../components/portal/PortalFilesSection';

const supportMessage = 'Your portal is open. Your live client record is still being linked, so some sections may show no data until onboarding is connected.';

function getClientId(user) {
  return user?.client_account_id || user?.client_record_id || user?.client_id || `portal-${String(user?.email || user?.id || 'client').toLowerCase()}`;
}

function normaliseSupabasePortalAccess(data, user) {
  if (!data?.success) return null;

  if (data.linked && data.client?.id) {
    return {
      clientId: data.client.id,
      client: data.client,
      billing: data.billing || null,
      intake: data.intake || null,
      integrations: data.integrations || [],
      tasks: data.tasks || [],
      notes: data.notes || [],
      status: data.state || 'linked',
      source: 'supabase',
      provisional: false,
    };
  }

  return {
    clientId: getClientId(user),
    client: { email: user?.email || '', full_name: user?.full_name || user?.name || '', business_name: user?.business_name || 'Your business' },
    billing: null,
    intake: null,
    integrations: [],
    tasks: [],
    notes: [],
    status: data.state || 'provisional',
    source: 'supabase',
    provisional: true,
  };
}

async function getSupabasePortalAccess(user) {
  const email = user?.email || user?.user_email || '';
  if (!email) return null;

  const response = await fetch('/api/client-portal-resolve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || 'Supabase portal resolver failed');
  }

  return normaliseSupabasePortalAccess(data, user);
}

async function getBase44PortalAccess(user) {
  const result = await base44.functions.invoke('resolveClientPortalAccess', {});
  const data = result?.data || result;
  if (data?.success && data?.client_id) {
    return {
      clientId: data.client_id,
      client: data.client || null,
      status: data.access_method || 'linked',
      source: 'base44',
      provisional: false,
    };
  }
  return null;
}

async function getPortalAccess(user) {
  try {
    const supabaseAccess = await getSupabasePortalAccess(user);
    if (supabaseAccess && !supabaseAccess.provisional) return supabaseAccess;
  } catch (error) {
    console.warn('Supabase portal resolver unavailable; trying Base44 resolver.', error?.message || error);
  }

  try {
    const base44Access = await getBase44PortalAccess(user);
    if (base44Access) return base44Access;
  } catch (error) {
    console.warn('Base44 portal resolver unavailable; opening authenticated portal shell.', error?.message || error);
  }

  try {
    const supabaseAccess = await getSupabasePortalAccess(user);
    if (supabaseAccess) return supabaseAccess;
  } catch (error) {
    console.warn('Supabase provisional resolver unavailable; opening local portal shell.', error?.message || error);
  }

  return {
    clientId: getClientId(user),
    client: { email: user?.email || '', full_name: user?.full_name || user?.name || '', business_name: user?.business_name || 'Your business' },
    status: 'provisional',
    source: 'local',
    provisional: true,
  };
}

export default function ClientPortal() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [access, setAccess] = useState(null);

  useEffect(() => {
    async function loadPortal() {
      try {
        const ok = await base44.auth.isAuthenticated();
        setAuthenticated(ok);
        if (ok) {
          const me = await base44.auth.me();
          const resolved = await getPortalAccess(me);
          setUser({ ...me, client_account_id: resolved.clientId });
          setAccess(resolved);
        }
      } catch (error) {
        console.error('Client portal load failed:', error);
      } finally {
        setLoading(false);
      }
    }
    loadPortal();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6"><div className="w-8 h-8 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin" /></div>;
  }

  if (!authenticated) return <Navigate to="/ClientLogin" replace />;

  const clientId = access?.clientId || getClientId(user);
  const client = access?.client || {};

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">Client Portal</Badge>
              <Badge className="bg-white/5 text-gray-300 border-white/10">Private access</Badge>
              {access?.source === 'supabase' && !access?.provisional && <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20">Supabase linked</Badge>}
              {access?.source === 'base44' && <Badge className="bg-blue-500/10 text-blue-300 border-blue-500/20">Legacy linked</Badge>}
              {access?.provisional && <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/20">Linking in progress</Badge>}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">AssistantAI Client Portal</h1>
            <p className="text-gray-400">Review call activity, billing, integrations, and support{client.business_name ? ` for ${client.business_name}` : ''}.</p>
          </div>
          <Button variant="outline" onClick={() => base44.auth.logout('/')} className="border-white/10 bg-transparent text-white hover:bg-white/5 w-fit"><LogOut className="w-4 h-4 mr-2" />Log Out</Button>
        </div>

        {access?.provisional && (
          <Card className="bg-amber-500/10 border-amber-500/20 mb-8">
            <CardContent className="p-5 flex gap-3 text-sm text-amber-100"><AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-amber-300" /><p>{supportMessage}</p></CardContent>
          </Card>
        )}

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-[#12121a] border border-white/5 flex flex-wrap h-auto gap-2 p-2 justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="leads"><ClipboardList className="w-4 h-4 mr-2" />Leads</TabsTrigger>
            <TabsTrigger value="calls"><Headphones className="w-4 h-4 mr-2" />Call Recordings</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart3 className="w-4 h-4 mr-2" />Analytics</TabsTrigger>
            <TabsTrigger value="billing"><CreditCard className="w-4 h-4 mr-2" />Billing</TabsTrigger>
            <TabsTrigger value="integrations"><Link2 className="w-4 h-4 mr-2" />Integrations</TabsTrigger>
            <TabsTrigger value="support"><LifeBuoy className="w-4 h-4 mr-2" />Support</TabsTrigger>
            <TabsTrigger value="files"><FolderOpen className="w-4 h-4 mr-2" />Files</TabsTrigger>
          </TabsList>
          <TabsContent value="overview"><ClientOverviewSection clientAccountId={clientId} portalAccess={access} /></TabsContent>
          <TabsContent value="leads"><ClientLeadsSection clientAccountId={clientId} portalAccess={access} /></TabsContent>
          <TabsContent value="calls"><CallRecordings clientAccountId={clientId} portalAccess={access} /></TabsContent>
          <TabsContent value="analytics"><AnalyticsSection clientAccountId={clientId} portalAccess={access} /></TabsContent>
          <TabsContent value="billing"><BillingSection clientId={clientId} portalAccess={access} /></TabsContent>
          <TabsContent value="integrations"><PortalIntegrations clientAccountId={clientId} portalAccess={access} /></TabsContent>
          <TabsContent value="support"><SupportSection clientAccountId={clientId} currentUser={user} portalAccess={access} /></TabsContent>
          <TabsContent value="files"><PortalFilesSection clientAccountId={clientId} portalAccess={access} /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
