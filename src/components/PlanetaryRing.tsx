import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from 'react';

interface PlanetaryRingProps {
  heroRef: RefObject<HTMLElement | null>;
  children: ReactNode;
}

const RING_UNIT =
  'STREETWEAR \u2022 RARE FINDS \u2022 WEAR THE PAST. KEEP THE STYLE. \u2022 NOIR DEPT. \u2022 ';

const VIEW_W = 920;
const VIEW_H = 560;
const CX = VIEW_W / 2; // 460
const CY = VIEW_H / 2; // 280

const CORE_R = 235;
const RING_R = 342; // ~1.455x core radius
const RING_INNER_R = 318;
const RING_OUTER_R = 366;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R; // ~2148.85

const TILT_DEG = -14;
const MAX_PARALLAX_PX = 6;

export function PlanetaryRing({ heroRef, children }: PlanetaryRingProps) {
  const uid = useId().replace(/:/g, '');
  const textPathId = `ring-path-${uid}`;
  const coreGradId = `core-grad-${uid}`;
  const backClipId = `ring-back-clip-${uid}`;
  const frontClipId = `ring-front-clip-${uid}`;
  const backFadeGradId = `ring-back-fade-grad-${uid}`;
  const backFadeMaskId = `ring-back-fade-mask-${uid}`;

  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  const parallaxRef = useRef<HTMLDivElement | null>(null);

  // Track mobile breakpoint so text stays legible (~10px tall after flattening)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Respect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Pause animation & parallax when hero scrolls off-screen
  useEffect(() => {
    const target = heroRef.current;
    if (!target || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsVisible(entry.isIntersecting);
        }
      },
      { threshold: 0.01 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [heroRef]);

  // Gentle desktop-only cursor parallax (max 6px, disabled on touch & reduced motion)
  useEffect(() => {
    if (reducedMotion || !isVisible) {
      if (parallaxRef.current && reducedMotion) {
        parallaxRef.current.style.transform = 'translate3d(0px, 0px, 0px)';
      }
      return;
    }

    const canParallax = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const heroEl = heroRef.current;
    if (!canParallax || !heroEl) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = 0;
    let active = false;

    const step = () => {
      currentX += (targetX - currentX) * 0.07;
      currentY += (targetY - currentY) * 0.07;

      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0px)`;
      }

      if (Math.abs(targetX - currentX) > 0.02 || Math.abs(targetY - currentY) > 0.02) {
        rafId = window.requestAnimationFrame(step);
      } else {
        active = false;
      }
    };

    const kick = () => {
      if (!active) {
        active = true;
        rafId = window.requestAnimationFrame(step);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = heroEl.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      targetX = Math.max(-1, Math.min(1, nx)) * MAX_PARALLAX_PX;
      targetY = Math.max(-1, Math.min(1, ny)) * MAX_PARALLAX_PX;
      kick();
    };

    const onMouseLeave = () => {
      targetX = 0;
      targetY = 0;
      kick();
    };

    heroEl.addEventListener('mousemove', onMouseMove, { passive: true });
    heroEl.addEventListener('mouseleave', onMouseLeave, { passive: true });

    return () => {
      window.cancelAnimationFrame(rafId);
      heroEl.removeEventListener('mousemove', onMouseMove);
      heroEl.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [heroRef, isVisible, reducedMotion]);

  // Counter-clockwise circular path so letters on the front (lower) half are upright and read left-to-right
  const circlePath = `M ${-RING_R} 0 A ${RING_R} ${RING_R} 0 0 0 ${RING_R} 0 A ${RING_R} ${RING_R} 0 0 0 ${-RING_R} 0`;

  // Perspective flatten scale & font size tuned for desktop + mobile legibility
  const scaleY = isMobile ? 0.36 : 0.28;
  const ringFontSize = isMobile ? 31 : 16;
  const ringText = isMobile ? RING_UNIT : `${RING_UNIT}${RING_UNIT}`;
  const ringTextLength = isMobile
    ? Math.round(RING_CIRCUMFERENCE - 28)
    : Math.round(RING_CIRCUMFERENCE - 18);

  const pausedClass = !isVisible || reducedMotion ? 'ring-paused' : '';

  const renderRingBand = () => (
    <g transform={`scale(1, ${scaleY})`}>
      <g className="ring-spin">
        {/* Outer stitched ring border */}
        <circle
          cx={0}
          cy={0}
          r={RING_OUTER_R}
          stroke="var(--stone)"
          strokeWidth={1}
          strokeDasharray="6 5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {/* Inner stitched ring border */}
        <circle
          cx={0}
          cy={0}
          r={RING_INNER_R}
          stroke="var(--stone)"
          strokeWidth={1}
          strokeDasharray="6 5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {/* Orbiting circular text band */}
        <text
          fill="var(--steel)"
          fontSize={ringFontSize}
          fontWeight={500}
          letterSpacing="0.35em"
          style={{ fontFamily: 'var(--font-sans)' }}
          dominantBaseline="central"
        >
          <textPath
            href={`#${textPathId}`}
            startOffset="0%"
            textLength={ringTextLength}
            lengthAdjust="spacing"
          >
            {ringText}
          </textPath>
        </text>
      </g>
    </g>
  );

  return (
    <div
      className={`relative flex items-center justify-center w-full py-20 sm:py-28 md:py-36 ${pausedClass}`}
    >
      {/* Centered planetary core + orbiting ring behind wordmark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center z-0"
      >
        <div ref={parallaxRef} className="will-change-transform flex items-center justify-center">
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            fill="none"
            className="w-[142vw] max-w-[560px] sm:w-[92vw] sm:max-w-[920px] lg:w-[88vw] lg:max-w-[1160px] h-auto overflow-visible"
          >
            <defs>
              {/* Circular path for the rotating text band */}
              <path id={textPathId} d={circlePath} />

              {/* Core radial sphere gradient: #2F2F2F at 35% center -> #0D0D0D at edge */}
              <radialGradient id={coreGradId} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--charcoal)" stopOpacity="0.35" />
                <stop offset="68%" stopColor="var(--charcoal)" stopOpacity="0.12" />
                <stop offset="100%" stopColor="var(--noir)" stopOpacity="1" />
              </radialGradient>

              {/* Split clip-paths aligned to the tilted ellipse's horizontal axis (y = 0) */}
              <clipPath id={backClipId}>
                <rect x={-520} y={-520} width={1040} height={520} />
              </clipPath>
              <clipPath id={frontClipId}>
                <rect x={-520} y={0} width={1040} height={520} />
              </clipPath>

              {/* Depth fade on back half: brighter at left/right sides (y = 0), darker at top (far back) */}
              <linearGradient
                id={backFadeGradId}
                x1="0"
                y1={-RING_OUTER_R * scaleY}
                x2="0"
                y2="0"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
                <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.68" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
              </linearGradient>

              <mask id={backFadeMaskId}>
                <rect
                  x={-520}
                  y={-520}
                  width={1040}
                  height={520}
                  fill={`url(#${backFadeGradId})`}
                />
              </mask>
            </defs>

            {/* LAYER 1: Back half of ring (far side, behind core circle) */}
            <g transform={`translate(${CX} ${CY}) rotate(${TILT_DEG})`}>
              <g clipPath={`url(#${backClipId})`} mask={`url(#${backFadeMaskId})`} opacity={0.45}>
                {renderRingBand()}
              </g>
            </g>

            {/* LAYER 2: Dark core circle (solidly hides back half of ring) */}
            <g>
              {/* Solid opaque backing so nothing behind the sphere bleeds through */}
              <circle cx={CX} cy={CY} r={CORE_R} fill="var(--noir)" />
              {/* Subtle radial sphere shading */}
              <circle cx={CX} cy={CY} r={CORE_R} fill={`url(#${coreGradId})`} />
              {/* 1px hairline outline in #6B6B6B at 50% opacity */}
              <circle
                cx={CX}
                cy={CY}
                r={CORE_R}
                stroke="var(--stone)"
                strokeWidth={1}
                strokeOpacity={0.5}
                vectorEffect="non-scaling-stroke"
              />
              {/* Small static four-point star in #8A8A8A on the top edge of the core circle */}
              <g transform={`translate(${CX} ${CY - CORE_R})`}>
                <circle cx={0} cy={0} r={9} fill="var(--noir)" />
                <path
                  d="M0 -6.5 L1.35 -1.35 L6.5 0 L1.35 1.35 L0 6.5 L-1.35 1.35 L-6.5 0 L-1.35 -1.35 Z"
                  fill="var(--steel)"
                />
              </g>
            </g>

            {/* LAYER 3: Front half of ring (near side, in front of core, behind wordmark) */}
            <g transform={`translate(${CX} ${CY}) rotate(${TILT_DEG})`}>
              <g clipPath={`url(#${frontClipId})`} opacity={0.85}>
                {renderRingBand()}
              </g>
            </g>
          </svg>
        </div>
      </div>

      {/* LAYER 4: Untouched NOIR DEPT. serif wordmark above the ring */}
      {children}
    </div>
  );
}
