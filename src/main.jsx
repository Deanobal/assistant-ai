import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { registerPwaServiceWorker } from '@/lib/pwa'
import { prewarmBase44Client } from '@/api/base44Client'

// SDK client is initialized synchronously via createClient; rebuild marker for strict React dedupe.
// By the time any component's useEffect fires the promise will be resolved.
prewarmBase44Client()

registerPwaServiceWorker()

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)