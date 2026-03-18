import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const authenticated = await base44.auth.isAuthenticated();
      if (!authenticated) {
        setIsLoading(false);
        return;
      }

      const user = await base44.auth.me();
      setIsAuthenticated(true);
      setIsAdmin(user?.role === 'admin');
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

  if (isAuthenticated && isAdmin) {
    return <Navigate to="/ClientManager" replace />;
  }

  if (isAuthenticated && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6">
        <Card className="bg-[#12121a] border-white/5 max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl mx-auto bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center">
              <Lock className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Admin Access Only</h1>
              <p className="text-gray-400">This login is reserved for the AssistantAI internal team.</p>
            </div>
            <Button variant="outline" onClick={() => base44.auth.logout('/Home')} className="w-full border-white/10 text-white hover:bg-white/5">
              Return to Website
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="bg-[#12121a] border-white/5 shadow-2xl shadow-cyan-500/5">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Admin Team Login</h1>
              <p className="text-gray-400 leading-relaxed">Sign in with your admin account to access the internal AssistantAI Client Manager.</p>
            </div>
            <Button onClick={() => base44.auth.redirectToLogin('/ClientManager')} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25">
              Continue to Login
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}