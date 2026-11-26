import { useSyncExternalStore } from 'react';

export type ToastTone = 'default' | 'success' | 'info';

export interface ToastRecord {
  id: number;
  message: string;
  tone: ToastTone;
  durationMs: number;
}

export interface ShowToastOptions {
  message: string;
  tone?: ToastTone;
  durationMs?: number;
}

type ToastListener = () => void;

const DEFAULT_TOAST_DURATION_MS = 2600;

let activeToast: ToastRecord | null = null;
let nextToastId = 1;
let dismissTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<ToastListener>();

function emit(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Isolate subscriber errors
    }
  });
}

function clearPendingTimer(): void {
  if (dismissTimer !== null) {
    clearTimeout(dismissTimer);
    dismissTimer = null;
  }
}

/**
 * Displays a single non-stacking accessible toast notification (P2.3).
 * Any currently visible toast is cleanly replaced so notifications never pile up.
 */
export function showToast(input: string | ShowToastOptions): ToastRecord {
  clearPendingTimer();

  const normalized: ShowToastOptions =
    typeof input === 'string' ? { message: input } : input;

  const durationMs =
    typeof normalized.durationMs === 'number' && normalized.durationMs > 0
      ? normalized.durationMs
      : DEFAULT_TOAST_DURATION_MS;

  const record: ToastRecord = {
    id: nextToastId++,
    message: normalized.message,
    tone: normalized.tone ?? 'default',
    durationMs,
  };

  activeToast = record;
  emit();

  if (typeof window !== 'undefined') {
    dismissTimer = setTimeout(() => {
      if (activeToast?.id === record.id) {
        activeToast = null;
        dismissTimer = null;
        emit();
      }
    }, durationMs);
  }

  return record;
}

export function dismissToast(): void {
  clearPendingTimer();
  if (activeToast === null) return;
  activeToast = null;
  emit();
}

export function getActiveToast(): ToastRecord | null {
  return activeToast;
}

export function subscribeToast(listener: ToastListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useActiveToast(): ToastRecord | null {
  return useSyncExternalStore(subscribeToast, getActiveToast, () => null);
}

export function resetToastForTest(): void {
  clearPendingTimer();
  activeToast = null;
  nextToastId = 1;
  emit();
}
