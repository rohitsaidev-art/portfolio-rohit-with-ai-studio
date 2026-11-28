import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowUpDown as StaticArrowUpDown,
  ArrowUpRight as StaticArrowUpRight,
  Check as StaticCheck,
  Copy as StaticCopy,
  Send as StaticSend,
  Settings as StaticSettings,
  Volume2 as StaticVolume2,
} from 'lucide-react';
import { Check } from '../animate-ui/icons/check';
import { Send } from '../animate-ui/icons/send';
import { Settings } from '../animate-ui/icons/settings';
import { Volume2 } from '../animate-ui/icons/volume-2';

interface AnimatedIconProps {
  size?: number;
  className?: string;
  animateOnHover?: boolean;
  animateOnMount?: boolean;
  animate?: boolean;
  active?: boolean;
  strokeWidth?: number;
}

const EASE_MICRO = [0.23, 1, 0.32, 1] as const;

export function AnimatedCheckIcon({
  size = 16,
  className = '',
  animateOnMount = true,
  animate,
  active,
  strokeWidth = 1.75,
}: AnimatedIconProps) {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) {
    return <StaticCheck size={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" />;
  }
  const effectiveAnimate = animate ?? active ?? animateOnMount;
  return (
    <Check
      size={size}
      strokeWidth={strokeWidth}
      animate={effectiveAnimate}
      className={className}
      aria-hidden="true"
    />
  );
}

export function AnimatedSendIcon({
  size = 16,
  className = '',
  animateOnHover = true,
  animate,
  active,
  strokeWidth = 1.75,
}: AnimatedIconProps) {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) {
    return <StaticSend size={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" />;
  }
  const controlled = animate ?? (active ? true : undefined);
  return (
    <Send
      size={size}
      strokeWidth={strokeWidth}
      animate={controlled}
      animateOnHover={controlled === undefined ? animateOnHover : false}
      className={className}
      aria-hidden="true"
    />
  );
}

export function AnimatedSettingsIcon({
  size = 16,
  className = '',
  animateOnHover = true,
  animate,
  active,
  strokeWidth = 1.75,
}: AnimatedIconProps) {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) {
    return <StaticSettings size={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" />;
  }
  const controlled = animate ?? (active ? true : undefined);
  return (
    <Settings
      size={size}
      strokeWidth={strokeWidth}
      animate={controlled}
      animateOnHover={controlled === undefined ? animateOnHover : false}
      className={className}
      aria-hidden="true"
    />
  );
}

export function AnimatedVolumeIcon({
  size = 16,
  className = '',
  animateOnHover = false,
  animateOnMount = true,
  animate,
  active,
  strokeWidth = 1.75,
}: AnimatedIconProps) {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) {
    return <StaticVolume2 size={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" />;
  }
  const effectiveAnimate = animate ?? active ?? animateOnMount;
  return (
    <Volume2
      size={size}
      strokeWidth={strokeWidth}
      animate={effectiveAnimate}
      animateOnHover={animateOnHover}
      className={className}
      aria-hidden="true"
    />
  );
}

export function AnimatedSortIcon({
  size = 16,
  className = '',
  animate,
  active = false,
  strokeWidth = 1.75,
}: AnimatedIconProps) {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) {
    return (
      <StaticArrowUpDown
        size={size}
        strokeWidth={strokeWidth}
        className={className}
        aria-hidden="true"
      />
    );
  }

  const isExpanded = animate ?? active;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <motion.g
        animate={{ y: isExpanded ? -1.4 : 0 }}
        transition={{ duration: 0.22, ease: EASE_MICRO }}
      >
        <path d="m3 8 4-4 4 4" />
        <path d="M7 4v16" />
      </motion.g>
      <motion.g
        animate={{ y: isExpanded ? 1.4 : 0 }}
        transition={{ duration: 0.22, ease: EASE_MICRO }}
      >
        <path d="m21 16-4 4-4-4" />
        <path d="M17 20V4" />
      </motion.g>
    </svg>
  );
}

