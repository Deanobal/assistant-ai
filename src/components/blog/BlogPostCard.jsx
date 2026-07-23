import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function BlogPostCard({ post }) {
  return (
    <article className="group h-full bg-[#07121f] transition-colors hover:bg-[#091827]">
      <div className="flex h-full flex-col p-6 sm:p-7">
          <div className="mb-4 flex items-center gap-3 text-sm text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#76a7ff]">
              {post.category}
            </span>
            <span className="text-[#95a3b5]">{post.date}</span>
          </div>

          <h2 className="text-xl font-semibold leading-snug tracking-[-0.025em] text-white sm:text-2xl">{post.title}</h2>
          <p className="mt-4 flex-1 text-sm leading-7 text-[#aab4c3]">{post.excerpt}</p>

          <div className="mt-7">
              <Link to={`/Blog/${post.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#76a7ff]">
                Read article
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
          </div>
      </div>
    </article>
  );
}
