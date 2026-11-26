import { useSyncExternalStore } from 'react';

export type ReaderTextSize = 'default' | 'large';

export interface ReaderPreferences {
  textSize: ReaderTextSize;
  focusMode: boolean;
}

export const READER_PREFS_STORAGE_KEY = 'portfolio_reader_prefs_v1';

const DEFAULT_PREFS: ReaderPreferences = {
  textSize: 'default',
  focusMode: false,
};

type ReaderListener = () => void;

let currentPrefs: ReaderPreferences = { ...DEFAULT_PREFS };
let initialized = false;
const listeners = new Set<ReaderListener>();

function emit(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Isolate subscriber errors
    }
  });
}

function applyReaderPrefsToDom(prefs: ReaderPreferences): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dataset.readerSize = prefs.textSize;
  root.dataset.readerFocus = prefs.focusMode ? 'true' : 'false';
}

function readStoredPrefs(): ReaderPreferences {
  if (typeof window === 'undefined') return { ...DEFAULT_PREFS };
  try {
    const raw = window.localStorage.getItem(READER_PREFS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    const parsed = JSON.parse(raw) as Partial<ReaderPreferences>;
    return {
      textSize: parsed.textSize === 'large' ? 'large' : 'default',
      focusMode: parsed.focusMode === true,
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

function persistPrefs(prefs: ReaderPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(READER_PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage quota restrictions
  }
}

/**
 * Loads persisted Reader Comfort preferences (P2.9) and applies root dataset
 * attributes cleanly on startup.
 */
export function initializeReaderPreferences(): ReaderPreferences {
  if (initialized) {
    applyReaderPrefsToDom(currentPrefs);
    return currentPrefs;
  }
  initialized = true;
  currentPrefs = readStoredPrefs();
  applyReaderPrefsToDom(currentPrefs);
  return currentPrefs;
}

export function getReaderPreferences(): ReaderPreferences {
  if (!initialized && typeof window !== 'undefined') {
    initializeReaderPreferences();
  }
  return currentPrefs;
}

export function setReaderTextSize(textSize: ReaderTextSize): void {
  if (currentPrefs.textSize === textSize) return;
  currentPrefs = { ...currentPrefs, textSize };
  persistPrefs(currentPrefs);
  applyReaderPrefsToDom(currentPrefs);
  emit();
}

export function setFocusReading(focusMode: boolean): void {
  if (currentPrefs.focusMode === focusMode) return;
  currentPrefs = { ...currentPrefs, focusMode };
  persistPrefs(currentPrefs);
  applyReaderPrefsToDom(currentPrefs);
  emit();
}

export function toggleFocusReading(): boolean {
  const next = !currentPrefs.focusMode;
  setFocusReading(next);
  return next;
}

export function subscribeReaderPreferences(listener: ReaderListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useReaderPreferences(): ReaderPreferences {
  return useSyncExternalStore(
    subscribeReaderPreferences,
    getReaderPreferences,
    () => DEFAULT_PREFS,
  );
}

export function resetReaderPreferencesForTest(
  next: Partial<ReaderPreferences> = {},
): void {
  initialized = true;
  currentPrefs = {
    textSize: next.textSize === 'large' ? 'large' : 'default',
    focusMode: next.focusMode === true,
  };
  applyReaderPrefsToDom(currentPrefs);
  emit();
}
