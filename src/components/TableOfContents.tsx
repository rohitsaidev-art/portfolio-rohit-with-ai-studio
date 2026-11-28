import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { TocVariant } from '../utils/portfolio';
import { EASE_APPLE, SPRING_SEGMENT } from '../utils/motion';
import { playTap, playTick } from '../utils/soundEngine';
import {
  AudioLines,
  Box,
  Check,
  ChevronDown,
  Crosshair,
  Eye,
  FileText,
  Gauge,
  Layers,
  List,
  Sparkles,
} from 'lucide-react';
import { ChapterScrubber, type Chapter } from './toc/ChapterScrubber';
import { ScrollIndexToc } from './toc/ScrollIndexToc';

export interface TocChapter {
  id: string;
  num: string;
  label: string;
  subtitle?: string;
}

export interface TocVariantMeta {
  id: TocVariant;
  name: string;
  shortName: string;
  inspiration: string;
  summary: string;
  strengths: string;
}

export const TOC_VARIANTS: readonly TocVariantMeta[] = [
  {
    id: 'notch-rail',
    name: 'Scroll-Notch Minimap',
    shortName: 'Notch Rail',
    inspiration: 'iOS Scroll Indicator & Apple HIG',
    summary:
      'Ultra-quiet hairline ticks along the margin that stay visually calm while reading and expand smoothly with spring physics on hover or focus.',
    strengths: 'Zero clutter next to editorial prose; instant spatial orientation.',
  },
  {
    id: 'ios-capsule',
    name: 'Floating iOS Capsule',
    shortName: 'iOS Capsule',
    inspiration: 'Apple Books & iOS Dynamic Pill',
    summary:
      'A compact floating pill with a live circular reading progress ring and active chapter label that opens an iOS popover sheet with completion checkmarks.',
    strengths: 'Frees the entire horizontal layout; works identically on desktop and mobile.',
  },
  {
    id: 'apple-local-nav',
    name: 'Apple Local Ribbon',
    shortName: 'Local Ribbon',
    inspiration: 'Apple.com Product Sub-Navigation',
    summary:
      'A translucent horizontal chapter bar anchored cleanly beneath the global navbar with sliding active highlight and hairline reading progress.',
    strengths: 'Classic Apple editorial clarity; every chapter is always one click away.',
  },
  {
    id: 'macos-sidebar',
    name: 'macOS Docs Sidebar',
    shortName: 'macOS Rail',
    inspiration: 'Apple Developer Documentation & macOS Settings',
    summary:
      'A structured left inspector rail with Lucide icons per chapter, vertical progress hairline, soft cobalt selection tint, and completion percentage.',
    strengths: 'Best for deep analytical scanning and technical architecture case studies.',
  },
  {
    id: 'tactile-scrubber',
    name: 'Draggable Chapter Scrubber',
    shortName: 'Detent Scrubber',
    inspiration: 'Apple Watch Detents & iOS Haptic Ruler',
    summary:
      'A physical draggable vertical track with chapter detents—drag the Apple thumb directly along the rail to jump through chapters in real time.',
    strengths: 'Tactile, direct-manipulation control that pairs naturally with Read Aloud.',
  },
  {
    id: 'chapter-scrubber',
    name: 'Minimal Chapter Scrubber',
    shortName: 'Chapter Scrubber',
    inspiration: 'Ruixen UI Editorial Scrubber',
    summary:
      'Minimalist vertical tick scrubber displaying only the active section beside a blue (#0A84FF) tick at rest, smoothly revealing all headings in place on hover or focus.',
    strengths: 'Zero visual noise at rest with instant in-place expansion and zero layout shift.',
  },
  {
    id: 'scroll-index',
    name: 'Proportional Scroll Index',
    shortName: 'Scroll Index',
    inspiration: 'Kokonut UI Scroll Index',
    summary:
      'Proportional vertical tick rail with a continuous reading playhead, Gaussian dock-swell magnification on hover, direct pointer drag-scrubbing with flick momentum snap, and a brief section-entry label flash.',
    strengths: 'Shows real section length proportions and continuous progress between headings with physical scrub control.',
  },
];

