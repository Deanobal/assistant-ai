import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function BlogPostCard({ post, index }) {
  return (
    <motion.div
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

          <h2 className="text-2xl font-semibold leading-tight text-white">{post.title}</h2>
          <p className="mt-4 flex-1 text-base leading-relaxed text-gray-300">{post.excerpt}</p>

          <div className="mt-6">
            <Button asChild variant="outline" className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]">
              <Link to={`/Blog/${post.slug}`}>
                Read article
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}