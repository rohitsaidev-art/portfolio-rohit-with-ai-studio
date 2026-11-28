import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { ResolvedTheme } from '../../utils/appearance';
import { COMPONENT_LIBRARY_ITEMS } from '../../utils/componentLibraryCatalog';
import { EASE_APPLE } from '../../utils/motion';
import type { TocVariant } from '../../utils/portfolio';
import { playTick } from '../../utils/soundEngine';
import { showToast } from '../../utils/toast';
import type {
  WorkbenchCollection,
  WorkbenchMode,
  WorkbenchSpecimen,
} from '../../utils/workbenchStore';
import type { VisualPaletteId } from '../../utils/workshopStore';
import {
  ArrowUpRight,
  Check,
  ChevronLeft,
  Copy,
  Maximize2,
  Plus,
  X,
} from 'lucide-react';
import { renderPrimarySpecimen } from './ComponentSpecimensPrimary';
import { renderSecondarySpecimen } from './ComponentSpecimensSecondary';
import { WorkbenchSpecimenPreview } from './WorkbenchSpecimenPreview';

/* ==========================================================================
   1. CONTEXT MENU (Desktop Right-Click & Touch Long-Press)
   ========================================================================== */

export interface ContextMenuState {
  specimen: WorkbenchSpecimen;
  x: number;
  y: number;
}

interface WorkbenchContextMenuProps {
  menu: ContextMenuState | null;
  mode: WorkbenchMode;
  isSelected: boolean;
  isWide: boolean;
  collections: readonly WorkbenchCollection[];
  onClose: () => void;
  onOpenDetail: (specimen: WorkbenchSpecimen) => void;
  onToggleSelect: (id: string) => void;
  onCompare: (ids: readonly string[]) => void;
  onDuplicate: (ids: readonly string[]) => void;
  onRemoveDuplicate?: (id: string) => void;
  onToggleResize: (id: string) => void;
  onToggleCollection: (collectionId: string, specimenId: string, isMember: boolean) => void;
  onCreateCollectionFor: (name: string, specimenId: string) => void;
  onArchive: (specimen: WorkbenchSpecimen) => void;
}

