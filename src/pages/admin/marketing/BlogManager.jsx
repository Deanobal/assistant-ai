import { useEffect, useState } from 'react';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const blank = {
  id: '', title: '', slug: '', category: 'AI Strategy', excerpt: '',
  meta_description: '', body: '', status: 'draft', seo_keywords: ''
};

function slugify(value) {
  return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);
}

function toForm(post) {
  return {
    id: post.id || '',
    title: post.title || '',
    slug: post.slug || '',
    category: post.category || 'AI Strategy',
    excerpt: post.excerpt || '',
    meta_description: post.meta_description || '',
    body: Array.isArray(post.body) ? post.body.join('\n\n') : '',
    status: post.status || 'draft',
    seo_keywords: Array.isArray(post.seo_keywords) ? post.seo_keywords.join(', ') : ''
  };
}

export default function BlogManager() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function loadPosts() {
    setLoading(true);
    try {
      const response = await fetch('/api/blog-posts?includeDrafts=true');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not load posts');
      setPosts(data.posts || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPosts(); }, []);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value, slug: field === 'title' && !current.id ? slugify(value) : current.slug }));
  }

  async function save(status) {
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        ...form,
        status,
        body: form.body.split('\n').map((p) => p.trim()).filter(Boolean),
        seo_keywords: form.seo_keywords.split(',').map((p) => p.trim()).filter(Boolean)
      };
      const response = await fetch('/api/blog-posts', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.details || data.error || 'Could not save post');
      setForm(toForm(data.post));
      setMessage(status === 'published' ? 'Post published.' : 'Draft saved.');
      await loadPosts();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!form.id || !window.confirm('Delete this post?')) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/blog-posts?id=${encodeURIComponent(form.id)}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Could not delete post');
      setForm(blank);
      setMessage('Post deleted.');
      await loadPosts();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">Content CMS</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Blog Manager</h1>
          <p className="mt-2 text-sm text-slate-400">Create, edit, draft and publish blog posts.</p>
        </div>
        <Button onClick={() => setForm(blank)} className="bg-cyan-500 text-white hover:bg-cyan-400"><Plus className="mr-2 h-4 w-4" />New Post</Button>
      </div>

      {message && <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">{message}</div>}

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <Card className="border-white/10 bg-[#0b0f18]">
          <CardHeader><CardTitle className="text-white">Posts</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {loading ? <div className="flex items-center gap-2 text-slate-400"><Loader2 className="h-4 w-4 animate-spin" />Loading...</div> : null}
            {!loading && posts.length === 0 ? <p className="text-sm text-slate-500">No Supabase posts yet.</p> : null}
            {posts.map((post) => (
              <button key={post.id} onClick={() => setForm(toForm(post))} className="w-full rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left hover:border-cyan-400/30">
                <div className="mb-2 text-xs uppercase tracking-wide text-cyan-300">{post.status}</div>
                <div className="font-semibold text-white">{post.title}</div>
                <div className="mt-1 text-xs text-slate-500">/{post.slug}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#0b0f18]">
          <CardHeader><CardTitle className="text-white">{form.id ? 'Edit Post' : 'Create Post'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label className="text-slate-300">Title</Label><Input value={form.title} onChange={(e) => update('title', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
            <div className="space-y-2"><Label className="text-slate-300">Slug</Label><Input value={form.slug} onChange={(e) => update('slug', slugify(e.target.value))} className="border-white/10 bg-white/5 text-white" /></div>
            <div className="space-y-2"><Label className="text-slate-300">Category</Label><Input value={form.category} onChange={(e) => update('category', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
            <div className="space-y-2"><Label className="text-slate-300">Excerpt</Label><Textarea value={form.excerpt} onChange={(e) => update('excerpt', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
            <div className="space-y-2"><Label className="text-slate-300">Meta Description</Label><Textarea value={form.meta_description} onChange={(e) => update('meta_description', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
            <div className="space-y-2"><Label className="text-slate-300">SEO Keywords</Label><Input value={form.seo_keywords} onChange={(e) => update('seo_keywords', e.target.value)} className="border-white/10 bg-white/5 text-white" /></div>
            <div className="space-y-2"><Label className="text-slate-300">Body</Label><Textarea value={form.body} onChange={(e) => update('body', e.target.value)} className="min-h-[280px] border-white/10 bg-white/5 text-white" /></div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button disabled={saving} onClick={() => save('draft')} variant="outline" className="border-white/10 bg-white/[0.03] text-white"><Save className="mr-2 h-4 w-4" />Save Draft</Button>
              <Button disabled={saving} onClick={() => save('published')} className="bg-cyan-500 text-white hover:bg-cyan-400">Publish</Button>
              {form.id && <Button disabled={saving} onClick={remove} variant="outline" className="border-red-500/20 bg-red-500/10 text-red-200"><Trash2 className="mr-2 h-4 w-4" />Delete</Button>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
