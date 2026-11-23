import { ArrowUpRight } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { Button } from './Button';
import { FourPointStar, OrbitalSwoosh } from './Motifs';
import { Reveal } from './Reveal';

export function CTABand() {
  return (
    <section className="relative overflow-hidden border-t border-charcoal bg-noir">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-stone/40 opacity-35"
      >
        <OrbitalSwoosh className="w-[480px] h-[480px] sm:w-[620px] sm:h-[620px]" />
      </div>

      <Reveal className="relative max-w-7xl mx-auto px-5 sm:px-8 py-24 sm:py-28 md:py-32 text-center">
        <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-steel mb-6">
          <FourPointStar className="w-3 h-3 text-ivory" />
          <span>{siteConfig.ctaBand.kicker}</span>
          <FourPointStar className="w-3 h-3 text-ivory" />
        </div>

        <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase tracking-[-0.025em] leading-[1.02] text-ivory max-w-4xl mx-auto">
          {siteConfig.ctaBand.headline}
        </h2>

        <div className="mt-10 flex justify-center">
          <Button
            href={siteConfig.brand.facebookUrl}
            variant="primary"
            size="lg"
          >
            <span>{siteConfig.ctaBand.buttonLabel}</span>
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
