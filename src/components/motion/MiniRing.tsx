import { useId, useMemo, useRef } from 'react';
import { useMotionVisibility } from '../../hooks/useMotionVisibility';

export function MiniRing() {
  const uid = useId().replace(/:/g, '');
  const coreGradId = `mini-core-${uid}`;

  const containerRef = useRef<HTMLSpanElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const svgRefs = useMemo(() => [svgRef], []);

  const { isPaused } = useMotionVisibility({
    containerRef,
    svgRefs,
  });

  return (
    <span
      ref={containerRef}
      aria-hidden="true"
      className={`inline-flex items-center justify-center w-10 h-10 shrink-0 pointer-events-none ${
        isPaused ? 'motion-paused' : ''
      }`}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 40 40"
        fill="none"
        className="w-10 h-10 overflow-visible"
      >
        <defs>
          <radialGradient id={coreGradId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--motion-core-center)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--noir)" stopOpacity="1" />
          </radialGradient>
        </defs>

        {/* Back arc of stitched mini ellipse */}
        <g transform="rotate(-18 20 20)">
          <path
            d="M 37 20 A 17 5.5 0 0 0 3 20"
            stroke="var(--motion-line)"
            strokeWidth={1}
            strokeOpacity={0.65}
            strokeDasharray="2.5 2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className="motion-stitch-mini"
          />
        </g>

        {/* Outlined mini core circle */}
        <circle cx={20} cy={20} r={7.5} fill="var(--noir)" />
        <circle cx={20} cy={20} r={7.5} fill={`url(#${coreGradId})`} />
        <circle
          cx={20}
          cy={20}
          r={7.5}
          stroke="var(--motion-line)"
          strokeWidth={1}
          strokeOpacity={0.75}
          vectorEffect="non-scaling-stroke"
        />

        {/* Front arc of stitched mini ellipse */}
        <g transform="rotate(-18 20 20)">
          <path
            d="M 3 20 A 17 5.5 0 0 0 37 20"
            stroke="var(--motion-line)"
            strokeWidth={1}
            strokeOpacity={0.9}
            strokeDasharray="2.5 2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className="motion-stitch-mini"
          />
        </g>

        {/* Tiny four-point star at top-right */}
        <path
          d="M32 7.5 L32.7 10.3 L35.5 11 L32.7 11.7 L32 14.5 L31.3 11.7 L28.5 11 L31.3 10.3 Z"
          fill="var(--motion-star)"
        />
      </svg>
    </span>
  );
}
