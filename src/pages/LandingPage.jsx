import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadPage() {
      setLoading(true);
      try {
        const response = await fetch(`/api/landing-pages?slug=${encodeURIComponent(slug)}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || 'Unable to load landing page');
        if (active) setPage(data.pages?.[0] || null);
      } catch (error) {
        console.warn('Landing page load failed:', error?.message || error);
        if (active) setPage(null);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadPage();
    return () => { active = false; };
  }, [slug]);

  if (loading) {
    return <section className="min-h-screen bg-[#0a0a0f] px-6 py-28 text-center text-gray-300">Loading page...</section>;
  }

  if (!page) {
    return (
      <section className="min-h-screen bg-[#0a0a0f] px-6 py-28 text-center">
        <h1 className="text-3xl font-bold text-white">Landing page not found</h1>
        <p className="mt-4 text-gray-300">This offer page is not available or has not been published.</p>
        <Button asChild className="mt-8"><Link to="/">Back to Home</Link></Button>
      </section>
    );
  }

  const sections = Array.isArray(page.sections) ? page.sections : [];

  return (
    <>
      <SEO title={page.meta_title || `${page.title} | AssistantAI`} description={page.meta_description || page.subheadline || ''} canonicalPath={`/lp/${page.slug}`} />
      <main className="min-h-screen bg-[#0a0a0f] text-white">
        <section className="relative overflow-hidden px-6 py-28 md:py-36">
          <div className="absolute inset-0 bg-radial-glow" />
          <div className="relative mx-auto max-w-5xl text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.22em] text-cyan-300">AssistantAI</p>
            <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl">{page.headline}</h1>
            {page.subheadline && <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-gray-300 md:text-xl">{page.subheadline}</p>}
            {page.offer && <div className="mx-auto mt-8 max-w-3xl rounded-3xl border border-cyan-400/20 bg-cyan-500/10 p-6 text-cyan-100">{page.offer}</div>}
            <div className="mt-10">
              <Button asChild size="lg" className="bg-cyan-500 text-white hover:bg-cyan-400">
                <Link to={page.cta_url || '/GetStartedNow'}>{page.cta_label || 'Get Started'}<ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>

        {sections.length > 0 && (
          <section className="px-6 pb-28">
            <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
              {sections.map((section, index) => (
                <div key={`${section.body || section.title}-${index}`} className="rounded-3xl border border-white/10 bg-[#12121a] p-7">
                  {section.title && <h2 className="mb-3 text-xl font-semibold text-white">{section.title}</h2>}
                  <p className="leading-relaxed text-gray-300">{section.body || section.title}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
