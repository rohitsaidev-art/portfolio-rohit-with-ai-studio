import { useMemo } from 'react';
import { auditThemeContrast } from '../../utils/a11yContrast';
import type { ResolvedTheme } from '../../utils/appearance';
import {
  COLOR_TOKENS,
  ELEVATION_LEVELS,
  FOUNDATION_GAPS,
  RADIUS_SCALE,
  SPACING_SCALE,
  TYPOGRAPHY_STYLES,
} from '../../utils/foundationsCatalog';
import type { TocVariant } from '../../utils/portfolio';
import { playTick } from '../../utils/soundEngine';
import {
  STUDIO_NAV_GROUPS,
  getAllStudioDestinations,
} from '../../utils/studioNavigation';
import type { DecisionLogEntry, VisualPaletteId } from '../../utils/workshopStore';
import { SFChevronRight } from '../SFSymbols';
import { CopyTokenButton } from './FoundationDocPrimitives';

interface StudioOverviewSectionProps {
  sandboxPalette: VisualPaletteId;
  sandboxTheme: ResolvedTheme;
  appliedTocVariant: TocVariant;
  decisionLog: readonly DecisionLogEntry[];
  onNavigate: (path: string) => void;
}

const TOC_VARIANT_LABELS: Record<TocVariant, string> = {
  'notch-rail': 'Notch Rail',
  'ios-capsule': 'iOS Capsule',
  'apple-local-nav': 'Local Ribbon',
  'macos-sidebar': 'macOS Rail',
  'tactile-scrubber': 'Detent Scrubber',
};

const DOCUMENTATION_CONTRACT = [
  { label: 'What & Why', detail: 'Architectural role and editorial intent behind every foundation decision.' },
  { label: 'Source Tokens', detail: 'Exact CSS custom properties, utility classes, and values read verbatim from src/index.css.' },
  { label: 'Live Specimens', detail: 'Interactive visual demonstrations responding to Cool/Warm, Light/Dark, and viewport switches.' },
  { label: 'Guardrails & Gaps', detail: 'Do / Don’t rules, WCAG 2.2 AA contrast verification, responsive behavior, and honest codebase gaps.' },
] as const;

