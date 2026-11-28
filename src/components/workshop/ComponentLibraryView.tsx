import { useEffect, useMemo, useState } from 'react';
import type { ResolvedTheme } from '../../utils/appearance';
import {
  COMPONENT_LIBRARY_ITEMS,
  getCategoryMeta,
  type ComponentLibraryItem,
} from '../../utils/componentLibraryCatalog';
import type { TocVariant } from '../../utils/portfolio';
import { scrollToTop } from '../../utils/scroll';
import { playTick } from '../../utils/soundEngine';
import { showToast } from '../../utils/toast';
import type {
  WorkbenchMode,
  WorkbenchSpecimen,
  WorkbenchState,
} from '../../utils/workbenchStore';
import type { VisualPaletteId } from '../../utils/workshopStore';
import {
  ChevronLeft,
  ChevronRight,
  Monitor,
  Smartphone,
  Tablet,
} from 'lucide-react';
import { renderPrimarySpecimen } from './ComponentSpecimensPrimary';
import { renderSecondarySpecimen } from './ComponentSpecimensSecondary';
import { CopyTokenButton } from './FoundationDocPrimitives';
import {
  WorkbenchCanvasView,
  type ArchiveOriginRect,
} from './WorkbenchCanvasView';

export interface InspectedComponentSummary {
  id: string;
  name: string;
}

interface ComponentLibraryViewProps {
  sandboxPalette: VisualPaletteId;
  sandboxTheme: ResolvedTheme;
  appliedTocVariant: TocVariant;
  experimentsCount: number;
  workbenchState: WorkbenchState;
  workbenchMode: WorkbenchMode;
  onWorkbenchModeChange: (next: WorkbenchMode) => void;
  onUpdateWorkbenchState: (
    updater: (prev: WorkbenchState) => WorkbenchState,
  ) => void;
  onArchiveSpecimens: (
    ids: readonly string[],
    origins: readonly ArchiveOriginRect[],
  ) => void;
  onNavigate: (path: string) => void;
  onInspectComponentChange?: (item: InspectedComponentSummary | null) => void;
}

type ViewportMode = 'desktop' | 'tablet' | 'mobile';

function readComponentIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const id = params.get('component');
  if (!id) return null;
  return COMPONENT_LIBRARY_ITEMS.some((item) => item.id === id) ? id : null;
}

function syncComponentIdToUrl(id: string | null) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  const current = url.searchParams.get('component');
  if (id === current) return;
  if (id) {
    url.searchParams.set('component', id);
  } else {
    url.searchParams.delete('component');
  }
  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  window.history.pushState({}, '', nextUrl);
}

