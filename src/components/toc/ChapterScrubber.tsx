import * as React from 'react';
import {
  ANCHOR_BREATHING_ROOM_PX,
  STICKY_HEADER_HEIGHT_PX,
  resolveActiveSectionId,
  scrollToElementById,
} from '../../utils/scroll';
import { playTick } from '../../utils/soundEngine';

export interface Chapter {
  /** Stable, unique section identifier matching the DOM element ID. */
  id: string;
  /** Section heading displayed beside its tick. */
  title: string;
}

export interface ChapterScrubberProps {
  /** Sections rendered top-to-bottom, one thin horizontal tick each. */
  chapters: readonly Chapter[];
  /** Controlled active section ID (when omitted, tracked automatically via Intersection Observer). */
  activeChapterId?: string;
  /** Controlled active index (alternative to activeChapterId). */
  currentIndex?: number;
  /** Enables built-in Intersection Observer tracking. Defaults to true when uncontrolled. */
  observeSections?: boolean;
  /** Sticky header offset in pixels used by Intersection Observer and smooth scroll navigation. */
  headerOffsetPx?: number;
  /** Fires when a section is selected via click or keyboard activation. */
  onSelect?: (chapter: Chapter, index: number) => void;
  /** Fires when the internal Intersection Observer updates the active section. */
  onActiveChange?: (chapterId: string, index: number) => void;
  /** Accessible name for the navigation landmark. */
  label?: string;
  /** Optional namespace to scope Framer Motion layoutId across instances. */
  layoutNamespace?: string;
  className?: string;
}

const DEFAULT_HEADER_OFFSET_PX =
  STICKY_HEADER_HEIGHT_PX + ANCHOR_BREATHING_ROOM_PX;

/**
 * Minimalist, editorial vertical chapter scrubber Table of Contents.
 *
 * - Idle: shows evenly spaced grey horizontal ticks, highlights the active tick
 *   in blue (#0A84FF), and displays only the active section heading beside it.
 * - Hover / Focus: smoothly expands in place to reveal all section headings
 *   without layout shift, keeping the active heading dark and inactive headings
 *   in muted grey.
 * - Scroll tracking: includes built-in bidirectional Intersection Observer
 *   tracking (accounting for sticky header offsets) when uncontrolled, and
 *   supports controlled activeChapterId / currentIndex for Studio sandboxes.
 */
