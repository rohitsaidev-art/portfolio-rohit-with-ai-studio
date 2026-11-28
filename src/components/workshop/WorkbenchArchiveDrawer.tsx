import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { ResolvedTheme } from '../../utils/appearance';
import { EASE_APPLE } from '../../utils/motion';
import type { TocVariant } from '../../utils/portfolio';
import { prefersReducedMotion } from '../../utils/scroll';
import { playSuccessChime, playTick } from '../../utils/soundEngine';
import type {
  WorkbenchSectionId,
  WorkbenchSpecimen,
} from '../../utils/workbenchStore';
import type { VisualPaletteId } from '../../utils/workshopStore';
import { Check, RotateCcw, Search, X } from 'lucide-react';
import { WorkbenchSpecimenPreview } from './WorkbenchSpecimenPreview';

export interface FlyingArchiveCard {
  id: string;
  title: string;
  fromX: number;
  fromY: number;
  fromWidth: number;
  fromHeight: number;
  toX: number;
  toY: number;
}

interface WorkbenchArchiveDrawerProps {
  open: boolean;
  onClose: () => void;
  archivedSpecimens: readonly WorkbenchSpecimen[];
  sandboxPalette: VisualPaletteId;
  sandboxTheme: ResolvedTheme;
  appliedTocVariant: TocVariant;
  experimentsCount: number;
  onRestoreOne: (id: string) => void;
  onRestoreBulk: (ids: readonly string[]) => void;
  onRestoreAll: () => void;
  onOpenDetail: (specimen: WorkbenchSpecimen) => void;
}

/**
 * Floating fly-to-archive animation layer (ecommerce cart-style visual feedback).
 */
