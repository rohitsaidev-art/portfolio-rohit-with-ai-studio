import { motion } from 'motion/react';
import { PROJECTS } from '../data/projects';
import {
  ABOUT_CONTENT,
  CAPABILITIES,
  COLLABORATION_CONTEXTS,
  SITE_CONFIG,
} from '../data/site';
import { LocalTimeClock } from '../components/LocalTimeClock';
import { SFChevronRight, SFPrinter } from '../components/SFSymbols';
import { EASE_APPLE, VIEWPORT_REVEAL } from '../utils/motion';
import { playTick } from '../utils/soundEngine';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  // Derive strictly factual practice timeline directly from real portfolio records (zero fabricated employers/dates)
  const timelineByYear = Array.from(
    PROJECTS.reduce((acc, project) => {
      const group = acc.get(project.year) ?? [];
      group.push(project);
      acc.set(project.year, group);
      return acc;
    }, new Map<string, typeof PROJECTS>()),
  ).sort(([yearA], [yearB]) => Number(yearB) - Number(yearA));

  const handlePrintResume = () => {
    playTick();
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
  };

  return (
    <div className="bg-[var(--apple-bg)]">
      {/* Print-only Resume Header (P2.10) */}
      <div className="hidden border-b border-[var(--apple-separator)] pb-5 print:block">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="font-display text-[22pt] font-semibold tracking-tight text-[#111111]">
              {SITE_CONFIG.name}
            </p>
            <p className="mt-1 text-[11pt] text-[#3a3a3c]">
              {SITE_CONFIG.roleTitle} · {SITE_CONFIG.location}
            </p>
          </div>
          <div className="text-right text-[9.5pt] text-[#3a3a3c]">
            <p>{SITE_CONFIG.email}</p>
            <p>{SITE_CONFIG.availabilityShort}</p>
          </div>
        </div>
      </div>

      {/* Intro */}
      <section className="mx-auto max-w-[1160px] px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24 print:px-0 print:pb-6 print:pt-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.44, ease: EASE_APPLE }}
            className="type-eyebrow text-[var(--apple-link)]"
          >
            {ABOUT_CONTENT.eyebrow}
          </motion.p>

          <button
            type="button"
            onClick={handlePrintResume}
            className="apple-btn-tonal !min-h-[44px] !px-4 !py-1.5 !text-[13px] sm:!min-h-[36px] print:hidden"
          >
            <SFPrinter size={14} className="text-[var(--apple-link)]" />
            <span>Print Resume</span>
          </button>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.54, delay: 0.05, ease: EASE_APPLE }}
          className="type-title-1 measure-title mt-3"
        >
          {ABOUT_CONTENT.headline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.54, delay: 0.1, ease: EASE_APPLE }}
          className="type-lead measure-lead mt-6"
        >
          {ABOUT_CONTENT.lead}
        </motion.p>

        {/* Live Hyderabad Local Time (IST) */}
        <div className="mt-7 print:hidden">
          <LocalTimeClock variant="inline" />
        </div>
      </section>

      {/* Editorial Story */}
      <section className="bg-[var(--apple-bg-secondary)] py-20 sm:py-28 print:bg-white print:py-6">
        <div className="mx-auto grid max-w-[1160px] grid-cols-1 gap-8 px-5 sm:px-8 lg:grid-cols-12 lg:gap-12 print:px-0">
          <div className="lg:col-span-4">
            <h2 className="type-title-3">Background &amp; practice</h2>
            <p className="type-footnote mt-2 font-normal text-[var(--apple-label-tertiary)]">
              {SITE_CONFIG.location}
            </p>
          </div>

          <div className="prose-stack type-body measure-prose lg:col-span-7 lg:col-start-6">
            {ABOUT_CONTENT.storyParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Factual Practice & Case Study Timeline (P2.10 — strictly from genuine portfolio data) */}
      <section
        aria-labelledby="practice-timeline-heading"
        className="bg-[var(--apple-bg)] py-20 sm:py-28 print:py-6"
      >
        <div className="mx-auto max-w-[1160px] px-5 sm:px-8 print:px-0">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <p className="type-eyebrow text-[var(--apple-label-secondary)]">
                Practice Timeline
              </p>
              <h2 id="practice-timeline-heading" className="type-title-2 mt-2">
                Selected independent work &amp; roles
              </h2>
              <p className="type-callout mt-3">
                Documented chronology across published case studies as an {SITE_CONFIG.roleTitle}.
              </p>
            </div>

            <div className="space-y-8 lg:col-span-8">
              {timelineByYear.map(([year, items]) => (
                <div
                  key={year}
                  className="border-t border-[var(--apple-separator)] pt-6"
                >
                  <p className="type-title-3 tabular-nums text-[var(--apple-link)]">
                    {year}
                  </p>
                  <ol className="mt-4 divide-y divide-[var(--apple-separator-subtle)]">
                    {items.map((project) => (
                      <li
                        key={project.slug}
                        className="flex flex-col gap-2 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                      >
                        <div className="min-w-0">
                          <a
                            href={`/work/${project.slug}`}
                            onClick={(e) => {
                              e.preventDefault();
                              onNavigate(`/work/${project.slug}`);
                            }}
                            className="apple-link group inline-flex items-center gap-1.5 text-[16.5px] font-semibold tracking-[-0.015em] text-[var(--apple-label-primary)] hover:text-[var(--apple-link)]"
                          >
                            <span>{project.title}</span>
                            <SFChevronRight
                              size={13}
                              className="text-[var(--apple-label-tertiary)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--apple-link)] print:hidden"
                            />
                          </a>
                          <p className="type-footnote mt-0.5 font-normal text-[var(--apple-label-secondary)]">
                            {project.role} · {project.category}
                          </p>
                          <p className="type-footnote mt-1 font-normal text-[var(--apple-label-tertiary)]">
                            {project.shortDescription}
                          </p>
                        </div>
                        <span className="type-caption shrink-0 whitespace-nowrap font-normal text-[var(--apple-label-tertiary)]">
                          {project.timeline}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Design Philosophy */}
      <section className="bg-[var(--apple-bg-secondary)] py-20 sm:py-28 print:bg-white print:py-6">
        <div className="mx-auto max-w-[1160px] px-5 sm:px-8 print:px-0">
          <p className="type-eyebrow text-[var(--apple-label-secondary)]">
            Design Philosophy
          </p>
          <h2 className="type-title-2 measure-title mt-2.5">
            Principles that guide my work.
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-7">
            {ABOUT_CONTENT.philosophy.map((item) => (
              <motion.div
                key={item.index}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT_REVEAL}
                transition={{ duration: 0.48, ease: EASE_APPLE }}
                className="apple-surface-subtle rounded-[26px] p-7 sm:p-8"
              >
                <span className="type-caption tabular-nums text-[var(--apple-link)]">
                  {item.index}
                </span>
                <h3 className="type-title-3 mt-3">{item.title}</h3>
                <p className="type-callout measure-prose mt-3">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities & Collaborations */}
      <section className="bg-[var(--apple-bg)] py-20 sm:py-28 print:py-6">
        <div className="mx-auto max-w-[1160px] px-5 sm:px-8 print:px-0">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <p className="type-eyebrow text-[var(--apple-label-secondary)]">
                Capabilities
              </p>
              <h2 className="type-title-2 mt-2">Disciplines &amp; craft</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8">
              {CAPABILITIES.map((cap) => (
                <div
                  key={cap.id}
                  className="rounded-[22px] bg-[var(--apple-bg-secondary)] p-6"
                >
                  <h3 className="type-headline font-display">{cap.name}</h3>
                  <p className="type-callout mt-2">{cap.summary}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-10 border-t border-[var(--apple-separator)] pt-14 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <p className="type-eyebrow text-[var(--apple-label-secondary)]">
                Collaborations
              </p>
              <h2 className="type-title-2 mt-2">How I work with teams</h2>
            </div>

            <div className="space-y-4 lg:col-span-8">
              {COLLABORATION_CONTEXTS.map((ctx) => (
                <div
                  key={ctx.title}
                  className="rounded-[22px] bg-[var(--apple-bg-secondary)] p-6 sm:p-7"
                >
                  <p className="type-caption text-[var(--apple-link)]">
                    {ctx.scope}
                  </p>
                  <h3 className="type-title-3 mt-1.5">{ctx.title}</h3>
                  <p className="type-callout mt-2">{ctx.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tools, Interests & Closing CTA */}
      <section className="bg-[var(--apple-bg-secondary)] py-20 sm:py-28 print:bg-white print:py-6">
        <div className="mx-auto max-w-[1160px] px-5 sm:px-8 print:px-0">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="type-eyebrow text-[var(--apple-label-secondary)]">
                Tools &amp; Technologies
              </p>
              <h2 className="type-title-2 mt-2">Everyday stack</h2>

              <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
                {ABOUT_CONTENT.tools.map((group) => (
                  <div key={group.group}>
                    <h3 className="type-footnote font-semibold text-[var(--apple-label-primary)]">
                      {group.group}
                    </h3>
                    <ul className="type-callout mt-3 space-y-2.5">
                      {group.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[var(--apple-separator)] pt-10 lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
              <p className="type-eyebrow text-[var(--apple-label-secondary)]">
                Outside the screen
              </p>
              <h2 className="type-title-2 mt-2">Personal interests</h2>
              <ul className="type-callout mt-6 space-y-3">
                {ABOUT_CONTENT.interests.map((interest) => (
                  <li key={interest} className="flex items-start gap-2.5">
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--apple-label-tertiary)]"
                      aria-hidden="true"
                    />
                    <span>{interest}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="apple-surface-subtle mt-20 flex flex-col items-start justify-between gap-6 rounded-[28px] p-8 sm:flex-row sm:items-center sm:p-12 print:hidden">
            <div>
              <h2 className="type-title-3">
                Interested in working together?
              </h2>
              <p className="type-callout mt-1.5">
                {SITE_CONFIG.availabilityFull}
              </p>
            </div>
            <a
              href="/contact"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/contact');
              }}
              className="apple-btn-primary shrink-0"
            >
              Get in touch
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
