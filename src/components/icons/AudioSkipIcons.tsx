interface AudioSkipIconProps {
  size?: number;
  className?: string;
}

/**
 * Clean SF-Symbols-inspired Skip Back 15s vector icon with pure geometric
 * strokes and generous interior breathing room around the numerals.
 */
export function SkipBack15Icon({ size = 21, className = '' }: AudioSkipIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      {/* Top counter-clockwise arrowhead */}
      <path d="M13.3 2.5L11 4.8L13.3 7.1" strokeWidth="1.7" />
      {/* Open circular arc sweeping clockwise around center (12, 13) */}
      <path d="M11.3 4.8A8.2 8.2 0 1 1 4.6 9.5" strokeWidth="1.7" />
      {/* Geometric "15" centered cleanly inside the arc */}
      <path d="M8.7 11.7L9.8 10.8V15.8" strokeWidth="1.45" />
      <path
        d="M15.1 10.8H12.5L12.3 13C12.65 12.7 13.1 12.55 13.6 12.55C14.6 12.55 15.3 13.2 15.3 14.15C15.3 15.1 14.55 15.8 13.5 15.8C12.75 15.8 12.15 15.45 11.85 15"
        strokeWidth="1.45"
      />
    </svg>
  );
}

/**
 * Clean SF-Symbols-inspired Skip Forward 15s vector icon mirroring SkipBack15Icon.
 */
export function SkipForward15Icon({ size = 21, className = '' }: AudioSkipIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      {/* Top clockwise arrowhead */}
      <path d="M10.7 2.5L13 4.8L10.7 7.1" strokeWidth="1.7" />
      {/* Open circular arc sweeping counter-clockwise around center (12, 13) */}
      <path d="M12.7 4.8A8.2 8.2 0 1 0 19.4 9.5" strokeWidth="1.7" />
      {/* Geometric "15" centered cleanly inside the arc */}
      <path d="M8.7 11.7L9.8 10.8V15.8" strokeWidth="1.45" />
      <path
        d="M15.1 10.8H12.5L12.3 13C12.65 12.7 13.1 12.55 13.6 12.55C14.6 12.55 15.3 13.2 15.3 14.15C15.3 15.1 14.55 15.8 13.5 15.8C12.75 15.8 12.15 15.45 11.85 15"
        strokeWidth="1.45"
      />
    </svg>
  );
}

/**
 * Clean outlined hand-tap gesture icon with concentric tap arc over the
 * pointing fingertip, matching the reference hand-tap icon geometry.
 */
export function HandTapIcon({ size = 18, className = '' }: AudioSkipIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      {/* Concentric tap arc over fingertip */}
      <path d="M7.3 8.4A3.9 3.9 0 0 1 15.1 8.4" />
      {/* Pointing hand with thumb, index, middle, and outer fingers */}
      <path d="M9.7 16.2V8.4a1.5 1.5 0 0 1 3 0v5.1" />
      <path d="M12.7 12.2a1.45 1.45 0 0 1 2.9 0v2.1" />
      <path d="M15.6 13.4a1.45 1.45 0 0 1 2.9 0v3.2c0 1.7-.45 3-1.15 4" />
      <path d="M9.7 16.2L8.05 14a1.5 1.5 0 0 0-2.45 1.7l2.55 3.9c.3.45.55.75.85 1" />
    </svg>
  );
}
