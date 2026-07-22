import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, Bell, BriefcaseBusiness, ExternalLink, Home, Inbox, LogOut, MessageSquare, PlugZap, Radio, Rocket, Search, ShieldCheck, TrendingUp } from 'lucide-react';
import AdminAICopilot from './AdminAICopilot';

const navItems = [
  { label: 'Home', path: '/admin', icon: Home, subtitle: 'Control centre', match: ['/admin'], group: 'Operate' },
  { label: 'Analytics', path: '/Analytics', icon: Radio, subtitle: 'Live site intelligence', match: ['/Analytics'], group: 'Operate' },
  { label: 'Action Inbox', path: '/ActionInbox', icon: Inbox, subtitle: 'Live response queue', match: ['/ActionInbox', '/UnmatchedSmsInbox'], group: 'Operate' },
  { label: 'Leads', path: '/LeadDashboard', icon: BarChart3, subtitle: 'Pipeline and follow-up', match: ['/LeadDashboard', '/LeadDetail'], group: 'Operate' },
  { label: 'Onboarding', path: '/Onboarding', icon: Rocket, subtitle: 'Rollout progress', match: ['/Onboarding', '/OnboardingIntake'], group: 'Operate' },
  { label: 'Support', path: '/SupportInbox', icon: MessageSquare, subtitle: 'All support threads', match: ['/SupportInbox'], group: 'Operate' },
  { label: 'Clients', path: '/ClientManager', icon: BriefcaseBusiness, subtitle: 'Live accounts', match: ['/ClientManager', '/ClientWorkspace'], group: 'Manage' },
  { label: 'Connectors', path: '/ClientConnectors', icon: PlugZap, subtitle: 'Client setup hub', match: ['/ClientConnectors'], group: 'Manage' },
  { label: 'System', path: '/SystemReadiness', icon: ShieldCheck, subtitle: 'Readiness and access', match: ['/TeamAccess', '/SystemReadiness'], group: 'Manage' },
  { label: 'Marketing', path: '/admin/marketing/seo-dashboard', icon: TrendingUp, subtitle: 'SEO and campaigns', match: ['/admin/marketing'], group: 'Grow' },
];

const quickActions = [
  { label: 'Analytics', path: '/Analytics' },
  { label: 'Reply queue', path: '/ActionInbox' },
  { label: 'New client', path: '/Onboarding' },
  { label: 'Connectors', path: '/ClientConnectors' },
  { label: 'Readiness', path: '/SystemReadiness' },
];

