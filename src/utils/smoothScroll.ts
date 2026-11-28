import Lenis from 'lenis';
import { prefersReducedMotion } from './scroll';

let lenisInstance: Lenis | null = null;
let rafId: number | null = null;

function isInsideIndependentlyScrollableElement(node: HTMLElement): boolean {
  let current: HTMLElement | null = node;
  while (current && current !== document.body && current !== document.documentElement) {
    if (
      current.hasAttribute('data-lenis-prevent') ||
      current.getAttribute('role') === 'dialog'
    ) {
      return true;
    }

    const style = window.getComputedStyle(current);
    const overflowY = style.overflowY;
    if (
      (overflowY === 'auto' || overflowY === 'scroll') &&
      current.scrollHeight > current.clientHeight + 2
    ) {
      return true;
    }
    current = current.parentElement;
  }
  return false;
}

export function getLenisInstance(): Lenis | null {
  return lenisInstance;
}

export function initializeSmoothScroll(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  if (prefersReducedMotion()) {
    return () => {};
  }

  if (lenisInstance) {
    return () => destroySmoothScroll();
  }

  const lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    wheelMultiplier: 0.92,
    touchMultiplier: 1.15,
    syncTouch: false,
    autoResize: true,
    prevent: (node) =>
      node instanceof HTMLElement && isInsideIndependentlyScrollableElement(node),
  });

  lenisInstance = lenis;
  document.documentElement.classList.add('lenis-smooth');

  const tick = (time: number) => {
    lenis.raf(time);
    rafId = window.requestAnimationFrame(tick);
  };
  rafId = window.requestAnimationFrame(tick);

  return () => destroySmoothScroll();
}

export function destroySmoothScroll(): void {
  if (rafId !== null && typeof window !== 'undefined') {
    window.cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('lenis-smooth');
  }
}
