import { useState } from 'react';
import { motion } from 'motion/react';
import {
  JOURNAL_NOTES,
  NOTE_TOPICS,
  type NoteTopic,
} from '../data/notes';
import { SFChevronRight } from '../components/SFSymbols';
import {
  filterNotesByTopic,
  getNoteMetrics,
  getNoteTopicCounts,
} from '../utils/portfolio';
import { EASE_APPLE, SPRING_SEGMENT } from '../utils/motion';
import { playTick } from '../utils/soundEngine';

interface NotesPageProps {
  onNavigate: (path: string) => void;
}

type TopicFilter = 'all' | NoteTopic;

export function NotesPage({ onNavigate }: NotesPageProps) {
  const [activeTopic, setActiveTopic] = useState<TopicFilter>('all');

  const topicCounts = getNoteTopicCounts(JOURNAL_NOTES, NOTE_TOPICS);
  const visibleNotes = filterNotesByTopic(JOURNAL_NOTES, activeTopic);

  const filterOptions: { id: TopicFilter; label: string }[] = [
    { id: 'all', label: 'All Notes' },
    ...NOTE_TOPICS.map((topic) => ({ id: topic, label: topic })),
  ];

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

  return (
    <div className="bg-[var(--apple-bg)]">
      {/* Editorial Journal Header */}
      <section className="mx-auto max-w-[1160px] px-5 pb-14 pt-20 sm:px-8 sm:pb-16 sm:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, ease: EASE_APPLE }}
          className="max-w-[780px]"
        >
          <p className="type-eyebrow text-[var(--apple-label-secondary)]">
            Design Journal ·{' '}
            <span className="tabular-nums">
              {JOURNAL_NOTES.length} {JOURNAL_NOTES.length === 1 ? 'Note' : 'Notes'}
            </span>
          </p>
          <h1 className="type-display measure-title mt-3">
            Notes on product clarity, interaction craft, and systems.
          </h1>
          <p className="type-lead measure-lead mt-5">
            Working essays and field notes written between product engagements. Unpublished seed essays are clearly marked Draft while ideas are being refined.
          </p>
        </motion.div>

        {/* Topic Filter Controls + Accurate Live Count */}
        <div className="mt-10 flex flex-col gap-4 border-t border-[var(--apple-separator)] pt-8 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="group"
            aria-label="Filter notes by topic"
            className="apple-segmented max-w-full overflow-x-auto"
          >
            {filterOptions.map((option) => {
              const isSelected = activeTopic === option.id;
              const count = topicCounts[option.id] ?? 0;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    if (activeTopic !== option.id) {
                      playTick();
                      setActiveTopic(option.id);
                    }
                  }}
                  className={`apple-segmented-item px-3.5 py-1.5 text-[13px] sm:px-4 sm:text-[13.5px] ${
                    isSelected
                      ? 'text-[var(--apple-label-primary)]'
                      : 'text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                  }`}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="notes-topic-filter-thumb"
                      transition={SPRING_SEGMENT}
                      className="apple-pill-shadow absolute inset-0 rounded-full bg-[var(--apple-control-thumb)]"
                    />
                  )}
                  <span className="relative z-10 inline-flex items-center gap-1.5">
                    <span>{option.label}</span>
                    <span
                      className={`tabular-nums text-[11.5px] ${
                        isSelected
                          ? 'text-[var(--apple-label-secondary)]'
                          : 'text-[var(--apple-label-tertiary)]'
                      }`}
                    >
                      {count}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <p
            aria-live="polite"
            className="type-footnote shrink-0 tabular-nums font-normal text-[var(--apple-label-tertiary)]"
          >
            {activeTopic === 'all'
              ? `Showing all ${JOURNAL_NOTES.length} notes`
              : `Showing ${visibleNotes.length} of ${JOURNAL_NOTES.length} notes in ${activeTopic}`}
          </p>
        </div>
      </section>

      {/* Editorial Article Index */}
      <section
        aria-label="Design journal articles"
        className="bg-[var(--apple-bg-secondary)] py-16 sm:py-24"
      >
        <div className="mx-auto max-w-[1160px] px-5 sm:px-8">
          {visibleNotes.length === 0 ? (
            <div className="apple-surface-subtle rounded-[28px] px-7 py-14 text-center sm:px-12">
              <h2 className="type-title-3">No notes in this topic yet.</h2>
              <p className="type-callout mx-auto mt-2.5 max-w-[46ch]">
                Reset the topic filter to browse all current working drafts.
              </p>
              <button
                type="button"
                onClick={() => {
                  playTick();
                  setActiveTopic('all');
                }}
                className="apple-btn-primary mt-6"
              >
                Show all notes
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[var(--apple-separator)] border-y border-[var(--apple-separator)]">
              {visibleNotes.map((note, idx) => {
                const metrics = getNoteMetrics(note);
                const href = `/notes/${note.slug}`;
                const isDraft = note.status === 'draft';
                return (
                  <motion.article
                    key={note.slug}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: Math.min(idx * 0.04, 0.16),
                      ease: EASE_APPLE,
                    }}
                  >
                    <a
                      href={href}
                      onClick={(e) => handleLinkClick(e, href)}
                      className="group grid grid-cols-1 gap-4 py-9 transition-colors sm:py-11 lg:grid-cols-12 lg:gap-10"
                    >
                      {/* Left meta rail */}
                      <div className="lg:col-span-4">
                        <div className="type-caption flex flex-wrap items-center gap-x-2 text-[var(--apple-label-secondary)]">
                          {isDraft && (
                            <>
                              <span className="font-semibold text-[var(--apple-label-primary)]">
                                Draft
                              </span>
                              <span aria-hidden="true">·</span>
                            </>
                          )}
                          <span className="text-[var(--apple-link)]">
                            {note.topic}
                          </span>
                        </div>
                        <p className="type-footnote mt-2 tabular-nums font-normal text-[var(--apple-label-tertiary)]">
                          {metrics.readMinutes} min read · {metrics.sectionCount} sections
                        </p>
                      </div>

                      {/* Right editorial summary */}
                      <div className="lg:col-span-8">
                        <h2 className="type-title-2 measure-title transition-colors duration-200 group-hover:text-[var(--apple-link)]">
                          {note.title}
                        </h2>
                        <p className="type-body measure-prose mt-3 text-[var(--apple-label-secondary)]">
                          {note.excerpt}
                        </p>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                          <p className="type-footnote font-normal text-[var(--apple-label-tertiary)]">
                            {note.tags.join(' · ')}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[14.5px] font-medium tracking-[-0.012em] text-[var(--apple-link)]">
                            <span className="group-hover:underline">
                              {isDraft ? 'Read draft' : 'Read note'}
                            </span>
                            <SFChevronRight
                              size={14}
                              className="transition-transform duration-200 group-hover:translate-x-0.5"
                            />
                          </span>
                        </div>
                      </div>
                    </a>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
