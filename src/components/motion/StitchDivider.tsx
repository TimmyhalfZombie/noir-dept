import { useRef } from 'react';
import { useMotionVisibility } from '../../hooks/useMotionVisibility';

interface StitchDividerProps {
  className?: string;
}

export function StitchDivider({ className = '' }: StitchDividerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { hasEntered, reducedMotion, isPaused } = useMotionVisibility({
    containerRef,
  });

  const sewnIn = hasEntered || reducedMotion;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`relative w-full h-5 flex items-center overflow-hidden pointer-events-none select-none ${
        isPaused ? 'motion-paused' : ''
      } ${className}`.trim()}
    >
      {/* Sew-in full-width 1px dashed line */}
      <div
        className={`w-full h-full flex items-center origin-center ${
          reducedMotion
            ? ''
            : 'transition-transform duration-[1400ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]'
        }`}
        style={{ transform: sewnIn ? 'scaleX(1)' : 'scaleX(0)' }}
      >
        <svg
          viewBox="0 0 1200 20"
          preserveAspectRatio="none"
          fill="none"
          className="w-full h-5"
        >
          <line
            x1={0}
            y1={10}
            x2={1200}
            y2={10}
            stroke="var(--motion-line)"
            strokeWidth={1}
            strokeOpacity={0.7}
            strokeDasharray="6 5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className="motion-stitch-run"
          />
        </svg>
      </div>

      {/* Traveling star cutting cleanly through the dashes after sew-in */}
      {sewnIn && (
        <div
          className={`pointer-events-none absolute inset-0 flex items-center ${
            reducedMotion ? 'justify-center' : 'motion-divider-star'
          }`}
        >
          <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 shrink-0 -ml-2">
            <circle cx={10} cy={10} r={7.5} fill="var(--noir)" />
            <path
              d="M10 3.5 L11.35 8.65 L16.5 10 L11.35 11.35 L10 16.5 L8.65 11.35 L3.5 10 L8.65 8.65 Z"
              fill="var(--motion-star)"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
