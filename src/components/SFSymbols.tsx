import type { SVGProps } from 'react';

export interface SFSymbolProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

const baseProps = (size: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
  'aria-hidden': true as const,
  className,
});

/** SF Symbol: play.fill — rounded Apple media triangle */
export function SFPlayFill({ size = 18, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path
        d="M7.85 4.72C6.88 4.14 5.75 4.82 5.75 5.95V18.05C5.75 19.18 6.88 19.86 7.85 19.28L18.12 13.23C19.06 12.68 19.06 11.32 18.12 10.77L7.85 4.72Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** SF Symbol: pause.fill — balanced Apple media pill bars */
export function SFPauseFill({ size = 18, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <rect x="6.25" y="4.75" width="4.1" height="14.5" rx="1.65" fill="currentColor" />
      <rect x="13.65" y="4.75" width="4.1" height="14.5" rx="1.65" fill="currentColor" />
    </svg>
  );
}

/** SF Symbol: gobackward.15 — iconic Apple Podcasts 15s rewind arc + numerals */
export function SFGoBackward15({ size = 22, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path
        d="M6.4 6.55A8.45 8.45 0 1 1 3.75 13.6"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.9 3.25L5.7 6.95L9.4 6.75"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="12"
        y="15.1"
        textAnchor="middle"
        fill="currentColor"
        fontSize="7"
        fontWeight="700"
        letterSpacing="-0.3"
        fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Rounded', 'Inter', sans-serif"
      >
        15
      </text>
    </svg>
  );
}

/** SF Symbol: goforward.15 — iconic Apple Podcasts 15s skip-forward arc + numerals */
export function SFGoForward15({ size = 22, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path
        d="M17.6 6.55A8.45 8.45 0 1 0 20.25 13.6"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.1 3.25L18.3 6.95L14.6 6.75"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="12"
        y="15.1"
        textAnchor="middle"
        fill="currentColor"
        fontSize="7"
        fontWeight="700"
        letterSpacing="-0.3"
        fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Rounded', 'Inter', sans-serif"
      >
        15
      </text>
    </svg>
  );
}

/** SF Symbol: waveform — 5-bar optical acoustic symbol */
export function SFWaveform({ size = 18, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path
        d="M4.25 10.25V13.75M8.1 6.75V17.25M12 4.25V19.75M15.9 7.5V16.5M19.75 10.25V13.75"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** SF Symbol: headphones */
export function SFHeadphones({ size = 18, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path
        d="M4.5 13.5V12C4.5 7.86 7.86 4.5 12 4.5C16.14 4.5 19.5 7.86 19.5 12V13.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <rect x="3.5" y="12.75" width="3.5" height="6.25" rx="1.75" stroke="currentColor" strokeWidth="1.75" />
      <rect x="17" y="12.75" width="3.5" height="6.25" rx="1.75" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

/** SF Symbol: speaker.wave.2 */
export function SFSpeakerWave({ size = 18, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path
        d="M4.5 9.75H7.6L11.75 6.25C12.3 5.78 13.15 6.17 13.15 6.9V17.1C13.15 17.83 12.3 18.22 11.75 17.75L7.6 14.25H4.5C3.95 14.25 3.5 13.8 3.5 13.25V10.75C3.5 10.2 3.95 9.75 4.5 9.75Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M16.25 9.15C17.2 10.1 17.75 11.02 17.75 12C17.75 12.98 17.2 13.9 16.25 14.85M18.9 6.8C20.5 8.2 21.25 10.02 21.25 12C21.25 13.98 20.5 15.8 18.9 17.2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** SF Symbol: speaker.slash — crisp muted speaker symbol */
export function SFSpeakerSlash({ size = 18, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path
        d="M4.5 9.75H7.6L11.75 6.25C12.3 5.78 13.15 6.17 13.15 6.9V17.1C13.15 17.83 12.3 18.22 11.75 17.75L7.6 14.25H4.5C3.95 14.25 3.5 13.8 3.5 13.25V10.75C3.5 10.2 3.95 9.75 4.5 9.75Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M16.25 9.5L20.5 14.5M20.5 9.5L16.25 14.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** SF Symbol: chevron.right */
export function SFChevronRight({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path
        d="M9.25 5.75L15.5 12L9.25 18.25"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** SF Symbol: chevron.left */
export function SFChevronLeft({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path
        d="M14.75 5.75L8.5 12L14.75 18.25"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** SF Symbol: chevron.down */
export function SFChevronDown({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path
        d="M5.75 9.25L12 15.5L18.25 9.25"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** SF Symbol: arrow.up.right */
export function SFArrowUpRight({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path
        d="M7.5 16.5L16.5 7.5M9.5 7.5H16.5V14.5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** SF Symbol: arrow.up */
export function SFArrowUp({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path
        d="M12 18.25V5.75M6.75 10.75L12 5.5L17.25 10.75"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** SF Symbol: arrow.up.left.and.arrow.down.right — fullscreen inspect */
export function SFExpand({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path
        d="M9.5 5H5V9.5M5.25 5.25L10.25 10.25M14.5 19H19V14.5M18.75 18.75L13.75 13.75"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** SF Symbol: checkmark */
export function SFCheckmark({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path
        d="M5.25 12.75L9.75 17.25L18.75 7.25"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** SF Symbol: checkmark.circle.fill */
export function SFCheckmarkCircleFill({ size = 18, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <circle cx="12" cy="12" r="9.5" fill="currentColor" />
      <path
        d="M8.1 12.4L10.8 15.1L16.1 9.3"
        stroke="#FFFFFF"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** SF Symbol: doc.on.doc — Apple copy symbol */
export function SFDocOnDoc({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <rect
        x="8.75"
        y="7.75"
        width="10.25"
        height="12.5"
        rx="2.25"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M15.25 7.75V5.75C15.25 4.65 14.35 3.75 13.25 3.75H7C5.9 3.75 5 4.65 5 5.75V14.25C5 15.35 5.9 16.25 7 16.25H8.75"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** SF Symbol: xmark */
export function SFXmark({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path
        d="M6.5 6.5L17.5 17.5M17.5 6.5L6.5 17.5"
        stroke="currentColor"
        strokeWidth="2.05"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** SF Symbol: line.3.horizontal — Apple minimal navigation icon */
export function SFMenu({ size = 20, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path
        d="M4.5 7.5H19.5M4.5 12H19.5M4.5 16.5H19.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** SF Symbol: list.bullet — chapter outline */
export function SFListBullet({ size = 18, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path
        d="M9 7H19.5M9 12H19.5M9 17H19.5"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
      />
      <circle cx="5.25" cy="7" r="1.2" fill="currentColor" />
      <circle cx="5.25" cy="12" r="1.2" fill="currentColor" />
      <circle cx="5.25" cy="17" r="1.2" fill="currentColor" />
    </svg>
  );
}

/** SF Symbol: sidebar.left */
export function SFSidebarLeft({ size = 18, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <rect x="3.5" y="4.75" width="17" height="14.5" rx="3" stroke="currentColor" strokeWidth="1.75" />
      <path d="M9.25 4.75V19.25M6 8.5H7.25M6 11.25H7.25M6 14H7.25" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" />
    </svg>
  );
}

/** SF Symbol: slider.horizontal.3 */
export function SFSliders({ size = 18, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path d="M4.25 7H19.75M4.25 12H19.75M4.25 17H19.75" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="8.5" cy="7" r="2" fill="#FFFFFF" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="15.5" cy="12" r="2" fill="#FFFFFF" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="10.5" cy="17" r="2" fill="#FFFFFF" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

/** SF Symbol: hand.raised */
export function SFHandRaised({ size = 18, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path
        d="M8.5 11.5V5.75C8.5 5.06 9.06 4.5 9.75 4.5C10.44 4.5 11 5.06 11 5.75V10.5M11 10.5V4.75C11 4.06 11.56 3.5 12.25 3.5C12.94 3.5 13.5 4.06 13.5 4.75V10.5M13.5 10.5V5.75C13.5 5.06 14.06 4.5 14.75 4.5C15.44 4.5 16 5.06 16 5.75V11.25M16 11.25V8.5C16 7.81 16.56 7.25 17.25 7.25C17.94 7.25 18.5 7.81 18.5 8.5V13.75C18.5 17.34 15.84 20 12.25 20C9.3 20 7.5 18.4 6.2 16.1L4.6 13.15C4.24 12.5 4.46 11.68 5.1 11.3C5.75 10.92 6.58 11.15 6.96 11.8L8.5 14.2"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** SF Symbol: checkmark.shield */
export function SFShieldCheck({ size = 18, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path
        d="M12 3.75L18.5 6.25V11.5C18.5 15.65 15.72 18.95 12 20.25C8.28 18.95 5.5 15.65 5.5 11.5V6.25L12 3.75Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 12.1L11.15 14.05L15 10.1"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** SF Symbol: leaf */
export function SFLeaf({ size = 18, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path
        d="M19.25 4.75C12.25 4.75 6.25 8.25 5.5 15.25C5.25 17.5 6.75 19 9 18.75C16 18 19.25 12 19.25 4.75Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M5 19L12.5 11.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** SF Symbol: doc.text — overview / chapter doc */
export function SFDocText({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path
        d="M7.5 4H13.75L18 8.25V18.25C18 19.22 17.22 20 16.25 20H7.5C6.53 20 5.75 19.22 5.75 18.25V5.75C5.75 4.78 6.53 4 7.5 4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M9 11.5H15M9 15H13.25" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

/** SF Symbol: compass / scope */
export function SFScope({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <circle cx="12" cy="12" r="7.25" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 2.75V5.5M12 18.5V21.25M2.75 12H5.5M18.5 12H21.25" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.75" fill="currentColor" />
    </svg>
  );
}

/** SF Symbol: eye */
export function SFEye({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path
        d="M3.25 12C5.1 8.4 8.25 6.5 12 6.5C15.75 6.5 18.9 8.4 20.75 12C18.9 15.6 15.75 17.5 12 17.5C8.25 17.5 5.1 15.6 3.25 12Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

/** SF Symbol: square.stack.3d.up */
export function SFLayers({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path d="M12 4.5L19.5 8.5L12 12.5L4.5 8.5L12 4.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M4.5 12.25L12 16.25L19.5 12.25M4.5 16L12 20L19.5 16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** SF Symbol: dial.low */
export function SFDial({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <circle cx="12" cy="12.5" r="7.25" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 12.5L15.6 8.9" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <circle cx="12" cy="12.5" r="1.4" fill="currentColor" />
    </svg>
  );
}

/** SF Symbol: sparkles — restrained Apple-style 4-point star for reflections */
export function SFSparkles({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path
        d="M12 4.25L13.65 9.35L18.75 11L13.65 12.65L12 17.75L10.35 12.65L5.25 11L10.35 9.35L12 4.25Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** SF Symbol: cube */
export function SFCube({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path d="M12 3.75L19 7.75V16.25L12 20.25L5 16.25V7.75L12 3.75Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M5.25 8L12 11.85L18.75 8M12 11.85V20" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

/** SF Symbol: sun.max — Light appearance */
export function SFSunMax({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 3.25V5.25M12 18.75V20.75M3.25 12H5.25M18.75 12H20.75M5.8 5.8L7.25 7.25M16.75 16.75L18.2 18.2M18.2 5.8L16.75 7.25M7.25 16.75L5.8 18.2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** SF Symbol: moon — Dark appearance */
export function SFMoon({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path
        d="M18.6 14.35A7.25 7.25 0 0 1 9.65 5.4A7.4 7.4 0 1 0 18.6 14.35Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** SF Symbol: display — System appearance & desktop viewport */
export function SFDisplay({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <rect x="3.5" y="4.75" width="17" height="11.5" rx="2.25" stroke="currentColor" strokeWidth="1.75" />
      <path d="M9.5 19.25H14.5M12 16.25V19.25" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

/** SF Symbol: iphone — Mobile viewport preview */
export function SFiPhone({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <rect x="7" y="3.5" width="10" height="17" rx="2.4" stroke="currentColor" strokeWidth="1.75" />
      <path d="M10.5 6.25H13.5M11 17.75H13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** SF Symbol: questionmark.circle — Help / Information */
export function SFQuestionCircle({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M9.75 9.35C9.75 8.1 10.75 7.25 12 7.25C13.25 7.25 14.2 8.05 14.2 9.2C14.2 10.25 13.45 10.8 12.6 11.35C12.1 11.68 11.95 12.05 11.95 12.75"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="12" cy="15.85" r="0.95" fill="currentColor" />
    </svg>
  );
}

/** SF Symbol: arrow.down.doc / export */
export function SFDownload({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path d="M12 4.5V15.25M8 11.5L12 15.5L16 11.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 17.5V18.5C5 19.05 5.45 19.5 6 19.5H18C18.55 19.5 19 19.05 19 18.5V17.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

/** SF Symbol: arrow.up.doc / import */
export function SFUpload({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path d="M12 15.5V4.75M8 8.5L12 4.5L16 8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 17.5V18.5C5 19.05 5.45 19.5 6 19.5H18C18.55 19.5 19 19.05 19 18.5V17.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

/** SF Symbol: arrow.counterclockwise — Reset */
export function SFReset({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path d="M6.2 7.2A7.75 7.75 0 1 1 4.4 13.4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M5.75 4.25V7.75H9.25" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** SF Symbol: magnifyingglass — Search input affordance */
export function SFMagnifyingGlass({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <circle cx="10.75" cy="10.75" r="6.25" stroke="currentColor" strokeWidth="1.85" />
      <path d="M15.4 15.4L19.75 19.75" stroke="currentColor" strokeWidth="1.95" strokeLinecap="round" />
    </svg>
  );
}

/** SF Symbol: plus.magnifyingglass — Lightbox zoom in */
export function SFZoomIn({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <circle cx="10.75" cy="10.75" r="6.25" stroke="currentColor" strokeWidth="1.75" />
      <path d="M15.4 15.4L19.75 19.75M10.75 8.1V13.4M8.1 10.75H13.4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

/** SF Symbol: minus.magnifyingglass — Lightbox zoom out */
export function SFZoomOut({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <circle cx="10.75" cy="10.75" r="6.25" stroke="currentColor" strokeWidth="1.75" />
      <path d="M15.4 15.4L19.75 19.75M8.1 10.75H13.4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

/** SF Symbol: printer — Printable resume & case studies */
export function SFPrinter({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path d="M7.5 8.5V4.75C7.5 4.2 7.95 3.75 8.5 3.75H15.5C16.05 3.75 16.5 4.2 16.5 4.75V8.5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <rect x="4" y="8.5" width="16" height="8" rx="2.25" stroke="currentColor" strokeWidth="1.7" />
      <path d="M7.5 14H16.5V19.25C16.5 19.8 16.05 20.25 15.5 20.25H8.5C7.95 20.25 7.5 19.8 7.5 19.25V14Z" fill="var(--apple-surface-elevated)" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

/** SF Symbol: clock — Local Hyderabad time indicator */
export function SFClock({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 7.5V12.25L15 14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** SF Symbol: command — Keyboard command palette glyph */
export function SFCommand({ size = 15, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path
        d="M9 9H6.75A2.25 2.25 0 1 1 9 6.75V17.25A2.25 2.25 0 1 1 6.75 15H17.25A2.25 2.25 0 1 1 15 17.25V6.75A2.25 2.25 0 1 1 17.25 9H9Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** SF Symbol: exclamationmark.triangle — Contextual error state in prototypes */
export function SFExclamationTriangle({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path
        d="M10.45 4.85L3.35 17.15C2.72 18.24 3.5 19.6 4.76 19.6H19.24C20.5 19.6 21.28 18.24 20.65 17.15L13.55 4.85C12.92 3.76 11.08 3.76 10.45 4.85Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M12 9.5V13.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="16.25" r="0.95" fill="currentColor" />
    </svg>
  );
}

/** SF Symbol: bookmark — Unsaved recruiter shortlist state */
export function SFBookmark({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path
        d="M6.75 5.25C6.75 4.42 7.42 3.75 8.25 3.75H15.75C16.58 3.75 17.25 4.42 17.25 5.25V19.75L12 16.35L6.75 19.75V5.25Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** SF Symbol: bookmark.fill — Saved recruiter shortlist state */
export function SFBookmarkFill({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path
        d="M6.75 5.25C6.75 4.42 7.42 3.75 8.25 3.75H15.75C16.58 3.75 17.25 4.42 17.25 5.25V19.75L12 16.35L6.75 19.75V5.25Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** SF Symbol: link — Shareable URL indicator */
export function SFLink({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path
        d="M9.75 14.25L14.25 9.75M10.75 7.25L12.5 5.5A3.54 3.54 0 0 1 17.5 10.5L15.75 12.25M13.25 16.75L11.5 18.5A3.54 3.54 0 0 1 6.5 13.5L8.25 11.75"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** SF Symbol: info.circle — Quiet colophon indicator */
export function SFInfoCircle({ size = 16, className, ...props }: SFSymbolProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 11.25V16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="8.25" r="0.95" fill="currentColor" />
    </svg>
  );
}




