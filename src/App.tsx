import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { MotionConfig, motion } from 'motion/react';
import { PROJECTS } from './data/projects';
import { JOURNAL_NOTES } from './data/notes';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingBackToTop } from './components/FloatingBackToTop';
import { ToastViewport } from './components/ToastViewport';
import { CaseStudyTransitionOverlay } from './components/CaseStudyTransitionOverlay';
import { CommandPalette } from './components/CommandPalette';
import { ColophonDrawer } from './components/ColophonDrawer';
import { HomePage } from './pages/HomePage';
import {
  getActiveCaseStudyTransition,
  subscribeCaseStudyTransition,
} from './utils/caseStudyTransition';
import { initializeAppearance } from './utils/appearance';
import { initializeColorTheme } from './utils/colorTheme';
import { initializeReaderPreferences } from './utils/readerPreferences';
import { initializeSmoothScroll } from './utils/smoothScroll';
import { applyRouteSeo, resolveRouteSeo } from './utils/seo';
import { trackPageView } from './utils/analytics';
import {
  getNoteBySlug,
  getProjectBySlug,
  parseRoute,
  type RouteMatch,
  type TocVariant,
} from './utils/portfolio';
import { EASE_APPLE } from './utils/motion';
import {
  prefersReducedMotion,
  scrollToElementById,
  scrollToTop,
} from './utils/scroll';

// Route-level code splitting with reusable loaders for idle + hover prefetching
const loadWorkPage = () =>
  import('./pages/WorkPage').then((m) => ({ default: m.WorkPage }));
const loadCaseStudyPage = () =>
  import('./pages/CaseStudyPage').then((m) => ({ default: m.CaseStudyPage }));
const loadNotesPage = () =>
  import('./pages/NotesPage').then((m) => ({ default: m.NotesPage }));
const loadNoteDetailPage = () =>
  import('./pages/NoteDetailPage').then((m) => ({ default: m.NoteDetailPage }));
const loadAboutPage = () =>
  import('./pages/AboutPage').then((m) => ({ default: m.AboutPage }));
const loadContactPage = () =>
  import('./pages/ContactPage').then((m) => ({ default: m.ContactPage }));
const loadDesignWorkshopPage = () =>
  import('./pages/DesignWorkshopPage').then((m) => ({
    default: m.DesignWorkshopPage,
  }));
const loadFlexCarouselLabPage = () =>
  import('./pages/FlexCarouselLabPage').then((m) => ({
    default: m.FlexCarouselLabPage,
  }));

const WorkPage = lazy(loadWorkPage);
const CaseStudyPage = lazy(loadCaseStudyPage);
const NotesPage = lazy(loadNotesPage);
const NoteDetailPage = lazy(loadNoteDetailPage);
const AboutPage = lazy(loadAboutPage);
const ContactPage = lazy(loadContactPage);
const DesignWorkshopPage = lazy(loadDesignWorkshopPage);
const FlexCarouselLabPage = lazy(loadFlexCarouselLabPage);

const prefetchedRouteChunks = new Set<string>();

function prefetchRouteByPath(path: string) {
  const clean = path.split('#')[0].split('?')[0] || '/';
  const match = parseRoute(clean);
  if (prefetchedRouteChunks.has(match.page)) return;
  prefetchedRouteChunks.add(match.page);

  switch (match.page) {
    case 'work':
      void loadWorkPage();
      break;
    case 'case-study':
      void loadCaseStudyPage();
      break;
    case 'notes':
      void loadNotesPage();
      break;
    case 'note-detail':
      void loadNoteDetailPage();
      break;
    case 'about':
      void loadAboutPage();
      break;
    case 'contact':
      void loadContactPage();
      break;
    case 'design-system':
      void loadDesignWorkshopPage();
      break;
    case 'flex-carousel':
      void loadFlexCarouselLabPage();
      break;
    default:
      break;
  }
}

const TOC_STORAGE_KEY = 'portfolio_toc_variant_v2';

function loadStoredTocVariant(): TocVariant {
  try {
    const raw = window.localStorage.getItem(TOC_STORAGE_KEY);
    if (
      raw === 'notch-rail' ||
      raw === 'ios-capsule' ||
      raw === 'apple-local-nav' ||
      raw === 'macos-sidebar' ||
      raw === 'tactile-scrubber' ||
      raw === 'chapter-scrubber' ||
      raw === 'wave-scrubber' ||
      raw === 'scroll-index'
    ) {
      return raw;
    }
  } catch {
    // Ignore storage restrictions
  }
  return 'scroll-index';
}

/**
 * Height-stable fallback that stays completely silent for the first 300ms
 * so cached or fast-network route transitions never flash a spinner.
 */
