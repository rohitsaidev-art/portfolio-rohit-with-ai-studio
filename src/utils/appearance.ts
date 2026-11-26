/**
 * Visitor Appearance System (Portfolio Refinement Master Roadmap Rev 2 — P1.5).
 *
 * Supports Light, Dark, and System modes with persistent localStorage preference,
 * live OS prefers-color-scheme tracking, and cross-tab synchronization.
 *
 * Note: Workshop sandbox previews use local [data-ds-theme] attributes instead
 * of mutating this store, ensuring experimental previews never leak into the
 * live public website unless the visitor explicitly changes appearance.
 */

export type AppearanceMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const APPEARANCE_STORAGE_KEY = 'portfolio_appearance_mode';

type AppearanceListener = () => void;

const listeners = new Set<AppearanceListener>();
let mediaListenersBound = false;
let currentMode: AppearanceMode = loadStoredAppearanceMode();
let systemTheme: ResolvedTheme = detectSystemTheme();

export function parseAppearanceMode(raw: string | null | undefined): AppearanceMode {
  if (raw === 'light' || raw === 'dark' || raw === 'system') {
    return raw;
  }
  return 'system';
}

export function resolveAppearanceTheme(
  mode: AppearanceMode,
  osPrefersDark: boolean,
): ResolvedTheme {
  if (mode === 'light') return 'light';
  if (mode === 'dark') return 'dark';
  return osPrefersDark ? 'dark' : 'light';
}

function detectSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function loadStoredAppearanceMode(): AppearanceMode {
  if (typeof window === 'undefined') return 'system';
  try {
    return parseAppearanceMode(window.localStorage.getItem(APPEARANCE_STORAGE_KEY));
  } catch {
    return 'system';
  }
}

function notifyListeners(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Isolate subscriber errors
    }
  });
}

export function applyAppearanceToDocument(resolved: ResolvedTheme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }
  root.setAttribute('data-appearance-resolved', resolved);
}

function ensureSystemListeners(): void {
  if (mediaListenersBound || typeof window === 'undefined') return;
  mediaListenersBound = true;

  if (typeof window.matchMedia === 'function') {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (event: MediaQueryListEvent) => {
      const nextSystem: ResolvedTheme = event.matches ? 'dark' : 'light';
      if (nextSystem !== systemTheme) {
        systemTheme = nextSystem;
        applyAppearanceToDocument(getResolvedTheme());
        notifyListeners();
      }
    };
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', handleMediaChange);
    } else if (typeof media.addListener === 'function') {
      media.addListener(handleMediaChange);
    }
  }

  window.addEventListener('storage', (event: StorageEvent) => {
    if (event.key !== APPEARANCE_STORAGE_KEY) return;
    const next = parseAppearanceMode(event.newValue);
    if (next !== currentMode) {
      currentMode = next;
      applyAppearanceToDocument(getResolvedTheme());
      notifyListeners();
    }
  });
}

export function initializeAppearance(): void {
  if (typeof window === 'undefined') return;
  currentMode = loadStoredAppearanceMode();
  systemTheme = detectSystemTheme();
  ensureSystemListeners();
  applyAppearanceToDocument(getResolvedTheme());
}

export function getAppearanceMode(): AppearanceMode {
  return currentMode;
}

export function getSystemTheme(): ResolvedTheme {
  return systemTheme;
}

export function getResolvedTheme(): ResolvedTheme {
  return resolveAppearanceTheme(currentMode, systemTheme === 'dark');
}

export function setAppearanceMode(mode: AppearanceMode): void {
  const changed = currentMode !== mode;
  currentMode = mode;

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(APPEARANCE_STORAGE_KEY, mode);
    } catch {
      // Ignore storage restrictions
    }
  }

  applyAppearanceToDocument(getResolvedTheme());

  if (changed) {
    notifyListeners();
  }
}

export function subscribeAppearance(listener: AppearanceListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function resetAppearanceStateForTest(
  mode: AppearanceMode = 'system',
  osTheme: ResolvedTheme = 'light',
): void {
  currentMode = mode;
  systemTheme = osTheme;
  notifyListeners();
}
