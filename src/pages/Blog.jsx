import * as React from 'react';
import SEO from '@/components/SEO';
import BlogPostCard from '@/components/blog/BlogPostCard';
import { blogPosts as staticBlogPosts } from '@/lib/blogPosts';
import {
  AccentText,
  PageHero,
  PageShell,
  Section,
  SectionHeading,
} from '@/components/marketing/PremiumMarketing';

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

function mergePosts(staticPosts, apiPosts) {
  const bySlug = new Map();
  staticPosts.forEach((post) => bySlug.set(post.slug, post));
  apiPosts.forEach((post) => bySlug.set(post.slug, post));
  return Array.from(bySlug.values());
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
        if (active) setPosts(mergePosts(staticBlogPosts, apiPosts));
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

      <PageShell>
        <PageHero
          title={<>Practical AI insights for <AccentText>service businesses.</AccentText></>}
          description="Clear guides for improving call handling, enquiry capture, booking workflows and follow-up — written for Australian operators, not AI researchers."
          secondaryTo="/Resources"
          secondaryLabel="Browse Resources"
        />
        <Section id="page-content" className="bg-[#040b14]">
          <SectionHeading
            title="Latest thinking"
            description="Use these articles to understand the operating decisions behind a useful AI receptionist."
          />
          <div className="mt-10 grid gap-px overflow-hidden rounded-[16px] border border-[#26364d] bg-[#26364d] md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post, index) => (
              <BlogPostCard key={post.slug} post={post} index={index} />
            ))}
          </div>
        </Section>
      </PageShell>
    </>
  );
}
