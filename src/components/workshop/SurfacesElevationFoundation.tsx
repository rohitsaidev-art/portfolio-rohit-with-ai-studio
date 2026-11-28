import { useState } from 'react';
import type { ResolvedTheme } from '../../utils/appearance';
import { ELEVATION_LEVELS, RADIUS_SCALE } from '../../utils/foundationsCatalog';
import { playTick } from '../../utils/soundEngine';
import type { VisualPaletteId } from '../../utils/workshopStore';
import { CopyTokenButton } from './FoundationDocPrimitives';

interface SurfacesElevationFoundationProps {
  sandboxPalette: VisualPaletteId;
  sandboxTheme: ResolvedTheme;
}

const NESTING_PRESETS = [
  { id: 'showcase', label: '28 → 20px', outer: 28, pad: 8, inner: 20 },
  { id: 'panel', label: '24 → 14px', outer: 24, pad: 10, inner: 14 },
  { id: 'compact', label: '20 → 12px', outer: 20, pad: 8, inner: 12 },
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

  return (
    <div className="space-y-14">
      {/* 1. Surface Planes Visual */}
      <section aria-labelledby="surfaces-planes-heading" className="space-y-5">
        <div>
          <h2
            id="surfaces-planes-heading"
            className="font-display text-[20px] font-semibold tracking-[-0.022em] text-[var(--apple-label-primary)]"
          >
            Surface Planes
          </h2>
          <p className="mt-1 text-[14px] text-[var(--apple-label-secondary)]">
            Four layered surfaces create hierarchy without heavy borders — base canvas, recessed bands, elevated cards, and frosted glass.
          </p>
        </div>

        <div
          data-ds-sandbox="true"
          data-ds-palette={sandboxPalette}
          data-ds-theme={sandboxTheme}
          className="rounded-[20px] border border-[var(--apple-separator)] bg-[var(--apple-bg)] p-5 sm:p-7"
        >
          <div className="flex items-center justify-between pb-3 text-[12px] text-[var(--apple-label-tertiary)]">
            <span>01 · Base Canvas</span>
            <CopyTokenButton value="var(--apple-bg)" label="--apple-bg" compact />
          </div>

          <div className="rounded-[16px] border border-[var(--apple-separator-subtle)] bg-[var(--apple-bg-secondary)] p-5">
            <div className="flex items-center justify-between pb-4 text-[12px] text-[var(--apple-label-tertiary)]">
              <span>02 · Recessed Band</span>
              <CopyTokenButton value="var(--apple-bg-secondary)" label="--apple-bg-secondary" compact />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="apple-card-static rounded-[14px] p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13.5px] font-semibold text-[var(--apple-label-primary)]">
                    03 · Elevated Surface
                  </span>
                  <CopyTokenButton value="apple-card-static" label=".apple-card-static" compact />
                </div>
                <p className="mt-2 text-[13px] text-[var(--apple-label-secondary)]">
                  Soft contact shadow in Light mode; stepped luminance + subtle top specular edge in Dark mode.
                </p>
              </div>

              <div className="relative overflow-hidden rounded-[14px] border border-[var(--apple-separator-subtle)] bg-[var(--apple-bg)] p-5">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 25% 25%, rgba(0,113,227,0.22), transparent 55%)',
                  }}
                />
                <div className="apple-ios-bar relative rounded-[12px] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13.5px] font-semibold text-[var(--apple-label-primary)]">
                      04 · Translucent Glass
                    </span>
                    <CopyTokenButton value="apple-ios-bar" label=".apple-ios-bar" compact />
                  </div>
                  <p className="mt-1.5 text-[12.5px] text-[var(--apple-label-secondary)]">
                    High-opacity blur for sticky bars and floating audio controls.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Corner Radii & Concentric Nesting */}
      <section
        aria-labelledby="surfaces-radii-heading"
        className="space-y-6 border-t border-[var(--apple-separator-subtle)] pt-12"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="surfaces-radii-heading"
              className="font-display text-[20px] font-semibold tracking-[-0.022em] text-[var(--apple-label-primary)]"
            >
              Corner Radii &amp; Nesting
            </h2>
            <p className="mt-1 text-[14px] text-[var(--apple-label-secondary)]">
              Nested corners share a geometric center: inner radius = outer radius − padding.
            </p>
          </div>

          <div
            role="group"
            aria-label="Inspect concentric corner nesting"
            className="apple-segmented self-start sm:self-auto"
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
                  className={`apple-segmented-item !min-h-[30px] whitespace-nowrap px-3 text-[12px] ${
                    active
                      ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                      : 'text-[var(--apple-label-secondary)]'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual Concentric Diagram */}
        <div className="flex flex-col items-center justify-between gap-6 rounded-[18px] border border-[var(--apple-separator-subtle)] bg-[var(--apple-bg-secondary)] p-6 md:flex-row">
          <div className="max-w-[38ch]">
            <p className="font-mono text-[13px] tabular-nums text-[var(--apple-link)]">
              {activeNesting.outer}px outer − {activeNesting.pad}px pad = {activeNesting.inner}px inner
            </p>
            <p className="mt-1.5 text-[13.5px] leading-[1.52] text-[var(--apple-label-secondary)]">
              Keeps photography and nested trays optically parallel along every rounded corner.
            </p>
          </div>

          <div
            className="w-full max-w-[300px] border-2 border-[var(--apple-blue)]/45 bg-[var(--apple-surface-elevated)] transition-all duration-300"
            style={{
              borderRadius: `${activeNesting.outer}px`,
              padding: `${activeNesting.pad}px`,
            }}
          >
            <div
              className="flex h-24 items-center justify-center border border-[var(--apple-separator-strong)] bg-[var(--apple-bg-secondary)] font-mono text-[12px] text-[var(--apple-label-primary)] transition-all duration-300"
              style={{ borderRadius: `${activeNesting.inner}px` }}
            >
              {activeNesting.inner}px inner
            </div>
          </div>
        </div>

        {/* Visual Radius Scale Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {RADIUS_SCALE.map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-start rounded-[14px] border border-[var(--apple-separator-subtle)] bg-[var(--apple-bg-secondary)]/55 p-4"
            >
              <div
                className="h-12 w-16 border-2 border-[var(--apple-label-primary)]/40 bg-[var(--apple-surface-elevated)]"
                style={{ borderRadius: item.value }}
                aria-hidden="true"
              />
              <p className="mt-3 text-[13.5px] font-semibold text-[var(--apple-label-primary)]">
                {item.role}
              </p>
              <p className="font-mono text-[11.5px] tabular-nums text-[var(--apple-label-tertiary)]">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Elevation & Shadows (Light vs Dark) */}
      <section
        aria-labelledby="surfaces-elevation-heading"
        className="space-y-5 border-t border-[var(--apple-separator-subtle)] pt-12"
      >
        <div>
          <h2
            id="surfaces-elevation-heading"
            className="font-display text-[20px] font-semibold tracking-[-0.022em] text-[var(--apple-label-primary)]"
          >
            Elevation &amp; Shadows
          </h2>
          <p className="mt-1 text-[14px] text-[var(--apple-label-secondary)]">
            Select any elevation level to compare Light ambient diffusion against Dark specular depth.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Elevation levels">
          {ELEVATION_LEVELS.map((level) => {
            const active = level.id === activeShadowId;
            return (
              <button
                key={level.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  playTick();
                  setActiveShadowId(level.id);
                }}
                className={`min-h-[34px] whitespace-nowrap rounded-[9px] px-3 text-[13px] transition-colors ${
                  active
                    ? 'bg-[var(--apple-control-tonal)] font-semibold text-[var(--apple-label-primary)]'
                    : 'text-[var(--apple-label-secondary)] hover:bg-[var(--apple-bg-secondary)] hover:text-[var(--apple-label-primary)]'
                }`}
              >
                {level.name}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {(['light', 'dark'] as const).map((mode) => (
            <div
              key={mode}
              data-ds-sandbox="true"
              data-ds-palette={sandboxPalette}
              data-ds-theme={mode}
              className="rounded-[18px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-6"
            >
              <div className="flex items-center justify-between text-[12px] text-[var(--apple-label-tertiary)]">
                <span>{mode === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
                <CopyTokenButton value={`var(${activeShadow.token})`} label={activeShadow.token} compact />
              </div>
              <div
                className="mt-6 rounded-[16px] bg-[var(--apple-surface-elevated)] p-6"
                style={{ boxShadow: `var(${activeShadow.token})` }}
              >
                <p className="text-[14.5px] font-semibold text-[var(--apple-label-primary)]">
                  {activeShadow.name}
                </p>
                <p className="mt-1 text-[13px] text-[var(--apple-label-secondary)]">
                  {activeShadow.usage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
