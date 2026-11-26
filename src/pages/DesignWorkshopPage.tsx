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
import { FoundationsSection } from '../components/workshop/FoundationsSection';
import { ComponentsSection } from '../components/workshop/ComponentsSection';
import { MotionIconsSoundSection } from '../components/workshop/MotionIconsSoundSection';
import { EffectsLabSection } from '../components/workshop/EffectsLabSection';
import { DecisionLogSection } from '../components/workshop/DecisionLogSection';
import { StudioOverviewSection } from '../components/workshop/StudioOverviewSection';
import { StudioPlannedSection } from '../components/workshop/StudioPlannedSection';
import { TocLabPage } from './TocLabPage';
import {
  SFChevronLeft,
  SFMoon,
  SFSidebarLeft,
  SFSunMax,
  SFXmark,
} from '../components/SFSymbols';

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
    return { palette: 'cool', theme: fallbackTheme };
  }
  try {
    const raw = window.localStorage.getItem(WORKSHOP_SANDBOX_STORAGE_KEY);
    if (!raw) return { palette: 'cool', theme: fallbackTheme };
    const parsed = JSON.parse(raw) as { palette?: unknown; theme?: unknown };
    return {
      palette: parsed.palette === 'warm' ? 'warm' : 'cool',
      theme:
        parsed.theme === 'dark' || parsed.theme === 'light'
          ? parsed.theme
          : fallbackTheme,
    };
  } catch {
    return { palette: 'cool', theme: fallbackTheme };
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const mobileMenuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const mobileDrawerCloseRef = useRef<HTMLButtonElement | null>(null);
  const previousSectionRef = useRef<DesignWorkshopSection>(section);

  // Scroll workspace back to top smoothly when switching internal Studio sections
  // (DesignWorkshopPage remains persistently mounted so the sidebar never flickers)
  useEffect(() => {
    if (previousSectionRef.current !== section) {
      previousSectionRef.current = section;
      scrollToTop('auto');
      setMobileNavOpen(false);
    }
  }, [section]);

  // Accessible mobile drawer keyboard Escape, focus management, and scroll lock
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

  // Persist local sandbox palette/theme preview context (isolated to /design-system)
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

  // Persist Effects Lab settings locally (never affects public pages)
  useEffect(() => {
    saveEffectsConfig(effectsConfig);
  }, [effectsConfig]);

  // Persist Decision Log locally (never auto-modifies production CSS)
  useEffect(() => {
    saveDecisionLog(decisionLog);
  }, [decisionLog]);

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
      subjectType: 'effect-track' | 'palette' | 'appearance' | 'toc';
      subjectId: string;
      trackId?: EffectTrackId;
      title: string;
      variantLabel: string;
      status: DecisionStatus;
      parameters: Record<string, string | number | boolean>;
      rationale: string;
    }) => {
      setDecisionLog((prev) =>
        upsertDecisionEntry(prev, {
          ...payload,
          paletteContext: sandboxPrefs.palette,
          themeContext: sandboxPrefs.theme,
        }),
      );
    },
    [sandboxPrefs.palette, sandboxPrefs.theme],
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
  const approvedCount = decisionLog.filter(
    (e) => e.status === 'approved' || e.status === 'promoted',
  ).length;

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
      {/* Sidebar Top Context */}
      <div
        className={`border-b border-[var(--apple-separator-subtle)] px-4 ${
          isMobileDrawer ? 'pb-4 pt-4' : 'pb-3 pt-3.5'
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
          className="apple-link inline-flex items-center gap-1 text-[12px] font-medium text-[var(--apple-link)] hover:underline"
        >
          <SFChevronLeft size={12} />
          <span>Public Portfolio</span>
        </a>
        <div className="mt-2 flex items-baseline justify-between gap-2">
          <p className="font-display text-[15px] font-semibold tracking-[-0.02em] text-[var(--apple-label-primary)]">
            Design Studio
          </p>
          <span className="text-[11px] text-[var(--apple-label-tertiary)]">
            Internal
          </span>
        </div>
      </div>

      {/* Grouped Navigation */}
      <nav
        aria-label={
          isMobileDrawer
            ? 'Design Studio mobile navigation'
            : 'Design Studio navigation'
        }
        className={`flex-1 overflow-y-auto px-3 ${
          isMobileDrawer ? 'space-y-5 py-4' : 'space-y-3.5 py-3.5'
        }`}
      >
        {STUDIO_NAV_GROUPS.map((group) => (
          <div key={group.id}>
            <p className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--apple-label-tertiary)]">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = section === item.id;
                const isPlanned = item.status === 'planned';
                return (
                  <li key={item.id}>
                    <a
                      href={item.path}
                      onClick={(e) => handleNavClick(e, item.path, isActive)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`apple-link flex items-center justify-between gap-2 rounded-[8px] px-2.5 text-[13px] tracking-[-0.01em] transition-colors ${
                        isMobileDrawer ? 'min-h-[44px] text-[14px]' : 'min-h-[29px]'
                      } ${
                        isActive
                          ? 'bg-[var(--apple-control-tonal)] font-semibold text-[var(--apple-label-primary)]'
                          : isPlanned
                            ? 'font-normal text-[var(--apple-label-tertiary)] hover:bg-[var(--apple-control-tonal)]/55 hover:text-[var(--apple-label-secondary)]'
                            : 'font-normal text-[var(--apple-label-secondary)] hover:bg-[var(--apple-control-tonal)]/60 hover:text-[var(--apple-label-primary)]'
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      {isPlanned && (
                        <span className="shrink-0 text-[10.5px] font-normal text-[var(--apple-label-tertiary)]">
                          Planned
                        </span>
                      )}
                      {item.id === 'decisions' && decisionLog.length > 0 && (
                        <span className="shrink-0 tabular-nums text-[10.5px] font-normal text-[var(--apple-label-tertiary)]">
                          {decisionLog.length}
                          {approvedCount > 0 ? ` · ${approvedCount}✓` : ''}
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
      <div className="sticky top-[52px] z-30 border-b border-[var(--apple-separator)] bg-[var(--apple-surface-glass)] backdrop-blur-xl backdrop-saturate-[180%] lg:hidden">
        <div className="flex h-[48px] items-center justify-between gap-2 px-3 sm:px-5">
          <button
            ref={mobileMenuTriggerRef}
            type="button"
            onClick={() => {
              playTick();
              setMobileNavOpen(true);
            }}
            aria-expanded={mobileNavOpen}
            aria-controls="studio-mobile-drawer"
            className="apple-link inline-flex min-h-[44px] items-center gap-2 rounded-[10px] px-2 text-[13px] font-medium text-[var(--apple-label-primary)]"
          >
            <SFSidebarLeft size={16} className="text-[var(--apple-link)]" />
            <span>Studio</span>
          </button>

          <p className="min-w-0 truncate text-[12.5px] text-[var(--apple-label-secondary)]">
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
              className="fixed inset-y-0 left-0 flex w-[288px] max-w-[85vw] flex-col border-r border-[var(--apple-separator)] bg-[var(--apple-bg)] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[var(--apple-separator-subtle)] px-4 py-2">
                <span className="text-[12px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]">
                  Navigation
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
                  <SFXmark size={17} />
                </button>
              </div>
              <div className="min-h-0 flex-1">
                {renderSidebarNavigation(true)}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Persistent Desktop Two-Column Editorial Workspace Shell */}
      <div className="flex min-h-[calc(100vh-52px)]">
        <aside
          aria-label="Design Studio sidebar"
          className="sticky top-[52px] hidden h-[calc(100vh-52px)] w-[264px] shrink-0 border-r border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)]/55 lg:block"
        >
          {renderSidebarNavigation(false)}
        </aside>

        {/* Main Workspace Content Pane */}
        <div className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-[1040px] px-5 py-8 sm:px-10 sm:py-12">
            {/* Editorial Workspace Page Header */}
            <header className="border-b border-[var(--apple-separator)] pb-8">
              {/* Breadcrumb Hierarchy */}
              <nav
                aria-label="Studio breadcrumb"
                className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-[var(--apple-label-tertiary)]"
              >
                {section === 'overview' ? (
                  <span className="font-medium text-[var(--apple-label-secondary)]">
                    Design Studio
                  </span>
                ) : (
                  <a
                    href="/design-system"
                    onClick={(e) => handleNavClick(e, '/design-system', false)}
                    className="apple-link text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)] hover:underline"
                  >
                    Design Studio
                  </a>
                )}
                <span aria-hidden="true">/</span>
                <span>{activeDest.groupLabel}</span>
                <span aria-hidden="true">/</span>
                <span
                  aria-current="page"
                  className="font-medium text-[var(--apple-label-primary)]"
                >
                  {activeDest.label}
                </span>
              </nav>

              <div className="mt-4 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                <div className="min-w-0">
                  <h1 className="type-title-1 text-[var(--apple-label-primary)]">
                    {activeDest.label}
                  </h1>
                  <p className="type-callout measure-prose mt-2 text-[var(--apple-label-secondary)]">
                    {activeDest.description}
                  </p>
                  {activeDest.status === 'planned' ? (
                    <p className="mt-2 text-[12px] font-medium text-[var(--apple-label-tertiary)]">
                      Planned · Cycle 2 Stage 2+
                    </p>
                  ) : activeDest.migratedModules ? (
                    <p className="mt-2 text-[12px] text-[var(--apple-label-tertiary)]">
                      {activeDest.migratedModules}
                    </p>
                  ) : null}
                </div>

                {/* Isolated Sandbox Preview Controls */}
                {activeDest.supportsSandboxContext && (
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <div
                      role="group"
                      aria-label="Sandbox palette preview"
                      className="apple-segmented"
                    >
                      {(
                        [
                          { id: 'cool', label: 'Cool Neutral' },
                          { id: 'warm', label: 'Warm Neutral' },
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
                            className={`apple-segmented-item !min-h-[32px] px-3 py-1 text-[12.5px] ${
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
                          { id: 'light', label: 'Light', icon: SFSunMax },
                          { id: 'dark', label: 'Dark', icon: SFMoon },
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
                            className={`apple-segmented-item !min-h-[32px] px-3 py-1 text-[12.5px] ${
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
                              <Icon size={13} />
                              <span>{opt.label}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </header>

            {/* Active Workspace Body */}
            <div className="pt-10">
              {section === 'overview' && (
                <StudioOverviewSection
                  sandboxPalette={sandboxPrefs.palette}
                  sandboxTheme={sandboxPrefs.theme}
                  appliedTocVariant={appliedTocVariant}
                  decisionLog={decisionLog}
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
                  onNavigate={onNavigate}
                />
              )}

              {(section === 'motion' || section === 'icons-sound') && (
                <MotionIconsSoundSection view={section} />
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

              {section === 'decisions' && (
                <DecisionLogSection
                  entries={decisionLog}
                  onUpdateStatus={handleUpdateDecisionStatus}
                  onUpdateRationale={handleUpdateDecisionRationale}
                  onDeleteEntry={handleDeleteDecision}
                  onImportEntries={handleImportDecisions}
                  onRevisitEffectTrack={handleRevisitEffectTrack}
                  onPromoteApproved={handlePromoteApproved}
                />
              )}

              {(section === 'patterns' ||
                section === 'page-templates' ||
                section === 'experiments' ||
                section === 'documentation') && (
                <StudioPlannedSection
                  destination={activeDest}
                  onNavigate={onNavigate}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
