import {
  getVerifiedTestimonials,
  type TestimonialEntry,
} from '../data/testimonials';

interface TestimonialsSectionProps {
  entries: readonly TestimonialEntry[];
  /** Optional case study slug to filter project-specific recommendations */
  projectSlug?: string;
  /** Heading copy override */
  eyebrow?: string;
  heading?: string;
  /**
   * Internal workshop preview flag. NEVER pass true on public pages.
   * Allows /design-system to evaluate layout structure without publishing
   * fabricated quotes or unverified names to the public portfolio.
   */
  workshopPreview?: boolean;
}

const WORKSHOP_SPECIMEN_ENTRIES: readonly TestimonialEntry[] = [
  {
    id: 'specimen-layout-1',
    quote:
      'Sample layout specimen illustrating typographic measure, line height, and unboxed attribution for verified recommendations. Public testimonials remain hidden until genuine quotes are added to src/data/testimonials.ts.',
    authorName: '[Verified Collaborator Name]',
    role: '[Role / Title]',
    organization: '[Organization]',
    context: 'Sample Project Context',
    verified: true,
  },
  {
    id: 'specimen-layout-2',
    quote:
      'Second specimen slot demonstrating balanced two-column cadence, surface contrast, and light/dark legibility across desktop and mobile breakpoints without decorative avatars or card clutter.',
    authorName: '[Verified Client or Teammate]',
    role: '[Role / Title]',
    organization: '[Organization]',
    context: 'Sample Collaboration Scope',
    verified: true,
  },
];

/**
 * Editorial Testimonials & Recommendations presentation (P1.10).
 *
 * Public guardrail: returns null completely whenever zero verified entries
 * exist—never displays an empty section, placeholder quote, or invented name
 * on the public website.
 */
export function TestimonialsSection({
  entries,
  projectSlug,
  eyebrow = 'Recommendations',
  heading = 'Notes from collaborators.',
  workshopPreview = false,
}: TestimonialsSectionProps) {
  const verifiedEntries = workshopPreview
    ? WORKSHOP_SPECIMEN_ENTRIES
    : getVerifiedTestimonials(entries, projectSlug);

  if (verifiedEntries.length === 0) {
    return null;
  }

  const singleColumn = verifiedEntries.length === 1;

  return (
    <section
      aria-labelledby={
        workshopPreview
          ? 'workshop-testimonials-specimen-heading'
          : 'testimonials-section-heading'
      }
      className={
        workshopPreview
          ? 'rounded-[24px] bg-[var(--apple-bg)] p-6 sm:p-8'
          : 'bg-[var(--apple-bg)] py-24 sm:py-32'
      }
    >
      <div className={workshopPreview ? '' : 'mx-auto max-w-[1160px] px-5 sm:px-8'}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="type-eyebrow text-[var(--apple-label-secondary)]">
              {workshopPreview ? 'Not Live · Layout Specimen Only' : eyebrow}
            </p>
            <h2
              id={
                workshopPreview
                  ? 'workshop-testimonials-specimen-heading'
                  : 'testimonials-section-heading'
              }
              className={
                workshopPreview
                  ? 'type-title-3 mt-1.5'
                  : 'type-title-2 measure-title mt-2.5'
              }
            >
              {heading}
            </h2>
          </div>

          {workshopPreview && (
            <p className="type-caption text-[var(--apple-label-tertiary)]">
              Hidden publicly while verified entries = 0
            </p>
          )}
        </div>

        <div
          className={`mt-10 grid grid-cols-1 gap-6 ${
            singleColumn ? 'max-w-[760px]' : 'md:grid-cols-2 lg:gap-8'
          }`}
        >
          {verifiedEntries.map((item) => (
            <figure
              key={item.id}
              className="flex flex-col justify-between rounded-[26px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-7 sm:p-8"
            >
              <blockquote className="font-display measure-lead text-[19px] font-medium leading-[1.48] tracking-[-0.018em] text-[var(--apple-label-primary)] sm:text-[20px]">
                “{item.quote}”
              </blockquote>

              <figcaption className="mt-7 border-t border-[var(--apple-separator)] pt-5">
                <p className="type-headline text-[15px] text-[var(--apple-label-primary)]">
                  {item.authorName}
                </p>
                <p className="type-footnote mt-0.5 font-normal text-[var(--apple-label-secondary)]">
                  <span>{item.role}</span>
                  <span className="mx-1.5 text-[var(--apple-label-tertiary)]" aria-hidden="true">
                    ·
                  </span>
                  <span>{item.organization}</span>
                  {item.context && (
                    <>
                      <span
                        className="mx-1.5 text-[var(--apple-label-tertiary)]"
                        aria-hidden="true"
                      >
                        ·
                      </span>
                      <span className="text-[var(--apple-label-tertiary)]">
                        {item.context}
                      </span>
                    </>
                  )}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
