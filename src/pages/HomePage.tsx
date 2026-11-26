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
import { ProjectCard } from '../components/ProjectCard';
import { TestimonialsSection } from '../components/TestimonialsSection';
import {
  SFCheckmark,
  SFChevronDown,
  SFChevronRight,
  SFDocOnDoc,
  SFMagnifyingGlass,
  SFXmark,
} from '../components/SFSymbols';
import {
  getProjectFilterCounts,
  queryProjects,
  type ProjectFilter,
  type ProjectSort,
} from '../utils/portfolio';
import { scrollToElementById } from '../utils/scroll';
import { playSuccessChime, playTick } from '../utils/soundEngine';
import { showToast } from '../utils/toast';
import { EASE_APPLE, SPRING_SEGMENT, VIEWPORT_REVEAL } from '../utils/motion';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

const FILTER_OPTIONS: { id: ProjectFilter; label: string }[] = [
  { id: 'all', label: 'All Work' },
  { id: 'product', label: 'Product' },
  { id: 'interactive', label: 'Interactive' },
  { id: 'enterprise', label: 'Enterprise' },
];

const SORT_OPTIONS: { id: ProjectSort; label: string }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'newest', label: 'Newest' },
  { id: 'alphabetical', label: 'A–Z' },
];

export function HomePage({ onNavigate }: HomePageProps) {
  const [activeFilter, setActiveFilter] = useState<ProjectFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<ProjectSort>('featured');
  const [expandedExperiment, setExpandedExperiment] = useState<string | null>(
    EXPERIMENTS[0].id,
  );
  const [copiedEmail, setCopiedEmail] = useState(false);

  const trimmedSearch = searchQuery.trim();
  const visibleProjects = useMemo(
    () =>
      queryProjects(PROJECTS, {
        filter: activeFilter,
        searchQuery: trimmedSearch,
        sort: sortBy,
      }),
    [activeFilter, trimmedSearch, sortBy],
  );
  const filterCounts = useMemo(() => getProjectFilterCounts(PROJECTS), []);
  const activeFilterLabel =
    FILTER_OPTIONS.find((opt) => opt.id === activeFilter)?.label ?? 'All Work';
  const activeSortLabel =
    SORT_OPTIONS.find((opt) => opt.id === sortBy)?.label ?? 'Featured';
  const isDefaultShowcase =
    activeFilter === 'all' && trimmedSearch === '' && sortBy === 'featured';

  const handleResetDiscovery = () => {
    playTick();
    setActiveFilter('all');
    setSearchQuery('');
    setSortBy('featured');
  };

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

  const scrollToWork = () => {
    scrollToElementById('selected-work');
  };

  return (
    <div className="bg-[var(--apple-bg)]">
      {/* Hero Section — Centered Apple Editorial Composition */}
      <section className="mx-auto max-w-[1160px] px-5 pb-28 pt-24 text-center sm:px-8 sm:pb-36 sm:pt-32 lg:pb-40 lg:pt-36">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, ease: EASE_APPLE }}
          className="type-eyebrow text-[var(--apple-label-secondary)] sm:text-[17px]"
        >
          {SITE_CONFIG.roleTitle}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.58, delay: 0.06, ease: EASE_APPLE }}
          className="type-display measure-display mx-auto mt-4"
        >
          {SITE_CONFIG.hero.headline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.58, delay: 0.12, ease: EASE_APPLE }}
          className="type-lead measure-lead mx-auto mt-6"
        >
          {SITE_CONFIG.hero.intro}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.54, delay: 0.18, ease: EASE_APPLE }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3.5"
        >
          <button
            type="button"
            onClick={scrollToWork}
            className="apple-btn-primary"
          >
            {SITE_CONFIG.hero.primaryCta}
          </button>

          <a
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/contact');
            }}
            className="apple-btn-outline"
          >
            {SITE_CONFIG.hero.secondaryCta}
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.56, delay: 0.26, ease: EASE_APPLE }}
          className="type-footnote mt-8 flex flex-col items-center justify-center gap-1 font-normal text-[var(--apple-label-tertiary)] sm:flex-row sm:gap-2.5"
        >
          <span>{SITE_CONFIG.location}</span>
          <span className="hidden sm:inline" aria-hidden="true">·</span>
          <span className="font-medium text-[var(--apple-link)]">{SITE_CONFIG.availabilityShort}</span>
        </motion.div>
      </section>

      {/* Selected Work Showcase — Seamless Apple Secondary Gallery Band */}
      <section
        id="selected-work"
        aria-labelledby="selected-work-heading"
        className="scroll-mt-[var(--scroll-offset-header)] bg-[var(--apple-bg-secondary)] py-24 sm:py-32"
      >
        <div className="mx-auto max-w-[1160px] px-5 sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="type-eyebrow text-[var(--apple-label-secondary)]">
                Selected Work · <span className="tabular-nums">{PROJECTS.length} Case Studies</span>
              </p>
              <h2
                id="selected-work-heading"
                className="type-title-1 measure-title mt-2.5"
              >
                Recent product and interaction studies.
              </h2>
            </div>

            {/* iOS Rounded Segmented Filter Control */}
            <div
              role="group"
              aria-label="Filter selected projects"
              className="apple-segmented max-w-full overflow-x-auto"
            >
              {FILTER_OPTIONS.map((option) => {
                const isSelected = activeFilter === option.id;
                const count = filterCounts[option.id];
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      if (activeFilter !== option.id) {
                        playTick();
                        setActiveFilter(option.id);
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
                        layoutId="home-work-filter-thumb"
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
          </div>

          {/* Search, Sort & Live Result Count Bar (P1.12) */}
          <div className="mt-7 flex flex-col gap-3.5 border-t border-[var(--apple-separator)] pt-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              {/* Keyword Search Input */}
              <div className="relative w-full sm:max-w-[340px]">
                <SFMagnifyingGlass
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--apple-label-tertiary)]"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search title, discipline, platform, or tool…"
                  aria-label="Search case studies by title, discipline, platform, or tools"
                  className="apple-input min-h-[40px] rounded-full py-2 pl-10 pr-9 text-[13.5px]"
                />
                {searchQuery.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      playTick();
                      setSearchQuery('');
                    }}
                    aria-label="Clear search query"
                    className="apple-btn-icon absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 text-[var(--apple-label-tertiary)] hover:text-[var(--apple-label-primary)] sm:h-7 sm:w-7"
                  >
                    <SFXmark size={13} />
                  </button>
                )}
              </div>

              {/* Sort Segmented Control */}
              <div className="flex items-center gap-2.5">
                <span className="type-footnote shrink-0 font-normal text-[var(--apple-label-tertiary)]">
                  Sort
                </span>
                <div
                  role="group"
                  aria-label="Sort case studies"
                  className="apple-segmented !p-0.5"
                >
                  {SORT_OPTIONS.map((option) => {
                    const active = sortBy === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => {
                          if (sortBy !== option.id) {
                            playTick();
                            setSortBy(option.id);
                          }
                        }}
                        className={`apple-segmented-item !min-h-[30px] px-3 py-1 text-[12.5px] ${
                          active
                            ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                            : 'text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Live Count + Quick Reset */}
            <div className="flex flex-wrap items-center gap-3 md:justify-end">
              <p
                aria-live="polite"
                className="type-footnote tabular-nums font-normal text-[var(--apple-label-tertiary)]"
              >
                {isDefaultShowcase
                  ? `Showing all ${PROJECTS.length} case studies`
                  : `Showing ${visibleProjects.length} of ${PROJECTS.length} case studies${
                      activeFilter !== 'all' ? ` in ${activeFilterLabel}` : ''
                    }${trimmedSearch ? ` matching “${trimmedSearch}”` : ''}${
                      sortBy !== 'featured' ? ` · ${activeSortLabel}` : ''
                    }`}
              </p>
              {!isDefaultShowcase && (
                <button
                  type="button"
                  onClick={handleResetDiscovery}
                  className="apple-link type-footnote font-medium text-[var(--apple-link)] hover:underline"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {isDefaultShowcase ? (
            <div className="mt-10 space-y-7 lg:space-y-8">
              {/* Row 1: Flagship Featured Project */}
              <ProjectCard project={PROJECTS[0]} onNavigate={onNavigate} variant="featured" index={0} />

              {/* Row 2: 7 / 5 asymmetric editorial row with shared media baseline */}
              <div className="grid grid-cols-1 gap-7 lg:grid-cols-12 lg:gap-8">
                <div className="lg:col-span-7">
                  <ProjectCard
                    project={PROJECTS[1]}
                    onNavigate={onNavigate}
                    index={1}
                    mediaClassName="aspect-[4/3] lg:aspect-auto lg:h-[380px]"
                  />
                </div>
                <div className="lg:col-span-5">
                  <ProjectCard
                    project={PROJECTS[2]}
                    onNavigate={onNavigate}
                    index={2}
                    mediaClassName="aspect-[4/3] lg:aspect-auto lg:h-[380px]"
                  />
                </div>
              </div>

              {/* Row 3: 5 / 7 reversed asymmetric row with shared media baseline */}
              <div className="grid grid-cols-1 gap-7 lg:grid-cols-12 lg:gap-8">
                <div className="lg:col-span-5">
                  <ProjectCard
                    project={PROJECTS[3]}
                    onNavigate={onNavigate}
                    index={3}
                    mediaClassName="aspect-[4/3] lg:aspect-auto lg:h-[380px]"
                  />
                </div>
                <div className="lg:col-span-7">
                  <ProjectCard
                    project={PROJECTS[4]}
                    onNavigate={onNavigate}
                    index={4}
                    mediaClassName="aspect-[4/3] lg:aspect-auto lg:h-[380px]"
                  />
                </div>
              </div>

              {/* Row 4: Wide Closing Feature */}
              <ProjectCard project={PROJECTS[5]} onNavigate={onNavigate} variant="wide" index={5} />
            </div>
          ) : visibleProjects.length === 0 ? (
            <div className="apple-surface-subtle mt-10 rounded-[28px] px-7 py-16 text-center sm:px-12">
              <p className="type-caption text-[var(--apple-label-tertiary)]">
                No matching case studies
              </p>
              <h3 className="type-title-3 mt-2">
                Nothing matched {trimmedSearch ? `“${trimmedSearch}”` : activeFilterLabel}.
              </h3>
              <p className="type-callout mx-auto mt-2.5 max-w-[46ch]">
                Try searching by discipline, platform, or tool—or reset filters to view the full curated showcase.
              </p>
              <button
                type="button"
                onClick={handleResetDiscovery}
                className="apple-btn-primary mt-6"
              >
                Reset search &amp; filters
              </button>
            </div>
          ) : visibleProjects.length === 1 ? (
            <div className="mt-10">
              <ProjectCard
                project={visibleProjects[0]}
                onNavigate={onNavigate}
                variant="featured"
                index={0}
              />
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-7 md:grid-cols-2 lg:gap-8">
              {visibleProjects.map((project, index) => (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  onNavigate={onNavigate}
                  index={index}
                  mediaClassName="aspect-[4/3] lg:aspect-auto lg:h-[360px]"
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Preview — Clean Primary Editorial Band */}
      <section
        aria-labelledby="about-preview-heading"
        className="bg-[var(--apple-bg)] py-24 sm:py-32"
      >
        <div className="mx-auto grid max-w-[1160px] grid-cols-1 gap-8 px-5 sm:px-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <p className="type-eyebrow text-[var(--apple-label-secondary)]">
              About
            </p>
            <h2
              id="about-preview-heading"
              className="type-title-2 measure-title mt-2.5"
            >
              {SITE_CONFIG.aboutPreview.heading}
            </h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT_REVEAL}
            transition={{ duration: 0.54, ease: EASE_APPLE }}
            className="prose-stack type-body measure-prose lg:col-span-6 lg:col-start-7"
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
                <SFChevronRight
                  size={15}
                  className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
                />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Capabilities & Collaboration — Seamless Secondary Band */}
      <section
        aria-labelledby="capabilities-heading"
        className="bg-[var(--apple-bg-secondary)] py-24 sm:py-32"
      >
        <div className="mx-auto max-w-[1160px] px-5 sm:px-8">
          <div>
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

          {/* Elevated Borderless Apple Capability Cards */}
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CAPABILITIES.map((capability, idx) => (
              <motion.div
                key={capability.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT_REVEAL}
                transition={{
                  duration: 0.48,
                  delay: Math.min(idx * 0.03, 0.16),
                  ease: EASE_APPLE,
                }}
                className="apple-surface-subtle rounded-[24px] p-6 sm:p-7"
              >
                <p className="type-caption text-[var(--apple-link)]">
                  {capability.focus}
                </p>
                <h3 className="type-headline font-display mt-2 text-[19px]">
                  {capability.name}
                </h3>
                <p className="type-callout mt-2.5">
                  {capability.summary}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Collaboration Context */}
          <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
            {COLLABORATION_CONTEXTS.map((item) => (
              <div
                key={item.title}
                className="rounded-[24px] bg-[var(--apple-surface-muted-card)] p-7"
              >
                <p className="type-caption text-[var(--apple-label-tertiary)]">
                  {item.scope}
                </p>
                <h3 className="type-headline font-display mt-2 text-[19px]">
                  {item.title}
                </h3>
                <p className="type-callout mt-2.5">
                  {item.description}
                </p>
              </div>
            ))}
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
              <div className="divide-y divide-[var(--apple-separator-subtle)] overflow-hidden rounded-[28px] bg-[var(--apple-bg-secondary)] px-6 sm:px-8">
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
                          className="apple-surface-subtle mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--apple-label-primary)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:h-9 sm:w-9"
                        >
                          <SFChevronDown
                            size={15}
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

      {/* Contact Closing Section — Elevated Centered Apple Feature Card */}
      <section
        aria-labelledby="contact-closing-heading"
        className="bg-[var(--apple-bg-secondary)] pb-10 pt-20 sm:pb-16 sm:pt-28"
      >
        <div className="mx-auto max-w-[1160px] px-5 sm:px-8">
          <div className="apple-card-static rounded-[32px] px-7 py-14 text-center sm:px-14 sm:py-20">
            <p className="type-eyebrow text-[var(--apple-link)]">
              {SITE_CONFIG.availabilityShort}
            </p>
            <h2
              id="contact-closing-heading"
              className="type-title-1 mx-auto mt-3 max-w-[16ch]"
            >
              {SITE_CONFIG.contactClosing.heading}
            </h2>
            <p className="type-lead measure-lead mx-auto mt-5">
              {SITE_CONFIG.contactClosing.body}
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
              <a
                href="/contact"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/contact');
                }}
                className="apple-btn-primary"
              >
                Start a project inquiry
              </a>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="apple-btn-tonal"
              >
                {copiedEmail ? (
                  <>
                    <SFCheckmark size={15} className="text-[var(--apple-blue)]" />
                    <span>Email copied</span>
                  </>
                ) : (
                  <>
                    <SFDocOnDoc size={15} className="text-[var(--apple-label-secondary)]" />
                    <span>{SITE_CONFIG.email}</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-[14px] font-medium text-[var(--apple-label-secondary)]">
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
      </section>
    </div>
  );
}
