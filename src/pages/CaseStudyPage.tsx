import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { PROJECTS, type CaseStudyProject } from '../data/projects';
import { VERIFIED_TESTIMONIALS } from '../data/testimonials';
import { CaseStudyPrototype } from '../components/CaseStudyPrototypes';
import { CaseStudyDiagram } from '../components/CaseStudyDiagrams';
import { Lightbox, type LightboxImage } from '../components/Lightbox';
import { AudioPlayer } from '../components/AudioPlayer';
import { MiniAudioEqualizer } from '../components/AudioWaveform';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ProjectCreditsSection } from '../components/ProjectCreditsSection';
import { RelatedProjectsSection } from '../components/RelatedProjectsSection';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { ReaderComfortPopover } from '../components/ReaderComfortPopover';
import { BeforeAfterComparator } from '../components/BeforeAfterComparator';
import { MobileReadingBar } from '../components/MobileReadingBar';
import { TableOfContents } from '../components/TableOfContents';
import {
  SFBookmark,
  SFBookmarkFill,
  SFChevronLeft,
  SFChevronRight,
  SFExpand,
} from '../components/SFSymbols';
import {
  getAdjacentProjects,
  getCaseStudyMetrics,
  getRelatedProjects,
  type TocVariant,
} from '../utils/portfolio';
import {
  buildCaseStudyNarrationSegments,
  estimateSkimReadMinutes,
  getCaseStudyChaptersForDepth,
  type ReadingDepthMode,
} from '../utils/caseStudyDepth';
import { scrollToElementById } from '../utils/scroll';
import { toggleShortlistSlug, useShortlistSlugs } from '../utils/shortlist';
import { trackAnalyticsEvent } from '../utils/analytics';
import { playTap, playTick } from '../utils/soundEngine';
import { showToast } from '../utils/toast';
import { EASE_APPLE, SPRING_SEGMENT, VIEWPORT_REVEAL } from '../utils/motion';

interface CaseStudyPageProps {
  project: CaseStudyProject;
  tocVariant: TocVariant;
  onNavigate: (path: string) => void;
}

const AUDIO_PLAYER_ANCHOR_ID = 'case-study-audio-player';

