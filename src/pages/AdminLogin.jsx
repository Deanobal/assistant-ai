import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BriefcaseBusiness, AlertCircle, Eye, EyeOff, Loader } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fromUrl = searchParams.get('from') || '/admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        navigate(fromUrl, { replace: true });
      } else if (response.status === 401) {
        setError('Invalid password. Please try again.');
        setPassword('');
      } else {
        setError('An error occurred. Please try again.');
      }
    } catch (err) {
      setError('Connection error. Please check your network and try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-6">
      <Card className="w-full max-w-md border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        <CardContent className="space-y-6 p-8">
          <div className="space-y-2 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg">
                <BriefcaseBusiness className="h-7 w-7" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-950">AssistantAI</h1>
            <p className="text-sm text-slate-500">Admin Operations</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-900">Admin Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  disabled={isLoading}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-slate-950 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                  autoComplete="current-password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={!password || isLoading} className="w-full rounded-xl bg-slate-900 px-4 py-2.5 font-semibold text-white shadow-md hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors">
              {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin" />Verifying...</> : 'Sign In'}
            </Button>
          </form>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-600 text-center">This is a restricted admin area. Contact your system administrator for access.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
