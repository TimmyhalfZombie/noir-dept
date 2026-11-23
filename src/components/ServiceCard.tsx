import type { ServiceItem } from '../config/siteConfig';
import { FourPointStar } from './Motifs';

interface ServiceCardProps {
  service: ServiceItem;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className="h-full flex flex-col justify-between p-6 sm:p-8 bg-charcoal/30 border border-charcoal hover:border-stone transition-colors duration-200">
      <div>
        <div className="flex items-center justify-between gap-4 pb-6 mb-6 border-b border-charcoal">
          <div className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.24em] text-steel tabular-nums">
            <span>{service.number}</span>
            <FourPointStar className="w-2.5 h-2.5 text-ivory" />
          </div>

          {service.tag && (
            <span className="text-[10px] uppercase tracking-[0.22em] text-ivory border border-stone px-2.5 py-1 whitespace-nowrap shrink-0">
              {service.tag}
            </span>
          )}
        </div>

        <h3 className="font-serif text-2xl sm:text-3xl font-bold uppercase tracking-[-0.015em] text-ivory mb-4">
          {service.title}
        </h3>

        <p
          className={`text-sm sm:text-base leading-relaxed ${
            service.isPlaceholder ? 'text-stone italic' : 'text-steel'
          }`}
        >
          {service.description}
        </p>
      </div>
    </article>
  );
}