export function WorkbenchContextMenu({
  menu,
  mode,
  isSelected,
  isWide,
  collections,
  onClose,
  onOpenDetail,
  onToggleSelect,
  onCompare,
  onDuplicate,
  onRemoveDuplicate,
  onToggleResize,
  onToggleCollection,
  onCreateCollectionFor,
  onArchive,
}: WorkbenchContextMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [showCollectionPicker, setShowCollectionPicker] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  useEffect(() => {
    setShowCollectionPicker(false);
    setNewCollectionName('');
  }, [menu?.specimen.id]);

  useEffect(() => {
    if (!menu) return;
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('touchstart', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [menu, onClose]);

  if (!menu) return null;

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1440;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 900;
  const clampedX = Math.min(Math.max(12, menu.x), vw - 248);
  const clampedY = Math.min(Math.max(12, menu.y), vh - 330);

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label={`Actions for ${menu.specimen.title}`}
      style={{ left: clampedX, top: clampedY }}
      className="apple-ios-bar fixed z-[65] w-[236px] rounded-[14px] border border-[var(--apple-separator-strong)] p-1.5 shadow-xl"
    >
      <div className="border-b border-[var(--apple-separator-subtle)] px-2.5 py-1.5">
        <p className="truncate text-[12px] font-semibold text-[var(--apple-label-primary)]">
          {menu.specimen.title}
        </p>
        <p className="truncate text-[10.5px] text-[var(--apple-label-tertiary)]">
          {menu.specimen.categoryLabel}
        </p>
      </div>

      <div className="mt-1 space-y-0.5 text-[13px]">
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onOpenDetail(menu.specimen);
            onClose();
          }}
          className="flex w-full items-center justify-between rounded-[9px] px-2.5 py-1.5 text-left text-[var(--apple-label-primary)] transition-colors hover:bg-[var(--apple-control-tonal)]"
        >
          <span>Open Detail</span>
          <ArrowUpRight size={12} strokeWidth={2} aria-hidden="true" className="text-[var(--apple-label-tertiary)]" />
        </button>

        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onToggleSelect(menu.specimen.id);
            onClose();
          }}
          className="flex w-full items-center justify-between rounded-[9px] px-2.5 py-1.5 text-left text-[var(--apple-label-primary)] transition-colors hover:bg-[var(--apple-control-tonal)]"
        >
          <span>{isSelected ? 'Deselect' : 'Select'}</span>
          {isSelected && <Check size={12} strokeWidth={2} aria-hidden="true" className="text-[var(--apple-link)]" />}
        </button>

        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onCompare([menu.specimen.id]);
            onClose();
          }}
          className="flex w-full items-center justify-between rounded-[9px] px-2.5 py-1.5 text-left text-[var(--apple-label-primary)] transition-colors hover:bg-[var(--apple-control-tonal)]"
        >
          <span>Compare Side by Side</span>
        </button>

        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onDuplicate([menu.specimen.id]);
            onClose();
          }}
          className="flex w-full items-center justify-between rounded-[9px] px-2.5 py-1.5 text-left text-[var(--apple-label-primary)] transition-colors hover:bg-[var(--apple-control-tonal)]"
        >
          <span>Duplicate for Study</span>
          <Copy size={12} strokeWidth={2} aria-hidden="true" className="text-[var(--apple-label-tertiary)]" />
        </button>

        {mode === 'arrange' && (
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onToggleResize(menu.specimen.id);
              onClose();
            }}
            className="flex w-full items-center justify-between rounded-[9px] px-2.5 py-1.5 text-left text-[var(--apple-label-primary)] transition-colors hover:bg-[var(--apple-control-tonal)]"
          >
            <span>{isWide ? 'Reset to 1× Width' : 'Expand to 2× Width'}</span>
            <Maximize2 size={12} strokeWidth={2} aria-hidden="true" className="text-[var(--apple-label-tertiary)]" />
          </button>
        )}

        {/* Collection sub-picker */}
        <div className="border-t border-[var(--apple-separator-subtle)] pt-1">
          <button
            type="button"
            role="menuitem"
            aria-expanded={showCollectionPicker}
            onClick={() => {
              playTick();
              setShowCollectionPicker((prev) => !prev);
            }}
            className="flex w-full items-center justify-between rounded-[9px] px-2.5 py-1.5 text-left text-[var(--apple-label-primary)] transition-colors hover:bg-[var(--apple-control-tonal)]"
          >
            <span>Collections</span>
            <span className="text-[11px] text-[var(--apple-label-tertiary)]">
              {showCollectionPicker ? '−' : '+'}
            </span>
          </button>

          {showCollectionPicker && (
            <div className="mt-1 space-y-1 rounded-[10px] bg-[var(--apple-bg-secondary)] p-1.5">
              {collections.map((col) => {
                const isMember = col.specimenIds.includes(menu.specimen.id);
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() =>
                      onToggleCollection(col.id, menu.specimen.id, isMember)
                    }
                    className="flex w-full items-center justify-between rounded-[7px] px-2 py-1 text-left text-[12px] text-[var(--apple-label-primary)] hover:bg-[var(--apple-surface-elevated)]"
                  >
                    <span className="truncate">{col.name}</span>
                    {isMember && (
                      <Check size={12} strokeWidth={2} aria-hidden="true" className="shrink-0 text-[var(--apple-link)]" />
                    )}
                  </button>
                );
              })}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newCollectionName.trim()) return;
                  onCreateCollectionFor(newCollectionName, menu.specimen.id);
                  setNewCollectionName('');
                  onClose();
                }}
                className="flex items-center gap-1 pt-1"
              >
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="New collection…"
                  aria-label="New collection name"
                  className="apple-input !min-h-[28px] min-w-0 flex-1 !rounded-[7px] !px-2 !py-0.5 !text-[11.5px]"
                />
                <button
                  type="submit"
                  className="apple-btn-primary !min-h-[28px] !px-2 !py-0.5 !text-[11px]"
                >
                  Add
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="border-t border-[var(--apple-separator-subtle)] pt-1">
          {menu.specimen.isDuplicate && onRemoveDuplicate ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onRemoveDuplicate(menu.specimen.id);
                onClose();
              }}
              className="flex w-full items-center justify-between rounded-[9px] px-2.5 py-1.5 text-left font-medium text-[var(--apple-error)] transition-colors hover:bg-[var(--apple-error)]/10"
            >
              <span>Remove Study Copy</span>
            </button>
          ) : (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onArchive(menu.specimen);
                onClose();
              }}
              className="flex w-full items-center justify-between rounded-[9px] px-2.5 py-1.5 text-left font-medium text-[var(--apple-label-primary)] transition-colors hover:bg-[var(--apple-control-tonal)]"
            >
              <span>Archive Specimen</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   2. CONTEXTUAL FLOATING SELECTION TOOLBAR
   ========================================================================== */

