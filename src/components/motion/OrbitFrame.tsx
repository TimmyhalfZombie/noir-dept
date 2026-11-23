import { useId, useMemo, useRef, type ReactNode } from 'react';
import { useMotionVisibility } from '../../hooks/useMotionVisibility';

interface OrbitFrameProps {
  children: ReactNode;
  className?: string;
}

const CX = 280;
const CY = 300;
const RX = 252;
const RY = 86;
const TILT_DEG = -20;

const ORBIT_PATH = `M ${RX} 0 A ${RX} ${RY} 0 1 1 ${-RX} 0 A ${RX} ${RY} 0 1 1 ${RX} 0`;

export function OrbitFrame({ children, className = '' }: OrbitFrameProps) {
  const uid = useId().replace(/:/g, '');
  const frontClipId = `orbit-frame-front-${uid}`;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const backSvgRef = useRef<SVGSVGElement | null>(null);
  const frontSvgRef = useRef<SVGSVGElement | null>(null);
  const svgRefs = useMemo(() => [backSvgRef, frontSvgRef], []);

  const { isPaused, reducedMotion } = useMotionVisibility({
    containerRef,
    svgRefs,
  });

  // Static resting star position on the front lower-right arc when reduced motion is active
  const staticAngle = 0.55;
  const staticX = RX * Math.cos(staticAngle);
  const staticY = RY * Math.sin(staticAngle);

  const renderOrbitContent = () => (
    <g transform={`translate(${CX} ${CY}) rotate(${TILT_DEG})`}>
      <path
        d={ORBIT_PATH}
        stroke="var(--motion-line)"
        strokeWidth={1}
        strokeOpacity={0.75}
        strokeDasharray="6 5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        className="motion-stitch-run"
      />

      <g
        transform={
          reducedMotion
            ? `translate(${staticX.toFixed(1)} ${staticY.toFixed(1)})`
            : undefined
        }
      >
        {!reducedMotion && (
          <animateMotion
            dur="16s"
            begin="-4s"
            repeatCount="indefinite"
            path={ORBIT_PATH}
          />
        )}
        <g transform={`rotate(${-TILT_DEG})`}>
          <circle cx={0} cy={0} r={8} fill="var(--noir)" />
          <path
            d="M0 -6.5 L1.35 -1.35 L6.5 0 L1.35 1.35 L0 6.5 L-1.35 1.35 L-6.5 0 L-1.35 -1.35 Z"
            fill="var(--motion-star)"
          />
        </g>
      </g>
    </g>
  );

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-[380px] lg:max-w-none mx-auto ${
        isPaused ? 'motion-paused' : ''
      } ${className}`.trim()}
    >
      {/* Back SVG layer (z-0): Full stitched ellipse + traveling star passing BEHIND portrait */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-[18%] -inset-y-[10%] z-0 flex items-center justify-center"
      >
        <svg
          ref={backSvgRef}
          viewBox="0 0 560 600"
          fill="none"
          className="w-full h-full overflow-visible"
        >
          {renderOrbitContent()}
        </svg>
      </div>

      {/* Middle layer (z-10): Founder portrait container */}
      <div className="relative z-10">{children}</div>

      {/* Front SVG layer (z-20): Clipped to lower (front) half along rotated axis */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-[18%] -inset-y-[10%] z-20 flex items-center justify-center"
      >
        <svg
          ref={frontSvgRef}
          viewBox="0 0 560 600"
          fill="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <clipPath id={frontClipId}>
              <g transform={`translate(${CX} ${CY}) rotate(${TILT_DEG})`}>
                <rect x={-340} y={0} width={680} height={340} />
              </g>
            </clipPath>
          </defs>
          <g clipPath={`url(#${frontClipId})`}>{renderOrbitContent()}</g>
        </svg>
      </div>
    </div>
  );
}
