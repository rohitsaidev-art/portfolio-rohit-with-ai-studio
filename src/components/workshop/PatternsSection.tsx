import { useMemo, useState } from 'react';
import { PROJECTS } from '../../data/projects';
import { SITE_CONFIG } from '../../data/site';
import type { ResolvedTheme } from '../../utils/appearance';
import { getRelatedProjects } from '../../utils/portfolio';
import { playTick } from '../../utils/soundEngine';
import {
  PATTERN_LIBRARY_ITEMS,
  type PatternMaturity,
  type StudioPatternSpec,
} from '../../utils/studioLibraryCatalog';
import { showToast } from '../../utils/toast';
import type { VisualPaletteId } from '../../utils/workshopStore';
import { AudioPlayer } from '../AudioPlayer';
import { BeforeAfterComparator } from '../BeforeAfterComparator';
import { Breadcrumbs } from '../Breadcrumbs';
import { LocalTimeClock } from '../LocalTimeClock';
import { ProjectCreditsSection } from '../ProjectCreditsSection';
import { RelatedProjectsSection } from '../RelatedProjectsSection';
import { TestimonialsSection } from '../TestimonialsSection';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Search,
  Smartphone,
  Tablet,
  X,
} from 'lucide-react';
import { CopyTokenButton } from './FoundationDocPrimitives';

interface PatternsSectionProps {
  sandboxPalette: VisualPaletteId;
  sandboxTheme: ResolvedTheme;
}

const SAMPLE_AUDIO_SEGMENTS = [
  {
    id: 'pat-audio-1',
    num: '01',
    title: 'Project Framing',
    text: 'Case study opening balances context, role clarity, and immediate entry into the visual evidence.',
  },
];

/**
 * Lightweight miniature visual thumbnail for each of the 12 portfolio patterns,
 * using semantic --apple-* variables so every tile responds live to the sandbox theme.
 */
