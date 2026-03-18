import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Headphones, CreditCard, Link2, BarChart3, LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import OverviewPreview from '../components/portal/OverviewPreview';
import CallRecordings from '../components/dashboard/CallRecordings';
import AnalyticsSection from '../components/dashboard/AnalyticsSection';
import BillingSection from '../components/dashboard/BillingSection';
import PortalIntegrations from '../components/dashboard/PortalIntegrations';
import SupportSection from '../components/dashboard/SupportSection';

export default function ClientPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('client_portal_authenticated') === 'true');

  if (!isAuthenticated) {
    return <Navigate to="/ClientLogin" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('client_portal_authenticated');
    setIsAuthenticated(false);
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
          <Button variant="outline" onClick={handleLogout} className="border-white/10 text-white hover:bg-white/5 w-fit">
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
            <AnalyticsSection />
          </TabsContent>
          <TabsContent value="billing">
            <BillingSection />
          </TabsContent>
          <TabsContent value="integrations">
            <PortalIntegrations />
          </TabsContent>
          <TabsContent value="support">
            <SupportSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}