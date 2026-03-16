import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ClientLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password === 'client2026') {
      localStorage.setItem('client_portal_authenticated', 'true');
      navigate('/ClientPortal');
      return;
    }
    setError('Incorrect login details');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md">

        <Card className="bg-[#12121a] border-white/5 shadow-2xl shadow-cyan-500/5">
          <CardContent className="p-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-7 h-7 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold text-white text-center mb-2">Client Login</h1>
            <p className="text-gray-400 mb-6 text-base text-center leading-relaxed">Access your AssistantAI.com.au client portal to review call activity, billing, integrations, and performance.

            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />

              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Private client-only access</span>
                <Link to="/Contact" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <Button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25">
                Sign In
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <Link to="/Contact" className="text-gray-400 text-lg hover:text-white transition-colors">Need help? Contact support

              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>);

}