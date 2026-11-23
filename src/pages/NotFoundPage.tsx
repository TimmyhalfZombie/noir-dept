import { ArrowLeft } from 'lucide-react';
import { seoRoutes } from '../config/site';
import { Button } from '../components/Button';
import { FourPointStar } from '../components/Motifs';
import { Reveal } from '../components/Reveal';
import { Seo } from '../components/Seo';

export function NotFoundPage() {
  return (
    <>
      <Seo
        title={seoRoutes.notFound.title}
        description={seoRoutes.notFound.description}
        path={seoRoutes.notFound.path}
        noindex
      />

      <section className="min-h-[78svh] flex items-center justify-center pt-28 pb-20 px-5 sm:px-8">
        <Reveal className="max-w-xl mx-auto text-center space-y-6">
          <p className="inline-flex items-center gap-2.5 text-[11px] uppercase tracking-[0.3em] text-steel">
            <FourPointStar className="w-3 h-3 text-ivory" />
            <span>404</span>
          </p>

          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold uppercase tracking-[-0.03em] leading-[0.95] text-ivory">
            NOTHING HERE.
          </h1>

          <p className="text-base sm:text-lg text-steel leading-relaxed">
            This page doesn&apos;t exist, or it&apos;s sold out.
          </p>

          <div className="pt-4">
            <Button to="/" variant="primary" size="lg">
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Back to Home</span>
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  );
}

export default NotFoundPage;
