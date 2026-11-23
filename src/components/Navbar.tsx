import { useEffect, useState, type RefObject } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { getTheme } from '../ui/theme';
import { Button } from './Button';
import { FourPointStar } from './Motifs';

interface NavbarProps {
  toggleButtonRef: RefObject<HTMLButtonElement | null>;
  onToggleTheme: () => void;
}

export function Navbar({ toggleButtonRef, onToggleTheme }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  return (
    <>
      <header
        data-ink-live
        className={`ink-live-navbar fixed top-0 inset-x-0 z-50 ${
          scrolled || menuOpen
            ? 'bg-noir/95 border-b border-charcoal'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 md:h-20 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line brand wordmark */}
          <Link
            to="/"
            className="font-serif text-lg sm:text-xl font-bold tracking-[0.06em] uppercase text-ivory whitespace-nowrap shrink-0 hover:opacity-85 transition-opacity"
          >
            {siteConfig.brand.name}
          </Link>

          {/* Zone 2: Desktop navigation links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-10"
          >
            {siteConfig.nav.links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `relative py-1.5 text-[11px] uppercase tracking-[0.22em] whitespace-nowrap shrink-0 transition-colors duration-200 ${
                    isActive
                      ? 'text-ivory'
                      : 'text-steel hover:text-ivory'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{item.label}</span>
                    <span
                      aria-hidden="true"
                      className={`absolute left-0 right-0 bottom-0 h-[1px] bg-ivory transition-transform duration-300 origin-left ${
                        isActive ? 'scale-x-100' : 'scale-x-0'
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: Theme toggle + primary action (desktop) and mobile menu toggle */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              ref={toggleButtonRef}
              type="button"
              onClick={onToggleTheme}
              aria-label="Toggle theme"
              aria-pressed={getTheme() === 'dark'}
              title="Toggle theme"
              className="inline-flex items-center justify-center w-11 h-11 md:w-10 md:h-10 border border-charcoal hover:border-ivory bg-transparent text-ivory cursor-pointer shrink-0 focus-visible:outline-1 focus-visible:outline-ivory focus-visible:outline-offset-2"
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="w-4 h-4 overflow-visible"
              >
                <path
                  className="theme-toggle__body"
                  d="M12 7a5 5 0 1 1 0 10a5 5 0 1 1 0-10z"
                />
                <g className="theme-toggle__rays">
                  <line x1="12" y1="1.8" x2="12" y2="3.8" />
                  <line x1="19.21" y1="4.79" x2="17.8" y2="6.2" />
                  <line x1="22.2" y1="12" x2="20.2" y2="12" />
                  <line x1="19.21" y1="19.21" x2="17.8" y2="17.8" />
                  <line x1="12" y1="22.2" x2="12" y2="20.2" />
                  <line x1="4.79" y1="19.21" x2="6.2" y2="17.8" />
                  <line x1="1.8" y1="12" x2="3.8" y2="12" />
                  <line x1="4.79" y1="4.79" x2="6.2" y2="6.2" />
                </g>
              </svg>
            </button>

            <div className="hidden md:block">
              <Button
                href={siteConfig.brand.facebookUrl}
                variant="outline"
                size="sm"
                className="border-ivory/60 hover:border-ivory"
              >
                <span>{siteConfig.nav.ctaLabel}</span>
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Button>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="md:hidden inline-flex items-center justify-center w-11 h-11 text-ivory border border-charcoal hover:border-ivory transition-colors cursor-pointer"
            >
              {menuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[45] bg-noir pt-24 pb-10 px-6 flex flex-col justify-between md:hidden overflow-y-auto"
          >
            <div className="pt-8">
              <p className="text-[11px] uppercase tracking-[0.26em] text-stone mb-8 flex items-center gap-2.5">
                <FourPointStar className="w-2.5 h-2.5 text-steel" />
                <span>{siteConfig.brand.descriptor}</span>
              </p>

              <nav aria-label="Mobile navigation links" className="flex flex-col border-t border-charcoal">
                {siteConfig.nav.links.map((item, idx) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `group flex items-baseline justify-between py-6 border-b border-charcoal transition-colors ${
                        isActive ? 'text-ivory' : 'text-steel hover:text-ivory'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className="font-serif text-4xl uppercase tracking-[-0.02em]">
                          {item.label}
                        </span>
                        <span className="text-[11px] uppercase tracking-[0.22em] text-stone flex items-center gap-2">
                          {isActive && <FourPointStar className="w-2.5 h-2.5 text-ivory" />}
                          <span>0{idx + 1}</span>
                        </span>
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="pt-10 space-y-6">
              <Button
                href={siteConfig.brand.facebookUrl}
                variant="primary"
                size="lg"
                className="w-full"
              >
                <span>{siteConfig.nav.ctaLabel} on Facebook</span>
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </Button>
              <p className="text-[11px] uppercase tracking-[0.22em] text-stone text-center">
                {siteConfig.brand.slogan}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
