import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { FourPointStar } from './Motifs';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-charcoal bg-noir text-ivory">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-12 border-b border-charcoal">
          {/* Brand block */}
          <div className="md:col-span-5 space-y-3">
            <Link
              to="/"
              className="inline-block font-serif text-2xl sm:text-3xl font-bold uppercase tracking-[0.04em] text-ivory"
            >
              {siteConfig.brand.name}
            </Link>
            <p className="text-[11px] uppercase tracking-[0.24em] text-steel">
              {siteConfig.brand.descriptor}
            </p>
          </div>

          {/* Navigation links */}
          <div className="md:col-span-4 space-y-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-stone flex items-center gap-2">
              <FourPointStar className="w-2.5 h-2.5 text-stone" />
              <span>Pages</span>
            </p>
            <nav aria-label="Footer navigation" className="flex flex-wrap md:flex-col gap-x-6 gap-y-2.5">
              {siteConfig.nav.links.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-sm text-steel hover:text-ivory transition-colors w-fit"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Facebook channel */}
          <div className="md:col-span-3 space-y-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-stone flex items-center gap-2">
              <FourPointStar className="w-2.5 h-2.5 text-stone" />
              <span>Channel</span>
            </p>
            <a
              href={siteConfig.brand.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="NOIR DEPT. on Facebook"
              className="inline-flex items-center gap-1.5 text-sm text-ivory border-b border-charcoal hover:border-ivory pb-0.5 transition-colors"
            >
              <span>Facebook</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-steel" aria-hidden="true" />
            </a>
            <p className="text-xs text-stone">
              {siteConfig.brand.facebookHandle}
            </p>
          </div>
        </div>

        {/* Bottom bar: copyright and independent reseller disclaimer */}
        <div className="pt-8 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-steel whitespace-nowrap shrink-0">
            &copy; {currentYear} {siteConfig.brand.name}
          </p>
          <p className="text-xs leading-relaxed text-stone max-w-3xl">
            {siteConfig.footer.disclaimer}
          </p>
        </div>
      </div>
    </footer>
  );
}
