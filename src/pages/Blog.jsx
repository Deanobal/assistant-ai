import * as React from 'react';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import BlogPostCard from '@/components/blog/BlogPostCard';
import { blogPosts as staticBlogPosts } from '@/lib/blogPosts';

function mapApiPost(post) {
  return {
    slug: post.slug,
    title: post.title,
    metaDescription: post.meta_description,
    excerpt: post.excerpt,
    category: post.category,
    date: post.published_at ? new Date(post.published_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Recently published',
    body: Array.isArray(post.body) ? post.body : []
  };
}

export default function Blog() {
  const [posts, setPosts] = React.useState(staticBlogPosts);

  React.useEffect(() => {
    let active = true;
    async function loadPosts() {
      try {
        const response = await fetch('/api/cms?resource=blog-posts');
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || 'Unable to load Supabase posts');
        const apiPosts = (data.posts || data.items || []).map(mapApiPost);
        if (active && apiPosts.length > 0) setPosts(apiPosts);
      } catch (error) {
        console.warn('Using static blog fallback:', error?.message || error);
      }
    }
    loadPosts();
    return () => { active = false; };
  }, []);

  return (
    <>
      <SEO
        title="Blog | AssistantAI"
        description="Insights, guides, and practical advice on AI automation for Australian service businesses."
        canonicalPath="/Blog"
      />

      <section className="relative overflow-hidden bg-[#0a0a0f] py-24 md:py-28">
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="relative mx-auto max-w-6xl px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">AssistantAI Blog</p>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-white md:text-5xl">
              Practical AI insights for service businesses
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-gray-300">
              Explore practical ideas, guides, and examples for improving lead capture, response times, and automation across your business.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post, index) => (
              <BlogPostCard key={post.slug} post={post} index={index} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
