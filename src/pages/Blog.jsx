import * as React from 'react';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import BlogPostCard from '@/components/blog/BlogPostCard';
import { blogPosts } from '@/lib/blogPosts';

export default function Blog() {
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
            {blogPosts.map((post, index) => (
              <BlogPostCard key={post.slug} post={post} index={index} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}