export function FlyToArchiveOverlay({
  cards,
}: {
  cards: readonly FlyingArchiveCard[];
}) {
  if (cards.length === 0 || prefersReducedMotion()) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[70] overflow-hidden"
    >
      <AnimatePresence>
        {cards.map((card) => (
          <motion.div
            key={card.id}
            initial={{
              x: card.fromX,
              y: card.fromY,
              width: card.fromWidth,
              height: card.fromHeight,
              opacity: 0.92,
              scale: 1,
              borderRadius: 18,
            }}
            animate={{
              x: card.toX - 24,
              y: card.toY - 16,
              width: 56,
              height: 36,
              opacity: 0.15,
              scale: 0.42,
              borderRadius: 999,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.46, ease: EASE_APPLE }}
            className="fixed top-0 left-0 flex items-center justify-center border border-[var(--apple-blue)]/45 bg-[var(--apple-surface-elevated)] px-3 shadow-lg"
          >
            <span className="truncate text-[12px] font-medium text-[var(--apple-label-primary)]">
              {card.title}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/**
 * Right-side persistent Archive Drawer inspired by an ecommerce cart.
 * Non-destructive: preserves all production implementations and supports
 * visual previewing, search, section filtering, and individual or bulk restore.
 */
export function WorkbenchArchiveDrawer({
  open,
  onClose,
  archivedSpecimens,
  sandboxPalette,
  sandboxTheme,
  appliedTocVariant,
  experimentsCount,
  onRestoreOne,
  onRestoreBulk,
  onRestoreAll,
  onOpenDetail,
}: WorkbenchArchiveDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState<'all' | WorkbenchSectionId>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) {
      setSelectedIds([]);
      return;
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 30);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  const filteredArchived = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return archivedSpecimens.filter((item) => {
      if (sectionFilter !== 'all' && item.section !== sectionFilter) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q) ||
        item.searchText.includes(q)
      );
    });
  }, [archivedSpecimens, searchQuery, sectionFilter]);

  const toggleSelected = (id: string) => {
    playTick();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE_APPLE }}
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px]"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Archived Design System Specimens"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: EASE_APPLE }}
            className="fixed inset-y-0 right-0 flex w-[420px] max-w-[94vw] flex-col border-l border-[var(--apple-separator)] bg-[var(--apple-bg)] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--apple-separator-subtle)] px-5 py-4">
              <div>
                <h2 className="font-display text-[17px] font-semibold tracking-[-0.02em] text-[var(--apple-label-primary)]">
                  Archive
                </h2>
                <p className="mt-0.5 text-[12px] text-[var(--apple-label-tertiary)]">
                  {archivedSpecimens.length === 0
                    ? 'Nothing archived · Production code is always preserved'
                    : `${archivedSpecimens.length} hidden from active canvas · Restore anytime`}
                </p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => {
                  playTick();
                  onClose();
                }}
                aria-label="Close Archive drawer"
                className="apple-btn-icon h-9 w-9 text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]"
              >
                <X size={15} strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>

            {/* Search & Section Filter */}
            {archivedSpecimens.length > 0 && (
              <div className="space-y-3 border-b border-[var(--apple-separator-subtle)] px-5 py-3.5">
                <div className="relative">
                  <Search
                    size={13}
                    strokeWidth={2}
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--apple-label-tertiary)]"
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search archived specimens…"
                    aria-label="Search archived specimens"
                    className="apple-input min-h-[36px] w-full rounded-[10px] py-1 pr-8 pl-8 text-[13px]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear archive search"
                      className="apple-btn-icon absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 text-[var(--apple-label-tertiary)]"
                    >
                      <X size={12} strokeWidth={2} aria-hidden="true" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                  {(
                    [
                      { id: 'all', label: 'All' },
                      { id: 'components', label: 'Components' },
                      { id: 'patterns', label: 'Patterns' },
                      { id: 'templates', label: 'Templates' },
                      { id: 'foundations', label: 'Foundations' },
                      { id: 'behaviour', label: 'Behaviour' },
                      { id: 'exploration', label: 'Exploration' },
                    ] as const
                  ).map((tab) => {
                    const active = sectionFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => {
                          playTick();
                          setSectionFilter(tab.id);
                        }}
                        className={`apple-link shrink-0 whitespace-nowrap rounded-[8px] px-2.5 py-1 text-[12px] transition-colors ${
                          active
                            ? 'bg-[var(--apple-control-tonal)] font-semibold text-[var(--apple-label-primary)]'
                            : 'text-[var(--apple-label-secondary)] hover:bg-[var(--apple-bg-secondary)]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Archived Items List */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {archivedSpecimens.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                  <p className="text-[14.5px] font-semibold text-[var(--apple-label-primary)]">
                    Your archive is empty
                  </p>
                  <p className="mt-1.5 max-w-[28ch] text-[13px] leading-[1.5] text-[var(--apple-label-secondary)]">
                    Right-click or select any specimen on the canvas to archive it here without deleting its implementation.
                  </p>
                </div>
              ) : filteredArchived.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-[14px] font-medium text-[var(--apple-label-primary)]">
                    No archived items match
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSectionFilter('all');
                    }}
                    className="apple-btn-tonal mt-3 !min-h-[32px] !px-3.5 !text-[12px]"
                  >
                    Reset filter
                  </button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {filteredArchived.map((item) => {
                    const checked = selectedIds.includes(item.id);
                    return (
                      <li
                        key={item.id}
                        className={`rounded-[16px] border p-3 transition-colors ${
                          checked
                            ? 'border-[var(--apple-blue)] bg-[var(--apple-blue)]/5'
                            : 'border-[var(--apple-separator-subtle)] bg-[var(--apple-bg)]'
                        }`}
                      >
                        {/* Visual Thumbnail Preview */}
                        <div
                          data-ds-sandbox="true"
                          data-ds-palette={sandboxPalette}
                          data-ds-theme={sandboxTheme}
                          className="flex h-[126px] w-full items-center justify-center overflow-hidden rounded-[12px] border border-[var(--apple-separator-subtle)] !bg-[var(--apple-bg-secondary)] p-3"
                        >
                          <div className="w-full scale-[0.84] transform">
                            <WorkbenchSpecimenPreview
                              specimen={item}
                              appliedTocVariant={appliedTocVariant}
                              experimentsCount={experimentsCount}
                              compact
                            />
                          </div>
                        </div>

                        <div className="mt-2.5 flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <button
                              type="button"
                              role="checkbox"
                              aria-checked={checked}
                              aria-label={`Select ${item.title} for bulk restore`}
                              onClick={() => toggleSelected(item.id)}
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border transition-colors ${
                                checked
                                  ? 'border-[var(--apple-blue-fill)] bg-[var(--apple-blue-fill)] text-white'
                                  : 'border-[var(--apple-separator-strong)] bg-[var(--apple-surface-elevated)]'
                              }`}
                            >
                              {checked && <Check size={12} strokeWidth={2} aria-hidden="true" />}
                            </button>
                            <div className="min-w-0">
                              <button
                                type="button"
                                onClick={() => {
                                  playTick();
                                  onOpenDetail(item);
                                  onClose();
                                }}
                                className="apple-link block truncate text-left text-[13.5px] font-medium text-[var(--apple-label-primary)] hover:underline"
                              >
                                {item.title}
                              </button>
                              <p className="truncate text-[11.5px] text-[var(--apple-label-tertiary)]">
                                {item.categoryLabel} · {item.meta}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              playSuccessChime();
                              setSelectedIds((prev) => prev.filter((x) => x !== item.id));
                              onRestoreOne(item.id);
                            }}
                            className="apple-btn-tonal shrink-0 !min-h-[32px] !px-3 !text-[12px]"
                          >
                            Restore
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Sticky Bulk Restore Footer */}
            {archivedSpecimens.length > 0 && (
              <div className="flex items-center justify-between gap-3 border-t border-[var(--apple-separator-subtle)] bg-[var(--apple-bg)] px-5 py-3.5">
                {selectedIds.length > 0 ? (
                  <>
                    <span className="tabular-nums text-[12.5px] font-medium text-[var(--apple-label-secondary)]">
                      {selectedIds.length} selected
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        playSuccessChime();
                        onRestoreBulk(selectedIds);
                        setSelectedIds([]);
                      }}
                      className="apple-btn-primary !min-h-[36px] !px-4 !text-[12.5px]"
                    >
                      Restore Selected ({selectedIds.length})
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-[12px] text-[var(--apple-label-tertiary)]">
                      Originals stay intact
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        playSuccessChime();
                        onRestoreAll();
                      }}
                      className="apple-btn-tonal inline-flex items-center gap-1.5 !min-h-[36px] !px-3.5 !text-[12.5px]"
                    >
                      <RotateCcw size={12} strokeWidth={2} aria-hidden="true" />
                      <span>Restore All ({archivedSpecimens.length})</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
