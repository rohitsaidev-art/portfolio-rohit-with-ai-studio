import { useState } from 'react';
import {
  LAYOUT_TOKENS,
  RESPONSIVE_BREAKPOINTS,
  SPACING_SCALE,
} from '../../utils/foundationsCatalog';
import { playTick } from '../../utils/soundEngine';
import { CopyTokenButton } from './FoundationDocPrimitives';

export function SpacingLayoutFoundation() {
  const [selectedStepId, setSelectedStepId] = useState<string>('sp-6');
  const [activeBreakpointId, setActiveBreakpointId] =
    useState<(typeof RESPONSIVE_BREAKPOINTS)[number]['id']>('lg');

  const selectedStep =
    SPACING_SCALE.find((s) => s.id === selectedStepId) ?? SPACING_SCALE[5];
  const activeBreakpoint =
    RESPONSIVE_BREAKPOINTS.find((bp) => bp.id === activeBreakpointId) ??
    RESPONSIVE_BREAKPOINTS[3];

  const innerChildGap = Math.max(4, Math.round(selectedStep.px * 0.5));

  return (
    <div className="space-y-14">
      {/* 1. Interactive Spacing Scale & Live Box Model */}
      <section aria-labelledby="spacing-scale-heading" className="space-y-5">
        <div>
          <h2
            id="spacing-scale-heading"
            className="font-display text-[20px] font-semibold tracking-[-0.022em] text-[var(--apple-label-primary)]"
          >
            Spacing Scale
          </h2>
          <p className="mt-1 text-[14px] text-[var(--apple-label-secondary)]">
            4px base unit. Click any step to inspect outer-container padding against inner child gaps.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="divide-y divide-[var(--apple-separator-subtle)] border-y border-[var(--apple-separator-subtle)] lg:col-span-7">
            {SPACING_SCALE.map((step) => {
              const active = step.id === selectedStepId;
              return (
                <div
                  key={step.id}
                  className={`flex items-center justify-between gap-3 px-2 py-2.5 transition-colors ${
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
                    <span className="w-12 shrink-0 font-mono text-[12.5px] font-semibold tabular-nums text-[var(--apple-label-primary)]">
                      {step.px}px
                    </span>
                    <div className="w-24 shrink-0">
                      <div
                        className={`h-2 rounded-full transition-colors ${
                          active ? 'bg-[var(--apple-blue-fill)]' : 'bg-[var(--apple-blue)]/40'
                        }`}
                        style={{ width: `${Math.max(6, Math.min(96, step.px))}px` }}
                      />
                    </div>
                    <span className="truncate text-[13px] text-[var(--apple-label-secondary)]">
                      {step.semanticRole}
                    </span>
                  </button>
                  <CopyTokenButton
                    value={`gap-${step.tailwind}`}
                    label={`gap-${step.tailwind}`}
                    compact
                  />
                </div>
              );
            })}
          </div>

          {/* Live Padding Box Visual */}
          <div className="flex flex-col justify-between rounded-[18px] border border-[var(--apple-separator-subtle)] bg-[var(--apple-bg-secondary)] p-6 lg:col-span-5">
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[14px] font-semibold text-[var(--apple-label-primary)]">
                  {selectedStep.px}px · {selectedStep.rem}
                </p>
                <span className="font-mono text-[11.5px] text-[var(--apple-link)]">
                  p-{selectedStep.tailwind}
                </span>
              </div>
              <p className="mt-1 text-[13px] text-[var(--apple-label-secondary)]">
                {selectedStep.realUsage}
              </p>

              <div className="mt-5 overflow-hidden rounded-[14px] border border-dashed border-[var(--apple-blue)]/50 bg-[var(--apple-blue)]/[0.06]">
                <div
                  className="transition-[padding] duration-200"
                  style={{ padding: `${Math.min(selectedStep.px, 48)}px` }}
                >
                  <div
                    className="flex flex-col rounded-[10px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-3.5"
                    style={{ gap: `${Math.min(innerChildGap, 24)}px` }}
                  >
                    <div className="h-2.5 w-2/3 rounded-full bg-[var(--apple-label-primary)]/18" />
                    <div className="h-2 w-full rounded-full bg-[var(--apple-label-secondary)]/16" />
                    <div className="h-2 w-4/5 rounded-full bg-[var(--apple-label-secondary)]/12" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <CopyTokenButton value={`p-${selectedStep.tailwind}`} label={`p-${selectedStep.tailwind}`} compact />
              <CopyTokenButton value={`${selectedStep.px}px`} label={`${selectedStep.px}px`} compact />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Responsive Grid Preview */}
      <section
        aria-labelledby="spacing-grid-heading"
        className="space-y-5 border-t border-[var(--apple-separator-subtle)] pt-12"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="spacing-grid-heading"
              className="font-display text-[20px] font-semibold tracking-[-0.022em] text-[var(--apple-label-primary)]"
            >
              Responsive Grid
            </h2>
            <p className="mt-1 text-[14px] text-[var(--apple-label-secondary)]">
              Public pages sit inside a 1160px shell. Switch breakpoints to preview column tracks.
            </p>
          </div>

          <div
            role="group"
            aria-label="Inspect responsive breakpoint"
            className="apple-segmented self-start sm:self-auto"
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
                  className={`apple-segmented-item !min-h-[30px] whitespace-nowrap px-3 text-[12px] ${
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
        </div>

        <div className="rounded-[18px] border border-[var(--apple-separator-subtle)] bg-[var(--apple-bg-secondary)] p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4 text-[13px]">
            <span className="font-semibold text-[var(--apple-label-primary)]">
              {activeBreakpoint.prefix}
            </span>
            <span className="font-mono text-[12px] tabular-nums text-[var(--apple-label-tertiary)]">
              {activeBreakpoint.columns} cols · {activeBreakpoint.outerPadding} padding · {activeBreakpoint.gutter} gutter
            </span>
          </div>

          <div className="flex justify-center overflow-x-auto">
            <div
              className="w-full rounded-[14px] border border-[var(--apple-separator)] bg-[var(--apple-bg)] p-4 transition-[max-width] duration-300"
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
              <div
                className="grid gap-2.5"
                style={{
                  gridTemplateColumns: `repeat(${activeBreakpoint.columns}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({ length: activeBreakpoint.columns }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex h-16 items-center justify-center rounded-[7px] bg-[var(--apple-blue)]/[0.08] font-mono text-[11px] tabular-nums text-[var(--apple-link)]"
                  >
                    {idx + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Shell Widths & Sticky Scroll Offsets */}
      <section
        aria-labelledby="spacing-shell-heading"
        className="space-y-4 border-t border-[var(--apple-separator-subtle)] pt-12"
      >
        <h2
          id="spacing-shell-heading"
          className="font-display text-[20px] font-semibold tracking-[-0.022em] text-[var(--apple-label-primary)]"
        >
          Containers &amp; Offsets
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LAYOUT_TOKENS.map((item) => (
            <div
              key={item.name}
              className="flex flex-col justify-between rounded-[14px] border border-[var(--apple-separator-subtle)] bg-[var(--apple-bg-secondary)]/55 p-4"
            >
              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[13.5px] font-semibold text-[var(--apple-label-primary)]">
                    {item.name}
                  </p>
                  <span className="font-mono text-[12px] tabular-nums text-[var(--apple-link)]">
                    {item.value}
                  </span>
                </div>
                <p className="mt-1 text-[12.5px] leading-[1.48] text-[var(--apple-label-secondary)]">
                  {item.purpose}
                </p>
              </div>
              <div className="mt-3">
                <CopyTokenButton
                  value={item.status === 'css-var' ? `var(${item.implementation})` : item.implementation}
                  label={item.implementation}
                  compact
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
