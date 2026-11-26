import { useState } from 'react';
import { motion } from 'motion/react';
import type { CaseStudyProject } from '../data/projects';
import { EASE_APPLE, VIEWPORT_REVEAL } from '../utils/motion';
import { toggleShortlistSlug, useShortlistSlugs } from '../utils/shortlist';
import { trackAnalyticsEvent } from '../utils/analytics';
import { playTick } from '../utils/soundEngine';
import { showToast } from '../utils/toast';
import { SFBookmark, SFBookmarkFill, SFChevronRight } from './SFSymbols';

interface ProjectCardProps {
  project: CaseStudyProject;
  onNavigate: (path: string) => void;
  variant?: 'featured' | 'standard' | 'wide';
  index?: number;
  mediaClassName?: string;
}

const IMAGE_DIMENSIONS: Record<string, { width: number; height: number }> = {
  stallsync: { width: 1376, height: 768 },
  mycroharvest: { width: 1376, height: 768 },
};

export function ProjectCard({
  project,
  onNavigate,
  variant = 'standard',
  index = 0,
  mediaClassName = 'aspect-[4/3]',
}: ProjectCardProps) {
  const [imageError, setImageError] = useState(false);
  const shortlistedSlugs = useShortlistSlugs();
  const isShortlisted = shortlistedSlugs.includes(project.slug);
  const dims = IMAGE_DIMENSIONS[project.slug] ?? { width: 1200, height: 896 };

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    onNavigate(`/work/${project.slug}`);
  };

  const handleToggleShortlist = () => {
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
  };

  const renderShortlistButton = (positionClass: string) => (
    <button
      type="button"
      onClick={handleToggleShortlist}
      aria-pressed={isShortlisted}
      aria-label={
        isShortlisted
          ? `Remove ${project.title} from recruiter shortlist`
          : `Save ${project.title} to recruiter shortlist`
      }
      title={isShortlisted ? 'Saved in shortlist' : 'Save to shortlist'}
      className={`apple-pill-shadow absolute z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--apple-separator)] backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 sm:h-9 sm:w-9 print:hidden ${
        isShortlisted
          ? 'bg-[var(--apple-blue-fill)] text-white border-transparent'
          : 'bg-[var(--apple-surface-ios-bar)] text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
      } ${positionClass}`}
    >
      {isShortlisted ? <SFBookmarkFill size={14} /> : <SFBookmark size={14} />}
    </button>
  );

  const renderMedia = (aspectClass: string) => (
    <div className={`relative overflow-hidden bg-[var(--apple-bg-tertiary)] ${aspectClass}`}>
      {!imageError ? (
        <img
          src={project.coverImage}
          alt={project.coverAlt}
          width={dims.width}
          height={dims.height}
          decoding="async"
          fetchPriority={index === 0 ? 'high' : undefined}
          referrerPolicy="no-referrer"
          loading={index < 2 ? 'eager' : 'lazy'}
          onError={() => setImageError(true)}
          className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center bg-[var(--apple-bg-tertiary)] p-8 text-center">
          <span className="type-title-3">
            {project.title}
          </span>
          <span className="type-footnote mt-1 text-[var(--apple-label-secondary)]">
            {project.category}
          </span>
        </div>
      )}
    </div>
  );

  if (variant === 'featured') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEWPORT_REVEAL}
        transition={{ duration: 0.56, ease: EASE_APPLE }}
        className="relative"
      >
        {renderShortlistButton('right-4 top-4 sm:right-5 sm:top-5')}
        <a
          href={`/work/${project.slug}`}
          onClick={handleClick}
          className="apple-card group grid grid-cols-1 items-stretch overflow-hidden rounded-[28px] lg:grid-cols-12"
        >
          <div className="lg:col-span-7">
            {renderMedia('aspect-[16/10] lg:h-full lg:min-h-[450px] lg:aspect-auto')}
          </div>

          <div className="flex flex-col justify-between p-8 sm:p-10 lg:col-span-5 lg:p-12">
            <div>
              <div className="type-footnote flex flex-wrap items-center gap-x-2 pr-12 font-semibold text-[var(--apple-label-secondary)]">
                <span>{project.category}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{project.year}</span>
              </div>

              <h3 className="type-title-2 mt-3">
                {project.title}
              </h3>

              <p className="type-body mt-4">
                {project.shortDescription}
              </p>
            </div>

            <div className="mt-10 border-t border-[var(--apple-separator-subtle)] pt-6">
              <p className="type-footnote text-[var(--apple-label-tertiary)]">{project.role}</p>
              <span className="type-callout mt-2.5 inline-flex items-center gap-1 font-medium text-[var(--apple-link)]">
                <span className="group-hover:underline">Read case study</span>
                <SFChevronRight
                  size={15}
                  className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
                />
              </span>
            </div>
          </div>
        </a>
      </motion.article>
    );
  }

  if (variant === 'wide') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEWPORT_REVEAL}
        transition={{ duration: 0.56, ease: EASE_APPLE }}
        className="relative"
      >
        {renderShortlistButton('right-4 top-4 sm:right-5 sm:top-5')}
        <a
          href={`/work/${project.slug}`}
          onClick={handleClick}
          className="apple-card group grid grid-cols-1 items-stretch overflow-hidden rounded-[28px] lg:grid-cols-12"
        >
          <div className="order-2 flex flex-col justify-between p-8 sm:p-10 lg:order-1 lg:col-span-5 lg:p-12">
            <div>
              <div className="type-footnote flex flex-wrap items-center gap-x-2 font-semibold text-[var(--apple-label-secondary)]">
                <span>{project.category}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{project.year}</span>
              </div>

              <h3 className="type-title-2 mt-3">
                {project.title}
              </h3>

              <p className="type-body mt-4">
                {project.shortDescription}
              </p>
            </div>

            <div className="mt-10 border-t border-[var(--apple-separator-subtle)] pt-6">
              <p className="type-footnote text-[var(--apple-label-tertiary)]">{project.role}</p>
              <span className="type-callout mt-2.5 inline-flex items-center gap-1 font-medium text-[var(--apple-link)]">
                <span className="group-hover:underline">View case study</span>
                <SFChevronRight
                  size={15}
                  className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
                />
              </span>
            </div>
          </div>

          <div className="order-1 lg:order-2 lg:col-span-7">
            {renderMedia('aspect-[16/10] lg:h-full lg:min-h-[430px] lg:aspect-auto')}
          </div>
        </a>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT_REVEAL}
      transition={{ duration: 0.54, delay: Math.min(index * 0.04, 0.12), ease: EASE_APPLE }}
      className="relative h-full"
    >
      {renderShortlistButton('right-4 top-4')}
      <a
        href={`/work/${project.slug}`}
        onClick={handleClick}
        className="apple-card group flex h-full flex-col overflow-hidden rounded-[28px]"
      >
        {renderMedia(mediaClassName)}

        <div className="flex flex-1 flex-col justify-between p-7 sm:p-9">
          <div>
            <div className="type-caption flex flex-wrap items-center gap-x-2 text-[var(--apple-label-secondary)]">
              <span>{project.category}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{project.year}</span>
            </div>

            <h3 className="type-title-3 mt-2.5">
              {project.title}
            </h3>

            <p className="type-callout mt-3">
              {project.shortDescription}
            </p>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-[var(--apple-separator-subtle)] pt-5">
            <span className="type-footnote font-normal text-[var(--apple-label-tertiary)]">
              {project.role}
            </span>
            <span className="type-callout inline-flex items-center gap-0.5 font-medium text-[var(--apple-link)]">
              <span className="group-hover:underline">Read</span>
              <SFChevronRight
                size={14}
                className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5"
              />
            </span>
          </div>
        </div>
      </a>
    </motion.article>
  );
}
