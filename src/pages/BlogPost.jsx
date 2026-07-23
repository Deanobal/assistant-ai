import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import SEO from '@/components/SEO';
import { blogPosts } from '@/lib/blogPosts';
import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/marketing/PremiumMarketing';

function mapApiPost(post) {
  return {
    slug: post.slug,
    title: post.title,
    metaDescription: post.meta_description,
    excerpt: post.excerpt,
    category: post.category,
    date: post.published_at ? new Date(post.published_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Recently published',
    body: Array.isArray(post.body) ? post.body : [],
    relatedLinks: Array.isArray(post.related_links) ? post.related_links : [],
  };
}

function RelatedLinks({ links = [] }) {
  if (!links.length) return null;
  return (
    <div className="mt-12 rounded-[28px] border border-cyan-400/15 bg-cyan-400/[0.06] p-6 md:p-8">
      <h2 className="text-2xl font-bold text-white">Related AssistantAI resources</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {links.map((link) => (
          <Link key={`${link.href}-${link.label}`} to={link.href} className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/40 hover:bg-white/[0.04]">
            <span>{link.label}</span>
            <ArrowRight className="h-4 w-4 shrink-0 text-cyan-300 transition group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function BlogPost() {
  const { slug } = useParams();
  const staticPost = blogPosts.find((item) => item.slug === slug);
  const [post, setPost] = React.useState(staticPost || null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    async function loadPost() {
      setLoading(true);
      try {
        const response = await fetch(`/api/cms?resource=blog-posts&slug=${encodeURIComponent(slug)}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || 'Unable to load Supabase post');
        const posts = data.posts || data.items || [];
        const apiPost = posts?.[0] ? mapApiPost(posts[0]) : null;
        if (active && apiPost) setPost({ ...staticPost, ...apiPost, relatedLinks: apiPost.relatedLinks?.length ? apiPost.relatedLinks : staticPost?.relatedLinks || [] });
      } catch (error) {
        console.warn('Using static blog post fallback:', error?.message || error);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadPost();
    return () => { active = false; };
  }, [slug, staticPost]);

  if (!post && !loading) {
    return (
      <section className="bg-[#030812] py-24 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h1 className="text-3xl font-bold text-white">Post not found</h1>
          <p className="mt-4 text-gray-300">The article you’re looking for isn’t available.</p>
          <div className="mt-8">
            <Button asChild>
              <Link to="/Blog">Back to Blog</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (!post) {
    return <section className="bg-[#030812] py-24 md:py-28"><div className="mx-auto max-w-3xl px-6 text-center text-gray-300">Loading article...</div></section>;
  }

  return (
    <>
      <SEO
        title={`${post.title} | AssistantAI`}
        description={post.metaDescription}
        canonicalPath={`/Blog/${post.slug}`}
      />

      <PageShell>
      <article className="relative overflow-hidden border-b border-[#152238] py-16 sm:py-20 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_12%,rgba(31,111,255,0.12),transparent_32%)]" />
        <div className="relative mx-auto max-w-4xl px-5 sm:px-8">
          <Button asChild variant="ghost" className="mb-8 px-0 text-cyan-300 hover:bg-transparent hover:text-cyan-200">
            <Link to="/Blog">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>
          </Button>

          <div className="mb-7 flex flex-wrap items-center gap-3 text-sm text-[#95a3b5]">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#76a7ff]">
              {post.category}
            </span>
            <span>{post.date}</span>
          </div>

          <h1 className="text-balance text-4xl font-[720] leading-[1.06] tracking-[-0.045em] text-white md:text-6xl">
            {post.title}
          </h1>

          <div className="mt-12 space-y-7 border-t border-[#26364d] pt-10 text-lg leading-8 text-[#c1cad5]">
            {post.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <RelatedLinks links={post.relatedLinks || []} />
        </div>
      </article>
      </PageShell>
    </>
  );
}
