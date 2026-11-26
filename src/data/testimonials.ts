export interface TestimonialEntry {
  id: string;
  quote: string;
  authorName: string;
  role: string;
  organization: string;
  /** Optional context such as project or collaboration scope */
  context?: string;
  /** Optional case study slug for project-scoped placement */
  projectSlug?: string;
  /** Only entries explicitly marked verified: true are eligible for public display */
  verified: boolean;
}

/**
 * Public verified testimonials and recommendations.
 *
 * Intentionally empty until genuine, verified recommendations from real
 * clients, founders, or teammates are supplied by the portfolio owner.
 * Never add fabricated quotes, names, job titles, or company affiliations here.
 */
export const VERIFIED_TESTIMONIALS: readonly TestimonialEntry[] = [];

/**
 * Returns only verified testimonials with complete attribution.
 * Guarantees incomplete or unverified entries never appear publicly.
 */
export function getVerifiedTestimonials(
  entries: readonly TestimonialEntry[],
  projectSlug?: string,
): TestimonialEntry[] {
  return entries.filter((entry) => {
    if (!entry.verified) return false;
    if (
      !entry.quote.trim() ||
      !entry.authorName.trim() ||
      !entry.role.trim() ||
      !entry.organization.trim()
    ) {
      return false;
    }
    if (projectSlug) {
      return entry.projectSlug?.toLowerCase() === projectSlug.trim().toLowerCase();
    }
    return true;
  });
}
