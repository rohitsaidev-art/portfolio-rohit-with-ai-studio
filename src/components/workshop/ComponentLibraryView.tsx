import { useEffect, useMemo, useState } from 'react';
import type { ResolvedTheme } from '../../utils/appearance';
import {
  COMPONENT_CATEGORIES,
  COMPONENT_LIBRARY_ITEMS,
  EXCLUDED_COMPONENTS,
  filterComponentLibraryItems,
  getCategoryMeta,
  getComponentCountsByCategory,
  type ComponentCategoryId,
  type ComponentLibraryItem,
  type ComponentMaturityStatus,
} from '../../utils/componentLibraryCatalog';
import { playTick } from '../../utils/soundEngine';
import { showToast } from '../../utils/toast';
import type { VisualPaletteId } from '../../utils/workshopStore';
import {
  SFCheckmark,
  SFChevronRight,
  SFDisplay,
  SFMagnifyingGlass,
  SFXmark,
  SFiPhone,
} from '../SFSymbols';
import { renderPrimarySpecimen } from './ComponentSpecimensPrimary';
import { renderSecondarySpecimen } from './ComponentSpecimensSecondary';
import { CopyTokenButton } from './FoundationDocPrimitives';

interface ComponentLibraryViewProps {
  sandboxPalette: VisualPaletteId;
  sandboxTheme: ResolvedTheme;
  onNavigate: (path: string) => void;
}

type StatusFilter = 'all' | ComponentMaturityStatus;
type ViewportMode = 'desktop' | 'tablet' | 'mobile';

function renderMaturityLabel(status: ComponentMaturityStatus) {
  if (status === 'production') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--apple-success)]">
        <SFCheckmark size={11} />
        <span>Production</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--apple-warning)]">
      <span>Experimental · Studio Only</span>
    </span>
  );
}