export function ChapterScrubber({
  chapters,
  activeChapterId,
  currentIndex,
  observeSections,
  headerOffsetPx = DEFAULT_HEADER_OFFSET_PX,
  onSelect,
  onActiveChange,
  label = 'Table of contents',
  layoutNamespace: _layoutNamespace,
  className,
}: ChapterScrubberProps) {
  const isControlled =
    activeChapterId !== undefined || currentIndex !== undefined;
  const shouldObserve = observeSections ?? !isControlled;

  const [observedId, setObservedId] = React.useState<string>(
    () => chapters[0]?.id ?? '',
  );
  const [isHovered, setIsHovered] = React.useState(false);
  const [isFocusWithin, setIsFocusWithin] = React.useState(false);

  const buttonRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const programmaticTargetRef = React.useRef<string | null>(null);
  const programmaticUnlockTimerRef = React.useRef<number | null>(null);

  // Keep observedId valid when chapter list changes
  React.useEffect(() => {
    if (
      chapters.length > 0 &&
      !chapters.some((chapter) => chapter.id === observedId)
    ) {
      setObservedId(chapters[0].id);
    }
  }, [chapters, observedId]);

  // Built-in bidirectional Intersection Observer for standalone/uncontrolled usage
  React.useEffect(() => {
    if (!shouldObserve || chapters.length === 0) return;
    if (
      typeof window === 'undefined' ||
      typeof document === 'undefined' ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return;
    }

    const elements = chapters
      .map((chapter) => document.getElementById(chapter.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const intersectingIds = new Set<string>();
    let rafId: number | null = null;

    const clearProgrammaticLock = () => {
      programmaticTargetRef.current = null;
      if (programmaticUnlockTimerRef.current !== null) {
        window.clearTimeout(programmaticUnlockTimerRef.current);
        programmaticUnlockTimerRef.current = null;
      }
    };

    const syncActiveSection = () => {
      if (programmaticTargetRef.current) {
        const targetEl = document.getElementById(
          programmaticTargetRef.current,
        );
        if (targetEl) {
          const dist = Math.abs(
            targetEl.getBoundingClientRect().top - headerOffsetPx,
          );
          if (dist > 32) return;
        }
        programmaticTargetRef.current = null;
      }

      const viewportHeight = window.innerHeight || 900;
      const isAtPageBottom =
        window.scrollY + viewportHeight >=
        document.documentElement.scrollHeight - 24;

      const metrics = elements.map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          id: el.id,
          top: rect.top,
          bottom: rect.bottom,
          isIntersecting: intersectingIds.has(el.id),
        };
      });

      const nextId = resolveActiveSectionId({
        sections: metrics,
        headerOffsetPx,
        viewportHeight,
        isAtPageBottom,
      });

      if (nextId) {
        setObservedId((prev) => {
          if (prev !== nextId) {
            const nextIdx = chapters.findIndex((c) => c.id === nextId);
            onActiveChange?.(nextId, nextIdx);
          }
          return nextId;
        });
      }
    };

    const scheduleSync = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        syncActiveSection();
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            intersectingIds.add(entry.target.id);
          } else {
            intersectingIds.delete(entry.target.id);
          }
        });
        syncActiveSection();
      },
      {
        rootMargin: `-${headerOffsetPx}px 0px -55% 0px`,
        threshold: [0, 0.1, 0.25, 0.5],
      },
    );

    elements.forEach((el) => observer.observe(el));
    window.addEventListener('scroll', scheduleSync, { passive: true });
    window.addEventListener('wheel', clearProgrammaticLock, { passive: true });
    window.addEventListener('touchstart', clearProgrammaticLock, {
      passive: true,
    });
    syncActiveSection();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', scheduleSync);
      window.removeEventListener('wheel', clearProgrammaticLock);
      window.removeEventListener('touchstart', clearProgrammaticLock);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      clearProgrammaticLock();
    };
  }, [shouldObserve, chapters, headerOffsetPx, onActiveChange]);

  const resolvedActiveIndex = React.useMemo(() => {
    if (chapters.length === 0) return 0;
    if (activeChapterId !== undefined) {
      const idx = chapters.findIndex((c) => c.id === activeChapterId);
      return idx >= 0 ? idx : 0;
    }
    if (currentIndex !== undefined) {
      return Math.min(Math.max(0, currentIndex), chapters.length - 1);
    }
    const idx = chapters.findIndex((c) => c.id === observedId);
    return idx >= 0 ? idx : 0;
  }, [chapters, activeChapterId, currentIndex, observedId]);

  const isExpanded = isHovered || isFocusWithin;

  const handleSelectChapter = (chapter: Chapter, index: number) => {
    playTick();

    if (shouldObserve) {
      programmaticTargetRef.current = chapter.id;
      if (programmaticUnlockTimerRef.current !== null) {
        window.clearTimeout(programmaticUnlockTimerRef.current);
      }
      programmaticUnlockTimerRef.current = window.setTimeout(() => {
        programmaticTargetRef.current = null;
        programmaticUnlockTimerRef.current = null;
      }, 750);
      setObservedId(chapter.id);
      onActiveChange?.(chapter.id, index);
    }

    if (onSelect) {
      onSelect(chapter, index);
    } else {
      scrollToElementById(chapter.id);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLOListElement>) => {
    if (chapters.length === 0) return;
    const currentFocusedIndex = buttonRefs.current.findIndex(
      (btn) => btn === document.activeElement,
    );
    const baseIndex =
      currentFocusedIndex >= 0 ? currentFocusedIndex : resolvedActiveIndex;
    let nextIndex: number | null = null;

    switch (event.key) {
      case 'ArrowDown':
        nextIndex = Math.min(chapters.length - 1, baseIndex + 1);
        break;
      case 'ArrowUp':
        nextIndex = Math.max(0, baseIndex - 1);
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = chapters.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    buttonRefs.current[nextIndex]?.focus();
  };

  const handleBlur = (event: React.FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsFocusWithin(false);
    }
  };

  if (chapters.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label={label}
      data-expanded={isExpanded ? 'true' : 'false'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocusWithin(true)}
      onBlur={handleBlur}
      className={className ? `toc-scrubber ${className}` : 'toc-scrubber'}
    >
      <ol onKeyDown={handleKeyDown} className="toc-scrubber-list">
        {chapters.map((chapter, index) => {
          const isActive = index === resolvedActiveIndex;

          return (
            <li key={chapter.id} className="m-0 p-0">
              <button
                ref={(el) => {
                  buttonRefs.current[index] = el;
                }}
                type="button"
                aria-current={isActive ? 'location' : undefined}
                data-active={isActive ? 'true' : 'false'}
                onClick={() => handleSelectChapter(chapter, index)}
                className="toc-scrubber-item"
              >
                <span aria-hidden="true" className="toc-scrubber-tick-slot">
                  <span
                    className={
                      isActive
                        ? 'toc-scrubber-tick toc-scrubber-tick-active'
                        : 'toc-scrubber-tick'
                    }
                  />
                </span>

                <span className="toc-scrubber-label">{chapter.title}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default ChapterScrubber;
