// Adapted from beui.dev/micro-interactions/mute-toggle for React + Motion + Portfolio design tokens

import { type HTMLMotionProps, motion, useReducedMotion } from 'motion/react';
import { useId, useState } from 'react';
import { playPauseTone, playTick } from '../../utils/soundEngine';

const EASE_IN = [0.4, 0, 1, 1] as const;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const SPRING_PRESS = {
  type: 'spring',
  stiffness: 480,
  damping: 28,
  mass: 0.7,
} as const;

const SPEAKER = 'M11 5L6 9H3v6h3l5 4V5z';
const INNER = 'M15.5 8.5a5 5 0 0 1 0 7';
const OUTER = 'M18.5 5.5a9.5 9.5 0 0 1 0 13';
const SLASH = 'M3 3l18 18';

// Waves fold back into the speaker quickly; they spring back out.
const FOLD = { duration: 0.16, ease: EASE_IN } as const;
const CUT = { duration: 0.22, ease: EASE_OUT } as const;
const FADE = { duration: 0.16, ease: EASE_OUT } as const;
// One wave waits for the next, so sound reads as draining into the speaker
// (outer first) or spreading out of it (inner first).
const STAGGER = 0.07;
// The slash cuts once the waves have gone, and lifts before they return.
const CUT_DELAY = 0.12;
const RIPPLE = { duration: 0.6, ease: EASE_OUT, delay: 0.2 } as const;

export interface AnimatedMuteIconProps {
  /** Whether sound is currently muted. */
  muted: boolean;
  /** Icon width/height in pixels. Default: 18 */
  size?: number;
  /** SVG stroke width. Default: 1.85 */
  strokeWidth?: number;
  /** Optional additional classes on the SVG root. */
  className?: string;
}

/**
 * Animated speaker/mute SVG icon:
 * - Muting recoils the speaker, folds waves outer-to-inner, then cuts a masked diagonal slash with a clean gap.
 * - Unmuting lifts the slash, pumps the speaker, springs waves inner-to-outer, and emits a subtle outer ripple pulse.
 */
export function AnimatedMuteIcon({
  muted,
  size = 18,
  strokeWidth = 1.85,
  className = '',
}: AnimatedMuteIconProps) {
  const reduce = Boolean(useReducedMotion());
  const maskId = `mute-gap-${useId().replace(/:/g, '')}`;

  // Each unmute transition sends a single subtle ripple pulse past the outer wave.
  const [seen, setSeen] = useState(muted);
  const [pulse, setPulse] = useState(0);
  if (seen !== muted) {
    setSeen(muted);
    if (!muted) {
      setPulse((value) => value + 1);
    }
  }

  const instant = { duration: 0 };

  const wave = (step: number) => ({
    initial: false as const,
    style: { originX: 0, originY: 0.5 },
    animate: { scale: muted && !reduce ? 0.3 : 1, opacity: muted ? 0 : 1 },
    transition: muted
      ? {
          scale: reduce ? instant : { ...FOLD, delay: step * STAGGER },
          opacity: { ...FOLD, delay: step * STAGGER },
        }
      : {
          scale: reduce
            ? instant
            : { ...SPRING_PRESS, delay: CUT_DELAY + step * STAGGER },
          opacity: {
            ...FADE,
            delay: (reduce ? 0 : CUT_DELAY) + step * STAGGER,
          },
        },
  });

  const slash = {
    initial: false as const,
    animate: { pathLength: muted ? 1 : 0 },
    transition: reduce ? instant : muted ? { ...CUT, delay: CUT_DELAY } : FOLD,
  };

  const gapStrokeWidth = Number((strokeWidth * 2.75).toFixed(2));

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 overflow-visible ${className}`}
    >
      <defs>
        {/* The slash cuts a clean visual gap through the speaker as it draws. */}
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x="-4"
          y="-4"
          width="32"
          height="32"
        >
          <rect x="-4" y="-4" width="32" height="32" fill="white" stroke="none" />
          <motion.path
            d={SLASH}
            stroke="black"
            strokeWidth={gapStrokeWidth}
            {...slash}
          />
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>
        {/* Recoils when sound is cut; pumps gently when sound returns. */}
        <motion.path
          d={SPEAKER}
          style={{ originX: 1, originY: 0.5 }}
          initial={false}
          animate={
            reduce
              ? { x: 0, scale: 1 }
              : muted
                ? { x: [0, -1.5, 0], scale: 1 }
                : { x: 0, scale: [1, 1.14, 1] }
          }
          transition={
            muted
              ? { duration: 0.3, ease: EASE_OUT }
              : { duration: 0.34, ease: EASE_OUT, delay: CUT_DELAY }
          }
        />
        <motion.path d={INNER} {...wave(muted ? 1 : 0)} />
        <motion.path d={OUTER} {...wave(muted ? 0 : 1)} />
        {/* One pulse travels past the outer wave and fades. */}
        {pulse > 0 && !muted && !reduce ? (
          <motion.path
            key={pulse}
            d={OUTER}
            style={{ originX: 0, originY: 0.5 }}
            initial={{ x: 0, scale: 1, opacity: 0 }}
            animate={{ x: 4, scale: 1.18, opacity: [0, 0.5, 0] }}
            transition={RIPPLE}
          />
        ) : null}
      </g>
      <motion.path d={SLASH} {...slash} />
    </svg>
  );
}

export interface MuteToggleProps
  extends Omit<HTMLMotionProps<'button'>, 'children' | 'onChange'> {
  /** Whether sound is muted, for controlled use. */
  muted?: boolean;
  /** Whether it starts muted when uncontrolled. Default: false */
  defaultMuted?: boolean;
  /** Called with the new muted state when the button is pressed. */
  onMutedChange?: (muted: boolean) => void;
  /** Accessible label override. Default: 'Mute' / 'Unmute' */
  label?: string;
  /** Play subtle UI sound cues on toggle. Default: false */
  sound?: boolean;
  /** Icon size in pixels. Default: 18 */
  iconSize?: number;
  /** SVG stroke width. Default: 1.85 */
  strokeWidth?: number;
}

/**
 * Standalone animated mute toggle button wrapping AnimatedMuteIcon.
 */
export function MuteToggle({
  muted: mutedProp,
  defaultMuted = false,
  onMutedChange,
  label,
  sound = false,
  iconSize = 18,
  strokeWidth = 1.85,
  className = '',
  onClick,
  ...rest
}: MuteToggleProps) {
  const reduce = Boolean(useReducedMotion());
  const [internal, setInternal] = useState(defaultMuted);
  const muted = mutedProp ?? internal;

  return (
    <motion.button
      type="button"
      aria-pressed={muted}
      aria-label={label ?? (muted ? 'Unmute' : 'Mute')}
      whileTap={reduce ? undefined : { scale: 0.92 }}
      transition={SPRING_PRESS}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const next = !muted;
        if (sound) {
          if (next) playPauseTone();
          else playTick();
        }
        if (mutedProp === undefined) setInternal(next);
        onMutedChange?.(next);
      }}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--apple-separator)] transition-colors duration-200 hover:bg-[var(--apple-control-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--apple-focus-ring)] disabled:pointer-events-none disabled:opacity-50 ${
        muted
          ? 'text-[var(--apple-label-tertiary)]'
          : 'text-[var(--apple-label-primary)]'
      } ${className}`}
      {...rest}
    >
      <AnimatedMuteIcon
        muted={muted}
        size={iconSize}
        strokeWidth={strokeWidth}
      />
    </motion.button>
  );
}
