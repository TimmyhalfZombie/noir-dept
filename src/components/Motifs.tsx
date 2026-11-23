interface MotifProps {
  className?: string;
}

/**
 * Four-point editorial star motif shared across labels and indicators.
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
