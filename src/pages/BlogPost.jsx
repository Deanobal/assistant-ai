import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEO from '@/components/SEO';
import { blogPosts } from '@/lib/blogPosts';
import { Button } from '@/components/ui/button';

export default function BlogPost() {
  const { slug } = useParams();
  const post = blogPosts.find((item) => item.slug === slug);

  if (!post) {
    return (
      <section className="bg-[#0a0a0f] py-24 md:py-28">
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

  return (
    <>
      <SEO
        title={`${post.title} | AssistantAI`}
        description={post.metaDescription}
        canonicalPath={`/Blog/${post.slug}`}
      />

      <article className="relative overflow-hidden bg-[#0a0a0f] py-24 md:py-28">
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="relative mx-auto max-w-4xl px-6">
          <Button asChild variant="ghost" className="mb-8 px-0 text-cyan-300 hover:bg-transparent hover:text-cyan-200">
            <Link to="/Blog">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>
          </Button>

          <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-gray-400">
            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-cyan-300">
              {post.category}
            </span>
            <span>{post.date}</span>
          </div>

          <h1 className="text-balance text-4xl font-bold tracking-tight text-white md:text-5xl">
            {post.title}
          </h1>

          <div className="mt-10 space-y-6 text-lg leading-relaxed text-gray-300">
            {post.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </article>
    </>
  );
}