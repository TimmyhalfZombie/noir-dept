import type { ReactNode } from 'react';
import { FourPointStar } from './Motifs';

interface PageHeroProps {
  label: string;
  title: string;
  subtitle: string;
  background?: ReactNode;
}

export function PageHero({ label, title, subtitle, background }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-24 md:pt-44 md:pb-28">
      {background}

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
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
