import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  setFocusReading,
  setReaderTextSize,
  useReaderPreferences,
} from '../utils/readerPreferences';
import { playTick } from '../utils/soundEngine';
import { showToast } from '../utils/toast';
import { EASE_APPLE } from '../utils/motion';
import { prefersReducedMotion } from '../utils/scroll';

interface ReaderComfortPopoverProps {
  align?: 'left' | 'right';
}

/**
 * Discreet "Aa" Reader Comfort popover for Case Studies and Notes (P2.9).
 * Synchronized with GlobalPreferencesPopover through readerPreferences.ts.
 */
export function ReaderComfortPopover({
  align = 'right',
}: ReaderComfortPopoverProps) {
  const [open, setOpen] = useState(false);
  const prefs = useReaderPreferences();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverId = useId();
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const isCustomized = prefs.textSize === 'large' || prefs.focusMode;

  return (
    <div ref={containerRef} className="relative inline-flex print:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          playTick();
          setOpen((prev) => !prev);
        }}
        aria-expanded={open}
        aria-controls={popoverId}
        aria-label="Reader comfort preferences"
        title="Reader comfort preferences (text size & focus reading)"
        className={`inline-flex h-11 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold tracking-[-0.015em] transition-colors duration-150 sm:h-9 ${
          isCustomized
            ? 'bg-[var(--apple-blue)]/10 text-[var(--apple-link)] ring-1 ring-[var(--apple-blue)]/30'
            : 'bg-[var(--apple-control-tonal)] text-[var(--apple-label-primary)] hover:bg-[var(--apple-control-tonal-hover)]'
        }`}
      >
        <span aria-hidden="true" className="font-display">
          Aa
        </span>
        <span className="hidden text-[12.5px] font-medium sm:inline">
          Reading
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={popoverId}
            role="dialog"
            aria-label="Reading preferences"
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.97 }}
            transition={
              reduced ? { duration: 0.01 } : { duration: 0.18, ease: EASE_APPLE }
            }
            className={`apple-modal absolute top-[calc(100%+8px)] z-40 w-[264px] rounded-[20px] bg-[var(--apple-surface-elevated)] p-4 ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
          >
            <p className="type-caption text-[var(--apple-label-tertiary)]">
              Reader Comfort
            </p>

            {/* Text Size */}
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <span className="type-footnote font-medium text-[var(--apple-label-primary)]">
                  Text size
                </span>
                <span className="type-caption font-normal text-[var(--apple-label-tertiary)]">
                  {prefs.textSize === 'large' ? 'Larger' : 'Default'}
                </span>
              </div>
              <div
                role="group"
                aria-label="Reader text size"
                className="apple-segmented mt-2 !w-full !p-0.5"
              >
                {(
                  [
                    { id: 'default', label: 'Default' },
                    { id: 'large', label: 'Larger' },
                  ] as const
                ).map((option) => {
                  const active = prefs.textSize === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        if (!active) {
                          playTick();
                          setReaderTextSize(option.id);
                          showToast({
                            message: `Reader text size: ${option.label}`,
                            tone: 'info',
                          });
                        }
                      }}
                      className={`apple-segmented-item flex-1 !min-h-[40px] px-3 py-1 text-[12.5px] sm:!min-h-[30px] ${
                        active
                          ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                          : 'text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Focus Reading Mode */}
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--apple-separator-subtle)] pt-3.5">
              <div>
                <p className="type-footnote font-medium text-[var(--apple-label-primary)]">
                  Focus Reading
                </p>
                <p className="text-[11.5px] leading-[1.35] text-[var(--apple-label-tertiary)]">
                  Softens surrounding navigation chrome.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs.focusMode}
                aria-label="Toggle Focus Reading mode"
                onClick={() => {
                  playTick();
                  const next = !prefs.focusMode;
                  setFocusReading(next);
                  showToast({
                    message: next
                      ? 'Focus Reading enabled'
                      : 'Focus Reading disabled',
                    tone: 'info',
                  });
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${
                  prefs.focusMode
                    ? 'bg-[var(--apple-blue)]'
                    : 'bg-[var(--apple-separator-strong)]'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    prefs.focusMode ? 'translate-x-[22px]' : 'translate-x-[2px]'
                  }`}
                />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