interface WorkbenchSelectionBarProps {
  selectedIds: readonly string[];
  visibleCount: number;
  singleSelectedSpecimen: WorkbenchSpecimen | null;
  collections: readonly WorkbenchCollection[];
  onSelectAllVisible: () => void;
  onClearSelection: () => void;
  onOpenDetail: (specimen: WorkbenchSpecimen) => void;
  onCompareSelected: () => void;
  onGroupSelected: (name: string) => void;
  onAddSelectedToCollection: (collectionId: string) => void;
  onCreateCollectionFromSelected: (name: string) => void;
  onDuplicateSelected: () => void;
  onArchiveSelected: () => void;
}

export function WorkbenchSelectionBar({
  selectedIds,
  visibleCount,
  singleSelectedSpecimen,
  collections,
  onSelectAllVisible,
  onClearSelection,
  onOpenDetail,
  onCompareSelected,
  onGroupSelected,
  onAddSelectedToCollection,
  onCreateCollectionFromSelected,
  onDuplicateSelected,
  onArchiveSelected,
}: WorkbenchSelectionBarProps) {
  const [popoverMode, setPopoverMode] = useState<'none' | 'group' | 'collection'>('none');
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (selectedIds.length === 0) {
      setPopoverMode('none');
      setInputValue('');
    }
  }, [selectedIds.length]);

  const allSelected = visibleCount > 0 && selectedIds.length >= visibleCount;

  return (
    <AnimatePresence>
      {selectedIds.length > 0 && (
        <motion.div
          role="region"
          aria-label="Selection actions"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.22, ease: EASE_APPLE }}
          className="fixed right-4 bottom-5 left-4 z-40 mx-auto flex max-w-fit flex-col items-center gap-2"
        >
          {/* Optional Inline Popover for Group / Collection */}
          {popoverMode !== 'none' && (
            <div className="apple-ios-bar w-[280px] rounded-[16px] border border-[var(--apple-separator-strong)] p-3 shadow-xl">
              {popoverMode === 'group' ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const name = inputValue.trim() || 'Custom Group';
                    onGroupSelected(name);
                    setInputValue('');
                    setPopoverMode('none');
                  }}
                  className="space-y-2"
                >
                  <p className="text-[12px] font-semibold text-[var(--apple-label-primary)]">
                    Group {selectedIds.length} specimens
                  </p>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      autoFocus
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="e.g. Hero Controls"
                      aria-label="Group name"
                      className="apple-input !min-h-[34px] min-w-0 flex-1 !rounded-[9px] !px-2.5 !py-1 !text-[12.5px]"
                    />
                    <button
                      type="submit"
                      className="apple-btn-primary !min-h-[34px] !px-3 !text-[12px]"
                    >
                      Create
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-2">
                  <p className="text-[12px] font-semibold text-[var(--apple-label-primary)]">
                    Add {selectedIds.length} to Collection
                  </p>
                  <div className="max-h-[140px] space-y-1 overflow-y-auto">
                    {collections.map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => {
                          onAddSelectedToCollection(col.id);
                          setPopoverMode('none');
                        }}
                        className="flex w-full items-center justify-between rounded-[8px] px-2.5 py-1.5 text-left text-[12.5px] text-[var(--apple-label-primary)] hover:bg-[var(--apple-control-tonal)]"
                      >
                        <span className="truncate">{col.name}</span>
                        <span className="tabular-nums text-[11px] text-[var(--apple-label-tertiary)]">
                          {col.specimenIds.length}
                        </span>
                      </button>
                    ))}
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!inputValue.trim()) return;
                      onCreateCollectionFromSelected(inputValue);
                      setInputValue('');
                      setPopoverMode('none');
                    }}
                    className="flex items-center gap-1.5 border-t border-[var(--apple-separator-subtle)] pt-2"
                  >
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="New collection name…"
                      aria-label="New collection name"
                      className="apple-input !min-h-[32px] min-w-0 flex-1 !rounded-[8px] !px-2.5 !py-1 !text-[12px]"
                    />
                    <button
                      type="submit"
                      className="apple-btn-primary !min-h-[32px] !px-3 !text-[12px]"
                    >
                      New
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Main Frosted Selection Pill */}
          <div className="apple-ios-bar flex max-w-full flex-wrap items-center justify-center gap-1 rounded-[18px] border border-[var(--apple-separator-strong)] px-2.5 py-2 shadow-xl sm:rounded-full sm:px-3">
            <span className="px-2 tabular-nums text-[12.5px] font-semibold text-[var(--apple-label-primary)]">
              {selectedIds.length} selected
            </span>

            <span className="mx-0.5 hidden h-4 w-px bg-[var(--apple-separator)] sm:block" />

            <button
              type="button"
              onClick={() => {
                playTick();
                if (allSelected) {
                  onClearSelection();
                } else {
                  onSelectAllVisible();
                }
              }}
              className="apple-link min-h-[32px] whitespace-nowrap rounded-full px-2.5 text-[12px] font-medium text-[var(--apple-label-secondary)] hover:bg-[var(--apple-control-tonal)] hover:text-[var(--apple-label-primary)]"
            >
              {allSelected ? 'Deselect All' : `Select All (${visibleCount})`}
            </button>

            {singleSelectedSpecimen && (
              <button
                type="button"
                onClick={() => {
                  playTick();
                  onOpenDetail(singleSelectedSpecimen);
                }}
                className="apple-btn-tonal !min-h-[32px] whitespace-nowrap !px-3 !py-1 !text-[12px]"
              >
                Open Detail
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                playTick();
                onCompareSelected();
              }}
              className="apple-btn-primary !min-h-[32px] whitespace-nowrap !px-3.5 !py-1 !text-[12px]"
            >
              Compare
            </button>

            <button
              type="button"
              aria-expanded={popoverMode === 'group'}
              onClick={() => {
                playTick();
                setInputValue('');
                setPopoverMode((prev) => (prev === 'group' ? 'none' : 'group'));
              }}
              className="apple-link min-h-[32px] whitespace-nowrap rounded-full px-2.5 text-[12px] font-medium text-[var(--apple-label-primary)] hover:bg-[var(--apple-control-tonal)]"
            >
              Group
            </button>

            <button
              type="button"
              aria-expanded={popoverMode === 'collection'}
              onClick={() => {
                playTick();
                setInputValue('');
                setPopoverMode((prev) =>
                  prev === 'collection' ? 'none' : 'collection',
                );
              }}
              className="apple-link min-h-[32px] whitespace-nowrap rounded-full px-2.5 text-[12px] font-medium text-[var(--apple-label-primary)] hover:bg-[var(--apple-control-tonal)]"
            >
              Collection
            </button>

            <button
              type="button"
              onClick={() => {
                playTick();
                onDuplicateSelected();
              }}
              className="apple-link min-h-[32px] whitespace-nowrap rounded-full px-2.5 text-[12px] font-medium text-[var(--apple-label-primary)] hover:bg-[var(--apple-control-tonal)]"
            >
              Duplicate
            </button>

            <button
              type="button"
              onClick={() => {
                onArchiveSelected();
              }}
              className="apple-link min-h-[32px] whitespace-nowrap rounded-full px-2.5 text-[12px] font-medium text-[var(--apple-label-primary)] hover:bg-[var(--apple-control-tonal)]"
            >
              Archive
            </button>

            <button
              type="button"
              onClick={() => {
                playTick();
                onClearSelection();
              }}
              aria-label="Clear selection"
              className="apple-btn-icon h-8 w-8 text-[var(--apple-label-tertiary)] hover:text-[var(--apple-label-primary)]"
            >
              <X size={13} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ==========================================================================
   3. SIDE-BY-SIDE COMPARE STAGE (Cross-Category & Variant Evaluation)
   ========================================================================== */

