import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function Settings() {
  const [apiKeys, setApiKeys] = useState({
    gsc: false,
    ga: false,
    semrush: false,
    email: false,
    sms: false,
  });

  const [message, setMessage] = useState(null);

  const handleVerify = (key) => {
    // Placeholder for API key verification
    setApiKeys((prev) => ({ ...prev, [key]: !prev[key] }));
    setMessage({ type: 'success', text: `${key.toUpperCase()} API verified!` });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Marketing Settings</h2>
        <p className="text-slate-400">Configure API keys and integrations for SEO and campaign management</p>
      </div>

      {message && (
        <div className={`rounded-lg border p-4 flex items-center gap-3 ${
          message.type === 'success'
            ? 'border-green-400/20 bg-green-400/5'
            : 'border-red-400/20 bg-red-400/5'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-400" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-400" />
          )}
          <p className={message.type === 'success' ? 'text-green-400' : 'text-red-400'}>
            {message.text}
          </p>
        </div>
      )}

      {/* SEO APIs */}
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
        <h3 className="text-lg font-semibold text-white mb-4">SEO & Analytics APIs</h3>
        <p className="text-sm text-slate-400 mb-6">
          Configure third-party services for SEO tracking and competitive analysis.
        </p>

        <div className="space-y-4">
          {[
            {
              key: 'gsc',
              name: 'Google Search Console',
              description: 'Track keyword rankings, impressions, and clicks',
              envVar: 'GSC_API_KEY',
            },
            {
              key: 'ga',
              name: 'Google Analytics',
              description: 'View traffic metrics and user behavior',
              envVar: 'GA_API_KEY',
            },
            {
              key: 'semrush',
              name: 'SEMrush',
              description: 'Competitor analysis and authority metrics',
              envVar: 'SEMRUSH_API_KEY',
            },
          ].map((api) => (
            <div key={api.key} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-lg border border-white/5">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-white mb-1">{api.name}</h4>
                <p className="text-xs text-slate-500 mb-2">{api.description}</p>
                <p className="text-xs text-slate-600">Environment Variable: <code className="bg-white/5 px-2 py-1 rounded">{api.envVar}</code></p>
              </div>
              <div className="ml-4">
                {apiKeys[api.key] ? (
                  <span className="text-xs font-semibold text-green-400 px-3 py-1 rounded bg-green-400/10 flex items-center gap-1">
                    ✓ Connected
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleVerify(api.key)}
                    className="text-xs"
                  >
                    Configure
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign APIs */}
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Campaign & Messaging APIs</h3>
        <p className="text-sm text-slate-400 mb-6">
          Set up email and SMS services for marketing campaigns.
        </p>

        <div className="space-y-4">
          {[
            {
              key: 'email',
              name: 'Email Service',
              description: 'Send email campaigns (Resend, SendGrid, etc.)',
              envVar: 'EMAIL_API_KEY',
            },
            {
              key: 'sms',
              name: 'SMS Service',
              description: 'Send SMS campaigns (Twilio, etc.)',
              envVar: 'SMS_API_KEY',
            },
          ].map((api) => (
            <div key={api.key} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-lg border border-white/5">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-white mb-1">{api.name}</h4>
                <p className="text-xs text-slate-500 mb-2">{api.description}</p>
                <p className="text-xs text-slate-600">Environment Variable: <code className="bg-white/5 px-2 py-1 rounded">{api.envVar}</code></p>
              </div>
              <div className="ml-4">
                {apiKeys[api.key] ? (
                  <span className="text-xs font-semibold text-green-400 px-3 py-1 rounded bg-green-400/10 flex items-center gap-1">
                    ✓ Connected
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleVerify(api.key)}
                    className="text-xs"
                  >
                    Configure
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Setup Instructions</h3>
        <div className="space-y-4 text-sm text-slate-400">
          <div>
            <h4 className="text-white font-medium mb-2">1. Get Your API Keys</h4>
            <p>Register for accounts with each service and generate API keys from their admin panels.</p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">2. Add to Environment Variables</h4>
            <p>Go to Dashboard → Settings → Environment Variables and add each API key with the variable names above.</p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">3. Test Connection</h4>
            <p>Click "Configure" to verify the API key is valid and the service is connected.</p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">4. Start Using</h4>
            <p>Once connected, the SEO Dashboard and Campaigns features will fetch real data from these services.</p>
          </div>
        </div>
      </div>
    </div>
  );
}