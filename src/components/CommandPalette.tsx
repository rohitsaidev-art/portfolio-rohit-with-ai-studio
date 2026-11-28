import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PROJECTS } from '../data/projects';
import { JOURNAL_NOTES } from '../data/notes';
import { SITE_CONFIG } from '../data/site';
import {
  buildPublicCommandPaletteItems,
  searchCommandPaletteItems,
  type CommandItemGroup,
  type CommandPaletteItem,
} from '../utils/commandPalette';
import { setAppearanceMode } from '../utils/appearance';
import { useAppearanceMode } from '../utils/useAppearance';
import {
  setReaderTextSize,
  toggleFocusReading,
  useReaderPreferences,
} from '../utils/readerPreferences';
import {
  playSuccessChime,
  playTick,
  toggleSoundEnabled,
} from '../utils/soundEngine';
import { useSoundEnabled } from '../utils/useSoundEnabled';
import { showToast } from '../utils/toast';
import { EASE_APPLE } from '../utils/motion';
import { prefersReducedMotion } from '../utils/scroll';
import { ChevronRight, Search, X } from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onOpenColophon?: () => void;
}

const GROUP_ORDER: readonly CommandItemGroup[] = [
  'Case Studies',
  'Notes',
  'Chapters',
  'Pages',
  'Actions',
] as const;

/**
 * Keyboard-first public Command Palette (Cmd+K / Ctrl+K) (P2.4).
 * Searches Case Studies, Chapters, Notes, Pages, and Actions.
 * Strictly excludes private /design-system routes and internal tools.
 */
