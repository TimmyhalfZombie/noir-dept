/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  type MutableRefObject,
} from 'react';
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { Analytics } from './components/Analytics';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { InkTransition } from './ui/inkTransition';

const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function RouteSync({
  inkRef,
}: {
  inkRef: MutableRefObject<InkTransition | null>;
}) {
  const { pathname } = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    inkRef.current?.invalidate();
  }, [pathname, inkRef]);

  return null;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.main
        id="main-content"
        tabIndex={-1}
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 focus:outline-none"
      >
        <Suspense fallback={<div className="min-h-[70vh]" aria-hidden="true" />}>
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </motion.main>
    </AnimatePresence>
  );
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const inkRef = useRef<InkTransition | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ink = new InkTransition(canvas, toggleButtonRef.current);
    inkRef.current = ink;
    return () => {
      ink.destroy();
      inkRef.current = null;
    };
  }, []);

  const handleToggleTheme = useCallback(() => {
    inkRef.current?.toggle();
  }, []);

  return (
    <HelmetProvider>
      <MotionConfig reducedMotion="user">
        <BrowserRouter>
          <RouteSync inkRef={inkRef} />
          <Analytics />
          <div className="relative min-h-screen flex flex-col bg-noir text-ivory">
            {/* Skip to content link for keyboard and screen-reader users */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2.5 focus:bg-ivory focus:text-noir focus:text-xs focus:uppercase focus:tracking-[0.2em]"
            >
              Skip to content
            </a>

            {/* Full-viewport WebGL2 Ink Bleed transition overlay (hidden until active) */}
            <canvas
              ref={canvasRef}
              aria-hidden="true"
              className="ink-canvas"
            />

            {/* Subtle low-opacity distressed grain texture above the ink canvas */}
            <div
              data-ink-live
              aria-hidden="true"
              className="noir-grain pointer-events-none fixed inset-0 z-[70] opacity-[0.03] dark:opacity-[0.045]"
            />

            <Navbar
              toggleButtonRef={toggleButtonRef}
              onToggleTheme={handleToggleTheme}
            />
            <AnimatedRoutes />
            <Footer />
          </div>
        </BrowserRouter>
      </MotionConfig>
    </HelmetProvider>
  );
}