export function StudioOverviewSection({
  sandboxPalette,
  sandboxTheme,
  appliedTocVariant,
  decisionLog,
  onNavigate,
}: StudioOverviewSectionProps) {
  const allDestinations = getAllStudioDestinations();
  const liveCount = allDestinations.filter((d) => d.status === 'live').length;
  const plannedCount = allDestinations.length - liveCount;
  const approvedOrPromotedCount = decisionLog.filter(
    (entry) => entry.status === 'approved' || entry.status === 'promoted',
  ).length;
  const fixedGapCount = FOUNDATION_GAPS.filter(
    (g) => g.resolution === 'fixed',
  ).length;
  const retainedGapCount = FOUNDATION_GAPS.length - fixedGapCount;

  const contrastSummary = useMemo(() => {
    const checks = auditThemeContrast();
    const passing = checks.filter((c) => c.passesAA).length;
    return { total: checks.length, passing };
  }, []);

  const handleLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    path: string,
  ) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    playTick();
    onNavigate(path);
  };

  return (
    <div className="space-y-14">
      {/* 1. Compact Editorial System Telemetry Strip */}
      <section aria-label="Studio workspace state">
        <dl className="grid grid-cols-2 gap-x-8 gap-y-6 border-b border-[var(--apple-separator)] pb-10 sm:grid-cols-4">
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]">
              Active Sandbox
            </dt>
            <dd className="mt-1.5 text-[15px] font-semibold tracking-[-0.015em] text-[var(--apple-label-primary)]">
              {sandboxPalette === 'cool' ? 'Cool Neutral' : 'Warm Neutral'}
            </dd>
            <p className="mt-0.5 text-[12.5px] text-[var(--apple-label-secondary)]">
              {sandboxTheme === 'light' ? 'Light appearance' : 'Dark appearance'} · Isolated
            </p>
          </div>

          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]">
              WCAG 2.2 AA Contrast
            </dt>
            <dd className="mt-1.5 tabular-nums text-[15px] font-semibold tracking-[-0.015em] text-[var(--apple-label-primary)]">
              {contrastSummary.passing}/{contrastSummary.total} verified
            </dd>
            <p className="mt-0.5 text-[12.5px] text-[var(--apple-label-secondary)]">
              4 theme matrices ≥ 4.5:1
            </p>
          </div>

          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]">
              Active Case Study TOC
            </dt>
            <dd className="mt-1.5 text-[15px] font-semibold tracking-[-0.015em] text-[var(--apple-label-primary)]">
              {TOC_VARIANT_LABELS[appliedTocVariant]}
            </dd>
            <p className="mt-0.5 text-[12.5px] text-[var(--apple-label-secondary)]">
              {liveCount} live · {plannedCount} planned routes
            </p>
          </div>

          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]">
              Decision Log &amp; Audit
            </dt>
            <dd className="mt-1.5 tabular-nums text-[15px] font-semibold tracking-[-0.015em] text-[var(--apple-label-primary)]">
              {decisionLog.length}{' '}
              {decisionLog.length === 1 ? 'record' : 'records'}
            </dd>
            <p className="mt-0.5 tabular-nums text-[12.5px] text-[var(--apple-label-secondary)]">
              {approvedOrPromotedCount} approved · {fixedGapCount} fixed, {retainedGapCount} retained
            </p>
          </div>
        </dl>
      </section>

      {/* 2. Foundations Composition Specimen (Live Sandbox Preview) */}
      <section aria-labelledby="studio-foundations-primer-heading">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          <div className="space-y-4 lg:col-span-5">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-link)]">
              Foundations Primer
            </p>
            <h2
              id="studio-foundations-primer-heading"
              className="type-title-2 text-[var(--apple-label-primary)]"
            >
              Calm restraint built from four linked layers.
            </h2>
            <p className="type-callout text-[var(--apple-label-secondary)]">
              Every public portfolio view composes from the same four foundation pillars: calibrated surface &amp; ink contrast, optical SF Pro typography, 4px editorial rhythm inside a 1160px shell, and subtle physical elevation.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <CopyTokenButton value="var(--apple-bg)" label="--apple-bg" compact />
              <CopyTokenButton
                value="var(--apple-label-primary)"
                label="--apple-label-primary"
                compact
              />
              <CopyTokenButton value="type-title-2" label=".type-title-2" compact />
              <CopyTokenButton value="measure-prose" label=".measure-prose" compact />
            </div>
          </div>

          <div
            data-ds-sandbox="true"
            data-ds-palette={sandboxPalette}
            data-ds-theme={sandboxTheme}
            className="rounded-[24px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-6 sm:p-8 lg:col-span-7"
          >
            <div className="flex items-center justify-between text-[11.5px] text-[var(--apple-label-tertiary)]">
              <span className="font-mono">
                Live Composition · {sandboxPalette} / {sandboxTheme}
              </span>
              <span className="font-mono">1160px shell · 60ch prose</span>
            </div>

            <div className="apple-card-static mt-4 rounded-[20px] p-6">
              <p className="type-caption text-[var(--apple-link)]">
                01 · Foundations Working Together
              </p>
              <h3 className="type-title-3 mt-1.5 text-[var(--apple-label-primary)]">
                Hierarchy through luminance, scale, and negative space.
              </h3>
              <p className="type-body measure-prose mt-3 text-[var(--apple-label-secondary)]">
                Switch Cool/Warm or Light/Dark in the Studio header above to verify how canvas stepping, secondary reading ink, hairline dividers, and Apple Blue actions stay balanced together.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--apple-separator-subtle)] pt-4">
                <a
                  href="/design-system/colour-themes"
                  onClick={(e) => handleLinkClick(e, '/design-system/colour-themes')}
                  className="apple-link inline-flex items-center gap-1 text-[13.5px] font-medium text-[var(--apple-link)] hover:underline"
                >
                  <span>Explore Colour &amp; Themes</span>
                  <SFChevronRight size={13} />
                </a>
                <span className="font-mono text-[11px] tabular-nums text-[var(--apple-label-tertiary)]">
                  {COLOR_TOKENS.length} colours · {TYPOGRAPHY_STYLES.length} type styles · {SPACING_SCALE.length} steps · {RADIUS_SCALE.length} radii · {ELEVATION_LEVELS.length} shadows
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Shared Documentation Standard */}
      <section
        aria-labelledby="studio-doc-standard-heading"
        className="border-t border-[var(--apple-separator)] pt-12"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2
              id="studio-doc-standard-heading"
              className="type-title-3 text-[var(--apple-label-primary)]"
            >
              Documentation Standard
            </h2>
            <p className="mt-1.5 text-[13.5px] leading-[1.52] text-[var(--apple-label-secondary)]">
              All five Foundations pages follow one predictable structure so engineers and designers can inspect, copy, and apply tokens without guesswork.
            </p>
          </div>
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-8">
            {DOCUMENTATION_CONTRACT.map((item) => (
              <div
                key={item.label}
                className="border-t border-[var(--apple-separator-subtle)] pt-3.5"
              >
                <dt className="text-[13.5px] font-semibold text-[var(--apple-label-primary)]">
                  {item.label}
                </dt>
                <dd className="mt-1 text-[13px] leading-[1.52] text-[var(--apple-label-secondary)]">
                  {item.detail}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 4. Editorial Directory of All 5 Domains */}
      <section
        aria-labelledby="studio-directory-heading"
        className="space-y-10 border-t border-[var(--apple-separator)] pt-12"
      >
        <div>
          <h2
            id="studio-directory-heading"
            className="type-title-3 text-[var(--apple-label-primary)]"
          >
            Architecture Directory
          </h2>
          <p className="mt-1 max-w-[60ch] text-[13.5px] text-[var(--apple-label-secondary)]">
            Every live Studio reference and exploration lab mapped into its permanent domain. Upcoming Cycle 2 destinations remain transparently marked as planned.
          </p>
        </div>

        <div className="space-y-10">
          {STUDIO_NAV_GROUPS.map((group) => {
            const visibleItems = group.items.filter(
              (item) => item.id !== 'overview',
            );
            return (
              <div key={group.id}>
                <div className="mb-2 flex items-baseline justify-between border-b border-[var(--apple-separator)] pb-2">
                  <h3 className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[var(--apple-label-tertiary)]">
                    {group.label}
                  </h3>
                  <span className="tabular-nums text-[11.5px] text-[var(--apple-label-tertiary)]">
                    {visibleItems.filter((i) => i.status === 'live').length}/
                    {visibleItems.length} available
                  </span>
                </div>

                <ul className="divide-y divide-[var(--apple-separator-subtle)]">
                  {visibleItems.map((item) => {
                    const isPlanned = item.status === 'planned';
                    return (
                      <li key={item.id}>
                        <a
                          href={item.path}
                          onClick={(e) => handleLinkClick(e, item.path)}
                          className="apple-link group -mx-3 flex items-start justify-between gap-4 rounded-[12px] px-3 py-3.5 transition-colors hover:bg-[var(--apple-bg-secondary)]"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                              <span
                                className={`text-[15px] font-medium tracking-[-0.015em] ${
                                  isPlanned
                                    ? 'text-[var(--apple-label-secondary)] group-hover:text-[var(--apple-label-primary)]'
                                    : 'text-[var(--apple-label-primary)] group-hover:text-[var(--apple-link)]'
                                }`}
                              >
                                {item.label}
                              </span>
                              {item.migratedModules && (
                                <span className="text-[12px] text-[var(--apple-label-tertiary)]">
                                  {item.migratedModules}
                                </span>
                              )}
                            </div>
                            <p className="mt-1 max-w-[66ch] text-[13.5px] leading-[1.48] text-[var(--apple-label-secondary)]">
                              {item.description}
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-2 pt-0.5">
                            <span
                              className={`text-[12px] ${
                                isPlanned
                                  ? 'text-[var(--apple-label-tertiary)]'
                                  : 'font-medium text-[var(--apple-label-secondary)]'
                              }`}
                            >
                              {isPlanned ? 'Planned' : 'Available'}
                            </span>
                            <SFChevronRight
                              size={13}
                              className="text-[var(--apple-label-tertiary)] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[var(--apple-label-primary)]"
                            />
                          </div>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Transparent Foundations Audit & Resolution Summary */}
      <section
        aria-labelledby="studio-gap-summary-heading"
        className="border-t border-[var(--apple-separator)] pt-12"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]">
              Foundation Audit · Stage 2.5
            </p>
            <h2
              id="studio-gap-summary-heading"
              className="type-title-3 mt-1 text-[var(--apple-label-primary)]"
            >
              {fixedGapCount} Gaps Resolved · {retainedGapCount} Conventions Retained
            </h2>
          </div>
          <p className="text-[12.5px] text-[var(--apple-label-tertiary)]">
            Full audit rationale appears on each destination page
          </p>
        </div>

        <ul className="mt-5 divide-y divide-[var(--apple-separator-subtle)] border-y border-[var(--apple-separator)]">
          {FOUNDATION_GAPS.map((gap) => (
            <li
              key={gap.id}
              className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
            >
              <a
                href={`/design-system/${gap.domain}`}
                onClick={(e) =>
                  handleLinkClick(e, `/design-system/${gap.domain}`)
                }
                className="apple-link text-[13.5px] font-medium text-[var(--apple-label-primary)] hover:text-[var(--apple-link)] hover:underline"
              >
                {gap.title}
              </a>
              <div className="flex shrink-0 items-center gap-3">
                <span
                  className={`text-[11.5px] font-semibold ${
                    gap.resolution === 'fixed'
                      ? 'text-[var(--apple-success)]'
                      : 'text-[var(--apple-label-tertiary)]'
                  }`}
                >
                  {gap.resolution === 'fixed' ? 'Resolved' : 'Retained'}
                </span>
                <span className="font-mono text-[11.5px] text-[var(--apple-label-tertiary)]">
                  /design-system/{gap.domain}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 6. Workspace Scope Note */}
      <section
        aria-label="Studio workspace scope"
        className="border-t border-[var(--apple-separator)] pt-8"
      >
        <p className="max-w-[66ch] text-[13px] leading-[1.55] text-[var(--apple-label-secondary)]">
          Portfolio Studio is directly accessible from global navigation at{' '}
          <code className="font-mono text-[12px]">/design-system</code> while
          staying excluded from search indexing (
          <code className="font-mono text-[12px]">noindex, nofollow</code>) and
          the public sitemap. Sandbox theme and palette controls remain isolated
          to Studio previews.
        </p>
      </section>
    </div>
  );
}