export function CommandPalette({
  open,
  onClose,
  onNavigate,
  onOpenColophon,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const soundEnabled = useSoundEnabled();
  const appearanceMode = useAppearanceMode();
  const readerPrefs = useReaderPreferences();

  const allItems = useMemo(
    () =>
      buildPublicCommandPaletteItems(PROJECTS, JOURNAL_NOTES, {
        soundEnabled,
        appearanceMode,
        largeText: readerPrefs.textSize === 'large',
        focusMode: readerPrefs.focusMode,
      }),
    [soundEnabled, appearanceMode, readerPrefs.textSize, readerPrefs.focusMode],
  );

  const results = useMemo(
    () => searchCommandPaletteItems(allItems, query),
    [allItems, query],
  );

  // Group results in stable order while keeping a flat selectable index map
  const groupedSections = useMemo(() => {
    const sections: {
      group: CommandItemGroup;
      entries: { item: CommandPaletteItem; flatIndex: number }[];
    }[] = [];

    let flatCursor = 0;
    for (const group of GROUP_ORDER) {
      const groupItems = results.filter((item) => item.group === group);
      if (groupItems.length === 0) continue;
      sections.push({
        group,
        entries: groupItems.map((item) => ({ item, flatIndex: flatCursor++ })),
      });
    }
    return sections;
  }, [results]);

  const orderedItems = useMemo(
    () => groupedSections.flatMap((section) => section.entries.map((e) => e.item)),
    [groupedSections],
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, open]);

  // Capture trigger focus, lock body scroll, focus input, and restore focus on close
  useEffect(() => {
    if (!open) return;

    returnFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    setQuery('');
    setSelectedIndex(0);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const rafId = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(rafId);
      document.body.style.overflow = prevOverflow;
      const target = returnFocusRef.current;
      if (target && document.contains(target)) {
        target.focus();
      }
    };
  }, [open]);

  const executeItem = useCallback(
    async (item: CommandPaletteItem) => {
      const { action } = item;
      onClose();

      if (action.type === 'navigate') {
        playTick();
        onNavigate(action.path);
        return;
      }

      if (action.type === 'copy-email') {
        try {
          await navigator.clipboard.writeText(SITE_CONFIG.email);
          playSuccessChime();
          showToast({ message: `Copied ${SITE_CONFIG.email}`, tone: 'success' });
        } catch {
          showToast({ message: `Email: ${SITE_CONFIG.email}`, tone: 'info' });
        }
        return;
      }

      if (action.type === 'set-appearance') {
        playTick();
        setAppearanceMode(action.mode);
        const label =
          action.mode === 'light'
            ? 'Light'
            : action.mode === 'dark'
              ? 'Dark'
              : 'Auto (System)';
        showToast({ message: `Appearance set to ${label}`, tone: 'info' });
        return;
      }

      if (action.type === 'toggle-sound') {
        const nextEnabled = toggleSoundEnabled();
        showToast({
          message: nextEnabled ? 'UI sounds unmuted' : 'UI sounds muted',
          tone: 'info',
        });
        return;
      }

      if (action.type === 'toggle-text-size') {
        const nextSize = readerPrefs.textSize === 'large' ? 'default' : 'large';
        playTick();
        setReaderTextSize(nextSize);
        showToast({
          message:
            nextSize === 'large'
              ? 'Reader text size set to Larger'
              : 'Reader text size set to Default',
          tone: 'info',
        });
        return;
      }

      if (action.type === 'toggle-focus-reading') {
        playTick();
        const enabled = toggleFocusReading();
        showToast({
          message: enabled ? 'Focus Reading enabled' : 'Focus Reading disabled',
          tone: 'info',
        });
        return;
      }

      if (action.type === 'open-colophon') {
        playTick();
        onOpenColophon?.();
      }
    },
    [onClose, onNavigate, onOpenColophon, readerPrefs.textSize],
  );

  // Keyboard navigation + focus trap within dialog
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (orderedItems.length === 0) return;
        setSelectedIndex((prev) => (prev + 1) % orderedItems.length);
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (orderedItems.length === 0) return;
        setSelectedIndex(
          (prev) => (prev - 1 + orderedItems.length) % orderedItems.length,
        );
        return;
      }

      if (event.key === 'Enter') {
        const current = orderedItems[selectedIndex];
        if (current) {
          event.preventDefault();
          void executeItem(current);
        }
        return;
      }

      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'input, button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, orderedItems, selectedIndex, onClose, executeItem]);

  // Keep active list item scrolled into view
  useEffect(() => {
    if (!open) return;
    const activeEl = dialogRef.current?.querySelector<HTMLElement>(
      `[data-cmd-index="${selectedIndex}"]`,
    );
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [open, selectedIndex]);

  const reduced = prefersReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          data-modal-open="true"
          initial={reduced ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={
            reduced ? { duration: 0.01 } : { duration: 0.2, ease: EASE_APPLE }
          }
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-start justify-center bg-[#1D1D1F]/55 px-4 pt-[10vh] backdrop-blur-[4px] sm:pt-[13vh] print:hidden"
        >
          <motion.div
            ref={dialogRef}
            initial={
              reduced ? { opacity: 1 } : { opacity: 0, scale: 0.97, y: -10 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: -6 }}
            transition={
              reduced ? { duration: 0.01 } : { duration: 0.24, ease: EASE_APPLE }
            }
            onClick={(event) => event.stopPropagation()}
            className="apple-modal flex max-h-[72vh] w-full max-w-[620px] flex-col overflow-hidden rounded-[20px] bg-[var(--apple-surface-elevated)]"
          >
            {/* Search Input Header */}
            <div className="flex items-center gap-3 border-b border-[var(--apple-separator-subtle)] px-5 py-4">
              <Search
                size={17}
                strokeWidth={1.75}
                aria-hidden="true"
                className="shrink-0 text-[var(--apple-label-tertiary)]"
              />
              <input
                ref={inputRef}
                type="search"
                role="combobox"
                aria-expanded={open}
                aria-controls="command-palette-listbox"
                aria-activedescendant={
                  orderedItems[selectedIndex]
                    ? `cmd-option-${orderedItems[selectedIndex].id}`
                    : undefined
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search case studies, chapters, notes, or actions…"
                aria-label="Search case studies, chapters, notes, and actions"
                aria-autocomplete="list"
                className="w-full bg-transparent text-[16px] text-[var(--apple-label-primary)] placeholder:text-[var(--apple-label-tertiary)] focus:outline-none"
              />
              {query.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  aria-label="Clear command search"
                  className="apple-btn-icon h-9 w-9 shrink-0 text-[var(--apple-label-tertiary)] hover:text-[var(--apple-label-primary)] sm:h-7 sm:w-7"
                >
                  <X size={13} strokeWidth={2} aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close command palette"
                className="type-caption shrink-0 rounded-md border border-[var(--apple-separator)] px-2 py-0.5 text-[var(--apple-label-tertiary)] hover:text-[var(--apple-label-primary)]"
              >
                Esc
              </button>
            </div>

            <div className="sr-only" aria-live="polite" aria-atomic="true">
              {orderedItems.length === 0
                ? 'No matching command palette results'
                : `${orderedItems.length} ${orderedItems.length === 1 ? 'result' : 'results'} available`}
            </div>

            {/* Results List */}
            <div
              id="command-palette-listbox"
              role="listbox"
              aria-label="Command palette results"
              className="flex-1 overflow-y-auto px-3 py-3"
            >
              {groupedSections.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <p className="type-headline text-[var(--apple-label-primary)]">
                    No matching results
                  </p>
                  <p className="type-footnote mt-1.5 font-normal text-[var(--apple-label-tertiary)]">
                    Try searching a project name, chapter (e.g. “Exploration”), note, or action like “Copy email”.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {groupedSections.map((section) => (
                    <div key={section.group}>
                      <p className="type-caption px-3 pb-1.5 text-[var(--apple-label-tertiary)]">
                        {section.group}
                      </p>
                      <div className="space-y-0.5">
                        {section.entries.map(({ item, flatIndex }) => {
                          const selected = flatIndex === selectedIndex;
                          return (
                            <button
                              key={item.id}
                              id={`cmd-option-${item.id}`}
                              type="button"
                              role="option"
                              aria-selected={selected}
                              data-cmd-index={flatIndex}
                              onMouseEnter={() => setSelectedIndex(flatIndex)}
                              onClick={() => void executeItem(item)}
                              className={`flex min-h-[44px] w-full items-center justify-between gap-3 rounded-[14px] px-3.5 py-2.5 text-left transition-colors duration-100 ${
                                selected
                                  ? 'bg-[var(--apple-blue-fill)] text-white'
                                  : 'text-[var(--apple-label-primary)] hover:bg-[var(--apple-bg-secondary)]'
                              }`}
                            >
                              <div className="min-w-0">
                                <p className="truncate text-[14.5px] font-medium tracking-[-0.012em]">
                                  {item.title}
                                </p>
                                <p
                                  className={`truncate text-[12.5px] ${
                                    selected
                                      ? 'text-white/80'
                                      : 'text-[var(--apple-label-secondary)]'
                                  }`}
                                >
                                  {item.subtitle}
                                </p>
                              </div>
                              <ChevronRight
                                size={13}
                                strokeWidth={2}
                                aria-hidden="true"
                                className={`shrink-0 ${
                                  selected
                                    ? 'text-white'
                                    : 'text-[var(--apple-label-tertiary)]'
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quiet Keyboard Hints Footer */}
            <div className="type-caption flex items-center justify-between border-t border-[var(--apple-separator-subtle)] bg-[var(--apple-bg-secondary)] px-5 py-2.5 font-normal text-[var(--apple-label-tertiary)]">
              <div className="flex items-center gap-3">
                <span>↑↓ Navigate</span>
                <span>↵ Open</span>
                <span>Esc Close</span>
              </div>
              <span className="tabular-nums">
                {orderedItems.length}{' '}
                {orderedItems.length === 1 ? 'result' : 'results'}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