/**
 * Diagonal top-right arrow icon with crisp directional glide & subtle head lead-in.
 * Used on case study card hover badges.
 */
export function AnimatedArrowUpRightIcon({
  size = 17,
  className = '',
  animate,
  active = false,
  strokeWidth = 1.9,
}: AnimatedIconProps) {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) {
    return (
      <StaticArrowUpRight
        size={size}
        strokeWidth={strokeWidth}
        className={className}
        aria-hidden="true"
      />
    );
  }

  const isEngaged = animate ?? active;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`overflow-visible ${className}`}
      aria-hidden="true"
    >
      <motion.path
        d="M7 17 17 7"
        initial={false}
        animate={{
          x: isEngaged ? 1.35 : -0.6,
          y: isEngaged ? -1.35 : 0.6,
        }}
        transition={{ duration: 0.24, ease: EASE_MICRO }}
      />
      <motion.path
        d="M8.5 7H17v8.5"
        initial={false}
        animate={{
          x: isEngaged ? 1.8 : -0.6,
          y: isEngaged ? -1.8 : 0.6,
        }}
        transition={{ duration: 0.26, delay: isEngaged ? 0.025 : 0, ease: EASE_MICRO }}
      />
    </svg>
  );
}

/**
 * Tactile duplicate-card Copy icon: front sheet gently peels up-right on hover.
 */
export function AnimatedCopyIcon({
  size = 14,
  className = '',
  animate,
  active = false,
  strokeWidth = 1.85,
}: AnimatedIconProps) {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) {
    return (
      <StaticCopy
        size={size}
        strokeWidth={strokeWidth}
        className={className}
        aria-hidden="true"
      />
    );
  }

  const isEngaged = animate ?? active;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`overflow-visible ${className}`}
      aria-hidden="true"
    >
      <motion.path
        d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
        initial={false}
        animate={{
          x: isEngaged ? -0.75 : 0,
          y: isEngaged ? 0.75 : 0,
        }}
        transition={{ duration: 0.2, ease: EASE_MICRO }}
      />
      <motion.rect
        width="14"
        height="14"
        x="8"
        y="8"
        rx="2"
        ry="2"
        initial={false}
        animate={{
          x: isEngaged ? 1.25 : 0,
          y: isEngaged ? -1.25 : 0,
        }}
        transition={{ duration: 0.22, ease: EASE_MICRO }}
      />
    </svg>
  );
}

/**
 * Work Category — All Work: refined 4-squircle studio bento with soft duotone lead tile
 * that expands gently outward in a staggered diamond beat on hover.
 */
export function AnimatedAllWorkIcon({
  size = 16,
  className = '',
  animate,
  active = false,
  strokeWidth = 1.7,
}: AnimatedIconProps) {
  const prefersReducedMotion = useReducedMotion();
  const isEngaged = !prefersReducedMotion && (animate ?? active);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`overflow-visible ${className}`}
      aria-hidden="true"
    >
      <motion.rect
        x="3.25"
        y="3.25"
        width="7.25"
        height="7.25"
        rx="2.2"
        fill="currentColor"
        fillOpacity={isEngaged ? 0.2 : 0.12}
        initial={false}
        animate={{
          x: isEngaged ? -0.8 : 0,
          y: isEngaged ? -0.8 : 0,
          scale: isEngaged ? 1.03 : 1,
        }}
        style={{ originX: '6.875px', originY: '6.875px' }}
        transition={{ duration: 0.24, ease: EASE_MICRO }}
      />
      <motion.rect
        x="13.5"
        y="3.25"
        width="7.25"
        height="7.25"
        rx="2.2"
        initial={false}
        animate={{ x: isEngaged ? 0.8 : 0, y: isEngaged ? -0.8 : 0 }}
        transition={{ duration: 0.24, delay: isEngaged ? 0.025 : 0, ease: EASE_MICRO }}
      />
      <motion.rect
        x="13.5"
        y="13.5"
        width="7.25"
        height="7.25"
        rx="2.2"
        fill="currentColor"
        fillOpacity={isEngaged ? 0.16 : 0.08}
        initial={false}
        animate={{ x: isEngaged ? 0.8 : 0, y: isEngaged ? 0.8 : 0 }}
        transition={{ duration: 0.24, delay: isEngaged ? 0.045 : 0, ease: EASE_MICRO }}
      />
      <motion.rect
        x="3.25"
        y="13.5"
        width="7.25"
        height="7.25"
        rx="2.2"
        initial={false}
        animate={{ x: isEngaged ? -0.8 : 0, y: isEngaged ? 0.8 : 0 }}
        transition={{ duration: 0.24, delay: isEngaged ? 0.035 : 0, ease: EASE_MICRO }}
      />
    </svg>
  );
}

