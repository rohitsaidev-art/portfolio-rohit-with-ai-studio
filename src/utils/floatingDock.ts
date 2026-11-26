import { useSyncExternalStore } from 'react';

type DockListener = () => void;

const activeDockIds = new Set<string>();
const activeMobileBarIds = new Set<string>();
const listeners = new Set<DockListener>();

function emit(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Isolate subscriber errors
    }
  });
}

/**
 * Registers or unregisters an active floating AudioPlayer dock so other
 * floating controls (such as FloatingBackToTop) stay clear of it.
 */
export function setFloatingAudioDockActive(dockId: string, active: boolean): void {
  const had = activeDockIds.has(dockId);
  if (active && !had) {
    activeDockIds.add(dockId);
    emit();
  } else if (!active && had) {
    activeDockIds.delete(dockId);
    emit();
  }
}

export function isFloatingAudioDockVisible(): boolean {
  return activeDockIds.size > 0;
}

/**
 * Registers or unregisters a mounted mobile bottom reading bar (<768px)
 * so FloatingBackToTop, AudioPlayer floating dock, and Toasts stay clear.
 */
export function setMobileReadingBarActive(barId: string, active: boolean): void {
  const had = activeMobileBarIds.has(barId);
  if (active && !had) {
    activeMobileBarIds.add(barId);
    emit();
  } else if (!active && had) {
    activeMobileBarIds.delete(barId);
    emit();
  }
}

export function isMobileReadingBarVisible(): boolean {
  return activeMobileBarIds.size > 0;
}

export function subscribeFloatingAudioDock(listener: DockListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useFloatingAudioDockVisible(): boolean {
  return useSyncExternalStore(
    subscribeFloatingAudioDock,
    isFloatingAudioDockVisible,
    () => false,
  );
}

export function useMobileReadingBarVisible(): boolean {
  return useSyncExternalStore(
    subscribeFloatingAudioDock,
    isMobileReadingBarVisible,
    () => false,
  );
}

export function resetFloatingAudioDockForTest(): void {
  activeDockIds.clear();
  activeMobileBarIds.clear();
  emit();
}
