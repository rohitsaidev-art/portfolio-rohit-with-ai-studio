import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { ResolvedTheme } from '../utils/appearance';
import { useResolvedTheme } from '../utils/useAppearance';
import { EASE_APPLE, SPRING_SEGMENT } from '../utils/motion';
import type { DesignWorkshopSection, TocVariant } from '../utils/portfolio';
import { scrollToTop } from '../utils/scroll';
import { playSuccessChime, playTick } from '../utils/soundEngine';
import {
  STUDIO_NAV_GROUPS,
  getStudioDestination,
} from '../utils/studioNavigation';
import {
  EFFECT_TRACKS,
  WORKSHOP_SANDBOX_STORAGE_KEY,
  createDefaultEffectsConfig,
  loadDecisionLog,
  loadEffectsConfig,
  promoteApprovedDecisions,
  saveDecisionLog,
  saveEffectsConfig,
  upsertDecisionEntry,
  type DecisionLogEntry,
  type DecisionStatus,
  type EffectTrackConfig,
  type EffectTrackId,
  type VisualPaletteId,
} from '../utils/workshopStore';
import {
  linkExperimentToDecision,
  loadExperiments,
  saveExperiments,
  type StudioExperiment,
} from '../utils/experimentsStore';
import {
  archiveSpecimens,
  getAllWorkbenchSpecimens,
  loadWorkbenchState,
  restoreAllArchived,
  restoreSpecimens,
  saveWorkbenchState,
  type WorkbenchMode,
  type WorkbenchSpecimen,
  type WorkbenchState,
} from '../utils/workbenchStore';
import { showToast } from '../utils/toast';
import { FoundationsSection } from '../components/workshop/FoundationsSection';
import { ComponentsSection } from '../components/workshop/ComponentsSection';
import type { InspectedComponentSummary } from '../components/workshop/ComponentLibraryView';
import { MotionIconsSoundSection } from '../components/workshop/MotionIconsSoundSection';
import { EffectsLabSection } from '../components/workshop/EffectsLabSection';
import { DecisionLogSection } from '../components/workshop/DecisionLogSection';
import { StudioOverviewSection } from '../components/workshop/StudioOverviewSection';
import { PatternsSection } from '../components/workshop/PatternsSection';
import { PageTemplatesSection } from '../components/workshop/PageTemplatesSection';
import { ExperimentsSection } from '../components/workshop/ExperimentsSection';
import { DocumentationHubSection } from '../components/workshop/DocumentationHubSection';
import {
  FlyToArchiveOverlay,
  WorkbenchArchiveDrawer,
  type FlyingArchiveCard,
} from '../components/workshop/WorkbenchArchiveDrawer';
import type { ArchiveOriginRect } from '../components/workshop/WorkbenchCanvasView';
import { TocLabPage } from './TocLabPage';
import { ChevronLeft, Moon, PanelLeft, Sun, X } from 'lucide-react';

interface DesignWorkshopPageProps {
  section: DesignWorkshopSection;
  appliedTocVariant: TocVariant;
  onApplyTocVariant: (next: TocVariant) => void;
  onNavigate: (path: string) => void;
}

function loadStoredSandboxPrefs(fallbackTheme: ResolvedTheme): {
  palette: VisualPaletteId;
  theme: ResolvedTheme;
} {
  if (typeof window === 'undefined') {
    return { palette: 'warm', theme: fallbackTheme };
  }
  try {
    const raw = window.localStorage.getItem(WORKSHOP_SANDBOX_STORAGE_KEY);
    if (!raw) return { palette: 'warm', theme: fallbackTheme };
    const parsed = JSON.parse(raw) as { palette?: unknown; theme?: unknown };
    return {
      palette: parsed.palette === 'cool' ? 'cool' : 'warm',
      theme:
        parsed.theme === 'dark' || parsed.theme === 'light'
          ? parsed.theme
          : fallbackTheme,
    };
  } catch {
    return { palette: 'warm', theme: fallbackTheme };
  }
}

