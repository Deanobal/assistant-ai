import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, KeyRound, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function ClientLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (event) => {
    event.preventDefault();
    base44.auth.redirectToLogin('/ClientPortal');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f] px-6 py-24 text-white">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute inset-0 bg-radial-glow" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mx-auto w-full max-w-xl"
      >
        <Card className="border-white/8 bg-[#12121a]/95 shadow-2xl shadow-cyan-500/5">
          <CardContent className="p-7 md:p-9">
            <div className="mb-7 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                <Lock className="h-6 w-6 text-cyan-300" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">Client Login</h1>
              <p className="mt-4 text-base leading-7 text-gray-400">
                Access your AssistantAI client portal to review call activity, billing, integrations, and support.
              </p>
            </div>

            <div className="mb-6 rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-4 text-sm leading-6 text-cyan-100">
              Client portal access is being prepared. If you are an active client, contact support for access.
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-gray-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@business.com.au"
                    className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-gray-600"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-gray-600"
                  />
                </div>
              </div>
              <Button type="submit" className="min-h-12 w-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/25">
                Sign In <ArrowRight className="h-4 w-4" />
              </Button>
              <button type="button" onClick={() => base44.auth.redirectToLogin('/ClientPortal')} className="w-full text-sm font-medium text-cyan-200 hover:text-white">
                Forgot Password
              </button>
            </form>

            <p className="mt-7 text-center text-sm leading-6 text-gray-400">
              Need help accessing your account? Contact support at <a href="mailto:sales@assistantai.com.au" className="text-cyan-300 hover:text-white">sales@assistantai.com.au</a>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}