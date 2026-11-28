import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import type { TocVariant } from '../utils/portfolio';
import { EASE_APPLE, SPRING_SEGMENT } from '../utils/motion';
import {
  TOC_VARIANTS,
  TableOfContents,
  type TocChapter,
} from '../components/TableOfContents';
import { AudioPlayer } from '../components/AudioPlayer';
import { Check, ChevronRight, PanelLeft } from 'lucide-react';
import type { NarrationSegment } from '../utils/readAloud';
import {
  ANCHOR_BREATHING_ROOM_PX,
  STICKY_HEADER_HEIGHT_PX,
  STICKY_SUBNAV_HEIGHT_PX,
  resolveActiveSectionId,
  scrollToElementById,
} from '../utils/scroll';
import { playSuccessChime, playTick } from '../utils/soundEngine';

interface TocLabPageProps {
  appliedTocVariant: TocVariant;
  onApplyTocVariant: (variant: TocVariant) => void;
  onNavigate: (path: string) => void;
  embedded?: boolean;
}

interface SampleChapter extends TocChapter {
  lead: string;
  body: string[];
  note: string;
}

const SAMPLE_CHAPTERS: readonly SampleChapter[] = [
  {
    id: 'lab-overview',
    num: '01',
    label: 'Overview',
    lead: 'Navigation in long-form case studies should orient without competing for attention.',
    body: [
      'A Table of Contents plays a quiet supporting role. When a reader is absorbed in a case study, a heavy bordered sidebar steals visual weight from photography, prototypes, and typographic rhythm.',
      'This sandbox lets us test seven distinct Apple-inspired navigation architectures on a live scrolling document—comparing peripheral notch minimaps, floating iOS capsules, sticky local ribbons, macOS inspector rails, draggable detent scrubbers, minimalist editorial chapter scrubbers, and spring-driven wave chapter scrubbers.',
    ],
    note: 'Scroll naturally, click any chapter, or test the Read Aloud scrubber above to watch both systems stay synchronized.',
  },
  {
    id: 'lab-hierarchy',
    num: '02',
    label: 'Visual Hierarchy',
    lead: 'Restraint is achieved through optical weight rather than decorative borders.',
    body: [
      'Apple interfaces separate navigation from content using subtle luminance shifts, disciplined spacing, and exact type scales. Active states rely on crisp contrast and calibrated Apple Blue accents rather than thick left stripes or noisy pills.',
      'Pay close attention to how each TOC variant behaves in your peripheral vision while scanning paragraphs at 1440px desktop width.',
    ],
    note: 'Notice how the Notch Rail fades back to hairline geometry until invited, while the macOS Rail emphasizes structure and progress.',
  },
  {
    id: 'lab-scrubber',
    num: '03',
    label: 'Direct Manipulation',
    lead: 'Dragging a timeline or chapter detent turns passive reading into tactile control.',
    body: [
      'On iOS and macOS, scrolling and scrubbing feel connected to physical inertia. In Variant 05 (Draggable Chapter Scrubber) and in the Read Aloud player, grabbing the thumb and sliding directly across chapter detents jumps the page cleanly to the corresponding section.',
      'Because every chapter maps cleanly to both scroll offsets and audio timestamps, jumping backward or forward by 15 seconds keeps the written narrative right beside the spoken word.',
    ],
    note: 'Try switching to Detent Scrubber and dragging vertically along the left track to sweep smoothly across all six chapters.',
  },
  {
    id: 'lab-density',
    num: '04',
    label: 'Spatial Footprint',
    lead: 'Wide editorial margins allow case study imagery and interactive prototypes to breathe.',
    body: [
      'Traditional 3-column sidebars permanently reserve 240 to 280 pixels of horizontal width, squeezing embedded UI prototypes and photography on smaller laptop displays.',
      'By contrast, the Floating iOS Capsule and Apple Local Ribbon reclaim the full horizontal reading column while still keeping chapter switching one click away.',
    ],
    note: 'Compare the horizontal breathing room of the text column when switching between Local Ribbon, iOS Capsule, and macOS Rail.',
  },
  {
    id: 'lab-audio',
    num: '05',
    label: 'Audio Synchronization',
    lead: 'Pairing Read Aloud with live chapter indicators gives readers two ways to scan.',
    body: [
      'Some hiring managers and founders skim visually; others listen while reviewing decks or commuting. Showing a subtle Lucide waveform beside the currently narrated chapter connects the floating audio bar directly to the TOC.',
      'Use the inline player or floating dock to play, pause, jump ±15 seconds, or drag straight to any chapter.',
    ],
    note: 'Press Play in the Read Aloud bar above and watch the waveform follow whichever chapter is currently being read.',
  },
  {
    id: 'lab-decision',
    num: '06',
    label: 'Applying Your Choice',
    lead: 'Pick whichever TOC feels sharpest and promote it live across every case study.',
    body: [
      'Whenever you find a pattern that feels right, use the "Apply to Case Studies" action at the top of the lab. Every project page—StallSync, Music Discovery PWA, The Curse of the Mudradhaar, Precognition Labs, HubApps, and MycroHarvest—will immediately adopt that TOC architecture.',
      'We can continue iterating on micro-details—notch lengths, translucent materials, hover radii, or mobile drawer choreography—as we refine the portfolio together.',
    ],
    note: 'Click "Preview on StallSync" after applying your favorite TOC variant to evaluate it against a full project case study.',
  },
];

