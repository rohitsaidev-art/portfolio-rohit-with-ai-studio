import { useState } from 'react';
import {
  LAYOUT_TOKENS,
  RESPONSIVE_BREAKPOINTS,
  SPACING_SCALE,
  getGapsByDomain,
} from '../../utils/foundationsCatalog';
import { playTick } from '../../utils/soundEngine';
import {
  CopyTokenButton,
  DocumentationStandardsPanel,
  FoundationGapsSection,
  FoundationSectionBlock,
} from './FoundationDocPrimitives';

export function SpacingLayoutFoundation() {
  const [selectedStepId, setSelectedStepId] = useState<string>('sp-6');
  const [activeBreakpointId, setActiveBreakpointId] =
    useState<(typeof RESPONSIVE_BREAKPOINTS)[number]['id']>('lg');
  const [showVerticalGuides, setShowVerticalGuides] = useState(true);

  const selectedStep =
    SPACING_SCALE.find((s) => s.id === selectedStepId) ?? SPACING_SCALE[5];
  const activeBreakpoint =
    RESPONSIVE_BREAKPOINTS.find((bp) => bp.id === activeBreakpointId) ??
    RESPONSIVE_BREAKPOINTS[3];

  const innerChildGap = Math.max(4, Math.round(selectedStep.px * 0.5));

  return (
    <div className="space-y-16">
      {/* 1. Interactive Spacing Scale & Container Padding Demonstration */}
      <FoundationSectionBlock
        id="ws-spacing-heading"
        eyebrow="4px Base Spatial Scale · Module 04"
        title="Spacing Scale & Padding Proportions"
        summary="Spatial rhythm follows Tailwind v4's 4px (0.25rem) base unit. Select any step below to inspect its proportion and see the container-to-child padding rule (outer padding ≥ inner child spacing) live."
        isFirst
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Interactive Scale Selector */}
          <div className="divide-y divide-[var(--apple-separator-subtle)] border-y border-[var(--apple-separator)] lg:col-span-7">
            {SPACING_SCALE.map((step) => {
              const active = step.id === selectedStepId;
              return (
                <div
                  key={step.id}
                  className={`flex flex-wrap items-center justify-between gap-3 px-2 py-2.5 transition-colors ${
                    active ? 'bg-[var(--apple-bg-secondary)]' : ''
                  }`}
                >
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      playTick();
                      setSelectedStepId(step.id);
                    }}
                    className="apple-link flex min-w-0 flex-1 items-center gap-4 text-left"
                  >
                    <span className="w-14 shrink-0 font-mono text-[12.5px] font-semibold tabular-nums text-[var(--apple-label-primary)]">
                      {step.px}px
                    </span>
                    <div className="w-24 shrink-0">
                      <div
                        className={`h-2.5 rounded-full transition-colors ${
                          active
                            ? 'bg-[var(--apple-blue)]'
                            : 'bg-[var(--apple-blue)]/45'
                        }`}
                        style={{
                          width: `${Math.max(6, Math.min(96, step.px))}px`,
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-[var(--apple-label-primary)]">
                        {step.semanticRole}
                      </p>
                      <p className="truncate font-mono text-[11px] text-[var(--apple-label-tertiary)]">
                        p-{step.tailwind} · gap-{step.tailwind} · {step.rem}
                      </p>
                    </div>
                  </button>

                  <CopyTokenButton
                    value={`gap-${step.tailwind}`}
                    label={`gap-${step.tailwind}`}
                    ariaLabel={`Copy Tailwind spacing utility gap-${step.tailwind} (${step.px}px)`}
                    compact
                  />
                </div>
              );
            })}
          </div>

          {/* Live Padding vs Inner Gap Visual Inspector */}
          <div className="flex flex-col justify-between lg:col-span-5">
            <div className="rounded-[20px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-5">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[12px] font-semibold text-[var(--apple-label-primary)]">
                  Live Spatial Box · {selectedStep.px}px ({selectedStep.rem})
                </p>
                <span className="font-mono text-[11px] text-[var(--apple-link)]">
                  p-{selectedStep.tailwind}
                </span>
              </div>
              <p className="mt-1 text-[12.5px] leading-[1.48] text-[var(--apple-label-secondary)]">
                {selectedStep.realUsage}
              </p>

              {/* Visual Box Model */}
              <div className="mt-5 overflow-hidden rounded-[16px] border border-dashed border-[var(--apple-blue)]/55 bg-[var(--apple-blue)]/[0.06]">
                <div
                  className="transition-[padding] duration-200"
                  style={{ padding: `${Math.min(selectedStep.px, 48)}px` }}
                >
                  <div
                    className="flex flex-col rounded-[12px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-3.5"
                    style={{ gap: `${Math.min(innerChildGap, 24)}px` }}
                  >
                    <div className="h-3 w-2/3 rounded-full bg-[var(--apple-label-primary)]/18" />
                    <div className="h-2.5 w-full rounded-full bg-[var(--apple-label-secondary)]/16" />
                    <div className="h-2.5 w-4/5 rounded-full bg-[var(--apple-label-secondary)]/12" />
                  </div>
                </div>
              </div>

              <p className="mt-3 font-mono text-[11px] text-[var(--apple-label-tertiary)]">
                Outer padding shown: {Math.min(selectedStep.px, 48)}px
                {selectedStep.px > 48 ? ` (scaled from ${selectedStep.px}px)` : ''}{' '}
                · Inner child gap: {Math.min(innerChildGap, 24)}px
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <CopyTokenButton
                value={`p-${selectedStep.tailwind}`}
                label={`p-${selectedStep.tailwind}`}
                compact
              />
              <CopyTokenButton
                value={selectedStep.rem}
                label={selectedStep.rem}
                compact
              />
              <CopyTokenButton
                value={`${selectedStep.px}px`}
                label={`${selectedStep.px}px`}
                compact
              />
            </div>
          </div>
        </div>
      </FoundationSectionBlock>

      {/* 2. Interactive Responsive Editorial Grid & Breakpoints */}
      <FoundationSectionBlock
        id="ws-grid-breakpoints-heading"
        eyebrow="Editorial Grid & Breakpoints"
        title="Responsive Column, Gutter & Alignment Behaviour"
        summary="Public pages center inside a 1160px editorial shell (1040px inside the Studio content pane). Switch breakpoints below to inspect real column geometry, horizontal gutters, and layout transitions."
        actions={
          <div
            role="group"
            aria-label="Inspect responsive breakpoint layout"
            className="apple-segmented"
          >
            {RESPONSIVE_BREAKPOINTS.map((bp) => {
              const active = activeBreakpointId === bp.id;
              return (
                <button
                  key={bp.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    playTick();
                    setActiveBreakpointId(bp.id);
                  }}
                  className={`apple-segmented-item !min-h-[30px] px-3 text-[12px] ${
                    active
                      ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                      : 'text-[var(--apple-label-secondary)]'
                  }`}
                >
                  {bp.id === 'mobile' ? 'Base' : bp.id}
                </button>
              );
            })}
          </div>
        }
      >
        <div className="rounded-[20px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-5 sm:p-7">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[var(--apple-separator)] pb-4">
            <div>
              <p className="type-headline text-[var(--apple-label-primary)]">
                {activeBreakpoint.prefix}
              </p>
              <p className="mt-0.5 text-[13px] text-[var(--apple-label-secondary)]">
                {activeBreakpoint.behavior}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 font-mono text-[11.5px] tabular-nums text-[var(--apple-label-tertiary)]">
              <span>Cols: {activeBreakpoint.columns}</span>
              <span>Padding: {activeBreakpoint.outerPadding}</span>
              <span>Gutter: {activeBreakpoint.gutter}</span>
            </div>
          </div>

          {/* Live Proportional Frame Demonstration */}
          <div className="mt-6 flex justify-center overflow-x-auto">
            <div
              className="w-full rounded-[16px] border border-[var(--apple-separator-strong)] bg-[var(--apple-bg)] transition-[max-width] duration-300"
              style={{
                maxWidth:
                  activeBreakpoint.id === 'mobile'
                    ? '375px'
                    : activeBreakpoint.id === 'sm'
                      ? '580px'
                      : activeBreakpoint.id === 'md'
                        ? '720px'
                        : '100%',
              }}
            >
              {/* Simulated Sticky 52px Navbar */}
              <div className="flex h-10 items-center justify-between border-b border-[var(--apple-separator)] px-5">
                <span className="text-[11px] font-semibold text-[var(--apple-label-primary)]">
                  Aarav Sen
                </span>
                <span className="font-mono text-[10.5px] text-[var(--apple-label-tertiary)]">
                  {activeBreakpoint.id === 'mobile' || activeBreakpoint.id === 'sm'
                    ? 'Mobile Menu (44px)'
                    : 'Work · Notes · About · Contact'}
                </span>
              </div>

              {/* Column Track Overlay */}
              <div
                className="p-5"
                style={{
                  paddingLeft: activeBreakpoint.id === 'mobile' ? '20px' : '32px',
                  paddingRight: activeBreakpoint.id === 'mobile' ? '20px' : '32px',
                }}
              >
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `repeat(${activeBreakpoint.columns}, minmax(0, 1fr))`,
                    gap:
                      activeBreakpoint.id === 'mobile'
                        ? '10px'
                        : activeBreakpoint.id === 'lg' || activeBreakpoint.id === 'xl'
                          ? '12px'
                          : '14px',
                  }}
                >
                  {Array.from({ length: activeBreakpoint.columns }).map(
                    (_, idx) => (
                      <div
                        key={idx}
                        className="flex h-14 items-center justify-center rounded-[8px] border border-dashed border-[var(--apple-blue)]/35 bg-[var(--apple-blue)]/[0.05] font-mono text-[10.5px] tabular-nums text-[var(--apple-link)]"
                      >
                        {idx + 1}
                      </div>
                    ),
                  )}
                </div>

                {/* Realistic Case Study / Index Split Below Columns */}
                <div
                  className="mt-4 grid gap-3"
                  style={{
                    gridTemplateColumns:
                      activeBreakpoint.columns === 1
                        ? '1fr'
                        : activeBreakpoint.columns === 2
                          ? '1fr 1fr'
                          : '3fr 9fr',
                  }}
                >
                  <div className="rounded-[10px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-3">
                    <p className="font-mono text-[10.5px] text-[var(--apple-label-tertiary)]">
                      {activeBreakpoint.columns === 12
                        ? '3 cols · Sticky Rail / TOC'
                        : 'Full-width Header / Card 1'}
                    </p>
                  </div>
                  {activeBreakpoint.columns > 1 && (
                    <div className="rounded-[10px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-3">
                      <p className="font-mono text-[10.5px] text-[var(--apple-label-tertiary)]">
                        {activeBreakpoint.columns === 12
                          ? '9 cols · Case Study Narrative (60ch prose inside)'
                          : 'Card 2 · 2-Column Split'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </FoundationSectionBlock>

      {/* 3. Container Widths, Scroll Offsets & Vertical Rhythm */}
      <FoundationSectionBlock
        id="ws-containers-rhythm-heading"
        eyebrow="Containers & Vertical Rhythm"
        title="Shell Widths, Scroll Offsets & Band Cadence"
        summary="Sticky navigation requires predictable scroll-margin offsets so anchor jumps and TOC selections never clip headings beneath the 52px header."
        actions={
          <button
            type="button"
            aria-pressed={showVerticalGuides}
            onClick={() => {
              playTick();
              setShowVerticalGuides((v) => !v);
            }}
            className="apple-btn-tonal !min-h-[32px] !px-3.5 !py-1 !text-[12px]"
          >
            {showVerticalGuides ? 'Hide Rhythm Guides' : 'Show Rhythm Guides'}
          </button>
        }
      >
        <div className="divide-y divide-[var(--apple-separator-subtle)] border-y border-[var(--apple-separator)]">
          {LAYOUT_TOKENS.map((item) => (
            <div
              key={item.name}
              className="grid grid-cols-1 gap-3 py-4 md:grid-cols-12 md:items-center"
            >
              <div className="md:col-span-4">
                <p className="text-[14px] font-medium text-[var(--apple-label-primary)]">
                  {item.name}
                </p>
                <p className="text-[11.5px] text-[var(--apple-label-tertiary)]">
                  {item.status === 'css-var'
                    ? 'CSS custom property (src/index.css)'
                    : 'Production layout convention'}
                </p>
              </div>
              <p className="text-[13px] leading-[1.5] text-[var(--apple-label-secondary)] md:col-span-5">
                {item.purpose}
              </p>
              <div className="flex flex-wrap items-center gap-2 md:col-span-3 md:justify-end">
                <span className="font-mono text-[12px] tabular-nums text-[var(--apple-label-primary)]">
                  {item.value}
                </span>
                <CopyTokenButton
                  value={
                    item.status === 'css-var'
                      ? `var(${item.implementation})`
                      : item.implementation
                  }
                  label={item.implementation}
                  compact
                />
              </div>
            </div>
          ))}
        </div>

        {/* Vertical Rhythm Band Specimen */}
        <div className="mt-8 overflow-hidden rounded-[20px] border border-[var(--apple-separator)] bg-[var(--apple-bg)]">
          <div
            className={`px-6 transition-colors ${
              showVerticalGuides
                ? 'bg-[var(--apple-blue)]/[0.05] py-5'
                : 'py-5'
            }`}
          >
            {showVerticalGuides && (
              <p className="mb-2 font-mono text-[10.5px] text-[var(--apple-link)]">
                Band top padding · py-24 (96px desktop) / py-16 (64px mobile)
              </p>
            )}
            <p className="type-title-3 text-[var(--apple-label-primary)]">
              Section Heading (Title 2)
            </p>
            <div
              className={`mt-4 border-t border-dashed ${
                showVerticalGuides
                  ? 'border-[var(--apple-blue)]/45 pt-4'
                  : 'border-transparent pt-4'
              }`}
            >
              {showVerticalGuides && (
                <p className="mb-2 font-mono text-[10.5px] text-[var(--apple-link)]">
                  Header-to-content cadence · mt-8 (32px) or mt-12 (48px)
                </p>
              )}
              <div className="prose-stack max-w-[54ch] text-[14.5px] leading-[1.6] text-[var(--apple-label-secondary)]">
                <p>
                  First narrative paragraph sits inside a 60ch measure with balanced vertical rhythm separating macro bands from micro prose flow.
                </p>
                <p
                  className={
                    showVerticalGuides
                      ? 'border-t border-dashed border-[var(--apple-blue)]/40 pt-3'
                      : ''
                  }
                >
                  Second paragraph inside <code className="font-mono text-[12px]">.prose-stack</code> adds exactly <code className="font-mono text-[12px]">1.25rem</code> (20px) top margin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </FoundationSectionBlock>

      {/* 4. Consistent Documentation Standards */}
      <DocumentationStandardsPanel
        headingId="ws-spacing-standards-heading"
        usageGuidance={[
          'Enforce outer container padding ≥ inner child spacing so visual grouping reads immediately without extra divider lines.',
          'Attach scroll-mt-[var(--scroll-offset-header)] (84px) to in-page anchors and --scroll-offset-header-subnav (136px) whenever a sticky local sub-navigation bar is active.',
          'Separate macro page bands via alternating surfaces (--apple-bg vs --apple-bg-secondary) and 64px–96px vertical rhythm rather than stacking bordered cards.',
        ]}
        doDonts={[
          {
            doText: 'Align primary content edges consistently to the 1160px shell with px-5 on mobile and sm:px-8 on tablet/desktop.',
            dontText: 'Mix inconsistent horizontal container paddings (e.g. px-4 on headers and px-10 on grids), which breaks vertical left-edge alignment.',
          },
          {
            doText: 'Keep interactive buttons and mobile drawer links at ≥ 44px minimum hit height.',
            dontText: 'Pack compact 28px inline chips tightly on touch screens without adequate spacing.',
          },
        ]}
        accessibilityNotes={[
          'Minimum touch targets are 44×44px across mobile controls (Navbar icons, mobile Studio drawer rows, AudioPlayer transport, Back-to-Top).',
          'Standardized scroll offsets (--scroll-offset-header, --scroll-offset-header-subnav) prevent keyboard focus targets and hash links from landing hidden behind sticky bars (WCAG 2.2 Focus Not Obscured).',
        ]}
        responsiveNotes={[
          'All grids collapse to single-column flow below 640px with zero horizontal overflow verified at 375px and 390px.',
          'At lg (1024px+), the Studio switches from a sticky top bar + slide-over drawer to a persistent 264px left sidebar paired with a 1040px reading pane.',
        ]}
      />

      {/* 5. Honest Source-Code Gaps */}
      <FoundationGapsSection
        headingId="ws-spacing-gaps-heading"
        gaps={getGapsByDomain('spacing-layout')}
      />
    </div>
  );
}
