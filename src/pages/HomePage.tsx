import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { PROJECTS } from '../data/projects';
import { VERIFIED_TESTIMONIALS } from '../data/testimonials';
import {
  CAPABILITIES,
  COLLABORATION_CONTEXTS,
  EXPERIMENTS,
  SITE_CONFIG,
} from '../data/site';
import { FeaturedWorkRail } from '../components/FeaturedWorkRail';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { AboutJournalBook } from '../components/AboutJournalBook';
import { ChevronDown, ChevronRight, Copy } from 'lucide-react';
import { AnimatedCheckIcon } from '../components/icons/AnimatedLucide';
import { playSuccessChime, playTick } from '../utils/soundEngine';
import { showToast } from '../utils/toast';
import { EASE_APPLE, VIEWPORT_REVEAL } from '../utils/motion';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

const FEATURED_PROJECT_SLUGS = [
  'stallsync',
  'music-discovery-pwa',
  'curse-of-the-mudradhaar',
  'precognition-labs',
] as const;

export function HomePage({ onNavigate }: HomePageProps) {
  const [expandedExperiment, setExpandedExperiment] = useState<string | null>(
    EXPERIMENTS[0].id,
  );
  const [copiedEmail, setCopiedEmail] = useState(false);

  const featuredProjects = useMemo(() => {
    const bySlug = new Map(PROJECTS.map((project) => [project.slug, project]));
    return FEATURED_PROJECT_SLUGS.map((slug) => bySlug.get(slug)).filter(
      (project): project is (typeof PROJECTS)[number] => Boolean(project),
    );
  }, []);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SITE_CONFIG.email);
      playSuccessChime();
      setCopiedEmail(true);
      showToast({ message: `Copied ${SITE_CONFIG.email}`, tone: 'success' });
      window.setTimeout(() => setCopiedEmail(false), 2200);
    } catch {
      setCopiedEmail(false);
    }
  };

  return (
    <div className="bg-[var(--apple-bg)]">
      {/* Hero Section — Compact Left-Aligned Designer Intro */}
      <section className="editorial-hero-glow relative">
        <div className="mx-auto max-w-[1160px] px-5 pb-10 pt-12 text-left sm:px-8 sm:pb-12 sm:pt-16">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, ease: EASE_APPLE }}
          className="type-display max-w-[26ch] text-balance"
        >
          {SITE_CONFIG.hero.headline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, delay: 0.04, ease: EASE_APPLE }}
          className="type-lead mt-4 max-w-none"
        >
          {SITE_CONFIG.hero.intro}
        </motion.p>
        </div>
      </section>

      {/* Featured Work — Single Horizontally Scrollable 4-Card Row */}
      <FeaturedWorkRail
        projects={featuredProjects}
        totalCount={PROJECTS.length}
        onNavigate={onNavigate}
      />

      {/* About Preview — Clean Primary Editorial Band with 3D Interactive Journal */}
      <section
        aria-labelledby="about-preview-heading"
        className="bg-[var(--apple-bg)] py-24 sm:py-32"
      >
        <div className="mx-auto grid max-w-[1160px] grid-cols-1 items-center gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <p className="type-eyebrow text-[var(--apple-label-secondary)]">
              About
            </p>
            <h2
              id="about-preview-heading"
              className="type-title-2 measure-title mt-2.5"
            >
              {SITE_CONFIG.aboutPreview.heading}
            </h2>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT_REVEAL}
              transition={{ duration: 0.54, ease: EASE_APPLE }}
              className="prose-stack type-body measure-prose mt-6"
            >
              {SITE_CONFIG.aboutPreview.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}

              <div className="pt-3">
                <a
                  href="/about"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/about');
                  }}
                  className="apple-link group inline-flex items-center gap-1 text-[17px] font-medium tracking-[-0.016em] text-[var(--apple-link)]"
                >
                  <span className="group-hover:underline">
                    {SITE_CONFIG.aboutPreview.ctaLabel}
                  </span>
                  <ChevronRight
                    size={15}
                    strokeWidth={1.75}
                    aria-hidden="true"
                    className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
                  />
                </a>
              </div>
            </motion.div>
          </div>

          <div className="flex justify-center pt-4 lg:col-span-5 lg:justify-end lg:pt-0">
            <AboutJournalBook
              caption="Field journal · Click to open & flip pages"
            />
          </div>
        </div>
      </section>

      {/* Capabilities & Collaboration — Clean Architectural Secondary Band */}
      <section
        aria-labelledby="capabilities-heading"
        className="bg-[var(--apple-bg-secondary)] py-24 sm:py-32"
      >
        <div className="mx-auto max-w-[1160px] px-5 sm:px-8">
          <div className="max-w-[660px]">
            <p className="type-eyebrow text-[var(--apple-label-secondary)]">
              Capabilities
            </p>
            <h2
              id="capabilities-heading"
              className="type-title-1 measure-title mt-2.5"
            >
              Where I contribute most effectively.
            </h2>
            <p className="type-body measure-prose mt-4">
              From early architecture through interactive prototyping and production web delivery, I work closely with small, focused teams.
            </p>
          </div>

          {/* Symmetrical 2-Column Hairline Capabilities Grid — Zero Uneven Wrapping */}
          <div className="mt-14 grid grid-cols-1 border-b border-[var(--apple-separator)] md:grid-cols-2 md:gap-x-12 lg:gap-x-16">
            {CAPABILITIES.map((capability, idx) => (
              <motion.div
                key={capability.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT_REVEAL}
                transition={{
                  duration: 0.44,
                  delay: Math.min(idx * 0.025, 0.14),
                  ease: EASE_APPLE,
                }}
                className="flex flex-col border-t border-[var(--apple-separator)] py-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="type-caption shrink-0 font-medium tabular-nums text-[var(--editorial-accent-warm)]">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <p className="type-caption whitespace-nowrap text-right text-[var(--apple-label-tertiary)]">
                    {capability.focus}
                  </p>
                </div>
                <h3 className="type-headline font-display mt-3 text-[20px] font-semibold tracking-[-0.02em] text-[var(--apple-label-primary)]">
                  {capability.name}
                </h3>
                <p className="type-callout mt-2 max-w-[46ch] text-[var(--apple-label-secondary)]">
                  {capability.summary}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Collaboration Context — Crisp Ruled 3-Column Row */}
          <div className="mt-16 sm:mt-20">
            <p className="type-eyebrow text-[var(--apple-label-secondary)]">
              Collaboration
            </p>
            <div className="mt-5 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
              {COLLABORATION_CONTEXTS.map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col border-t border-[var(--apple-separator)] pt-5"
                >
                  <p className="type-caption whitespace-nowrap text-[var(--apple-label-tertiary)]">
                    {item.scope}
                  </p>
                  <h3 className="type-headline font-display mt-2.5 text-[19px] font-semibold tracking-[-0.018em] text-[var(--apple-label-primary)]">
                    {item.title}
                  </h3>
                  <p className="type-callout mt-2 text-[var(--apple-label-secondary)]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Selected Experiments — iOS Inset Grouped Editorial Appendix */}
      <section
        aria-labelledby="experiments-heading"
        className="bg-[var(--apple-bg)] py-24 sm:py-32"
      >
        <div className="mx-auto max-w-[1160px] px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <p className="type-eyebrow text-[var(--apple-label-secondary)]">
                Appendix · <span className="tabular-nums">{EXPERIMENTS.length} Craft Studies</span>
              </p>
              <h2
                id="experiments-heading"
                className="type-title-2 measure-title mt-2.5"
              >
                Selected experiments &amp; craft studies.
              </h2>
              <p className="type-callout measure-prose mt-4">
                Smaller technical studies built to test timing curves, lighting physics, and unfamiliar input patterns outside formal client scopes.
              </p>
            </div>

            <div className="lg:col-span-8">
              <div className="divide-y divide-[var(--apple-separator-subtle)] border-y border-[var(--apple-separator)]">
                {EXPERIMENTS.map((experiment) => {
                  const isOpen = expandedExperiment === experiment.id;
                  const triggerId = `experiment-trigger-${experiment.id}`;
                  const panelId = `experiment-panel-${experiment.id}`;
                  return (
                    <div key={experiment.id}>
                      <button
                        id={triggerId}
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => {
                          playTick();
                          setExpandedExperiment(isOpen ? null : experiment.id);
                        }}
                        className="group flex w-full items-start justify-between gap-4 py-6 text-left"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="type-caption flex flex-wrap items-center gap-x-2 text-[var(--apple-label-tertiary)]">
                            <span className="tabular-nums">{experiment.year}</span>
                            <span aria-hidden="true">·</span>
                            <span>{experiment.discipline}</span>
                          </div>
                          <h3 className="type-title-3 mt-2 text-[20px] transition-colors duration-200 group-hover:text-[var(--apple-link)]">
                            {experiment.title}
                          </h3>
                          <p className="type-callout measure-prose mt-1.5">
                            {experiment.summary}
                          </p>
                        </div>

                        <span
                          aria-hidden="true"
                          className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--apple-separator)] bg-[var(--apple-surface)] text-[var(--apple-label-primary)] transition-[border-color,color,transform] duration-200 group-hover:border-[var(--apple-label-tertiary)] sm:h-9 sm:w-9"
                        >
                          <ChevronDown
                            size={15}
                            strokeWidth={1.75}
                            className={`transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                              isOpen
                                ? 'rotate-180 text-[var(--apple-blue)]'
                                : 'text-[var(--apple-label-secondary)]'
                            }`}
                          />
                        </span>
                      </button>

                      {/* Smooth zero-jank grid-rows disclosure */}
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={triggerId}
                        hidden={!isOpen}
                        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="measure-prose pb-6 pr-10">
                            <p className="type-callout text-[var(--apple-label-primary)]">
                              {experiment.notes}
                            </p>
                            <p className="type-footnote mt-3 text-[var(--apple-label-tertiary)]">
                              Built with: {experiment.stack}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Testimonials — Automatically hidden when no verified entries exist (P1.10) */}
      <TestimonialsSection entries={VERIFIED_TESTIMONIALS} />

      {/* Contact Closing Section — Open Asymmetric Editorial Band */}
      <section
        aria-labelledby="contact-closing-heading"
        className="bg-[var(--apple-bg-secondary)] py-20 sm:py-28"
      >
        <div className="mx-auto max-w-[1160px] px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-10 border-t border-[var(--apple-separator)] pt-12 lg:grid-cols-12 lg:items-end lg:gap-10">
            <div className="lg:col-span-6">
              <p className="type-eyebrow inline-flex items-center gap-2 text-[var(--editorial-accent-warm)]">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-[var(--editorial-accent-warm)]"
                  aria-hidden="true"
                />
                <span>{SITE_CONFIG.availabilityShort}</span>
              </p>
              <h2
                id="contact-closing-heading"
                className="type-title-1 mt-3 max-w-[16ch]"
              >
                {SITE_CONFIG.contactClosing.heading}
              </h2>
              <p className="type-lead measure-lead mt-4">
                {SITE_CONFIG.contactClosing.body}
              </p>
            </div>

            <div className="lg:col-span-6 lg:flex lg:flex-col lg:items-end">
              <div className="flex flex-nowrap items-center gap-2.5 sm:gap-3">
                <a
                  href="/contact"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/contact');
                  }}
                  className="apple-btn-primary shrink-0 whitespace-nowrap !px-4 !text-[14px] sm:!px-5 sm:!text-[15px]"
                >
                  Start a project inquiry
                </a>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  aria-live="polite"
                  data-copied={copiedEmail ? 'true' : 'false'}
                  className={`copy-email-btn relative inline-grid min-h-[44px] shrink-0 cursor-pointer place-items-center overflow-hidden whitespace-nowrap rounded-full border px-4 text-[14px] font-medium tracking-[-0.012em] transition-[background-color,border-color,color,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--apple-focus-ring)] sm:px-5 sm:text-[15px] ${
                    copiedEmail
                      ? 'border-[var(--apple-success)]/35 bg-[var(--apple-success)]/[0.1] text-[var(--apple-success)]'
                      : 'border-transparent bg-[var(--apple-control-tonal)] text-[var(--apple-label-primary)] hover:bg-[var(--apple-control-tonal-hover)]'
                  }`}
                >
                  {/* Idle state — holds stable intrinsic button width */}
                  <span
                    aria-hidden={copiedEmail}
                    className={`col-start-1 row-start-1 inline-flex items-center gap-2 transition-[opacity,transform,filter] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                      copiedEmail
                        ? '-translate-y-1.5 opacity-0 blur-[2px]'
                        : 'translate-y-0 opacity-100 blur-0'
                    }`}
                  >
                    <Copy
                      size={14.5}
                      strokeWidth={1.75}
                      className="text-[var(--apple-label-secondary)]"
                      aria-hidden="true"
                    />
                    <span>{SITE_CONFIG.email}</span>
                  </span>

                  {/* Confirmed state — morphs smoothly into place with zero width jump */}
                  <span
                    aria-hidden={!copiedEmail}
                    className={`col-start-1 row-start-1 inline-flex items-center gap-2 transition-[opacity,transform,filter] duration-220 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                      copiedEmail
                        ? 'translate-y-0 opacity-100 blur-0'
                        : 'translate-y-1.5 opacity-0 blur-[2px]'
                    }`}
                  >
                    <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[var(--apple-success)]/15 text-[var(--apple-success)]">
                      <AnimatedCheckIcon
                        size={12}
                        strokeWidth={2.4}
                        animate={copiedEmail}
                      />
                    </span>
                    <span>Copied to clipboard</span>
                  </span>
                </button>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] font-medium text-[var(--apple-label-secondary)] lg:justify-end">
                {SITE_CONFIG.socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors duration-150 hover:text-[var(--apple-label-primary)]"
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