function ChapterSymbol({ index, className }: { index: number; className?: string }) {
  const icons = [
    FileText,
    Crosshair,
    Eye,
    Layers,
    Gauge,
    Box,
    Sparkles,
  ];
  const Icon = icons[index % icons.length];
  return <Icon size={15} strokeWidth={1.75} aria-hidden="true" className={className} />;
}

interface TableOfContentsProps {
  variant: TocVariant;
  chapters: readonly TocChapter[];
  activeChapter: string;
  readingProgress: number; // 0 to 1
  narratingChapterId?: string | null;
  onSelectChapter: (id: string) => void;
  layoutNamespace?: string;
}

/**
 * Renders the chosen Apple-grade Table of Contents architecture.
 * Note: 'apple-local-nav' and 'ios-capsule' render outside the sidebar column
 * (full-width ribbon or floating capsule), whereas 'notch-rail', 'macos-sidebar',
 * and 'tactile-scrubber' occupy the sticky side rail.
 */
export function TableOfContents({
  variant,
  chapters,
  activeChapter,
  readingProgress,
  narratingChapterId,
  onSelectChapter,
  layoutNamespace = 'toc',
}: TableOfContentsProps) {
  switch (variant) {
    case 'notch-rail':
      return (
        <NotchRailToc
          chapters={chapters}
          activeChapter={activeChapter}
          narratingChapterId={narratingChapterId}
          onSelectChapter={onSelectChapter}
        />
      );
    case 'ios-capsule':
      return (
        <IosCapsuleToc
          chapters={chapters}
          activeChapter={activeChapter}
          readingProgress={readingProgress}
          narratingChapterId={narratingChapterId}
          onSelectChapter={onSelectChapter}
        />
      );
    case 'apple-local-nav':
      return (
        <AppleLocalNavToc
          chapters={chapters}
          activeChapter={activeChapter}
          readingProgress={readingProgress}
          narratingChapterId={narratingChapterId}
          onSelectChapter={onSelectChapter}
          layoutNamespace={layoutNamespace}
        />
      );
    case 'macos-sidebar':
      return (
        <MacOsSidebarToc
          chapters={chapters}
          activeChapter={activeChapter}
          readingProgress={readingProgress}
          narratingChapterId={narratingChapterId}
          onSelectChapter={onSelectChapter}
        />
      );
    case 'tactile-scrubber':
      return (
        <TactileScrubberToc
          chapters={chapters}
          activeChapter={activeChapter}
          narratingChapterId={narratingChapterId}
          onSelectChapter={onSelectChapter}
        />
      );
    case 'chapter-scrubber':
      return (
        <ChapterScrubberToc
          chapters={chapters}
          activeChapter={activeChapter}
          onSelectChapter={onSelectChapter}
          layoutNamespace={layoutNamespace}
        />
      );
    case 'scroll-index':
      return (
        <ScrollIndexToc
          chapters={chapters}
          activeChapter={activeChapter}
          readingProgress={readingProgress}
          narratingChapterId={narratingChapterId}
          onSelectChapter={onSelectChapter}
          className="sticky top-28"
        />
      );
  }
}

