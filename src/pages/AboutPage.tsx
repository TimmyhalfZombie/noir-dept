import { useState } from 'react';
import { siteConfig } from '../config/siteConfig';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { CTABand } from '../components/CTABand';
import { FourPointStar, NoirEmblem } from '../components/Motifs';
import { PageHero } from '../components/PageHero';
import { Reveal } from '../components/Reveal';
import { SectionHeader } from '../components/SectionHeader';

export function AboutPage() {
  useDocumentMeta(siteConfig.meta.about);
  const [portraitFailed, setPortraitFailed] = useState(false);
  const { founder } = siteConfig.about;
  const showPortraitImage = Boolean(founder.portraitSrc) && !portraitFailed;

  return (
    <>
      {/* 1. Page Hero */}
      <PageHero
        label={siteConfig.about.hero.label}
        title={siteConfig.about.hero.title}
        subtitle={siteConfig.about.hero.subtitle}
      />

      {/* 2. Story block: split layout */}
      <section className="py-20 sm:py-24 md:py-32 border-b border-charcoal">
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

          {/* Right: Editorial body text + editable owner story placeholder */}
          <Reveal delay={0.08} className="lg:col-span-7 lg:pl-8 lg:border-l border-charcoal space-y-8">
            {siteConfig.about.story.paragraphs.map((paragraph, idx) => (
              <p
                key={idx}
                className="text-base sm:text-lg text-ivory/90 leading-[1.75] max-w-2xl"
              >
                {paragraph}
              </p>
            ))}

            <div className="pt-6 border-t border-charcoal">
              <p className="text-[10px] uppercase tracking-[0.24em] text-stone mb-3">
                Note
              </p>
              <p className="text-sm sm:text-base text-stone italic leading-relaxed max-w-2xl">
                {siteConfig.about.story.ownerStoryPlaceholder}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3. The Founder: two-column portrait + bio */}
      <section className="py-20 sm:py-24 md:py-32 border-b border-charcoal">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left: 4:5 grayscale portrait placeholder with top-right star */}
          <Reveal className="lg:col-span-5 w-full max-w-md lg:max-w-none mx-auto">
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
                  src={founder.portraitSrc}
                  alt={founder.portraitAlt}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() => setPortraitFailed(true)}
                  className="h-full w-full object-cover grayscale"
                />
              ) : (
                <div
                  aria-label="Founder portrait placeholder"
                  className="relative h-full w-full flex items-center justify-center p-8"
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 flex items-center justify-center text-stone/80"
                  >
                    <NoirEmblem className="w-[74%] h-[74%] max-w-[300px] max-h-[300px]" />
                  </div>
                  <span className="relative z-10 font-serif text-lg sm:text-xl font-bold uppercase tracking-[0.14em] text-ivory/85">
                    {siteConfig.brand.name}
                  </span>
                </div>
              )}
            </div>
          </Reveal>

          {/* Right: Label, name, role, body copy, italic serif signature */}
          <Reveal delay={0.08} className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.26em] text-stone">
                {founder.label}
              </p>

              <h2 className="font-serif text-4xl sm:text-5xl md:text-[56px] font-bold tracking-[-0.02em] leading-[1.04] text-ivory">
                {founder.name}
              </h2>

              <p className="text-xs uppercase tracking-[0.24em] text-steel pt-1">
                {founder.role}
              </p>
            </div>

            <div className="pt-2 space-y-5 max-w-2xl">
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

      {/* 4. What we stand for: 4 numbered principles */}
      <section className="py-20 sm:py-24 md:py-28 border-b border-charcoal">
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
                className="p-6 sm:p-8 border-r border-b border-charcoal flex flex-col justify-between gap-10"
              >
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-stone tabular-nums">
                  <span>{principle.number}</span>
                  <FourPointStar className="w-2.5 h-2.5 text-steel" />
                </div>

                <div className="space-y-3">
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold uppercase tracking-[-0.015em] text-ivory">
                    {principle.title}
                  </h3>
                  <p className="text-sm sm:text-base text-steel leading-relaxed">
                    {principle.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Large typographic slogan section with circular emblem */}
      <section className="relative overflow-hidden py-28 sm:py-36 md:py-44">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center text-stone/65 opacity-60"
        >
          <NoirEmblem className="w-[320px] h-[320px] sm:w-[460px] sm:h-[460px] md:w-[560px] md:h-[560px]" />
        </div>

        <Reveal className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 text-center space-y-6">
          <p className="text-[11px] uppercase tracking-[0.3em] text-steel">
            {siteConfig.about.sloganSection.kicker}
          </p>
          <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold uppercase tracking-[-0.03em] leading-[0.98] text-ivory">
            {siteConfig.about.sloganSection.slogan}
          </h2>
        </Reveal>
      </section>

      {/* 5. Final CTA band */}
      <CTABand />
    </>
  );
}
