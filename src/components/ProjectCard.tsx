import { useState } from 'react';
import { motion } from 'motion/react';
import type { CaseStudyProject } from '../data/projects';
import { EASE_APPLE, VIEWPORT_REVEAL } from '../utils/motion';
import { AnimatedArrowUpRightIcon } from './icons/AnimatedLucide';

export type ProjectCardVariant = 'featured' | 'standard' | 'wide' | 'rail';

interface ProjectCardProps {
  project: CaseStudyProject;
  onNavigate: (path: string) => void;
  variant?: ProjectCardVariant;
  index?: number;
  mediaClassName?: string;
  cardClassName?: string;
  showcaseScale?: boolean;
  isClone?: boolean;
  disableScrollReveal?: boolean;
  eagerImage?: boolean;
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
  mediaClassName,
  cardClassName,
  showcaseScale = false,
  isClone = false,
  disableScrollReveal = false,
  eagerImage = false,
}: ProjectCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dims = IMAGE_DIMENSIONS[project.slug] ?? { width: 1200, height: 896 };

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    onNavigate(`/work/${project.slug}`);
  };

  const handleMouseEnter = () => {
    if (
      typeof window !== 'undefined' &&
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    ) {
      return;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Combine Industry cleanly as the lead pill followed by case study tags (matching reference layout)
  const pillItems = [project.industry, ...project.tags];
  const isLargeHeroCard =
    variant === 'rail' || variant === 'featured' || variant === 'wide';

  const renderBackdropMedia = (eagerOverride?: boolean) => (
    <>
      {!imageError ? (
        <img
          src={project.coverImage}
          alt={isClone ? '' : project.coverAlt}
          width={dims.width}
          height={dims.height}
          decoding="async"
          fetchPriority={!isClone && index === 0 ? 'high' : undefined}
          referrerPolicy="no-referrer"
          loading={eagerOverride || eagerImage || index < 2 ? 'eager' : 'lazy'}
          draggable={false}
          onError={() => setImageError(true)}
          className="absolute inset-0 h-full w-full scale-[1.01] select-none object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
        />
      ) : (
        <div className="absolute inset-0 bg-[var(--apple-bg-secondary)]" />
      )}

      {/* Atmospheric gradient scrim keeping top photo luminous and bottom editorial type WCAG-crisp */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(10, 10, 12, 0.05) 0%, rgba(10, 10, 12, 0.16) 38%, rgba(10, 10, 12, 0.68) 72%, rgba(10, 10, 12, 0.88) 100%)',
        }}
      />
    </>
  );

  const renderArrowBadge = (compact = false) => (
    <span
      aria-hidden="true"
      className={`project-card-arrow-badge pointer-events-none absolute z-10 inline-flex items-center justify-center rounded-full bg-white text-[#141416] shadow-[0_6px_20px_rgba(0,0,0,0.22)] ${
        compact
          ? 'right-4 top-4 h-9 w-9'
          : 'right-5 top-5 h-10 w-10 sm:right-6 sm:top-6 sm:h-11 sm:w-11'
      }`}
    >
      <AnimatedArrowUpRightIcon
        size={compact ? 16 : 18}
        strokeWidth={1.9}
        active={isHovered}
      />
    </span>
  );

  const renderOutlinedPills = (compact = false) => (
    <div
      className={`flex flex-wrap items-center ${
        compact ? 'mt-3.5 gap-1.5' : 'mt-4 gap-2 sm:mt-5'
      }`}
    >
      {pillItems.map((label) => (
        <span
          key={label}
          className={`inline-flex items-center whitespace-nowrap rounded-full border border-white/45 bg-black/30 font-mono font-medium uppercase tracking-[0.08em] text-white/95 backdrop-blur-[8px] ${
            compact
              ? 'px-2.5 py-1 text-[9.5px] leading-none'
              : 'px-3.5 py-1.5 text-[10.5px] leading-none sm:text-[11px]'
          }`}
        >
          {label}
        </span>
      ))}
    </div>
  );

  if (variant === 'rail') {
    return (
      <article
        className="relative h-full"
        aria-hidden={isClone ? 'true' : undefined}
      >
        <a
          href={`/work/${project.slug}`}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onFocus={() => setIsHovered(true)}
          onBlur={() => setIsHovered(false)}
          tabIndex={isClone ? -1 : undefined}
          draggable={false}
          aria-label={`Open ${project.title} case study`}
          className="rail-project-card group relative flex aspect-[16/11] w-full flex-col justify-end overflow-hidden rounded-[22px] bg-[var(--apple-bg-secondary)] shadow-none sm:aspect-[16/10] lg:aspect-[16/9.4] lg:max-h-[560px]"
        >
          {renderBackdropMedia(true)}
          {renderArrowBadge(false)}

          {/* Foreground editorial overlay */}
          <div className="relative z-10 flex flex-col justify-end gap-5 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between lg:gap-10 lg:p-9">
            <div className="min-w-0 max-w-[520px]">
              <h3 className="font-display text-[26px] font-semibold leading-[1.1] tracking-[-0.028em] text-white sm:text-[32px] lg:text-[38px]">
                {project.title}
              </h3>

              <p className="mt-2 truncate text-[15px] font-medium leading-[1.38] tracking-[-0.012em] text-white/90 sm:text-[17px]">
                {project.cardSummary}
              </p>

              {renderOutlinedPills(false)}
            </div>

            {/* Bottom-right translucent editorial note panel matching reference composition */}
            <div className="hidden max-w-[380px] shrink-0 rounded-[18px] border border-white/12 bg-black/58 p-5 backdrop-blur-md lg:block">
              <p className="text-[14px] font-normal leading-[1.52] tracking-[-0.008em] text-white/92">
                {project.challenge.highlightStatement}
              </p>
              <p className="mt-3.5 text-[12.5px] font-medium tracking-[-0.006em] text-white/62">
                {project.platform} · {project.year}
              </p>
            </div>
          </div>
        </a>
      </article>
    );
  }

  if (isLargeHeroCard) {
    return (
      <motion.article
        initial={disableScrollReveal ? false : { opacity: 0, y: 16 }}
        whileInView={disableScrollReveal ? undefined : { opacity: 1, y: 0 }}
        viewport={disableScrollReveal ? undefined : VIEWPORT_REVEAL}
        transition={{ duration: 0.56, ease: EASE_APPLE }}
        className="relative"
      >
        <a
          href={`/work/${project.slug}`}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onFocus={() => setIsHovered(true)}
          onBlur={() => setIsHovered(false)}
          aria-label={`Open ${project.title} case study`}
          className="rail-project-card group relative flex aspect-[16/11] w-full flex-col justify-end overflow-hidden rounded-[22px] bg-[var(--apple-bg-secondary)] shadow-none sm:aspect-[16/9.5] lg:max-h-[540px]"
        >
          {renderBackdropMedia(false)}
          {renderArrowBadge(false)}

          <div className="relative z-10 flex flex-col justify-end gap-5 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between lg:gap-10 lg:p-9">
            <div className="min-w-0 max-w-[520px]">
              <h3 className="font-display text-[26px] font-semibold leading-[1.1] tracking-[-0.028em] text-white sm:text-[32px] lg:text-[36px]">
                {project.title}
              </h3>

              <p className="mt-2 truncate text-[15px] font-medium leading-[1.38] tracking-[-0.012em] text-white/90 sm:text-[17px]">
                {project.cardSummary}
              </p>

              {renderOutlinedPills(false)}
            </div>

            <div className="hidden max-w-[380px] shrink-0 rounded-[18px] border border-white/12 bg-black/58 p-5 backdrop-blur-md lg:block">
              <p className="text-[14px] font-normal leading-[1.52] tracking-[-0.008em] text-white/92">
                {project.challenge.highlightStatement}
              </p>
              <p className="mt-3.5 text-[12.5px] font-medium tracking-[-0.006em] text-white/62">
                {project.platform} · {project.year}
              </p>
            </div>
          </div>
        </a>
      </motion.article>
    );
  }

  const standardCardContent = (
    <a
      href={`/work/${project.slug}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      aria-label={`Open ${project.title} case study`}
      className={`rail-project-card group relative flex w-full flex-col justify-end overflow-hidden bg-[var(--apple-bg-secondary)] shadow-none ${
        cardClassName ? cardClassName : 'rounded-[20px]'
      } ${
        mediaClassName
          ? mediaClassName
          : 'aspect-[4/3.6]'
      }`}
    >
      {renderBackdropMedia(false)}
      {renderArrowBadge(!showcaseScale)}

      <div className={showcaseScale ? 'relative z-10 p-6 sm:p-7' : 'relative z-10 p-5 sm:p-6'}>
        <h3
          className={`font-display font-semibold leading-[1.12] tracking-[-0.026em] text-white ${
            showcaseScale
              ? 'text-[24px] sm:text-[28px]'
              : 'text-[22px] sm:text-[24px]'
          }`}
        >
          {project.title}
        </h3>

        <p
          className={`mt-1.5 truncate font-medium leading-[1.4] tracking-[-0.01em] text-white/90 ${
            showcaseScale ? 'text-[14.5px] sm:text-[15.5px]' : 'text-[14px]'
          }`}
        >
          {project.cardSummary}
        </p>

        {renderOutlinedPills(!showcaseScale)}
      </div>
    </a>
  );

  if (disableScrollReveal) {
    return <article className="relative h-full">{standardCardContent}</article>;
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT_REVEAL}
      transition={{
        duration: 0.54,
        delay: Math.min(index * 0.04, 0.12),
        ease: EASE_APPLE,
      }}
      className="relative h-full"
    >
      {standardCardContent}
    </motion.article>
  );
}
