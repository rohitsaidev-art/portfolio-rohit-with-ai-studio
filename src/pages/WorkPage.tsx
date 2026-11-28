import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { PROJECTS, type CaseStudyProject } from '../data/projects';
import { ProjectCard } from '../components/ProjectCard';
import {
  AnimatedAllWorkIcon,
  AnimatedBrandIdentityIcon,
  AnimatedMobileAppIcon,
  AnimatedSaasAppIcon,
  AnimatedSortIcon,
  AnimatedWebDesignIcon,
} from '../components/icons/AnimatedLucide';
import {
  queryProjects,
  type ProjectFilter,
  type ProjectSort,
} from '../utils/portfolio';
import { playTick } from '../utils/soundEngine';

interface WorkPageProps {
  onNavigate: (path: string) => void;
}

type WorkLayoutMode = 'masonry' | 'grid';

interface FilterOption {
  id: ProjectFilter;
  label: string;
  Icon: React.ComponentType<{
    size?: number;
    active?: boolean;
    strokeWidth?: number;
    className?: string;
  }>;
}

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'all', label: 'All Work', Icon: AnimatedAllWorkIcon },
  { id: 'web-design', label: 'Web Design', Icon: AnimatedWebDesignIcon },
  { id: 'saas', label: 'Web App', Icon: AnimatedSaasAppIcon },
  { id: 'mobile-app', label: 'Mobile App', Icon: AnimatedMobileAppIcon },
  { id: 'brand-identity', label: 'Brand Identity', Icon: AnimatedBrandIdentityIcon },
];

const SORT_OPTIONS: { id: ProjectSort; label: string }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'newest', label: 'Newest' },
  { id: 'alphabetical', label: 'A–Z' },
];

const EASE_OUT_STRONG = [0.23, 1, 0.32, 1] as const;

/**
 * Editorial masonry aspect cadence for 2-column gallery rhythm.
 * Keeps adjacent columns visually offset while balancing total vertical mass.
 */
const MASONRY_ASPECT_PATTERN = [
  'aspect-[4/4.25]',
  'aspect-[16/11.4]',
  'aspect-[16/11.8]',
  'aspect-[4/4.35]',
  'aspect-[16/11.4]',
  'aspect-[4/3.65]',
] as const;

function getMasonryAspectClass(index: number, totalCount: number): string {
  if (totalCount === 1) return 'aspect-[16/10]';
  if (totalCount === 2) {
    return index === 0 ? 'aspect-[4/4.1]' : 'aspect-[16/11.4]';
  }
  return MASONRY_ASPECT_PATTERN[index % MASONRY_ASPECT_PATTERN.length];
}

function MasonryLayoutIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7.5" height="11" rx="2" fill="currentColor" fillOpacity="0.14" />
      <rect x="13.5" y="3" width="7.5" height="7" rx="2" />
      <rect x="13.5" y="13" width="7.5" height="8" rx="2" fill="currentColor" fillOpacity="0.14" />
      <rect x="3" y="17" width="7.5" height="4" rx="1.6" />
    </svg>
  );
}

function UniformGridLayoutIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7.5" height="7.5" rx="2" fill="currentColor" fillOpacity="0.14" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" fill="currentColor" fillOpacity="0.14" />
    </svg>
  );
}

