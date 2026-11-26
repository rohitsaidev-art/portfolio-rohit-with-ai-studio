/**
 * Privacy-Respecting Lightweight Analytics Adapter (P3.3).
 *
 * Recommendation: PostHog (cookieless memory persistence, autocapture disabled,
 * zero session replay, zero form input collection) over Microsoft Clarity.
 *
 * Safety & Privacy Guarantees:
 * 1. Strictly disabled (complete no-op) unless `VITE_POSTHOG_KEY` is explicitly configured.
 * 2. Never tracks `/design-system`, `/toc-lab`, `/icons`, or any internal workshop route.
 * 3. Respects browser Do Not Track (`navigator.doNotTrack === '1'`) and Global Privacy
 *    Control (`navigator.globalPrivacyControl === true`).
 * 4. Non-blocking: uses `navigator.sendBeacon` / `fetch(..., { keepalive: true })` with
 *    zero external blocking scripts and zero third-party cookies.
 * 5. Never collects form field values, emails, names, or sensitive user input.
 */

export interface AnalyticsConfig {
  enabled: boolean;
  apiKey: string;
  host: string;
}

const DEFAULT_POSTHOG_HOST = 'https://us.i.posthog.com';
const BLOCKED_PATH_PREFIXES = ['/design-system', '/toc-lab', '/toc', '/icons', '/icon-lab'];

let sessionDistinctId: string | null = null;

function readEnvValue(key: string): string {
  try {
    const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
    return (env?.[key] ?? '').trim();
  } catch {
    return '';
  }
}

export function getAnalyticsConfig(
  overrides?: Partial<{ apiKey: string; host: string }>,
): AnalyticsConfig {
  const apiKey = (overrides?.apiKey ?? readEnvValue('VITE_POSTHOG_KEY')).trim();
  const host = (overrides?.host ?? readEnvValue('VITE_POSTHOG_HOST') ?? DEFAULT_POSTHOG_HOST)
    .trim()
    .replace(/\/+$/, '');

  const isPlaceholder =
    !apiKey ||
    apiKey === 'MY_POSTHOG_PROJECT_API_KEY' ||
    apiKey.toLowerCase().startsWith('your_');

  return {
    enabled: !isPlaceholder,
    apiKey: isPlaceholder ? '' : apiKey,
    host: host || DEFAULT_POSTHOG_HOST,
  };
}

/**
 * Ensures private design workshop and retired internal lab paths are NEVER tracked.
 */
export function isAnalyticsPathAllowed(pathname: string): boolean {
  const normalized = pathname.trim().toLowerCase() || '/';
  return !BLOCKED_PATH_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}

export function isBrowserPrivacyOptOut(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & {
    globalPrivacyControl?: boolean;
    msDoNotTrack?: string;
  };
  const win = typeof window !== 'undefined' ? (window as Window & { doNotTrack?: string }) : undefined;
  const dnt = nav.doNotTrack ?? win?.doNotTrack ?? nav.msDoNotTrack;
  return dnt === '1' || dnt === 'yes' || nav.globalPrivacyControl === true;
}

function getEphemeralSessionId(): string {
  if (sessionDistinctId) return sessionDistinctId;
  // Ephemeral in-memory ID only (zero cookies, zero localStorage tracking)
  const random =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `anon-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  sessionDistinctId = random;
  return sessionDistinctId;
}

export function trackAnalyticsEvent(
  eventName: string,
  pathname: string,
  properties: Record<string, string | number | boolean> = {},
): boolean {
  if (typeof window === 'undefined') return false;
  if (!isAnalyticsPathAllowed(pathname)) return false;
  if (isBrowserPrivacyOptOut()) return false;

  const config = getAnalyticsConfig();
  if (!config.enabled) return false;

  const payload = JSON.stringify({
    api_key: config.apiKey,
    event: eventName,
    distinct_id: getEphemeralSessionId(),
    properties: {
      $current_url: `${window.location.origin}${pathname}`,
      $pathname: pathname,
      $lib: 'portfolio-lightweight-beacon',
      $process_person_profile: false,
      ...properties,
    },
    timestamp: new Date().toISOString(),
  });

  const endpoint = `${config.host}/capture/`;

  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon(endpoint, blob);
      return true;
    }

    if (typeof fetch === 'function') {
      void fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
        credentials: 'omit',
      }).catch(() => {
        // Never disrupt visitor experience if analytics endpoint is blocked
      });
      return true;
    }
  } catch {
    // Gracefully ignore blocked beacons / ad blockers
  }
  return false;
}

export function trackPageView(pathname: string): boolean {
  return trackAnalyticsEvent('$pageview', pathname);
}
