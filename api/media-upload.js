function extFromName(name) {
  const clean = String(name || '').split('?')[0];
  const dot = clean.lastIndexOf('.');
  return dot >= 0 ? clean.slice(dot + 1).toLowerCase() : 'bin';
}

function safeName(name) {
  return String(name || 'asset')
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

async function supabaseRest(path, options = {}) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server configuration missing');
  const response = await fetch(`${url}/rest/v1${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: options.prefer || 'return=representation',
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.message || text || response.statusText);
  return data;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = process.env.SUPABASE_MEDIA_BUCKET || 'assistantai-media';
    if (!url || !key) return res.status(500).json({ error: 'Supabase server configuration missing' });

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const fileName = safeName(body.file_name || body.title || 'asset');
    const contentType = body.content_type || 'application/octet-stream';
    const base64 = String(body.base64 || '').replace(/^data:[^;]+;base64,/, '');
    const title = String(body.title || fileName).trim();
    const folder = safeName(body.folder || 'general');

    if (!base64 || !title) return res.status(400).json({ error: 'title and base64 are required' });

    const ext = extFromName(fileName);
    const objectPath = `${folder}/${Date.now()}-${fileName.includes('.') ? fileName : `${fileName}.${ext}`}`;
    const bytes = Buffer.from(base64, 'base64');

    const uploadResponse = await fetch(`${url}/storage/v1/object/${bucket}/${objectPath}`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': contentType,
        'x-upsert': 'true'
      },
      body: bytes
    });

    const uploadText = await uploadResponse.text();
    if (!uploadResponse.ok) {
      return res.status(500).json({ error: 'Supabase Storage upload failed', details: uploadText });
    }

    const publicUrl = `${url}/storage/v1/object/public/${bucket}/${objectPath}`;
    const data = await supabaseRest('/media_assets', {
      method: 'POST',
      body: JSON.stringify({
        title,
        asset_url: publicUrl,
        asset_type: contentType.startsWith('image/') ? 'image' : 'file',
        alt_text: body.alt_text || title,
        folder,
        tags: Array.isArray(body.tags) ? body.tags : [],
        status: 'active'
      })
    });

    return res.status(200).json({ success: true, asset: Array.isArray(data) ? data[0] : data, public_url: publicUrl, path: objectPath });
  } catch (error) {
    return res.status(500).json({ error: 'Media upload failed', details: error.message });
  }
}
