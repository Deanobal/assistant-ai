import { useEffect, useState } from 'react';
import { Copy, Image, Plus, Save, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const blank = { id: '', title: '', asset_url: '', asset_type: 'image', alt_text: '', folder: 'general', tags: '', status: 'active' };

function toForm(asset) {
  return {
    id: asset.id || '',
    title: asset.title || '',
    asset_url: asset.asset_url || '',
    asset_type: asset.asset_type || 'image',
    alt_text: asset.alt_text || '',
    folder: asset.folder || 'general',
    tags: Array.isArray(asset.tags) ? asset.tags.join(', ') : '',
    status: asset.status || 'active',
  };
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || '').split(',')[1] || '');
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function MediaLibrary() {
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  async function loadAssets() {
    try {
      const res = await fetch('/api/media-assets');
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Could not load media');
      setAssets(data.assets || []);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => { loadAssets(); }, []);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function uploadFile(file) {
    if (!file) return;
    setUploading(true);
    setMessage('');
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch('/api/media-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title || file.name,
          file_name: file.name,
          content_type: file.type,
          base64,
          folder: form.folder || 'general',
          alt_text: form.alt_text || form.title || file.name,
          tags: form.tags.split(',').map((x) => x.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Upload failed');
      setForm(toForm(data.asset));
      setMessage('File uploaded.');
      await loadAssets();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setUploading(false);
    }
  }

  async function saveAsset() {
    try {
      const res = await fetch('/api/media-assets', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Could not save media asset');
      setForm(toForm(data.asset));
      setMessage('Media asset saved.');
      await loadAssets();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function deleteAsset() {
    if (!form.id || !window.confirm('Delete this media asset?')) return;
    try {
      const res = await fetch(`/api/media-assets?id=${encodeURIComponent(form.id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Could not delete media asset');
      setForm(blank);
      setMessage('Media asset deleted.');
      await loadAssets();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function copyUrl(url) {
    await navigator.clipboard.writeText(url);
    setMessage('URL copied.');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">Asset Library</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Media Library</h1>
          <p className="mt-2 text-sm text-slate-400">Upload or store reusable media for blogs, content blocks and campaigns.</p>
        </div>
        <Button onClick={() => setForm(blank)} className="bg-cyan-500 text-white hover:bg-cyan-400"><Plus className="mr-2 h-4 w-4" />New Asset</Button>
      </div>

      {message && <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">{message}</div>}

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <Card className="border-white/10 bg-[#0b0f18]">
          <CardHeader><CardTitle className="text-white">Assets</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {assets.length === 0 ? <p className="text-sm text-slate-500">No media assets yet.</p> : null}
            {assets.map((asset) => (
              <button key={asset.id} onClick={() => setForm(toForm(asset))} className="w-full rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left hover:border-cyan-400/30">
                <div className="mb-3 flex h-24 items-center justify-center overflow-hidden rounded-xl bg-white/[0.04]">
                  {asset.asset_type === 'image' ? <img src={asset.asset_url} alt={asset.alt_text || asset.title} className="h-full w-full object-cover" /> : <Image className="h-8 w-8 text-slate-500" />}
                </div>
                <div className="font-semibold text-white">{asset.title}</div>
                <div className="mt-1 text-xs text-cyan-300">{asset.folder}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#0b0f18]">
          <CardHeader><CardTitle className="text-white">{form.id ? 'Edit Asset' : 'Create Asset'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-dashed border-cyan-400/30 bg-cyan-500/5 p-5">
              <Label className="mb-3 block text-slate-300">Upload File</Label>
              <Input type="file" onChange={(e) => uploadFile(e.target.files?.[0])} className="border-white/10 bg-white/5 text-white" />
              <p className="mt-2 text-xs text-slate-500">Uploads to Supabase Storage bucket set by SUPABASE_MEDIA_BUCKET, default assistantai-media.</p>
              {uploading && <p className="mt-2 text-sm text-cyan-300"><Upload className="mr-2 inline h-4 w-4 animate-pulse" />Uploading...</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label className="text-slate-300">Title</Label><Input value={form.title} onChange={(e) => update('title', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Folder</Label><Input value={form.folder} onChange={(e) => update('folder', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2 md:col-span-2"><Label className="text-slate-300">Asset URL</Label><Input value={form.asset_url} onChange={(e) => update('asset_url', e.target.value)} className="border-white/10 bg-white/5 text-white" placeholder="https://..." /></div>
              <div className="space-y-2"><Label className="text-slate-300">Asset Type</Label><Input value={form.asset_type} onChange={(e) => update('asset_type', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Tags</Label><Input value={form.tags} onChange={(e) => update('tags', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
              <div className="space-y-2 md:col-span-2"><Label className="text-slate-300">Alt Text</Label><Input value={form.alt_text} onChange={(e) => update('alt_text', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
            </div>
            {form.asset_url && <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4"><img src={form.asset_url} alt="Preview" className="max-h-72 w-full rounded-xl object-contain" /></div>}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button onClick={saveAsset} className="bg-cyan-500 text-white hover:bg-cyan-400"><Save className="mr-2 h-4 w-4" />Save Asset</Button>
              {form.asset_url && <Button onClick={() => copyUrl(form.asset_url)} variant="outline" className="border-white/10 bg-white/[0.03] text-white"><Copy className="mr-2 h-4 w-4" />Copy URL</Button>}
              {form.id && <Button onClick={deleteAsset} variant="outline" className="border-red-500/20 bg-red-500/10 text-red-200"><Trash2 className="mr-2 h-4 w-4" />Delete</Button>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
