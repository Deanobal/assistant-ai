import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BriefcaseBusiness, LogOut, UsersRound, ShieldCheck, Rocket, BarChart3, CircleDashed, Inbox, MessageSquare } from 'lucide-react';

const navItems = [
  { label: 'Lead Dashboard', path: '/LeadDashboard', icon: BarChart3 },
  { label: 'Client Manager', path: '/ClientManager', icon: UsersRound },
  { label: 'Onboarding', path: '/Onboarding', icon: Rocket },
  { label: 'Support Inbox', path: '/SupportInbox', icon: Inbox },
  { label: 'Unmatched SMS', path: '/UnmatchedSmsInbox', icon: MessageSquare },
  { label: 'Team Access', path: '/TeamAccess', icon: ShieldCheck },
  { label: 'System Readiness', path: '/SystemReadiness', icon: CircleDashed },
];

export default function AdminLayout() {
  const location = useLocation();
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

  const unreadSupportCount = unreadConversations.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07070d] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#07070d] flex items-center justify-center px-6">
        <Card className="bg-[#12121a] border-white/5 max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl mx-auto bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center">
              <BriefcaseBusiness className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Admin Access Only</h1>
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
    <div className="min-h-screen bg-[#07070d] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex w-72 border-r border-white/5 bg-[#0c0c12] flex-col p-6">
          <Link to="/ClientManager" className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <BriefcaseBusiness className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-lg">AssistantAI</p>
              <p className="text-sm text-gray-500">Internal Admin</p>
            </div>
          </Link>

          <div className="space-y-2 flex-1">
            {navItems.map((item) => {
              const showUnreadCount = item.path === '/SupportInbox' && unreadSupportCount > 0;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 border transition-colors ${location.pathname === item.path ? 'border-cyan-500/30 bg-cyan-500/10 text-white' : 'border-transparent text-gray-400 hover:text-white hover:bg-white/[0.03]'}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {showUnreadCount && (
                    <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20 shrink-0">{unreadSupportCount}</Badge>
                  )}
                </Link>
              );
            })}
          </div>

          <Button variant="outline" onClick={() => base44.auth.logout('/Home')} className="border-white/10 text-white hover:bg-white/5">
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="border-b border-white/5 bg-[#0c0c12]/80 backdrop-blur-xl px-6 py-5 flex items-center justify-between gap-4 sticky top-0 z-20">
            <div>
              <p className="text-sm text-gray-500">AssistantAI Internal Workspace</p>
              <h1 className="text-xl font-semibold">Client Manager</h1>
            </div>
            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">Agency Admin</Badge>
          </header>
          <main className="p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}