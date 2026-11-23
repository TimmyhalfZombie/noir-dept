import { useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { seoRoutes } from '../config/site';
import { siteConfig } from '../config/siteConfig';
import { products, type Product, type ProductStatus } from '../data/products';
import {
  buildLiveProductSchemas,
  buildOrganizationSchema,
  buildWebSiteSchema,
} from '../lib/schema';
import { Button } from '../components/Button';
import { CTABand } from '../components/CTABand';
import { FourPointStar } from '../components/Motifs';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { Reveal } from '../components/Reveal';
import { SectionHeader } from '../components/SectionHeader';
import { Seo } from '../components/Seo';
import { PlanetaryRing } from '../components/PlanetaryRing';
import { StitchDivider } from '../components/motion/StitchDivider';

type FilterStatus = 'ALL' | ProductStatus;

const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'RESERVED', label: 'Reserved' },
  { value: 'SOLD', label: 'Sold' },
];

export function HomePage() {
  const heroRef = useRef<HTMLElement | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');

  const homeSchemas = useMemo(
    () => [
      buildOrganizationSchema(),
      buildWebSiteSchema(),
      ...buildLiveProductSchemas(products, siteConfig.previewMode),
    ],
    []
  );

  const filteredProducts = useMemo(() => {
    if (statusFilter === 'ALL') return products;
    return products.filter((item) => item.status === statusFilter);
  }, [statusFilter]);

  const scrollToDrop = () => {
    const el = document.getElementById('latest-drop');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <Seo
        title={seoRoutes.home.title}
        description={seoRoutes.home.description}
        path={seoRoutes.home.path}
        jsonLd={homeSchemas}
      />
      {/* 1. Full-viewport editorial hero */}
      <section
        ref={heroRef}
        className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden border-b border-charcoal pt-24 pb-16 sm:pt-28 sm:pb-20"
      >
        <div className="relative max-w-7xl mx-auto w-full px-5 sm:px-8 flex flex-col items-center text-center">
          {/* Wordmark + Planetary Ring background */}
          <PlanetaryRing heroRef={heroRef}>
            <h1
              data-ink-ring-occluder="text"
              className="relative z-10 font-serif text-[clamp(2.85rem,11.5vw,10rem)] font-bold uppercase tracking-[-0.03em] leading-[0.9] text-ivory whitespace-nowrap px-4 sm:px-6">
              {siteConfig.brand.name}
            </h1>
          </PlanetaryRing>

          {/* Descriptor and slogan with subtle solid-background fade so core/ring never collide */}
          <div
            data-ink-ring-occluder="box"
            data-ink-ring-occluder-from="0.38"
            className="relative z-20 -mt-2 sm:mt-4 pt-8 pb-2 px-6 w-full max-w-2xl space-y-4"
            style={{
              background:
                'linear-gradient(to bottom, var(--noir-clear) 0%, var(--noir) 38%, var(--noir) 100%)',
            }}
          >
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.32em] text-steel">
              {siteConfig.brand.descriptor}
            </p>
            <p className="font-serif text-lg sm:text-2xl md:text-[28px] uppercase tracking-[0.06em] text-ivory">
              {siteConfig.brand.slogan}
            </p>
          </div>

          {/* Primary & secondary CTAs */}
          <div className="relative z-10 mt-10 sm:mt-12 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              onClick={scrollToDrop}
              className="w-full sm:w-auto"
            >
              <span>{siteConfig.home.hero.primaryCta}</span>
              <ArrowDown className="w-4 h-4" aria-hidden="true" />
            </Button>

            <Button
              href={siteConfig.brand.facebookUrl}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-stone hover:border-ivory"
            >
              <span>{siteConfig.home.hero.secondaryCta}</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      {/* 2. Latest Drop grid */}
      <section
        id="latest-drop"
        className="scroll-mt-20 py-20 sm:py-24 md:py-28"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Reveal>
            <SectionHeader
              kicker={siteConfig.home.latestDrop.kicker}
              title={siteConfig.home.latestDrop.title}
              subtitle={
                siteConfig.previewMode
                  ? siteConfig.home.latestDrop.previewSubtitle
                  : siteConfig.home.latestDrop.subtitle
              }
              action={
                <div
                  role="group"
                  aria-label="Filter pieces by status"
                  className="flex items-center gap-5 sm:gap-6 overflow-x-auto pb-1"
                >
                  {FILTER_OPTIONS.map((option) => {
                    const active = statusFilter === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setStatusFilter(option.value)}
                        aria-pressed={active}
                        className={`relative py-2 text-[11px] uppercase tracking-[0.22em] whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                          active ? 'text-ivory' : 'text-stone hover:text-steel'
                        }`}
                      >
                        <span>{option.label}</span>
                        <span
                          aria-hidden="true"
                          className={`absolute left-0 right-0 bottom-0 h-[1px] bg-ivory transition-transform duration-200 origin-left ${
                            active ? 'scale-x-100' : 'scale-x-0'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              }
            />
          </Reveal>

          {filteredProducts.length > 0 ? (
            <div className="mt-10 sm:mt-12 grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {filteredProducts.map((product, index) => (
                <Reveal key={product.id} delay={Math.min(index * 0.05, 0.2)}>
                  <ProductCard product={product} onSelect={setSelectedProduct} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mt-12 py-16 text-center border border-charcoal">
              <p className="text-sm text-steel">
                {siteConfig.home.latestDrop.emptyMessage}
              </p>
            </div>
          )}
        </div>
      </section>

      <StitchDivider />

      {/* 3. Short intro strip */}
      <section className="py-20 sm:py-24 md:py-28 bg-charcoal/20">
        <Reveal className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4 max-w-3xl">
            <p className="inline-flex items-center gap-2.5 text-[11px] uppercase tracking-[0.26em] text-steel">
              <FourPointStar className="w-2.5 h-2.5 text-ivory" />
              <span>{siteConfig.home.introStrip.kicker}</span>
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.02em] leading-[1.05] text-ivory">
              {siteConfig.home.introStrip.statement}
            </h2>
          </div>

          <div className="shrink-0">
            <Button to={siteConfig.home.introStrip.linkTo} variant="text">
              <span>{siteConfig.home.introStrip.linkLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Button>
          </div>
        </Reveal>
      </section>

      <StitchDivider />

      {/* 4. What to Expect */}
      <section className="py-20 sm:py-24 md:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Reveal>
            <SectionHeader
              kicker={siteConfig.home.whatToExpect.kicker}
              title={siteConfig.home.whatToExpect.title}
              action={
                <Button to={siteConfig.home.whatToExpect.linkTo} variant="text">
                  <span>{siteConfig.home.whatToExpect.linkLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Button>
              }
            />
          </Reveal>

          <div className="mt-10 sm:mt-12 grid grid-cols-1 md:grid-cols-3 border-t border-l border-charcoal">
            {siteConfig.home.whatToExpect.items.map((item, idx) => (
              <Reveal
                key={item.number}
                delay={idx * 0.06}
                className="p-6 sm:p-8 border-r border-b border-charcoal flex flex-col justify-between gap-6"
              >
                <div className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.24em] text-stone tabular-nums">
                  <span>{item.number}</span>
                  <FourPointStar className="w-2.5 h-2.5 text-steel" />
                </div>

                <div className="space-y-2.5">
                  <h3 className="font-serif text-2xl sm:text-[26px] font-bold uppercase tracking-[-0.015em] text-ivory">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-steel leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <StitchDivider />

      {/* 5. Final CTA band */}
      <CTABand />

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}

export default HomePage;