export function DesignWorkshopPage({
  section,
  appliedTocVariant,
  onApplyTocVariant,
  onNavigate,
}: DesignWorkshopPageProps) {
  const siteResolvedTheme = useResolvedTheme();
  const [sandboxPrefs, setSandboxPrefs] = useState<{
    palette: VisualPaletteId;
    theme: ResolvedTheme;
  }>(() => loadStoredSandboxPrefs(siteResolvedTheme));

  const [effectsConfig, setEffectsConfig] = useState<
    Record<EffectTrackId, EffectTrackConfig>
  >(() => loadEffectsConfig());
  const [activeTrackId, setActiveTrackId] =
    useState<EffectTrackId>('organic-texture');
  const [decisionLog, setDecisionLog] = useState<DecisionLogEntry[]>(() =>
    loadDecisionLog(),
  );
  const [experiments, setExperiments] = useState<StudioExperiment[]>(() =>
    loadExperiments(),
  );
  const [focusedExperimentId, setFocusedExperimentId] = useState<string | null>(
    null,
  );
  const [inspectedComponent, setInspectedComponent] =
    useState<InspectedComponentSummary | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [workbenchState, setWorkbenchState] = useState<WorkbenchState>(() =>
    loadWorkbenchState(),
  );
  const [workbenchMode, setWorkbenchMode] = useState<WorkbenchMode>('browse');
  const [archiveDrawerOpen, setArchiveDrawerOpen] = useState(false);
  const [flyingCards, setFlyingCards] = useState<FlyingArchiveCard[]>([]);
  const [archiveBump, setArchiveBump] = useState(false);

  const archiveButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const mobileDrawerCloseRef = useRef<HTMLButtonElement | null>(null);
  const previousSectionRef = useRef<DesignWorkshopSection>(section);

  useEffect(() => {
    if (previousSectionRef.current !== section) {
      previousSectionRef.current = section;
      scrollToTop('auto');
      setMobileNavOpen(false);
      if (section !== 'components') {
        setInspectedComponent(null);
      }
    }
  }, [section]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      mobileDrawerCloseRef.current?.focus();
    }, 20);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileNavOpen(false);
        mobileMenuTriggerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        WORKSHOP_SANDBOX_STORAGE_KEY,
        JSON.stringify(sandboxPrefs),
      );
    } catch {
      // Ignore storage quota restrictions
    }
  }, [sandboxPrefs]);

  useEffect(() => {
    saveEffectsConfig(effectsConfig);
  }, [effectsConfig]);

  useEffect(() => {
    saveDecisionLog(decisionLog);
  }, [decisionLog]);

  useEffect(() => {
    saveExperiments(experiments);
  }, [experiments]);

  useEffect(() => {
    saveWorkbenchState(workbenchState);
  }, [workbenchState]);

  const handleUpdateWorkbenchState = useCallback(
    (updater: (prev: WorkbenchState) => WorkbenchState) => {
      setWorkbenchState((prev) => updater(prev));
    },
    [],
  );

  const handleArchiveSpecimens = useCallback(
    (ids: readonly string[], origins: readonly ArchiveOriginRect[]) => {
      if (ids.length === 0) return;
      playTick();

      const targetRect = archiveButtonRef.current?.getBoundingClientRect();
      if (targetRect && origins.length > 0) {
        const toX = targetRect.left + targetRect.width / 2;
        const toY = targetRect.top + targetRect.height / 2;
        const now = Date.now();
        const flights: FlyingArchiveCard[] = origins.slice(0, 6).map((orig, idx) => ({
          id: `${orig.id}-${now}-${idx}`,
          title: orig.title,
          fromX: orig.rect.left,
          fromY: orig.rect.top,
          fromWidth: Math.min(orig.rect.width, 280),
          fromHeight: Math.min(orig.rect.height, 140),
          toX,
          toY,
        }));
        setFlyingCards((prev) => [...prev, ...flights]);
        window.setTimeout(() => {
          setFlyingCards((prev) =>
            prev.filter((item) => !flights.some((f) => f.id === item.id)),
          );
        }, 520);
      }

      setArchiveBump(true);
      window.setTimeout(() => setArchiveBump(false), 380);

      setWorkbenchState((prev) => archiveSpecimens(prev, ids));
      showToast({
        message:
          ids.length === 1
            ? 'Moved to Archive (non-destructive)'
            : `Moved ${ids.length} specimens to Archive`,
        tone: 'info',
        durationMs: 2400,
      });
    },
    [],
  );

  const handleOpenSpecimenDetail = useCallback(
    (specimen: WorkbenchSpecimen) => {
      onNavigate(specimen.detailPath);
    },
    [onNavigate],
  );

  const archivedSpecimens = (() => {
    if (workbenchState.archivedIds.length === 0) return [];
    const all = getAllWorkbenchSpecimens(workbenchState);
    const map = new Map(all.map((s) => [s.id, s]));
    return workbenchState.archivedIds
      .map((id) => map.get(id))
      .filter((s): s is WorkbenchSpecimen => Boolean(s));
  })();

  const handleUpdateTrackConfig = useCallback(
    (trackId: EffectTrackId, next: EffectTrackConfig) => {
      setEffectsConfig((prev) => ({ ...prev, [trackId]: next }));
    },
    [],
  );

  const handleResetTrackConfig = useCallback((trackId: EffectTrackId) => {
    const defaults = createDefaultEffectsConfig();
    const trackDef = EFFECT_TRACKS.find((t) => t.id === trackId);
    if (!trackDef) return;
    setEffectsConfig((prev) => ({
      ...prev,
      [trackId]: defaults[trackId],
    }));
  }, []);

  const handleLogDecision = useCallback(
    (payload: {
      subjectType: 'effect-track' | 'palette' | 'appearance' | 'toc' | 'experiment';
      subjectId: string;
      trackId?: EffectTrackId;
      experimentId?: string;
      title: string;
      variantLabel: string;
      status: DecisionStatus;
      parameters: Record<string, string | number | boolean>;
      rationale: string;
    }) => {
      let syncedDecisionId: string | null = null;
      setDecisionLog((prev) => {
        const next = upsertDecisionEntry(prev, {
          ...payload,
          paletteContext: sandboxPrefs.palette,
          themeContext: sandboxPrefs.theme,
        });
        const matched = next.find(
          (entry) =>
            entry.subjectType === payload.subjectType &&
            entry.subjectId === payload.subjectId &&
            entry.variantLabel === payload.variantLabel &&
            entry.paletteContext === sandboxPrefs.palette &&
            entry.themeContext === sandboxPrefs.theme,
        );
        syncedDecisionId = matched?.id ?? next[0]?.id ?? null;
        return next;
      });
      if (payload.experimentId && syncedDecisionId) {
        const decId = syncedDecisionId;
        setExperiments((prev) =>
          linkExperimentToDecision(prev, payload.experimentId!, decId),
        );
      }
    },
    [sandboxPrefs.palette, sandboxPrefs.theme],
  );

  const handleSendExperimentToDecisionLog = useCallback(
    (payload: {
      experimentId: string;
      title: string;
      variantLabel: string;
      status: DecisionStatus;
      parameters: Record<string, string | number | boolean>;
      rationale: string;
    }) => {
      const nextEntries = upsertDecisionEntry(decisionLog, {
        subjectType: 'experiment',
        subjectId: payload.experimentId,
        experimentId: payload.experimentId,
        title: payload.title,
        variantLabel: payload.variantLabel,
        status: payload.status,
        parameters: payload.parameters,
        rationale: payload.rationale,
        paletteContext: sandboxPrefs.palette,
        themeContext: sandboxPrefs.theme,
      });
      setDecisionLog(nextEntries);
      const linked = nextEntries.find(
        (entry) =>
          entry.experimentId === payload.experimentId &&
          entry.variantLabel === payload.variantLabel &&
          entry.paletteContext === sandboxPrefs.palette &&
          entry.themeContext === sandboxPrefs.theme,
      );
      if (linked) {
        setExperiments((prev) =>
          linkExperimentToDecision(prev, payload.experimentId, linked.id),
        );
      }
    },
    [decisionLog, sandboxPrefs.palette, sandboxPrefs.theme],
  );

  const handleRevisitExperiment = useCallback(
    (experimentId: string) => {
      setFocusedExperimentId(experimentId);
      onNavigate('/design-system/experiments');
    },
    [onNavigate],
  );

  const handleUpdateDecisionStatus = useCallback(
    (id: string, status: DecisionStatus) => {
      const nowIso = new Date().toISOString();
      setDecisionLog((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, status, updatedAt: nowIso } : entry,
        ),
      );
    },
    [],
  );

  const handleUpdateDecisionRationale = useCallback(
    (id: string, rationale: string) => {
      const nowIso = new Date().toISOString();
      setDecisionLog((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, rationale, updatedAt: nowIso } : entry,
        ),
      );
    },
    [],
  );

  const handleDeleteDecision = useCallback((id: string) => {
    setDecisionLog((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const handleImportDecisions = useCallback((imported: DecisionLogEntry[]) => {
    setDecisionLog(imported);
  }, []);

  const handlePromoteApproved = useCallback(() => {
    setDecisionLog((prev) => promoteApprovedDecisions(prev).nextEntries);
  }, []);

  const handleRevisitEffectTrack = useCallback(
    (trackId: EffectTrackId) => {
      setActiveTrackId(trackId);
      onNavigate('/design-system/effects');
    },
    [onNavigate],
  );

  const activeDest = getStudioDestination(section);

  const handleNavClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    path: string,
    isCurrent: boolean,
  ) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    setMobileNavOpen(false);
    if (!isCurrent) {
      playTick();
      onNavigate(path);
    }
  };

  const renderSidebarNavigation = (isMobileDrawer: boolean) => (
    <div className="flex h-full flex-col">
      <div
        className={`border-b border-[var(--apple-separator-subtle)] px-5 ${
          isMobileDrawer ? 'pb-4 pt-4' : 'pb-4 pt-5'
        }`}
      >
        <a
          href="/"
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            setMobileNavOpen(false);
            onNavigate('/');
          }}
          className="apple-link inline-flex items-center gap-1 text-[12px] font-medium text-[var(--apple-label-tertiary)] transition-colors hover:text-[var(--apple-label-primary)]"
        >
          <ChevronLeft size={12} strokeWidth={2} aria-hidden="true" />
          <span>Portfolio</span>
        </a>
        <p className="font-display mt-2 text-[15.5px] font-semibold tracking-[-0.02em] text-[var(--apple-label-primary)]">
          Portfolio Studio
        </p>
      </div>

      <nav
        aria-label={
          isMobileDrawer
            ? 'Design Studio mobile navigation'
            : 'Design Studio navigation'
        }
        className={`flex-1 overflow-y-auto px-3.5 ${
          isMobileDrawer ? 'space-y-6 py-5' : 'space-y-5 py-5'
        }`}
      >
        {STUDIO_NAV_GROUPS.map((group) => (
          <div key={group.id}>
            <p className="mb-1.5 px-2.5 text-[11px] font-medium tracking-[-0.005em] text-[var(--apple-label-tertiary)]">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = section === item.id;
                return (
                  <li key={item.id}>
                    <a
                      href={item.path}
                      onClick={(e) => handleNavClick(e, item.path, isActive)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`apple-link flex items-center justify-between gap-2 rounded-[9px] px-2.5 text-[13.5px] tracking-[-0.01em] transition-colors ${
                        isMobileDrawer ? 'min-h-[44px] text-[14.5px]' : 'min-h-[32px]'
                      } ${
                        isActive
                          ? 'bg-[var(--apple-control-tonal)] font-semibold text-[var(--apple-label-primary)]'
                          : 'font-normal text-[var(--apple-label-secondary)] hover:bg-[var(--apple-control-tonal)]/50 hover:text-[var(--apple-label-primary)]'
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      {item.id === 'experiments' && experiments.length > 0 && (
                        <span className="shrink-0 tabular-nums text-[11px] font-normal text-[var(--apple-label-tertiary)]">
                          {experiments.length}
                        </span>
                      )}
                      {item.id === 'decisions' && decisionLog.length > 0 && (
                        <span className="shrink-0 tabular-nums text-[11px] font-normal text-[var(--apple-label-tertiary)]">
                          {decisionLog.length}
                        </span>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-52px)] bg-[var(--apple-bg)] text-[var(--apple-label-primary)]">
      {/* Mobile / Tablet Sticky Studio Bar (< lg) */}
      <div className="editorial-nav-surface sticky top-[52px] z-30 border-b border-[var(--apple-separator)] lg:hidden">
        <div className="flex h-[48px] items-center justify-between gap-2 px-3 sm:px-6">
          <button
            ref={mobileMenuTriggerRef}
            type="button"
            onClick={() => {
              playTick();
              setMobileNavOpen(true);
            }}
            aria-expanded={mobileNavOpen}
            aria-controls="studio-mobile-drawer"
            className="apple-link inline-flex min-h-[44px] items-center gap-2 rounded-[10px] px-2 text-[13.5px] font-medium text-[var(--apple-label-primary)]"
          >
            <PanelLeft size={16} strokeWidth={1.75} aria-hidden="true" className="text-[var(--apple-link)]" />
            <span>Menu</span>
          </button>

          <p className="min-w-0 truncate text-[13px] text-[var(--apple-label-secondary)]">
            <span className="text-[var(--apple-label-tertiary)]">
              {activeDest.groupLabel} /{' '}
            </span>
            <span className="font-medium text-[var(--apple-label-primary)]">
              {activeDest.label}
            </span>
          </p>

          <span className="w-11 shrink-0" aria-hidden="true" />
        </div>
      </div>

      {/* Mobile / Tablet Slide-Over Studio Drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: EASE_APPLE }}
              onClick={() => {
                setMobileNavOpen(false);
                mobileMenuTriggerRef.current?.focus();
              }}
              aria-hidden="true"
              className="fixed inset-0 bg-black/35 backdrop-blur-[2px]"
            />

            <motion.div
              id="studio-mobile-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Design Studio navigation"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.26, ease: EASE_APPLE }}
              className="fixed inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col border-r border-[var(--apple-separator)] bg-[var(--apple-bg)] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[var(--apple-separator-subtle)] px-5 py-2">
                <span className="text-[12px] font-medium text-[var(--apple-label-tertiary)]">
                  Studio Navigation
                </span>
                <button
                  ref={mobileDrawerCloseRef}
                  type="button"
                  onClick={() => {
                    playTick();
                    setMobileNavOpen(false);
                    mobileMenuTriggerRef.current?.focus();
                  }}
                  aria-label="Close Design Studio navigation"
                  className="apple-btn-icon h-11 w-11 text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]"
                >
                  <X size={17} strokeWidth={1.75} aria-hidden="true" />
                </button>
              </div>
              <div className="min-h-0 flex-1">
                {renderSidebarNavigation(true)}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Persistent Two-Column Studio Workspace */}
      <div className="flex min-h-[calc(100vh-52px)]">
        <aside
          aria-label="Design Studio sidebar"
          className="sticky top-[52px] hidden h-[calc(100vh-52px)] w-[248px] shrink-0 border-r border-[var(--apple-separator-subtle)] bg-[var(--apple-bg)] lg:block"
        >
          {renderSidebarNavigation(false)}
        </aside>

        {/* Main Workspace Canvas */}
        <div className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-[1280px] px-5 py-8 sm:px-10 sm:py-11">
            {/* Clean Page Header (streamlined into breadcrumb + sandbox bar when inspecting a component detail page) */}
            <header
              className={`border-b border-[var(--apple-separator-subtle)] ${
                section === 'components' && inspectedComponent ? 'pb-5' : 'pb-7'
              }`}
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div className="min-w-0">
                  <nav
                    aria-label="Studio breadcrumb"
                    className="flex flex-wrap items-center gap-1.5 text-[12px] text-[var(--apple-label-tertiary)]"
                  >
                    {section === 'overview' ? (
                      <span>Studio</span>
                    ) : (
                      <a
                        href="/design-system"
                        onClick={(e) => handleNavClick(e, '/design-system', false)}
                        className="apple-link hover:text-[var(--apple-label-primary)] hover:underline"
                      >
                        Studio
                      </a>
                    )}
                    <span aria-hidden="true">/</span>
                    <span>{activeDest.groupLabel}</span>
                    {section !== 'overview' && (
                      <>
                        <span aria-hidden="true">/</span>
                        {section === 'components' && inspectedComponent ? (
                          <>
                            <a
                              href="/design-system/components"
                              onClick={(e) => {
                                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                                e.preventDefault();
                                playTick();
                                window.history.pushState({}, '', '/design-system/components');
                                window.dispatchEvent(new PopStateEvent('popstate'));
                              }}
                              className="apple-link hover:text-[var(--apple-label-primary)] hover:underline"
                            >
                              {activeDest.label}
                            </a>
                            <span aria-hidden="true">/</span>
                            <span
                              aria-current="page"
                              className="font-medium text-[var(--apple-label-secondary)]"
                            >
                              {inspectedComponent.name}
                            </span>
                          </>
                        ) : (
                          <span
                            aria-current="page"
                            className="font-medium text-[var(--apple-label-secondary)]"
                          >
                            {activeDest.label}
                          </span>
                        )}
                      </>
                    )}
                  </nav>

                  {!(section === 'components' && inspectedComponent) && (
                    <>
                      <h1 className="type-title-1 mt-2 text-[var(--apple-label-primary)]">
                        {activeDest.label}
                      </h1>
                      <p className="mt-2 max-w-[62ch] text-[15px] leading-[1.55] text-[var(--apple-label-secondary)]">
                        {activeDest.description}
                      </p>
                    </>
                  )}
                </div>

                {/* Unobtrusive Sandbox Preview Switcher + Persistent Archive Drawer Trigger */}
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {activeDest.supportsSandboxContext && (
                    <>
                      <div
                        role="group"
                        aria-label="Sandbox palette preview"
                        className="apple-segmented"
                      >
                        {(
                          [
                            { id: 'cool', label: 'Cool' },
                            { id: 'warm', label: 'Warm' },
                          ] as const
                        ).map((opt) => {
                          const active = sandboxPrefs.palette === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              aria-pressed={active}
                              onClick={() => {
                                playTick();
                                setSandboxPrefs((prev) => ({
                                  ...prev,
                                  palette: opt.id,
                                }));
                              }}
                              className={`apple-segmented-item !min-h-[30px] whitespace-nowrap px-3 py-1 text-[12px] ${
                                active
                                  ? 'text-[var(--apple-label-primary)]'
                                  : 'text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                              }`}
                            >
                              {active && (
                                <motion.span
                                  layoutId="ws-sandbox-palette-thumb"
                                  transition={SPRING_SEGMENT}
                                  className="apple-pill-shadow absolute inset-0 rounded-full bg-[var(--apple-control-thumb)]"
                                />
                              )}
                              <span className="relative z-10">{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div
                        role="group"
                        aria-label="Sandbox theme preview"
                        className="apple-segmented"
                      >
                        {(
                          [
                            { id: 'light', label: 'Light', icon: Sun },
                            { id: 'dark', label: 'Dark', icon: Moon },
                          ] as const
                        ).map((opt) => {
                          const active = sandboxPrefs.theme === opt.id;
                          const Icon = opt.icon;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              aria-pressed={active}
                              onClick={() => {
                                playTick();
                                setSandboxPrefs((prev) => ({
                                  ...prev,
                                  theme: opt.id,
                                }));
                              }}
                              className={`apple-segmented-item !min-h-[30px] whitespace-nowrap px-2.5 py-1 text-[12px] ${
                                active
                                  ? 'text-[var(--apple-label-primary)]'
                                  : 'text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                              }`}
                            >
                              {active && (
                                <motion.span
                                  layoutId="ws-sandbox-theme-thumb"
                                  transition={SPRING_SEGMENT}
                                  className="apple-pill-shadow absolute inset-0 rounded-full bg-[var(--apple-control-thumb)]"
                                />
                              )}
                              <span className="relative z-10 inline-flex items-center gap-1.5">
                                <Icon size={12} strokeWidth={2} aria-hidden="true" />
                                <span>{opt.label}</span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}

                  <motion.button
                    ref={archiveButtonRef}
                    type="button"
                    aria-expanded={archiveDrawerOpen}
                    aria-label={`Open Archive drawer (${archivedSpecimens.length} archived)`}
                    animate={
                      archiveBump
                        ? { scale: [1, 1.09, 1] }
                        : { scale: 1 }
                    }
                    transition={{ duration: 0.34, ease: EASE_APPLE }}
                    onClick={() => {
                      playTick();
                      setArchiveDrawerOpen(true);
                    }}
                    className={`inline-flex min-h-[34px] items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-[12px] font-medium transition-colors ${
                      archivedSpecimens.length > 0
                        ? 'border-[var(--apple-separator-strong)] bg-[var(--apple-surface-elevated)] text-[var(--apple-label-primary)] shadow-2xs hover:border-[var(--apple-blue)]'
                        : 'border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)]/70 text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                    }`}
                  >
                    <span>Archive</span>
                    <span
                      className={`tabular-nums text-[11px] font-semibold ${
                        archivedSpecimens.length > 0
                          ? 'text-[var(--apple-blue)]'
                          : 'text-[var(--apple-label-tertiary)]'
                      }`}
                    >
                      {archivedSpecimens.length}
                    </span>
                  </motion.button>
                </div>
              </div>
            </header>

            {/* Active Workspace Body */}
            <div className="pt-9">
              {section === 'overview' && (
                <StudioOverviewSection
                  sandboxPalette={sandboxPrefs.palette}
                  sandboxTheme={sandboxPrefs.theme}
                  appliedTocVariant={appliedTocVariant}
                  decisionLog={decisionLog}
                  experiments={experiments}
                  workbenchState={workbenchState}
                  workbenchMode={workbenchMode}
                  onWorkbenchModeChange={setWorkbenchMode}
                  onUpdateWorkbenchState={handleUpdateWorkbenchState}
                  onArchiveSpecimens={handleArchiveSpecimens}
                  onOpenSpecimenDetail={handleOpenSpecimenDetail}
                  onNavigate={onNavigate}
                />
              )}

              {(section === 'colour-themes' ||
                section === 'typography' ||
                section === 'spacing-layout' ||
                section === 'surfaces-elevation') && (
                <FoundationsSection
                  view={section}
                  sandboxPalette={sandboxPrefs.palette}
                  sandboxTheme={sandboxPrefs.theme}
                  onChangeSandboxPalette={(palette) =>
                    setSandboxPrefs((prev) => ({ ...prev, palette }))
                  }
                  onChangeSandboxTheme={(theme) =>
                    setSandboxPrefs((prev) => ({ ...prev, theme }))
                  }
                  onLogDecision={handleLogDecision}
                />
              )}

              {(section === 'components' ||
                section === 'interaction-states') && (
                <ComponentsSection
                  view={section}
                  sandboxPalette={sandboxPrefs.palette}
                  sandboxTheme={sandboxPrefs.theme}
                  appliedTocVariant={appliedTocVariant}
                  experimentsCount={experiments.length}
                  workbenchState={workbenchState}
                  workbenchMode={workbenchMode}
                  onWorkbenchModeChange={setWorkbenchMode}
                  onUpdateWorkbenchState={handleUpdateWorkbenchState}
                  onArchiveSpecimens={handleArchiveSpecimens}
                  onNavigate={onNavigate}
                  onInspectComponentChange={setInspectedComponent}
                />
              )}

              {section === 'patterns' && (
                <PatternsSection
                  sandboxPalette={sandboxPrefs.palette}
                  sandboxTheme={sandboxPrefs.theme}
                />
              )}

              {section === 'page-templates' && (
                <PageTemplatesSection
                  sandboxPalette={sandboxPrefs.palette}
                  sandboxTheme={sandboxPrefs.theme}
                />
              )}

              {(section === 'motion' || section === 'icons-sound') && (
                <MotionIconsSoundSection
                  view={section}
                  sandboxPalette={sandboxPrefs.palette}
                  sandboxTheme={sandboxPrefs.theme}
                />
              )}

              {section === 'effects' && (
                <EffectsLabSection
                  sandboxPalette={sandboxPrefs.palette}
                  sandboxTheme={sandboxPrefs.theme}
                  activeTrackId={activeTrackId}
                  onSelectTrackId={setActiveTrackId}
                  effectsConfig={effectsConfig}
                  onUpdateTrackConfig={handleUpdateTrackConfig}
                  onResetTrackConfig={handleResetTrackConfig}
                  onLogDecision={handleLogDecision}
                  onNavigate={onNavigate}
                />
              )}

              {section === 'toc-lab' && (
                <TocLabPage
                  embedded
                  appliedTocVariant={appliedTocVariant}
                  onApplyTocVariant={(next) => {
                    onApplyTocVariant(next);
                    playSuccessChime();
                    handleLogDecision({
                      subjectType: 'toc',
                      subjectId: 'case-study-toc',
                      title: 'Case Study Table of Contents',
                      variantLabel: next,
                      status: 'promoted',
                      parameters: { tocVariant: next },
                      rationale: `Applied ${next} architecture from internal TOC Lab.`,
                    });
                  }}
                  onNavigate={onNavigate}
                />
              )}

              {section === 'experiments' && (
                <ExperimentsSection
                  experiments={experiments}
                  sandboxPalette={sandboxPrefs.palette}
                  sandboxTheme={sandboxPrefs.theme}
                  focusedExperimentId={focusedExperimentId}
                  decisionLog={decisionLog}
                  onUpdateExperiments={setExperiments}
                  onSendToDecisionLog={handleSendExperimentToDecisionLog}
                  onNavigateToDecisions={() => onNavigate('/design-system/decisions')}
                />
              )}

              {section === 'documentation' && (
                <DocumentationHubSection onNavigate={onNavigate} />
              )}

              {section === 'decisions' && (
                <DecisionLogSection
                  entries={decisionLog}
                  onUpdateStatus={handleUpdateDecisionStatus}
                  onUpdateRationale={handleUpdateDecisionRationale}
                  onDeleteEntry={handleDeleteDecision}
                  onImportEntries={handleImportDecisions}
                  onRevisitEffectTrack={handleRevisitEffectTrack}
                  onRevisitExperiment={handleRevisitExperiment}
                  onPromoteApproved={handlePromoteApproved}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Fly-to-Archive Animation Layer */}
      <FlyToArchiveOverlay cards={flyingCards} />

      {/* Persistent Right-Side Archive Drawer */}
      <WorkbenchArchiveDrawer
        open={archiveDrawerOpen}
        onClose={() => setArchiveDrawerOpen(false)}
        archivedSpecimens={archivedSpecimens}
        sandboxPalette={sandboxPrefs.palette}
        sandboxTheme={sandboxPrefs.theme}
        appliedTocVariant={appliedTocVariant}
        experimentsCount={experiments.length}
        onRestoreOne={(id) => {
          setWorkbenchState((prev) => restoreSpecimens(prev, [id]));
          showToast({
            message: 'Restored specimen to main canvas',
            tone: 'success',
            durationMs: 2200,
          });
        }}
        onRestoreBulk={(ids) => {
          setWorkbenchState((prev) => restoreSpecimens(prev, ids));
          showToast({
            message: `Restored ${ids.length} specimens to main canvas`,
            tone: 'success',
            durationMs: 2400,
          });
        }}
        onRestoreAll={() => {
          setWorkbenchState((prev) => restoreAllArchived(prev));
          showToast({
            message: 'Restored all archived specimens',
            tone: 'success',
            durationMs: 2400,
          });
        }}
        onOpenDetail={(spec) => {
          setArchiveDrawerOpen(false);
          handleOpenSpecimenDetail(spec);
        }}
      />
    </div>
  );
}
