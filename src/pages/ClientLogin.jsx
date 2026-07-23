import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';
import { PageShell, Section } from '@/components/marketing/PremiumMarketing';

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
    if (!isSupabaseConfigured) {
      setError('Client login is not configured in this preview environment.');
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
    <>
      <SEO title="Client Login | AssistantAI" description="Securely access your AssistantAI client portal." canonicalPath="/ClientLogin" noIndex />
      <PageShell>
      <Section className="relative min-h-[760px] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(31,111,255,0.13),transparent_34%)]" />
      <div className="relative mx-auto w-full max-w-xl">
        <Card className="rounded-[16px] border-[#2a394f] bg-[#07121f] shadow-[0_32px_90px_rgba(0,0,0,0.34)]">
          <CardContent className="p-7 md:p-9">
            <div className="mb-7 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[#2e5caa] bg-[#10284c]">
                <Lock className="h-6 w-6 text-[#74a7ff]" />
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                Client Login
              </h1>

              <p className="mt-4 text-base leading-7 text-gray-400">
                Access your AssistantAI portal to review call activity, billing, setup progress, and support.
              </p>
            </div>

            <div className="mb-6 rounded-[11px] border border-[#29405f] bg-[#081727] p-4 text-sm leading-6 text-[#c7d8f4]">
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
                    className="border-[#2d3d54] bg-[#081522] pl-10 text-white placeholder:text-[#9aa8ba]"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="min-h-12 w-full rounded-[10px] border border-[#347cff] bg-[#0b4dbb] font-semibold text-white shadow-[0_12px_30px_rgba(31,111,255,0.2)] hover:bg-[#0a45aa] disabled:opacity-60"
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
      </div>
      </Section>
      </PageShell>
    </>
  );
}