export function ComponentLibraryView({
  sandboxPalette,
  sandboxTheme,
  appliedTocVariant,
  experimentsCount,
  workbenchState,
  workbenchMode,
  onWorkbenchModeChange,
  onUpdateWorkbenchState,
  onArchiveSpecimens,
  onNavigate,
  onInspectComponentChange,
}: ComponentLibraryViewProps) {
  const [inspectedId, setInspectedId] = useState<string | null>(() =>
    readComponentIdFromUrl(),
  );
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');

  const activeItem: ComponentLibraryItem | null = useMemo(() => {
    if (!inspectedId) return null;
    return COMPONENT_LIBRARY_ITEMS.find((item) => item.id === inspectedId) ?? null;
  }, [inspectedId]);

  useEffect(() => {
    const handlePopState = () => {
      setInspectedId(readComponentIdFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    setViewportMode('desktop');
    onInspectComponentChange?.(
      activeItem ? { id: activeItem.id, name: activeItem.shortTitle } : null,
    );
  }, [activeItem, onInspectComponentChange]);

  useEffect(() => {
    return () => {
      onInspectComponentChange?.(null);
    };
  }, [onInspectComponentChange]);

  const openComponentDetail = (id: string) => {
    playTick();
    setInspectedId(id);
    syncComponentIdToUrl(id);
    scrollToTop('auto');
  };

  const closeComponentDetail = () => {
    playTick();
    setInspectedId(null);
    syncComponentIdToUrl(null);
    scrollToTop('auto');
  };

  const handlePreviewNavigate = (path: string) => {
    playTick();
    showToast({
      message: `Preview navigation: ${path}`,
      tone: 'info',
      durationMs: 2400,
    });
  };

  const handleOpenSpecimenDetail = (specimen: WorkbenchSpecimen) => {
    if (specimen.section === 'components') {
      openComponentDetail(specimen.sourceId);
      return;
    }
    onNavigate(specimen.detailPath);
  };

  /* ── Focused Component Detail View ─────────────────────────────────────── */
  if (activeItem) {
    const categoryMeta = getCategoryMeta(activeItem.categoryId);
    const specimenNode =
      renderPrimarySpecimen({
        componentId: activeItem.id,
        viewportMode,
        onPreviewNavigate: handlePreviewNavigate,
      }) ??
      renderSecondarySpecimen({
        componentId: activeItem.id,
        viewportMode,
        onPreviewNavigate: handlePreviewNavigate,
      });

    return (
      <article
        key={activeItem.id}
        aria-labelledby={`comp-title-${activeItem.id}`}
        className="space-y-10"
      >
        {/* Top Back Navigation & Essential Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={closeComponentDetail}
              className="apple-link inline-flex min-h-[34px] items-center gap-1.5 text-[13.5px] font-medium text-[var(--apple-label-secondary)] transition-colors hover:text-[var(--apple-label-primary)]"
            >
              <ChevronLeft size={13} strokeWidth={2} aria-hidden="true" />
              <span>All Components</span>
            </button>

            <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-[var(--apple-label-tertiary)]">
              <span>{categoryMeta.label}</span>
              <span aria-hidden="true">·</span>
              <span
                className={
                  activeItem.status === 'experimental'
                    ? 'font-medium text-[var(--apple-warning)]'
                    : 'font-medium text-[var(--apple-label-secondary)]'
                }
              >
                {activeItem.status === 'experimental' ? 'Experimental' : 'Production'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <h1
                id={`comp-title-${activeItem.id}`}
                className="type-title-1 text-[var(--apple-label-primary)]"
              >
                {activeItem.name}
              </h1>
              <p className="mt-2 max-w-[64ch] text-[15px] leading-[1.55] text-[var(--apple-label-secondary)]">
                {activeItem.purpose}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <CopyTokenButton
                value={activeItem.implementation.sourcePath}
                toastLabel="source path"
                compact
              />
              {activeItem.implementation.cssClasses[0] && (
                <CopyTokenButton
                  value={activeItem.implementation.cssClasses[0]}
                  toastLabel="CSS class"
                  compact
                />
              )}
            </div>
          </div>
        </div>

        {/* Large Interactive Specimen Stage */}
        <section aria-label="Interactive component preview">
          {activeItem.supportsViewportPreview && (
            <div className="mb-3 flex justify-end">
              <div
                className="apple-segmented"
                role="group"
                aria-label="Preview viewport width"
              >
                {(
                  [
                    { id: 'desktop', label: 'Desktop', icon: Monitor },
                    { id: 'tablet', label: 'Tablet', icon: Tablet },
                    { id: 'mobile', label: 'Mobile', icon: Smartphone },
                  ] as const
                ).map((opt) => {
                  const active = viewportMode === opt.id;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        playTick();
                        setViewportMode(opt.id);
                      }}
                      className={`apple-segmented-item !min-h-[30px] whitespace-nowrap px-3 text-[12px] ${
                        active
                          ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                          : 'text-[var(--apple-label-secondary)]'
                      }`}
                    >
                      <Icon size={12} strokeWidth={2} aria-hidden="true" />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div
            data-ds-sandbox="true"
            data-ds-palette={sandboxPalette}
            data-ds-theme={sandboxTheme}
            className="overflow-x-auto rounded-[20px] border border-[var(--apple-separator)] !bg-[var(--apple-bg-secondary)] p-6 sm:p-10"
          >
            <div
              className="mx-auto w-full transition-[max-width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                maxWidth: !activeItem.supportsViewportPreview
                  ? '100%'
                  : viewportMode === 'mobile'
                    ? '375px'
                    : viewportMode === 'tablet'
                      ? '720px'
                      : '100%',
              }}
            >
              {specimenNode}
            </div>
          </div>
        </section>

        {/* Variants */}
        <section
          aria-labelledby={`comp-variants-${activeItem.id}`}
          className="border-t border-[var(--apple-separator-subtle)] pt-8"
        >
          <div className="flex items-baseline justify-between gap-2">
            <h3
              id={`comp-variants-${activeItem.id}`}
              className="text-[16px] font-semibold tracking-[-0.015em] text-[var(--apple-label-primary)]"
            >
              Variants
            </h3>
            <span className="tabular-nums text-[12.5px] text-[var(--apple-label-tertiary)]">
              {activeItem.variants.length} {activeItem.variants.length === 1 ? 'variant' : 'variants'}
            </span>
          </div>

          <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            {activeItem.variants.map((variant) => (
              <div
                key={variant.name}
                className="border-t border-[var(--apple-separator-subtle)] pt-3.5"
              >
                <dt className="text-[14px] font-semibold text-[var(--apple-label-primary)]">
                  {variant.name}
                </dt>
                <dd className="mt-1 text-[13.5px] leading-[1.52] text-[var(--apple-label-secondary)]">
                  {variant.usage}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Important Interaction States */}
        <section
          aria-labelledby={`comp-states-${activeItem.id}`}
          className="border-t border-[var(--apple-separator-subtle)] pt-8"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3
              id={`comp-states-${activeItem.id}`}
              className="text-[16px] font-semibold tracking-[-0.015em] text-[var(--apple-label-primary)]"
            >
              Interaction States
            </h3>
            <button
              type="button"
              onClick={() => {
                playTick();
                onNavigate('/design-system/interaction-states');
              }}
              className="apple-link inline-flex items-center gap-1 text-[13px] font-medium text-[var(--apple-link)] hover:underline"
            >
              <span>State Matrix</span>
              <ChevronRight size={12} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeItem.interactionStates.map((spec) => (
              <div
                key={spec.state}
                className="rounded-[14px] border border-[var(--apple-separator-subtle)] bg-[var(--apple-bg-secondary)]/55 p-4"
              >
                <p className="text-[13.5px] font-semibold text-[var(--apple-label-primary)]">
                  {spec.state}
                </p>
                <p className="mt-1 text-[13px] leading-[1.5] text-[var(--apple-label-secondary)]">
                  {spec.treatment}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Practical Guidance & Essential Accessibility */}
        <section
          aria-label="Practical guidance and accessibility"
          className="grid grid-cols-1 gap-8 border-t border-[var(--apple-separator-subtle)] pt-8 md:grid-cols-2"
        >
          <div>
            <h3 className="text-[15px] font-semibold text-[var(--apple-label-primary)]">
              Practical Usage
            </h3>
            <ul className="mt-3 space-y-2.5">
              {activeItem.usageGuidance.slice(0, 3).map((line) => (
                <li
                  key={line}
                  className="text-[14px] leading-[1.55] text-[var(--apple-label-secondary)]"
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[15px] font-semibold text-[var(--apple-label-primary)]">
              Accessibility Essentials
            </h3>
            <ul className="mt-3 space-y-2.5">
              {activeItem.accessibility.slice(0, 3).map((rule) => (
                <li
                  key={rule}
                  className="text-[14px] leading-[1.55] text-[var(--apple-label-secondary)]"
                >
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </article>
    );
  }

  /* ── Interactive Component Library Workbench ───────────────────────────── */
  return (
    <WorkbenchCanvasView
      scope="components"
      state={workbenchState}
      mode={workbenchMode}
      onModeChange={onWorkbenchModeChange}
      onUpdateState={onUpdateWorkbenchState}
      onArchiveSpecimens={onArchiveSpecimens}
      onOpenSpecimenDetail={handleOpenSpecimenDetail}
      sandboxPalette={sandboxPalette}
      sandboxTheme={sandboxTheme}
      appliedTocVariant={appliedTocVariant}
      experimentsCount={experimentsCount}
    />
  );
}
