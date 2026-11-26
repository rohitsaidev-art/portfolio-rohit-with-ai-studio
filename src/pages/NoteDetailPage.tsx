import { useCallback, useMemo, useState } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { JOURNAL_NOTES, type JournalArticle } from '../data/notes';
import { AudioPlayer } from '../components/AudioPlayer';
import { MiniAudioEqualizer } from '../components/AudioWaveform';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ReaderComfortPopover } from '../components/ReaderComfortPopover';
import { SFChevronLeft, SFChevronRight } from '../components/SFSymbols';
import { getNoteMetrics, getRelatedNotes } from '../utils/portfolio';
import type { NarrationSegment } from '../utils/readAloud';
import { scrollToElementById } from '../utils/scroll';
import { EASE_APPLE, VIEWPORT_REVEAL } from '../utils/motion';

interface NoteDetailPageProps {
  article: JournalArticle;
  onNavigate: (path: string) => void;
}

/**
 * Design Journal Article Detail Page (/notes/:slug) (P1.7, P1.13, P2.5, P2.9).
 * Features structured breadcrumbs, Reader Comfort controls, explicit Draft
 * labeling for unpublished seed essays, AudioPlayer narration sync, comfortable
 * editorial measure, and related article recommendations.
 */
export function NoteDetailPage({ article, onNavigate }: NoteDetailPageProps) {
  const [narratingSectionId, setNarratingSectionId] = useState<string | null>(
    null,
  );
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 32,
    restDelta: 0.001,
  });

  const metrics = useMemo(() => getNoteMetrics(article), [article]);
  const relatedNotes = useMemo(
    () => getRelatedNotes(JOURNAL_NOTES, article.slug, 2),
    [article.slug],
  );

  const narrationSegments: NarrationSegment[] = useMemo(
    () =>
      article.sections.map((section, index) => ({
        id: section.id,
        num: section.num,
        title: section.heading,
        text: `${index === 0 ? `${article.title}. ${article.subtitle}. ` : ''}${section.heading}. ${section.paragraphs.join(' ')}${section.callout ? ` ${section.callout}` : ''}`,
      })),
    [article],
  );

  const scrollToSection = useCallback((sectionId: string) => {
    scrollToElementById(sectionId);
  }, []);

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

  const isDraft = article.status === 'draft';

  return (
    <article className="bg-[var(--apple-bg)]">
      {/* Subtle Apple Blue Reading Progress Bar */}
      <div
        aria-hidden="true"
        className="fixed left-0 right-0 top-[52px] z-30 h-[2px] bg-transparent print:hidden"
      >
        <motion.div
          style={{ scaleX: smoothProgress, transformOrigin: '0% 50%' }}
          className="h-full bg-[var(--apple-blue)]"
        />
      </div>

      {/* Article Header */}
      <header className="mx-auto max-w-[820px] px-5 pb-12 pt-12 sm:px-8 sm:pb-14 sm:pt-16">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Breadcrumbs
            items={[
              { label: 'Notes', href: '/notes' },
              { label: article.title },
            ]}
            onNavigate={onNavigate}
          />
          <ReaderComfortPopover align="right" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, ease: EASE_APPLE }}
          className="mt-8"
        >
          <div className="type-eyebrow flex flex-wrap items-center gap-x-2 text-[var(--apple-label-secondary)]">
            {isDraft && (
              <>
                <span className="font-semibold text-[var(--apple-label-primary)]">
                  Draft
                </span>
                <span aria-hidden="true">·</span>
              </>
            )}
            <span className="text-[var(--apple-link)]">{article.topic}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{metrics.readMinutes} min read</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{metrics.sectionCount} sections</span>
          </div>

          <h1 className="type-display measure-title mt-3">
            {article.title}
          </h1>

          <p className="type-lead measure-lead mt-5">
            {article.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-[var(--apple-separator)] py-4">
            <p className="type-footnote font-normal text-[var(--apple-label-secondary)]">
              {article.tags.join(' · ')}
            </p>
            <p className="type-footnote font-normal text-[var(--apple-label-tertiary)]">
              {isDraft
                ? 'Unpublished working draft · Personal design note'
                : article.updatedLabel}
            </p>
          </div>
        </motion.div>

        {/* Reusable Apple HIG AudioPlayer integrated at top of article */}
        <AudioPlayer
          title={article.title}
          segments={narrationSegments}
          idleLabel={isDraft ? 'Listen to draft note' : 'Listen to article'}
          helperText="Drag the timeline or tap the waveform to jump straight to that section of the note."
          onActiveSectionChange={setNarratingSectionId}
          onJumpToSection={scrollToSection}
          onPlaybackChange={setIsAudioPlaying}
        />
      </header>

      {/* Comfortable Editorial Prose Body */}
      <div className="mx-auto max-w-[820px] px-5 pb-24 pt-2 sm:px-8 sm:pb-28">
        <div className="space-y-16">
          {article.sections.map((section) => {
            const isBeingNarrated = narratingSectionId === section.id;
            return (
              <motion.section
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT_REVEAL}
                transition={{ duration: 0.45, ease: EASE_APPLE }}
                className={`narrating-section scroll-mt-[var(--scroll-offset-header)] ${
                  isBeingNarrated ? 'narrating-section-active' : ''
                }`}
              >
                <div className="flex flex-wrap items-center gap-2.5">
                  <p
                    className={`type-caption tabular-nums transition-colors duration-300 ${
                      isBeingNarrated
                        ? 'text-[var(--apple-link)]'
                        : 'text-[var(--apple-label-tertiary)]'
                    }`}
                  >
                    {section.num}
                  </p>
                  {isBeingNarrated && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--apple-blue)]/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-[-0.01em] text-[var(--apple-link)]">
                      <MiniAudioEqualizer active={isAudioPlaying} />
                      <span>Listening</span>
                    </span>
                  )}
                </div>
                <h2 className="type-title-2 measure-title mt-2">
                  {section.heading}
                </h2>

                <div className="prose-stack type-body measure-prose mt-5">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>

                {section.callout && (
                  <div className="mt-8 rounded-[24px] bg-[var(--apple-bg-secondary)] px-7 py-6 sm:px-8 sm:py-7">
                    <p className="font-display measure-lead text-[19px] font-medium leading-[1.48] tracking-[-0.018em] text-[var(--apple-label-primary)] sm:text-[20px]">
                      “{section.callout}”
                    </p>
                  </div>
                )}
              </motion.section>
            );
          })}
        </div>

        {/* Related Articles */}
        {relatedNotes.length > 0 && (
          <section
            aria-labelledby="related-notes-heading"
            className="mt-24 border-t border-[var(--apple-separator)] pt-14"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="type-eyebrow text-[var(--apple-label-secondary)]">
                  Related Notes
                </p>
                <h2 id="related-notes-heading" className="type-title-3 mt-1.5">
                  Continue reading
                </h2>
              </div>

              <a
                href="/notes"
                onClick={(e) => handleLinkClick(e, '/notes')}
                className="apple-link group inline-flex items-center gap-1 text-[14.5px] font-medium text-[var(--apple-link)]"
              >
                <SFChevronLeft
                  size={14}
                  className="transition-transform duration-200 group-hover:-translate-x-0.5"
                />
                <span className="group-hover:underline">All notes</span>
              </a>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {relatedNotes.map((related) => {
                const relMetrics = getNoteMetrics(related);
                const relHref = `/notes/${related.slug}`;
                const relIsDraft = related.status === 'draft';
                return (
                  <a
                    key={related.slug}
                    href={relHref}
                    onClick={(e) => handleLinkClick(e, relHref)}
                    className="apple-card group flex flex-col justify-between rounded-[24px] p-6 sm:p-7"
                  >
                    <div>
                      <p className="type-caption flex flex-wrap items-center gap-x-2 text-[var(--apple-label-tertiary)]">
                        {relIsDraft && (
                          <>
                            <span className="font-semibold text-[var(--apple-label-primary)]">
                              Draft
                            </span>
                            <span aria-hidden="true">·</span>
                          </>
                        )}
                        <span className="text-[var(--apple-link)]">
                          {related.topic}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          {relMetrics.readMinutes} min read
                        </span>
                      </p>

                      <h3 className="type-title-3 mt-2.5 text-[20px] transition-colors duration-200 group-hover:text-[var(--apple-link)]">
                        {related.title}
                      </h3>

                      <p className="type-callout mt-2 line-clamp-2">
                        {related.excerpt}
                      </p>
                    </div>

                    <div className="mt-5 inline-flex items-center gap-1 text-[14px] font-medium text-[var(--apple-link)]">
                      <span className="group-hover:underline">
                        {relIsDraft ? 'Read draft' : 'Read note'}
                      </span>
                      <SFChevronRight
                        size={14}
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
