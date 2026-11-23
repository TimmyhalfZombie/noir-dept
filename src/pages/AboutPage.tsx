import { useMemo, useState } from 'react';
import { seoRoutes } from '../config/site';
import { siteConfig } from '../config/siteConfig';
import { buildBreadcrumbSchema } from '../lib/schema';
import { CTABand } from '../components/CTABand';
import { FourPointStar } from '../components/Motifs';
import { PageHero } from '../components/PageHero';
import { Reveal } from '../components/Reveal';
import { SectionHeader } from '../components/SectionHeader';
import { Seo } from '../components/Seo';
import { EclipseBg } from '../components/motion/EclipseBg';
import { OrbitFrame } from '../components/motion/OrbitFrame';
import { StitchDivider } from '../components/motion/StitchDivider';

export function AboutPage() {
  const [portraitFailed, setPortraitFailed] = useState(false);
  const { founder } = siteConfig.about;
  const showPortraitImage = Boolean(founder.portraitSrc) && !portraitFailed;

  const breadcrumbSchema = useMemo(
    () =>
      buildBreadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
      ]),
    []
  );

  return (
    <>
      <Seo
        title={seoRoutes.about.title}
        description={seoRoutes.about.description}
        path={seoRoutes.about.path}
        jsonLd={breadcrumbSchema}
      />
      {/* 1. Page Hero with Eclipse background */}
      <PageHero
        label={siteConfig.about.hero.label}
        title={siteConfig.about.hero.title}
        subtitle={siteConfig.about.hero.subtitle}
        background={<EclipseBg />}
      />

      <StitchDivider />

      {/* 2. Story block: split layout */}
      <section className="py-20 sm:py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left: Big serif statement */}
          <Reveal className="lg:col-span-5 space-y-5">
            <p className="inline-flex items-center gap-2.5 text-[11px] uppercase tracking-[0.26em] text-stone">
              <FourPointStar className="w-2.5 h-2.5 text-steel" />
              <span>{siteConfig.about.story.kicker}</span>
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-[54px] font-bold tracking-[-0.02em] leading-[1.03] text-ivory">
              {siteConfig.about.story.statement}
            </h2>
          </Reveal>

          {/* Right: Editorial body text */}
          <Reveal delay={0.08} className="lg:col-span-7 lg:pl-8 lg:border-l border-charcoal space-y-6">
            {siteConfig.about.story.paragraphs.map((paragraph, idx) => (
              <p
                key={idx}
                className="text-base sm:text-lg text-ivory/90 leading-[1.75] max-w-2xl"
              >
                {paragraph}
              </p>
            ))}
          </Reveal>
        </div>
      </section>

      <StitchDivider />

      {/* 3. From the Founder: two-column portrait with OrbitFrame + copy */}
      <section className="py-20 sm:py-24 md:py-32 overflow-x-clip">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16 items-center">
          {/* Left: 4:5 portrait wrapped in OrbitFrame (simple placeholder, no stock photo) */}
          <Reveal className="lg:col-span-5 w-full">
            <OrbitFrame>
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-charcoal border border-charcoal">
                {/* Top-right four-point star marker */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute top-4 right-4 z-10 text-stone"
                >
                  <FourPointStar className="w-3.5 h-3.5" />
                </div>

                {showPortraitImage ? (
                  <img
                    data-ink-live
                    src={founder.portraitSrc}
                    alt={founder.portraitAlt}
                    width={1000}
                    height={1250}
                    loading="lazy"
                    decoding="async"
                    onError={() => setPortraitFailed(true)}
                    className="founder-portrait-img h-full w-full object-cover object-[center_25%]"
                  />
                ) : (
                  <div
                    aria-label="Founder portrait placeholder"
                    className="h-full w-full bg-charcoal"
                  />
                )}
              </div>
            </OrbitFrame>
          </Reveal>

          {/* Right: Label, body copy, italic serif signature */}
          <Reveal delay={0.08} className="lg:col-span-7 space-y-6">
            <p className="text-[11px] uppercase tracking-[0.26em] text-stone">
              {founder.label}
            </p>

            <div className="space-y-5 max-w-2xl">
              {founder.paragraphs.map((paragraph, idx) => (
                <p
                  key={idx}
                  className="text-base sm:text-lg text-ivory/90 leading-[1.75]"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="pt-6 border-t border-charcoal max-w-2xl">
              <p className="font-serif italic text-xl sm:text-2xl text-ivory">
                {founder.signature}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <StitchDivider />

      {/* 4. What we stand for: 4 numbered principles */}
      <section className="py-20 sm:py-24 md:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Reveal>
            <SectionHeader
              kicker={siteConfig.about.principles.kicker}
              title={siteConfig.about.principles.title}
            />
          </Reveal>

          <div className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-charcoal">
            {siteConfig.about.principles.items.map((principle, idx) => (
              <Reveal
                key={principle.number}
                delay={idx * 0.06}
                className="p-6 sm:p-8 border-r border-b border-charcoal flex flex-col justify-start min-w-0"
              >
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-stone tabular-nums">
                  <span>{principle.number}</span>
                  <FourPointStar className="w-2.5 h-2.5 text-steel shrink-0" />
                </div>

                <h3 className="mt-10 sm:mt-12 font-serif text-[clamp(1.25rem,1.9vw,1.75rem)] font-bold uppercase tracking-[-0.015em] leading-[1.15] text-ivory whitespace-nowrap">
                  {principle.title}
                </h3>

                <p className="mt-3 text-sm sm:text-base text-steel leading-relaxed">
                  {principle.description}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <StitchDivider />

      {/* 5. Large typographic slogan section (old rotating emblem removed) */}
      <section className="relative overflow-hidden py-24 sm:py-32 md:py-40">
        <Reveal className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 text-center space-y-6">
          <p className="inline-flex items-center gap-2.5 text-[11px] uppercase tracking-[0.3em] text-steel">
            <FourPointStar className="w-2.5 h-2.5 text-ivory" />
            <span>{siteConfig.about.sloganSection.kicker}</span>
            <FourPointStar className="w-2.5 h-2.5 text-ivory" />
          </p>
          <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold uppercase tracking-[-0.03em] leading-[0.98] text-ivory">
            {siteConfig.about.sloganSection.slogan}
          </h2>
        </Reveal>
      </section>

      <StitchDivider />

      {/* 6. Final CTA band with Planetrise */}
      <CTABand />
    </>
  );
}

export default AboutPage;