export function TocLabPage({
  appliedTocVariant,
  onApplyTocVariant,
  onNavigate,
  embedded = false,
}: TocLabPageProps) {
  const [previewVariant, setPreviewVariant] =
    useState<TocVariant>(appliedTocVariant);
  const [activeChapter, setActiveChapter] = useState<string>(
    SAMPLE_CHAPTERS[0].id,
  );
  const [readingProgress, setReadingProgress] = useState(0);
  const [narratingChapterId, setNarratingChapterId] = useState<string | null>(
    null,
  );

  const selectedMeta =
    TOC_VARIANTS.find((v) => v.id === previewVariant) ?? TOC_VARIANTS[0];
  const isApplied = appliedTocVariant === previewVariant;

  const tocChapters: TocChapter[] = useMemo(
    () =>
      SAMPLE_CHAPTERS.map((ch) => ({
        id: ch.id,
        num: ch.num,
        label: ch.label,
        subtitle: ch.lead,
      })),
    [],
  );

  const narrationSegments: NarrationSegment[] = useMemo(
    () =>
      SAMPLE_CHAPTERS.map((ch) => ({
        id: ch.id,
        num: ch.num,
        title: ch.label,
        text: `${ch.label}. ${ch.lead} ${ch.body.join(' ')}`,
      })),
    [],
  );

  useEffect(() => {
    const handleScroll = () => {
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setReadingProgress(0);
        return;
      }
      setReadingProgress(Math.min(1, Math.max(0, window.scrollY / docHeight)));
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const elements = SAMPLE_CHAPTERS.map((c) =>
      document.getElementById(c.id),
    ).filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const headerOffsetPx =
      previewVariant === 'apple-local-nav'
        ? STICKY_HEADER_HEIGHT_PX +
          STICKY_SUBNAV_HEIGHT_PX +
          ANCHOR_BREATHING_ROOM_PX
        : STICKY_HEADER_HEIGHT_PX + ANCHOR_BREATHING_ROOM_PX;

    const intersectingIds = new Set<string>();
    let rafId: number | null = null;

    const syncActiveSection = () => {
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

      const nextActive = resolveActiveSectionId({
        sections: metrics,
        headerOffsetPx,
        viewportHeight,
        isAtPageBottom,
      });

      if (nextActive) {
        setActiveChapter(nextActive);
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
    syncActiveSection();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', scheduleSync);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [previewVariant]);

  const scrollToChapter = useCallback((id: string) => {
    setActiveChapter(id);
    scrollToElementById(id);
  }, []);

  const usesSidebarColumn =
    previewVariant === 'notch-rail' ||
    previewVariant === 'macos-sidebar' ||
    previewVariant === 'tactile-scrubber' ||
    previewVariant === 'chapter-scrubber' ||
    previewVariant === 'wave-scrubber' ||
    previewVariant === 'scroll-index';

  return (
    <div className="bg-[var(--apple-bg)]">
      {/* Lab Header & Variant Switcher */}
      <section
        className={
          embedded
            ? 'border-b border-[var(--apple-separator)] pb-10'
            : 'bg-[var(--apple-bg-secondary)] pb-14 pt-12 sm:pb-16 sm:pt-16'
        }
      >
        <div className={embedded ? '' : 'mx-auto max-w-[1160px] px-5 sm:px-8'}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.48, ease: EASE_APPLE }}
            className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
          >
            <div>
              <p className="type-eyebrow inline-flex items-center gap-1.5 text-[var(--apple-link)]">
                <PanelLeft size={16} strokeWidth={1.75} aria-hidden="true" />
                <span>Module 14 · Internal TOC Lab</span>
              </p>
              <h2 className="type-title-1 measure-title mt-3">
                Experimenting with Apple-grade Table of Contents patterns.
              </h2>
              <p className="type-lead measure-lead mt-4">
                Compare seven distinct navigation studies live on a scrolling narrative. Apply your favorite design to update every case study across the portfolio.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  playSuccessChime();
                  onApplyTocVariant(previewVariant);
                }}
                className={isApplied ? 'apple-btn-tonal' : 'apple-btn-primary'}
              >
                {isApplied ? (
                  <>
                    <Check size={15} strokeWidth={1.75} aria-hidden="true" className="text-[var(--apple-blue)]" />
                    <span>Active on Case Studies</span>
                  </>
                ) : (
                  <span>Apply to Case Studies</span>
                )}
              </button>

              <a
                href="/work/stallsync"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/work/stallsync');
                }}
                className="apple-btn-outline"
              >
                <span>Preview on StallSync</span>
                <ChevronRight size={14} strokeWidth={1.75} aria-hidden="true" />
              </a>
            </div>
          </motion.div>

          {/* Single-row iOS Segmented Variant Switcher */}
          <div className="mt-10 overflow-x-auto pb-1">
            <div
              role="tablist"
              aria-label="Choose a Table of Contents experiment"
              className="apple-segmented"
            >
              {TOC_VARIANTS.map((variant, idx) => {
                const active = variant.id === previewVariant;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      playTick();
                      setPreviewVariant(variant.id);
                    }}
                    className={`apple-segmented-item min-h-[38px] px-4 py-1.5 text-[13.5px] ${
                      active
                        ? 'text-[var(--apple-label-primary)]'
                        : 'text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="toc-lab-variant-thumb"
                        transition={SPRING_SEGMENT}
                        className="apple-pill-shadow absolute inset-0 rounded-full bg-[var(--apple-control-thumb)]"
                      />
                    )}
                    <span className="relative z-10 inline-flex items-center gap-1.5">
                      <span className="tabular-nums text-[11.5px] opacity-60">
                        0{idx + 1}
                      </span>
                      <span>{variant.shortName}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Study Rationale Sheet */}
          <div className="apple-surface-subtle mt-6 grid grid-cols-1 gap-6 rounded-[20px] p-6 sm:p-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <p className="type-caption text-[var(--apple-link)]">
                {selectedMeta.inspiration}
              </p>
              <h3 className="type-title-3 mt-1.5">
                {selectedMeta.name}
              </h3>
            </div>
            <div className="space-y-2 lg:col-span-7">
              <p className="type-callout text-[var(--apple-label-primary)]">
                {selectedMeta.summary}
              </p>
              <p className="type-footnote font-normal text-[var(--apple-label-secondary)]">
                <span className="font-semibold text-[var(--apple-label-primary)]">Strength:</span>{' '}
                {selectedMeta.strengths}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Variant 3: Sticky Local Ribbon renders full-width below the lab header */}
      {previewVariant === 'apple-local-nav' && (
        <TableOfContents
          variant="apple-local-nav"
          chapters={tocChapters}
          activeChapter={activeChapter}
          readingProgress={readingProgress}
          narratingChapterId={narratingChapterId}
          onSelectChapter={scrollToChapter}
          layoutNamespace="toc-lab"
        />
      )}

      {/* Live Interactive Reading Canvas */}
      <section
        className={
          embedded
            ? 'pb-20 pt-10'
            : 'mx-auto max-w-[1160px] px-5 pb-32 pt-12 sm:px-8 sm:pt-16'
        }
      >
        {/* Reusable Apple HIG AudioPlayer synced with the live TOC sandbox */}
        <div className="mb-12">
          <AudioPlayer
            title="TOC Architecture Exploration"
            segments={narrationSegments}
            onActiveSectionChange={setNarratingChapterId}
            onJumpToSection={scrollToChapter}
          />
        </div>

        {/* Variant 2: Floating iOS Capsule */}
        {previewVariant === 'ios-capsule' && (
          <div className="mb-8">
            <TableOfContents
              variant="ios-capsule"
              chapters={tocChapters}
              activeChapter={activeChapter}
              readingProgress={readingProgress}
              narratingChapterId={narratingChapterId}
              onSelectChapter={scrollToChapter}
              layoutNamespace="toc-lab"
            />
          </div>
        )}

        <div
          className={
            usesSidebarColumn
              ? 'grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16'
              : 'mx-auto max-w-[780px]'
          }
        >
          {usesSidebarColumn && (
            <aside className="relative z-30 hidden lg:col-span-3 lg:block">
              <TableOfContents
                variant={previewVariant}
                chapters={tocChapters}
                activeChapter={activeChapter}
                readingProgress={readingProgress}
                narratingChapterId={narratingChapterId}
                onSelectChapter={scrollToChapter}
                layoutNamespace="toc-lab"
              />
            </aside>
          )}

          <div className={usesSidebarColumn ? 'space-y-16 lg:col-span-9' : 'space-y-16'}>
            {SAMPLE_CHAPTERS.map((chapter) => {
              const isNarrating = narratingChapterId === chapter.id;
              return (
                <article
                  key={chapter.id}
                  id={chapter.id}
                  className={`scroll-mt-32 rounded-[20px] p-7 transition-[background-color,box-shadow] duration-300 sm:p-10 ${
                    isNarrating
                      ? 'bg-[var(--apple-blue)]/[0.06] ring-1 ring-[var(--apple-blue)]/30'
                      : 'bg-[var(--apple-bg-secondary)]'
                  }`}
                >
                  <p className="type-caption text-[var(--apple-link)]">
                    {chapter.num} · {chapter.label}
                  </p>
                  <h3 className="type-title-2 measure-title mt-3">
                    {chapter.lead}
                  </h3>
                  <div className="prose-stack type-body measure-prose mt-6">
                    {chapter.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  <p className="type-footnote measure-prose mt-7 border-t border-[var(--apple-separator-subtle)] pt-4 font-normal text-[var(--apple-label-tertiary)]">
                    {chapter.note}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