export function WorkPage({ onNavigate }: WorkPageProps) {
  const prefersReducedMotion = useReducedMotion();
  const [activeFilter, setActiveFilter] = useState<ProjectFilter>('all');
  const [hoveredFilter, setHoveredFilter] = useState<ProjectFilter | null>(null);
  const [sortBy, setSortBy] = useState<ProjectSort>('featured');
  const [layoutMode, setLayoutMode] = useState<WorkLayoutMode>('masonry');
  const [sortOpen, setSortOpen] = useState(false);
  const hasInteractedGalleryRef = useRef(false);

  const filterListRef = useRef<HTMLDivElement | null>(null);
  const filterButtonRefs = useRef<Partial<Record<ProjectFilter, HTMLButtonElement | null>>>({});
  const [pillRect, setPillRect] = useState<{
    left: number;
    width: number;
    ready: boolean;
    animate: boolean;
  }>({ left: 0, width: 0, ready: false, animate: false });
  const hasMeasuredRef = useRef(false);

  const sortContainerRef = useRef<HTMLDivElement | null>(null);
  const sortTriggerRef = useRef<HTMLButtonElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  const measureActivePill = useCallback(
    (animateSlide: boolean) => {
      const btn = filterButtonRefs.current[activeFilter];
      if (!btn) return;
      setPillRect({
        left: btn.offsetLeft,
        width: btn.offsetWidth,
        ready: true,
        animate: animateSlide && !prefersReducedMotion,
      });
    },
    [activeFilter, prefersReducedMotion],
  );

  useLayoutEffect(() => {
    measureActivePill(hasMeasuredRef.current);
    hasMeasuredRef.current = true;
  }, [measureActivePill]);

  useEffect(() => {
    const container = filterListRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      measureActivePill(false);
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [measureActivePill]);

  useEffect(() => {
    if (!sortOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (
        sortContainerRef.current &&
        !sortContainerRef.current.contains(event.target as Node)
      ) {
        clearCloseTimer();
        setSortOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        clearCloseTimer();
        setSortOpen(false);
        sortTriggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sortOpen]);

  const isFineHoverPointer = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const handleSortMouseEnter = () => {
    if (!isFineHoverPointer()) return;
    clearCloseTimer();
    setSortOpen(true);
  };

  const handleSortMouseLeave = () => {
    if (!isFineHoverPointer()) return;
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setSortOpen(false);
    }, 120);
  };

  const handleSortBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      clearCloseTimer();
      setSortOpen(false);
    }
  };

  const visibleProjects = useMemo(
    () =>
      queryProjects(PROJECTS, {
        filter: activeFilter,
        searchQuery: '',
        sort: sortBy,
      }),
    [activeFilter, sortBy],
  );

  // Split projects into two balanced masonry columns while preserving horizontal reading order
  const masonryColumns = useMemo(() => {
    const left: { project: CaseStudyProject; index: number }[] = [];
    const right: { project: CaseStudyProject; index: number }[] = [];
    visibleProjects.forEach((project, index) => {
      if (index % 2 === 0) {
        left.push({ project, index });
      } else {
        right.push({ project, index });
      }
    });
    return { left, right };
  }, [visibleProjects]);

  const activeFilterLabel =
    FILTER_OPTIONS.find((opt) => opt.id === activeFilter)?.label ?? 'All Work';
  const activeSortLabel =
    SORT_OPTIONS.find((opt) => opt.id === sortBy)?.label ?? 'Featured';

  const handleResetFilters = () => {
    playTick();
    hasInteractedGalleryRef.current = true;
    setActiveFilter('all');
    setSortBy('featured');
    clearCloseTimer();
    setSortOpen(false);
  };

  const renderAnimatedCard = (
    project: CaseStudyProject,
    index: number,
    mediaClassName: string,
  ) => (
    <motion.div
      key={project.slug}
      initial={
        !hasInteractedGalleryRef.current
          ? false
          : prefersReducedMotion
            ? { opacity: 0 }
            : {
                opacity: 0,
                y: 10,
              }
      }
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={
        prefersReducedMotion
          ? { duration: 0.14, ease: 'easeOut' }
          : {
              duration: 0.28,
              delay: Math.min(index * 0.026, 0.1),
              ease: EASE_OUT_STRONG,
            }
      }
    >
      <ProjectCard
        project={project}
        onNavigate={onNavigate}
        index={index}
        mediaClassName={mediaClassName}
        cardClassName="rounded-[28px]"
        showcaseScale
        disableScrollReveal
        eagerImage
      />
    </motion.div>
  );

  return (
    <div className="bg-[var(--apple-bg)]">
      {/* Work Index Header */}
      <header className="mx-auto max-w-[1240px] px-5 pb-6 pt-12 sm:px-8 sm:pb-8 sm:pt-16">
        <h1 className="type-display measure-title">
          Recent product and interaction studies.
        </h1>

        <p className="type-lead mt-4 max-w-[58ch]">
          Complete collection of product workflows, design systems, enterprise interfaces, and interactive web studies.
        </p>
      </header>

      {/* Complete Filterable & Sortable Archive */}
      <section
        aria-label="Project archive"
        className="bg-transparent pb-16 pt-2 sm:pb-24 sm:pt-4"
      >
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Transparent Category Filter Row with Single Sliding Neutral Pill */}
            <div className="max-w-full overflow-x-auto py-1">
              <div
                ref={filterListRef}
                role="group"
                aria-label="Filter projects by category"
                className="relative inline-flex w-max items-center gap-1 bg-transparent p-0 sm:gap-1.5"
              >
                {/* Sliding neutral pill — no track background, no blue fill */}
                {pillRect.ready && (
                  <motion.span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-0 rounded-full border border-[var(--apple-separator-strong)] bg-[var(--apple-surface-elevated)] shadow-[var(--shadow-apple-pill)]"
                    initial={false}
                    animate={{
                      x: pillRect.left,
                      width: pillRect.width,
                    }}
                    transition={
                      pillRect.animate
                        ? {
                            type: 'spring',
                            stiffness: 460,
                            damping: 36,
                            mass: 0.78,
                          }
                        : { duration: 0 }
                    }
                  />
                )}

                {FILTER_OPTIONS.map((option) => {
                  const isSelected = activeFilter === option.id;
                  const isHovered = hoveredFilter === option.id;
                  const CategoryIcon = option.Icon;
                  return (
                    <button
                      key={option.id}
                      ref={(el) => {
                        filterButtonRefs.current[option.id] = el;
                      }}
                      type="button"
                      aria-pressed={isSelected}
                      onMouseEnter={() => {
                        if (isFineHoverPointer()) {
                          setHoveredFilter(option.id);
                        }
                      }}
                      onMouseLeave={() => {
                        setHoveredFilter((prev) => (prev === option.id ? null : prev));
                      }}
                      onClick={() => {
                        if (activeFilter !== option.id) {
                          playTick();
                          hasInteractedGalleryRef.current = true;
                          setActiveFilter(option.id);
                        }
                      }}
                      className={`relative z-10 inline-flex min-h-[40px] cursor-pointer select-none items-center justify-center rounded-full bg-transparent px-4 py-2 text-[13.5px] font-medium tracking-[-0.012em] transition-[color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--apple-label-primary)] sm:px-4 sm:text-[14px] ${
                        isSelected
                          ? 'text-[var(--apple-label-primary)]'
                          : 'text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                      }`}
                    >
                      <span className="inline-flex items-center gap-2 whitespace-nowrap">
                        <CategoryIcon
                          size={18}
                          strokeWidth={1.75}
                          active={isHovered}
                          className={`shrink-0 transition-colors duration-150 ${
                            isSelected || isHovered
                              ? 'text-[var(--apple-label-primary)]'
                              : 'text-[var(--apple-label-tertiary)]'
                          }`}
                        />
                        <span>{option.label}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Controls: Masonry / Uniform Grid Toggle + Stationary Sort Popover */}
            <div className="flex items-center justify-end gap-2 self-end lg:self-auto">
              {/* Quiet Layout Switcher so Masonry vs Tight Grid can be compared instantly */}
              <div
                role="group"
                aria-label="Layout view"
                className="inline-flex h-10 items-center gap-0.5 rounded-full border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-0.5"
              >
                <button
                  type="button"
                  aria-pressed={layoutMode === 'masonry'}
                  aria-label="Masonry layout"
                  title="Masonry layout"
                  onClick={() => {
                    if (layoutMode !== 'masonry') {
                      playTick();
                      hasInteractedGalleryRef.current = true;
                      setLayoutMode('masonry');
                    }
                  }}
                  className={`inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-[color,background-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.94] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--apple-blue)] ${
                    layoutMode === 'masonry'
                      ? 'bg-[var(--editorial-btn-bg)] text-[var(--editorial-btn-fg)]'
                      : 'text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                  }`}
                >
                  <MasonryLayoutIcon />
                </button>
                <button
                  type="button"
                  aria-pressed={layoutMode === 'grid'}
                  aria-label="Uniform grid layout"
                  title="Uniform grid layout"
                  onClick={() => {
                    if (layoutMode !== 'grid') {
                      playTick();
                      hasInteractedGalleryRef.current = true;
                      setLayoutMode('grid');
                    }
                  }}
                  className={`inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-[color,background-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.94] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--apple-blue)] ${
                    layoutMode === 'grid'
                      ? 'bg-[var(--editorial-btn-bg)] text-[var(--editorial-btn-fg)]'
                      : 'text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                  }`}
                >
                  <UniformGridLayoutIcon />
                </button>
              </div>

              {/* Stationary Trigger + Left-Gliding Sort Popover with Hover Bridge */}
              <div
                ref={sortContainerRef}
                data-expanded={sortOpen ? 'true' : 'false'}
                onMouseEnter={handleSortMouseEnter}
                onMouseLeave={handleSortMouseLeave}
                onFocus={() => {
                  clearCloseTimer();
                  setSortOpen(true);
                }}
                onBlur={handleSortBlur}
                className="work-sort-root relative inline-flex h-10 w-10 shrink-0 items-center justify-end"
              >
                <button
                  ref={sortTriggerRef}
                  type="button"
                  onClick={() => {
                    playTick();
                    clearCloseTimer();
                    setSortOpen((prev) => !prev);
                  }}
                  aria-expanded={sortOpen}
                  aria-controls="work-sort-options"
                  aria-label={`Sort projects (current: ${activeSortLabel})`}
                  title={`Sort: ${activeSortLabel}`}
                  className={`relative z-10 inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border bg-[var(--apple-surface-elevated)] transition-[color,border-color,background-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.95] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--apple-blue)] ${
                    sortOpen
                      ? 'border-[var(--apple-separator-strong)] text-[var(--apple-label-primary)]'
                      : 'border-[var(--apple-separator)] text-[var(--apple-label-secondary)] hover:border-[var(--apple-separator-strong)] hover:text-[var(--apple-label-primary)]'
                  }`}
                >
                  <AnimatedSortIcon
                    size={18}
                    strokeWidth={1.75}
                    active={sortOpen}
                  />
                  {sortBy !== 'featured' && !sortOpen && (
                    <span
                      aria-hidden="true"
                      className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--editorial-accent-warm)]"
                    />
                  )}
                </button>

                <div
                  id="work-sort-options"
                  role="group"
                  aria-label="Sort case studies"
                  aria-hidden={!sortOpen}
                  className="work-sort-popover"
                >
                  {SORT_OPTIONS.map((option) => {
                    const active = sortBy === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        tabIndex={sortOpen ? 0 : -1}
                        aria-pressed={active}
                        onClick={() => {
                          if (sortBy !== option.id) {
                            playTick();
                            hasInteractedGalleryRef.current = true;
                            setSortBy(option.id);
                          }
                          clearCloseTimer();
                          setSortOpen(false);
                        }}
                        className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors duration-150 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--apple-blue)] ${
                          active
                            ? 'bg-[var(--editorial-btn-bg)] text-[var(--editorial-btn-fg)]'
                            : 'text-[var(--apple-label-secondary)] hover:bg-[var(--apple-control-hover)] hover:text-[var(--apple-label-primary)]'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Silky 60fps Compositor-Only Editorial Gallery (instant switch, zero blur jank) */}
          <div className="mt-7 min-h-[420px]">
            {visibleProjects.length === 0 ? (
              <motion.div
                key={`empty-${activeFilter}`}
                initial={
                  prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: EASE_OUT_STRONG }}
                className="apple-surface-subtle rounded-[28px] px-7 py-16 text-center sm:px-12"
              >
                <p className="type-caption text-[var(--apple-label-tertiary)]">
                  No matching case studies yet
                </p>
                <h2 className="type-title-3 mt-2">
                  Nothing published under {activeFilterLabel} yet.
                </h2>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="apple-btn-primary mt-6"
                >
                  Show all work
                </button>
              </motion.div>
            ) : (
              <div key={`${activeFilter}-${sortBy}-${layoutMode}`}>
                {layoutMode === 'masonry' ? (
                  visibleProjects.length === 1 ? (
                    <div className="max-w-[780px]">
                      {renderAnimatedCard(
                        visibleProjects[0],
                        0,
                        getMasonryAspectClass(0, 1),
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 items-start gap-3.5 sm:gap-4 md:grid-cols-2">
                      <div className="flex flex-col gap-3.5 sm:gap-4">
                        {masonryColumns.left.map(({ project, index }) =>
                          renderAnimatedCard(
                            project,
                            index,
                            getMasonryAspectClass(index, visibleProjects.length),
                          ),
                        )}
                      </div>
                      <div className="flex flex-col gap-3.5 sm:gap-4">
                        {masonryColumns.right.map(({ project, index }) =>
                          renderAnimatedCard(
                            project,
                            index,
                            getMasonryAspectClass(index, visibleProjects.length),
                          ),
                        )}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="grid grid-cols-1 gap-3.5 sm:gap-4 md:grid-cols-2">
                    {visibleProjects.map((project, index) =>
                      renderAnimatedCard(project, index, 'aspect-[16/11]'),
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
