import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, Moon, Sun, X, ArrowUpRight } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { useTheme } from '../context/ThemeContext';
import { Button } from './Button';
import { FourPointStar } from './Motifs';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
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
        className={`fixed top-0 inset-x-0 z-40 transition-colors duration-300 ${
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
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="inline-flex items-center justify-center w-11 h-11 md:w-10 md:h-10 border border-charcoal hover:border-ivory text-ivory transition-colors duration-200 cursor-pointer shrink-0"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4" aria-hidden="true" />
              )}
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
            className="fixed inset-0 z-30 bg-noir pt-24 pb-10 px-6 flex flex-col justify-between md:hidden overflow-y-auto"
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
