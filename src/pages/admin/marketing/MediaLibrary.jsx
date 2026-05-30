import { useEffect, useMemo, useState } from 'react';
import { Copy, FileImage, Image, Plus, Save, Trash2, Upload } from 'lucide-react';
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
    tags: Array.isArray(asset.tags) ? asset.tags.join(', ') : (asset.tags || ''),
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

function normalizeAsset(form) {
  return {
    ...form,
    tags: String(form.tags || '').split(',').map((x) => x.trim()).filter(Boolean),
  };
}

export default function MediaLibrary() {
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [folderFilter, setFolderFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const folders = useMemo(() => ['all', ...Array.from(new Set(assets.map((asset) => asset.folder || 'general')))], [assets]);
  const types = useMemo(() => ['all', ...Array.from(new Set(assets.map((asset) => asset.asset_type || 'image')))], [assets]);
  const filteredAssets = assets.filter((asset) => (folderFilter === 'all' || (asset.folder || 'general') === folderFilter) && (typeFilter === 'all' || (asset.asset_type || 'image') === typeFilter));
  const imageCount = assets.filter((asset) => (asset.asset_type || 'image') === 'image').length;

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
          tags: String(form.tags || '').split(',').map((x) => x.trim()).filter(Boolean),
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
      if (!form.title || !form.asset_url) throw new Error('Asset title and URL are required.');
      const res = await fetch('/api/media-assets', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizeAsset(form)),
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
    <div className="space-y-6 text-slate-950">
      <div className="admin-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="admin-kicker">Asset Library</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">Media Library</h1>
            <p className="admin-muted mt-2 max-w-3xl text-sm">Store reusable images and media URLs for landing pages, ads, blogs and content blocks. Upload files when storage is configured, or paste an external image URL.</p>
          </div>
          <Button onClick={() => setForm(blank)} className="bg-slate-900 text-white hover:bg-slate-800"><Plus className="mr-2 h-4 w-4" />New Asset</Button>
        </div>
      </div>

      {message && <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">{message}</div>}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><FileImage className="mb-3 h-5 w-5 text-slate-700" /><p className="text-sm text-slate-500">Total Assets</p><p className="mt-1 text-3xl font-bold text-slate-950">{assets.length}</p></div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><Image className="mb-3 h-5 w-5 text-slate-700" /><p className="text-sm text-slate-500">Images</p><p className="mt-1 text-3xl font-bold text-slate-950">{imageCount}</p></div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><Copy className="mb-3 h-5 w-5 text-slate-700" /><p className="text-sm text-slate-500">Folders</p><p className="mt-1 text-3xl font-bold text-slate-950">{folders.length - 1}</p></div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="space-y-6">
          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader><CardTitle className="text-slate-950">Asset Browser</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <select value={folderFilter} onChange={(e) => setFolderFilter(e.target.value)} className="min-h-[42px] rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800">
                  {folders.map((folder) => <option key={folder} value={folder}>{folder === 'all' ? 'All folders' : folder}</option>)}
                </select>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="min-h-[42px] rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800">
                  {types.map((type) => <option key={type} value={type}>{type === 'all' ? 'All types' : type}</option>)}
                </select>
              </div>

              {filteredAssets.length === 0 ? <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No media assets match this filter.</p> : null}
              <div className="grid gap-3">
                {filteredAssets.map((asset) => (
                  <button key={asset.id} onClick={() => setForm(toForm(asset))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-slate-300 hover:bg-white hover:shadow-sm">
                    <div className="mb-3 flex h-28 items-center justify-center overflow-hidden rounded-xl bg-white">
                      {(asset.asset_type || 'image') === 'image' && asset.asset_url ? <img src={asset.asset_url} alt={asset.alt_text || asset.title} className="h-full w-full object-cover" /> : <Image className="h-8 w-8 text-slate-400" />}
                    </div>
                    <div className="font-semibold text-slate-950">{asset.title}</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500"><span>{asset.folder || 'general'}</span><span>•</span><span>{asset.asset_type || 'image'}</span></div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 2xl:grid-cols-[0.9fr_1.1fr]">
          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader><CardTitle className="text-slate-950">{form.id ? 'Edit Asset' : 'Create Asset'}</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
                <Label className="mb-3 block text-slate-700">Upload File</Label>
                <Input type="file" onChange={(e) => uploadFile(e.target.files?.[0])} className="border-slate-200 bg-white text-slate-950" />
                <p className="mt-2 text-xs text-slate-500">Uploads require the media storage backend to be configured. If upload fails, paste an external asset URL below and save it manually.</p>
                {uploading && <p className="mt-2 text-sm text-slate-700"><Upload className="mr-2 inline h-4 w-4 animate-pulse" />Uploading...</p>}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label className="text-slate-700">Title</Label><Input value={form.title} onChange={(e) => update('title', e.target.value)} className="border-slate-200 bg-white text-slate-950" /></div>
                <div className="space-y-2"><Label className="text-slate-700">Folder</Label><Input value={form.folder} onChange={(e) => update('folder', e.target.value)} className="border-slate-200 bg-white text-slate-950" placeholder="landing-pages, ads, blog, brand" /></div>
                <div className="space-y-2 md:col-span-2"><Label className="text-slate-700">Asset URL</Label><Input value={form.asset_url} onChange={(e) => update('asset_url', e.target.value)} className="border-slate-200 bg-white text-slate-950" placeholder="https://..." /></div>
                <div className="space-y-2"><Label className="text-slate-700">Asset Type</Label><select value={form.asset_type} onChange={(e) => update('asset_type', e.target.value)} className="min-h-[42px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800"><option value="image">Image</option><option value="video">Video</option><option value="document">Document</option><option value="logo">Logo</option><option value="creative">Creative</option></select></div>
                <div className="space-y-2"><Label className="text-slate-700">Tags</Label><Input value={form.tags} onChange={(e) => update('tags', e.target.value)} className="border-slate-200 bg-white text-slate-950" placeholder="hero, ad, ai, homepage" /></div>
                <div className="space-y-2 md:col-span-2"><Label className="text-slate-700">Alt Text / Usage Note</Label><Input value={form.alt_text} onChange={(e) => update('alt_text', e.target.value)} className="border-slate-200 bg-white text-slate-950" placeholder="Describe the asset and where it should be used" /></div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button onClick={saveAsset} className="bg-slate-900 text-white hover:bg-slate-800"><Save className="mr-2 h-4 w-4" />Save Asset</Button>
                {form.asset_url && <Button onClick={() => copyUrl(form.asset_url)} variant="outline" className="border-slate-200 bg-white text-slate-700"><Copy className="mr-2 h-4 w-4" />Copy URL</Button>}
                {form.id && <Button onClick={deleteAsset} variant="outline" className="border-red-200 bg-red-50 text-red-700"><Trash2 className="mr-2 h-4 w-4" />Delete</Button>}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader><CardTitle className="text-slate-950">Asset Preview</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {form.asset_url ? (
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  {(form.asset_type || 'image') === 'image' || (form.asset_type || 'image') === 'logo' || (form.asset_type || 'image') === 'creative' ? (
                    <img src={form.asset_url} alt={form.alt_text || form.title || 'Preview'} className="max-h-[420px] w-full rounded-2xl object-contain" />
                  ) : (
                    <div className="rounded-2xl bg-slate-900 p-6 text-white"><p className="font-bold">{form.asset_type}</p><p className="mt-2 break-all text-sm text-slate-300">{form.asset_url}</p></div>
                  )}
                </div>
              ) : (
                <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-center text-slate-400"><Image className="mb-3 h-10 w-10" />Paste or upload an asset to preview it.</div>
              )}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-bold text-slate-950">Recommended usage</p>
                <p className="mt-1">Use asset URLs in Landing Page Builder hero/secondary image fields, blog posts, social creative notes and campaign drafts.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
