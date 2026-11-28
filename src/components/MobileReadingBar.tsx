import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { TocChapter } from './TableOfContents';
import { setMobileReadingBarActive } from '../utils/floatingDock';
import { EASE_APPLE } from '../utils/motion';
import { prefersReducedMotion } from '../utils/scroll';
import { playTick } from '../utils/soundEngine';
import { useDialogFocusTrap } from '../utils/useFocusTrap';
import { AudioLines, Headphones, List, X } from 'lucide-react';

interface MobileReadingBarProps {
  chapters: readonly TocChapter[];
  activeChapter: string;
  readingProgress: number;
  isAudioPlaying: boolean;
  narratingChapterId: string | null;
  onSelectChapter: (chapterId: string) => void;
  onJumpToAudioPlayer: () => void;
}

/**
 * Compact mobile bottom reading bar (<768px) for Case Studies (P2.8).
 * - Combines chapter picker sheet, AudioPlayer access, and live reading context.
 * - Registers with floatingDock.ts only on <768px viewports so FloatingBackToTop,
 *   ToastViewport, and AudioPlayer floating dock never collide.
 */
export function MobileReadingBar({
  chapters,
  activeChapter,
  readingProgress,
  isAudioPlaying,
  narratingChapterId,
  onSelectChapter,
  onJumpToAudioPlayer,
}: MobileReadingBarProps) {
  const barId = useId();
  const [sheetOpen, setSheetOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const closeSheetBtnRef = useRef<HTMLButtonElement | null>(null);
  const reduced = prefersReducedMotion();

  useDialogFocusTrap({
    open: sheetOpen,
    containerRef: sheetRef,
    initialFocusRef: closeSheetBtnRef,
    onClose: () => setSheetOpen(false),
  });

  const currentChapter =
    chapters.find((c) => c.id === activeChapter) ?? chapters[0];
  const progressPct = Math.round(Math.min(100, Math.max(0, readingProgress * 100)));

  // Coordinate clearance only on mobile (<768px) where this bar is displayed
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(max-width: 767px)');

    const sync = () => {
      setMobileReadingBarActive(barId, mq.matches);
    };
    sync();

    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', sync);
      return () => {
        mq.removeEventListener('change', sync);
        setMobileReadingBarActive(barId, false);
      };
    }
    return () => setMobileReadingBarActive(barId, false);
  }, [barId]);



  return (
    <div className="md:hidden print:hidden">
      {/* Chapter Picker Bottom Sheet */}
      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Case study chapters"
            data-modal-open="true"
            initial={reduced ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={
              reduced ? { duration: 0.01 } : { duration: 0.2, ease: EASE_APPLE }
            }
            onClick={() => setSheetOpen(false)}
            className="fixed inset-0 z-50 flex items-end bg-[#1D1D1F]/45 px-3 pb-3 backdrop-blur-[3px]"
          >
            <motion.div
              ref={sheetRef}
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
              transition={
                reduced
                  ? { duration: 0.01 }
                  : { duration: 0.24, ease: EASE_APPLE }
              }
              onClick={(event) => event.stopPropagation()}
              className="apple-modal w-full rounded-[20px] bg-[var(--apple-surface-elevated)] p-4"
            >
              <div className="flex items-center justify-between border-b border-[var(--apple-separator-subtle)] pb-3">
                <div>
                  <p className="type-caption text-[var(--apple-label-tertiary)]">
                    Jump to Chapter
                  </p>
                  <p className="type-footnote mt-0.5 tabular-nums font-normal text-[var(--apple-label-secondary)]">
                    {progressPct}% read · {chapters.length} sections
                  </p>
                </div>
                <button
                  ref={closeSheetBtnRef}
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  aria-label="Close chapter picker"
                  className="apple-btn-icon h-11 w-11 bg-[var(--apple-control-tonal)] text-[var(--apple-label-primary)]"
                >
                  <X size={14} strokeWidth={1.75} aria-hidden="true" />
                </button>
              </div>

              <nav aria-label="Case study sections" className="mt-3 space-y-1">
                {chapters.map((chapter) => {
                  const isActive = chapter.id === activeChapter;
                  const isNarrating = chapter.id === narratingChapterId;
                  return (
                    <button
                      key={chapter.id}
                      type="button"
                      onClick={() => {
                        playTick();
                        setSheetOpen(false);
                        onSelectChapter(chapter.id);
                      }}
                      className={`flex min-h-[44px] w-full items-center justify-between rounded-[14px] px-3.5 text-left text-[14.5px] transition-colors ${
                        isActive
                          ? 'bg-[var(--apple-blue)]/10 font-semibold text-[var(--apple-link)]'
                          : 'text-[var(--apple-label-primary)] hover:bg-[var(--apple-bg-secondary)]'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <span className="type-caption tabular-nums opacity-70">
                          {chapter.num}
                        </span>
                        <span className="truncate">{chapter.label}</span>
                      </span>
                      {isNarrating && (
                        <AudioLines
                          size={14}
                          strokeWidth={1.75}
                          aria-hidden="true"
                          className="shrink-0 text-[var(--apple-link)]"
                        />
                      )}
                    </button>
                  );
                })}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact Fixed Bottom Reading Bar */}
      <div
        role="region"
        aria-label="Mobile reading navigation"
        className="fixed bottom-3 left-3 right-3 z-30"
      >
        <div className="apple-ios-bar flex h-[52px] items-center justify-between gap-2 rounded-full px-2.5">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => {
              playTick();
              setSheetOpen(true);
            }}
            aria-expanded={sheetOpen}
            aria-label="Open chapter picker"
            className="flex min-w-0 flex-1 items-center gap-2.5 rounded-full px-2.5 py-1.5 text-left transition-colors hover:bg-[var(--apple-control-hover)]"
          >
            <List
              size={16}
              strokeWidth={1.75}
              aria-hidden="true"
              className="shrink-0 text-[var(--apple-link)]"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold tracking-[-0.01em] text-[var(--apple-label-primary)]">
                {currentChapter
                  ? `${currentChapter.num} · ${currentChapter.label}`
                  : 'Chapters'}
              </p>
              <div className="mt-0.5 flex items-center gap-2">
                <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-[var(--apple-separator)]">
                  <div
                    style={{ width: `${progressPct}%` }}
                    className="h-full rounded-full bg-[var(--apple-blue)]"
                  />
                </div>
                <span className="tabular-nums text-[10.5px] font-medium text-[var(--apple-label-tertiary)]">
                  {progressPct}%
                </span>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              playTick();
              onJumpToAudioPlayer();
            }}
            aria-label={
              isAudioPlaying
                ? 'Jump to active audio narration'
                : 'Jump to audio player'
            }
            className={`inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[12.5px] font-medium transition-colors ${
              isAudioPlaying
                ? 'bg-[var(--apple-blue-fill)] text-white'
                : 'bg-[var(--apple-control-tonal)] text-[var(--apple-label-primary)]'
            }`}
          >
            {isAudioPlaying ? (
              <AudioLines size={13} strokeWidth={2} aria-hidden="true" />
            ) : (
              <Headphones size={13} strokeWidth={2} aria-hidden="true" />
            )}
            <span>{isAudioPlaying ? 'Listening' : 'Listen'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