export function CaseStudyPage({
  project,
  tocVariant,
  onNavigate,
}: CaseStudyPageProps) {
  const [readingDepth, setReadingDepth] = useState<ReadingDepthMode>('full');
  const [activeChapter, setActiveChapter] = useState<string>('overview');
  const [narratingChapterId, setNarratingChapterId] = useState<string | null>(
    null,
  );
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [activeIterationIndex, setActiveIterationIndex] = useState<number>(
    project.exploration.iterations.length - 1,
  );
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const shortlistedSlugs = useShortlistSlugs();
  const isShortlisted = shortlistedSlugs.includes(project.slug);
  const coverDims =
    project.slug === 'stallsync' || project.slug === 'mycroharvest'
      ? { width: 1376, height: 768 }
      : { width: 1200, height: 896 };

  const chapters = useMemo(
    () => getCaseStudyChaptersForDepth(readingDepth),
    [readingDepth],
  );

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 32,
    restDelta: 0.001,
  });

  useEffect(() => {
    setActiveIterationIndex(project.exploration.iterations.length - 1);
    setActiveChapter('overview');
    setNarratingChapterId(null);
    setIsAudioPlaying(false);
  }, [project.slug, project.exploration.iterations.length]);

  // Keep activeChapter valid when switching between 2-Min Skim and Full Story
  useEffect(() => {
    if (!chapters.some((c) => c.id === activeChapter)) {
      setActiveChapter(chapters[0]?.id ?? 'overview');
    }
  }, [chapters, activeChapter]);

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) {
        setReadingProgress(0);
        return;
      }
      setReadingProgress(Math.min(1, Math.max(0, window.scrollY / maxScroll)));
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [project.slug, readingDepth]);

  useEffect(() => {
    const elements = chapters
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveChapter(visible[0].target.id);
        }
      },
      { rootMargin: '-18% 0px -65% 0px', threshold: 0.05 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [project.slug, chapters]);

  const narrationSegments = useMemo(
    () => buildCaseStudyNarrationSegments(project, readingDepth),
    [project, readingDepth],
  );

  // Build deduplicated Lightbox image collection from genuine project assets only
  const lightboxImages: LightboxImage[] = useMemo(() => {
    const items: LightboxImage[] = [
      {
        src: project.coverImage,
        alt: project.coverAlt,
        caption: project.coverCaption,
      },
    ];
    project.solution.gallery.forEach((g) => {
      if (!items.some((existing) => existing.src === g.src)) {
        items.push({ src: g.src, alt: g.alt, caption: g.caption });
      }
    });
    return items;
  }, [project]);

  const metrics = useMemo(() => getCaseStudyMetrics(project), [project]);
  const skimMinutes = useMemo(() => estimateSkimReadMinutes(project), [project]);

  const relatedRecommendations = useMemo(
    () => getRelatedProjects(PROJECTS, project.slug, 2),
    [project.slug],
  );
  const adjacent = getAdjacentProjects(PROJECTS, project.slug);
  const activeIteration =
    project.exploration.iterations[activeIterationIndex] ??
    project.exploration.iterations[0];
  const finalIteration =
    project.exploration.iterations[project.exploration.iterations.length - 1] ??
    project.exploration.iterations[0];

  const handleLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    path: string,
  ) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    onNavigate(path);
  };

  const scrollToChapter = useCallback((id: string) => {
    setActiveChapter(id);
    scrollToElementById(id);
  }, []);

  const handleDepthChange = (nextDepth: ReadingDepthMode) => {
    if (readingDepth === nextDepth) return;
    playTick();
    setReadingDepth(nextDepth);
    showToast({
      message:
        nextDepth === 'skim'
          ? 'Switched to 2-Min Skim'
          : 'Switched to Full Story',
      tone: 'info',
    });
  };

  const usesSidebarColumn =
    tocVariant === 'notch-rail' ||
    tocVariant === 'macos-sidebar' ||
    tocVariant === 'tactile-scrubber';

  const chapterScrollMarginClass =
    tocVariant === 'apple-local-nav'
      ? 'scroll-mt-[var(--scroll-offset-header-subnav)]'
      : 'scroll-mt-[var(--scroll-offset-header)]';

  const isSkim = readingDepth === 'skim';

  const getLightboxIndexForSrc = (src: string): number => {
    const idx = lightboxImages.findIndex((item) => item.src === src);
    return idx >= 0 ? idx : 0;
  };

  return (
    <article className="bg-[var(--apple-bg)] pb-20 md:pb-0">
      {/* Subtle Apple Blue Reading Progress Bar (hidden when Apple Local Ribbon shows its own) */}
      {tocVariant !== 'apple-local-nav' && (
        <div
          aria-hidden="true"
          className="fixed left-0 right-0 top-[52px] z-30 h-[2px] bg-transparent print:hidden"
        >
          <motion.div
            style={{ scaleX: smoothProgress, transformOrigin: '0% 50%' }}
            className="h-full bg-[var(--apple-blue)]"
          />
        </div>
      )}

      {/* Project Introduction */}
      <header className="mx-auto max-w-[1160px] px-5 pb-14 pt-12 sm:px-8 sm:pb-16 sm:pt-16">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Breadcrumbs
            items={[
              { label: 'Work', href: '/' },
              { label: project.title },
            ]}
            onNavigate={onNavigate}
          />

          {/* Reading Depth (P2.2) + Reader Comfort Aa (P2.9) */}
          <div className="flex flex-wrap items-center gap-2.5 print:hidden">
            <div
              role="group"
              aria-label="Case study reading depth"
              className="apple-segmented !p-0.5"
            >
              {(
                [
                  { id: 'skim', label: '2-Min Skim' },
                  { id: 'full', label: 'Full Story' },
                ] as const
              ).map((opt) => {
                const active = readingDepth === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => handleDepthChange(opt.id)}
                    className={`apple-segmented-item !min-h-[40px] px-3.5 py-1 text-[12.5px] sm:!min-h-[30px] ${
                      active
                        ? 'text-[var(--apple-label-primary)]'
                        : 'text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId={`reading-depth-pill-${project.slug}`}
                        transition={SPRING_SEGMENT}
                        className="apple-pill-shadow absolute inset-0 rounded-full bg-[var(--apple-control-thumb)]"
                      />
                    )}
                    <span className="relative z-10">{opt.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                playTick();
                const added = toggleShortlistSlug(project.slug);
                trackAnalyticsEvent(
                  added ? 'shortlist_added' : 'shortlist_removed',
                  window.location.pathname,
                  { slug: project.slug },
                );
                showToast({
                  message: added
                    ? `Added ${project.title} to shortlist`
                    : `Removed ${project.title} from shortlist`,
                  tone: added ? 'success' : 'info',
                });
              }}
              aria-pressed={isShortlisted}
              aria-label={
                isShortlisted
                  ? `Remove ${project.title} from recruiter shortlist`
                  : `Add ${project.title} to recruiter shortlist`
              }
              className={`type-caption inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3.5 py-1 font-medium transition-all duration-150 active:scale-95 sm:min-h-[36px] ${
                isShortlisted
                  ? 'bg-[var(--apple-blue-fill)] text-white'
                  : 'apple-surface-subtle text-[var(--apple-label-primary)] hover:opacity-90'
              }`}
            >
              {isShortlisted ? (
                <SFBookmarkFill size={12} />
              ) : (
                <SFBookmark size={12} className="text-[var(--apple-label-secondary)]" />
              )}
              <span>{isShortlisted ? 'Shortlisted' : 'Shortlist'}</span>
            </button>

            <ReaderComfortPopover align="right" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_APPLE }}
          className="mt-8"
        >
          <div className="type-eyebrow flex flex-wrap items-center gap-x-2 text-[var(--apple-label-secondary)]">
            <span className="text-[var(--apple-link)]">{project.category}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{project.year}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {isSkim ? skimMinutes : metrics.readMinutes} min{' '}
              {isSkim ? 'skim' : 'read'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {chapters.length} {isSkim ? 'sections' : 'chapters'}
            </span>
          </div>

          <h1 className="type-display measure-title mt-3">
            {project.title}
          </h1>

          <p className="type-lead measure-lead mt-5">
            {project.tagline}
          </p>
        </motion.div>

        {/* Clean Metadata Strip */}
        <dl className="mt-10 grid grid-cols-2 gap-6 border-y border-[var(--apple-separator)] py-6 sm:grid-cols-5">
          <div>
            <dt className="type-caption text-[var(--apple-label-tertiary)]">Role</dt>
            <dd className="mt-1.5 text-[15px] font-medium tracking-[-0.014em] text-[var(--apple-label-primary)]">
              {project.role}
            </dd>
          </div>
          <div>
            <dt className="type-caption text-[var(--apple-label-tertiary)]">Timeline</dt>
            <dd className="mt-1.5 text-[15px] font-medium tracking-[-0.014em] text-[var(--apple-label-primary)]">
              {project.timeline}
            </dd>
          </div>
          <div>
            <dt className="type-caption text-[var(--apple-label-tertiary)]">Platform</dt>
            <dd className="mt-1.5 text-[15px] font-medium tracking-[-0.014em] text-[var(--apple-label-primary)]">
              {project.platform}
            </dd>
          </div>
          <div>
            <dt className="type-caption text-[var(--apple-label-tertiary)]">Discipline</dt>
            <dd className="mt-1.5 text-[15px] font-medium tracking-[-0.014em] text-[var(--apple-label-primary)]">
              {project.category}
            </dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="type-caption text-[var(--apple-label-tertiary)]">Included Artifacts</dt>
            <dd className="mt-1.5 text-[15px] font-medium tabular-nums tracking-[-0.014em] text-[var(--apple-label-primary)]">
              {metrics.totalArtifactsCount}{' '}
              {metrics.totalArtifactsCount === 1 ? 'artifact' : 'artifacts'}
              <span className="block text-[12.5px] font-normal text-[var(--apple-label-tertiary)]">
                {metrics.visualPlatesCount}{' '}
                {metrics.visualPlatesCount === 1 ? 'visual plate' : 'visual plates'}
                {metrics.interactivePrototypesCount > 0
                  ? ` · ${metrics.interactivePrototypesCount} prototype`
                  : ''}
              </span>
            </dd>
          </div>
        </dl>

        {/* Genuine Client, Collaborators & Tools Metadata (hidden when fields are absent — P1.9) */}
        <ProjectCreditsSection credits={project.credits} />

        {/* Reusable Apple HIG AudioPlayer synchronized with Reading Depth (P2.2, P2.5) */}
        <AudioPlayer
          anchorId={AUDIO_PLAYER_ANCHOR_ID}
          title={project.title}
          segments={narrationSegments}
          idleLabel={isSkim ? 'Listen to 2-min skim' : 'Listen to case study'}
          onActiveSectionChange={setNarratingChapterId}
          onJumpToSection={scrollToChapter}
          onPlaybackChange={setIsAudioPlaying}
        />

        {/* Elevated Cover Visual */}
        <motion.figure
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.56, delay: 0.08, ease: EASE_APPLE }}
          className="mt-10"
        >
          <button
            type="button"
            onClick={() => {
              playTap();
              setLightboxIndex(0);
            }}
            aria-label={`Inspect ${project.title} cover image full screen`}
            className="apple-card group relative block w-full overflow-hidden rounded-[28px] bg-[var(--apple-bg-secondary)] text-left"
          >
            <div className="aspect-[16/9] w-full overflow-hidden">
              <img
                src={project.coverImage}
                alt={project.coverAlt}
                width={coverDims.width}
                height={coverDims.height}
                decoding="async"
                fetchPriority="high"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
              />
            </div>
            <span className="apple-pill-shadow absolute bottom-5 right-5 inline-flex items-center gap-1.5 rounded-full bg-[var(--apple-surface-elevated)] px-4 py-2 text-[13px] font-medium text-[var(--apple-label-primary)] transition-transform duration-200 group-hover:scale-[1.03] print:hidden">
              <SFExpand size={14} className="text-[var(--apple-blue)]" />
              <span>Inspect full size</span>
            </span>
          </button>
          <figcaption className="type-footnote measure-prose mt-3.5 font-normal text-[var(--apple-label-tertiary)]">
            {project.coverCaption}
          </figcaption>
        </motion.figure>
      </header>

      {/* Full-width Sticky Local Ribbon when selected in TOC Lab */}
      {tocVariant === 'apple-local-nav' && (
        <div className="print:hidden" data-focus-chrome="true">
          <TableOfContents
            variant="apple-local-nav"
            chapters={chapters}
            activeChapter={activeChapter}
            readingProgress={readingProgress}
            narratingChapterId={narratingChapterId}
            onSelectChapter={scrollToChapter}
            layoutNamespace={`case-${project.slug}-${readingDepth}`}
          />
        </div>
      )}

      {/* Editorial Narrative & Adaptive Apple Table of Contents */}
      <div className="mx-auto max-w-[1160px] px-5 pb-32 pt-4 sm:px-8">
        {tocVariant === 'ios-capsule' && (
          <div className="mb-8 print:hidden" data-focus-chrome="true">
            <TableOfContents
              variant="ios-capsule"
              chapters={chapters}
              activeChapter={activeChapter}
              readingProgress={readingProgress}
              narratingChapterId={narratingChapterId}
              onSelectChapter={scrollToChapter}
              layoutNamespace={`case-${project.slug}-${readingDepth}`}
            />
          </div>
        )}

        <div
          className={
            usesSidebarColumn
              ? 'grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16'
              : 'mx-auto max-w-[820px]'
          }
        >
          {/* Dynamic Apple Table of Contents Sidebar (public — zero internal lab links) */}
          {usesSidebarColumn && (
            <aside
              data-focus-chrome="true"
              className="hidden lg:col-span-3 lg:block print:hidden"
            >
              <div className="sticky top-24">
                <TableOfContents
                  variant={tocVariant}
                  chapters={chapters}
                  activeChapter={activeChapter}
                  readingProgress={readingProgress}
                  narratingChapterId={narratingChapterId}
                  onSelectChapter={scrollToChapter}
                  layoutNamespace={`case-${project.slug}-${readingDepth}`}
                />
              </div>
            </aside>
          )}

          {/* Main Story Flow — Disciplined Editorial Rhythm & ~60ch Measure */}
          <div
            className={
              usesSidebarColumn
                ? 'space-y-24 lg:col-span-9'
                : 'space-y-24'
            }
          >
            {/* 01. At-a-Glance Overview (Shared across Skim & Full Story) */}
            <section
              id="overview"
              className={`narrating-section ${chapterScrollMarginClass} ${
                narratingChapterId === 'overview' ? 'narrating-section-active' : ''
              }`}
            >
              <div className="rounded-[28px] bg-[var(--apple-bg-secondary)] p-7 sm:p-10">
                <div className="flex flex-wrap items-center gap-2.5">
                  <p className="type-caption text-[var(--apple-link)]">
                    01 · At a glance
                  </p>
                  {narratingChapterId === 'overview' && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--apple-blue)]/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-[-0.01em] text-[var(--apple-link)] transition-opacity duration-300">
                      <MiniAudioEqualizer active={isAudioPlaying} />
                      <span>Listening</span>
                    </span>
                  )}
                </div>
                <p className="font-display measure-lead mt-3.5 text-[20px] font-medium leading-[1.44] tracking-[-0.02em] text-[var(--apple-label-primary)] sm:text-[22px]">
                  {project.overview.tldr}
                </p>
                <p className="type-body measure-prose mt-4">
                  {project.overview.context}
                </p>

                <div className="mt-9 grid grid-cols-1 gap-7 border-t border-[var(--apple-separator)] pt-7 sm:grid-cols-2">
                  <div>
                    <p className="type-caption text-[var(--apple-label-tertiary)]">
                      Key Deliverables
                    </p>
                    <ul className="mt-3 space-y-2 text-[15px] leading-[1.48] tracking-[-0.011em] text-[var(--apple-label-primary)]">
                      {project.overview.deliverables.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="type-caption text-[var(--apple-label-tertiary)]">
                      Focus Areas
                    </p>
                    <ul className="mt-3 space-y-2 text-[15px] leading-[1.48] tracking-[-0.011em] text-[var(--apple-label-primary)]">
                      {project.overview.focusAreas.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 02. The Challenge / Problem & Context */}
            <motion.section
              id="challenge"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT_REVEAL}
              transition={{ duration: 0.5, ease: EASE_APPLE }}
              className={`narrating-section ${chapterScrollMarginClass} ${
                narratingChapterId === 'challenge' ? 'narrating-section-active' : ''
              }`}
            >
              <div className="flex flex-wrap items-center gap-2.5">
                <p
                  className={`type-eyebrow transition-colors duration-300 ${
                    narratingChapterId === 'challenge'
                      ? 'text-[var(--apple-link)]'
                      : 'text-[var(--apple-label-tertiary)]'
                  }`}
                >
                  02 · {isSkim ? 'Problem & Context' : 'The Challenge'}
                </p>
                {narratingChapterId === 'challenge' && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--apple-blue)]/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-[-0.01em] text-[var(--apple-link)]">
                    <MiniAudioEqualizer active={isAudioPlaying} />
                    <span>Listening</span>
                  </span>
                )}
              </div>
              <h2 className="type-title-2 measure-title mt-2.5">
                {project.challenge.heading}
              </h2>

              <div className="prose-stack type-body measure-prose mt-6">
                {(isSkim
                  ? project.challenge.paragraphs.slice(0, 1)
                  : project.challenge.paragraphs
                ).map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>

              <div className="mt-9 rounded-[24px] bg-[var(--apple-bg-secondary)] px-7 py-6 sm:px-8 sm:py-7">
                <p className="font-display measure-lead text-[19px] font-medium leading-[1.48] tracking-[-0.02em] text-[var(--apple-label-primary)] sm:text-[20px]">
                  “{project.challenge.highlightStatement}”
                </p>
              </div>
            </motion.section>

            {/* 03. Understanding the Problem (Full Story only) */}
            {!isSkim && (
              <motion.section
                id="understanding"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT_REVEAL}
                transition={{ duration: 0.5, ease: EASE_APPLE }}
                className={`narrating-section narrating-section-divided ${chapterScrollMarginClass} border-t border-[var(--apple-separator)] pt-16 ${
                  narratingChapterId === 'understanding'
                    ? 'narrating-section-active'
                    : ''
                }`}
              >
                <div className="flex flex-wrap items-center gap-2.5">
                  <p
                    className={`type-eyebrow transition-colors duration-300 ${
                      narratingChapterId === 'understanding'
                        ? 'text-[var(--apple-link)]'
                        : 'text-[var(--apple-label-tertiary)]'
                    }`}
                  >
                    03 · Understanding the Problem
                  </p>
                  {narratingChapterId === 'understanding' && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--apple-blue)]/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-[-0.01em] text-[var(--apple-link)]">
                      <MiniAudioEqualizer active={isAudioPlaying} />
                      <span>Listening</span>
                    </span>
                  )}
                </div>
                <h2 className="type-title-2 measure-title mt-2.5">
                  {project.understanding.heading}
                </h2>
                <p className="type-body measure-prose mt-5">
                  {project.understanding.intro}
                </p>

                <div className="mt-9 grid grid-cols-1 gap-5 md:grid-cols-3">
                  {project.understanding.insights.map((insight, idx) => (
                    <div
                      key={insight.title}
                      className="rounded-[24px] bg-[var(--apple-bg-secondary)] p-6 sm:p-7"
                    >
                      <span className="type-caption tabular-nums text-[var(--apple-link)]">
                        Insight 0{idx + 1}
                      </span>
                      <h3 className="type-headline mt-3 text-[18px] leading-[1.28]">
                        {insight.title}
                      </h3>
                      <p className="type-callout mt-2.5">{insight.detail}</p>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* 04. Design Approach (Full Story only) */}
            {!isSkim && (
              <motion.section
                id="approach"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT_REVEAL}
                transition={{ duration: 0.5, ease: EASE_APPLE }}
                className={`narrating-section narrating-section-divided ${chapterScrollMarginClass} border-t border-[var(--apple-separator)] pt-16 ${
                  narratingChapterId === 'approach'
                    ? 'narrating-section-active'
                    : ''
                }`}
              >
                <div className="flex flex-wrap items-center gap-2.5">
                  <p
                    className={`type-eyebrow transition-colors duration-300 ${
                      narratingChapterId === 'approach'
                        ? 'text-[var(--apple-link)]'
                        : 'text-[var(--apple-label-tertiary)]'
                    }`}
                  >
                    04 · Design Approach
                  </p>
                  {narratingChapterId === 'approach' && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--apple-blue)]/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-[-0.01em] text-[var(--apple-link)]">
                      <MiniAudioEqualizer active={isAudioPlaying} />
                      <span>Listening</span>
                    </span>
                  )}
                </div>
                <h2 className="type-title-2 measure-title mt-2.5">
                  {project.approach.heading}
                </h2>

                <div className="prose-stack type-body measure-prose mt-6">
                  {project.approach.paragraphs.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>

                <div className="mt-9 divide-y divide-[var(--apple-separator)] border-y border-[var(--apple-separator)]">
                  {project.approach.principles.map((principle, idx) => (
                    <div
                      key={principle.title}
                      className="grid grid-cols-1 gap-2.5 py-6 sm:grid-cols-12 sm:gap-8"
                    >
                      <div className="flex items-baseline gap-3 sm:col-span-5">
                        <span className="type-caption tabular-nums text-[var(--apple-label-tertiary)]">
                          0{idx + 1}
                        </span>
                        <h3 className="type-headline">{principle.title}</h3>
                      </div>
                      <p className="type-callout measure-prose sm:col-span-7">
                        {principle.description}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* 05 (Full) / 03 (Skim): Key Decisions & Exploration */}
            <motion.section
              id="exploration"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT_REVEAL}
              transition={{ duration: 0.5, ease: EASE_APPLE }}
              className={`narrating-section narrating-section-divided ${chapterScrollMarginClass} border-t border-[var(--apple-separator)] pt-16 ${
                narratingChapterId === 'exploration'
                  ? 'narrating-section-active'
                  : ''
              }`}
            >
              {isSkim ? (
                <>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <p
                      className={`type-eyebrow transition-colors duration-300 ${
                        narratingChapterId === 'exploration'
                          ? 'text-[var(--apple-link)]'
                          : 'text-[var(--apple-label-tertiary)]'
                      }`}
                    >
                      03 · Key Design Decisions
                    </p>
                    {narratingChapterId === 'exploration' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--apple-blue)]/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-[-0.01em] text-[var(--apple-link)]">
                        <MiniAudioEqualizer active={isAudioPlaying} />
                        <span>Listening</span>
                      </span>
                    )}
                  </div>
                  <h2 className="type-title-2 measure-title mt-2.5">
                    {project.exploration.heading}
                  </h2>

                  <div className="mt-8 divide-y divide-[var(--apple-separator)] border-y border-[var(--apple-separator)]">
                    {project.approach.principles.map((principle, idx) => (
                      <div
                        key={principle.title}
                        className="grid grid-cols-1 gap-2 py-5 sm:grid-cols-12 sm:gap-8"
                      >
                        <div className="flex items-baseline gap-3 sm:col-span-5">
                          <span className="type-caption tabular-nums text-[var(--apple-link)]">
                            0{idx + 1}
                          </span>
                          <h3 className="type-headline">{principle.title}</h3>
                        </div>
                        <p className="type-callout measure-prose sm:col-span-7">
                          {principle.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  {finalIteration && (
                    <div className="mt-7 rounded-[24px] bg-[var(--apple-bg-secondary)] p-6 sm:p-7">
                      <p className="type-caption text-[var(--apple-link)]">
                        Selected Direction · {finalIteration.label} ({finalIteration.stage})
                      </p>
                      <p className="type-callout measure-prose mt-2.5 text-[var(--apple-label-primary)]">
                        {finalIteration.decision}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <p
                      className={`type-eyebrow transition-colors duration-300 ${
                        narratingChapterId === 'exploration'
                          ? 'text-[var(--apple-link)]'
                          : 'text-[var(--apple-label-tertiary)]'
                      }`}
                    >
                      05 · Exploration &amp; Iteration ·{' '}
                      <span className="tabular-nums">
                        {metrics.iterationStagesCount} stages
                      </span>
                    </p>
                    {narratingChapterId === 'exploration' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--apple-blue)]/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-[-0.01em] text-[var(--apple-link)]">
                        <MiniAudioEqualizer active={isAudioPlaying} />
                        <span>Listening</span>
                      </span>
                    )}
                  </div>
                  <h2 className="type-title-2 measure-title mt-2.5">
                    {project.exploration.heading}
                  </h2>
                  <p className="type-body measure-prose mt-5">
                    {project.exploration.intro}
                  </p>

                  {/* Rounded iOS Iteration Switcher */}
                  <div className="mt-9 rounded-[28px] bg-[var(--apple-bg-secondary)] p-6 sm:p-8">
                    <div
                      role="tablist"
                      aria-label="Design exploration iterations"
                      className="apple-segmented"
                    >
                      {project.exploration.iterations.map((iter, idx) => {
                        const selected = idx === activeIterationIndex;
                        const total = project.exploration.iterations.length;
                        return (
                          <button
                            key={iter.label}
                            id={`iteration-tab-${project.slug}-${idx}`}
                            type="button"
                            role="tab"
                            aria-selected={selected}
                            aria-controls={`iteration-panel-${project.slug}`}
                            tabIndex={selected ? 0 : -1}
                            onClick={() => {
                              if (activeIterationIndex !== idx) {
                                playTick();
                                setActiveIterationIndex(idx);
                              }
                            }}
                            onKeyDown={(event) => {
                              if (event.key === 'ArrowRight') {
                                event.preventDefault();
                                const next = (idx + 1) % total;
                                playTick();
                                setActiveIterationIndex(next);
                                document
                                  .getElementById(`iteration-tab-${project.slug}-${next}`)
                                  ?.focus();
                              } else if (event.key === 'ArrowLeft') {
                                event.preventDefault();
                                const prev = (idx - 1 + total) % total;
                                playTick();
                                setActiveIterationIndex(prev);
                                document
                                  .getElementById(`iteration-tab-${project.slug}-${prev}`)
                                  ?.focus();
                              }
                            }}
                            className={`apple-segmented-item px-4 py-1.5 text-[13px] ${
                              selected
                                ? 'text-[var(--apple-label-primary)]'
                                : 'text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                            }`}
                          >
                            {selected && (
                              <motion.span
                                layoutId={`iteration-pill-${project.slug}`}
                                transition={SPRING_SEGMENT}
                                className="apple-pill-shadow absolute inset-0 rounded-full bg-[var(--apple-control-thumb)]"
                              />
                            )}
                            <span className="relative z-10">
                              {iter.label}: {iter.stage}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div
                      id={`iteration-panel-${project.slug}`}
                      role="tabpanel"
                      aria-labelledby={`iteration-tab-${project.slug}-${activeIterationIndex}`}
                      className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2"
                    >
                      <div className="apple-surface-subtle rounded-[20px] p-6">
                        <p className="type-caption text-[var(--apple-label-tertiary)]">
                          What was explored
                        </p>
                        <p className="mt-2.5 text-[15.5px] leading-[1.56] tracking-[-0.012em] text-[var(--apple-label-primary)]">
                          {activeIteration.summary}
                        </p>
                      </div>
                      <div className="apple-surface-subtle rounded-[20px] p-6">
                        <p className="type-caption text-[var(--apple-link)]">
                          Design decision
                        </p>
                        <p className="type-callout mt-2.5">
                          {activeIteration.decision}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.section>

            {/* 06 (Full) / 04 (Skim): The Solution + Interactive Study + Genuine Inline Gallery */}
            <motion.section
              id="solution"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT_REVEAL}
              transition={{ duration: 0.5, ease: EASE_APPLE }}
              className={`narrating-section narrating-section-divided ${chapterScrollMarginClass} border-t border-[var(--apple-separator)] pt-16 ${
                narratingChapterId === 'solution'
                  ? 'narrating-section-active'
                  : ''
              }`}
            >
              <div className="flex flex-wrap items-center gap-2.5">
                <p
                  className={`type-eyebrow transition-colors duration-300 ${
                    narratingChapterId === 'solution'
                      ? 'text-[var(--apple-link)]'
                      : 'text-[var(--apple-label-tertiary)]'
                  }`}
                >
                  {isSkim ? '04 · Prototype & Visuals' : '06 · The Solution'}
                </p>
                {narratingChapterId === 'solution' && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--apple-blue)]/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-[-0.01em] text-[var(--apple-link)]">
                    <MiniAudioEqualizer active={isAudioPlaying} />
                    <span>Listening</span>
                  </span>
                )}
              </div>
              <h2 className="type-title-2 measure-title mt-2.5">
                {project.solution.heading}
              </h2>
              <p className="type-body measure-prose mt-5">
                {project.solution.intro}
              </p>

              <div className="mt-9">
                <div className="mb-4">
                  <h3 className="type-title-3 text-[20px]">
                    {project.solution.prototypeTitle}
                  </h3>
                  <p className="type-callout measure-prose mt-1.5">
                    {project.solution.prototypeCaption}
                  </p>
                </div>
                <CaseStudyPrototype kind={project.prototypeKind} />
              </div>

              {/* System Architecture Diagram / Design Token Demo (StallSync, Precognition Labs, HubApps — P3.6) */}
              <CaseStudyDiagram kind={project.prototypeKind} />

              <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
                {project.solution.highlights.map((highlight) => (
                  <div
                    key={highlight.title}
                    className="rounded-[24px] bg-[var(--apple-bg-secondary)] p-6 sm:p-7"
                  >
                    <h3 className="type-headline text-[18px]">
                      {highlight.title}
                    </h3>
                    <p className="type-callout mt-2.5">{highlight.body}</p>
                  </div>
                ))}
              </div>

              {/* Inline Visual Gallery from genuine available project assets (P2.6) */}
              {project.solution.gallery.length > 0 && (
                <div className="mt-10">
                  <p className="type-caption mb-4 text-[var(--apple-label-tertiary)]">
                    Visual Study{' '}
                    {project.solution.gallery.length > 1
                      ? `· ${project.solution.gallery.length} plates`
                      : 'Plate'}
                  </p>
                  <div
                    className={
                      project.solution.gallery.length === 1
                        ? 'grid grid-cols-1 gap-5'
                        : 'grid grid-cols-1 gap-5 sm:grid-cols-2'
                    }
                  >
                    {project.solution.gallery.map((item) => {
                      const lbIdx = getLightboxIndexForSrc(item.src);
                      return (
                        <figure key={item.id}>
                          <button
                            type="button"
                            onClick={() => {
                              playTap();
                              setLightboxIndex(lbIdx);
                            }}
                            aria-label={`Inspect ${item.alt} full screen`}
                            className="apple-card group relative block w-full overflow-hidden rounded-[24px] bg-[var(--apple-bg-secondary)] text-left"
                          >
                            <div
                              className={
                                item.aspect === '16:9'
                                  ? 'aspect-[16/9] w-full overflow-hidden'
                                  : 'aspect-[4/3] w-full overflow-hidden'
                              }
                            >
                              <img
                                src={item.src}
                                alt={item.alt}
                                width={coverDims.width}
                                height={coverDims.height}
                                loading="lazy"
                                decoding="async"
                                referrerPolicy="no-referrer"
                                className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
                              />
                            </div>
                            <span className="apple-pill-shadow absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--apple-surface-elevated)] px-3.5 py-1.5 text-[12.5px] font-medium text-[var(--apple-label-primary)] print:hidden">
                              <SFExpand
                                size={13}
                                className="text-[var(--apple-blue)]"
                              />
                              <span>Zoom</span>
                            </span>
                          </button>
                          <figcaption className="type-footnote measure-prose mt-3 font-normal text-[var(--apple-label-tertiary)]">
                            {item.caption}
                          </figcaption>
                        </figure>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Before / After Comparator — rendered ONLY when genuine before/after assets exist (P2.7) */}
              {project.beforeAfter && (
                <div className="mt-10">
                  <p className="type-caption mb-4 text-[var(--apple-label-tertiary)]">
                    Before &amp; After Comparison
                  </p>
                  <BeforeAfterComparator
                    beforeSrc={project.beforeAfter.beforeSrc}
                    beforeAlt={project.beforeAfter.beforeAlt}
                    beforeLabel={project.beforeAfter.beforeLabel}
                    afterSrc={project.beforeAfter.afterSrc}
                    afterAlt={project.beforeAfter.afterAlt}
                    afterLabel={project.beforeAfter.afterLabel}
                    caption={project.beforeAfter.caption}
                  />
                </div>
              )}

              {/* In Skim Mode, offer clean one-click upgrade to Full Story */}
              {isSkim && (
                <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-[24px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-6 sm:flex-row sm:items-center print:hidden">
                  <div>
                    <p className="type-headline text-[16px]">
                      Want the complete research, iterations, and reflections?
                    </p>
                    <p className="type-footnote mt-1 font-normal text-[var(--apple-label-secondary)]">
                      Full Story includes all {metrics.chapterCount} chapters ({metrics.readMinutes} min read).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDepthChange('full')}
                    className="apple-btn-primary shrink-0"
                  >
                    Read Full Story
                  </button>
                </div>
              )}
            </motion.section>

            {/* 07. Reflections (Full Story only) */}
            {!isSkim && (
              <motion.section
                id="reflections"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT_REVEAL}
                transition={{ duration: 0.5, ease: EASE_APPLE }}
                className={`narrating-section narrating-section-divided ${chapterScrollMarginClass} border-t border-[var(--apple-separator)] pt-16 ${
                  narratingChapterId === 'reflections'
                    ? 'narrating-section-active'
                    : ''
                }`}
              >
                <div className="flex flex-wrap items-center gap-2.5">
                  <p
                    className={`type-eyebrow transition-colors duration-300 ${
                      narratingChapterId === 'reflections'
                        ? 'text-[var(--apple-link)]'
                        : 'text-[var(--apple-label-tertiary)]'
                    }`}
                  >
                    07 · Reflections &amp; Learnings
                  </p>
                  {narratingChapterId === 'reflections' && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--apple-blue)]/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-[-0.01em] text-[var(--apple-link)]">
                      <MiniAudioEqualizer active={isAudioPlaying} />
                      <span>Listening</span>
                    </span>
                  )}
                </div>
                <h2 className="type-title-2 measure-title mt-2.5">
                  {project.reflections.heading}
                </h2>
                <p className="type-body measure-prose mt-5">
                  {project.reflections.summary}
                </p>

                <div className="mt-9 rounded-[26px] bg-[var(--apple-bg-secondary)] p-7 sm:p-8">
                  <p className="type-headline text-[15px]">Key takeaways</p>
                  <ul className="measure-prose mt-4 space-y-3.5 text-[15.5px] leading-[1.58] tracking-[-0.011em] text-[var(--apple-label-secondary)]">
                    {project.reflections.learnings.map((learning) => (
                      <li key={learning} className="flex items-start gap-3">
                        <span
                          className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--apple-blue)]"
                          aria-hidden="true"
                        />
                        <span>{learning}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="type-callout measure-prose mt-7 border-t border-[var(--apple-separator)] pt-5">
                    <span className="font-semibold text-[var(--apple-label-primary)]">
                      Looking ahead:{' '}
                    </span>
                    {project.reflections.nextDirections}
                  </p>
                </div>
              </motion.section>
            )}
          </div>
        </div>

        {/* Project-scoped verified testimonials (hidden when none exist — P1.10) */}
        <TestimonialsSection
          entries={VERIFIED_TESTIMONIALS}
          projectSlug={project.slug}
          eyebrow="Project Recommendation"
          heading={`Perspectives on ${project.title}.`}
        />

        {/* Contextually Recommended Related Projects (P1.11) */}
        <div className="print:hidden">
          <RelatedProjectsSection
            recommendations={relatedRecommendations}
            onNavigate={onNavigate}
          />
        </div>

        {/* Previous / Next Project Navigation */}
        {adjacent && (
          <nav
            aria-label="Adjacent case studies"
            className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 print:hidden"
          >
            <a
              href={`/work/${adjacent.previous.slug}`}
              onClick={(e) =>
                handleLinkClick(e, `/work/${adjacent.previous.slug}`)
              }
              className="apple-card group flex flex-col justify-between rounded-[26px] p-7"
            >
              <span className="inline-flex items-center gap-1 text-[14px] font-medium text-[var(--apple-link)]">
                <SFChevronLeft
                  size={15}
                  className="transition-transform duration-200 group-hover:-translate-x-0.5"
                />
                <span>Previous project</span>
              </span>
              <div className="mt-4">
                <p className="type-title-3">{adjacent.previous.title}</p>
                <p className="type-footnote mt-1 font-normal text-[var(--apple-label-secondary)]">
                  {adjacent.previous.category} · {adjacent.previous.year}
                </p>
              </div>
            </a>

            <a
              href={`/work/${adjacent.next.slug}`}
              onClick={(e) =>
                handleLinkClick(e, `/work/${adjacent.next.slug}`)
              }
              className="apple-card group flex flex-col justify-between rounded-[26px] p-7 sm:text-right"
            >
              <span className="inline-flex items-center gap-1 text-[14px] font-medium text-[var(--apple-link)] sm:justify-end">
                <span>Next project</span>
                <SFChevronRight
                  size={15}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </span>
              <div className="mt-4">
                <p className="type-title-3">{adjacent.next.title}</p>
                <p className="type-footnote mt-1 font-normal text-[var(--apple-label-secondary)]">
                  {adjacent.next.category} · {adjacent.next.year}
                </p>
              </div>
            </a>
          </nav>
        )}
      </div>

      {/* Compact Mobile Bottom Reading Bar (<768px — P2.8) */}
      <MobileReadingBar
        chapters={chapters}
        activeChapter={activeChapter}
        readingProgress={readingProgress}
        isAudioPlaying={isAudioPlaying}
        narratingChapterId={narratingChapterId}
        onSelectChapter={scrollToChapter}
        onJumpToAudioPlayer={() => scrollToElementById(AUDIO_PLAYER_ANCHOR_ID)}
      />

      <Lightbox
        images={lightboxImages}
        activeIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onSelectIndex={setLightboxIndex}
      />
    </article>
  );
}
