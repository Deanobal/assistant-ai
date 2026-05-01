import { useEffect } from 'react';
import { getBase44Client } from '@/api/base44Client';

const CRISP_SCRIPT_ID = 'assistantai-crisp-script';

export default function CrispChat() {
  useEffect(() => {
    let cancelled = false;

    const loadCrisp = async () => {
      if (typeof window === 'undefined') return;

      const existingScript = document.getElementById(CRISP_SCRIPT_ID);
      if (existingScript) return;

      const client = await getBase44Client();
      const response = await client.functions.invoke('getCrispWebsiteConfig', {});
      const websiteId = response?.data?.websiteId;
      if (!websiteId || cancelled) return;

      window.$crisp = window.$crisp || [];
      window.CRISP_WEBSITE_ID = websiteId;

      const script = document.createElement('script');
      script.id = CRISP_SCRIPT_ID;
      script.src = 'https://client.crisp.chat/l.js';
      script.async = true;
      document.head.appendChild(script);
    };

    loadCrisp();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}