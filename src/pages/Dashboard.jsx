import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Calendar, Users, TrendingUp, ArrowUp, Lock, Headphones, CreditCard, Link2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import OnboardingWizard from '../components/dashboard/OnboardingWizard';
import CallRecordings from '../components/dashboard/CallRecordings';
import BillingSection from '../components/dashboard/BillingSection';
import PortalIntegrations from '../components/dashboard/PortalIntegrations';

const stats = [
  { icon: Phone, label: 'Calls Handled', value: '1,247', change: '+18%', description: 'sample last 30 days' },
  { icon: Calendar, label: 'Appointments Booked', value: '342', change: '+24%', description: 'sample last 30 days' },
  { icon: Users, label: 'Leads Captured', value: '589', change: '+12%', description: 'sample last 30 days' },
  { icon: TrendingUp, label: 'Response Time', value: '< 2s', change: 'Fast', description: 'sample average' },
];

const recentActivity = [
  { type: 'Call', contact: 'Sarah M.', time: '2 hours ago', status: 'Qualified' },
  { type: 'Appointment', contact: 'Emma D.', time: '4 hours ago', status: 'Booked' },
  { type: 'Lead', contact: 'Mark J.', time: '6 hours ago', status: 'Follow Up Needed' },
  { type: 'Call', contact: 'David C.', time: '8 hours ago', status: 'Urgent' },
  { type: 'Appointment', contact: 'Clinic Enquiry', time: '10 hours ago', status: 'Confirmed' },
];

const supportItems = ['Contact Support', 'Account help', 'Onboarding assistance', 'Optimisation help'];

export default function Dashboard() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const onboarded = localStorage.getItem('dashboard_onboarded');

    const loadAccess = async () => {
      const authenticated = await base44.auth.isAuthenticated();

      if (!authenticated) {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setIsCheckingAuth(false);
        return;
      }

      const user = await base44.auth.me();
      setIsAuthenticated(true);
      setIsAdmin(user?.role === 'admin');
      setShowOnboarding(onboarded !== 'true');
      setIsCheckingAuth(false);
    };

    loadAccess();
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('dashboard_onboarded', 'true');
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="bg-[#12121a] border-white/5">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-white text-center mb-2">Admin Team Login</h2>
              <p className="text-gray-400 text-center mb-6">Sign in with your admin account to access the AssistantAI team dashboard.</p>
              <Button
                onClick={() => base44.auth.redirectToLogin('/Dashboard')}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25"
              >
                Continue to Login
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="bg-[#12121a] border-white/5">
            <CardContent className="p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Admin Access Only</h2>
                <p className="text-gray-400">This area is reserved for AssistantAI admin team members.</p>
              </div>
              <Button
                variant="outline"
                onClick={() => base44.auth.logout('/Home')}
                className="w-full border-white/10 text-white hover:bg-white/5"
              >
                Return to Website
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Welcome to AssistantAI</h1>
            <p className="text-gray-400">Let’s get your team dashboard configured in 3 quick steps</p>
          </motion.div>
          <OnboardingWizard onComplete={handleOnboardingComplete} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">Admin Dashboard</Badge>
            <Badge className="bg-white/5 text-gray-300 border-white/10">Internal Team Access</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Team Overview</h1>
          <p className="text-gray-400">Monitor calls, leads, bookings, integrations, and billing from one internal workspace.</p>
        </motion.div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-[#12121a] border border-white/5 flex flex-wrap h-auto">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500">
              Overview
            </TabsTrigger>
            <TabsTrigger value="calls" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500">
              <Headphones className="w-4 h-4 mr-2" />
              Call Recordings
            </TabsTrigger>
            <TabsTrigger value="integrations" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500">
              <Link2 className="w-4 h-4 mr-2" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500">
              <CreditCard className="w-4 h-4 mr-2" />
              Billing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className="bg-[#12121a] border-white/5">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center">
                          <stat.icon className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div className="flex items-center gap-1 text-xs font-medium text-green-400">
                          <ArrowUp className="w-3 h-3" />
                          {stat.change}
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                      <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
                      <p className="text-gray-600 text-xs">{stat.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-2"
              >
                <Card className="bg-[#12121a] border-white/5">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-[#0a0a0f] border border-white/5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-cyan-400" />
                            </div>
                            <div>
                              <p className="text-white font-medium text-sm">{activity.contact}</p>
                              <p className="text-gray-500 text-xs">{activity.type} • {activity.time}</p>
                            </div>
                          </div>
                          <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                            <span className="text-cyan-400 text-xs font-medium">{activity.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-[#12121a] border-white/5 mb-6">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Avg. Call Duration</span>
                      <span className="text-white font-semibold">3m 24s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Lead Quality</span>
                      <span className="text-white font-semibold">High intent</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Follow-up automation</span>
                      <span className="text-white font-semibold">Active</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Support status</span>
                      <span className="text-white font-semibold">Included</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
                  <CardContent className="p-6">
                    <h3 className="text-white font-semibold mb-3">Support</h3>
                    <div className="space-y-3 mb-5">
                      {supportItems.map((item) => (
                        <div key={item} className="text-sm text-gray-300 rounded-xl bg-[#0a0a0f]/40 border border-white/5 px-4 py-3">
                          {item}
                        </div>
                      ))}
                    </div>
                    <button className="w-full px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
                      Contact Support
                    </button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="calls">
            <CallRecordings />
          </TabsContent>

          <TabsContent value="integrations">
            <PortalIntegrations />
          </TabsContent>

          <TabsContent value="billing">
            <BillingSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}