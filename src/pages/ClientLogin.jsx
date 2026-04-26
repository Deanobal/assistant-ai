import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ClientLogin() {
  const handleLogin = () => {
    base44.auth.redirectToLogin('/ClientPortal');
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
            <p className="text-gray-400 mb-6 text-base text-center leading-relaxed">Access your AssistantAI client portal to review call activity, billing, integrations, and performance.</p>

            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-gray-300 leading-relaxed">
                Client portal access uses AssistantAI’s secure sign-in flow. Continue below to log in or request help from our team.
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Private client-only access</span>
                <Link to="/Contact" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  Need access?
                </Link>
              </div>
              <Button onClick={handleLogin} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25">
                Continue to Secure Login
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-xs text-gray-500 leading-relaxed">
                You’ll be redirected to the protected login flow and then returned to your client portal.
              </p>
            </div>

            <div className="mt-6 text-center text-sm space-y-2">
              <Link to="/Contact" className="block text-cyan-400 hover:text-cyan-300 transition-colors">
                Need help? Contact support
              </Link>
              <p className="text-gray-500 text-xs">Protected access for approved AssistantAI clients only.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>);

}