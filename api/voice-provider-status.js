import { requireAdmin } from './_native-auth.js';

const PUBLIC_ENV_KEYS = [
  'VOICE_PRIMARY_PROVIDER',
  'VOICE_FALLBACK_PROVIDER',
  'VITE_VAPI_PUBLIC_KEY',
  'VITE_VAPI_ASSISTANT_ID',
  'VITE_LIVEKIT_URL',
  'VITE_LIVEKIT_AGENT_NAME'
];

function present(name) {
  return Boolean(process.env[name]);
}

function visiblePublicVariable(name) {
  return {
    name,
    present: present(name)
  };
}

function providerStatus() {
  const vapiReady = present('VITE_VAPI_PUBLIC_KEY') && present('VITE_VAPI_ASSISTANT_ID');
  const liveKitReady = present('LIVEKIT_API_KEY') && present('LIVEKIT_API_SECRET') && (present('LIVEKIT_URL') || present('VITE_LIVEKIT_URL'));
  const retellReady = present('RETELL_API_KEY') && present('RETELL_AGENT_ID');

  const primary = process.env.VOICE_PRIMARY_PROVIDER || 'vapi';
  const fallback = process.env.VOICE_FALLBACK_PROVIDER || 'vapi';

  return {
    primary,
    fallback,
    no_downtime_mode: true,
    providers: {
      vapi: {
        configured: vapiReady,
        role: primary === 'vapi' ? 'primary' : fallback === 'vapi' ? 'fallback' : 'available',
        public_variables: [
          visiblePublicVariable('VITE_VAPI_PUBLIC_KEY'),
          visiblePublicVariable('VITE_VAPI_ASSISTANT_ID')
        ],
        private_variables: [
          { name: 'VAPI_WEBHOOK_SECRET', present: present('VAPI_WEBHOOK_SECRET') },
          { name: 'VAPI_PRIVATE_KEY', present: present('VAPI_PRIVATE_KEY') }
        ]
      },
      livekit: {
        configured: liveKitReady,
        role: primary === 'livekit' ? 'primary' : fallback === 'livekit' ? 'fallback' : 'available',
        public_variables: [
          visiblePublicVariable('VITE_LIVEKIT_URL'),
          visiblePublicVariable('VITE_LIVEKIT_AGENT_NAME')
        ],
        private_variables: [
          { name: 'LIVEKIT_URL', present: present('LIVEKIT_URL') },
          { name: 'LIVEKIT_API_KEY', present: present('LIVEKIT_API_KEY') },
          { name: 'LIVEKIT_API_SECRET', present: present('LIVEKIT_API_SECRET') }
        ]
      },
      retell: {
        configured: retellReady,
        role: primary === 'retell' ? 'primary' : fallback === 'retell' ? 'fallback' : 'standby',
        private_variables: [
          { name: 'RETELL_API_KEY', present: present('RETELL_API_KEY') },
          { name: 'RETELL_AGENT_ID', present: present('RETELL_AGENT_ID') }
        ]
      }
    },
    public_environment: PUBLIC_ENV_KEYS.map(visiblePublicVariable),
    guidance: liveKitReady
      ? 'LiveKit is configured server-side and can be tested without touching the live Vapi demo.'
      : 'Vapi remains live. Add LiveKit variables to begin side-by-side testing.'
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!requireAdmin(req, res)) return;

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    success: true,
    service: 'assistantai-voice-provider-status',
    status: providerStatus()
  });
}
