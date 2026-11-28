import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import type { ResolvedTheme } from '../../utils/appearance';
import {
  COMPONENT_CATEGORIES,
  type ComponentCategoryId,
  type ComponentMaturityStatus,
} from '../../utils/componentLibraryCatalog';
import { SPRING_SEGMENT } from '../../utils/motion';
import type { TocVariant } from '../../utils/portfolio';
import { playSuccessChime, playTick } from '../../utils/soundEngine';
import { showToast } from '../../utils/toast';
import {
  WORKBENCH_SECTIONS,
  addToCompare,
  applyCustomOrder,
  createCollection,
  createGroup,
  deleteCollection,
  duplicateSpecimens,
  getAllWorkbenchSpecimens,
  removeDuplicate,
  removeFromCompare,
  renameGroup,
  reorderSpecimenInList,
  resetArrangement,
  setCompareSpecimens,
  toggleCardSize,
  ungroupSpecimens,
  updateCollectionMembership,
  type WorkbenchMode,
  type WorkbenchSectionId,
  type WorkbenchSpecimen,
  type WorkbenchState,
} from '../../utils/workbenchStore';
import type { VisualPaletteId } from '../../utils/workshopStore';
import {
  ArrowUpRight,
  Check,
  Maximize2,
  Plus,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import {
  WorkbenchCompareStage,
  WorkbenchContextMenu,
  WorkbenchSelectionBar,
  type ContextMenuState,
} from './WorkbenchOverlayControls';
import { WorkbenchSpecimenPreview } from './WorkbenchSpecimenPreview';

export interface ArchiveOriginRect {
  id: string;
  title: string;
  rect: DOMRect;
}

export interface WorkbenchCanvasViewProps {
  /** 'all' = Unified Visual Design System Canvas (/design-system); 'components' = Component Library (/design-system/components) */
  scope: 'all' | 'components';
  state: WorkbenchState;
  mode: WorkbenchMode;
  onModeChange: (next: WorkbenchMode) => void;
  onUpdateState: (updater: (prev: WorkbenchState) => WorkbenchState) => void;
  onArchiveSpecimens: (
    ids: readonly string[],
    origins: readonly ArchiveOriginRect[],
  ) => void;
  onOpenSpecimenDetail: (specimen: WorkbenchSpecimen) => void;
  sandboxPalette: VisualPaletteId;
  sandboxTheme: ResolvedTheme;
  appliedTocVariant: TocVariant;
  experimentsCount: number;
}

type StatusFilter = 'all' | ComponentMaturityStatus;

interface SpecimenSectionBlock {
  listKey: string;
  heading: string;
  subheading?: string;
  sectionId: WorkbenchSectionId;
  items: WorkbenchSpecimen[];
}

export function WorkbenchCanvasView({
  scope,
  state,
  mode,
  onModeChange,
  onUpdateState,
  onArchiveSpecimens,
  onOpenSpecimenDetail,
  sandboxPalette,
  sandboxTheme,
  appliedTocVariant,
  experimentsCount,
}: WorkbenchCanvasViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSectionFilter, setActiveSectionFilter] = useState<
    'all' | WorkbenchSectionId
  >('all');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<
    'all' | ComponentCategoryId
  >('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(
    null,
  );
  const [creatingCollection, setCreatingCollection] = useState(false);
  const [newCollectionInput, setNewCollectionInput] = useState('');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const lastSelectedIdRef = useRef<string | null>(null);

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [draggingInfo, setDraggingInfo] = useState<{
    id: string;
    listKey: string;
  } | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const longPressTimerRef = useRef<number | null>(null);
  const longPressTouchOriginRef = useRef<{ x: number; y: number } | null>(null);
  const suppressNextClickRef = useRef(false);

  const archivedSet = useMemo(
    () => new Set(state.archivedIds),
    [state.archivedIds],
  );

  const allSpecimens = useMemo(() => getAllWorkbenchSpecimens(state), [state]);

  // Specimens active in this scope (non-archived)
  const scopedActiveSpecimens = useMemo(() => {
    return allSpecimens.filter((spec) => {
      if (archivedSet.has(spec.id)) return false;
      if (scope === 'components' && spec.section !== 'components') return false;
      return true;
    });
  }, [allSpecimens, archivedSet, scope]);

  // Validate activeCollectionId still exists
  const activeCollection = useMemo(() => {
    if (!activeCollectionId) return null;
    return state.collections.find((c) => c.id === activeCollectionId) ?? null;
  }, [state.collections, activeCollectionId]);

  useEffect(() => {
    if (activeCollectionId && !activeCollection) {
      setActiveCollectionId(null);
    }
  }, [activeCollectionId, activeCollection]);

  // Clear stale selections if items were archived or removed
  useEffect(() => {
    const activeSet = new Set(scopedActiveSpecimens.map((s) => s.id));
    setSelectedIds((prev) => {
      const next = prev.filter((id) => activeSet.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [scopedActiveSpecimens]);

  // Escape clears selection
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (contextMenu) {
          setContextMenu(null);
          return;
        }
        if (selectedIds.length > 0) {
          setSelectedIds([]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [contextMenu, selectedIds.length]);

  const trimmedQuery = searchQuery.trim().toLowerCase();

  // Apply collection + search + status filters
  const baseFilteredSpecimens = useMemo(() => {
    const collectionSet = activeCollection
      ? new Set(activeCollection.specimenIds)
      : null;

    return scopedActiveSpecimens.filter((spec) => {
      if (collectionSet && !collectionSet.has(spec.id)) return false;
      if (scope === 'components' && statusFilter !== 'all') {
        if (spec.status !== statusFilter) return false;
      }
      if (trimmedQuery) {
        return (
          spec.title.toLowerCase().includes(trimmedQuery) ||
          spec.subtitle.toLowerCase().includes(trimmedQuery) ||
          spec.categoryLabel.toLowerCase().includes(trimmedQuery) ||
          spec.searchText.includes(trimmedQuery)
        );
      }
      return true;
    });
  }, [
    scopedActiveSpecimens,
    activeCollection,
    scope,
    statusFilter,
    trimmedQuery,
  ]);

  // Counts for section / category tabs
  const countsBySection = useMemo(() => {
    const counts: Record<WorkbenchSectionId, number> = {
      foundations: 0,
      components: 0,
      patterns: 0,
      templates: 0,
      behaviour: 0,
      exploration: 0,
    };
    for (const spec of baseFilteredSpecimens) {
      counts[spec.section] += 1;
    }
    return counts;
  }, [baseFilteredSpecimens]);

  const countsByCategory = useMemo(() => {
    const counts = Object.fromEntries(
      COMPONENT_CATEGORIES.map((category) => [category.id, 0]),
    ) as Record<ComponentCategoryId, number>;
    for (const spec of baseFilteredSpecimens) {
      if (spec.section === 'components' && spec.categoryId) {
        counts[spec.categoryId] = (counts[spec.categoryId] ?? 0) + 1;
      }
    }
    return counts;
  }, [baseFilteredSpecimens]);

  const componentMaturityCounts = useMemo(() => {
    const comps = scopedActiveSpecimens.filter(
      (s) => s.section === 'components',
    );
    const production = comps.filter((s) => s.status === 'production').length;
    return {
      total: comps.length,
      production,
      experimental: comps.length - production,
    };
  }, [scopedActiveSpecimens]);

  // Final filtered specimens (applying section or category tab when not searching)
  const visibleSpecimens = useMemo(() => {
    if (trimmedQuery) return baseFilteredSpecimens;
    if (scope === 'all') {
      if (activeSectionFilter === 'all') return baseFilteredSpecimens;
      return baseFilteredSpecimens.filter(
        (s) => s.section === activeSectionFilter,
      );
    }
    if (activeCategoryFilter === 'all') return baseFilteredSpecimens;
    return baseFilteredSpecimens.filter(
      (s) => s.categoryId === activeCategoryFilter,
    );
  }, [
    baseFilteredSpecimens,
    trimmedQuery,
    scope,
    activeSectionFilter,
    activeCategoryFilter,
  ]);

  // Build spatial groups whose members are currently visible
  const visibleSpecimenMap = useMemo(
    () => new Map(visibleSpecimens.map((s) => [s.id, s])),
    [visibleSpecimens],
  );

  const visibleGroups = useMemo(() => {
    return state.groups
      .map((group) => {
        const orderedMembers = applyCustomOrder(
          group.specimenIds
            .map((id) => visibleSpecimenMap.get(id))
            .filter((s): s is WorkbenchSpecimen => Boolean(s)),
          state.sectionOrders[`group:${group.id}`],
        );
        return { group, items: orderedMembers };
      })
      .filter((entry) => entry.items.length > 0);
  }, [state.groups, state.sectionOrders, visibleSpecimenMap]);

  const groupedSpecimenIdSet = useMemo(() => {
    const set = new Set<string>();
    for (const entry of visibleGroups) {
      for (const item of entry.items) {
        set.add(item.id);
      }
    }
    return set;
  }, [visibleGroups]);

  // Ungrouped specimens arranged into clear visual sections
  const sectionBlocks: SpecimenSectionBlock[] = useMemo(() => {
    const ungrouped = visibleSpecimens.filter(
      (s) => !groupedSpecimenIdSet.has(s.id),
    );

    if (scope === 'components') {
      return COMPONENT_CATEGORIES.map((category) => {
        const listKey = `components:${category.id}`;
        const raw = ungrouped.filter((item) => item.categoryId === category.id);
        return {
          listKey,
          heading: category.label,
          sectionId: 'components' as const,
          items: applyCustomOrder(raw, state.sectionOrders[listKey]),
        };
      }).filter((block) => block.items.length > 0);
    }

    // Unified Canvas ('all'): show Foundations, Components (grouped cleanly by category), Patterns, Page Templates, Behaviour, Exploration
    const blocks: SpecimenSectionBlock[] = [];
    for (const sec of WORKBENCH_SECTIONS) {
      const secItems = ungrouped.filter((s) => s.section === sec.id);
      if (secItems.length === 0) continue;

      if (sec.id === 'components' && !activeCollection && !trimmedQuery) {
        for (const category of COMPONENT_CATEGORIES) {
          const catItems = secItems.filter((s) => s.categoryId === category.id);
          if (catItems.length === 0) continue;
          const listKey = `components:${category.id}`;
          blocks.push({
            listKey,
            heading: `Components · ${category.label}`,
            sectionId: 'components',
            items: applyCustomOrder(catItems, state.sectionOrders[listKey]),
          });
        }
      } else {
        const listKey = `section:${sec.id}`;
        blocks.push({
          listKey,
          heading: sec.label,
          sectionId: sec.id,
          items: applyCustomOrder(secItems, state.sectionOrders[listKey]),
        });
      }
    }
    return blocks;
  }, [
    visibleSpecimens,
    groupedSpecimenIdSet,
    scope,
    state.sectionOrders,
    activeCollection,
    trimmedQuery,
  ]);

  // Flat ordered ID list for predictable Shift-click range selection
  const flatVisibleIds = useMemo(() => {
    const ids: string[] = [];
    for (const entry of visibleGroups) {
      for (const item of entry.items) ids.push(item.id);
    }
    for (const block of sectionBlocks) {
      for (const item of block.items) ids.push(item.id);
    }
    return ids;
  }, [visibleGroups, sectionBlocks]);

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const singleSelectedSpecimen = useMemo(() => {
    if (selectedIds.length !== 1) return null;
    return scopedActiveSpecimens.find((s) => s.id === selectedIds[0]) ?? null;
  }, [selectedIds, scopedActiveSpecimens]);

  // Specimens currently loaded in Compare stage
  const compareSpecimens = useMemo(() => {
    const activeMap = new Map(allSpecimens.map((s) => [s.id, s]));
    return state.compareIds
      .filter((id) => !archivedSet.has(id))
      .map((id) => activeMap.get(id))
      .filter((s): s is WorkbenchSpecimen => Boolean(s));
  }, [allSpecimens, state.compareIds, archivedSet]);

  const toggleSelection = useCallback(
    (id: string, shiftKey: boolean) => {
      playTick();
      if (shiftKey && lastSelectedIdRef.current) {
        const anchorIdx = flatVisibleIds.indexOf(lastSelectedIdRef.current);
        const currentIdx = flatVisibleIds.indexOf(id);
        if (anchorIdx !== -1 && currentIdx !== -1) {
          const [start, end] =
            anchorIdx < currentIdx
              ? [anchorIdx, currentIdx]
              : [currentIdx, anchorIdx];
          const rangeIds = flatVisibleIds.slice(start, end + 1);
          setSelectedIds((prev) => Array.from(new Set([...prev, ...rangeIds])));
          lastSelectedIdRef.current = id;
          return;
        }
      }
      setSelectedIds((prev) => {
        if (prev.includes(id)) {
          return prev.filter((item) => item !== id);
        }
        return [...prev, id];
      });
      lastSelectedIdRef.current = id;
    },
    [flatVisibleIds],
  );

  const collectOrigins = useCallback(
    (ids: readonly string[]): ArchiveOriginRect[] => {
      const origins: ArchiveOriginRect[] = [];
      for (const id of ids) {
        const el = cardRefs.current[id];
        const spec = allSpecimens.find((s) => s.id === id);
        if (el && spec) {
          origins.push({
            id,
            title: spec.title,
            rect: el.getBoundingClientRect(),
          });
        }
      }
      return origins;
    },
    [allSpecimens],
  );

  const handleArchiveIds = useCallback(
    (ids: readonly string[]) => {
      if (ids.length === 0) return;
      const origins = collectOrigins(ids);
      onArchiveSpecimens(ids, origins);
      setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
    },
    [collectOrigins, onArchiveSpecimens],
  );

  const handleDuplicateIds = useCallback(
    (ids: readonly string[]) => {
      if (ids.length === 0) return;
      onUpdateState((prev) => duplicateSpecimens(prev, ids).nextState);
      showToast({
        message:
          ids.length === 1
            ? 'Created study copy in canvas'
            : `Created ${ids.length} study copies`,
        tone: 'success',
        durationMs: 2200,
      });
    },
    [onUpdateState],
  );

  const handleCompareIds = useCallback(
    (ids: readonly string[]) => {
      if (ids.length === 0) return;
      onUpdateState((prev) =>
        ids.length >= 2
          ? setCompareSpecimens(prev, ids)
          : addToCompare(prev, ids),
      );
      onModeChange('compare');
    },
    [onUpdateState, onModeChange],
  );

  const handleGroupSelected = useCallback(
    (name: string) => {
      if (selectedIds.length === 0) return;
      onUpdateState((prev) => createGroup(prev, name, selectedIds).nextState);
      playSuccessChime();
      showToast({
        message: `Grouped ${selectedIds.length} specimens under "${name.trim()}"`,
        tone: 'success',
        durationMs: 2400,
      });
      setSelectedIds([]);
    },
    [selectedIds, onUpdateState],
  );

  const handleCreateNewCollection = useCallback(
    (name: string, initialIds: readonly string[] = []) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      let createdId: string | null = null;
      onUpdateState((prev) => {
        const res = createCollection(prev, trimmed, initialIds);
        createdId = res.collection?.id ?? null;
        return res.nextState;
      });
      playSuccessChime();
      showToast({
        message:
          initialIds.length > 0
            ? `Created "${trimmed}" with ${initialIds.length} ${initialIds.length === 1 ? 'specimen' : 'specimens'}`
            : `Created collection "${trimmed}"`,
        tone: 'success',
        durationMs: 2400,
      });
      if (createdId && initialIds.length === 0) {
        setActiveCollectionId(createdId);
      }
    },
    [onUpdateState],
  );

  const handleCardClick = (
    event: React.MouseEvent<HTMLDivElement>,
    specimen: WorkbenchSpecimen,
  ) => {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      return;
    }

    if (event.shiftKey) {
      event.preventDefault();
      toggleSelection(specimen.id, true);
      return;
    }

    // In Component Library Browse mode with no active selection, direct click opens the detailed component page
    if (
      scope === 'components' &&
      mode === 'browse' &&
      selectedIds.length === 0
    ) {
      playTick();
      onOpenSpecimenDetail(specimen);
      return;
    }

    toggleSelection(specimen.id, false);
  };

  const handleCardContextMenu = (
    event: React.MouseEvent<HTMLDivElement>,
    specimen: WorkbenchSpecimen,
  ) => {
    event.preventDefault();
    playTick();
    setContextMenu({
      specimen,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const clearLongPress = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressTouchOriginRef.current = null;
  };

  const handleCardTouchStart = (
    event: React.TouchEvent<HTMLDivElement>,
    specimen: WorkbenchSpecimen,
  ) => {
    if (event.touches.length !== 1) return;
    const touch = event.touches[0];
    longPressTouchOriginRef.current = { x: touch.clientX, y: touch.clientY };
    longPressTimerRef.current = window.setTimeout(() => {
      suppressNextClickRef.current = true;
      playTick();
      setContextMenu({
        specimen,
        x: touch.clientX,
        y: touch.clientY,
      });
      longPressTimerRef.current = null;
    }, 520);
  };

  const handleCardTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!longPressTouchOriginRef.current || event.touches.length !== 1) return;
    const touch = event.touches[0];
    const dx = touch.clientX - longPressTouchOriginRef.current.x;
    const dy = touch.clientY - longPressTouchOriginRef.current.y;
    if (Math.hypot(dx, dy) > 10) {
      clearLongPress();
    }
  };

  const resetAllFilters = () => {
    playTick();
    setSearchQuery('');
    setActiveSectionFilter('all');
    setActiveCategoryFilter('all');
    setStatusFilter('all');
    setActiveCollectionId(null);
  };

  const renderSpecimenCard = (
    specimen: WorkbenchSpecimen,
    listKey: string,
    orderedIds: readonly string[],
  ) => {
    const isSelected = selectedIdSet.has(specimen.id);
    const isWide = state.cardSizes[specimen.id] === 'wide';
    const isDragging = draggingInfo?.id === specimen.id;
    const isDragOver =
      dragOverId === specimen.id &&
      draggingInfo?.listKey === listKey &&
      draggingInfo?.id !== specimen.id;

    return (
      <div
        key={specimen.id}
        ref={(el) => {
          cardRefs.current[specimen.id] = el;
        }}
        data-specimen-id={specimen.id}
        draggable={mode === 'arrange'}
        onDragStart={(e) => {
          if (mode !== 'arrange') {
            e.preventDefault();
            return;
          }
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', specimen.id);
          setDraggingInfo({ id: specimen.id, listKey });
        }}
        onDragOver={(e) => {
          if (mode !== 'arrange' || !draggingInfo) return;
          if (draggingInfo.listKey !== listKey) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          if (dragOverId !== specimen.id) {
            setDragOverId(specimen.id);
          }
        }}
        onDragLeave={() => {
          if (dragOverId === specimen.id) {
            setDragOverId(null);
          }
        }}
        onDrop={(e) => {
          if (mode !== 'arrange' || !draggingInfo) return;
          if (draggingInfo.listKey !== listKey) return;
          e.preventDefault();
          const draggedId = draggingInfo.id;
          if (draggedId && draggedId !== specimen.id) {
            playTick();
            onUpdateState((prev) =>
              reorderSpecimenInList(
                prev,
                listKey,
                draggedId,
                specimen.id,
                orderedIds,
              ),
            );
          }
          setDraggingInfo(null);
          setDragOverId(null);
        }}
        onDragEnd={() => {
          setDraggingInfo(null);
          setDragOverId(null);
        }}
        onClick={(e) => handleCardClick(e, specimen)}
        onDoubleClick={() => {
          playTick();
          onOpenSpecimenDetail(specimen);
        }}
        onContextMenu={(e) => handleCardContextMenu(e, specimen)}
        onTouchStart={(e) => handleCardTouchStart(e, specimen)}
        onTouchMove={handleCardTouchMove}
        onTouchEnd={clearLongPress}
        onTouchCancel={clearLongPress}
        role="group"
        aria-label={specimen.title}
        aria-selected={isSelected}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            playTick();
            onOpenSpecimenDetail(specimen);
          } else if (e.key === ' ') {
            e.preventDefault();
            toggleSelection(specimen.id, e.shiftKey);
          }
        }}
        className={`group relative flex flex-col text-left transition-all duration-200 focus-visible:outline-none ${
          isWide ? 'md:col-span-2' : ''
        } ${isDragging ? 'scale-[0.98] opacity-45' : ''} ${
          mode === 'arrange' ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
        }`}
      >
        {/* Visual Specimen Stage */}
        <div
          data-ds-sandbox="true"
          data-ds-palette={sandboxPalette}
          data-ds-theme={sandboxTheme}
          className={`relative flex ${
            isWide
              ? 'aspect-[16/11] min-h-[212px] md:aspect-[33/11]'
              : 'aspect-[16/11] min-h-[212px]'
          } w-full items-center justify-center overflow-hidden rounded-[18px] border !bg-[var(--apple-bg-secondary)] px-6 py-5 transition-all duration-200 group-focus-visible:ring-2 group-focus-visible:ring-[var(--apple-blue)] ${
            isDragOver
              ? 'border-[var(--apple-blue)] ring-2 ring-[var(--apple-blue)]'
              : isSelected
                ? 'border-[var(--apple-blue)] ring-2 ring-[var(--apple-blue)]/45 shadow-[var(--shadow-apple-subtle)]'
                : 'border-[var(--apple-separator-subtle)] group-hover:border-[var(--apple-separator-strong)] group-hover:shadow-[var(--shadow-apple-subtle)]'
          }`}
        >
          {/* Top-Left Selection Checkbox (visible on hover, focus, or when selected) */}
          <button
            type="button"
            aria-label={
              isSelected
                ? `Deselect ${specimen.title}`
                : `Select ${specimen.title}`
            }
            aria-pressed={isSelected}
            onClick={(e) => {
              e.stopPropagation();
              toggleSelection(specimen.id, e.shiftKey);
            }}
            className={`absolute top-2.5 left-2.5 z-10 flex h-6 w-6 items-center justify-center rounded-full border transition-all ${
              isSelected
                ? 'border-[var(--apple-blue-fill)] bg-[var(--apple-blue-fill)] text-white opacity-100'
                : 'border-[var(--apple-separator-strong)] bg-[var(--apple-surface-elevated)]/90 text-transparent opacity-0 hover:border-[var(--apple-blue)] group-hover:opacity-100 group-focus-within:opacity-100'
            }`}
          >
            <Check size={11} strokeWidth={2} aria-hidden="true" />
          </button>

          {/* Top-Right Quick Controls (Arrange Resize + Open Detail) */}
          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1">
            {mode === 'arrange' && (
              <button
                type="button"
                aria-label={
                  isWide
                    ? `Reset ${specimen.title} to default width`
                    : `Expand ${specimen.title} to wide width`
                }
                title={isWide ? 'Reset to 1× width' : 'Expand to 2× width'}
                onClick={(e) => {
                  e.stopPropagation();
                  playTick();
                  onUpdateState((prev) => toggleCardSize(prev, specimen.id));
                }}
                className="flex h-6 items-center gap-1 rounded-full border border-[var(--apple-separator-strong)] bg-[var(--apple-surface-elevated)]/92 px-2 text-[10.5px] font-medium text-[var(--apple-label-primary)] shadow-2xs transition-colors hover:border-[var(--apple-blue)]"
              >
                <Maximize2 size={10} strokeWidth={2} aria-hidden="true" />
                <span>{isWide ? '1×' : '2×'}</span>
              </button>
            )}

            <button
              type="button"
              aria-label={`Open ${specimen.title} detail`}
              title="Open detail page"
              onClick={(e) => {
                e.stopPropagation();
                playTick();
                onOpenSpecimenDetail(specimen);
              }}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--apple-separator-strong)] bg-[var(--apple-surface-elevated)]/92 text-[var(--apple-label-secondary)] opacity-0 shadow-2xs transition-all hover:text-[var(--apple-label-primary)] group-hover:opacity-100 group-focus-within:opacity-100"
            >
              <ArrowUpRight size={11} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>

          {/* Live Rendered Specimen Preview */}
          <WorkbenchSpecimenPreview
            specimen={specimen}
            appliedTocVariant={appliedTocVariant}
            experimentsCount={experimentsCount}
          />
        </div>

        {/* Minimal Apple/HeroUI Caption Row */}
        <div className="mt-2.5 flex items-baseline justify-between gap-3 px-0.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              playTick();
              onOpenSpecimenDetail(specimen);
            }}
            className="apple-link min-w-0 truncate text-left text-[14.5px] font-medium tracking-[-0.012em] text-[var(--apple-label-primary)] hover:underline"
          >
            {specimen.title}
          </button>

          <span className="shrink-0 tabular-nums text-[12px] text-[var(--apple-label-tertiary)]">
            {specimen.status === 'experimental' ? (
              <span className="text-[var(--apple-warning)]">
                Experimental · {specimen.meta}
              </span>
            ) : (
              specimen.meta
            )}
          </span>
        </div>
      </div>
    );
  };

  const contextMenuIsMemberOf = (colId: string, specimenId: string) =>
    state.collections
      .find((c) => c.id === colId)
      ?.specimenIds.includes(specimenId) ?? false;

  return (
    <div className="space-y-7 pb-14">
      {/* ── Top Workbench Control Bar ─────────────────────────────────────── */}
      <div className="space-y-3.5">
        {/* Row 1: Mode Switcher (Browse / Arrange / Compare) + Search + Maturity */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div
            role="tablist"
            aria-label="Workbench mode"
            className="apple-segmented self-start"
          >
            {(
              [
                { id: 'browse', label: 'Browse' },
                { id: 'arrange', label: 'Arrange' },
                {
                  id: 'compare',
                  label:
                    compareSpecimens.length > 0
                      ? `Compare (${compareSpecimens.length})`
                      : 'Compare',
                },
              ] as const
            ).map((tab) => {
              const active = mode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    playTick();
                    onModeChange(tab.id);
                  }}
                  className={`apple-segmented-item !min-h-[32px] whitespace-nowrap px-3.5 py-1 text-[12.5px] ${
                    active
                      ? 'text-[var(--apple-label-primary)]'
                      : 'text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId={`wb-mode-thumb-${scope}`}
                      transition={SPRING_SEGMENT}
                      className="apple-pill-shadow absolute inset-0 rounded-full bg-[var(--apple-control-thumb)]"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {mode !== 'compare' && (
            <div className="flex flex-1 flex-wrap items-center justify-end gap-2.5">
              <div className="relative min-w-[200px] flex-1 sm:max-w-[300px]">
                <Search
                  size={14}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[var(--apple-label-tertiary)]"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    scope === 'all'
                      ? `Search ${scopedActiveSpecimens.length} specimens…`
                      : `Search ${scopedActiveSpecimens.length} components…`
                  }
                  aria-label={
                    scope === 'all'
                      ? 'Search design system workbench'
                      : 'Search component library'
                  }
                  className="apple-input min-h-[36px] w-full rounded-[11px] py-1.5 pr-9 pl-9 text-[13px]"
                />
                {searchQuery.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      playTick();
                      setSearchQuery('');
                    }}
                    aria-label="Clear search"
                    className="apple-btn-icon absolute top-1/2 right-1.5 h-7 w-7 -translate-y-1/2 text-[var(--apple-label-tertiary)]"
                  >
                    <X size={12} strokeWidth={2} aria-hidden="true" />
                  </button>
                )}
              </div>

              {scope === 'components' && (
                <div
                  className="apple-segmented"
                  role="group"
                  aria-label="Filter by maturity"
                >
                  {(
                    [
                      { id: 'all', label: `All (${componentMaturityCounts.total})` },
                      {
                        id: 'production',
                        label: `Production (${componentMaturityCounts.production})`,
                      },
                      {
                        id: 'experimental',
                        label: `Experimental (${componentMaturityCounts.experimental})`,
                      },
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
                        className={`apple-segmented-item !min-h-[30px] whitespace-nowrap px-2.5 text-[12px] ${
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
              )}
            </div>
          )}
        </div>

        {/* Row 2: Named Collections Switcher (non-duplicated references) */}
        {mode !== 'compare' && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--apple-separator-subtle)] pt-3">
            <nav
              aria-label="Collections"
              className="-mx-1 flex flex-wrap items-center gap-1 px-1"
            >
              <button
                type="button"
                aria-pressed={activeCollectionId === null}
                onClick={() => {
                  playTick();
                  setActiveCollectionId(null);
                }}
                className={`apple-link inline-flex min-h-[30px] items-center gap-1.5 whitespace-nowrap rounded-[8px] px-2.5 text-[12.5px] transition-colors ${
                  activeCollectionId === null
                    ? 'bg-[var(--apple-control-tonal)] font-semibold text-[var(--apple-label-primary)]'
                    : 'text-[var(--apple-label-secondary)] hover:bg-[var(--apple-bg-secondary)] hover:text-[var(--apple-label-primary)]'
                }`}
              >
                <span>Main Library</span>
                <span className="tabular-nums text-[11px] text-[var(--apple-label-tertiary)]">
                  {scopedActiveSpecimens.length}
                </span>
              </button>

              {state.collections.map((col) => {
                const isActive = activeCollectionId === col.id;
                const activeCount = col.specimenIds.filter(
                  (id) =>
                    !archivedSet.has(id) &&
                    scopedActiveSpecimens.some((s) => s.id === id),
                ).length;

                return (
                  <div key={col.id} className="inline-flex items-center">
                    <button
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => {
                        playTick();
                        setActiveCollectionId(col.id);
                      }}
                      className={`apple-link inline-flex min-h-[30px] items-center gap-1.5 whitespace-nowrap rounded-[8px] px-2.5 text-[12.5px] transition-colors ${
                        isActive
                          ? 'bg-[var(--apple-control-tonal)] font-semibold text-[var(--apple-label-primary)]'
                          : 'text-[var(--apple-label-secondary)] hover:bg-[var(--apple-bg-secondary)] hover:text-[var(--apple-label-primary)]'
                      }`}
                    >
                      <span>{col.name}</span>
                      <span className="tabular-nums text-[11px] text-[var(--apple-label-tertiary)]">
                        {activeCount}
                      </span>
                    </button>
                  </div>
                );
              })}

              {creatingCollection ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newCollectionInput.trim()) return;
                    handleCreateNewCollection(newCollectionInput);
                    setNewCollectionInput('');
                    setCreatingCollection(false);
                  }}
                  className="inline-flex items-center gap-1.5 pl-1"
                >
                  <input
                    type="text"
                    value={newCollectionInput}
                    onChange={(e) => setNewCollectionInput(e.target.value)}
                    placeholder="Collection name…"
                    aria-label="New collection name"
                    autoFocus
                    className="apple-input !min-h-[30px] w-[165px] !rounded-[8px] !px-2.5 !py-0.5 !text-[12px]"
                  />
                  <button
                    type="submit"
                    className="apple-btn-primary !min-h-[30px] !px-2.5 !py-0.5 !text-[12px]"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCreatingCollection(false);
                      setNewCollectionInput('');
                    }}
                    aria-label="Cancel new collection"
                    className="apple-btn-icon h-7 w-7 text-[var(--apple-label-tertiary)]"
                  >
                    <X size={11} strokeWidth={2} aria-hidden="true" />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    playTick();
                    setCreatingCollection(true);
                  }}
                  className="apple-link inline-flex min-h-[30px] items-center gap-1 whitespace-nowrap rounded-[8px] px-2.5 text-[12px] font-medium text-[var(--apple-link)] transition-colors hover:bg-[var(--apple-bg-secondary)]"
                >
                  <Plus size={11} strokeWidth={2} aria-hidden="true" />
                  <span>New Collection</span>
                </button>
              )}
            </nav>

            {activeCollection && (
              <button
                type="button"
                onClick={() => {
                  playTick();
                  const colName = activeCollection.name;
                  onUpdateState((prev) =>
                    deleteCollection(prev, activeCollection.id),
                  );
                  setActiveCollectionId(null);
                  showToast({
                    message: `Removed collection "${colName}" (specimens kept in Main Library)`,
                    tone: 'info',
                    durationMs: 2400,
                  });
                }}
                className="apple-link text-[12px] font-medium text-[var(--apple-label-tertiary)] hover:text-[var(--apple-label-primary)] hover:underline"
              >
                Delete collection
              </button>
            )}
          </div>
        )}

        {/* Row 3: Section or Category Filter Bar */}
        {mode !== 'compare' && (
          <nav
            aria-label={
              scope === 'all'
                ? 'Filter by design system section'
                : 'Filter by component category'
            }
            className="-mx-1 flex items-center gap-1 overflow-x-auto px-1 pb-1"
          >
            {scope === 'all' ? (
              <>
                <button
                  type="button"
                  aria-pressed={
                    trimmedQuery.length === 0 && activeSectionFilter === 'all'
                  }
                  onClick={() => {
                    playTick();
                    if (trimmedQuery) setSearchQuery('');
                    setActiveSectionFilter('all');
                  }}
                  className={`apple-link inline-flex min-h-[32px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[9px] px-3 text-[13px] transition-colors ${
                    trimmedQuery.length === 0 && activeSectionFilter === 'all'
                      ? 'bg-[var(--apple-control-tonal)] font-semibold text-[var(--apple-label-primary)]'
                      : 'text-[var(--apple-label-secondary)] hover:bg-[var(--apple-bg-secondary)] hover:text-[var(--apple-label-primary)]'
                  }`}
                >
                  <span>All</span>
                  <span className="tabular-nums text-[11.5px] text-[var(--apple-label-tertiary)]">
                    {baseFilteredSpecimens.length}
                  </span>
                </button>
                {WORKBENCH_SECTIONS.map((sec) => {
                  const active =
                    trimmedQuery.length === 0 && activeSectionFilter === sec.id;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        playTick();
                        if (trimmedQuery) setSearchQuery('');
                        setActiveSectionFilter(sec.id);
                      }}
                      className={`apple-link inline-flex min-h-[32px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[9px] px-3 text-[13px] transition-colors ${
                        active
                          ? 'bg-[var(--apple-control-tonal)] font-semibold text-[var(--apple-label-primary)]'
                          : 'text-[var(--apple-label-secondary)] hover:bg-[var(--apple-bg-secondary)] hover:text-[var(--apple-label-primary)]'
                      }`}
                    >
                      <span>{sec.shortLabel}</span>
                      <span className="tabular-nums text-[11.5px] text-[var(--apple-label-tertiary)]">
                        {countsBySection[sec.id]}
                      </span>
                    </button>
                  );
                })}
              </>
            ) : (
              <>
                <button
                  type="button"
                  aria-pressed={
                    trimmedQuery.length === 0 && activeCategoryFilter === 'all'
                  }
                  onClick={() => {
                    playTick();
                    if (trimmedQuery) setSearchQuery('');
                    setActiveCategoryFilter('all');
                  }}
                  className={`apple-link inline-flex min-h-[32px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[9px] px-3 text-[13px] transition-colors ${
                    trimmedQuery.length === 0 && activeCategoryFilter === 'all'
                      ? 'bg-[var(--apple-control-tonal)] font-semibold text-[var(--apple-label-primary)]'
                      : 'text-[var(--apple-label-secondary)] hover:bg-[var(--apple-bg-secondary)] hover:text-[var(--apple-label-primary)]'
                  }`}
                >
                  <span>All</span>
                  <span className="tabular-nums text-[11.5px] text-[var(--apple-label-tertiary)]">
                    {baseFilteredSpecimens.length}
                  </span>
                </button>
                {COMPONENT_CATEGORIES.map((category) => {
                  const count = countsByCategory[category.id];
                  const active =
                    trimmedQuery.length === 0 &&
                    activeCategoryFilter === category.id;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        playTick();
                        if (trimmedQuery) setSearchQuery('');
                        if (statusFilter === 'experimental' && count === 0) {
                          setStatusFilter('all');
                        }
                        setActiveCategoryFilter(category.id);
                      }}
                      className={`apple-link inline-flex min-h-[32px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[9px] px-3 text-[13px] transition-colors ${
                        active
                          ? 'bg-[var(--apple-control-tonal)] font-semibold text-[var(--apple-label-primary)]'
                          : 'text-[var(--apple-label-secondary)] hover:bg-[var(--apple-bg-secondary)] hover:text-[var(--apple-label-primary)]'
                      }`}
                    >
                      <span>{category.shortLabel}</span>
                      <span className="tabular-nums text-[11.5px] text-[var(--apple-label-tertiary)]">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </>
            )}
          </nav>
        )}

        {/* Quiet Arrange Mode Toolbar */}
        {mode === 'arrange' && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)]/70 px-4 py-2.5">
            <p className="text-[12.5px] text-[var(--apple-label-secondary)]">
              <span className="font-medium text-[var(--apple-label-primary)]">
                Arrange Mode
              </span>{' '}
              — Drag cards to reorder, click <span className="font-medium">2×</span> to
              resize, or select multiple cards to group.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  playSuccessChime();
                  showToast({
                    message: 'Custom canvas arrangement saved locally',
                    tone: 'success',
                    durationMs: 2200,
                  });
                }}
                className="apple-btn-tonal !min-h-[30px] whitespace-nowrap !px-3 !py-1 !text-[12px]"
              >
                Save Arrangement
              </button>
              <button
                type="button"
                onClick={() => {
                  playTick();
                  onUpdateState((prev) => resetArrangement(prev));
                  showToast({
                    message: 'Restored default canvas layout',
                    tone: 'info',
                    durationMs: 2200,
                  });
                }}
                className="apple-link inline-flex min-h-[30px] items-center gap-1 whitespace-nowrap rounded-[8px] px-2.5 text-[12px] font-medium text-[var(--apple-label-secondary)] hover:bg-[var(--apple-control-tonal)] hover:text-[var(--apple-label-primary)]"
              >
                <RotateCcw size={11} strokeWidth={2} aria-hidden="true" />
                <span>Restore Defaults</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Main Stage: Compare OR Browse/Arrange Spatial Canvas ─────────── */}
      {mode === 'compare' ? (
        <WorkbenchCompareStage
          compareSpecimens={compareSpecimens}
          allActiveSpecimens={allSpecimens.filter((s) => !archivedSet.has(s.id))}
          sandboxPalette={sandboxPalette}
          sandboxTheme={sandboxTheme}
          appliedTocVariant={appliedTocVariant}
          experimentsCount={experimentsCount}
          onAddToCompare={(id) =>
            onUpdateState((prev) => addToCompare(prev, [id]))
          }
          onRemoveFromCompare={(id) =>
            onUpdateState((prev) => removeFromCompare(prev, id))
          }
          onOpenDetail={onOpenSpecimenDetail}
          onReturnMode={(next) => onModeChange(next)}
        />
      ) : (
        <div
          className={
            mode === 'arrange'
              ? 'space-y-12 rounded-[22px] border border-[var(--apple-separator-subtle)] p-5 sm:p-7'
              : 'space-y-12'
          }
          style={
            mode === 'arrange'
              ? {
                  backgroundImage:
                    'radial-gradient(circle, var(--apple-separator) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }
              : undefined
          }
        >
          {/* Active Collection Header */}
          {activeCollection && (
            <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[var(--apple-separator-subtle)] pb-4">
              <div>
                <h2 className="font-display text-[20px] font-semibold tracking-[-0.022em] text-[var(--apple-label-primary)]">
                  {activeCollection.name}
                </h2>
                <p className="mt-0.5 text-[13px] text-[var(--apple-label-secondary)]">
                  Collection references specimens from the main library without
                  duplication.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  playTick();
                  setActiveCollectionId(null);
                }}
                className="apple-link text-[12.5px] font-medium text-[var(--apple-link)] hover:underline"
              >
                Back to Main Library
              </button>
            </div>
          )}

          {/* Custom Spatial Groups (FigJam-style frames) */}
          {visibleGroups.length > 0 && (
            <div className="space-y-6">
              {visibleGroups.map(({ group, items }) => {
                const listKey = `group:${group.id}`;
                const orderedIds = items.map((i) => i.id);
                const isEditing = editingGroupId === group.id;

                return (
                  <section
                    key={group.id}
                    aria-label={`Group ${group.name}`}
                    className="space-y-5 rounded-[22px] border border-[var(--apple-separator)] bg-[var(--apple-bg)]/90 p-5 shadow-[var(--shadow-apple-subtle)] sm:p-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        {isEditing ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              onUpdateState((prev) =>
                                renameGroup(prev, group.id, editingGroupName),
                              );
                              setEditingGroupId(null);
                            }}
                            className="flex items-center gap-1.5"
                          >
                            <input
                              type="text"
                              value={editingGroupName}
                              onChange={(e) =>
                                setEditingGroupName(e.target.value)
                              }
                              aria-label="Rename group"
                              autoFocus
                              className="apple-input !min-h-[30px] w-[200px] !rounded-[8px] !px-2.5 !py-0.5 !text-[13px]"
                            />
                            <button
                              type="submit"
                              className="apple-btn-primary !min-h-[30px] !px-2.5 !py-0.5 !text-[12px]"
                            >
                              Save
                            </button>
                          </form>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              playTick();
                              setEditingGroupId(group.id);
                              setEditingGroupName(group.name);
                            }}
                            title="Click to rename group"
                            className="font-display text-[17px] font-semibold tracking-[-0.02em] text-[var(--apple-label-primary)] hover:underline"
                          >
                            {group.name}
                          </button>
                        )}
                        <span className="tabular-nums text-[12px] text-[var(--apple-label-tertiary)]">
                          {items.length}{' '}
                          {items.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[12px]">
                        <button
                          type="button"
                          onClick={() => {
                            playTick();
                            setSelectedIds((prev) =>
                              Array.from(new Set([...prev, ...orderedIds])),
                            );
                          }}
                          className="apple-link font-medium text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]"
                        >
                          Select group
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            playTick();
                            onUpdateState((prev) =>
                              ungroupSpecimens(prev, group.id),
                            );
                          }}
                          className="apple-link font-medium text-[var(--apple-label-tertiary)] hover:text-[var(--apple-label-primary)]"
                        >
                          Ungroup
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
                      {items.map((item) =>
                        renderSpecimenCard(item, listKey, orderedIds),
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          {/* Main Sectioned Specimen Grids */}
          {sectionBlocks.length === 0 && visibleGroups.length === 0 ? (
            <div className="rounded-[18px] border border-[var(--apple-separator-subtle)] bg-[var(--apple-bg-secondary)]/55 px-6 py-12 text-center">
              <p className="text-[15px] font-semibold text-[var(--apple-label-primary)]">
                {activeCollection
                  ? `No specimens in "${activeCollection.name}" yet`
                  : 'No specimens match this filter'}
              </p>
              <p className="mt-1 text-[13.5px] text-[var(--apple-label-secondary)]">
                {activeCollection
                  ? 'Right-click any specimen in Main Library or use the selection bar to add it here.'
                  : 'Clear your search or switch back to All specimens.'}
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="apple-btn-tonal mt-4 !min-h-[36px] !px-4 !text-[13px]"
              >
                {activeCollection ? 'Return to Main Library' : 'Reset filters'}
              </button>
            </div>
          ) : (
            sectionBlocks.map((block) => {
              const orderedIds = block.items.map((i) => i.id);
              const allBlockSelected =
                orderedIds.length > 0 &&
                orderedIds.every((id) => selectedIdSet.has(id));

              return (
                <section
                  key={block.listKey}
                  aria-labelledby={`wb-sec-${block.listKey}`}
                  className="space-y-5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-4">
                    <div className="flex items-baseline gap-2.5">
                      <h2
                        id={`wb-sec-${block.listKey}`}
                        className="font-display text-[20px] font-semibold tracking-[-0.022em] text-[var(--apple-label-primary)]"
                      >
                        {block.heading}
                      </h2>
                      <span className="tabular-nums text-[12px] text-[var(--apple-label-tertiary)]">
                        {block.items.length}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        playTick();
                        if (allBlockSelected) {
                          setSelectedIds((prev) =>
                            prev.filter((id) => !orderedIds.includes(id)),
                          );
                        } else {
                          setSelectedIds((prev) =>
                            Array.from(new Set([...prev, ...orderedIds])),
                          );
                        }
                      }}
                      className="apple-link text-[12px] font-medium text-[var(--apple-label-tertiary)] transition-colors hover:text-[var(--apple-label-primary)]"
                    >
                      {allBlockSelected ? 'Deselect section' : 'Select All'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
                    {block.items.map((item) =>
                      renderSpecimenCard(item, block.listKey, orderedIds),
                    )}
                  </div>
                </section>
              );
            })
          )}
        </div>
      )}

      {/* ── Contextual Right-Click / Long-Press Menu ─────────────────────── */}
      <WorkbenchContextMenu
        menu={contextMenu}
        mode={mode}
        isSelected={
          contextMenu ? selectedIdSet.has(contextMenu.specimen.id) : false
        }
        isWide={
          contextMenu
            ? state.cardSizes[contextMenu.specimen.id] === 'wide'
            : false
        }
        collections={state.collections}
        onClose={() => setContextMenu(null)}
        onOpenDetail={onOpenSpecimenDetail}
        onToggleSelect={(id) => toggleSelection(id, false)}
        onCompare={handleCompareIds}
        onDuplicate={handleDuplicateIds}
        onRemoveDuplicate={(id) => {
          onUpdateState((prev) => removeDuplicate(prev, id));
          showToast({
            message: 'Removed study copy',
            tone: 'info',
            durationMs: 2000,
          });
        }}
        onToggleResize={(id) =>
          onUpdateState((prev) => toggleCardSize(prev, id))
        }
        onToggleCollection={(colId, specimenId, isMember) => {
          const currentlyMember =
            isMember || contextMenuIsMemberOf(colId, specimenId);
          onUpdateState((prev) =>
            updateCollectionMembership(
              prev,
              colId,
              [specimenId],
              currentlyMember ? 'remove' : 'add',
            ),
          );
          const colName =
            state.collections.find((c) => c.id === colId)?.name ?? 'Collection';
          showToast({
            message: currentlyMember
              ? `Removed from "${colName}"`
              : `Added to "${colName}"`,
            tone: 'info',
            durationMs: 2000,
          });
        }}
        onCreateCollectionFor={(name, specimenId) =>
          handleCreateNewCollection(name, [specimenId])
        }
        onArchive={(spec) => handleArchiveIds([spec.id])}
      />

      {/* ── Floating Contextual Selection Toolbar (only when selected > 0) ── */}
      {mode !== 'compare' && (
        <WorkbenchSelectionBar
          selectedIds={selectedIds}
          visibleCount={flatVisibleIds.length}
          singleSelectedSpecimen={singleSelectedSpecimen}
          collections={state.collections}
          onSelectAllVisible={() => setSelectedIds([...flatVisibleIds])}
          onClearSelection={() => setSelectedIds([])}
          onOpenDetail={onOpenSpecimenDetail}
          onCompareSelected={() => handleCompareIds(selectedIds)}
          onGroupSelected={handleGroupSelected}
          onAddSelectedToCollection={(colId) => {
            onUpdateState((prev) =>
              updateCollectionMembership(prev, colId, selectedIds, 'add'),
            );
            const colName =
              state.collections.find((c) => c.id === colId)?.name ??
              'Collection';
            playSuccessChime();
            showToast({
              message: `Added ${selectedIds.length} to "${colName}"`,
              tone: 'success',
              durationMs: 2200,
            });
          }}
          onCreateCollectionFromSelected={(name) =>
            handleCreateNewCollection(name, selectedIds)
          }
          onDuplicateSelected={() => handleDuplicateIds(selectedIds)}
          onArchiveSelected={() => handleArchiveIds(selectedIds)}
        />
      )}
    </div>
  );
}