/**
 * Work Category — Web Design: clean minimal Globe with soft duotone center meridian
 * and smooth longitudinal turn on hover — unmistakably distinct from Web App window.
 */
export function AnimatedWebDesignIcon({
  size = 18,
  className = '',
  animate,
  active = false,
  strokeWidth = 1.7,
}: AnimatedIconProps) {
  const prefersReducedMotion = useReducedMotion();
  const isEngaged = !prefersReducedMotion && (animate ?? active);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`overflow-visible ${className}`}
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="currentColor"
        fillOpacity={isEngaged ? 0.12 : 0.06}
      />
      {/* Equator */}
      <path d="M3.2 12h17.6" />
      {/* Center meridian ellipse gently sweeps on hover */}
      <motion.ellipse
        cx="12"
        cy="12"
        rx="4"
        ry="9"
        fill="currentColor"
        fillOpacity={isEngaged ? 0.16 : 0.09}
        initial={false}
        animate={{ scaleX: isEngaged ? 0.65 : 1 }}
        style={{ originX: '12px', originY: '12px' }}
        transition={{ duration: 0.28, ease: EASE_MICRO }}
      />
      {/* Subtle upper & lower latitude arcs */}
      <path d="M5.2 7.2c2 .9 4.3 1.4 6.8 1.4s4.8-.5 6.8-1.4" strokeWidth={strokeWidth * 0.88} />
      <path d="M5.2 16.8c2-.9 4.3-1.4 6.8-1.4s4.8.5 6.8 1.4" strokeWidth={strokeWidth * 0.88} />
    </svg>
  );
}

/**
 * Work Category — Web App: precision software workspace window with left rail
 * and live animated telemetry bars inside the app canvas.
 */
export function AnimatedSaasAppIcon({
  size = 18,
  className = '',
  animate,
  active = false,
  strokeWidth = 1.7,
}: AnimatedIconProps) {
  const prefersReducedMotion = useReducedMotion();
  const isEngaged = !prefersReducedMotion && (animate ?? active);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`overflow-visible ${className}`}
      aria-hidden="true"
    >
      {/* Duotone sidebar rail */}
      <path
        d="M3 6.75a3 3 0 0 1 3-3h2.75v16.5H6a3 3 0 0 1-3-3v-10.5Z"
        fill="currentColor"
        fillOpacity="0.16"
        stroke="none"
      />
      <rect x="2.75" y="3.75" width="18.5" height="16.5" rx="3" />
      <path d="M8.75 3.75v16.5" />
      {/* Subtle sidebar nav pips */}
      <circle cx="5.75" cy="7.5" r="0.85" fill="currentColor" stroke="none" />
      <circle cx="5.75" cy="11" r="0.7" fill="currentColor" fillOpacity="0.55" stroke="none" />
      {/* Live workspace telemetry bars inside main app canvas */}
      <motion.path
        d="M12.25 16.5v-3.2"
        initial={false}
        animate={{ scaleY: isEngaged ? 1.32 : 1 }}
        style={{ originX: '12.25px', originY: '16.5px' }}
        transition={{ duration: 0.24, ease: EASE_MICRO }}
      />
      <motion.path
        d="M15.25 16.5v-6"
        initial={false}
        animate={{ scaleY: isEngaged ? 1.15 : 1 }}
        style={{ originX: '15.25px', originY: '16.5px' }}
        transition={{ duration: 0.24, delay: isEngaged ? 0.035 : 0, ease: EASE_MICRO }}
      />
      <motion.path
        d="M18.25 16.5v-4.4"
        initial={false}
        animate={{ scaleY: isEngaged ? 1.38 : 1 }}
        style={{ originX: '18.25px', originY: '16.5px' }}
        transition={{ duration: 0.24, delay: isEngaged ? 0.065 : 0, ease: EASE_MICRO }}
      />
    </svg>
  );
}

