import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useMotionVisibility } from '../../hooks/useMotionVisibility';

const CX = 800;
const CY = 330;
const SPHERE_R = 420;
const ORBIT_RX = 760;
const ORBIT_RY = 170;
const ORBIT_TILT = -12;

// Closed ellipse path centered at (800, 330) with rx=760, ry=170
const ORBIT_PATH = `M ${CX - ORBIT_RX} ${CY} A ${ORBIT_RX} ${ORBIT_RY} 0 1 0 ${
  CX + ORBIT_RX
} ${CY} A ${ORBIT_RX} ${ORBIT_RY} 0 1 0 ${CX - ORBIT_RX} ${CY}`;

// Four-point star shape centered at (0, 0), matching the Home hero star
const STAR_PATH = 'M0 -9 L1.85 -1.85 L9 0 L1.85 1.85 L0 9 L-1.85 1.85 L-9 0 L-1.85 -1.85 Z';

export function EclipseBg() {
  const uid = useId().replace(/:/g, '');
  const orbitPathId = `about-orbit-path-${uid}`;
  const sphereClipId = `about-sphere-clip-${uid}`;
  const litGradId = `about-lit-grad-${uid}`;
  const frontClipId = `about-front-clip-${uid}`;

  const [isMobileView, setIsMobileView] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const svgRefs = useMemo(() => [svgRef], []);

  const { isPaused, reducedMotion } = useMotionVisibility({
    containerRef,
    svgRefs,
  });

  // Switch SVG viewBox at max-width: 700px so the whole sphere stays framed on mobile
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 700px)');
    const update = () => setIsMobileView(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Static resting positions for reduced-motion mode (opposite sides of the orbit)
  const staticTheta = 0.52;
  const brightStaticX = (CX + ORBIT_RX * Math.cos(staticTheta)).toFixed(1);
  const brightStaticY = (CY + ORBIT_RY * Math.sin(staticTheta)).toFixed(1);
  const mutedStaticX = (CX - ORBIT_RX * Math.cos(staticTheta)).toFixed(1);
  const mutedStaticY = (CY - ORBIT_RY * Math.sin(staticTheta)).toFixed(1);

  const renderOrbitAndMoons = (lineOpacity: number) => (
    <g transform={`rotate(${ORBIT_TILT} ${CX} ${CY})`}>
      <path
        d={ORBIT_PATH}
        stroke="var(--motion-line)"
        strokeWidth={1}
        strokeOpacity={lineOpacity}
        strokeDasharray="6 5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        className="about-orbit-stitch"
      />

      {/* Bright moon (scale 1.3, 34s loop) */}
      <g
        transform={
          reducedMotion
            ? `translate(${brightStaticX} ${brightStaticY})`
            : undefined
        }
      >
        {!reducedMotion && (
          <animateMotion dur="34s" repeatCount="indefinite">
            <mpath href={`#${orbitPathId}`} />
          </animateMotion>
        )}
        <g transform={`rotate(${-ORBIT_TILT}) scale(1.3)`}>
          <path d={STAR_PATH} fill="var(--motion-star)" />
        </g>
      </g>

      {/* Smaller muted moon on the opposite side (scale 0.75, begin="-17s") */}
      <g
        transform={
          reducedMotion
            ? `translate(${mutedStaticX} ${mutedStaticY})`
            : undefined
        }
      >
        {!reducedMotion && (
          <animateMotion dur="34s" begin="-17s" repeatCount="indefinite">
            <mpath href={`#${orbitPathId}`} />
          </animateMotion>
        )}
        <g transform={`rotate(${-ORBIT_TILT}) scale(0.75)`}>
          <path d={STAR_PATH} fill="var(--motion-star-muted)" />
        </g>
      </g>
    </g>
  );

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden z-0 ${
        isPaused ? 'motion-paused' : ''
      }`}
    >
      <svg
        ref={svgRef}
        viewBox={isMobileView ? '340 -170 920 1000' : '0 0 1600 700'}
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        className="w-full h-full"
      >
        <defs>
          {/* Shared orbit ellipse path for <mpath> */}
          <path id={orbitPathId} d={ORBIT_PATH} />

          {/* Sphere clipPath */}
          <clipPath id={sphereClipId}>
            <circle cx={CX} cy={CY} r={SPHERE_R} />
          </clipPath>

          {/* Lit sphere surface radial gradient */}
          <radialGradient id={litGradId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--about-sphere-lit)" stopOpacity="1" />
            <stop offset="58%" stopColor="var(--about-sphere-lit)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="var(--noir)" stopOpacity="1" />
          </radialGradient>

          {/* Front orbit clip: lower half of the tilted orbit from y=330 down, rotated -12deg */}
          <clipPath id={frontClipId}>
            <rect
              x={-200}
              y={CY}
              width={2000}
              height={900}
              transform={`rotate(${ORBIT_TILT} ${CX} ${CY})`}
            />
          </clipPath>
        </defs>

        {/* 1. BACK ORBIT (behind sphere) */}
        {renderOrbitAndMoons(0.65)}

        {/* 2. SPHERE (hides back orbit, houses drifting lit surface + swaying crescent shadow) */}
        <circle cx={CX} cy={CY} r={SPHERE_R} fill="var(--noir)" />

        <g clipPath={`url(#${sphereClipId})`}>
          {/* Slowly drifting lit surface (-40,-30 to 50,20, 18s alternate) */}
          <g className="about-lit-drift">
            <circle cx={CX} cy={CY} r={SPHERE_R + 70} fill={`url(#${litGradId})`} />
          </g>

          {/* Slightly swaying crescent shadow (-14px to 14px, 18s alternate) */}
          <g className="about-crescent-sway">
            <circle
              cx={280}
              cy={CY}
              r={430}
              fill="var(--about-crescent-shadow)"
              fillOpacity={0.85}
            />
            <circle
              cx={280}
              cy={CY}
              r={430}
              stroke="var(--motion-line)"
              strokeWidth={1}
              strokeOpacity={0.75}
              strokeDasharray="6 5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              className="about-crescent-stitch"
            />
          </g>
        </g>

        {/* 3. SPHERE OUTLINE (1px line color at 75% opacity) */}
        <circle
          cx={CX}
          cy={CY}
          r={SPHERE_R}
          stroke="var(--motion-line)"
          strokeWidth={1}
          strokeOpacity={0.75}
          vectorEffect="non-scaling-stroke"
        />

        {/* 4. FRONT ORBIT (lower half clipped along tilted axis, passes in front of sphere) */}
        <g clipPath={`url(#${frontClipId})`}>
          {renderOrbitAndMoons(0.45)}
        </g>
      </svg>
    </div>
  );
}