/* 1. Apple Scroll-Notch Minimap */
function NotchRailToc({
  chapters,
  activeChapter,
  narratingChapterId,
  onSelectChapter,
}: {
  chapters: readonly TocChapter[];
  activeChapter: string;
  narratingChapterId?: string | null;
  onSelectChapter: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <nav
      aria-label="Chapter minimap navigation"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setExpanded(false);
        }
      }}
      className="sticky top-28"
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="type-caption text-[var(--apple-label-tertiary)]">
          On this page
        </span>
        <span className="text-[11px] font-medium text-[var(--apple-label-tertiary)]">
          {expanded ? 'Select' : 'Hover'}
        </span>
      </div>

      <ol className="space-y-1">
        {chapters.map((chapter) => {
          const isActive = chapter.id === activeChapter;
          const isNarrating = chapter.id === narratingChapterId;
          return (
            <li key={chapter.id}>
              <button
                type="button"
                onClick={() => onSelectChapter(chapter.id)}
                className="group flex w-full items-center gap-3 rounded-full py-1.5 pl-1 pr-3 text-left transition-colors"
              >
                {/* Optical Apple Notch Bar */}
                <span
                  aria-hidden="true"
                  className={`block h-[2.5px] shrink-0 rounded-full transition-[width,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isActive
                      ? 'w-7 bg-[var(--apple-blue)]'
                      : expanded
                        ? 'w-4 bg-[var(--apple-separator-strong)] group-hover:w-6 group-hover:bg-[var(--apple-label-primary)]'
                        : 'w-3.5 bg-[var(--apple-separator-strong)] group-hover:w-5 group-hover:bg-[var(--apple-label-secondary)]'
                  }`}
                />

                {/* Label smoothly reveals on hover or when active */}
                <span
                  className={`flex min-w-0 items-center gap-1.5 truncate text-[13px] tracking-[-0.012em] transition-[opacity,transform,color] duration-250 ${
                    isActive
                      ? 'translate-x-0 font-semibold text-[var(--apple-label-primary)] opacity-100'
                      : expanded
                        ? 'translate-x-0 font-medium text-[var(--apple-label-secondary)] opacity-100 group-hover:text-[var(--apple-label-primary)]'
                        : '-translate-x-1 text-[var(--apple-label-tertiary)] opacity-45 group-hover:opacity-90'
                  }`}
                >
                  <span className="truncate">{chapter.label}</span>
                  {isNarrating && (
                    <AudioLines size={12} strokeWidth={2} aria-hidden="true" className="shrink-0 text-[var(--apple-blue)]" />
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* 2. Floating iOS Dynamic Capsule + Popover Sheet */
function IosCapsuleToc({
  chapters,
  activeChapter,
  readingProgress,
  narratingChapterId,
  onSelectChapter,
}: {
  chapters: readonly TocChapter[];
  activeChapter: string;
  readingProgress: number;
  narratingChapterId?: string | null;
  onSelectChapter: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const activeIndex = Math.max(
    0,
    chapters.findIndex((c) => c.id === activeChapter),
  );
  const current = chapters[activeIndex] ?? chapters[0];
  const radius = 8.5;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - Math.min(1, Math.max(0, readingProgress)));

  return (
    <div className="sticky top-20 z-30 flex justify-end pointer-events-none">
      <div className="relative pointer-events-auto">
        <button
          type="button"
          onClick={() => {
            playTap();
            setOpen((prev) => !prev);
          }}
          aria-expanded={open}
          aria-label="Open chapter menu"
          className="apple-ios-bar inline-flex items-center gap-2.5 rounded-full py-2 pl-2.5 pr-4 text-[13.5px] font-medium tracking-[-0.012em] text-[var(--apple-label-primary)] transition-transform duration-200 hover:scale-[1.015] active:scale-[0.97]"
        >
          {/* Circular iOS Reading Progress Ring */}
          <span className="relative inline-flex h-6 w-6 items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 22 22" className="-rotate-90" aria-hidden="true">
              <circle
                cx="11"
                cy="11"
                r={radius}
                fill="none"
                stroke="var(--apple-separator)"
                strokeWidth="2.2"
              />
              <circle
                cx="11"
                cy="11"
                r={radius}
                fill="none"
                stroke="var(--apple-blue)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
              />
            </svg>
          </span>

          <span className="type-caption tabular-nums text-[var(--apple-link)]">
            {current.num}
          </span>
          <span className="max-w-[160px] truncate font-semibold text-[var(--apple-label-primary)]">
            {current.label}
          </span>
          <ChevronDown
            size={14}
            strokeWidth={1.75}
            aria-hidden="true"
            className={`text-[var(--apple-label-secondary)] transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.22, ease: EASE_APPLE }}
              className="apple-ios-bar absolute right-0 mt-2.5 w-[280px] origin-top-right overflow-hidden rounded-[20px] p-2"
            >
              <div className="type-caption flex items-center justify-between px-3 py-2 text-[var(--apple-label-tertiary)]">
                <span className="inline-flex items-center gap-1.5">
                  <List size={13} strokeWidth={2} aria-hidden="true" />
                  <span>Chapters</span>
                </span>
                <span className="tabular-nums">{Math.round(readingProgress * 100)}% read</span>
              </div>

              <ol className="space-y-0.5">
                {chapters.map((chapter, idx) => {
                  const isActive = chapter.id === activeChapter;
                  const isVisited = idx < activeIndex;
                  const isNarrating = chapter.id === narratingChapterId;
                  return (
                    <li key={chapter.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectChapter(chapter.id);
                          setOpen(false);
                        }}
                        className={`flex w-full items-center justify-between gap-2 rounded-[14px] px-3 py-2.5 text-left text-[13.5px] tracking-[-0.012em] transition-colors ${
                          isActive
                            ? 'bg-[var(--apple-blue-fill)] font-semibold text-white'
                            : 'text-[var(--apple-label-primary)] hover:bg-[var(--apple-control-hover)]'
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          <span
                            className={`tabular-nums text-[12px] font-semibold ${
                              isActive ? 'text-white/80' : 'text-[var(--apple-label-tertiary)]'
                            }`}
                          >
                            {chapter.num}
                          </span>
                          <span className="truncate">{chapter.label}</span>
                        </span>

                        {isNarrating ? (
                          <AudioLines
                            size={13}
                            strokeWidth={2}
                            aria-hidden="true"
                            className={isActive ? 'text-white' : 'text-[var(--apple-blue)]'}
                          />
                        ) : isVisited ? (
                          <Check
                            size={13}
                            strokeWidth={2}
                            aria-hidden="true"
                            className={isActive ? 'text-white' : 'text-[var(--apple-blue)]'}
                          />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* 3. Apple Product-Page Sticky Local Navigation Ribbon */
function AppleLocalNavToc({
  chapters,
  activeChapter,
  readingProgress,
  narratingChapterId,
  onSelectChapter,
  layoutNamespace,
}: {
  chapters: readonly TocChapter[];
  activeChapter: string;
  readingProgress: number;
  narratingChapterId?: string | null;
  onSelectChapter: (id: string) => void;
  layoutNamespace: string;
}) {
  return (
    <div
      data-sticky-subnav="true"
      className="editorial-nav-surface sticky top-[52px] z-30 border-b border-[var(--apple-separator-subtle)]"
    >
      <div className="mx-auto flex max-w-[1160px] items-center justify-between gap-4 px-5 py-2.5 sm:px-8">
        <nav
          aria-label="Chapter local navigation"
          className="flex flex-1 items-center gap-1 overflow-x-auto py-0.5"
        >
          {chapters.map((chapter) => {
            const isActive = chapter.id === activeChapter;
            const isNarrating = chapter.id === narratingChapterId;
            return (
              <button
                key={chapter.id}
                type="button"
                onClick={() => onSelectChapter(chapter.id)}
                className={`relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium tracking-[-0.012em] transition-colors ${
                  isActive
                    ? 'text-[var(--apple-label-primary)]'
                    : 'text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId={`${layoutNamespace}-local-ribbon-pill`}
                    transition={SPRING_SEGMENT}
                    className="absolute inset-0 -z-10 rounded-full bg-[var(--apple-bg-secondary)]"
                  />
                )}
                <span
                  className={`tabular-nums text-[11.5px] font-semibold ${
                    isActive ? 'text-[var(--apple-blue)]' : 'text-[var(--apple-label-tertiary)]'
                  }`}
                >
                  {chapter.num}
                </span>
                <span>{chapter.label}</span>
                {isNarrating && <AudioLines size={12} strokeWidth={2} aria-hidden="true" className="text-[var(--apple-blue)]" />}
              </button>
            );
          })}
        </nav>

        <span className="type-caption hidden shrink-0 tabular-nums font-medium text-[var(--apple-label-tertiary)] md:inline">
          {Math.round(readingProgress * 100)}%
        </span>
      </div>

      {/* Continuous hairline progress bar */}
      <div className="h-[2px] w-full bg-[var(--apple-separator-subtle)]">
        <div
          style={{ width: `${Math.min(100, Math.max(0, readingProgress * 100))}%` }}
          className="h-full bg-[var(--apple-blue)] transition-[width] duration-150 ease-out"
        />
      </div>
    </div>
  );
}

/* 4. macOS Settings / Apple Developer Docs Sidebar */
function MacOsSidebarToc({
  chapters,
  activeChapter,
  readingProgress,
  narratingChapterId,
  onSelectChapter,
}: {
  chapters: readonly TocChapter[];
  activeChapter: string;
  readingProgress: number;
  narratingChapterId?: string | null;
  onSelectChapter: (id: string) => void;
}) {
  const activeIndex = Math.max(
    0,
    chapters.findIndex((c) => c.id === activeChapter),
  );

  return (
    <nav aria-label="macOS chapters sidebar" className="sticky top-24">
      <div className="rounded-[20px] bg-[var(--apple-bg-secondary)] p-3">
        <div className="flex items-center justify-between px-2.5 pb-2.5 pt-1">
          <span className="type-caption text-[var(--apple-label-secondary)]">
            Contents
          </span>
          <span className="type-caption tabular-nums text-[var(--apple-link)]">
            {Math.round(readingProgress * 100)}%
          </span>
        </div>

        <ol className="space-y-0.5">
          {chapters.map((chapter, idx) => {
            const isActive = chapter.id === activeChapter;
            const isDone = idx < activeIndex;
            const isNarrating = chapter.id === narratingChapterId;
            return (
              <li key={chapter.id}>
                <button
                  type="button"
                  onClick={() => onSelectChapter(chapter.id)}
                  className={`flex w-full items-center justify-between gap-2 rounded-[14px] px-2.5 py-2 text-left text-[13.5px] tracking-[-0.012em] transition-[background-color,color,box-shadow] duration-200 ${
                    isActive
                      ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] font-semibold text-[var(--apple-label-primary)]'
                      : 'text-[var(--apple-label-secondary)] hover:bg-[var(--apple-control-hover)] hover:text-[var(--apple-label-primary)]'
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${
                        isActive
                          ? 'bg-[var(--apple-blue-fill)] text-white'
                          : isDone
                            ? 'bg-[var(--apple-blue)]/10 text-[var(--apple-blue)]'
                            : 'bg-[var(--apple-control-hover)] text-[var(--apple-label-secondary)]'
                      }`}
                    >
                      <ChapterSymbol index={idx} />
                    </span>
                    <span className="truncate">{chapter.label}</span>
                  </span>

                  {isNarrating ? (
                    <AudioLines size={13} strokeWidth={2} aria-hidden="true" className="shrink-0 text-[var(--apple-blue)]" />
                  ) : isDone ? (
                    <Check size={12} strokeWidth={2} aria-hidden="true" className="shrink-0 text-[var(--apple-blue)]" />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

/* 5. Draggable Vertical Chapter Detent Scrubber */
function TactileScrubberToc({
  chapters,
  activeChapter,
  narratingChapterId,
  onSelectChapter,
}: {
  chapters: readonly TocChapter[];
  activeChapter: string;
  narratingChapterId?: string | null;
  onSelectChapter: (id: string) => void;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const activeIndex = Math.max(
    0,
    chapters.findIndex((c) => c.id === activeChapter),
  );
  const effectiveIndex = draggingIndex ?? activeIndex;

  const clientYToIndex = useCallback(
    (clientY: number) => {
      const rect = railRef.current?.getBoundingClientRect();
      if (!rect || rect.height <= 0 || chapters.length <= 1) return 0;
      const ratio = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
      return Math.round(ratio * (chapters.length - 1));
    },
    [chapters.length],
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const idx = clientYToIndex(event.clientY);
    setDraggingIndex(idx);
    playTick();
    onSelectChapter(chapters[idx].id);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (draggingIndex === null) return;
    const idx = clientYToIndex(event.clientY);
    if (idx !== draggingIndex) {
      setDraggingIndex(idx);
      playTick();
      onSelectChapter(chapters[idx].id);
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (draggingIndex === null) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDraggingIndex(null);
  };

  const thumbPercent =
    chapters.length > 1 ? (effectiveIndex / (chapters.length - 1)) * 100 : 0;

  return (
    <nav aria-label="Draggable chapter scrubber" className="sticky top-24">
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="type-caption text-[var(--apple-label-secondary)]">
          Chapter Scrubber
        </span>
        <span className="text-[11px] font-medium text-[var(--apple-link)]">Drag rail</span>
      </div>

      <div className="flex items-stretch gap-3.5">
        {/* Physical Draggable Detent Rail */}
        <div
          ref={railRef}
          role="slider"
          tabIndex={0}
          aria-orientation="vertical"
          aria-label="Drag to scrub across chapters"
          aria-valuemin={1}
          aria-valuemax={chapters.length}
          aria-valuenow={effectiveIndex + 1}
          aria-valuetext={chapters[effectiveIndex]?.label}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown' && effectiveIndex < chapters.length - 1) {
              e.preventDefault();
              onSelectChapter(chapters[effectiveIndex + 1].id);
            } else if (e.key === 'ArrowUp' && effectiveIndex > 0) {
              e.preventDefault();
              onSelectChapter(chapters[effectiveIndex - 1].id);
            }
          }}
          className="relative my-3 flex w-7 shrink-0 touch-none select-none cursor-grab justify-center active:cursor-grabbing"
        >
          <div className="relative h-full w-[4px] rounded-full bg-[var(--apple-separator)]">
            <div
              style={{ height: `${thumbPercent}%` }}
              className="w-full rounded-full bg-[var(--apple-blue)]"
            />
            {chapters.map((chapter, idx) => {
              const pct =
                chapters.length > 1 ? (idx / (chapters.length - 1)) * 100 : 0;
              return (
                <span
                  key={chapter.id}
                  aria-hidden="true"
                  style={{ top: `${pct}%` }}
                  className={`absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                    idx <= effectiveIndex
                      ? 'bg-[var(--apple-blue)]'
                      : 'bg-[var(--apple-separator-strong)]'
                  }`}
                />
              );
            })}
            <span
              aria-hidden="true"
              style={{ top: `${thumbPercent}%` }}
              className={`apple-pill-shadow absolute left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--apple-blue)] bg-[var(--apple-surface-elevated)] transition-transform duration-150 ${
                draggingIndex !== null ? 'scale-125 ring-4 ring-[var(--apple-focus-ring)]' : ''
              }`}
            />
          </div>
        </div>

        {/* Aligned Chapter Labels */}
        <ol className="flex flex-1 flex-col justify-between gap-1.5">
          {chapters.map((chapter, idx) => {
            const isActive = idx === effectiveIndex;
            const isNarrating = chapter.id === narratingChapterId;
            return (
              <li key={chapter.id}>
                <button
                  type="button"
                  onClick={() => onSelectChapter(chapter.id)}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-left text-[13.5px] tracking-[-0.012em] transition-colors ${
                    isActive
                      ? 'bg-[var(--apple-blue)]/[0.1] font-semibold text-[var(--apple-link)]'
                      : 'text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                  }`}
                >
                  <span className="truncate">
                    <span className="mr-2 tabular-nums text-[11.5px] opacity-70">
                      {chapter.num}
                    </span>
                    {chapter.label}
                  </span>
                  {isNarrating && (
                    <AudioLines size={12} strokeWidth={2} aria-hidden="true" className="shrink-0 text-[var(--apple-blue)]" />
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

/* 6. Minimalist Editorial Chapter Scrubber (src/components/toc/ChapterScrubber) */
function ChapterScrubberToc({
  chapters,
  activeChapter,
  onSelectChapter,
  layoutNamespace,
}: {
  chapters: readonly TocChapter[];
  activeChapter: string;
  onSelectChapter: (id: string) => void;
  layoutNamespace: string;
}) {
  const scrubberChapters: Chapter[] = chapters.map((ch) => ({
    id: ch.id,
    title: ch.label,
  }));

  return (
    <ChapterScrubber
      chapters={scrubberChapters}
      activeChapterId={activeChapter}
      label="Table of contents"
      layoutNamespace={layoutNamespace}
      onSelect={(chapter) => {
        onSelectChapter(chapter.id);
      }}
      className="sticky top-28"
    />
  );
}