interface WorkbenchCompareStageProps {
  compareSpecimens: readonly WorkbenchSpecimen[];
  allActiveSpecimens: readonly WorkbenchSpecimen[];
  sandboxPalette: VisualPaletteId;
  sandboxTheme: ResolvedTheme;
  appliedTocVariant: TocVariant;
  experimentsCount: number;
  onAddToCompare: (id: string) => void;
  onRemoveFromCompare: (id: string) => void;
  onOpenDetail: (specimen: WorkbenchSpecimen) => void;
  onReturnMode: (mode: 'browse' | 'arrange') => void;
}

export function WorkbenchCompareStage({
  compareSpecimens,
  allActiveSpecimens,
  sandboxPalette,
  sandboxTheme,
  appliedTocVariant,
  experimentsCount,
  onAddToCompare,
  onRemoveFromCompare,
  onOpenDetail,
  onReturnMode,
}: WorkbenchCompareStageProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');
  const [interactiveModeById, setInteractiveModeById] = useState<Record<string, boolean>>({});
  const [variantById, setVariantById] = useState<Record<string, number>>({});

  const compareIdSet = useMemo(
    () => new Set(compareSpecimens.map((s) => s.id)),
    [compareSpecimens],
  );

  const availableToAdd = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    return allActiveSpecimens
      .filter((s) => !compareIdSet.has(s.id))
      .filter((s) => !q || s.title.toLowerCase().includes(q) || s.searchText.includes(q))
      .slice(0, 18);
  }, [allActiveSpecimens, compareIdSet, pickerQuery]);

  const handlePreviewNavigate = (path: string) => {
    playTick();
    showToast({ message: `Preview navigation: ${path}`, tone: 'info', durationMs: 2200 });
  };

  return (
    <div className="space-y-6">
      {/* Compare Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-[var(--apple-separator-subtle)] bg-[var(--apple-bg-secondary)]/55 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              playTick();
              onReturnMode('browse');
            }}
            className="apple-link inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--apple-label-primary)] hover:underline"
          >
            <ChevronLeft size={12} strokeWidth={2} aria-hidden="true" />
            <span>Back to Browse</span>
          </button>
          <span aria-hidden="true" className="text-[var(--apple-label-quaternary)]">
            ·
          </span>
          <button
            type="button"
            onClick={() => {
              playTick();
              onReturnMode('arrange');
            }}
            className="apple-link text-[13px] text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]"
          >
            Switch to Arrange
          </button>
        </div>

        <div className="relative flex items-center gap-2">
          <span className="tabular-nums text-[12px] text-[var(--apple-label-tertiary)]">
            Comparing {compareSpecimens.length} / 6
          </span>
          {compareSpecimens.length < 6 && (
            <button
              type="button"
              aria-expanded={pickerOpen}
              onClick={() => {
                playTick();
                setPickerOpen((prev) => !prev);
              }}
              className="apple-btn-tonal inline-flex items-center gap-1.5 !min-h-[32px] !px-3 !text-[12px]"
            >
              <Plus size={12} strokeWidth={2} aria-hidden="true" />
              <span>Add Specimen</span>
            </button>
          )}

          {pickerOpen && (
            <div className="apple-ios-bar absolute top-full right-0 z-30 mt-2 w-[280px] rounded-[14px] border border-[var(--apple-separator-strong)] p-2.5 shadow-xl">
              <input
                type="search"
                autoFocus
                value={pickerQuery}
                onChange={(e) => setPickerQuery(e.target.value)}
                placeholder="Search any category…"
                aria-label="Search specimens to add to comparison"
                className="apple-input !min-h-[32px] w-full !rounded-[8px] !px-2.5 !py-1 !text-[12px]"
              />
              <div className="mt-2 max-h-[210px] space-y-0.5 overflow-y-auto">
                {availableToAdd.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      playTick();
                      onAddToCompare(item.id);
                      setPickerOpen(false);
                      setPickerQuery('');
                    }}
                    className="flex w-full items-center justify-between gap-2 rounded-[8px] px-2.5 py-1.5 text-left text-[12.5px] text-[var(--apple-label-primary)] hover:bg-[var(--apple-control-tonal)]"
                  >
                    <span className="truncate font-medium">{item.title}</span>
                    <span className="shrink-0 text-[11px] text-[var(--apple-label-tertiary)]">
                      {item.categoryLabel}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Empty Compare State */}
      {compareSpecimens.length === 0 ? (
        <div className="rounded-[20px] border border-[var(--apple-separator-subtle)] bg-[var(--apple-bg-secondary)]/50 px-6 py-14 text-center">
          <p className="text-[15.5px] font-semibold text-[var(--apple-label-primary)]">
            Select specimens to compare side by side
          </p>
          <p className="mt-1 text-[13.5px] text-[var(--apple-label-secondary)]">
            Shift-click any items across categories in Browse mode or click Add Specimen above.
          </p>
          <button
            type="button"
            onClick={() => {
              playTick();
              onReturnMode('browse');
            }}
            className="apple-btn-primary mt-5 !min-h-[36px] !px-4 !text-[13px]"
          >
            Browse Library
          </button>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 gap-6 ${
            compareSpecimens.length === 1
              ? 'max-w-[680px]'
              : compareSpecimens.length === 2
                ? 'lg:grid-cols-2'
                : 'lg:grid-cols-2 xl:grid-cols-3'
          }`}
        >
          {compareSpecimens.map((specimen) => {
            const compCatalogItem =
              specimen.section === 'components'
                ? COMPONENT_LIBRARY_ITEMS.find((c) => c.id === specimen.sourceId)
                : undefined;
            const isInteractive = Boolean(interactiveModeById[specimen.id]);
            const selectedVariantIdx = variantById[specimen.id] ?? 0;
            const liveSpecimen =
              isInteractive && compCatalogItem
                ? (renderPrimarySpecimen({
                    componentId: compCatalogItem.id,
                    viewportMode: 'mobile',
                    onPreviewNavigate: handlePreviewNavigate,
                  }) ??
                  renderSecondarySpecimen({
                    componentId: compCatalogItem.id,
                    viewportMode: 'mobile',
                    onPreviewNavigate: handlePreviewNavigate,
                  }))
                : null;

            return (
              <div
                key={specimen.id}
                className="flex flex-col rounded-[20px] border border-[var(--apple-separator)] bg-[var(--apple-bg)] p-4"
              >
                {/* Column Header */}
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-[var(--apple-label-primary)]">
                      {specimen.title}
                    </p>
                    <p className="text-[12px] text-[var(--apple-label-tertiary)]">
                      {specimen.categoryLabel} · {specimen.meta}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {compCatalogItem && (
                      <button
                        type="button"
                        aria-pressed={isInteractive}
                        onClick={() => {
                          playTick();
                          setInteractiveModeById((prev) => ({
                            ...prev,
                            [specimen.id]: !prev[specimen.id],
                          }));
                        }}
                        className={`apple-link rounded-[8px] px-2.5 py-1 text-[11.5px] font-medium transition-colors ${
                          isInteractive
                            ? 'bg-[var(--apple-control-tonal)] text-[var(--apple-label-primary)]'
                            : 'text-[var(--apple-label-secondary)] hover:bg-[var(--apple-bg-secondary)]'
                        }`}
                      >
                        {isInteractive ? 'Preview' : 'Interactive'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        playTick();
                        onOpenDetail(specimen);
                      }}
                      aria-label={`Open ${specimen.title} detail`}
                      className="apple-btn-icon h-8 w-8 text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]"
                    >
                      <ArrowUpRight size={13} strokeWidth={2} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playTick();
                        onRemoveFromCompare(specimen.id);
                      }}
                      aria-label={`Remove ${specimen.title} from comparison`}
                      className="apple-btn-icon h-8 w-8 text-[var(--apple-label-tertiary)] hover:text-[var(--apple-label-primary)]"
                    >
                      <X size={12} strokeWidth={2} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Live Sandbox Canvas */}
                <div
                  data-ds-sandbox="true"
                  data-ds-palette={sandboxPalette}
                  data-ds-theme={sandboxTheme}
                  className="flex min-h-[240px] flex-1 items-center justify-center overflow-x-auto rounded-[16px] border border-[var(--apple-separator-subtle)] !bg-[var(--apple-bg-secondary)] p-5"
                >
                  {liveSpecimen ?? (
                    <WorkbenchSpecimenPreview
                      specimen={specimen}
                      appliedTocVariant={appliedTocVariant}
                      experimentsCount={experimentsCount}
                    />
                  )}
                </div>

                {/* Variant Switcher Strip (for Components with variants) */}
                {compCatalogItem && compCatalogItem.variants.length > 0 && (
                  <div className="mt-3.5 space-y-2 border-t border-[var(--apple-separator-subtle)] pt-3">
                    <div className="flex flex-wrap gap-1">
                      {compCatalogItem.variants.map((variant, idx) => {
                        const active = selectedVariantIdx === idx;
                        return (
                          <button
                            key={variant.name}
                            type="button"
                            aria-pressed={active}
                            onClick={() => {
                              playTick();
                              setVariantById((prev) => ({
                                ...prev,
                                [specimen.id]: idx,
                              }));
                            }}
                            className={`rounded-[7px] px-2 py-0.5 text-[11.5px] transition-colors ${
                              active
                                ? 'bg-[var(--apple-control-tonal)] font-semibold text-[var(--apple-label-primary)]'
                                : 'text-[var(--apple-label-secondary)] hover:bg-[var(--apple-bg-secondary)]'
                            }`}
                          >
                            {variant.name.split('(')[0].trim()}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[12.5px] leading-[1.48] text-[var(--apple-label-secondary)]">
                      {compCatalogItem.variants[selectedVariantIdx]?.usage}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
