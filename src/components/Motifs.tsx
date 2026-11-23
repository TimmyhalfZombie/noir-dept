interface MotifProps {
  className?: string;
}

/**
 * Four-point editorial star / sparkle motif used sparingly as section markers and emblem accents.
 */
export function FourPointStar({ className = 'w-3.5 h-3.5' }: MotifProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 1.5L13.9 10.1L22.5 12L13.9 13.9L12 22.5L10.1 13.9L1.5 12L10.1 10.1L12 1.5Z" />
    </svg>
  );
}

/**
 * Thin orbital swoosh background motif with slow subtle rotation.
 */
export function OrbitalSwoosh({ className = 'w-96 h-96' }: MotifProps) {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <g className="origin-center animate-orbit-slow">
        <ellipse
          cx="200"
          cy="200"
          rx="184"
          ry="74"
          transform="rotate(-24 200 200)"
          stroke="currentColor"
          strokeWidth="0.9"
          strokeOpacity="0.45"
        />
        <path
          d="M352 121 L354.5 130.5 L364 133 L354.5 135.5 L352 145 L349.5 135.5 L340 133 L349.5 130.5 Z"
          fill="currentColor"
          fillOpacity="0.85"
        />
      </g>
    </svg>
  );
}

/**
 * Full circular emblem with thin border, rotating orbital swoosh, and four-point stars.
 * Used behind the Home hero wordmark and the About slogan display.
 */
export function NoirEmblem({ className = 'w-[340px] h-[340px] sm:w-[460px] sm:h-[460px]' }: MotifProps) {
  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Thin outer circular border */}
      <circle
        cx="250"
        cy="250"
        r="196"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeOpacity="0.32"
      />
      {/* Subtle inner hairline circle */}
      <circle
        cx="250"
        cy="250"
        r="182"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeOpacity="0.16"
        strokeDasharray="2 6"
      />
      {/* Rotating orbital swoosh */}
      <g className="origin-center animate-orbit-slow">
        <ellipse
          cx="250"
          cy="250"
          rx="236"
          ry="82"
          transform="rotate(-22 250 250)"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.55"
        />
        {/* Star anchored on the orbital path */}
        <path
          d="M454 156 L457 167 L468 170 L457 173 L454 184 L451 173 L440 170 L451 167 Z"
          fill="currentColor"
          fillOpacity="0.9"
        />
      </g>
      {/* Counter-rotating subtle secondary arc */}
      <g className="origin-center animate-orbit-reverse">
        <path
          d="M 88 332 A 196 196 0 0 1 158 76"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.45"
        />
      </g>
      {/* Top zenith four-point star */}
      <path
        d="M250 42 L252.6 51.4 L262 54 L252.6 56.6 L250 66 L247.4 56.6 L238 54 L247.4 51.4 Z"
        fill="currentColor"
        fillOpacity="0.8"
      />
    </svg>
  );
}
