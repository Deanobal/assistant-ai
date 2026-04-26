import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, BriefcaseBusiness, Inbox, LogOut, MessageSquare, Rocket, ShieldCheck } from 'lucide-react';

const navItems = [
  {
    label: 'Action Inbox',
    path: '/ActionInbox',
    icon: Inbox,
    subtitle: 'Live response queue',
    match: ['/ActionInbox', '/UnmatchedSmsInbox'],
  },
  {
    label: 'Leads',
    path: '/LeadDashboard',
    icon: BarChart3,
    subtitle: 'Pipeline and follow-up',
    match: ['/LeadDashboard', '/LeadDetail'],
  },
  {
    label: 'Onboarding',
    path: '/Onboarding',
    icon: Rocket,
    subtitle: 'Rollout progress',
    match: ['/Onboarding', '/OnboardingIntake'],
  },
  {
    label: 'Support',
    path: '/SupportInbox',
    icon: MessageSquare,
    subtitle: 'All support threads',
    match: ['/SupportInbox'],
  },
  {
    label: 'Admin',
    path: '/ClientManager',
    icon: ShieldCheck,
    subtitle: 'System controls',
    match: ['/ClientManager', '/ClientWorkspace', '/TeamAccess', '/SystemReadiness'],
  },
];

export default function AdminLayout() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const authenticated = await base44.auth.isAuthenticated();
      if (!authenticated) {
        base44.auth.redirectToLogin(`${window.location.pathname}${window.location.search}`);
        return;
      }

      const user = await base44.auth.me();
      setIsAdmin(user?.role === 'admin');
      setIsLoading(false);
    };

    checkAccess();
  }, []);

  const { data: unreadConversations = [] } = useQuery({
    queryKey: ['admin-support-unread-count'],
    queryFn: () => base44.entities.SupportConversation.filter({ unread_for_admin: true }, '-updated_at', 200),
    initialData: [],
    enabled: !isLoading && isAdmin,
  });

  const { data: unmatchedSms = [] } = useQuery({
    queryKey: ['admin-unmatched-sms-count'],
    queryFn: () => base44.entities.NotificationLog.filter({ channel: 'sms', event_type: 'customer_sms_reply_unmatched' }, '-created_date', 200),
    initialData: [],
    enabled: !isLoading && isAdmin,
  });

  useEffect(() => {
    if (isLoading || !isAdmin) return undefined;
    const refreshCounts = () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['admin-unmatched-sms-count'] });
    };

    const unsubscribeConversation = base44.entities.SupportConversation.subscribe(refreshCounts);
    const unsubscribeNotification = base44.entities.NotificationLog.subscribe(refreshCounts);

    return () => {
      unsubscribeConversation?.();
      unsubscribeNotification?.();
    };
  }, [isLoading, isAdmin, queryClient]);

  const unreadSupportCount = unreadConversations.filter((conversation) => !['resolved', 'closed'].includes(conversation.status)).length;
  const actionCount = unreadSupportCount + unmatchedSms.length;
  const activeNavItem = navItems.find((item) => item.match.some((path) => location.pathname.startsWith(path))) || navItems[0];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07070d]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07070d] px-6">
        <Card className="w-full max-w-md border-white/5 bg-[#12121a]">
          <CardContent className="space-y-4 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
              <BriefcaseBusiness className="h-7 w-7 text-cyan-400" />
            </div>
            <div>
              <h1 className="mb-2 text-2xl font-bold text-white">Admin Access Only</h1>
              <p className="text-gray-400">This internal workspace is reserved for the AssistantAI team.</p>
            </div>
            <Button variant="outline" onClick={() => base44.auth.logout('/')} className="w-full border-white/10 bg-transparent text-white hover:bg-white/5">
              Return to Website
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06070b] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-white/10 bg-[#0b0f18] p-6 lg:flex">
          <Link to="/ActionInbox" className="mb-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500">
              <BriefcaseBusiness className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-semibold">AssistantAI</p>
              <p className="text-sm text-slate-500">Internal Operations</p>
            </div>
          </Link>

          <div className="flex-1 space-y-2">
            {navItems.map((item) => {
              const isActive = item.match.some((path) => location.pathname.startsWith(path));
              const count = item.path === '/ActionInbox' ? actionCount : item.path === '/SupportInbox' ? unreadSupportCount : 0;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors ${isActive ? 'border-cyan-400/40 bg-cyan-500/12 text-white ring-1 ring-cyan-300/10' : item.label === 'Admin' ? 'border-transparent text-slate-500 hover:bg-white/[0.02] hover:text-slate-200' : 'border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-white'}`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <item.icon className="h-4 w-4 shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.label}</p>
                      <p className="truncate text-xs text-slate-500">{item.subtitle}</p>
                    </div>
                  </div>
                  {count > 0 && <Badge className="shrink-0 border-cyan-500/20 bg-cyan-500/10 text-cyan-200">{count}</Badge>}
                </Link>
              );
            })}
          </div>

          <Button variant="outline" onClick={() => base44.auth.logout('/Home')} className="border-white/10 text-white hover:bg-white/5">
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0f18]/92 px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">AssistantAI Internal Workspace</p>
                <h1 className="text-xl font-semibold text-white">{activeNavItem.label}</h1>
              </div>
              <Badge className="border-cyan-500/20 bg-cyan-500/10 text-cyan-300">{activeNavItem.subtitle}</Badge>
            </div>
          </header>

          <main className="px-4 py-5 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-8 lg:pb-8">
            <Outlet />
          </main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0b0f18]/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-5 gap-2">
          {navItems.map((item) => {
            const isActive = item.match.some((path) => location.pathname.startsWith(path));
            const count = item.path === '/ActionInbox' ? actionCount : item.path === '/SupportInbox' ? unreadSupportCount : 0;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex min-h-[56px] flex-col items-center justify-center rounded-2xl px-2 text-center text-xs ${isActive ? 'bg-cyan-500/10 text-cyan-200' : 'text-slate-400'}`}
              >
                <item.icon className="mb-1 h-4 w-4" />
                <span>{item.label}</span>
                {count > 0 && <span className="absolute right-2 top-1 rounded-full bg-cyan-400 px-1.5 text-[10px] font-semibold text-slate-950">{count}</span>}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}