import { FourPointStar, OrbitalSwoosh } from './Motifs';

interface PageHeroProps {
  label: string;
  title: string;
  subtitle: string;
}

export function PageHero({ label, title, subtitle }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-charcoal pt-32 pb-20 sm:pt-40 sm:pb-24 md:pt-44 md:pb-28">
      {/* Subtle orbital swoosh motif in background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 sm:-right-12 top-1/2 -translate-y-1/2 text-stone/60 opacity-45"
      >
        <OrbitalSwoosh className="w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] md:w-[560px] md:h-[560px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
        <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-steel mb-6">
          <FourPointStar className="w-3 h-3 text-ivory" />
          <span>{label}</span>
        </div>

        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold uppercase tracking-[-0.03em] leading-[0.95] text-ivory max-w-4xl">
          {title}
        </h1>

        <p className="mt-6 text-base sm:text-lg text-steel max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