export function ComponentLibraryView({
  sandboxPalette,
  sandboxTheme,
  onNavigate,
}: ComponentLibraryViewProps) {
  const [activeCategory, setActiveCategory] = useState<ComponentCategoryId | 'all'>(
    'actions-controls',
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string>(COMPONENT_LIBRARY_ITEMS[0].id);
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');

  const trimmedQuery = searchQuery.trim();
  const isCrossCategoryFilter =
    trimmedQuery.length > 0 || statusFilter === 'experimental';
  const effectiveCategory: ComponentCategoryId | 'all' = isCrossCategoryFilter
    ? 'all'
    : activeCategory;

  const totalCounts = useMemo(() => {
    const productionCount = COMPONENT_LIBRARY_ITEMS.filter(
      (item) => item.status === 'production',
    ).length;
    const experimentalCount = COMPONENT_LIBRARY_ITEMS.filter(
      (item) => item.status === 'experimental',
    ).length;
    return {
      categories: COMPONENT_CATEGORIES.length,
      total: COMPONENT_LIBRARY_ITEMS.length,
      production: productionCount,
      experimental: experimentalCount,
      excluded: EXCLUDED_COMPONENTS.length,
    };
  }, []);

  const countsByCategory = useMemo(() => {
    const statusFiltered = filterComponentLibraryItems(COMPONENT_LIBRARY_ITEMS, {
      categoryId: 'all',
      status: statusFilter,
      query: searchQuery,
    });
    return getComponentCountsByCategory(statusFiltered);
  }, [statusFilter, searchQuery]);

  const visibleItems = useMemo(
    () =>
      filterComponentLibraryItems(COMPONENT_LIBRARY_ITEMS, {
        categoryId: effectiveCategory,
        status: statusFilter,
        query: searchQuery,
      }),
    [effectiveCategory, statusFilter, searchQuery],
  );

  useEffect(() => {
    if (visibleItems.length === 0) return;
    if (!visibleItems.some((item) => item.id === selectedId)) {
      setSelectedId(visibleItems[0].id);
    }
  }, [visibleItems, selectedId]);

  const activeItem: ComponentLibraryItem | null = useMemo(() => {
    if (visibleItems.length === 0) return null;
    return visibleItems.find((item) => item.id === selectedId) ?? visibleItems[0];
  }, [visibleItems, selectedId]);

  useEffect(() => {
    setViewportMode('desktop');
  }, [activeItem?.id]);

  const activeCategoryMeta = useMemo(() => {
    if (activeItem) return getCategoryMeta(activeItem.categoryId);
    if (activeCategory !== 'all') return getCategoryMeta(activeCategory);
    return COMPONENT_CATEGORIES[0];
  }, [activeItem, activeCategory]);

  const handlePreviewNavigate = (path: string) => {
    playTick();
    showToast({
      message: `Preview link intercepted: ${path}`,
      tone: 'info',
      durationMs: 2600,
    });
  };

  const resetFilters = () => {
    playTick();
    setSearchQuery('');
    setStatusFilter('all');
    setActiveCategory('actions-controls');
    setSelectedId(COMPONENT_LIBRARY_ITEMS[0].id);
  };

  const specimenNode = activeItem
    ? (renderPrimarySpecimen({
        componentId: activeItem.id,
        viewportMode,
        onPreviewNavigate: handlePreviewNavigate,
      }) ??
      renderSecondarySpecimen({
        componentId: activeItem.id,
        viewportMode,
        onPreviewNavigate: handlePreviewNavigate,
      }))
    : null;

  const sandboxLabel = `${sandboxPalette === 'cool' ? 'Cool Neutral' : 'Warm Neutral'} · ${
    sandboxTheme === 'dark' ? 'Dark' : 'Light'
  }`;

  return (
    <div className="space-y-12">
      {/* Editorial Inventory Strip */}
      <section aria-label="Component library summary">
        <dl className="grid grid-cols-2 gap-6 border-b border-[var(--apple-separator)] pb-6 sm:grid-cols-4">
          <div>
            <dt className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-[var(--apple-label-tertiary)]">
              Categories
            </dt>
            <dd className="mt-1 text-[22px] font-semibold tracking-[-0.02em] tabular-nums text-[var(--apple-label-primary)]">
              {totalCounts.categories}
            </dd>
          </div>
          <div>
            <dt className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-[var(--apple-label-tertiary)]">
              Production Components
            </dt>
            <dd className="mt-1 text-[22px] font-semibold tracking-[-0.02em] tabular-nums text-[var(--apple-label-primary)]">
              {totalCounts.production}
            </dd>
          </div>
          <div>
            <dt className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-[var(--apple-label-tertiary)]">
              Experimental Specimens
            </dt>
            <dd className="mt-1 text-[22px] font-semibold tracking-[-0.02em] tabular-nums text-[var(--apple-label-primary)]">
              {totalCounts.experimental}
            </dd>
          </div>
          <div>
            <dt className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-[var(--apple-label-tertiary)]">
              Intentionally Excluded
            </dt>
            <dd className="mt-1 text-[22px] font-semibold tracking-[-0.02em] tabular-nums text-[var(--apple-label-primary)]">
              {totalCounts.excluded}
            </dd>
          </div>
        </dl>

        {/* Search & Maturity Filter Bar */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-[380px]">
            <SFMagnifyingGlass
              size={15}
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[var(--apple-label-tertiary)]"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter components, tokens, or source files…"
              aria-label="Filter component library"
              className="apple-input min-h-[40px] w-full rounded-[12px] py-2 pr-9 pl-9 text-[14px]"
            />
            {searchQuery.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  playTick();
                  setSearchQuery('');
                }}
                aria-label="Clear component search"
                className="apple-btn-icon absolute top-1/2 right-1.5 h-7 w-7 -translate-y-1/2 text-[var(--apple-label-tertiary)]"
              >
                <SFXmark size={12} />
              </button>
            )}
          </div>

          <div className="flex max-w-full flex-wrap items-center gap-3 overflow-x-auto">
            <div
              className="apple-segmented shrink-0"
              role="group"
              aria-label="Filter by maturity status"
            >
              {(
                [
                  { id: 'all', label: `All (${totalCounts.total})` },
                  { id: 'production', label: `Production (${totalCounts.production})` },
                  { id: 'experimental', label: `Experimental (${totalCounts.experimental})` },
                ] as const
              ).map((opt) => {
                const active = statusFilter === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      playTick();
                      setStatusFilter(opt.id);
                    }}
                    className={`apple-segmented-item !min-h-[32px] px-3 text-[12.5px] ${
                      active
                        ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                        : 'text-[var(--apple-label-secondary)]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Category Navigation Strip (A–H) */}
        <nav
          aria-label="Component library categories"
          className="mt-5 -mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-1"
        >
          {COMPONENT_CATEGORIES.map((category) => {
            const count = countsByCategory[category.id];
            const isActive =
              !isCrossCategoryFilter && activeCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => {
                  playTick();
                  if (trimmedQuery.length > 0) {
                    setSearchQuery('');
                  }
                  if (statusFilter === 'experimental' && count === 0) {
                    setStatusFilter('all');
                  }
                  setActiveCategory(category.id);
                }}
                className={`apple-link inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-[10px] border px-3 py-1.5 text-[13px] transition-colors ${
                  isActive
                    ? 'border-[var(--apple-separator-strong)] bg-[var(--apple-surface-elevated)] font-semibold text-[var(--apple-label-primary)] shadow-[var(--shadow-apple-subtle)]'
                    : 'border-transparent bg-transparent font-medium text-[var(--apple-label-secondary)] hover:bg-[var(--apple-bg-secondary)] hover:text-[var(--apple-label-primary)]'
                }`}
              >
                <span className="font-mono text-[11px] text-[var(--apple-label-tertiary)]">
                  {category.code}
                </span>
                <span>{category.shortLabel}</span>
                <span className="text-[11.5px] tabular-nums text-[var(--apple-label-tertiary)]">
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </section>

      {/* Category Index Selector */}
      <section aria-labelledby="component-index-heading">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-link)]">
              {trimmedQuery.length > 0
                ? `Search Results · ${visibleItems.length} Matching`
                : statusFilter === 'experimental'
                  ? `Experimental Specimens · ${visibleItems.length} Studio Only`
                  : `Category ${activeCategoryMeta.code} · ${activeCategoryMeta.label}`}
            </p>
            <h2
              id="component-index-heading"
              className="type-title-3 mt-1 text-[var(--apple-label-primary)]"
            >
              {trimmedQuery.length > 0
                ? `Matches for “${trimmedQuery}”`
                : statusFilter === 'experimental'
                  ? 'Experimental Reference Specimens'
                  : activeCategoryMeta.label}
            </h2>
            <p className="mt-1 max-w-[68ch] text-[14px] leading-[1.52] text-[var(--apple-label-secondary)]">
              {trimmedQuery.length > 0
                ? 'Searching across component names, source paths, CSS classes, design tokens, and variants.'
                : statusFilter === 'experimental'
                  ? 'Documented exclusively inside the private Design Studio. Not promoted or mounted on any public portfolio page.'
                  : activeCategoryMeta.description}
            </p>
          </div>
          {trimmedQuery.length === 0 && activeCategory !== 'all' && (
            <p className="text-[12.5px] tabular-nums text-[var(--apple-label-tertiary)]">
              {visibleItems.length} {visibleItems.length === 1 ? 'component' : 'components'}
            </p>
          )}
        </div>

        {visibleItems.length === 0 ? (
          <div className="mt-6 rounded-[20px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-8 text-center">
            <p className="text-[15.5px] font-semibold text-[var(--apple-label-primary)]">
              No components match this filter
            </p>
            <p className="mx-auto mt-1.5 max-w-[44ch] text-[13.5px] leading-[1.52] text-[var(--apple-label-secondary)]">
              Try clearing your search term or switching the maturity filter back to All.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="apple-btn-tonal mt-4 !min-h-[36px] !px-4 !text-[13px]"
            >
              Reset library filters
            </button>
          </div>
        ) : (
          <div
            role="listbox"
            aria-label="Select component to inspect"
            className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
          >
            {visibleItems.map((item) => {
              const selected = activeItem?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    playTick();
                    setSelectedId(item.id);
                  }}
                  className={`apple-link flex min-h-[68px] flex-col justify-between rounded-[14px] border px-4 py-3 text-left transition-colors ${
                    selected
                      ? 'border-[var(--apple-blue)] bg-[var(--apple-surface-elevated)] shadow-[var(--shadow-apple-subtle)]'
                      : 'border-[var(--apple-separator)] bg-[var(--apple-bg-primary)] hover:border-[var(--apple-separator-strong)] hover:bg-[var(--apple-bg-secondary)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-[14px] leading-[1.3] tracking-[-0.01em] ${
                        selected
                          ? 'font-semibold text-[var(--apple-label-primary)]'
                          : 'font-medium text-[var(--apple-label-primary)]'
                      }`}
                    >
                      {item.shortTitle}
                    </span>
                    <span
                      className={`shrink-0 text-[11px] font-semibold ${
                        item.status === 'production'
                          ? 'text-[var(--apple-success)]'
                          : 'text-[var(--apple-warning)]'
                      }`}
                    >
                      {item.status === 'production' ? 'Prod' : 'Exp'}
                    </span>
                  </div>
                  <p className="mt-1.5 truncate font-mono text-[11.5px] text-[var(--apple-label-tertiary)]">
                    {item.implementation.sourcePath}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Focused 13-Point Component Documentation Inspector */}
      {activeItem && (
        <article
          key={activeItem.id}
          aria-labelledby={`comp-title-${activeItem.id}`}
          className="space-y-12 border-t border-[var(--apple-separator)] pt-12"
        >
          {/* 1. Component Name, Status & Purpose */}
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="text-[11.5px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]">
                {getCategoryMeta(activeItem.categoryId).code} ·{' '}
                {getCategoryMeta(activeItem.categoryId).label}
              </span>
              <span aria-hidden="true" className="text-[var(--apple-label-quaternary)]">
                /
              </span>
              {renderMaturityLabel(activeItem.status)}
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <h2
                  id={`comp-title-${activeItem.id}`}
                  className="type-title-1 text-[var(--apple-label-primary)]"
                >
                  {activeItem.name}
                </h2>
                <p className="type-callout measure-prose mt-2.5 text-[var(--apple-label-secondary)]">
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
                    toastLabel="primary CSS class"
                    compact
                  />
                )}
              </div>
            </div>
          </header>

          {/* 2. Live Interactive Specimen Playground */}
          <section aria-labelledby={`comp-playground-${activeItem.id}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3
                  id={`comp-playground-${activeItem.id}`}
                  className="text-[12px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]"
                >
                  Live Interactive Specimen
                </h3>
                <p className="mt-0.5 text-[13px] text-[var(--apple-label-secondary)]">
                  Sandbox context: {sandboxLabel} · Keyboard-focusable (press Tab to verify focus rings)
                </p>
              </div>

              {activeItem.supportsViewportPreview && (
                <div
                  className="apple-segmented self-start sm:self-auto"
                  role="group"
                  aria-label="Choose specimen viewport frame"
                >
                  {(
                    [
                      { id: 'desktop', label: 'Desktop', icon: SFDisplay },
                      { id: 'tablet', label: 'Tablet 720px', icon: SFDisplay },
                      { id: 'mobile', label: 'Mobile 375px', icon: SFiPhone },
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
                        className={`apple-segmented-item !min-h-[30px] px-3 text-[12px] ${
                          active
                            ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                            : 'text-[var(--apple-label-secondary)]'
                        }`}
                      >
                        <Icon size={12} />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div
              data-ds-sandbox="true"
              data-ds-palette={sandboxPalette}
              data-ds-theme={sandboxTheme}
              className="mt-4 overflow-x-auto rounded-[24px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-5 sm:p-8"
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
                {activeItem.supportsViewportPreview && viewportMode !== 'desktop' && (
                  <p className="mb-3 text-right font-mono text-[11.5px] text-[var(--apple-label-tertiary)]">
                    Simulated frame · {viewportMode === 'mobile' ? '375px' : '720px'}
                  </p>
                )}
                {specimenNode}
              </div>
            </div>
          </section>

          {/* 3. Anatomy & 4. Variants */}
          <section
            aria-label="Anatomy and variants"
            className="grid grid-cols-1 gap-10 border-t border-[var(--apple-separator)] pt-10 lg:grid-cols-12"
          >
            <div className="lg:col-span-5">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]">
                Anatomy &amp; Constituent Elements
              </h3>
              <ol className="mt-4 space-y-2.5">
                {activeItem.anatomy.map((part, idx) => (
                  <li
                    key={part}
                    className="flex items-baseline gap-3 text-[14px] leading-[1.55] text-[var(--apple-label-primary)]"
                  >
                    <span className="font-mono text-[11.5px] font-medium tabular-nums text-[var(--apple-label-tertiary)]">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span>{part}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="lg:col-span-7">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]">
                Variants ({activeItem.variants.length})
              </h3>
              <dl className="mt-4 divide-y divide-[var(--apple-separator-subtle)] border-y border-[var(--apple-separator-subtle)]">
                {activeItem.variants.map((variant) => (
                  <div
                    key={variant.name}
                    className="grid grid-cols-1 gap-1.5 py-3 sm:grid-cols-12 sm:gap-4"
                  >
                    <dt className="text-[13.5px] font-semibold text-[var(--apple-label-primary)] sm:col-span-4">
                      {variant.name}
                    </dt>
                    <dd className="text-[13.5px] leading-[1.52] text-[var(--apple-label-secondary)] sm:col-span-8">
                      {variant.usage}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          {/* 5. Applicable Interaction States */}
          <section
            aria-labelledby={`comp-states-${activeItem.id}`}
            className="border-t border-[var(--apple-separator)] pt-10"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3
                  id={`comp-states-${activeItem.id}`}
                  className="text-[12px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]"
                >
                  Applicable Interaction States ({activeItem.interactionStates.length})
                </h3>
                <p className="mt-1 text-[13.5px] text-[var(--apple-label-secondary)]">
                  Documents only states that are genuinely meaningful and implemented for this component.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  playTick();
                  onNavigate('/design-system/interaction-states');
                }}
                className="apple-link inline-flex items-center gap-1 self-start text-[13px] font-medium text-[var(--apple-link)] hover:underline sm:self-auto"
              >
                <span>Open full Interaction State Matrix</span>
                <SFChevronRight size={12} />
              </button>
            </div>

            <div className="mt-5 overflow-x-auto rounded-[16px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)]">
              <table className="w-full min-w-[600px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)]">
                    <th className="px-4 py-3 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-[var(--apple-label-tertiary)]">
                      State
                    </th>
                    <th className="px-4 py-3 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-[var(--apple-label-tertiary)]">
                      Trigger
                    </th>
                    <th className="px-4 py-3 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-[var(--apple-label-tertiary)]">
                      Visual &amp; Behavioural Treatment
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--apple-separator-subtle)] text-[13.5px]">
                  {activeItem.interactionStates.map((spec) => (
                    <tr key={spec.state}>
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-[var(--apple-label-primary)]">
                        {spec.state}
                      </td>
                      <td className="px-4 py-3 text-[var(--apple-label-secondary)]">
                        {spec.trigger}
                      </td>
                      <td className="px-4 py-3 leading-[1.5] text-[var(--apple-label-primary)]">
                        {spec.treatment}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 6. Behaviour & 7. Animation / Motion */}
          <section
            aria-label="Behaviour and animation specification"
            className="grid grid-cols-1 gap-8 border-t border-[var(--apple-separator)] pt-10 md:grid-cols-2"
          >
            <div>
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]">
                Behaviour &amp; Expected Outcomes
              </h3>
              <p className="mt-3 text-[14.5px] leading-[1.6] text-[var(--apple-label-primary)]">
                {activeItem.behavior}
              </p>
            </div>
            <div>
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]">
                Animation Triggers &amp; Transitions
              </h3>
              <p className="mt-3 text-[14.5px] leading-[1.6] text-[var(--apple-label-primary)]">
                {activeItem.animation}
              </p>
            </div>
          </section>

          {/* 8. Responsive Behaviour & 9. Accessibility Requirements */}
          <section
            aria-label="Responsive and accessibility specification"
            className="grid grid-cols-1 gap-8 border-t border-[var(--apple-separator)] pt-10 md:grid-cols-2"
          >
            <div>
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]">
                Responsive Behaviour
              </h3>
              <p className="mt-3 text-[14.5px] leading-[1.6] text-[var(--apple-label-primary)]">
                {activeItem.responsiveBehavior}
              </p>
            </div>
            <div>
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]">
                Accessibility Requirements
              </h3>
              <ul className="mt-3 space-y-2">
                {activeItem.accessibility.map((rule) => (
                  <li
                    key={rule}
                    className="flex items-baseline gap-2.5 text-[14px] leading-[1.55] text-[var(--apple-label-primary)]"
                  >
                    <span aria-hidden="true" className="text-[var(--apple-label-tertiary)]">
                      ·
                    </span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 10. Design Tokens & 11. Actual Implementation Reference */}
          <section
            aria-label="Design tokens and implementation reference"
            className="grid grid-cols-1 gap-10 border-t border-[var(--apple-separator)] pt-10 lg:grid-cols-12"
          >
            <div className="lg:col-span-5">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]">
                Design Tokens Used ({activeItem.tokensUsed.length})
              </h3>
              <p className="mt-1 text-[13px] text-[var(--apple-label-secondary)]">
                Click any token to copy its exact CSS custom property name.
              </p>
              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {activeItem.tokensUsed.map((token) => (
                  <CopyTokenButton key={token} value={token} compact />
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]">
                  Actual Implementation Reference
                </h3>
                <CopyTokenButton
                  value={activeItem.implementation.snippet}
                  label="Copy snippet"
                  toastLabel="JSX / CSS snippet"
                  mono={false}
                  compact
                />
              </div>

              <dl className="mt-3 grid grid-cols-1 gap-3 text-[13.5px] sm:grid-cols-2">
                <div>
                  <dt className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-[var(--apple-label-tertiary)]">
                    Source File
                  </dt>
                  <dd className="mt-1 font-mono text-[12.5px] text-[var(--apple-label-primary)]">
                    {activeItem.implementation.sourcePath}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-[var(--apple-label-tertiary)]">
                    Export / Pattern
                  </dt>
                  <dd className="mt-1 font-mono text-[12.5px] text-[var(--apple-label-primary)]">
                    {activeItem.implementation.exportName}
                  </dd>
                </div>
              </dl>

              {activeItem.implementation.cssClasses.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 text-[11.5px] font-medium uppercase tracking-[0.06em] text-[var(--apple-label-tertiary)]">
                    Classes:
                  </span>
                  {activeItem.implementation.cssClasses.map((cls) => (
                    <CopyTokenButton key={cls} value={cls} compact />
                  ))}
                </div>
              )}

              <pre className="mt-4 overflow-x-auto rounded-[14px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-4 font-mono text-[12px] leading-[1.6] text-[var(--apple-label-primary)]">
                <code>{activeItem.implementation.snippet}</code>
              </pre>
            </div>
          </section>

          {/* 12. Usage Guidance & 13. Do / Don't */}
          <section
            aria-label="Usage guidance and do or don't guardrails"
            className="space-y-10 border-t border-[var(--apple-separator)] pt-10"
          >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]">
                  Usage Guidance
                </h3>
                <p className="mt-1.5 text-[13.5px] leading-[1.52] text-[var(--apple-label-secondary)]">
                  Practical rules for applying {activeItem.shortTitle} across the portfolio.
                </p>
              </div>
              <ul className="space-y-2.5 lg:col-span-8">
                {activeItem.usageGuidance.map((line) => (
                  <li
                    key={line}
                    className="flex items-baseline gap-3 text-[14.5px] leading-[1.58] text-[var(--apple-label-primary)]"
                  >
                    <span aria-hidden="true" className="text-[var(--apple-label-tertiary)]">
                      —
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 gap-6 border-t border-[var(--apple-separator-subtle)] pt-8 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]">
                  Do &amp; Don&apos;t
                </h3>
                <p className="mt-1.5 text-[13.5px] leading-[1.52] text-[var(--apple-label-secondary)]">
                  Guardrails preserving calm hierarchy, contrast, and interaction fidelity.
                </p>
              </div>
              <div className="divide-y divide-[var(--apple-separator-subtle)] lg:col-span-8">
                {activeItem.doDonts.map((pair) => (
                  <div
                    key={pair.doText}
                    className="grid grid-cols-1 gap-4 py-4 first:pt-0 last:pb-0 sm:grid-cols-2 sm:gap-6"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--apple-blue)]/10 text-[var(--apple-link)]">
                        <SFCheckmark size={11} />
                      </span>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-link)]">
                          Do
                        </p>
                        <p className="mt-1 text-[13.5px] leading-[1.52] text-[var(--apple-label-primary)]">
                          {pair.doText}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--apple-error)]/10 text-[var(--apple-error)]">
                        <SFXmark size={11} />
                      </span>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-error)]">
                          Don&apos;t
                        </p>
                        <p className="mt-1 text-[13.5px] leading-[1.52] text-[var(--apple-label-secondary)]">
                          {pair.dontText}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </article>
      )}

      {/* Intentionally Excluded Components Ledger */}
      <section
        aria-labelledby="excluded-components-heading"
        className="border-t border-[var(--apple-separator)] pt-12"
      >
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]">
          Editorial Restraint &amp; Scope Boundaries
        </p>
        <h2
          id="excluded-components-heading"
          className="type-title-3 mt-1.5 text-[var(--apple-label-primary)]"
        >
          Intentionally Excluded Components
        </h2>
        <p className="type-footnote measure-prose mt-1.5 font-normal text-[var(--apple-label-secondary)]">
          This library documents the real portfolio design system rather than a generic SaaS UI kit. The following patterns are deliberately excluded from production.
        </p>

        <div className="mt-6 divide-y divide-[var(--apple-separator)] border-y border-[var(--apple-separator)]">
          {EXCLUDED_COMPONENTS.map((entry) => (
            <div
              key={entry.name}
              className="grid grid-cols-1 gap-3 py-5 lg:grid-cols-12 lg:gap-8"
            >
              <div className="lg:col-span-4">
                <p className="text-[14.5px] font-semibold text-[var(--apple-label-primary)]">
                  {entry.name}
                </p>
                <p className="mt-0.5 text-[12px] text-[var(--apple-label-tertiary)]">
                  {entry.category}
                </p>
              </div>
              <div className="space-y-1.5 text-[13.5px] leading-[1.55] lg:col-span-8">
                <p className="text-[var(--apple-label-secondary)]">
                  <strong className="font-medium text-[var(--apple-label-primary)]">
                    Why excluded:
                  </strong>{' '}
                  {entry.reason}
                </p>
                <p className="text-[var(--apple-label-secondary)]">
                  <strong className="font-medium text-[var(--apple-link)]">
                    Portfolio alternative:
                  </strong>{' '}
                  {entry.portfolioAlternative}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
