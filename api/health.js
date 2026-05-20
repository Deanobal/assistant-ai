export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    service: 'assistantai-api',
    version: 'supabase-migration-v1',
    timestamp: new Date().toISOString()
  });
}
