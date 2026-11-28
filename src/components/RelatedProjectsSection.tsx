import type { CaseStudyProject } from '../data/projects';
import type { RelatedProjectRecommendation } from '../utils/portfolio';
import { ChevronRight } from 'lucide-react';

interface RelatedProjectsSectionProps {
  recommendations: readonly RelatedProjectRecommendation<CaseStudyProject>[];
  onNavigate: (path: string) => void;
}

/**
 * Contextually relevant project recommendations displayed at the end of a case
 * study above Previous / Next navigation (P1.11).
 */
export function RelatedProjectsSection({
  recommendations,
  onNavigate,
}: RelatedProjectsSectionProps) {
  if (recommendations.length === 0) return null;

  const handleClick = (
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
    <section
      aria-labelledby="related-projects-heading"
      className="mt-24 border-t border-[var(--apple-separator)] pt-16"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="type-eyebrow text-[var(--apple-label-secondary)]">
            Related Case Studies
          </p>
          <h2
            id="related-projects-heading"
            className="type-title-2 measure-title mt-2"
          >
            Continue exploring similar work.
          </h2>
        </div>
      </div>

      <div className="mt-9 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-7">
        {recommendations.map(({ project, reason }) => {
          const href = `/work/${project.slug}`;
          return (
            <a
              key={project.slug}
              href={href}
              onClick={(e) => handleClick(e, href)}
              className="apple-card group flex flex-col overflow-hidden rounded-[20px]"
            >
              <div className="aspect-[16/10] w-full overflow-hidden bg-[var(--apple-bg-secondary)]">
                <img
                  src={project.coverImage}
                  alt={project.coverAlt}
                  width={
                    project.slug === 'stallsync' || project.slug === 'mycroharvest'
                      ? 1376
                      : 1200
                  }
                  height={
                    project.slug === 'stallsync' || project.slug === 'mycroharvest'
                      ? 768
                      : 896
                  }
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                />
              </div>

              <div className="flex flex-1 flex-col justify-between p-6 sm:p-7">
                <div>
                  <p className="type-caption flex flex-wrap items-center gap-x-2 text-[var(--apple-label-tertiary)]">
                    <span className="text-[var(--apple-link)]">{reason}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{project.year}</span>
                  </p>
                  <h3 className="type-title-3 mt-2 transition-colors duration-200 group-hover:text-[var(--apple-link)]">
                    {project.title}
                  </h3>
                  <p className="type-callout mt-2 line-clamp-2">
                    {project.shortDescription}
                  </p>
                </div>

                <div className="mt-5 inline-flex items-center gap-1 text-[14px] font-medium tracking-[-0.012em] text-[var(--apple-link)]">
                  <span className="group-hover:underline">Read case study</span>
                  <ChevronRight
                    size={14}
                    strokeWidth={1.75}
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
