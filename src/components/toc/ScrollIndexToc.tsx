import {
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AudioLines } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { getLenisInstance } from '../../utils/smoothScroll';
import {
  ANCHOR_BREATHING_ROOM_PX,
  STICKY_HEADER_HEIGHT_PX,
} from '../../utils/scroll';
import { playTick } from '../../utils/soundEngine';

export interface ScrollIndexChapter {
  id: string;
  num: string;
  label: string;
  subtitle?: string;
}

export interface ScrollIndexTocProps {
  chapters: readonly ScrollIndexChapter[];
  activeChapter: string;
  readingProgress?: number;
  narratingChapterId?: string | null;
  onSelectChapter: (id: string) => void;
  className?: string;
}

interface MeasuredSection {
  id: string;
  num: string;
  text: string;
  at: number;
  pos: number;
}

// Kokonut UI Scroll Index geometry & tactile physics constants
const RAIL_HEIGHT = 280;
const JUMP_OFFSET = STICKY_HEADER_HEIGHT_PX + ANCHOR_BREATHING_ROOM_PX;
const SWELL = 1.6;
const REACH = 26;
const SNAP_PX = 18;
const FLASH_MS = 900;

/**
 * Marks each tick ahead, current, or passed and maintains a single roving tab stop.
 */
function markTicks(ticks: (HTMLButtonElement | null)[], activeIndex: number) {
  ticks.forEach((tick, i) => {
    if (!tick) return;
    let state = 'ahead';
    if (i === activeIndex) {
      state = 'current';
    } else if (i < activeIndex) {
      state = 'passed';
    }
    tick.dataset.state = state;
    tick.tabIndex = i === Math.max(activeIndex, 0) ? 0 : -1;
    if (i === activeIndex) {
      tick.setAttribute('aria-current', 'location');
    } else {
      tick.removeAttribute('aria-current');
    }
  });
}

/**
 * Kokonut UI Scroll Index adapted for Case Study & TOC Lab chapter navigation.
 * Preserves the exact proportional rail layout, continuous playhead indicator,
 * Gaussian dock-swell pointer magnification, direct drag scrubbing with flick
 * momentum snap, 900ms passive section-change label flash, and roving tabindex
 * keyboard navigation — harmonized with Apple HIG semantic tokens and Lenis.
 */
