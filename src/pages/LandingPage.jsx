import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import {
  PageHero,
  PageShell,
  Section,
  SectionHeading,
} from '@/components/marketing/PremiumMarketing';

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
    return <section className="min-h-screen bg-[#030812] px-6 py-28 text-center text-gray-300">Loading page...</section>;
  }

  if (!page) {
    return (
      <section className="min-h-screen bg-[#030812] px-6 py-28 text-center">
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
      <PageShell>
        <PageHero
          title={page.headline}
          description={page.subheadline || ''}
          primaryTo={page.cta_url || '/GetStartedNow'}
          primaryLabel={page.cta_label || 'Get Started'}
          secondaryTo="/Contact"
          secondaryLabel="Talk to Our Team"
        >
          {page.offer ? <p className="mt-6 border-l-2 border-[#347cff] pl-4 text-sm leading-7 text-[#d0d7e0]">{page.offer}</p> : null}
        </PageHero>

        {sections.length > 0 && (
          <Section id="page-content" className="bg-[#040b14]">
            <SectionHeading title="How the offer works" />
            <div className="mt-10 overflow-hidden rounded-[16px] border border-[#26364d] bg-[#07121f]">
              {sections.map((section, index) => (
                <div key={`${section.body || section.title}-${index}`} className={`grid gap-3 px-6 py-6 md:grid-cols-[0.34fr_0.66fr] md:gap-10 md:px-8 ${index ? 'border-t border-[#1d2b3e]' : ''}`}>
                  {section.title && <h2 className="text-lg font-semibold text-white">{section.title}</h2>}
                  <p className="text-sm leading-7 text-[#aab4c3]">{section.body || section.title}</p>
                </div>
              ))}
            </div>
          </Section>
        )}
      </PageShell>
    </>
  );
}
