import type { Transition } from 'motion/react';

/**
 * Apple HIG & iOS fluid motion physics:
 * critically damped springs, smooth deceleration, zero jitter or overshoot.
 */
export const EASE_APPLE: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const SPRING_SEGMENT: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 36,
  mass: 0.72,
};

export const SPRING_TACTILE: Transition = {
  type: 'spring',
  stiffness: 480,
  damping: 34,
  mass: 0.68,
};

export const SPRING_GENTLE: Transition = {
  type: 'spring',
  stiffness: 280,
  damping: 30,
  mass: 0.85,
};

export const TRANSITION_SMOOTH: Transition = {
  duration: 0.44,
  ease: EASE_APPLE,
};

export const VIEWPORT_REVEAL = {
  once: true,
  margin: '-48px 0px -48px 0px',
  amount: 'some' as const,
};