/**
 * Work Category — Mobile App: modern bezel-less smartphone chassis with Dynamic Island pill
 * and soft duotone screen that subtly poises & expands the island on hover.
 */
export function AnimatedMobileAppIcon({
  size = 18,
  className = '',
  animate,
  active = false,
  strokeWidth = 1.7,
}: AnimatedIconProps) {
  const prefersReducedMotion = useReducedMotion();
  const isEngaged = !prefersReducedMotion && (animate ?? active);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`overflow-visible ${className}`}
      aria-hidden="true"
    >
      <motion.g
        initial={false}
        animate={{
          rotate: isEngaged ? -5 : 0,
          y: isEngaged ? -0.6 : 0,
        }}
        style={{ originX: '12px', originY: '13px' }}
        transition={{ duration: 0.24, ease: EASE_MICRO }}
      >
        <rect
          x="5.5"
          y="2.5"
          width="13"
          height="19"
          rx="3.2"
          fill="currentColor"
          fillOpacity="0.09"
        />
        {/* Dynamic Island pill */}
        <motion.path
          d="M10.25 5.6h3.5"
          strokeWidth={1.9}
          initial={false}
          animate={{ scaleX: isEngaged ? 1.35 : 1 }}
          style={{ originX: '12px', originY: '5.6px' }}
          transition={{ duration: 0.22, ease: EASE_MICRO }}
        />
        {/* Home indicator bar */}
        <motion.path
          d="M9.75 18.4h4.5"
          strokeWidth={1.65}
          initial={false}
          animate={{ y: isEngaged ? -0.55 : 0 }}
          transition={{ duration: 0.22, delay: isEngaged ? 0.03 : 0, ease: EASE_MICRO }}
        />
      </motion.g>
    </svg>
  );
}

/**
 * Work Category — Brand Identity: precision vector pen-tool nib with center breather hole
 * and calligraphic poise lift on hover — classic identity & mark-making craft icon.
 */
export function AnimatedBrandIdentityIcon({
  size = 18,
  className = '',
  animate,
  active = false,
  strokeWidth = 1.7,
}: AnimatedIconProps) {
  const prefersReducedMotion = useReducedMotion();
  const isEngaged = !prefersReducedMotion && (animate ?? active);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`overflow-visible ${className}`}
      aria-hidden="true"
    >
      <motion.g
        initial={false}
        animate={{
          x: isEngaged ? -0.85 : 0,
          y: isEngaged ? -0.85 : 0,
          rotate: isEngaged ? -6 : 0,
        }}
        style={{ originX: '12px', originY: '12px' }}
        transition={{ duration: 0.24, ease: EASE_MICRO }}
      >
        {/* Pen nib collar */}
        <path
          d="m15.7 20.5 4.8-4.8-2.4-2.4-4.8 4.8 2.4 2.4Z"
          fill="currentColor"
          fillOpacity={isEngaged ? 0.22 : 0.14}
        />
        {/* Precision nib body */}
        <path
          d="m18.1 13.3-1.45-6.65L3.4 3.4l3.25 13.25 6.65 1.45"
          fill="currentColor"
          fillOpacity={isEngaged ? 0.14 : 0.07}
        />
        {/* Ink slit from tip to breather hole */}
        <path d="m3.4 3.4 6.75 6.75" />
        {/* Breather circle */}
        <circle cx="11.4" cy="11.4" r="1.8" />
      </motion.g>
    </svg>
  );
}


