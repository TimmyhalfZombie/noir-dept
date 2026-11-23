import type { ReactNode } from 'react';
import { FourPointStar } from './Motifs';

interface SectionHeaderProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({
  kicker,
  title,
  subtitle,
  action,
  className = '',
}: SectionHeaderProps) {
  return (
    <div
      className={`flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-charcoal ${className}`.trim()}
    >
      <div className="space-y-3">
        {kicker && (
          <p className="text-[11px] uppercase tracking-[0.26em] text-stone">
            {kicker}
          </p>
        )}
        <div className="flex items-center gap-3.5">
          <FourPointStar className="w-4 h-4 text-ivory shrink-0" />
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-[-0.02em] leading-none text-ivory">
            {title}
          </h2>
        </div>
        {subtitle && (
          <p className="text-sm sm:text-base text-steel max-w-xl leading-relaxed pt-1">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
