/**
 * Site-wide Color Theme System:
 * - 'apple' (default): Classic Apple HIG palette (#FFFFFF / #000000, #0071E3 / #2997FF)
 * - 'warm': Warm Gallery Paper (#FAF8F6) & Warm Obsidian (#11100E)
 * - 'cool': Cool Porcelain (#FAFAFC) & Cool Slate (#0B0B0D)
 */

export type ColorTheme = 'apple' | 'warm' | 'cool';

export const COLOR_THEME_STORAGE_KEY = 'portfolio_color_theme';

const THEME_TRANSITION_DELAY_MS = 65;
const THEME_FALLBACK_TRANSITION_MS = 460;

type ColorThemeListener = () => void;

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

const listeners = new Set<ColorThemeListener>();
let storageBound = false;
let currentColorTheme: ColorTheme = loadStoredColorTheme();
let pendingTimer: number | null = null;
let fallbackCleanupTimer: number | null = null;

export function parseColorTheme(raw: string | null | undefined): ColorTheme {
  if (raw === 'apple' || raw === 'warm' || raw === 'cool') {
    return raw;
  }
  return 'apple';
}

function loadStoredColorTheme(): ColorTheme {
  if (typeof window === 'undefined') return 'apple';
  try {
    return parseColorTheme(window.localStorage.getItem(COLOR_THEME_STORAGE_KEY));
  } catch {
    return 'apple';
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

function commitColorThemeToDom(theme: ColorTheme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-color-theme', theme);
}

export function applyColorThemeToDocument(
  theme: ColorTheme,
  options?: { animated?: boolean },
): void {
  if (typeof document === 'undefined') return;

  if (pendingTimer !== null && typeof window !== 'undefined') {
    window.clearTimeout(pendingTimer);
    pendingTimer = null;
  }

  const root = document.documentElement;
  const currentDom = root.getAttribute('data-color-theme');
  const shouldAnimate =
    options?.animated === true &&
    typeof window !== 'undefined' &&
    currentDom !== null &&
    currentDom !== theme;

  if (!shouldAnimate) {
    commitColorThemeToDom(theme);
    return;
  }

  pendingTimer = window.setTimeout(() => {
    pendingTimer = null;
    const doc = document as DocumentWithViewTransition;

    if (typeof doc.startViewTransition === 'function') {
      try {
        doc.startViewTransition(() => {
          commitColorThemeToDom(theme);
        });
        return;
      } catch {
        // Fall back to CSS transition
      }
    }

    if (fallbackCleanupTimer !== null) {
      window.clearTimeout(fallbackCleanupTimer);
    }
    root.classList.add('theme-transitioning');
    commitColorThemeToDom(theme);
    fallbackCleanupTimer = window.setTimeout(() => {
      root.classList.remove('theme-transitioning');
      fallbackCleanupTimer = null;
    }, THEME_FALLBACK_TRANSITION_MS);
  }, THEME_TRANSITION_DELAY_MS);
}

export function initializeColorTheme(): void {
  if (typeof window === 'undefined') return;
  currentColorTheme = loadStoredColorTheme();
  applyColorThemeToDocument(currentColorTheme, { animated: false });

  if (!storageBound) {
    storageBound = true;
    window.addEventListener('storage', (event: StorageEvent) => {
      if (event.key !== COLOR_THEME_STORAGE_KEY) return;
      const next = parseColorTheme(event.newValue);
      if (next !== currentColorTheme) {
        currentColorTheme = next;
        applyColorThemeToDocument(next, { animated: true });
        notifyListeners();
      }
    });
  }
}

export function getColorTheme(): ColorTheme {
  return currentColorTheme;
}

export function setColorTheme(
  theme: ColorTheme,
  options?: { animated?: boolean },
): void {
  const changed = currentColorTheme !== theme;
  currentColorTheme = theme;

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(COLOR_THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage restrictions
    }
  }

  applyColorThemeToDocument(theme, { animated: options?.animated ?? true });

  if (changed) {
    notifyListeners();
  }
}

export function subscribeColorTheme(listener: ColorThemeListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
