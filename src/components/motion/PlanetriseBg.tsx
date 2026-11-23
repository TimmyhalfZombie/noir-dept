import { useId, useMemo, useRef } from 'react';
import { useMotionVisibility } from '../../hooks/useMotionVisibility';

const BAND_UNIT =
  'STREETWEAR \u2022 RARE FINDS \u2022 WEAR THE PAST. KEEP THE STYLE. \u2022 NOIR DEPT. \u2022 ';
const BAND_TEXT = `${BAND_UNIT}${BAND_UNIT}${BAND_UNIT}`;

const CX = 500;
const CY = 500;
const CORE_R = 370;
const INNER_RING_R = 398;
const TEXT_RING_R = 418;
const OUTER_RING_R = 438;
const TEXT_CIRCUMFERENCE = Math.round(2 * Math.PI * TEXT_RING_R - 14); // ~2612

export function PlanetriseBg() {
  const uid = useId().replace(/:/g, '');
  const coreGradId = `planetrise-core-${uid}`;
  const textPathId = `planetrise-path-${uid}`;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const svgRefs = useMemo(() => [svgRef], []);

  const { isPaused } = useMotionVisibility({
    containerRef,
    svgRefs,
  });

  const textPathD = `M ${CX} ${CY - TEXT_RING_R} A ${TEXT_RING_R} ${TEXT_RING_R} 0 1 1 ${
    CX - 0.01
  } ${CY - TEXT_RING_R}`;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden z-0 ${
        isPaused ? 'motion-paused' : ''
      }`}
    >
      {/* Rising planet positioned so its top arc crowns above the horizon */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[44%] w-[max(980px,120vw)] aspect-square">
        <svg
          ref={svgRef}
          viewBox="0 0 1000 1000"
          fill="none"
          className="w-full h-full"
        >
          <defs>
            <radialGradient id={coreGradId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--motion-core-center)" stopOpacity="0.9" />
              <stop offset="58%" stopColor="var(--motion-core-center)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--noir)" stopOpacity="1" />
            </radialGradient>

            <path id={textPathId} d={textPathD} />
          </defs>

          {/* Flat rotating circular text band + inner outline + outer stitched ring */}
          <g className="motion-planetrise-spin">
            {/* Outer stitched ring */}
            <circle
              cx={CX}
              cy={CY}
              r={OUTER_RING_R}
              stroke="var(--motion-line)"
              strokeWidth={1}
              strokeOpacity={0.7}
              strokeDasharray="6 5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              className="motion-stitch-slow"
            />

            {/* Inner thin outline ring */}
            <circle
              cx={CX}
              cy={CY}
              r={INNER_RING_R}
              stroke="var(--motion-line)"
              strokeWidth={1}
              strokeOpacity={0.5}
              vectorEffect="non-scaling-stroke"
            />

            {/* Flat circular text */}
            <text
              fill="var(--motion-line)"
              fillOpacity={0.85}
              fontSize={11}
              fontWeight={500}
              letterSpacing="0.35em"
              style={{ fontFamily: 'var(--font-sans)' }}
              dominantBaseline="central"
            >
              <textPath
                href={`#${textPathId}`}
                startOffset="0%"
                textLength={TEXT_CIRCUMFERENCE}
                lengthAdjust="spacing"
              >
                {BAND_TEXT}
              </textPath>
            </text>
          </g>

          {/* Huge rising core circle */}
          <circle cx={CX} cy={CY} r={CORE_R} fill="var(--noir)" />
          <circle cx={CX} cy={CY} r={CORE_R} fill={`url(#${coreGradId})`} />
          <circle
            cx={CX}
            cy={CY}
            r={CORE_R}
            stroke="var(--motion-line)"
            strokeWidth={1}
            strokeOpacity={0.7}
            vectorEffect="non-scaling-stroke"
          />

          {/* Muted static star on the top edge of the core circle */}
          <g transform={`translate(${CX} ${CY - CORE_R})`}>
            <circle cx={0} cy={0} r={10} fill="var(--noir)" />
            <path
              d="M0 -7 L1.45 -1.45 L7 0 L1.45 1.45 L0 7 L-1.45 1.45 L-7 0 L-1.45 -1.45 Z"
              fill="var(--motion-star-muted)"
            />
          </g>
        </svg>
      </div>

      {/* Bottom edge fade smoothly blending the rising horizon into page background */}
      <div
        className="absolute inset-x-0 bottom-0 h-24 sm:h-32"
        style={{
          background:
            'linear-gradient(to top, var(--noir) 0%, transparent 100%)',
        }}
      />
    </div>
  );
}