export function PatternMiniPreview({ id }: { id: StudioPatternSpec['id'] }) {
  switch (id) {
    case 'hero-sections':
      return (
        <div className="w-full max-w-[220px] space-y-2 text-left">
          <div className="h-1.5 w-20 rounded-full bg-[var(--apple-label-tertiary)]/40" />
          <div className="space-y-1">
            <div className="h-3 w-full rounded bg-[var(--apple-label-primary)]/85" />
            <div className="h-3 w-3/4 rounded bg-[var(--apple-label-primary)]/85" />
          </div>
          <div className="h-1.5 w-5/6 rounded-full bg-[var(--apple-label-secondary)]/35" />
          <div className="flex gap-1.5 pt-1">
            <span className="h-5 w-16 rounded-full bg-[var(--apple-blue-fill)]" />
            <span className="h-5 w-14 rounded-full border border-[var(--apple-separator-strong)] bg-[var(--apple-surface-elevated)]" />
          </div>
        </div>
      );
    case 'project-introduction':
      return (
        <div className="w-full max-w-[220px] space-y-2 text-left">
          <div className="flex items-center gap-1 text-[9.5px] text-[var(--apple-label-tertiary)]">
            <span>Work</span>
            <span>/</span>
            <span className="text-[var(--apple-label-primary)]">StallSync</span>
          </div>
          <div className="h-3 w-28 rounded bg-[var(--apple-label-primary)]/85" />
          <div className="flex items-center gap-2 rounded-full border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-2.5 py-1.5">
            <span className="h-4 w-4 rounded-full bg-[var(--apple-blue-fill)]" />
            <div className="flex flex-1 items-center gap-0.5">
              {[4, 8, 12, 7, 10, 6, 9, 5, 11, 7].map((h, i) => (
                <span
                  key={i}
                  style={{ height: `${h}px` }}
                  className={`w-1 rounded-full ${
                    i < 4 ? 'bg-[var(--apple-blue)]' : 'bg-[var(--apple-separator-strong)]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      );
    case 'project-metadata':
      return (
        <div className="grid w-full max-w-[220px] grid-cols-2 gap-2.5 border-y border-[var(--apple-separator)] py-2.5 text-left">
          {[
            ['Role', 'Lead UX'],
            ['Timeline', '8 weeks'],
            ['Year', '2026'],
            ['Type', 'Product'],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-[9px] text-[var(--apple-label-tertiary)]">{k}</p>
              <p className="text-[11px] font-medium text-[var(--apple-label-primary)]">{v}</p>
            </div>
          ))}
        </div>
      );
    case 'case-study-sections':
      return (
        <div className="w-full max-w-[220px] space-y-2 text-left">
          <div className="flex items-baseline gap-1.5 border-b border-[var(--apple-separator-subtle)] pb-1.5">
            <span className="font-mono text-[10px] text-[var(--apple-link)]">02</span>
            <span className="text-[11.5px] font-semibold text-[var(--apple-label-primary)]">
              System Architecture
            </span>
          </div>
          <div className="space-y-1">
            <div className="h-1.5 w-full rounded-full bg-[var(--apple-label-secondary)]/35" />
            <div className="h-1.5 w-11/12 rounded-full bg-[var(--apple-label-secondary)]/35" />
          </div>
          <div className="rounded-[10px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-2">
            <div className="h-1.5 w-12 rounded-full bg-[var(--apple-link)]/50" />
            <div className="mt-1 h-1.5 w-4/5 rounded-full bg-[var(--apple-label-primary)]/40" />
          </div>
        </div>
      );
    case 'image-media-sections':
      return (
        <div className="w-full max-w-[215px] space-y-1.5">
          <div className="overflow-hidden rounded-[10px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)]">
            <img
              src={PROJECTS[0].coverImage}
              alt=""
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
          <div className="flex items-center justify-between text-[9.5px] text-[var(--apple-label-tertiary)]">
            <span>Figure 01 · Plate</span>
            <span>16:9</span>
          </div>
        </div>
      );
    case 'before-after-comparisons':
      return (
        <div className="relative h-[86px] w-full max-w-[215px] overflow-hidden rounded-[12px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)]">
          <div className="absolute inset-0 flex">
            <div className="w-1/2 bg-[var(--apple-bg-secondary)] p-2 text-left">
              <span className="text-[9px] font-medium text-[var(--apple-label-tertiary)]">
                Before
              </span>
            </div>
            <div className="w-1/2 bg-[var(--apple-blue)]/10 p-2 text-right">
              <span className="text-[9px] font-medium text-[var(--apple-link)]">After</span>
            </div>
          </div>
          <div className="absolute inset-y-0 left-1/2 flex -translate-x-1/2 flex-col items-center justify-center">
            <div className="h-full w-px bg-[var(--apple-label-primary)]/60" />
            <span className="absolute flex h-6 w-6 items-center justify-center rounded-full border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] text-[9px] font-semibold text-[var(--apple-label-primary)] shadow-xs">
              ↔
            </span>
          </div>
        </div>
      );
    case 'testimonials':
      return (
        <div className="w-full max-w-[215px] rounded-[12px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-3 text-left">
          <p className="text-[11px] leading-[1.4] text-[var(--apple-label-primary)]">
            “Brought calm structure to a dense operational product.”
          </p>
          <p className="mt-2 text-[9.5px] text-[var(--apple-label-tertiary)]">
            Verified Collaborator · Role
          </p>
        </div>
      );
    case 'project-credits':
      return (
        <div className="w-full max-w-[215px] space-y-2 border-t border-[var(--apple-separator)] pt-2.5 text-left">
          <p className="text-[9.5px] font-medium text-[var(--apple-label-tertiary)]">
            Credits &amp; Tools
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <div className="h-1.5 w-14 rounded-full bg-[var(--apple-label-primary)]/65" />
              <div className="h-1.5 w-16 rounded-full bg-[var(--apple-label-secondary)]/35" />
            </div>
            <div className="space-y-1">
              <div className="h-1.5 w-12 rounded-full bg-[var(--apple-label-primary)]/65" />
              <div className="h-1.5 w-14 rounded-full bg-[var(--apple-label-secondary)]/35" />
            </div>
          </div>
        </div>
      );
    case 'related-projects':
      return (
        <div className="grid w-full max-w-[220px] grid-cols-2 gap-2">
          {[PROJECTS[1], PROJECTS[2]].map((p) => (
            <div
              key={p.slug}
              className="overflow-hidden rounded-[10px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)]"
            >
              <img src={p.coverImage} alt="" className="aspect-[16/10] w-full object-cover" />
              <p className="truncate px-2 py-1.5 text-[9.5px] font-medium text-[var(--apple-label-primary)]">
                {p.title}
              </p>
            </div>
          ))}
        </div>
      );
    case 'contact-conversion':
      return (
        <div className="grid w-full max-w-[220px] grid-cols-12 items-center gap-2">
          <div className="col-span-5 space-y-1.5 text-left">
            <div className="h-2 w-12 rounded bg-[var(--apple-label-primary)]/75" />
            <div className="h-1.5 w-16 rounded-full bg-[var(--apple-link)]/55" />
          </div>
          <div className="col-span-7 space-y-1.5 rounded-[10px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-2">
            <div className="h-4 w-full rounded-[6px] border border-[var(--apple-separator)] bg-[var(--apple-bg)]" />
            <div className="h-4 w-16 rounded-full bg-[var(--apple-blue-fill)]" />
          </div>
        </div>
      );
    case 'editorial-content':
      return (
        <div className="w-full max-w-[215px] space-y-1.5 text-left">
          <p className="text-[9.5px] text-[var(--apple-label-tertiary)]">Design Systems · 6 min</p>
          <p className="text-[12px] font-semibold leading-tight text-[var(--apple-label-primary)]">
            Why Restraint Scales Better
          </p>
          <div className="space-y-1 pt-0.5">
            <div className="h-1.5 w-full rounded-full bg-[var(--apple-label-secondary)]/35" />
            <div className="h-1.5 w-5/6 rounded-full bg-[var(--apple-label-secondary)]/35" />
          </div>
        </div>
      );
    case 'footer-patterns':
      return (
        <div className="w-full max-w-[220px] border-t border-[var(--apple-separator)] pt-2.5 text-left">
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <div className="h-2 w-10 rounded bg-[var(--apple-label-primary)]/75" />
              <div className="h-1.5 w-12 rounded-full bg-[var(--apple-label-tertiary)]/40" />
            </div>
            <div className="space-y-1">
              <div className="h-1.5 w-10 rounded-full bg-[var(--apple-label-secondary)]/45" />
              <div className="h-1.5 w-8 rounded-full bg-[var(--apple-label-secondary)]/35" />
            </div>
            <div className="space-y-1">
              <div className="h-1.5 w-12 rounded-full bg-[var(--apple-link)]/55" />
              <div className="h-1.5 w-9 rounded-full bg-[var(--apple-label-tertiary)]/35" />
            </div>
          </div>
        </div>
      );
  }
}

export function PatternsSection({
  sandboxPalette,
  sandboxTheme,
}: PatternsSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [maturityFilter, setMaturityFilter] = useState<'all' | PatternMaturity>('all');
  const [selectedId, setSelectedId] = useState<StudioPatternSpec['id'] | null>(null);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const filteredPatterns = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return PATTERN_LIBRARY_ITEMS.filter((item) => {
      if (maturityFilter !== 'all' && item.maturity !== maturityFilter) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.purpose.toLowerCase().includes(q) ||
        item.componentComposition.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, maturityFilter]);

  const activePattern = selectedId
    ? PATTERN_LIBRARY_ITEMS.find((p) => p.id === selectedId) ?? null
    : null;

  const productionCount = PATTERN_LIBRARY_ITEMS.filter(
    (p) => p.maturity === 'production',
  ).length;
  const proposedCount = PATTERN_LIBRARY_ITEMS.filter(
    (p) => p.maturity === 'proposed',
  ).length;

  const interceptPreviewNavigate = (path: string) => {
    playTick();
    showToast({ message: `Preview navigation intercepted: ${path}`, tone: 'info' });
  };

  const sampleProject = PROJECTS[0];
  const sampleRelated = useMemo(
    () => getRelatedProjects(PROJECTS, sampleProject.slug, 2),
    [sampleProject.slug],
  );

  const previewMaxWidth =
    viewport === 'mobile' ? '375px' : viewport === 'tablet' ? '680px' : '100%';

  const renderPatternSpecimen = (pattern: StudioPatternSpec) => {
    switch (pattern.id) {
      case 'hero-sections':
        return (
          <div className="space-y-4 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-[var(--apple-label-tertiary)]">
              <span>UX &amp; Product Designer · Independent Practice</span>
              <LocalTimeClock />
            </div>
            <h4 className="font-display max-w-[20ch] text-[30px] font-semibold leading-[1.08] tracking-[-0.036em] text-[var(--apple-label-primary)] sm:text-[38px]">
              Crafting calm digital systems with enduring clarity.
            </h4>
            <p className="type-callout max-w-[54ch] text-[var(--apple-label-secondary)]">
              Partnering with early-stage teams to turn dense operational workflows into quiet, legible products.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => interceptPreviewNavigate('/#selected-work')}
                className="apple-btn-primary !min-h-[38px] !px-4 !text-[13px]"
              >
                Explore Selected Work
              </button>
              <button
                type="button"
                onClick={() => interceptPreviewNavigate('/contact')}
                className="apple-btn-outline !min-h-[38px] !px-4 !text-[13px]"
              >
                Get in Touch
              </button>
            </div>
          </div>
        );

      case 'project-introduction':
        return (
          <div className="space-y-4">
            <Breadcrumbs
              items={[
                { label: 'Work', href: '/' },
                { label: sampleProject.title },
              ]}
              onNavigate={interceptPreviewNavigate}
            />
            <div>
              <p className="text-[12px] font-medium text-[var(--apple-link)]">
                {sampleProject.category} · {sampleProject.year}
              </p>
              <h4 className="type-title-2 mt-1 text-[var(--apple-label-primary)]">
                {sampleProject.title}
              </h4>
              <p className="type-callout measure-prose mt-1.5 text-[var(--apple-label-secondary)]">
                {sampleProject.tagline}
              </p>
            </div>
            <AudioPlayer
              title={`${sampleProject.title} · Audio Summary`}
              segments={SAMPLE_AUDIO_SEGMENTS}
            />
          </div>
        );

      case 'project-metadata':
        return (
          <dl className="grid grid-cols-2 gap-6 border-y border-[var(--apple-separator)] py-5 md:grid-cols-4">
            <div>
              <dt className="text-[12px] text-[var(--apple-label-tertiary)]">Role</dt>
              <dd className="mt-1 text-[14px] font-medium text-[var(--apple-label-primary)]">
                {sampleProject.role}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] text-[var(--apple-label-tertiary)]">Timeline</dt>
              <dd className="mt-1 tabular-nums text-[14px] font-medium text-[var(--apple-label-primary)]">
                {sampleProject.timeline}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] text-[var(--apple-label-tertiary)]">Year</dt>
              <dd className="mt-1 tabular-nums text-[14px] font-medium text-[var(--apple-label-primary)]">
                {sampleProject.year}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] text-[var(--apple-label-tertiary)]">Category</dt>
              <dd className="mt-1 text-[14px] font-medium text-[var(--apple-label-primary)]">
                {sampleProject.category}
              </dd>
            </div>
          </dl>
        );

      case 'case-study-sections':
        return (
          <div className="space-y-4">
            <div className="flex items-baseline gap-3 border-b border-[var(--apple-separator-subtle)] pb-3">
              <span className="font-mono text-[12px] tabular-nums text-[var(--apple-link)]">
                02
              </span>
              <h4 className="type-title-3 text-[var(--apple-label-primary)]">
                System Architecture &amp; Decision Hierarchy
              </h4>
            </div>
            <p className="type-body measure-prose text-[var(--apple-label-secondary)]">
              Body prose locks to 60ch at 17px / 1.62 line-height so readers move comfortably from analytical findings into full-width visual evidence plates.
            </p>
            <div className="rounded-[14px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-4">
              <p className="text-[12px] font-medium text-[var(--apple-label-tertiary)]">
                Key Takeaway
              </p>
              <p className="mt-1 text-[13.5px] text-[var(--apple-label-primary)]">
                Separating live queue diagnostics from secondary billing controls cut operator decision time cleanly.
              </p>
            </div>
          </div>
        );

      case 'image-media-sections':
        return (
          <figure className="space-y-2.5">
            <div className="overflow-hidden rounded-[18px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)]">
              <img
                src={sampleProject.coverImage}
                alt={sampleProject.title}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
            <figcaption className="flex items-center justify-between gap-3 text-[12.5px] text-[var(--apple-label-tertiary)]">
              <span>Figure 01 — Aspect-locked 16:9 artifact plate with Lightbox zoom.</span>
              <span className="shrink-0 font-mono text-[11px]">16:9</span>
            </figcaption>
          </figure>
        );

      case 'before-after-comparisons':
        return (
          <div className="space-y-3">
            <p className="text-[12.5px] text-[var(--apple-link)]">
              Proposed pattern — ready for future case studies once verified before/after assets are available.
            </p>
            <BeforeAfterComparator
              beforeSrc={PROJECTS[0].coverImage}
              beforeAlt="Specimen Before visual"
              beforeLabel="Before"
              afterSrc={PROJECTS[1].coverImage}
              afterAlt="Specimen After visual"
              afterLabel="After"
              caption="Drag the handle or use Left/Right arrow keys to compare."
            />
          </div>
        );

      case 'testimonials':
        return (
          <div className="space-y-2">
            <p className="text-[12.5px] text-[var(--apple-link)]">
              Proposed pattern — hidden publicly until verified collaborator quotes are added.
            </p>
            <TestimonialsSection entries={[]} workshopPreview />
          </div>
        );

      case 'project-credits':
        return (
          <div className="-mt-12">
            <ProjectCreditsSection credits={sampleProject.credits} />
          </div>
        );

      case 'related-projects':
        return (
          <div className="-mt-16">
            <RelatedProjectsSection
              recommendations={sampleRelated}
              onNavigate={interceptPreviewNavigate}
            />
          </div>
        );

      case 'contact-conversion':
        return (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
            <div className="space-y-3 md:col-span-5">
              <p className="text-[12px] font-medium text-[var(--apple-link)]">Direct Channel</p>
              <h4 className="type-title-3 text-[var(--apple-label-primary)]">
                Start a conversation.
              </h4>
              <LocalTimeClock />
              <CopyTokenButton value={SITE_CONFIG.email} label={SITE_CONFIG.email} compact />
            </div>
            <div className="space-y-3 rounded-[16px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-4 md:col-span-7">
              <input
                type="text"
                readOnly
                value="Alex Rivera"
                aria-label="Preview contact name"
                className="apple-input min-h-[38px] rounded-[10px] px-3 py-1.5 text-[13px]"
              />
              <input
                type="email"
                readOnly
                value="alex@studio.example"
                aria-label="Preview contact email"
                className="apple-input min-h-[38px] rounded-[10px] px-3 py-1.5 text-[13px]"
              />
              <button
                type="button"
                onClick={() => interceptPreviewNavigate('/contact#submit')}
                className="apple-btn-primary !min-h-[36px] !px-4 !text-[13px]"
              >
                <Check size={13} strokeWidth={2} aria-hidden="true" />
                <span>Send Inquiry</span>
              </button>
            </div>
          </div>
        );

      case 'editorial-content':
        return (
          <article className="max-w-[60ch] space-y-3">
            <p className="text-[12px] text-[var(--apple-label-tertiary)]">
              Design Systems · 6 min read
            </p>
            <h4 className="type-title-2 text-[var(--apple-label-primary)]">
              Why Restraint Scales Better Than Ornament
            </h4>
            <p className="type-body text-[var(--apple-label-secondary)]">
              Long-form notes rely on predictable typographic hierarchy, calm hairline rules, and Reader Comfort controls rather than boxed sidebars.
            </p>
            <button
              type="button"
              onClick={() => interceptPreviewNavigate('/notes')}
              className="apple-link inline-flex items-center gap-1 text-[13.5px] font-medium text-[var(--apple-link)] hover:underline"
            >
              <span>Read full note</span>
              <ChevronRight size={13} strokeWidth={2} aria-hidden="true" />
            </button>
          </article>
        );

      case 'footer-patterns':
        return (
          <div className="border-t border-[var(--apple-separator)] pt-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <p className="font-display text-[15px] font-semibold text-[var(--apple-label-primary)]">
                  {SITE_CONFIG.name}
                </p>
                <p className="mt-1 text-[13px] text-[var(--apple-label-secondary)]">
                  {SITE_CONFIG.roleTitle}
                </p>
              </div>
              <div className="space-y-1 text-[13px] text-[var(--apple-label-secondary)]">
                <p className="text-[12px] text-[var(--apple-label-tertiary)]">Navigation</p>
                <p>Work · Notes · About · Contact</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[12px] text-[var(--apple-label-tertiary)]">Local Time</p>
                <LocalTimeClock />
              </div>
            </div>
          </div>
        );
    }
  };

  /* ── Detail View ─────────────────────────────────────────────────────── */
  if (activePattern) {
    return (
      <div className="space-y-8">
        <div>
          <button
            type="button"
            onClick={() => {
              playTick();
              setSelectedId(null);
            }}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--apple-label-secondary)] transition-colors hover:text-[var(--apple-label-primary)]"
          >
            <ChevronLeft size={14} strokeWidth={1.75} aria-hidden="true" />
            <span>All Patterns</span>
          </button>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[12px] font-medium text-[var(--apple-label-tertiary)]">
                {activePattern.category}
                {activePattern.maturity === 'proposed' && (
                  <span className="ml-2 text-[var(--apple-link)]">· Proposed</span>
                )}
              </p>
              <h2 className="font-display mt-1 text-[28px] font-semibold tracking-[-0.025em] text-[var(--apple-label-primary)]">
                {activePattern.name}
              </h2>
              <p className="mt-1.5 max-w-[60ch] text-[14.5px] text-[var(--apple-label-secondary)]">
                {activePattern.purpose}
              </p>
            </div>

            <div
              className="apple-segmented shrink-0"
              role="group"
              aria-label="Pattern viewport width"
            >
              {(
                [
                  { id: 'desktop', label: 'Desktop', icon: Monitor },
                  { id: 'tablet', label: 'Tablet', icon: Tablet },
                  { id: 'mobile', label: 'Mobile', icon: Smartphone },
                ] as const
              ).map((vp) => {
                const active = viewport === vp.id;
                const Icon = vp.icon;
                return (
                  <button
                    key={vp.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      playTick();
                      setViewport(vp.id);
                    }}
                    className={`apple-segmented-item !min-h-[30px] whitespace-nowrap px-2.5 text-[12px] ${
                      active
                        ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                        : 'text-[var(--apple-label-secondary)]'
                    }`}
                  >
                    <Icon size={12} strokeWidth={2} aria-hidden="true" />
                    <span>{vp.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Isolated Sandbox Stage */}
        <div
          data-ds-sandbox="true"
          data-ds-palette={sandboxPalette}
          data-ds-theme={sandboxTheme}
          className="overflow-x-auto rounded-[20px] border border-[var(--apple-separator)] !bg-[var(--apple-bg-secondary)] p-5 sm:p-7"
        >
          <div
            style={{ maxWidth: previewMaxWidth }}
            className="mx-auto w-full rounded-[16px] border border-[var(--apple-separator-subtle)] bg-[var(--apple-bg)] p-5 transition-[max-width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:p-6"
          >
            {renderPatternSpecimen(activePattern)}
          </div>
        </div>

        {/* Concise Practical Details */}
        <div className="grid grid-cols-1 gap-8 border-t border-[var(--apple-separator)] pt-7 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <h3 className="text-[13px] font-semibold text-[var(--apple-label-primary)]">
                Built From
              </h3>
              <p className="mt-1 text-[13.5px] leading-[1.6] text-[var(--apple-label-secondary)]">
                {activePattern.componentComposition.join(' · ')}
              </p>
            </div>
            <div>
              <h3 className="text-[13px] font-semibold text-[var(--apple-label-primary)]">
                Practical Usage
              </h3>
              <p className="mt-1 text-[13.5px] leading-[1.6] text-[var(--apple-label-secondary)]">
                {activePattern.usageGuidance}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <CopyTokenButton
                value={activePattern.sourceReference}
                label={activePattern.sourceReference}
                compact
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-[13px] font-semibold text-[var(--apple-label-primary)]">
                Responsive &amp; Accessibility
              </h3>
              <p className="mt-1 text-[13.5px] leading-[1.6] text-[var(--apple-label-secondary)]">
                {activePattern.responsiveBehavior} {activePattern.accessibility}
              </p>
            </div>

            {activePattern.doDonts.length > 0 && (
              <div className="space-y-2.5 border-t border-[var(--apple-separator-subtle)] pt-4">
                {activePattern.doDonts.map((rule) => (
                  <div key={rule.doText} className="space-y-2 text-[13px]">
                    <p className="flex items-start gap-2 text-[var(--apple-label-primary)]">
                      <Check
                        size={13}
                        strokeWidth={2}
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 text-[var(--apple-link)]"
                      />
                      <span>{rule.doText}</span>
                    </p>
                    <p className="flex items-start gap-2 text-[var(--apple-label-secondary)]">
                      <X
                        size={13}
                        strokeWidth={2}
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 text-[var(--apple-error)]"
                      />
                      <span>{rule.dontText}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── Visual Gallery View (Default) ───────────────────────────────────── */
  return (
    <div className="space-y-8">
      {/* Search + Maturity Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-[360px] flex-1">
          <label htmlFor="pattern-search" className="sr-only">
            Search patterns
          </label>
          <Search
            size={14}
            strokeWidth={1.75}
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--apple-label-tertiary)]"
          />
          <input
            id="pattern-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patterns…"
            className="apple-input min-h-[38px] rounded-[12px] py-1.5 pl-9 pr-3.5 text-[13.5px]"
          />
        </div>

        <div className="apple-segmented shrink-0" role="group" aria-label="Filter patterns by status">
          {(
            [
              { id: 'all', label: `All (${PATTERN_LIBRARY_ITEMS.length})` },
              { id: 'production', label: `Production (${productionCount})` },
              { id: 'proposed', label: `Proposed (${proposedCount})` },
            ] as const
          ).map((item) => {
            const active = maturityFilter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  playTick();
                  setMaturityFilter(item.id);
                }}
                className={`apple-segmented-item !min-h-[30px] whitespace-nowrap px-3 text-[12px] ${
                  active
                    ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                    : 'text-[var(--apple-label-secondary)]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3-Column Visual Pattern Grid */}
      {filteredPatterns.length === 0 ? (
        <div className="rounded-[20px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] px-6 py-12 text-center">
          <p className="text-[14.5px] font-medium text-[var(--apple-label-primary)]">
            No patterns match “{searchQuery}”.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setMaturityFilter('all');
            }}
            className="mt-3 text-[13px] font-medium text-[var(--apple-link)] hover:underline"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div
          data-ds-sandbox="true"
          data-ds-palette={sandboxPalette}
          data-ds-theme={sandboxTheme}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filteredPatterns.map((pattern) => (
            <button
              key={pattern.id}
              type="button"
              onClick={() => {
                playTick();
                setSelectedId(pattern.id);
              }}
              className="group flex flex-col text-left focus-visible:outline-none"
            >
              <div className="flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-[18px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-5 transition-all duration-200 group-hover:border-[var(--apple-separator-strong)] group-hover:shadow-[var(--shadow-apple-subtle)] group-focus-visible:ring-2 group-focus-visible:ring-[var(--apple-blue)]">
                <PatternMiniPreview id={pattern.id} />
              </div>

              <div className="mt-2.5 flex items-baseline justify-between gap-2 px-0.5">
                <span className="truncate text-[14px] font-medium text-[var(--apple-label-primary)] group-hover:text-[var(--apple-link)]">
                  {pattern.name}
                </span>
                <span
                  className={`shrink-0 text-[12px] ${
                    pattern.maturity === 'proposed'
                      ? 'font-medium text-[var(--apple-link)]'
                      : 'text-[var(--apple-label-tertiary)]'
                  }`}
                >
                  {pattern.maturity === 'proposed' ? 'Proposed' : pattern.category}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
