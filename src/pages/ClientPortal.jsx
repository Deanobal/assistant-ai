import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Headphones, CreditCard, Link2, BarChart3, LifeBuoy, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import OverviewPreview from '../components/portal/OverviewPreview';
import CallRecordings from '../components/dashboard/CallRecordings';
import AnalyticsSection from '../components/dashboard/AnalyticsSection';
import BillingSection from '../components/dashboard/BillingSection';
import PortalIntegrations from '../components/dashboard/PortalIntegrations';
import SupportSection from '../components/dashboard/SupportSection';

export default function ClientPortal() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      const authenticated = await base44.auth.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const user = await base44.auth.me();
        setCurrentUser(user);
      }

      setIsLoading(false);
    };

    checkAccess();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/ClientLogin" replace />;
  }

  if (!currentUser?.client_account_id) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6 py-24">
        <Card className="bg-[#12121a] border-white/5 max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl mx-auto bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center">
              <Lock className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Portal Access Not Linked Yet</h1>
              <p className="text-gray-400">Your login is protected, but it has not been linked to a client business record yet.</p>
            </div>
            <Button variant="outline" onClick={() => base44.auth.logout('/')} className="w-full border-white/10 bg-transparent text-white hover:bg-white/5">
              Return to Website
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleLogout = () => {
    base44.auth.logout('/');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6"
        >
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">Client Portal</Badge>
              <Badge className="bg-white/5 text-gray-300 border-white/10">Private access</Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">AssistantAI Client Portal</h1>
            <p className="text-gray-400">Review call activity, billing, integrations, and support from one private client workspace.</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="border-white/10 bg-transparent text-white hover:bg-white/5 w-fit">
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </motion.div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-[#12121a] border border-white/5 flex flex-wrap h-auto gap-2 p-2 justify-start">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500">
              Overview
            </TabsTrigger>
            <TabsTrigger value="calls" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500">
              <Headphones className="w-4 h-4 mr-2" />
              Call Recordings
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500">
              <CreditCard className="w-4 h-4 mr-2" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="integrations" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500">
              <Link2 className="w-4 h-4 mr-2" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="support" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500">
              <LifeBuoy className="w-4 h-4 mr-2" />
              Support
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewPreview />
          </TabsContent>
          <TabsContent value="calls">
            <CallRecordings />
          </TabsContent>
          <TabsContent value="analytics">
            <AnalyticsSection clientAccountId={currentUser.client_account_id} />
          </TabsContent>
          <TabsContent value="billing">
            <BillingSection />
          </TabsContent>
          <TabsContent value="integrations">
            <PortalIntegrations clientAccountId={currentUser.client_account_id} />
          </TabsContent>
          <TabsContent value="support">
            <SupportSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}