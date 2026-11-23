import { ArrowUpRight } from 'lucide-react';
import { seoRoutes, site } from '../config/site';
import { buildBreadcrumbSchema } from '../lib/schema';
import { FourPointStar } from '../components/Motifs';
import { Reveal } from '../components/Reveal';
import { Seo } from '../components/Seo';

export function PrivacyPage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Privacy', path: '/privacy' },
  ]);

  return (
    <>
      <Seo
        title={seoRoutes.privacy.title}
        description={seoRoutes.privacy.description}
        path={seoRoutes.privacy.path}
        jsonLd={breadcrumbSchema}
      />

      <section className="pt-32 pb-24 sm:pt-40 sm:pb-28 md:pt-44 md:pb-32">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <Reveal className="space-y-8">
            <div className="space-y-5 pb-8 border-b border-charcoal">
              <p className="inline-flex items-center gap-2.5 text-[11px] uppercase tracking-[0.28em] text-steel">
                <FourPointStar className="w-3 h-3 text-ivory" />
                <span>PRIVACY</span>
              </p>

              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-[-0.03em] leading-[0.98] text-ivory">
                PRIVACY POLICY
              </h1>

              <p className="text-xs uppercase tracking-[0.2em] text-stone">
                Last updated: {site.lastUpdatedDisplay}
              </p>
            </div>

            <div className="space-y-6 text-base sm:text-lg text-ivory/90 leading-[1.8]">
              <p>
                This website doesn&apos;t have accounts, checkout or contact
                forms, so we don&apos;t collect personal information through it.
                Inquiries and purchases happen through our Facebook page, where
                Facebook&apos;s own privacy policy applies. If we add website
                analytics later, we&apos;ll update this page. Questions?{' '}
                <a
                  href={site.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-ivory border-b border-stone hover:border-ivory transition-colors"
                >
                  <span>Message us on Facebook.</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-steel" aria-hidden="true" />
                </a>
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

export default PrivacyPage;
