import { useState } from 'react';
import type { ResolvedTheme } from '../../utils/appearance';
import {
  COLOR_TOKENS,
  ELEVATION_LEVELS,
  RADIUS_SCALE,
  getGapsByDomain,
  getTokenValueForMatrix,
} from '../../utils/foundationsCatalog';
import { playTick } from '../../utils/soundEngine';
import type { VisualPaletteId } from '../../utils/workshopStore';
import {
  CopyTokenButton,
  DocumentationStandardsPanel,
  FoundationGapsSection,
  FoundationSectionBlock,
} from './FoundationDocPrimitives';

interface SurfacesElevationFoundationProps {
  sandboxPalette: VisualPaletteId;
  sandboxTheme: ResolvedTheme;
}

const NESTING_PRESETS = [
  { id: 'showcase', label: 'Showcase Card (28px → 20px)', outer: 28, pad: 8, inner: 20 },
  { id: 'panel', label: 'Specimen Panel (24px → 14px)', outer: 24, pad: 10, inner: 14 },
  { id: 'compact', label: 'Compact Tile (20px → 12px)', outer: 20, pad: 8, inner: 12 },
] as const;

export function SurfacesElevationFoundation({
  sandboxPalette,
  sandboxTheme,
}: SurfacesElevationFoundationProps) {
  const [nestingId, setNestingId] =
    useState<(typeof NESTING_PRESETS)[number]['id']>('showcase');
  const [activeShadowId, setActiveShadowId] = useState<string>('card');

  const activeNesting =
    NESTING_PRESETS.find((n) => n.id === nestingId) ?? NESTING_PRESETS[0];
  const activeShadow =
    ELEVATION_LEVELS.find((e) => e.id === activeShadowId) ??
    ELEVATION_LEVELS[2];

  const borderTokens = COLOR_TOKENS.filter(
    (t) =>
      t.group === 'borders' ||
      t.token === '--apple-focus-ring' ||
      t.token === '--apple-error-ring',
  );

  return (
    <div className="space-y-16">
      {/* 1. Surface Hierarchy & Layering Stack */}
      <FoundationSectionBlock
        id="ws-surfaces-stack-heading"
        eyebrow="Surface Architecture · Layering"
        title="Surface Hierarchy & Translucent Glass"
        summary={`Previewing inside ${
          sandboxPalette === 'cool' ? 'Cool Neutral' : 'Warm Neutral'
        } · ${
          sandboxTheme === 'light' ? 'Light' : 'Dark'
        }. Five physical surface planes separate base canvas, recessed gallery bands, elevated cards, frosted navigation glass, and modal overlays.`}
        isFirst
      >
        <div
          data-ds-sandbox="true"
          data-ds-palette={sandboxPalette}
          data-ds-theme={sandboxTheme}
          className="rounded-[24px] border border-[var(--apple-separator)] bg-[var(--apple-bg)] p-6 sm:p-8"
        >
          {/* Plane 0 -> Plane 1 -> Plane 2 */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4">
            <span className="font-mono text-[11.5px] text-[var(--apple-label-tertiary)]">
              Level 0 · Base Canvas (--apple-bg)
            </span>
            <CopyTokenButton value="var(--apple-bg)" label="--apple-bg" compact />
          </div>

          <div className="rounded-[20px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4">
              <span className="font-mono text-[11.5px] text-[var(--apple-label-tertiary)]">
                Level 1 · Recessed Band (--apple-bg-secondary)
              </span>
              <CopyTokenButton
                value="var(--apple-bg-secondary)"
                label="--apple-bg-secondary"
                compact
              />
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {/* Level 2: Elevated Card */}
              <div className="apple-card-static rounded-[18px] p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-[var(--apple-link)]">
                    Level 2 · Elevated
                  </span>
                  <CopyTokenButton
                    value="var(--apple-surface-elevated)"
                    label="--apple-surface-elevated"
                    compact
                  />
                </div>
                <h3 className="type-headline mt-3 text-[var(--apple-label-primary)]">
                  Machined Elevated Card
                </h3>
                <p className="mt-1.5 text-[13.5px] leading-[1.52] text-[var(--apple-label-secondary)]">
                  Combines <code className="font-mono text-[12px]">--apple-surface-elevated</code> with multi-layered contact and ambient shadows.
                </p>
                <div className="mt-4 rounded-[12px] bg-[var(--apple-bg-tertiary)] px-3.5 py-2.5 text-[12px] text-[var(--apple-label-secondary)]">
                  Recessed nested well using <code className="font-mono">--apple-bg-tertiary</code>
                </div>
              </div>

              {/* Level 3: Translucent Glass over Content */}
              <div className="relative overflow-hidden rounded-[18px] border border-[var(--apple-separator)] bg-[var(--apple-bg)] p-5">
                {/* Underlying visual lines to reveal real backdrop-filter translucency */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-45"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 20% 25%, rgba(0,113,227,0.22), transparent 48%), repeating-linear-gradient(135deg, transparent, transparent 14px, var(--apple-separator) 14px, var(--apple-separator) 15px)',
                  }}
                />
                <div className="relative flex h-full flex-col justify-between gap-4">
                  <div className="apple-ios-bar rounded-[14px] px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[12.5px] font-semibold text-[var(--apple-label-primary)]">
                        Level 3 · Translucent iOS Bar
                      </span>
                      <CopyTokenButton
                        value="apple-ios-bar"
                        label=".apple-ios-bar"
                        compact
                      />
                    </div>
                    <p className="mt-1 text-[12px] text-[var(--apple-label-secondary)]">
                      Uses <code className="font-mono">--apple-surface-ios-bar</code> with <code className="font-mono">saturate(180%) blur(24px)</code>.
                    </p>
                  </div>

                  <div
                    className="rounded-[12px] border border-[var(--apple-separator)] px-4 py-2.5 backdrop-blur-xl"
                    style={{ backgroundColor: 'var(--apple-surface-glass)' }}
                  >
                    <p className="font-mono text-[11px] text-[var(--apple-label-secondary)]">
                      Sticky Navbar Glass · --apple-surface-glass
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FoundationSectionBlock>

      {/* 2. Corner-Radius Scale & Concentric Nesting Geometry */}
      <FoundationSectionBlock
        id="ws-radii-heading"
        eyebrow="Geometry · Module 05"
        title="Corner-Radius Scale & Concentric Nesting"
        summary="Corner radii follow Apple optical curvature from crisp 6px inline link rings up to 28px showcase cards and 9999px interactive action pills. Nested surfaces maintain concentric visual curves via outerRadius = innerRadius + padding."
        actions={
          <div
            role="group"
            aria-label="Inspect concentric corner nesting preset"
            className="apple-segmented"
          >
            {NESTING_PRESETS.map((preset) => {
              const active = nestingId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    playTick();
                    setNestingId(preset.id);
                  }}
                  className={`apple-segmented-item !min-h-[30px] px-3 text-[12px] ${
                    active
                      ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                      : 'text-[var(--apple-label-secondary)]'
                  }`}
                >
                  {preset.outer}→{preset.inner}px
                </button>
              );
            })}
          </div>
        }
      >
        {/* Interactive Concentric Nesting Specimen */}
        <div className="mb-8 grid grid-cols-1 gap-6 rounded-[20px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-6 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-link)]">
              Concentric Curvature Formula
            </p>
            <h3 className="type-headline mt-1 text-[var(--apple-label-primary)]">
              {activeNesting.label}
            </h3>
            <p className="mt-2 font-mono text-[12.5px] tabular-nums text-[var(--apple-label-secondary)]">
              {activeNesting.outer}px outer − {activeNesting.pad}px padding ={' '}
              <strong className="text-[var(--apple-label-primary)]">
                {activeNesting.inner}px inner
              </strong>
            </p>
            <p className="mt-2 text-[13px] leading-[1.52] text-[var(--apple-label-secondary)]">
              When outer and inner curves share the same geometric center, nested photography and trays look machined rather than pinched at the corners.
            </p>
          </div>
          <div className="flex justify-center lg:col-span-7">
            <div
              className="w-full max-w-[360px] border-2 border-[var(--apple-blue)]/45 bg-[var(--apple-surface-elevated)] transition-all duration-300"
              style={{
                borderRadius: `${activeNesting.outer}px`,
                padding: `${activeNesting.pad}px`,
              }}
            >
              <div
                className="flex h-28 flex-col items-center justify-center border border-[var(--apple-separator-strong)] bg-[var(--apple-bg-secondary)] text-center transition-all duration-300"
                style={{ borderRadius: `${activeNesting.inner}px` }}
              >
                <span className="font-mono text-[12px] font-semibold text-[var(--apple-label-primary)]">
                  Inner {activeNesting.inner}px
                </span>
                <span className="mt-1 font-mono text-[11px] text-[var(--apple-label-tertiary)]">
                  Inside {activeNesting.outer}px ({activeNesting.pad}px gap)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Complete Radius Scale List */}
        <div className="divide-y divide-[var(--apple-separator-subtle)] border-y border-[var(--apple-separator)]">
          {RADIUS_SCALE.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-12 sm:items-center"
            >
              <div className="flex items-center gap-4 sm:col-span-5">
                <div
                  className="h-11 w-14 shrink-0 border-2 border-[var(--apple-label-primary)]/45 bg-[var(--apple-bg-secondary)]"
                  style={{ borderRadius: item.value }}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-[var(--apple-label-primary)]">
                    {item.role}
                  </p>
                  <p className="font-mono text-[11.5px] tabular-nums text-[var(--apple-label-tertiary)]">
                    {item.value}
                  </p>
                </div>
              </div>
              <p className="text-[13px] text-[var(--apple-label-secondary)] sm:col-span-4">
                {item.nestingRule}
              </p>
              <div className="sm:col-span-3 sm:flex sm:justify-end">
                <CopyTokenButton
                  value={item.implementation}
                  label={item.implementation}
                  compact
                />
              </div>
            </div>
          ))}
        </div>
      </FoundationSectionBlock>

      {/* 3. Borders, Hairlines & Focus Rings */}
      <FoundationSectionBlock
        id="ws-borders-heading"
        eyebrow="Hairlines & Structural Rings"
        title="Border & Ring Tokens"
        summary="Borders use translucent alpha values so 1px hairlines adapt cleanly over both primary canvases and secondary bands without harsh opaque grids."
      >
        <div
          data-ds-sandbox="true"
          data-ds-palette={sandboxPalette}
          data-ds-theme={sandboxTheme}
          className="divide-y divide-[var(--apple-separator-subtle)] rounded-[20px] border border-[var(--apple-separator)] bg-[var(--apple-bg)] px-5 sm:px-6"
        >
          {borderTokens.map((spec) => {
            const val = getTokenValueForMatrix(spec, sandboxPalette, sandboxTheme);
            const isRing =
              spec.token === '--apple-focus-ring' ||
              spec.token === '--apple-error-ring';
            return (
              <div
                key={spec.token}
                className="grid grid-cols-1 gap-4 py-4 md:grid-cols-12 md:items-center"
              >
                <div className="md:col-span-4">
                  <p className="text-[14px] font-medium text-[var(--apple-label-primary)]">
                    {spec.label}
                  </p>
                  <p className="mt-0.5 text-[12px] text-[var(--apple-label-secondary)]">
                    {spec.usage}
                  </p>
                </div>

                <div className="md:col-span-4">
                  {isRing ? (
                    <div
                      className="inline-flex h-9 items-center rounded-[10px] border bg-[var(--apple-surface-elevated)] px-3 text-[12px] text-[var(--apple-label-primary)]"
                      style={{
                        borderColor:
                          spec.token === '--apple-error-ring'
                            ? 'var(--apple-error)'
                            : 'var(--apple-blue)',
                        boxShadow: `0 0 0 4px ${val}`,
                      }}
                    >
                      4px Ring Halo
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div
                        className="h-0 w-full border-t"
                        style={{ borderColor: val }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 md:col-span-4 md:justify-end">
                  <CopyTokenButton
                    value={`var(${spec.token})`}
                    label={spec.token}
                    compact
                  />
                  <CopyTokenButton value={val} label={val} compact />
                </div>
              </div>
            );
          })}
        </div>
      </FoundationSectionBlock>

      {/* 4. Physical Elevation & Light vs Dark Depth Comparison */}
      <FoundationSectionBlock
        id="ws-elevation-heading"
        eyebrow="Depth & Shadow Physics · Module 06"
        title="Elevation Levels & Light vs. Dark Differences"
        summary="Every shadow token in src/index.css blends a top specular edge, a 0.5px perimeter contact ring, and diffuse ambient layers. Inspect all seven levels and compare Light vs. Dark depth physics directly."
      >
        {/* Interactive Elevation Selector + Live Component Preview */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="divide-y divide-[var(--apple-separator-subtle)] border-y border-[var(--apple-separator)] lg:col-span-5">
            {ELEVATION_LEVELS.map((level) => {
              const active = level.id === activeShadowId;
              return (
                <button
                  key={level.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    playTick();
                    setActiveShadowId(level.id);
                  }}
                  className={`apple-link flex w-full items-center justify-between gap-3 px-2.5 py-3 text-left transition-colors ${
                    active
                      ? 'bg-[var(--apple-bg-secondary)] font-semibold text-[var(--apple-label-primary)]'
                      : 'text-[var(--apple-label-secondary)] hover:bg-[var(--apple-bg-secondary)]/60'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-[13.5px] text-[var(--apple-label-primary)]">
                      {level.name}
                    </p>
                    <p className="font-mono text-[11px] font-normal text-[var(--apple-label-tertiary)]">
                      {level.token}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] font-normal text-[var(--apple-label-tertiary)]">
                    {level.layer}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Side-by-Side Light vs Dark Elevation Specimen for Selected Level */}
          <div className="space-y-4 lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="type-headline text-[var(--apple-label-primary)]">
                  {activeShadow.name}
                </h3>
                <p className="mt-0.5 text-[13px] text-[var(--apple-label-secondary)]">
                  {activeShadow.usage}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <CopyTokenButton
                  value={`var(${activeShadow.token})`}
                  label={activeShadow.token}
                  compact
                />
                <CopyTokenButton
                  value={activeShadow.className}
                  label={`.${activeShadow.className}`}
                  compact
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(['light', 'dark'] as const).map((mode) => (
                <div
                  key={mode}
                  data-ds-sandbox="true"
                  data-ds-palette={sandboxPalette}
                  data-ds-theme={mode}
                  className="rounded-[20px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-6"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]">
                    {mode === 'light' ? 'Light Depth Physics' : 'Dark Depth Physics'}
                  </p>
                  <div
                    className="mt-5 rounded-[18px] bg-[var(--apple-surface-elevated)] p-5"
                    style={{ boxShadow: `var(${activeShadow.token})` }}
                  >
                    <p className="text-[14px] font-semibold text-[var(--apple-label-primary)]">
                      {activeShadow.name}
                    </p>
                    <p className="mt-1 text-[12px] leading-[1.48] text-[var(--apple-label-secondary)]">
                      {mode === 'light'
                        ? activeShadow.lightPhysics
                        : activeShadow.darkPhysics}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FoundationSectionBlock>

      {/* 5. Consistent Documentation Standards */}
      <DocumentationStandardsPanel
        headingId="ws-surfaces-standards-heading"
        usageGuidance={[
          'Reserve elevated shadows (--shadow-apple-card) for primary interactive surfaces and showcase modules — avoid wrapping every metadata group or text block in a shadowed card.',
          'Maintain concentric corner curvature whenever an image or recessed tray sits inside a rounded parent card.',
          'Use hairline borders (--apple-separator, --apple-separator-subtle) to organize dense reference lists cleanly without visual heaviness.',
        ]}
        doDonts={[
          {
            doText: 'Use .apple-surface-subtle or hairline dividers for structural separation and keep .apple-card for clickable case studies.',
            dontText: 'Stack multiple heavy drop shadows inside each other or apply rounded-full pills to static non-interactive labels.',
          },
          {
            doText: 'Rely on progressive surface luminance + top specular highlights in Dark mode so cards stay grounded against #0b0b0d.',
            dontText: 'Use pure black drop shadows alone in Dark mode, which disappear into dark canvases and flatten hierarchy.',
          },
        ]}
        accessibilityNotes={[
          'When prefers-reduced-motion: reduce is active, .apple-card:hover and button :active disable vertical lift and scale transforms while preserving clear hover/focus styling.',
          'In @media print, all card shadows are stripped (box-shadow: none) and replaced with crisp 1px rgba(0,0,0,0.12) borders on pure white backgrounds.',
        ]}
        responsiveNotes={[
          'Floating glass surfaces (.apple-ios-bar) stay inset from mobile viewport edges with generous safe margins and never overlap Back-to-Top controls.',
          'Card radii (24px–28px) remain optically balanced across mobile 375px and desktop 1440px without needing per-breakpoint overrides.',
        ]}
      />

      {/* 6. Honest Source-Code Gaps */}
      <FoundationGapsSection
        headingId="ws-surfaces-gaps-heading"
        gaps={getGapsByDomain('surfaces-elevation')}
      />
    </div>
  );
}
