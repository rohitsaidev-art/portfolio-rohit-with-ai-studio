import { useSyncExternalStore } from 'react';
import { PROJECTS } from '../data/projects';

export const SHORTLIST_STORAGE_KEY = 'portfolio_recruiter_shortlist_v1';
export const SHORTLIST_QUERY_PARAM = 'shortlist';

type ShortlistListener = () => void;

const VALID_PROJECT_SLUGS = new Set(PROJECTS.map((project) => project.slug));

let shortlistedSlugs: string[] = [];
let initialized = false;
const listeners = new Set<ShortlistListener>();

function emit(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Isolate subscriber errors
    }
  });
}

function sanitizeSlugs(
  slugs: readonly string[],
  validSlugs: ReadonlySet<string> = VALID_PROJECT_SLUGS,
): string[] {
  const unique: string[] = [];
  for (const raw of slugs) {
    const clean = raw.trim().toLowerCase();
    if (clean && validSlugs.has(clean) && !unique.includes(clean)) {
      unique.push(clean);
    }
  }
  return unique;
}

function persistSlugs(slugs: readonly string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    // Ignore storage restrictions
  }
}

function loadStoredSlugs(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SHORTLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return sanitizeSlugs(parsed.filter((item): item is string => typeof item === 'string'));
  } catch {
    return [];
  }
}

/**
 * Parses a `?shortlist=stallsync,hubapps` query string into validated, deduplicated
 * project slugs. Unknown or malformed slugs are safely ignored.
 */
export function parseShortlistFromSearch(
  search: string,
  validSlugs: ReadonlySet<string> = VALID_PROJECT_SLUGS,
): string[] {
  if (!search) return [];
  try {
    const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
    const raw = params.get(SHORTLIST_QUERY_PARAM);
    if (!raw) return [];
    return sanitizeSlugs(raw.split(','), validSlugs);
  } catch {
    return [];
  }
}

/**
 * Builds a clean shareable portfolio URL encoding the current recruiter shortlist.
 */
export function buildShortlistShareUrl(
  origin: string,
  slugs: readonly string[],
): string {
  const cleanOrigin = origin.replace(/\/+$/, '');
  const clean = sanitizeSlugs(slugs);
  if (clean.length === 0) {
    return `${cleanOrigin}/`;
  }
  return `${cleanOrigin}/?${SHORTLIST_QUERY_PARAM}=${encodeURIComponent(clean.join(','))}`;
}

/**
 * Initializes the shortlist from URL query parameter (if present) or localStorage.
 * Returns `{ restoredFromUrl: boolean, slugs: string[] }` so the app can notify
 * and open the shortlist drawer when a shared link is opened.
 */
export function initializeShortlist(
  search: string = typeof window !== 'undefined' ? window.location.search : '',
): { restoredFromUrl: boolean; slugs: string[] } {
  const fromUrl = parseShortlistFromSearch(search);
  initialized = true;

  if (fromUrl.length > 0) {
    shortlistedSlugs = fromUrl;
    persistSlugs(shortlistedSlugs);
    emit();
    return { restoredFromUrl: true, slugs: shortlistedSlugs };
  }

  shortlistedSlugs = loadStoredSlugs();
  return { restoredFromUrl: false, slugs: shortlistedSlugs };
}

export function getShortlistSlugs(): readonly string[] {
  if (!initialized && typeof window !== 'undefined') {
    initializeShortlist();
  }
  return shortlistedSlugs;
}

export function isSlugShortlisted(slug: string): boolean {
  return getShortlistSlugs().includes(slug);
}

export function setShortlistSlugs(nextSlugs: readonly string[]): string[] {
  const sanitized = sanitizeSlugs(nextSlugs);
  if (
    sanitized.length === shortlistedSlugs.length &&
    sanitized.every((slug, idx) => slug === shortlistedSlugs[idx])
  ) {
    return shortlistedSlugs;
  }
  initialized = true;
  shortlistedSlugs = sanitized;
  persistSlugs(shortlistedSlugs);
  emit();
  return shortlistedSlugs;
}

export function toggleShortlistSlug(slug: string): boolean {
  const current = getShortlistSlugs();
  if (current.includes(slug)) {
    setShortlistSlugs(current.filter((item) => item !== slug));
    return false;
  }
  setShortlistSlugs([...current, slug]);
  return true;
}

export function removeShortlistSlug(slug: string): void {
  const current = getShortlistSlugs();
  if (!current.includes(slug)) return;
  setShortlistSlugs(current.filter((item) => item !== slug));
}

export function clearShortlist(): void {
  if (shortlistedSlugs.length === 0) return;
  setShortlistSlugs([]);
}

export function subscribeShortlist(listener: ShortlistListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useShortlistSlugs(): readonly string[] {
  return useSyncExternalStore(
    subscribeShortlist,
    getShortlistSlugs,
    () => [],
  );
}

export function resetShortlistForTest(initial: readonly string[] = []): void {
  initialized = true;
  shortlistedSlugs = sanitizeSlugs(initial);
  emit();
}
