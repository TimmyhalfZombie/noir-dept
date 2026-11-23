import { useId, useMemo, useRef } from 'react';
import { useMotionVisibility } from '../../hooks/useMotionVisibility';

interface OrbitSpec {
  label: string;
  rx: number;
  ry: number;
  stitchClass: string;
  orbitDur: string;
  beginOffset: string;
  staticAngleRad: number;
}

const ORBITS: OrbitSpec[] = [
  {
    label: '01',
    rx: 140,
    ry: 42,
    stitchClass: 'motion-stitch-4s',
    orbitDur: '18s',
    beginOffset: '-3s',
    staticAngleRad: -0.45,
  },
  {
    label: '02',
    rx: 235,
    ry: 72,
    stitchClass: 'motion-stitch-7s-rev',
    orbitDur: '30s',
    beginOffset: '-11s',
    staticAngleRad: 2.35,
  },
  {
    label: '03',
    rx: 340,
    ry: 104,
    stitchClass: 'motion-stitch-11s',
    orbitDur: '46s',
    beginOffset: '-24s',
    staticAngleRad: 0.48,
  },
];

function ellipsePath(rx: number, ry: number): string {
  return `M ${rx} 0 A ${rx} ${ry} 0 1 1 ${-rx} 0 A ${rx} ${ry} 0 1 1 ${rx} 0`;
}

export function OrreryBg() {
  const uid = useId().replace(/:/g, '');
  const coreGradId = `orrery-core-${uid}`;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const svgRefs = useMemo(() => [svgRef], []);

  const { isPaused, reducedMotion } = useMotionVisibility({
    containerRef,
    svgRefs,
  });

  const cx = 400;
  const cy = 280;
  const coreR = 40;

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
        viewBox="0 0 800 560"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        className="w-full h-full"
      >
        <defs>
          <radialGradient id={coreGradId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--motion-core-center)" stopOpacity="0.95" />
            <stop offset="65%" stopColor="var(--motion-core-center)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--noir)" stopOpacity="1" />
          </radialGradient>
        </defs>

        <g transform={`translate(${cx} ${cy}) rotate(-14)`}>
          {ORBITS.map((orbit) => {
            const path = ellipsePath(orbit.rx, orbit.ry);
            const sx = orbit.rx * Math.cos(orbit.staticAngleRad);
            const sy = orbit.ry * Math.sin(orbit.staticAngleRad);

            return (
              <g key={orbit.label}>
                <path
                  d={path}
                  stroke="var(--motion-line)"
                  strokeWidth={1}
                  strokeOpacity={0.65}
                  strokeDasharray="6 5"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  className={orbit.stitchClass}
                />

                {/* Traveling star + upright step number */}
                <g transform={reducedMotion ? `translate(${sx.toFixed(1)} ${sy.toFixed(1)})` : undefined}>
                  {!reducedMotion && (
                    <animateMotion
                      dur={orbit.orbitDur}
                      begin={orbit.beginOffset}
                      repeatCount="indefinite"
                      path={path}
                    />
                  )}

                  {/* Counter-rotate +14deg so star and 01/02/03 labels stay upright */}
                  <g transform="rotate(14)">
                    <circle cx={0} cy={0} r={7.5} fill="var(--noir)" />
                    <path
                      d="M0 -5.5 L1.15 -1.15 L5.5 0 L1.15 1.15 L0 5.5 L-1.15 1.15 L-5.5 0 L-1.15 -1.15 Z"
                      fill="var(--motion-star)"
                    />
                    <text
                      x={10}
                      y={3}
                      fill="var(--motion-line)"
                      fontSize={9.5}
                      fontWeight={500}
                      letterSpacing="0.18em"
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {orbit.label}
                    </text>
                  </g>
                </g>
              </g>
            );
          })}
        </g>

        {/* Central small core circle */}
        <circle cx={cx} cy={cy} r={coreR} fill="var(--noir)" />
        <circle cx={cx} cy={cy} r={coreR} fill={`url(#${coreGradId})`} />
        <circle
          cx={cx}
          cy={cy}
          r={coreR}
          stroke="var(--motion-line)"
          strokeWidth={1}
          strokeOpacity={0.7}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
