import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function AdminSessionGate({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      try {
        const response = await fetch('/api/admin-session', {
          method: 'GET',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
          navigate(`/AdminLogin?from=${encodeURIComponent(location.pathname)}`, { replace: true });
          return;
        }

        if (!cancelled) setIsChecking(false);
      } catch {
        navigate(`/AdminLogin?from=${encodeURIComponent(location.pathname)}`, { replace: true });
      }
    }

    verifySession();
    return () => { cancelled = true; };
  }, [location.pathname, navigate]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f6f7]">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  return children;
}
