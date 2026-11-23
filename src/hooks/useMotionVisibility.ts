import { useEffect, useState, type RefObject } from 'react';

interface MotionVisibilityOptions {
  containerRef: RefObject<Element | null>;
  svgRefs?: Array<RefObject<SVGSVGElement | null>>;
}

export function useMotionVisibility({
  containerRef,
  svgRefs = [],
}: MotionVisibilityOptions) {
  const [isVisible, setIsVisible] = useState(true);
  const [hasEntered, setHasEntered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      setHasEntered(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting) {
          setHasEntered(true);
        }
      },
      { threshold: 0.01, rootMargin: '40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef]);

  const isPaused = !isVisible || reducedMotion;

  useEffect(() => {
    for (const ref of svgRefs) {
      const svg = ref.current;
      if (!svg) continue;
      try {
        if (isPaused) {
          if (typeof svg.pauseAnimations === 'function') {
            svg.pauseAnimations();
          }
        } else if (typeof svg.unpauseAnimations === 'function') {
          svg.unpauseAnimations();
        }
      } catch {
        // Ignore SMIL control errors on unsupported browsers
      }
    }
  }, [isPaused, svgRefs]);

  return { isVisible, hasEntered, reducedMotion, isPaused };
}
