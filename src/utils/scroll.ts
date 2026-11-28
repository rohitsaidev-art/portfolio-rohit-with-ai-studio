import { getLenisInstance } from './smoothScroll';

/**
 * Standardized scrolling utilities:
 * - Consistent sticky-header & optional sticky-subnav offset math
 * - Respects prefers-reduced-motion automatically
 * - Pure helpers exported for deterministic unit testing
 */

export const STICKY_HEADER_HEIGHT_PX = 52;
export const STICKY_SUBNAV_HEIGHT_PX = 52;
export const ANCHOR_BREATHING_ROOM_PX = 28;

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Computes the vertical scroll target for an element, accounting for
 * sticky chrome and comfortable reading breathing room.
 */
export function computeScrollTargetTop(params: {
  elementTopInViewport: number;
  currentScrollY: number;
  stickyHeaderHeight?: number;
  stickySubnavHeight?: number;
  breathingRoom?: number;
}): number {
  const headerHeight = params.stickyHeaderHeight ?? STICKY_HEADER_HEIGHT_PX;
  const subnavHeight = params.stickySubnavHeight ?? 0;
  const breathingRoom = params.breathingRoom ?? ANCHOR_BREATHING_ROOM_PX;
  const rawTop =
    params.elementTopInViewport +
    params.currentScrollY -
    headerHeight -
    subnavHeight -
    breathingRoom;

  return Math.max(0, Math.round(rawTop));
}

/**
 * Resolves smooth vs instant scroll behavior while honoring prefers-reduced-motion.
 */
export function resolveScrollBehavior(
  requested: 'smooth' | 'auto' = 'smooth',
  reducedMotion = prefersReducedMotion(),
): ScrollBehavior {
  if (reducedMotion) {
    return 'auto';
  }
  return requested;
}

/**
 * Scrolls the viewport to the top cleanly.
 */
export function scrollToTop(requested: 'smooth' | 'auto' = 'auto'): void {
  if (typeof window === 'undefined') return;
  const lenis = getLenisInstance();
  const behavior = resolveScrollBehavior(requested);

  if (lenis) {
    if (behavior === 'auto') {
      lenis.scrollTo(0, { immediate: true });
    } else {
      lenis.scrollTo(0, {
        duration: 0.75,
        easing: (t) => 1 - Math.pow(1 - t, 4),
      });
    }
    return;
  }

  window.scrollTo({
    top: 0,
    left: 0,
    behavior,
  });
}

/**
 * Scrolls to an element by ID with calibrated sticky-header + optional
 * sticky local-ribbon offset and reduced-motion awareness.
 */
export function scrollToElementById(
  id: string,
  options?: {
    behavior?: 'smooth' | 'auto';
    extraOffsetPx?: number;
  },
): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  const normalizedId = id.replace(/^#/, '').trim();
  if (!normalizedId) return false;

  const target = document.getElementById(normalizedId);
  if (!target) return false;

  const headerEl = document.querySelector<HTMLElement>('header[data-sticky-nav="true"]');
  const subnavEl = document.querySelector<HTMLElement>('[data-sticky-subnav="true"]');

  const stickyHeaderHeight = headerEl
    ? headerEl.getBoundingClientRect().height
    : STICKY_HEADER_HEIGHT_PX;
  const stickySubnavHeight = subnavEl
    ? subnavEl.getBoundingClientRect().height
    : 0;

  const top = computeScrollTargetTop({
    elementTopInViewport: target.getBoundingClientRect().top,
    currentScrollY: window.scrollY,
    stickyHeaderHeight,
    stickySubnavHeight,
    breathingRoom: ANCHOR_BREATHING_ROOM_PX + (options?.extraOffsetPx ?? 0),
  });

  const behavior = resolveScrollBehavior(options?.behavior ?? 'smooth');
  const lenis = getLenisInstance();
  if (lenis) {
    if (behavior === 'auto') {
      lenis.scrollTo(top, { immediate: true });
    } else {
      lenis.scrollTo(top, {
        duration: 0.85,
        easing: (t) => 1 - Math.pow(1 - t, 4),
      });
    }
    return true;
  }

  window.scrollTo({
    top,
    left: 0,
    behavior,
  });

  return true;
}

export interface SectionMetric {
  id: string;
  top: number;
  bottom: number;
  isIntersecting: boolean;
}

/**
 * Deterministically resolves the active section ID from IntersectionObserver
 * visibility plus viewport geometry. Accurately tracks both downward and
 * upward scrolling across tall sections, hero headers, and page bottoms.
 */
export function resolveActiveSectionId(params: {
  sections: readonly SectionMetric[];
  headerOffsetPx: number;
  viewportHeight: number;
  isAtPageBottom?: boolean;
}): string | null {
  const {
    sections,
    headerOffsetPx,
    viewportHeight,
    isAtPageBottom = false,
  } = params;

  if (sections.length === 0) return null;

  if (isAtPageBottom) {
    const last = sections[sections.length - 1];
    if (last.top < viewportHeight && last.bottom > headerOffsetPx) {
      return last.id;
    }
  }

  const anchorY = Math.max(
    headerOffsetPx + 36,
    Math.round(viewportHeight * 0.34),
  );

  const intersecting = sections.filter((section) => section.isIntersecting);
  if (intersecting.length > 0) {
    const passedAnchor = intersecting.filter(
      (section) => section.top <= anchorY,
    );
    if (passedAnchor.length > 0) {
      return passedAnchor[passedAnchor.length - 1].id;
    }
    return intersecting[0].id;
  }

  let fallbackId = sections[0].id;
  for (const section of sections) {
    if (section.top <= anchorY) {
      fallbackId = section.id;
    } else {
      break;
    }
  }
  return fallbackId;
}