function RouteLoadingFallback() {
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowIndicator(true), 300);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex min-h-[calc(100dvh-52px)] max-w-[1160px] items-center justify-center px-5 py-24 sm:px-8"
    >
      <div
        className={`flex items-center gap-2.5 text-[var(--apple-label-tertiary)] transition-opacity duration-200 ${
          showIndicator ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="apple-spinner" aria-hidden="true" />
      </div>
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState<RouteMatch>(() =>
    parseRoute(window.location.pathname),
  );
  const [tocVariant, setTocVariant] = useState<TocVariant>(() =>
    loadStoredTocVariant(),
  );
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [colophonOpen, setColophonOpen] = useState(false);
  const [routeAnnouncement, setRouteAnnouncement] = useState('');
  const [hasCardTransition, setHasCardTransition] = useState<boolean>(() =>
    Boolean(getActiveCaseStudyTransition()),
  );
  const pendingHashRef = useRef<string | null>(
    window.location.hash ? window.location.hash.slice(1) : null,
  );
  const hasMountedRef = useRef(false);

  // Track active FlexCarousel -> CaseStudy card expansion overlay
  useEffect(() => {
    return subscribeCaseStudyTransition((req) => {
      setHasCardTransition(Boolean(req));
    });
  }, []);

  // Initialize Appearance, Color Theme, Reader Comfort, and Global Smooth Scroll
  useEffect(() => {
    initializeAppearance();
    initializeColorTheme();
    initializeReaderPreferences();
    return initializeSmoothScroll();
  }, []);

  // Warm primary route chunks silently once the browser is idle so tab switches are instant
  useEffect(() => {
    const warmPrimaryRoutes = () => {
      prefetchRouteByPath('/work');
      prefetchRouteByPath('/notes');
      prefetchRouteByPath('/about');
      prefetchRouteByPath('/contact');
      prefetchRouteByPath('/work/stallsync');
    };

    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof win.requestIdleCallback === 'function') {
      const idleId = win.requestIdleCallback(warmPrimaryRoutes, { timeout: 1200 });
      return () => win.cancelIdleCallback?.(idleId);
    }

    const timer = window.setTimeout(warmPrimaryRoutes, 650);
    return () => window.clearTimeout(timer);
  }, []);

  // Global Cmd+K / Ctrl+K keyboard shortcut for public Command Palette (P2.4)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandPaletteOpen((prev) => {
          const next = !prev;
          if (next) {
            setColophonOpen(false);
          }
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openCommandPalette = useCallback(() => {
    setColophonOpen(false);
    setCommandPaletteOpen(true);
  }, []);

  const openColophon = useCallback(() => {
    setCommandPaletteOpen(false);
    setColophonOpen(true);
  }, []);

  const handleApplyTocVariant = useCallback((next: TocVariant) => {
    setTocVariant(next);
    try {
      window.localStorage.setItem(TOC_STORAGE_KEY, next);
    } catch {
      // Ignore storage restrictions
    }
  }, []);

  const navigate = useCallback(
    (path: string) => {
      const normalized = path.startsWith('/') ? path : `/${path}`;
      const [beforeHash, hashPart = ''] = normalized.split('#');
      const [pathnamePart, searchPart = ''] = beforeHash.split('?');
      const cleanPathname = pathnamePart || '/';
      const cleanSearch = searchPart ? `?${searchPart}` : '';

      const currentFull = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      const targetFull = `${cleanPathname}${cleanSearch}${hashPart ? `#${hashPart}` : ''}`;

      const urlChanged = currentFull !== targetFull;
      if (urlChanged) {
        window.history.pushState({}, '', targetFull);
      }

      const nextRoute = parseRoute(cleanPathname);

      const currentKey =
        route.page === 'case-study'
          ? `case-study-${route.slug}`
          : route.page === 'note-detail'
            ? `note-detail-${route.slug}`
            : route.page === 'design-system'
              ? `design-system-${route.section}`
              : route.page;
      const nextKey =
        nextRoute.page === 'case-study'
          ? `case-study-${nextRoute.slug}`
          : nextRoute.page === 'note-detail'
            ? `note-detail-${nextRoute.slug}`
            : nextRoute.page === 'design-system'
              ? `design-system-${nextRoute.section}`
              : nextRoute.page;

      if (currentKey === nextKey) {
        if (urlChanged) {
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
        if (hashPart) {
          scrollToElementById(hashPart);
        } else {
          scrollToTop('smooth');
        }
        return;
      }

      pendingHashRef.current = hashPart || null;
      setRoute(nextRoute);
    },
    [route],
  );

  useEffect(() => {
    const handlePopState = () => {
      pendingHashRef.current = window.location.hash
        ? window.location.hash.slice(1)
        : null;
      setRoute(parseRoute(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const routeKey =
    route.page === 'case-study'
      ? `case-study-${route.slug}`
      : route.page === 'note-detail'
        ? `note-detail-${route.slug}`
        : route.page === 'design-system'
          ? 'design-system'
          : route.page;

  const prevRouteKeyRef = useRef(routeKey);

  // Immediately reset scroll position before paint on route change so the incoming
  // view always enters cleanly at y=0 with zero mid-transition scroll jump.
  useLayoutEffect(() => {
    if (prevRouteKeyRef.current === routeKey) return;
    prevRouteKeyRef.current = routeKey;

    const targetHash = pendingHashRef.current;
    if (targetHash) {
      pendingHashRef.current = null;
      window.requestAnimationFrame(() => {
        if (!scrollToElementById(targetHash)) {
          scrollToTop('auto');
        }
      });
      return;
    }
    scrollToTop('auto');
  }, [routeKey]);

  // Handle direct initial loads containing a URL hash (e.g., /#selected-work)
  useEffect(() => {
    const initialHash = pendingHashRef.current;
    if (!initialHash) return;
    pendingHashRef.current = null;
    const timer = window.setTimeout(() => {
      scrollToElementById(initialHash);
    }, 80);
    return () => window.clearTimeout(timer);
  }, []);

  const activeProject =
    route.page === 'case-study'
      ? getProjectBySlug(PROJECTS, route.slug)
      : undefined;

  const activeNote =
    route.page === 'note-detail'
      ? getNoteBySlug(JOURNAL_NOTES, route.slug)
      : undefined;

  const routeSeo = useMemo(
    () =>
      resolveRouteSeo({
        route,
        project: activeProject,
        note: activeNote,
        notes: JOURNAL_NOTES,
        origin:
          typeof window !== 'undefined' && window.location.origin
            ? window.location.origin
            : 'https://aaravsen.design',
      }),
    [route, activeProject, activeNote],
  );

  // Synchronize document title, OpenGraph, Twitter, robots, JSON-LD (P3.2),
  // screen-reader route announcements (P3.1), and privacy-respecting pageviews (P3.3)
  useEffect(() => {
    applyRouteSeo(routeSeo);
    trackPageView(routeSeo.canonicalPath);

    if (hasMountedRef.current) {
      setRouteAnnouncement(`Navigated to ${routeSeo.title}`);
    } else {
      hasMountedRef.current = true;
    }
  }, [routeSeo]);

  const reducedMotion = prefersReducedMotion();
  const isInitialRouteMount = !hasMountedRef.current;

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col bg-[var(--apple-bg)] text-[var(--apple-label-primary)]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[var(--apple-blue-fill)] focus:px-4 focus:py-2 focus:text-[13px] focus:font-medium focus:text-white"
        >
          Skip to main content
        </a>

        {/* Screen-reader polite route change announcer (P3.1) */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {routeAnnouncement}
        </div>

        <Navbar
          route={route}
          onNavigate={navigate}
          onPrefetchRoute={prefetchRouteByPath}
          onOpenCommandPalette={openCommandPalette}
        />

        <main
          id="main-content"
          tabIndex={-1}
          className="min-h-[calc(100dvh-52px)] flex-1 scroll-mt-[var(--scroll-offset-header)] focus:outline-none"
        >
          <motion.div
            key={routeKey}
            initial={
              reducedMotion || hasCardTransition || isInitialRouteMount
                ? false
                : { opacity: 0, y: 6 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={
              reducedMotion || hasCardTransition
                ? { duration: 0.01 }
                : { duration: 0.28, ease: EASE_APPLE }
            }
          >
            <Suspense fallback={<RouteLoadingFallback />}>
                {route.page === 'work' ? (
                  <WorkPage onNavigate={navigate} />
                ) : route.page === 'about' ? (
                  <AboutPage onNavigate={navigate} />
                ) : route.page === 'contact' ? (
                  <ContactPage />
                ) : route.page === 'notes' ? (
                  <NotesPage onNavigate={navigate} />
                ) : route.page === 'note-detail' && activeNote ? (
                  <NoteDetailPage article={activeNote} onNavigate={navigate} />
                ) : route.page === 'note-detail' ? (
                  <NotesPage onNavigate={navigate} />
                ) : route.page === 'design-system' ? (
                  <DesignWorkshopPage
                    section={route.section}
                    appliedTocVariant={tocVariant}
                    onApplyTocVariant={handleApplyTocVariant}
                    onNavigate={navigate}
                  />
                ) : route.page === 'flex-carousel' ? (
                  <FlexCarouselLabPage onNavigate={navigate} />
                ) : route.page === 'case-study' && activeProject ? (
                  <CaseStudyPage
                    project={activeProject}
                    tocVariant={tocVariant}
                    onNavigate={navigate}
                  />
                ) : (
                  <HomePage onNavigate={navigate} />
                )}
            </Suspense>
          </motion.div>
        </main>

        <FloatingBackToTop />

        <ToastViewport />

        <CaseStudyTransitionOverlay
          activeCaseStudySlug={
            route.page === 'case-study' && activeProject ? activeProject.slug : null
          }
        />

        <CommandPalette
          open={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          onNavigate={navigate}
          onOpenColophon={openColophon}
        />

        <ColophonDrawer
          open={colophonOpen}
          onClose={() => setColophonOpen(false)}
        />

        <Footer
          onNavigate={navigate}
          onOpenColophon={openColophon}
        />
      </div>
    </MotionConfig>
  );
}