function getCount(item, actionCount, unreadSupportCount) {
  if (item.path === '/ActionInbox') return actionCount;
  if (item.path === '/SupportInbox') return unreadSupportCount;
  return 0;
}

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      try {
        const authenticated = await base44.auth.isAuthenticated();
        if (!authenticated) {
          navigate(`/AdminLogin?from=${encodeURIComponent(location.pathname)}`, { replace: true });
          return;
        }
        if (!cancelled) setIsLoading(false);
      } catch {
        navigate(`/AdminLogin?from=${encodeURIComponent(location.pathname)}`, { replace: true });
      }
    }

    verifySession();
    return () => { cancelled = true; };
  }, [navigate, location.pathname]);

  const { data: unreadConversations = [] } = useQuery({
    queryKey: ['admin-support-unread-count'],
    queryFn: () => base44.entities.SupportConversation.filter({ unread_for_admin: true }, '-updated_at', 200),
    initialData: [],
    enabled: !isLoading,
  });

  const { data: unmatchedSms = [] } = useQuery({
    queryKey: ['admin-unmatched-sms-count'],
    queryFn: () => base44.entities.NotificationLog.filter({ channel: 'sms', event_type: 'customer_sms_reply_unmatched' }, '-created_date', 200),
    initialData: [],
    enabled: !isLoading,
  });

  useEffect(() => {
    if (isLoading) return undefined;

    const refreshCounts = () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['admin-unmatched-sms-count'] });
    };

    const subscriptions = [];

    try {
      const supportSubscribe = base44?.entities?.SupportConversation?.subscribe;
      if (typeof supportSubscribe === 'function') {
        const unsubscribe = supportSubscribe(refreshCounts);
        if (typeof unsubscribe === 'function') subscriptions.push(unsubscribe);
      }

      const notificationSubscribe = base44?.entities?.NotificationLog?.subscribe;
      if (typeof notificationSubscribe === 'function') {
        const unsubscribe = notificationSubscribe(refreshCounts);
        if (typeof unsubscribe === 'function') subscriptions.push(unsubscribe);
      }
    } catch (error) {
      console.warn('Admin realtime subscriptions unavailable:', error);
    }

    return () => {
      subscriptions.forEach((unsubscribe) => {
        try {
          unsubscribe?.();
        } catch (error) {
          console.warn('Admin realtime unsubscribe failed:', error);
        }
      });
    };
  }, [isLoading, queryClient]);

  const unreadSupportCount = unreadConversations.filter((conversation) => !['resolved', 'closed'].includes(conversation.status)).length;
  const actionCount = unreadSupportCount + unmatchedSms.length;
  const activeNavItem = navItems.find((item) => item.match.some((path) => location.pathname.startsWith(path))) || navItems[0];
  const groupedNavItems = navItems.reduce((groups, item) => {
    groups[item.group] = groups[item.group] || [];
    groups[item.group].push(item);
    return groups;
  }, {});

  const handleLogout = async () => {
    try {
      await base44.auth.logout();
    } finally {
      navigate('/AdminLogin', { replace: true });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f6f7]">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f6f7] text-slate-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-white/10 bg-[#111827] text-white lg:flex">
          <div className="border-b border-white/10 p-5">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-950 shadow-sm">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-semibold leading-tight">AssistantAI</p>
                <p className="text-xs text-slate-400">Operations admin</p>
              </div>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <Link to="/" className="mb-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white">
              <span>Back to public site</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            <div className="space-y-5">
              {Object.entries(groupedNavItems).map(([group, items]) => (
                <div key={group}>
                  <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">{group}</p>
                  <div className="space-y-1">
                    {items.map((item) => {
                      const isActive = item.match.some((path) => location.pathname.startsWith(path));
                      const count = getCount(item, actionCount, unreadSupportCount);
                      const Icon = item.icon;
                      return (
                        <Link key={item.path} to={item.path} className={`group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition ${isActive ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-300 hover:bg-white/10'}`}>
                          <div className="flex min-w-0 items-center gap-3">
                            <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-white'}`} />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">{item.label}</p>
                              <p className={`truncate text-[11px] ${isActive ? 'text-slate-500' : 'text-slate-500'}`}>{item.subtitle}</p>
                            </div>
                          </div>
                          {count > 0 && <Badge className="shrink-0 border-0 bg-emerald-500 text-white">{count}</Badge>}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 p-4">
            <Button onClick={handleLogout} className="w-full justify-start rounded-xl bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] shadow-sm shadow-slate-200/60 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <span>AssistantAI admin</span>
                  <span>/</span>
                  <span>{activeNavItem.subtitle}</span>
                </div>
                <h1 className="mt-1 truncate text-2xl font-bold tracking-tight text-slate-950">{activeNavItem.label}</h1>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="hidden min-w-[260px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 xl:flex">
                  <Search className="h-4 w-4" />
                  <span>Search leads, clients, tasks...</span>
                </div>
                {quickActions.map((action) => (
                  <Link key={action.path} to={action.path} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                    {action.label}
                  </Link>
                ))}
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
                  <Bell className="h-4 w-4 text-slate-600" />
                  {actionCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white">{actionCount}</span>}
                </div>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1540px] px-4 py-6 pb-[calc(6.75rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-8 lg:pb-10">
            <Outlet />
          </main>
        </div>
      </div>

      <AdminAICopilot />

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-10 gap-1">
          {navItems.map((item) => {
            const isActive = item.match.some((path) => location.pathname.startsWith(path));
            const count = getCount(item, actionCount, unreadSupportCount);
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path} className={`relative flex min-h-[58px] flex-col items-center justify-center rounded-2xl px-1 text-center text-[10px] font-semibold ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}>
                <Icon className="mb-1 h-4 w-4" />
                <span>{item.label}</span>
                {count > 0 && <span className="absolute right-1 top-1 rounded-full bg-emerald-500 px-1.5 text-[10px] font-bold text-white">{count}</span>}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
