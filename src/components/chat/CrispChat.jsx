import { useEffect } from 'react';

const CRISP_SCRIPT_ID = 'assistantai-crisp-script';
const WEBSITE_ID = import.meta.env.VITE_CRISP_WEBSITE_ID || '';

export default function CrispChat() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!WEBSITE_ID) return;
    if (document.getElementById(CRISP_SCRIPT_ID)) return;

    window.$crisp = window.$crisp || [];
    window.CRISP_WEBSITE_ID = WEBSITE_ID;

    const script = document.createElement('script');
    script.id = CRISP_SCRIPT_ID;
    script.src = 'https://client.crisp.chat/l.js';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  return null;
}
