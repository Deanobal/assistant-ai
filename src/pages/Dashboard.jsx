import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Calendar, Users, TrendingUp, ArrowUp, ArrowDown, Lock, Headphones, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OnboardingWizard from '../components/dashboard/OnboardingWizard';
import CallRecordings from '../components/dashboard/CallRecordings';
import BillingSection from '../components/dashboard/BillingSection';

const stats = [
  { 
    icon: Phone, 
    label: 'Calls Handled', 
    value: '1,247', 
    change: '+18%', 
    trend: 'up',
    description: 'vs last month'
  },
  { 
    icon: Calendar, 
    label: 'Appointments Booked', 
    value: '342', 
    change: '+24%', 
    trend: 'up',
    description: 'vs last month'
  },
  { 
    icon: Users, 
    label: 'Leads Captured', 
    value: '589', 
    change: '+12%', 
    trend: 'up',
    description: 'vs last month'
  },
  { 
    icon: TrendingUp, 
    label: 'Response Time', 
    value: '< 2s', 
    change: '-15%', 
    trend: 'up',
    description: 'improvement'
  },
];

const recentActivity = [
  { type: 'Call', contact: 'John Smith', time: '2 hours ago', status: 'Qualified' },
  { type: 'Appointment', contact: 'Sarah Johnson', time: '4 hours ago', status: 'Booked' },
  { type: 'Lead', contact: 'Mike Davis', time: '6 hours ago', status: 'New' },
  { type: 'Call', contact: 'Emma Wilson', time: '8 hours ago', status: 'Follow-up' },
  { type: 'Appointment', contact: 'David Brown', time: '10 hours ago', status: 'Confirmed' },
];

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const authenticated = localStorage.getItem('dashboard_authenticated');
    const onboarded = localStorage.getItem('dashboard_onboarded');
    if (authenticated === 'true') {
      setIsAuthenticated(true);
      setShowOnboarding(onboarded !== 'true');
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'client2026') {
      setIsAuthenticated(true);
      localStorage.setItem('dashboard_authenticated', 'true');
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('dashboard_onboarded', 'true');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="bg-[#12121a] border-white/5">
            <CardContent className="p-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-white text-center mb-2">Client Dashboard</h2>
              <p className="text-gray-400 text-center mb-6">Enter your password to access your analytics</p>
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                />
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25"
                >
                  Access Dashboard
                </Button>
              </form>
              <p className="text-gray-600 text-xs text-center mt-4">
                Demo password: client2026
              </p>
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
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Welcome to Assistant AI</h1>
            <p className="text-gray-400">Let's get your AI assistant set up in 3 quick steps</p>
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
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Client Dashboard</h1>
          <p className="text-gray-400">Manage your AI performance, calls, and billing</p>
        </motion.div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-[#12121a] border border-white/5">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500">
              Overview
            </TabsTrigger>
            <TabsTrigger value="calls" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500">
              <Headphones className="w-4 h-4 mr-2" />
              Call Recordings
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
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-[#12121a] border-white/5">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-medium ${
                      stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {stat.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
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
            transition={{ delay: 0.4 }}
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
            transition={{ delay: 0.5 }}
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
                  <span className="text-gray-400 text-sm">Conversion Rate</span>
                  <span className="text-white font-semibold">68%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Customer Satisfaction</span>
                  <span className="text-white font-semibold">4.8/5.0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Active Hours</span>
                  <span className="text-white font-semibold">24/7</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
              <CardContent className="p-6">
                <h3 className="text-white font-semibold mb-2">Need Support?</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Our team is here to help optimize your AI performance.
                </p>
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

          <TabsContent value="billing">
            <BillingSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}