import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function ClientLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (mounted && data?.session) {
        navigate('/ClientPortal', { replace: true });
      }
    }

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate('/ClientPortal', { replace: true });
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, [navigate]);

  const handleMagicLink = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError('Enter your email address.');
      return;
    }

    setSubmitting(true);

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/ClientPortal`,
        shouldCreateUser: true,
      },
    });

    setSubmitting(false);

    if (otpError) {
      setError(otpError.message || 'Unable to send login link.');
      return;
    }

    setMessage('Check your email for your secure login link.');
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

              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                Client Login
              </h1>

              <p className="mt-4 text-base leading-7 text-gray-400">
                Access your AssistantAI portal to review call activity, billing, setup progress, and support.
              </p>
            </div>

            <div className="mb-6 rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-4 text-sm leading-6 text-cyan-100">
              Use the email address linked to your AssistantAI client account. We’ll send a secure login link.
            </div>

            {message && (
              <div className="mb-5 flex gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="mb-5 flex gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-100">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleMagicLink} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-gray-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@business.com.au"
                    autoComplete="email"
                    className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-gray-600"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="min-h-12 w-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-60"
              >
                {submitting ? 'Sending secure link...' : 'Send Secure Login Link'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <p className="mt-7 text-center text-sm leading-6 text-gray-400">
              Need access? Contact{' '}
              <a href="mailto:sales@assistantai.com.au" className="text-cyan-300 hover:text-white">
                sales@assistantai.com.au
              </a>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