export function ScrollIndexToc({
  chapters,
  activeChapter,
  readingProgress = 0,
  narratingChapterId = null,
  onSelectChapter,
  className,
}: ScrollIndexTocProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const labelTextRef = useRef<HTMLSpanElement>(null);
  const tickRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onSelectRef = useRef(onSelectChapter);
  onSelectRef.current = onSelectChapter;

  const activeChapterRef = useRef(activeChapter);
  activeChapterRef.current = activeChapter;

  const readingProgressRef = useRef(readingProgress);
  readingProgressRef.current = readingProgress;

  const [labelChapterId, setLabelChapterId] = useState<string | null>(null);

  const fallbackSections = useMemo(
    () =>
      chapters.map((ch, i) => ({
        id: ch.id,
        num: ch.num,
        text: ch.label,
        pos: chapters.length <= 1 ? 0 : i / (chapters.length - 1),
      })),
    [chapters],
  );

  const [sections, setSections] = useState<
    { id: string; num: string; text: string; pos: number }[]
  >(fallbackSections);

  const api = useRef<{
    jump: (index: number) => void;
    show: (index: number) => void;
  }>({
    jump: () => undefined,
    show: () => undefined,
  });

  useEffect(() => {
    const rail = railRef.current;
    const head = headRef.current;
    const label = labelRef.current;
    const labelText = labelTextRef.current;
    if (!(rail && head && label && labelText)) return;

    const reduceMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let list: MeasuredSection[] = [];
    let hasDomAnchors = false;
    let start = 0;
    let end = 1;
    let active = -1;
    let height = RAIL_HEIGHT;
    let raf = 0;
    let flashTimer = 0;
    let painted = false;
    let hover: number | null = null;
    let lastScrubbedId: string | null = null;
    let drag: {
      id: number;
      moved: boolean;
      y: number;
      t: number;
      v: number;
    } | null = null;
    const swell: number[] = [];

    const setWindowScrollImmediate = (value: number) => {
      const clamped = Math.max(0, value);
      const lenis = getLenisInstance();
      if (lenis) {
        lenis.scrollTo(clamped, { immediate: true });
      } else {
        window.scrollTo(0, clamped);
      }
    };

    const measure = () => {
      const scrollY = window.scrollY;
      const domItems = chapters
        .map((ch) => ({
          ch,
          el: document.getElementById(ch.id),
        }))
        .filter(
          (entry): entry is { ch: ScrollIndexChapter; el: HTMLElement } =>
            entry.el !== null,
        );

      height = rail.clientHeight || RAIL_HEIGHT;

      if (domItems.length === chapters.length && domItems.length > 0) {
        hasDomAnchors = true;
        const firstRect = domItems[0].el.getBoundingClientRect();
        const lastRect = domItems[domItems.length - 1].el.getBoundingClientRect();

        const firstTop = firstRect.top + scrollY;
        const lastBottom = lastRect.bottom + scrollY;
        const maxDocScroll = Math.max(
          document.documentElement.scrollHeight - window.innerHeight,
          0,
        );

        start = Math.max(firstTop - JUMP_OFFSET, 0);
        end = Math.max(
          Math.min(lastBottom - window.innerHeight * 0.45, maxDocScroll),
          start + 1,
        );

        const rawList = domItems.map(({ ch, el }) => {
          const at = Math.min(
            Math.max(el.getBoundingClientRect().top + scrollY - JUMP_OFFSET, start),
            end,
          );
          return {
            id: ch.id,
            num: ch.num,
            text: ch.label,
            at,
            pos: Math.min(Math.max((at - start) / (end - start), 0), 1),
          };
        });

        // Guarantee minimum visual legibility if two headings sit very close together
        const minGap = 0.055;
        for (let i = 1; i < rawList.length; i++) {
          if (rawList[i].pos - rawList[i - 1].pos < minGap) {
            rawList[i].pos = Math.min(1, rawList[i - 1].pos + minGap);
          }
        }

        list = rawList;
      } else {
        hasDomAnchors = false;
        start = 0;
        end = 1;
        list = chapters.map((ch, i) => {
          const pos = chapters.length <= 1 ? 0 : i / (chapters.length - 1);
          return {
            id: ch.id,
            num: ch.num,
            text: ch.label,
            at: pos,
            pos,
          };
        });
      }

      setSections(
        list.map(({ id, num, text, pos }) => ({ id, num, text, pos })),
      );
    };

    const fraction = () => {
      if (!hasDomAnchors) {
        return Math.min(Math.max(readingProgressRef.current, 0), 1);
      }
      return Math.min(Math.max((window.scrollY - start) / (end - start), 0), 1);
    };

    const nearest = (y: number) => {
      let best = -1;
      let distance = Number.POSITIVE_INFINITY;
      list.forEach((s, i) => {
        const d = Math.abs(s.pos * height - y);
        if (d < distance) {
          distance = d;
          best = i;
        }
      });
      return { index: best, distance };
    };

    const placeLabel = (index: number, visible: boolean) => {
      const section = list[index];
      if (!section) {
        label.style.opacity = '0';
        setLabelChapterId(null);
        return;
      }
      if (labelText.textContent !== section.text) {
        labelText.textContent = section.text;
      }
      setLabelChapterId(section.id);
      label.style.transform = `translate3d(0, ${(section.pos * height).toFixed(1)}px, 0) translateY(-50%)`;
      label.style.opacity = visible ? '1' : '0';
    };

    const currentIndex = () => {
      if (!hasDomAnchors) {
        const propIdx = list.findIndex((s) => s.id === activeChapterRef.current);
        return propIdx >= 0 ? propIdx : 0;
      }
      const scroll = window.scrollY + 12;
      let index = 0;
      for (let i = 0; i < list.length; i++) {
        if (list[i].at <= scroll) {
          index = i;
        }
      }
      return index;
    };

    const paint = () => {
      raf = 0;
      head.style.transform = `translate3d(0, ${(fraction() * height).toFixed(1)}px, 0)`;

      const now = currentIndex();
      if (now !== active) {
        active = now;
        markTicks(tickRefs.current, active);

        // Briefly flash section label when passively scrolling across chapter boundaries
        if (painted && hasDomAnchors && hover === null && !drag && active >= 0) {
          placeLabel(active, true);
          window.clearTimeout(flashTimer);
          flashTimer = window.setTimeout(() => {
            if (hover === null && !drag) {
              label.style.opacity = '0';
            }
          }, FLASH_MS);
        }
      }

      // Smooth Gaussian dock-swell magnification around pointer
      let moving = false;
      tickRefs.current.forEach((tick, i) => {
        if (!tick) return;
        const y = (list[i]?.pos ?? 0) * height;
        const target =
          hover === null || reduceMotion
            ? 1
            : 1 + SWELL * Math.exp(-((hover - y) ** 2) / (2 * REACH * REACH));
        const value = (swell[i] ?? 1) + (target - (swell[i] ?? 1)) * 0.35;
        swell[i] = Math.abs(value - target) < 0.005 ? target : value;
        moving ||= swell[i] !== target;
        tick.style.setProperty('--swell', swell[i].toFixed(3));
      });

      painted = true;
      if (moving) {
        schedule();
      }
    };

    function schedule() {
      if (!raf) {
        raf = window.requestAnimationFrame(paint);
      }
    }

    api.current = {
      jump: (index) => {
        const section = list[index];
        if (!section) return;
        playTick();
        onSelectRef.current(section.id);
      },
      show: (index) => {
        hover = (list[index]?.pos ?? 0) * height;
        placeLabel(index, true);
        schedule();
      },
    };

    const railY = (event: PointerEvent) =>
      Math.min(Math.max(event.clientY - rail.getBoundingClientRect().top, 0), height);

    const scrub = (y: number) => {
      if (hasDomAnchors) {
        setWindowScrollImmediate(start + (y / height) * (end - start));
      } else {
        const hit = nearest(y);
        const section = list[hit.index];
        if (section && section.id !== lastScrubbedId) {
          lastScrubbedId = section.id;
          onSelectRef.current(section.id);
        }
      }
    };

    const onDown = (event: PointerEvent) => {
      if (drag || event.button !== 0) return;
      event.preventDefault();
      rail.setPointerCapture(event.pointerId);
      const y = railY(event);
      lastScrubbedId = null;
      drag = { id: event.pointerId, moved: false, y, t: event.timeStamp, v: 0 };
      hover = y;
      rail.dataset.dragging = '';
      placeLabel(nearest(y).index, true);
      schedule();
    };

    const onMove = (event: PointerEvent) => {
      const y = railY(event);
      if (drag && event.pointerId === drag.id) {
        const dt = Math.max(event.timeStamp - drag.t, 1);
        drag.v = drag.v * 0.4 + ((y - drag.y) / dt) * 0.6;
        drag.moved ||= Math.abs(y - drag.y) > 3;
        drag.y = y;
        drag.t = event.timeStamp;
        if (drag.moved) {
          scrub(y);
        }
      } else if (event.pointerType !== 'mouse') {
        return;
      }
      hover = y;
      placeLabel(nearest(y).index, true);
      schedule();
    };

    const onUp = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      const { moved, y, v } = drag;
      drag = null;
      delete rail.dataset.dragging;
      if (event.pointerType !== 'mouse') {
        hover = null;
        placeLabel(-1, false);
      }

      // Project flick momentum and snap magnetically to nearest chapter within SNAP_PX
      const projected = moved ? y + v * 120 : y;
      const hit = nearest(projected);
      if (hit.index >= 0 && (!moved || hit.distance < SNAP_PX)) {
        api.current.jump(hit.index);
      }
      schedule();
    };

    const onLeave = () => {
      if (drag) return;
      hover = null;
      placeLabel(-1, false);
      schedule();
    };

    const onScroll = () => schedule();

    measure();
    paint();

    // Re-measure after layout settles (images, fonts, reading depth toggles)
    const resizeObserver = new ResizeObserver(() => {
      measure();
      schedule();
    });
    resizeObserver.observe(document.body);
    window.addEventListener('resize', measure, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    rail.addEventListener('pointerdown', onDown);
    rail.addEventListener('pointermove', onMove);
    rail.addEventListener('pointerup', onUp);
    rail.addEventListener('pointercancel', onUp);
    rail.addEventListener('pointerleave', onLeave);

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(flashTimer);
      resizeObserver.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', onScroll);
      rail.removeEventListener('pointerdown', onDown);
      rail.removeEventListener('pointermove', onMove);
      rail.removeEventListener('pointerup', onUp);
      rail.removeEventListener('pointercancel', onUp);
      rail.removeEventListener('pointerleave', onLeave);
    };
  }, [chapters]);

  // Keep ticks trimmed and synced whenever chapters/sections or specimen props change
  useEffect(() => {
    tickRefs.current.length = sections.length;
    const idx = sections.findIndex((c) => c.id === activeChapter);
    if (idx >= 0) {
      markTicks(tickRefs.current, idx);
    }
    if (headRef.current && sections.length > 0 && !document.getElementById(sections[0].id)) {
      const clamped = Math.min(Math.max(readingProgress, 0), 1);
      headRef.current.style.transform = `translate3d(0, ${(clamped * RAIL_HEIGHT).toFixed(1)}px, 0)`;
    }
  }, [activeChapter, readingProgress, sections]);

  const onTickKey = (index: number, event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const next = Math.min(
      Math.max(index + (event.key === 'ArrowDown' ? 1 : -1), 0),
      sections.length - 1,
    );
    tickRefs.current[next]?.focus();
  };

  const isNarratingLabel =
    narratingChapterId !== null && labelChapterId === narratingChapterId;

  return (
    <nav
      aria-label="Table of contents"
      className={cn('relative z-10 flex w-full flex-col items-start', className)}
    >
      <div
        ref={railRef}
        className="relative w-12 cursor-pointer touch-none select-none data-[dragging]:cursor-grabbing"
        style={{ height: RAIL_HEIGHT }}
      >
        {sections.map((section, index) => (
          <button
            key={section.id}
            type="button"
            aria-label={section.text}
            data-state="ahead"
            tabIndex={index === 0 ? 0 : -1}
            style={{ top: `${(section.pos * 100).toFixed(3)}%` }}
            ref={(el) => {
              tickRefs.current[index] = el;
            }}
            onFocus={() => api.current.show(index)}
            onBlur={() => labelRef.current?.style.setProperty('opacity', '0')}
            onClick={(event) => {
              // Pointer clicks are handled by the rail; this handles keyboard activation.
              if (event.detail === 0) {
                api.current.jump(index);
              }
            }}
            onKeyDown={(event) => onTickKey(index, event)}
            className="group absolute left-0 h-4 w-3.5 -translate-y-1/2 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--apple-focus-ring)]"
          >
            <span className="absolute left-0 top-1/2 h-[1.5px] w-full origin-left -translate-y-1/2 scale-x-[var(--swell,1)] rounded-full bg-[var(--apple-separator-strong)] transition-colors duration-200 ease-out group-data-[state=current]:bg-[var(--apple-blue)] group-data-[state=passed]:bg-[var(--apple-label-primary)]" />
          </button>
        ))}

        {/* Continuous reading playhead — tracks reader position smoothly between ticks */}
        <span
          ref={headRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 h-[2px] w-6 -translate-y-1/2 rounded-full bg-[var(--apple-label-primary)] will-change-transform"
        />

        {/* Floating chapter label pill — follows hovered/dragged tick or flashes on section enter */}
        <span
          ref={labelRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-9 top-0 inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-2.5 py-1 text-[12px] font-medium tracking-[-0.008em] text-[var(--apple-label-primary)] opacity-0 shadow-sm transition-[opacity,transform] duration-150 ease-out"
        >
          <span ref={labelTextRef} />
          {isNarratingLabel && (
            <AudioLines
              size={12}
              strokeWidth={2}
              aria-hidden="true"
              className="shrink-0 text-[var(--apple-blue)]"
            />
          )}
        </span>
      </div>
    </nav>
  );
}

export default ScrollIndexToc;
