import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function AdminSessionGate({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const hasSession = localStorage.getItem('assistantai_admin_session') === 'granted';

    if (!hasSession) {
      navigate(`/AdminLogin?from=${encodeURIComponent(location.pathname)}`, { replace: true });
      return;
    }

    setIsChecking(false);
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
