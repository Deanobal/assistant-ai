import React, { StrictMode } from 'react' // v2
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { registerPwaServiceWorker } from '@/lib/pwa'

registerPwaServiceWorker()

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)