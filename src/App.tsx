import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { PROJECTS } from './data/projects';
import { JOURNAL_NOTES } from './data/notes';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingBackToTop } from './components/FloatingBackToTop';
import { ToastViewport } from './components/ToastViewport';
import { CommandPalette } from './components/CommandPalette';
import { ColophonDrawer } from './components/ColophonDrawer';
import { ShortlistDrawer } from './components/ShortlistDrawer';
import { HomePage } from './pages/HomePage';
import { initializeAppearance } from './utils/appearance';
import { initializeReaderPreferences } from './utils/readerPreferences';
import { initializeShortlist } from './utils/shortlist';
import { applyRouteSeo, resolveRouteSeo } from './utils/seo';
import { trackPageView } from './utils/analytics';
import { showToast } from './utils/toast';
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

// Route-level code splitting (P3.2): keeps HomePage eager for instant first paint
// and isolates secondary pages & the internal Design Workshop into separate chunks.
const CaseStudyPage = lazy(() =>
  import('./pages/CaseStudyPage').then((m) => ({ default: m.CaseStudyPage })),
);
const NotesPage = lazy(() =>
  import('./pages/NotesPage').then((m) => ({ default: m.NotesPage })),
);
const NoteDetailPage = lazy(() =>
  import('./pages/NoteDetailPage').then((m) => ({ default: m.NoteDetailPage })),
);
const AboutPage = lazy(() =>
  import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })),
);
const ContactPage = lazy(() =>
  import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })),
);
const DesignWorkshopPage = lazy(() =>
  import('./pages/DesignWorkshopPage').then((m) => ({
    default: m.DesignWorkshopPage,
  })),
);

const TOC_STORAGE_KEY = 'portfolio_toc_variant';

function loadStoredTocVariant(): TocVariant {
  try {
    const raw = window.localStorage.getItem(TOC_STORAGE_KEY);
    if (
      raw === 'notch-rail' ||
      raw === 'ios-capsule' ||
      raw === 'apple-local-nav' ||
      raw === 'macos-sidebar' ||
      raw === 'tactile-scrubber'
    ) {
      return raw;
    }
  } catch {
    // Ignore storage restrictions
  }
  return 'notch-rail';
}

function RouteLoadingFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex min-h-[52vh] max-w-[1160px] items-center justify-center px-5 py-24 sm:px-8"
    >
      <div className="flex items-center gap-3 text-[var(--apple-label-secondary)]">
        <span className="apple-spinner" aria-hidden="true" />
        <span className="type-footnote font-normal">Loading view…</span>
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
  const [shortlistOpen, setShortlistOpen] = useState(false);
  const [colophonOpen, setColophonOpen] = useState(false);
  const [routeAnnouncement, setRouteAnnouncement] = useState('');
  const pendingHashRef = useRef<string | null>(
    window.location.hash ? window.location.hash.slice(1) : null,
  );
  const hasMountedRef = useRef(false);

  // Initialize Appearance, Reader Comfort, and Recruiter Shortlist (with URL restoration)
  useEffect(() => {
    initializeAppearance();
    initializeReaderPreferences();
    const { restoredFromUrl, slugs } = initializeShortlist(window.location.search);
    if (restoredFromUrl && slugs.length > 0) {
      setShortlistOpen(true);
      showToast({
        message: `Loaded shared shortlist (${slugs.length} ${
          slugs.length === 1 ? 'case study' : 'case studies'
        })`,
        tone: 'info',
      });
    }
  }, []);

  // Global Cmd+K / Ctrl+K keyboard shortcut for public Command Palette (P2.4)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandPaletteOpen((prev) => {
          const next = !prev;
          if (next) {
            setShortlistOpen(false);
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
    setShortlistOpen(false);
    setColophonOpen(false);
    setCommandPaletteOpen(true);
  }, []);

  const openShortlist = useCallback(() => {
    setCommandPaletteOpen(false);
    setColophonOpen(false);
    setShortlistOpen(true);
  }, []);

  const openColophon = useCallback(() => {
    setCommandPaletteOpen(false);
    setShortlistOpen(false);
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
      const [pathnamePart, hashPart = ''] = normalized.split('#');
      const cleanPathname = pathnamePart || '/';

      const currentFull = `${window.location.pathname}${window.location.hash}`;
      const targetFull = hashPart ? `${cleanPathname}#${hashPart}` : cleanPathname;

      if (currentFull !== targetFull) {
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

  const handleRouteExitComplete = useCallback(() => {
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
  }, []);

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

  const routeKey =
    route.page === 'case-study'
      ? `case-study-${route.slug}`
      : route.page === 'note-detail'
        ? `note-detail-${route.slug}`
        : route.page === 'design-system'
          ? 'design-system'
          : route.page;

  const reducedMotion = prefersReducedMotion();

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
          onOpenCommandPalette={openCommandPalette}
          onOpenShortlist={openShortlist}
        />

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 scroll-mt-[var(--scroll-offset-header)] focus:outline-none"
        >
          <AnimatePresence
            mode="wait"
            initial={false}
            onExitComplete={handleRouteExitComplete}
          >
            <motion.div
              key={routeKey}
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
              transition={
                reducedMotion
                  ? { duration: 0.01 }
                  : { duration: 0.24, ease: EASE_APPLE }
              }
            >
              <Suspense fallback={<RouteLoadingFallback />}>
                {route.page === 'about' ? (
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
          </AnimatePresence>
        </main>

        <FloatingBackToTop />

        <ToastViewport />

        <CommandPalette
          open={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          onNavigate={navigate}
          onOpenShortlist={openShortlist}
          onOpenColophon={openColophon}
        />

        <ShortlistDrawer
          open={shortlistOpen}
          onClose={() => setShortlistOpen(false)}
          onNavigate={navigate}
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
