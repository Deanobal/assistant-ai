import * as React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SEO from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const posts = [
  {
    slug: 'how-ai-receptionists-help-service-businesses',
    title: 'How AI Receptionists Help Service Businesses Capture More Leads',
    excerpt: 'Discover how faster responses, better call handling, and automated follow-up can reduce missed opportunities.',
    category: 'Lead Capture',
    date: 'April 4, 2026',
  },
  {
    slug: 'ai-automation-for-trades-and-clinics',
    title: 'AI Automation for Trades, Clinics, and Local Service Teams',
    excerpt: 'A practical look at where AI saves time, reduces admin, and improves customer experience for busy teams.',
    category: 'Automation',
    date: 'April 1, 2026',
  },
  {
    slug: 'reduce-admin-with-ai-follow-up',
    title: 'How to Reduce Admin Work With Smarter Follow-Up',
    excerpt: 'Learn how automated follow-up keeps leads moving without adding more manual tasks to your day.',
    category: 'Operations',
    date: 'March 28, 2026',
  },
];

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
            {posts.map((post, index) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Card className="h-full border-white/5 bg-[#12121a] transition-colors hover:border-cyan-500/30">
                  <CardContent className="flex h-full flex-col p-7">
                    <div className="mb-4 flex items-center gap-3 text-sm text-gray-400">
                      <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-cyan-300">
                        {post.category}
                      </span>
                      <span>{post.date}</span>
                    </div>

                    <h2 className="text-2xl font-semibold leading-tight text-white">
                      {post.title}
                    </h2>
                    <p className="mt-4 flex-1 text-base leading-relaxed text-gray-300">
                      {post.excerpt}
                    </p>

                    <div className="mt-6">
                      <Button asChild variant="outline" className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]">
                        <Link to="/Contact">
                          Read article
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}